export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type Category = "MEDICAL" | "POLICE" | "FIRE" | "TRAFFIC";
export type Status = "PENDING" | "RESPONDING" | "RESOLVED";

export interface Incident {
    id: number;
    lat: number;
    lng: number;
    location: string;
    severity: Severity;
    category: Category;
    status: Status;
    description?: string;
    isHealthAlert?: boolean;
}

export interface Cluster {
    id: number;
    lat: number;
    lng: number;
    incidents: Incident[];
    handled: boolean;
}

export interface Unit {
    id: string;
    type: "POLICE" | "FIRE" | "AMBULANCE";
    lat: number;
    lng: number;
    status: "IDLE" | "BUSY" | "MOVING" | "RESPONDING";
    destination?: { lat: number; lng: number };
    heading?: number;
    route?: [number, number][];
    startTime?: number;
}

export interface HeatmapZone {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    intensity: number; // 0-1
}

export type OutbreakType = "DENGUE" | "MALARIA" | "CHOLERA" | "CHIKUNGUNYA" | "AQI" | "FLOOD";

export interface OutbreakZone {
    id: string;
    type: OutbreakType;
    lat: number;
    lng: number;
    radius: number;
    neighborhood: string;
    severity: "WATCH" | "WARNING" | "OUTBREAK";
    detail: string;
}

export interface HealthAlert {
    id: string;
    outbreakType: OutbreakType;
    neighborhood: string;
    detail: string;
    severity: "WATCH" | "WARNING" | "OUTBREAK";
    lat: number;
    lng: number;
    timestamp: number;
}

export interface DengueZone {
    id: string;
    lat: number;
    lng: number;
    radius: number;
    casesThisWeek: number;
    neighborhood: string;
    severity: "WATCH" | "WARNING" | "OUTBREAK";
}

export interface EmergencyContact {
    name: string;
    phone: string;
    relation: string;
}

export interface CitizenProfile {
    id: string;
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    bloodGroup: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
    medicalHistory: string;
    allergies: string;
    currentMedications: string;
    disabilities: string;
    preferredLanguage: string;
    emergencyContacts: EmergencyContact[];
    photoUrl?: string;
}
