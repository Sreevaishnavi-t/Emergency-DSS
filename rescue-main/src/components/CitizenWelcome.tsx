import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Trash2, Siren } from "lucide-react";
import type { CitizenProfile } from "../types";

export default function CitizenWelcome() {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<CitizenProfile[]>([]);
    
    // Auto-open creation form if no profiles exist
    const [isCreating, setIsCreating] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<CitizenProfile>>({
        gender: "Other",
        bloodGroup: "Unknown",
        emergencyContacts: []
    });

    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [newContactRelation, setNewContactRelation] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("dss_citizen_profiles");
        if (saved) {
            const parsed = JSON.parse(saved);
            setProfiles(parsed);
            if (parsed.length === 0) setIsCreating(true);
        } else {
            setIsCreating(true);
        }
        setIsLoaded(true);
    }, []);

    const addEmergencyContact = () => {
        if (!newContactName || !newContactPhone) return;
        setFormData({
            ...formData,
            emergencyContacts: [
                ...(formData.emergencyContacts || []),
                { name: newContactName, phone: newContactPhone, relation: newContactRelation }
            ]
        });
        setNewContactName("");
        setNewContactPhone("");
        setNewContactRelation("");
    };

    const removeContact = (index: number) => {
        const updated = [...(formData.emergencyContacts || [])];
        updated.splice(index, 1);
        setFormData({ ...formData, emergencyContacts: updated });
    };

    const saveProfile = () => {
        if (!formData.name) return alert("Name is required");
        
        const newProfile: CitizenProfile = {
            id: 'prof_' + Date.now(),
            name: formData.name || "",
            age: Number(formData.age) || 0,
            gender: formData.gender as "Male" | "Female" | "Other" || "Other",
            bloodGroup: formData.bloodGroup || "Unknown",
            insuranceProvider: formData.insuranceProvider || "None",
            insurancePolicyNumber: formData.insurancePolicyNumber || "",
            medicalHistory: formData.medicalHistory || "None",
            allergies: formData.allergies || "None",
            currentMedications: formData.currentMedications || "None",
            disabilities: formData.disabilities || "None",
            preferredLanguage: formData.preferredLanguage || "English",
            emergencyContacts: formData.emergencyContacts || [],
            photoUrl: formData.photoUrl || ""
        };

        const updated = [...profiles, newProfile];
        setProfiles(updated);
        localStorage.setItem("dss_citizen_profiles", JSON.stringify(updated));
        setIsCreating(false);
        setFormData({ gender: "Other", bloodGroup: "Unknown", emergencyContacts: [] });
    };

    const deleteProfile = (id: string) => {
        const updated = profiles.filter(p => p.id !== id);
        setProfiles(updated);
        localStorage.setItem("dss_citizen_profiles", JSON.stringify(updated));
        if (updated.length === 0) setIsCreating(true);
    };

    const selectProfile = (id: string) => {
        localStorage.setItem("active_citizen_profile_id", id);
        navigate("/citizen");
    };

    const handleSkipEmergency = () => {
        localStorage.removeItem("active_citizen_profile_id");
        navigate("/citizen");
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 relative">
            
            {/* ULTRA EMERGENCY SKIP BUTTON */}
            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={handleSkipEmergency}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 border border-red-500 rounded-full transition-all text-red-500 hover:text-white font-bold text-sm shadow-lg shadow-red-900/20"
                >
                    <Siren size={16} /> I NEED HELP NOW
                </button>
            </div>

            <div className="max-w-4xl mx-auto pt-12">
                
                {profiles.length > 0 && isCreating && (
                    <button 
                        onClick={() => setIsCreating(false)}
                        className="text-slate-400 hover:text-white flex items-center gap-2 transition mb-8"
                    >
                        <ArrowLeft size={20} /> Back to Profiles
                    </button>
                )}
                
                {!isCreating && profiles.length > 0 && (
                    <button 
                        onClick={() => navigate("/")}
                        className="text-slate-400 hover:text-white flex items-center gap-2 transition mb-8"
                    >
                        <ArrowLeft size={20} /> Back to Home
                    </button>
                )}

                {!isCreating ? (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-1">Select Profile</h1>
                                <p className="text-slate-400">Who is experiencing the emergency?</p>
                            </div>
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl flex items-center gap-2 transition font-medium"
                            >
                                <Plus size={18} /> New Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profiles.map(p => (
                                <div key={p.id} className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-500 transition-colors">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-blue-400">{p.name}</h3>
                                            <button onClick={() => deleteProfile(p.id)} className="text-slate-500 hover:text-red-500 transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-6">
                                            <p><span className="text-slate-500">Age:</span> {p.age}</p>
                                            <p><span className="text-slate-500">Blood:</span> <span className="text-red-400 font-bold">{p.bloodGroup}</span></p>
                                            <p className="col-span-2"><span className="text-slate-500">Allergies:</span> {p.allergies}</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => selectProfile(p.id)}
                                        className="w-full bg-slate-700 hover:bg-green-600 py-3 rounded-xl flex justify-center items-center gap-2 transition font-bold"
                                    >
                                        Enter Emergency Hub <Check size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl">
                        {profiles.length === 0 && (
                            <div className="mb-6 pb-6 border-b border-slate-700 text-center">
                                <h1 className="text-3xl font-bold mb-2">Welcome to Citizen DSS</h1>
                                <p className="text-slate-400">Create your emergency medical profile so responders can assist you better.</p>
                            </div>
                        )}
                        
                        <h2 className="text-2xl font-bold mb-6 text-blue-400">
                            {profiles.length === 0 ? "Create Your First Profile" : "Create New Profile"}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                                <input 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                    value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-1">Age</label>
                                    <input 
                                        type="number" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                        value={formData.age || ""} onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-slate-400 mb-1">Blood Group</label>
                                    <select 
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500"
                                        value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                                    >
                                        <option>Unknown</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Severe Allergies (Critical)</label>
                                <input 
                                    placeholder="e.g., Penicillin, Latex, Peanuts (or 'None')"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-red-500" 
                                    value={formData.allergies || ""} onChange={e => setFormData({...formData, allergies: e.target.value})} 
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Current Medications</label>
                                <input 
                                    placeholder="e.g., Blood thinners, Insulin"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                    value={formData.currentMedications || ""} onChange={e => setFormData({...formData, currentMedications: e.target.value})} 
                                />
                            </div>
                            
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Disabilities / Special Needs</label>
                                <input 
                                    placeholder="e.g., Uses wheelchair, Deaf, Pacemaker"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                    value={formData.disabilities || ""} onChange={e => setFormData({...formData, disabilities: e.target.value})} 
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Insurance Provider</label>
                                <input 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                    value={formData.insuranceProvider || ""} onChange={e => setFormData({...formData, insuranceProvider: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Preferred Language</label>
                                <input 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 outline-none focus:border-blue-500" 
                                    value={formData.preferredLanguage || ""} onChange={e => setFormData({...formData, preferredLanguage: e.target.value})} 
                                />
                            </div>

                            {/* EMERGENCY CONTACTS */}
                            <div className="col-span-1 md:col-span-2 border-t border-slate-700 pt-6 mt-2">
                                <h3 className="text-lg font-bold text-blue-400 mb-4">Emergency Contacts (SOS)</h3>
                                
                                {formData.emergencyContacts && formData.emergencyContacts.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {formData.emergencyContacts.map((c, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-700 p-3 rounded-lg">
                                                <div>
                                                    <p className="font-bold">{c.name} <span className="text-slate-400 text-sm">({c.relation})</span></p>
                                                    <p className="text-sm text-slate-400">{c.phone}</p>
                                                </div>
                                                <button onClick={() => removeContact(i)} className="text-red-500 hover:text-red-400">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input 
                                        placeholder="Name"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 outline-none focus:border-blue-500 text-sm" 
                                        value={newContactName} onChange={e => setNewContactName(e.target.value)} 
                                    />
                                    <input 
                                        placeholder="Phone"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 outline-none focus:border-blue-500 text-sm" 
                                        value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} 
                                    />
                                    <div className="flex gap-2">
                                        <input 
                                            placeholder="Relation (e.g., Wife)"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 outline-none focus:border-blue-500 text-sm" 
                                            value={newContactRelation} onChange={e => setNewContactRelation(e.target.value)} 
                                        />
                                        <button 
                                            onClick={addEmergencyContact}
                                            className="bg-slate-700 hover:bg-blue-600 p-2 rounded-lg transition"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <button 
                            onClick={saveProfile}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg transition"
                        >
                            Save Profile
                        </button>
                        
                        {profiles.length === 0 && (
                            <button 
                                onClick={handleSkipEmergency}
                                className="w-full text-slate-400 hover:text-white mt-6 underline transition"
                            >
                                Skip & Request Help Immediately
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
