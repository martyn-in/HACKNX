import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, Droplets, BookOpen, Heart, Zap, Award } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from 'react';

const HYGIENE_TIPS = [
    { title: 'Boil Water', desc: 'If contamination is suspected in your area, boil water for at least 1 minute before use.', icon: Zap },
    { title: 'Safe Storage', desc: 'Store drinking water in narrow-necked containers with covers to prevent re-contamination.', icon: ShieldCheck },
    { title: 'Hand Hygiene', desc: 'Always wash hands with soap before handling water or food to prevent disease spread.', icon: Heart },
    { title: 'Filter Use', desc: 'Use certified ceramic or biosand filters to remove sediment and pathogens.', icon: Droplets },
];

export default function Awareness() {
    const reports = useQuery(api.reports.list) || [];

    const activeAdvisories = useMemo(() => {
        const contaminationCount = reports.filter(r =>
            r.status !== 'resolved' &&
            (r.type.toLowerCase().includes('contamination') || r.type.toLowerCase().includes('dirty'))
        ).length;

        const advisories = [];
        if (contaminationCount > 0) {
            advisories.push({
                type: 'High Risk',
                level: 'Danger',
                message: `Active contamination reported in ${contaminationCount} zones. Use boiled or filtered water only.`,
                color: 'bg-danger/10 text-danger border-danger/20'
            });
        }

        const shortageCount = reports.filter(r =>
            r.status !== 'resolved' && r.type.toLowerCase().includes('shortage')
        ).length;

        if (shortageCount > 2) {
            advisories.push({
                type: 'Supply Warning',
                level: 'Moderate',
                message: "Multiple water shortages reported. Please practice extreme water conservation.",
                color: 'bg-warning/10 text-warning border-warning/20'
            });
        }

        return advisories;
    }, [reports]);

    return (
        <div className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                <h1 className="text-4xl font-black text-text tracking-tight uppercase">Public Awareness Portal</h1>
                <p className="text-text-muted mt-4 max-w-2xl mx-auto font-medium">Real-time safety advisories and hygiene education to protect our community.</p>
            </motion.div>

            {/* Live Advisories */}
            <div className="space-y-4 mb-12">
                <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" /> Live Safety Alerts
                </h2>
                {activeAdvisories.length === 0 ? (
                    <div className="glass p-6 rounded-3xl border border-glass-border flex items-center justify-center text-text-muted font-bold opacity-50">
                        No active safety alerts. Water quality is currently stable in monitored zones.
                    </div>
                ) : (
                    activeAdvisories.map((adv, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-6 rounded-3xl border ${adv.color} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm"><AlertTriangle className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider opacity-70">{adv.type}</p>
                                    <p className="font-bold text-lg">{adv.message}</p>
                                </div>
                            </div>
                            <span className="px-5 py-2 rounded-xl bg-white/20 font-black text-xs uppercase tracking-widest">{adv.level}</span>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Hygiene Education */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Hygiene Best Practices
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {HYGIENE_TIPS.map((tip, i) => (
                            <motion.div
                                key={tip.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-6 rounded-3xl border border-glass-border hover:bg-surface/50 transition-all flex gap-4"
                            >
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary h-fit"><tip.icon className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="font-black text-text">{tip.title}</h3>
                                    <p className="text-sm text-text-muted mt-1 leading-relaxed">{tip.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* SDG 6 Mission */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent" /> Our SDG 6 Mission
                    </h2>
                    <div className="glass p-8 rounded-[2.5rem] border border-glass-border bg-gradient-to-br from-primary/5 to-accent/5 h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 -m-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                        <h3 className="text-2xl font-black text-text mb-6">Sustainable Development Goal 6</h3>
                        <div className="space-y-4 text-sm text-text-muted leading-relaxed font-medium">
                            <p>Sustainable Development Goal 6 (SDG 6) aims to ensure availability and sustainable management of water and sanitation for all by 2030.</p>
                            <p>At AquaGuardian, we contribute by providing:</p>
                            <ul className="space-y-3 mt-4">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>Monitoring water quality and availability in real-time using community reporting.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>Improving sanitation infrastructure management through direct alert routing.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>Promoting hygiene awareness through data-driven dynamic advisories.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-12 p-6 bg-surface/50 rounded-2xl border border-glass-border backdrop-blur-sm text-center">
                            <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Global Impact Target</p>
                            <p className="text-3xl font-black text-primary">Clean Water for All</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
