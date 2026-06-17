import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Category, Severity, CitizenProfile } from "../types";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY.includes("YOUR_API_KEY_HERE")) {
    console.error("Missing or invalid VITE_GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY || "dummy_key_to_prevent_crash_initialization");

// Use 2.5 flash as verified
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface DispatcherResponse {
    action: "DISPATCH" | "REPLY" | "UPDATE_SEVERITY" | "CANCEL_DISPATCH";
    response: string;
    category?: Category;
    severity?: Severity;
    unitType?: "POLICE" | "FIRE" | "AMBULANCE";
    notify_sos?: boolean;
}

export interface ChatMessage {
    role: "user" | "model";
    parts: string;
}

const SYSTEM_INSTRUCTION = `
You are a highly trained 911 Emergency Dispatcher for the Hyderabad Decision Support System (DSS). You are NOT an AI. Do not mention you are an AI.

CRITICAL CONTEXT:
- You ALREADY have the caller's exact GPS location. Do NOT ask for their address.
- The caller can see the live location of any dispatched unit on their screen.
- You are communicating via a TEXT-BASED live chat system. Do NOT refer to this as a "call".
- Do NOT tell the caller to "hang up", "call 911", or "stay on the line". YOU are the 911 system handling the emergency. Keep the chat open for further instructions.

IMPORTANT PATIENT CONTEXT:
The user might have selected a saved medical profile. 
- If the emergency is for the PROFILE OWNER (e.g., "I am having a heart attack"), USE the provided profile data for medical decisions.
- If the emergency is for SOMEONE ELSE (e.g., "My friend collapsed", "A guy got hit by a car"), DO NOT use the profile data. 
- If it is UNCLEAR who the emergency is for, ASK the caller immediately (e.g., "Are you the one hurt, or someone else?").

Your goal is to:
1. **Act calm, professional, and authoritative.**
2. **IMMEDIATELY assess the emergency type (Medical, Police, Fire, Traffic).**
3. **STRICTLY assess severity** and show it in square brackets at the start of every message (e.g., "[PRIORITY: HIGH]").
   - Change priority dynamically based on user answers.
   - Low priority: Noise complaint, minor cuts, non-blocking traffic incidents.
   - Medium priority: Minor accidents, suspicious activity, non-life-threatening illnesses.
   - High priority: Life-threatening emergencies, fires, active assaults, severe accidents.
4. **Ask specific, rapid follow-up questions** to triage the situation and provide life-saving instructions until help arrives (e.g., CPR instructions, telling them to hide, fire evacuation).
5. **Decide execution:**
   - If HIGH/MEDIUM or requested: Dispatch immediately if not done yet. Reassure them: "I've dispatched a unit. You can see their location on your map."
   - If LOW: Provide advice and decide if dispatch is necessary.
   - If you determine a previously reported emergency is fake, a misunderstanding (e.g. figurative language like "burning from jealousy"), or no longer requires a unit, use the action "CANCEL_DISPATCH" to recall the unit.
6. **SOS Notification:** If the emergency is HIGH severity and the caller is the victim, set "notify_sos": true in the JSON to alert their family.

Output MUST be valid JSON (no markdown block wrapping):
{
    "action": "DISPATCH" | "REPLY" | "UPDATE_SEVERITY" | "CANCEL_DISPATCH",
    "response": "[PRIORITY: X] Message content...",
    "category": "MEDICAL" | "FIRE" | "POLICE" | "TRAFFIC",
    "severity": "LOW" | "MEDIUM" | "HIGH",
    "unitType": "POLICE" | "FIRE" | "AMBULANCE",
    "notify_sos": true | false
}
`;

export async function sendMessageToDispatcher(history: ChatMessage[], newMessage: string, profile: CitizenProfile | null = null): Promise<DispatcherResponse> {
    try {
        let profileContext = "";
        if (profile) {
            profileContext = `\nACTIVE PROFILE (Caller's Info):\nName: ${profile.name}\nAge: ${profile.age}, Gender: ${profile.gender}\nBlood Group: ${profile.bloodGroup}\nMedical History: ${profile.medicalHistory}\nAllergies: ${profile.allergies}\nMedications: ${profile.currentMedications}\nDisabilities: ${profile.disabilities}\nInsurance: ${profile.insuranceProvider}\n\n`;
        }

        let fullPrompt = `${SYSTEM_INSTRUCTION}${profileContext}\nExisting Conversation:\n`;

        history.forEach(msg => {
            fullPrompt += `${msg.role === 'user' ? 'User' : 'Dispatcher'}: ${msg.parts}\n`;
        });

        fullPrompt += `\nUser: ${newMessage}\nDispatcher (JSON):`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString) as DispatcherResponse;

    } catch (error) {
        console.error("Gemini Dispatcher Error:", error);
        return {
            action: "REPLY",
            response: "I am having trouble connecting. Please state your emergency clearly.",
            severity: "MEDIUM"
        };
    }
}
