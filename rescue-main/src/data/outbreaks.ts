import type { OutbreakZone, OutbreakType } from "../types";

/* ──────────────────────────────────────────────
   META: labels, emojis, descriptions, severity labels
   Used by DispatcherDashboard for the combobox + legend
─────────────────────────────────────────────── */
export const OUTBREAK_META: Record<
    OutbreakType,
    { label: string; emoji: string; description: string; severityLabels: Record<"WATCH" | "WARNING" | "OUTBREAK", string> }
> = {
    DENGUE:      { label: "Dengue Fever",        emoji: "🦟", description: "Mosquito-borne viral infection",         severityLabels: { WATCH: "Watch", WARNING: "Active Spread", OUTBREAK: "Outbreak"       } },
    MALARIA:     { label: "Malaria",              emoji: "🦟", description: "Plasmodium via Anopheles mosquito",      severityLabels: { WATCH: "Watch", WARNING: "Active Spread", OUTBREAK: "Outbreak"       } },
    CHOLERA:     { label: "Cholera",              emoji: "💧", description: "Waterborne bacterial infection",         severityLabels: { WATCH: "Watch", WARNING: "Spreading",     OUTBREAK: "Outbreak"       } },
    CHIKUNGUNYA: { label: "Chikungunya",          emoji: "🦟", description: "Mosquito-borne alphavirus",             severityLabels: { WATCH: "Watch", WARNING: "Active Spread", OUTBREAK: "Outbreak"       } },
    AQI:         { label: "Air Quality (AQI)",    emoji: "🌫️", description: "Particulate matter & pollutant levels", severityLabels: { WATCH: "Moderate", WARNING: "Unhealthy",  OUTBREAK: "Hazardous"      } },
    FLOOD:       { label: "Flood Risk",           emoji: "🌊", description: "Risk of flooding & waterlogging",        severityLabels: { WATCH: "Low Risk", WARNING: "Moderate Risk", OUTBREAK: "Active Flooding" } },
};

/* ──────────────────────────────────────────────
   FILL COLOURS per type + severity
   Shared between MapField (circles) and DispatcherDashboard (legend dots)
─────────────────────────────────────────────── */
export const OUTBREAK_FILL: Record<OutbreakType, Record<"WATCH" | "WARNING" | "OUTBREAK", string>> = {
    DENGUE:      { WATCH: "#f59e0b", WARNING: "#f97316", OUTBREAK: "#a855f7" },
    MALARIA:     { WATCH: "#6ee7b7", WARNING: "#10b981", OUTBREAK: "#047857" },
    CHOLERA:     { WATCH: "#67e8f9", WARNING: "#06b6d4", OUTBREAK: "#0369a1" },
    CHIKUNGUNYA: { WATCH: "#f9a8d4", WARNING: "#ec4899", OUTBREAK: "#9d174d" },
    AQI:         { WATCH: "#fde047", WARNING: "#fb923c", OUTBREAK: "#dc2626" },
    FLOOD:       { WATCH: "#93c5fd", WARNING: "#3b82f6", OUTBREAK: "#1e40af" },
};

/* ──────────────────────────────────────────────
   ALL OUTBREAK ZONE DATA  (Hyderabad – simulated)
─────────────────────────────────────────────── */
const ALL_ZONES: OutbreakZone[] = [

    // ── DENGUE ──────────────────────────────────
    { id: "d1", type: "DENGUE", lat: 17.3850, lng: 78.4867, radius: 900,  neighborhood: "Old City / Charminar",   severity: "OUTBREAK", detail: "47 cases this week" },
    { id: "d2", type: "DENGUE", lat: 17.4400, lng: 78.3489, radius: 700,  neighborhood: "Miyapur",                severity: "WARNING",  detail: "29 cases this week" },
    { id: "d3", type: "DENGUE", lat: 17.4947, lng: 78.3996, radius: 600,  neighborhood: "Kukatpally",             severity: "WARNING",  detail: "18 cases this week" },
    { id: "d4", type: "DENGUE", lat: 17.4126, lng: 78.4772, radius: 500,  neighborhood: "Malakpet",               severity: "WATCH",    detail: "11 cases this week" },
    { id: "d5", type: "DENGUE", lat: 17.4563, lng: 78.3718, radius: 650,  neighborhood: "Madhapur / HITEC City",  severity: "WARNING",  detail: "22 cases this week" },
    { id: "d6", type: "DENGUE", lat: 17.3368, lng: 78.5524, radius: 400,  neighborhood: "LB Nagar",               severity: "WATCH",    detail: "8 cases this week"  },
    { id: "d7", type: "DENGUE", lat: 17.4760, lng: 78.5718, radius: 550,  neighborhood: "Uppal",                  severity: "OUTBREAK", detail: "33 cases this week" },

    // ── MALARIA ─────────────────────────────────
    { id: "m1", type: "MALARIA", lat: 17.4399, lng: 78.4983, radius: 700, neighborhood: "Secunderabad",           severity: "WARNING",  detail: "15 cases this week" },
    { id: "m2", type: "MALARIA", lat: 17.4615, lng: 78.5207, radius: 500, neighborhood: "Malkajgiri",             severity: "WATCH",    detail: "7 cases this week"  },
    { id: "m3", type: "MALARIA", lat: 17.4425, lng: 78.5950, radius: 800, neighborhood: "Ghatkesar",              severity: "OUTBREAK", detail: "28 cases this week" },
    { id: "m4", type: "MALARIA", lat: 17.3649, lng: 78.5721, radius: 600, neighborhood: "Hayathnagar",            severity: "WARNING",  detail: "19 cases this week" },
    { id: "m5", type: "MALARIA", lat: 17.3450, lng: 78.4750, radius: 450, neighborhood: "Bandlaguda",             severity: "WATCH",    detail: "5 cases this week"  },
    { id: "m6", type: "MALARIA", lat: 17.5010, lng: 78.5480, radius: 750, neighborhood: "Kapra",                  severity: "OUTBREAK", detail: "34 cases this week" },

    // ── CHOLERA ─────────────────────────────────
    { id: "c1", type: "CHOLERA", lat: 17.4200, lng: 78.5100, radius: 650, neighborhood: "Musharabad",             severity: "OUTBREAK", detail: "23 cases · Water source contamination" },
    { id: "c2", type: "CHOLERA", lat: 17.4450, lng: 78.5350, radius: 500, neighborhood: "Moula Ali",              severity: "WARNING",  detail: "12 cases · Pipe leakage reported"     },
    { id: "c3", type: "CHOLERA", lat: 17.3820, lng: 78.4720, radius: 400, neighborhood: "Nampally",               severity: "WATCH",    detail: "6 cases · Supply area flagged"        },
    { id: "c4", type: "CHOLERA", lat: 17.3500, lng: 78.5200, radius: 700, neighborhood: "Saroornagar",            severity: "WARNING",  detail: "17 cases · Tank overflow risk"        },
    { id: "c5", type: "CHOLERA", lat: 17.3250, lng: 78.4550, radius: 600, neighborhood: "Falaknuma",              severity: "OUTBREAK", detail: "31 cases · Old pipeline failure"      },

    // ── CHIKUNGUNYA ─────────────────────────────
    { id: "ch1", type: "CHIKUNGUNYA", lat: 17.3690, lng: 78.5270, radius: 600, neighborhood: "Dilsukhnagar",     severity: "WARNING",  detail: "14 cases this week" },
    { id: "ch2", type: "CHIKUNGUNYA", lat: 17.4050, lng: 78.5200, radius: 450, neighborhood: "Amberpet",         severity: "WATCH",    detail: "9 cases this week"  },
    { id: "ch3", type: "CHIKUNGUNYA", lat: 17.4350, lng: 78.5350, radius: 700, neighborhood: "Tarnaka",          severity: "WARNING",  detail: "21 cases this week" },
    { id: "ch4", type: "CHIKUNGUNYA", lat: 17.4270, lng: 78.5620, radius: 800, neighborhood: "Nacharam",         severity: "OUTBREAK", detail: "38 cases this week" },
    { id: "ch5", type: "CHIKUNGUNYA", lat: 17.3750, lng: 78.5400, radius: 380, neighborhood: "Kothapet",         severity: "WATCH",    detail: "6 cases this week"  },

    // ── AQI ─────────────────────────────────────
    { id: "a1", type: "AQI", lat: 17.5290, lng: 78.3020, radius: 1200, neighborhood: "Patancheru Industrial",    severity: "OUTBREAK", detail: "AQI: 267 · Very Unhealthy"           },
    { id: "a2", type: "AQI", lat: 17.4490, lng: 78.4190, radius: 800,  neighborhood: "Sanathnagar",              severity: "WARNING",  detail: "AQI: 178 · Unhealthy"                },
    { id: "a3", type: "AQI", lat: 17.5100, lng: 78.4300, radius: 1100, neighborhood: "IDA Jeedimetla",           severity: "OUTBREAK", detail: "AQI: 243 · Very Unhealthy"           },
    { id: "a4", type: "AQI", lat: 17.4850, lng: 78.4100, radius: 900,  neighborhood: "Balanagar Industrial",     severity: "WARNING",  detail: "AQI: 192 · Unhealthy"                },
    { id: "a5", type: "AQI", lat: 17.4200, lng: 78.5700, radius: 700,  neighborhood: "Cherlapally",              severity: "WARNING",  detail: "AQI: 156 · Sensitive Groups"         },
    { id: "a6", type: "AQI", lat: 17.5400, lng: 78.3900, radius: 600,  neighborhood: "Bollaram",                 severity: "WATCH",    detail: "AQI: 118 · Moderate"                 },

    // ── FLOOD ────────────────────────────────────
    { id: "f1", type: "FLOOD", lat: 17.3680, lng: 78.4780, radius: 1100, neighborhood: "Musi Riverbank",         severity: "OUTBREAK", detail: "Active flooding · 2.4m above normal" },
    { id: "f2", type: "FLOOD", lat: 17.3480, lng: 78.5220, radius: 850,  neighborhood: "Saroornagar Tank Area",  severity: "WARNING",  detail: "Tank at 94% capacity"                },
    { id: "f3", type: "FLOOD", lat: 17.4380, lng: 78.4730, radius: 600,  neighborhood: "Hussain Sagar",          severity: "WATCH",    detail: "Lake level rising · Monitoring active"},
    { id: "f4", type: "FLOOD", lat: 17.3380, lng: 78.4430, radius: 700,  neighborhood: "Katedan",                severity: "WARNING",  detail: "Low-lying area · Drain blocked"      },
    { id: "f5", type: "FLOOD", lat: 17.4200, lng: 78.5950, radius: 550,  neighborhood: "Nagaram",                severity: "WATCH",    detail: "Waterlogging expected in 24hrs"      },
    { id: "f6", type: "FLOOD", lat: 17.3450, lng: 78.5800, radius: 900,  neighborhood: "Vanasthalipuram",        severity: "OUTBREAK", detail: "Active inundation · Evacuate low zones"},
];

export function getOutbreakZones(type: OutbreakType): OutbreakZone[] {
    return ALL_ZONES.filter((z) => z.type === type);
}

export default ALL_ZONES;
