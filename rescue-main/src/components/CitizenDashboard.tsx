import { useState, useEffect, useRef } from "react";
import { Send, Shield, Flame, HeartPulse, CheckCircle2 } from "lucide-react";
import MapField from "./MapField";
import type { Incident, Category, Unit, CitizenProfile } from "../types";
import { sendMessageToDispatcher } from "../utils/gemini";
import type { ChatMessage } from "../utils/gemini";

import { getRealRoute, getPointAtPercentage } from "../utils/routing";

export default function CitizenDashboard() {
    // Chat State
    const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([
        { text: "911 AI Emergency Dispatcher here. What is your emergency?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const chatHistory = useRef<ChatMessage[]>([
        { role: "model", parts: "911 AI Emergency Dispatcher here. What is your emergency?" }
    ]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Incident State
    const [activeRequest, setActiveRequest] = useState<Partial<Incident> | null>(null);
    const [assignedUnit, setAssignedUnit] = useState<Unit | null>(null);
    const [eta, setEta] = useState<number | null>(null);

    // Citizen Location State (Defaults to center, but user can change)
    const [citizenLoc, setCitizenLoc] = useState({ lat: 17.45, lng: 78.42 });

    // Profile State
    const [activeProfile, setActiveProfile] = useState<CitizenProfile | null>(null);

    useEffect(() => {
        const activeId = localStorage.getItem("active_citizen_profile_id");
        if (activeId) {
            const saved = localStorage.getItem("dss_citizen_profiles");
            if (saved) {
                const profiles: CitizenProfile[] = JSON.parse(saved);
                const found = profiles.find(p => p.id === activeId);
                if (found) setActiveProfile(found);
            }
        }
    }, []);

    /* ===================== SIMULATION LOOP ===================== */
    useEffect(() => {
        if (!assignedUnit || !assignedUnit.startTime || !assignedUnit.route) return;

        const duration = 60000; // 60 seconds to simulate slow response/traffic

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - (assignedUnit.startTime || now);
            const progress = Math.min(elapsed / duration, 1);

            if (progress >= 1) {
                // Arrived
                setAssignedUnit(u => u ? {
                    ...u,
                    lat: u.destination!.lat,
                    lng: u.destination!.lng,
                    status: 'IDLE' 
                } : null);
                setEta(0);
                clearInterval(interval);
                return;
            }
            
            // Traffic / High Priority Reroute Simulation
            if (activeRequest?.severity === 'HIGH' && progress > 0.3 && !assignedUnit.id.includes('SWAPPED')) {
                // Clear this interval's current action immediately to prevent state clash
                clearInterval(interval);
                
                const startLat = citizenLoc.lat + (Math.random() * 0.015 - 0.0075); // Spawn closer
                const startLng = citizenLoc.lng + (Math.random() * 0.015 - 0.0075);
                
                getRealRoute({ lat: startLat, lng: startLng }, citizenLoc).then(route => {
                    setAssignedUnit({
                        id: assignedUnit.id + '-SWAPPED',
                        type: assignedUnit.type,
                        lat: startLat,
                        lng: startLng,
                        status: 'RESPONDING',
                        destination: citizenLoc,
                        route: route,
                        startTime: Date.now()
                    });
                    setMessages(prev => [...prev, {
                        text: `[SYSTEM ALERT]: Primary unit stuck in traffic. Because this is a HIGH PRIORITY emergency, a closer ${assignedUnit.type} unit has been automatically reassigned to you.`,
                        sender: "bot"
                    }]);
                });
                return;
            }

            // Interpolate Position
            const newPos = getPointAtPercentage(assignedUnit.route!, progress);

            if (newPos) {
                setAssignedUnit(u => u ? { ...u, lat: newPos.lat, lng: newPos.lng } : null);
                // ETA in seconds remaining
                setEta(Math.ceil((1 - progress) * 25)); // Display seconds, or convert to mins? user said "make it look like uber", usually mins but for 25s sim seconds is better.
            }

        }, 50); // High refresh rate for smooth animation

        return () => clearInterval(interval);
    }, [assignedUnit?.id, assignedUnit?.startTime]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        // User Message
        const userMsg = input;
        setMessages((prev) => [...prev, { text: userMsg, sender: "user" }]);
        setInput("");
        setIsProcessing(true);

        try {
            // Call Gemini Dispatcher
            const response = await sendMessageToDispatcher(chatHistory.current, userMsg, activeProfile);

            // Update History
            chatHistory.current.push({ role: "user", parts: userMsg });
            chatHistory.current.push({ role: "model", parts: response.response });

            // Display AI Response
            setMessages((prev) => [...prev, {
                text: response.response,
                sender: "bot"
            }]);

            // Handle Actions
            if (response.action === "DISPATCH" || response.action === "UPDATE_SEVERITY") {
                if (response.category && response.severity) {
                    setActiveRequest(prev => ({
                        ...prev,
                        category: response.category,
                        severity: response.severity,
                        status: 'RESPONDING'
                    }));
                }

                if (response.action === "DISPATCH" && response.unitType && !assignedUnit) {
                    // Spawn Unit
                    const startLat = citizenLoc.lat + (Math.random() * 0.04 - 0.02); // Further away to show route
                    const startLng = citizenLoc.lng + (Math.random() * 0.04 - 0.02);

                    const route = await getRealRoute({ lat: startLat, lng: startLng }, citizenLoc);

                    const newUnit: Unit = {
                        id: 'RES-' + Date.now(),
                        type: response.unitType,
                        lat: startLat,
                        lng: startLng,
                        status: 'RESPONDING',
                        destination: citizenLoc,
                        route: route,
                        startTime: Date.now()
                    };
                    setAssignedUnit(newUnit);

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            text: `[SYSTEM]: ${response.unitType} Unit ${newUnit.id} has been dispatched. Track their route on the map.`,
                            sender: "bot"
                        }]);
                        
                        if (response.notify_sos && activeProfile?.emergencyContacts?.length) {
                            setTimeout(() => {
                                setMessages(prev => [...prev, {
                                    text: `[SYSTEM NOTIFICATION]: Alerted ${activeProfile.emergencyContacts.length} emergency contact(s) via SMS. They can now live-track this dispatch unit.`,
                                    sender: "bot"
                                }]);
                            }, 1500);
                        }
                    }, 1000);
                }
            } else if (response.action === "CANCEL_DISPATCH") {
                if (assignedUnit) {
                    setAssignedUnit(null);
                    setActiveRequest(null);
                    setEta(null);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            text: `[SYSTEM]: The dispatched unit has been recalled and the emergency request is cancelled.`,
                            sender: "bot"
                        }]);
                    }, 1000);
                }
            }

        } catch (error) {
            console.error("Dispatcher Error", error);
            setMessages((prev) => [...prev, {
                text: "Connection error. Dispatching Police automatically.",
                sender: "bot"
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSOS = (cat: Category) => {
        setMessages((prev) => [...prev, { text: `SOS: Requesting ${cat} immediately!`, sender: "user" }]);
        chatHistory.current.push({ role: "user", parts: `SOS BUTTON PRESSED: I need ${cat} immediately!` });

        // Immediate artificial response for SOS
        setTimeout(() => {
            const responseText = `SOS Received. Dispatching ${cat} unit immediately. Stay safe.`;
            setMessages((prev) => [...prev, { text: responseText, sender: "bot" }]);
            chatHistory.current.push({ role: "model", parts: responseText });

            setActiveRequest({ category: cat, severity: 'HIGH', status: 'RESPONDING' });

            // Spawn Unit
            const startLat = citizenLoc.lat + (Math.random() * 0.04 - 0.02);
            const startLng = citizenLoc.lng + (Math.random() * 0.04 - 0.02);
            // Spawn Unit with real route
            // For SOS we can't await easily in this sync handler so we use IIFE or just trigger it
            // Better to make handleSOS async or use .then
            getRealRoute({ lat: startLat, lng: startLng }, citizenLoc).then(route => {
                const newUnit: Unit = {
                    id: 'SOS-99',
                    type: cat === 'MEDICAL' ? 'AMBULANCE' : cat === 'FIRE' ? 'FIRE' : 'POLICE',
                    lat: startLat,
                    lng: startLng,
                    status: 'RESPONDING',
                    destination: citizenLoc,
                    route: route,
                    startTime: Date.now()
                };
                setAssignedUnit(newUnit);
            });

        }, 1000);
    };

    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages, isExpanded]);

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#020617] text-white overflow-hidden relative">

            {/* MAP BACKGROUND (Read Only) */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${isExpanded ? 'opacity-30' : 'opacity-100'} md:opacity-100`}>
                <MapField
                    incidents={activeRequest ? [{ ...activeRequest, id: 1, lat: citizenLoc.lat, lng: citizenLoc.lng, location: "My Location" } as Incident] : []}
                    clusters={[]}
                    units={assignedUnit ? [assignedUnit] : []}
                    activeRoute={assignedUnit?.route} // Use the generated route for visualization
                    interactive={true}
                    userLocation={citizenLoc}
                    onPick={(lat, lng) => setCitizenLoc({ lat, lng })}
                />
            </div>

            {/* CHAT INTERFACE - Bottom Sheet on Mobile, Side Panel on Desktop */}
            <div
                className={`
                    z-20 flex flex-col 
                    fixed bottom-0 left-0 right-0 
                    md:relative md:w-[400px] md:h-full 
                    bg-slate-900/95 backdrop-blur-md md:bg-slate-900/80
                    border-t md:border-t-0 md:border-r border-slate-700/50 
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'h-[85vh]' : 'h-auto'} md:h-full
                    rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none
                `}
            >
                {/* Mobile Drag Handle & Header */}
                <div
                    className="p-4 border-b border-slate-700/50 flex flex-col items-center cursor-pointer md:cursor-auto"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Handle for Mobile */}
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full mb-3 md:hidden" />

                    <h2 className="font-bold text-lg flex items-center gap-2 w-full">
                        <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                        AI Emergency Dispatcher
                        <span className="ml-auto text-xs text-slate-400 md:hidden">
                            {isExpanded ? 'Tap to collapse' : 'Tap to expand'}
                        </span>
                    </h2>
                </div>

                {/* Messages Area - Scrollable */}
                <div
                    id="chat-container"
                    className={`
                        flex-1 overflow-y-auto p-4 space-y-4 
                        ${isExpanded ? 'block' : 'hidden'} md:block
                    `}
                >
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}

                    {isProcessing && (
                        <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none flex items-center gap-1.5 w-[60px]">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}

                    {activeRequest && assignedUnit && (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="text-green-500 h-8 w-8" />
                                <div>
                                    <h3 className="font-bold text-green-400">Help is on the way</h3>
                                    <p className="text-xs text-green-300">
                                        Estimated Arrival: <span className="text-white font-mono font-bold text-lg">{eta}s</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: SOS & Input (Always Visible) */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-700/50 pb-8 md:pb-4">

                    {/* SOS BUTTONS */}
                    {!activeRequest && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('MEDICAL'); }} className="flex flex-col items-center justify-center p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl transition text-red-500">
                                <HeartPulse size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">MEDICAL</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('POLICE'); }} className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/50 rounded-xl transition text-blue-500">
                                <Shield size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">POLICE</span>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleSOS('FIRE'); }} className="flex flex-col items-center justify-center p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/50 rounded-xl transition text-orange-500">
                                <Flame size={24} className="mb-1" />
                                <span className="text-[10px] font-bold">FIRE</span>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 transition"
                            placeholder="Type your emergency..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            onClick={(e) => e.stopPropagation()} // Prevent toggling when clicking input
                            disabled={isProcessing}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSend(); }}
                            className="bg-blue-600 hover:bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50"
                            disabled={isProcessing}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
