import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";
import MapField from "./MapField";
import type { OutbreakType, OutbreakZone, HealthAlert } from "../types";
import { getOutbreakZones, OUTBREAK_META, OUTBREAK_FILL } from "../data/outbreaks";

const HEALTH_ALERT_KEY = "rescue_dss_health_alerts";

export default function PublicHealthDashboard() {
    const navigate = useNavigate();
    const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakType>("DENGUE");
    const [raisedAlertIds, setRaisedAlertIds] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState<string | null>(null);

    const zones = getOutbreakZones(selectedOutbreak);
    const meta = OUTBREAK_META[selectedOutbreak];

    const raiseAlert = (zone: OutbreakZone) => {
        if (raisedAlertIds.has(zone.id)) return;

        const alert: HealthAlert = {
            id: `ha-${zone.id}-${Date.now()}`,
            outbreakType: zone.type,
            neighborhood: zone.neighborhood,
            detail: zone.detail,
            severity: zone.severity,
            lat: zone.lat,
            lng: zone.lng,
            timestamp: Date.now(),
        };

        // Write to localStorage — Dispatcher polls this
        const existing: HealthAlert[] = JSON.parse(localStorage.getItem(HEALTH_ALERT_KEY) || "[]");
        localStorage.setItem(HEALTH_ALERT_KEY, JSON.stringify([...existing, alert]));

        setRaisedAlertIds(prev => new Set([...prev, zone.id]));

        setToast(`🚨 Alert sent: ${zone.neighborhood}`);
        setTimeout(() => setToast(null), 3000);
    };

    const outbreakCount  = zones.filter(z => z.severity === "OUTBREAK").length;
    const warningCount   = zones.filter(z => z.severity === "WARNING").length;

    return (
        <div className="h-screen w-full flex bg-[#020617] text-white overflow-hidden relative">

            {/* Background glow */}
            <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* TOAST */}
            {toast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 glass-panel px-5 py-2.5 rounded-full border border-teal-500/40 text-sm text-teal-300 font-medium animate-in slide-in-from-top-4 shadow-lg">
                    {toast}
                </div>
            )}

            {/* ── LEFT PANEL ─────────────────────────────── */}
            <div className="w-[380px] h-full z-10 p-4 flex flex-col gap-3 overflow-hidden shrink-0">

                {/* HEADER */}
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => navigate("/")} className="hover:bg-slate-700/50 p-1 rounded transition">
                            <ArrowLeft size={20} />
                        </button>
                        <Activity className="text-teal-400 w-5 h-5" />
                        <h2 className="font-bold text-lg tracking-wide">PUBLIC HEALTH HQ</h2>
                    </div>
                    <p className="text-[11px] text-slate-500 ml-8 mb-4">
                        Monitor outbreaks · Raise alerts to Command Center
                    </p>

                    {/* Outbreak combobox */}
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        Outbreak / Hazard Type
                    </label>
                    <select
                        value={selectedOutbreak}
                        onChange={(e) => {
                            setSelectedOutbreak(e.target.value as OutbreakType);
                            setRaisedAlertIds(new Set());
                        }}
                        className="w-full bg-slate-900 border border-teal-500/30 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-teal-400 transition cursor-pointer mb-3"
                    >
                        {(Object.keys(OUTBREAK_META) as OutbreakType[]).map((key) => (
                            <option key={key} value={key}>
                                {OUTBREAK_META[key].emoji}  {OUTBREAK_META[key].label}
                            </option>
                        ))}
                    </select>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                        <div className="bg-slate-900/60 rounded-lg p-2">
                            <div className="font-bold text-white text-lg">{zones.length}</div>
                            <div className="text-[9px] text-slate-500">Zones</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-2">
                            <div className="font-bold text-red-400 text-lg">{outbreakCount}</div>
                            <div className="text-[9px] text-slate-500">Outbreak</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-2">
                            <div className="font-bold text-orange-400 text-lg">{warningCount}</div>
                            <div className="text-[9px] text-slate-500">Warning</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-2">
                            <div className="font-bold text-teal-400 text-lg">{raisedAlertIds.size}</div>
                            <div className="text-[9px] text-slate-500">Alerted</div>
                        </div>
                    </div>
                </div>

                {/* LEGEND */}
                <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Legend</span>
                    {(["WATCH", "WARNING", "OUTBREAK"] as const).map((sev) => (
                        <span key={sev} className="flex items-center gap-1 text-[10px] text-slate-300">
                            <span
                                className="w-2.5 h-2.5 rounded-full border border-white/10 shrink-0"
                                style={{ backgroundColor: OUTBREAK_FILL[selectedOutbreak][sev] }}
                            />
                            {meta.severityLabels[sev]}
                        </span>
                    ))}
                    <span className="ml-auto text-[10px] text-slate-600 italic">{meta.description}</span>
                </div>

                {/* ZONE LIST */}
                <div className="glass-panel flex-1 rounded-xl p-3 overflow-y-auto min-h-0">
                    <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        {meta.emoji} {meta.label} · {zones.length} zones
                    </h3>

                    <div className="space-y-2">
                        {zones.map((zone) => {
                            const fill = OUTBREAK_FILL[zone.type][zone.severity];
                            const sevLabel = meta.severityLabels[zone.severity];
                            const alerted = raisedAlertIds.has(zone.id);

                            return (
                                <div
                                    key={zone.id}
                                    className="p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/50 transition"
                                    style={{ borderLeft: `3px solid ${fill}` }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                            style={{ color: fill, backgroundColor: `${fill}18`, border: `1px solid ${fill}40` }}
                                        >
                                            {sevLabel.toUpperCase()}
                                        </span>
                                        {alerted && (
                                            <span className="text-[10px] text-teal-400 font-bold">✓ Sent</span>
                                        )}
                                    </div>

                                    <p className="text-sm font-semibold text-white mt-1 mb-0.5">{zone.neighborhood}</p>
                                    <p className="text-xs text-slate-400 mb-2">{zone.detail}</p>

                                    {alerted ? (
                                        <div className="w-full text-[11px] py-1.5 rounded text-center bg-teal-500/10 text-teal-400 border border-teal-500/30 font-medium">
                                            ✓ Alert dispatched to Command Center
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => raiseAlert(zone)}
                                            className="w-full text-[11px] py-1.5 rounded font-bold transition hover:opacity-80"
                                            style={{ backgroundColor: `${fill}18`, color: fill, border: `1px solid ${fill}40` }}
                                        >
                                            🚨 Raise Health Alert
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── MAP ─────────────────────────────────────── */}
            <div className="flex-1 relative">
                <MapField
                    incidents={[]}
                    clusters={[]}
                    units={[]}
                    outbreakZones={zones}
                    interactive={false}
                />
                {/* Map mode badge */}
                <div className="absolute top-4 right-4 glass-panel px-3 py-1.5 rounded-full text-xs text-slate-400 flex items-center gap-2 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    {meta.emoji} {meta.label} · Disease View
                </div>
            </div>
        </div>
    );
}
