import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, Droplets, TrendingUp, AlertTriangle, Cpu, PlusCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function linearRegression(values) {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };
    const sumX = values.reduce((acc, _, i) => acc + i, 0);
    const sumY = values.reduce((acc, v) => acc + v, 0);
    const sumXY = values.reduce((acc, v, i) => acc + i * v, 0);
    const sumXX = values.reduce((acc, _, i) => acc + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass p-4 rounded-xl border border-glass-border shadow-2xl bg-surface/90 backdrop-blur-xl">
            <p className="text-text font-black mb-2">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} className="text-sm font-bold flex items-center justify-between gap-4" style={{ color: entry.color }}>
                    <span>{entry.name}:</span>
                    <span>{entry.value != null ? entry.value : '—'}</span>
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const records = useQuery(api.waterData.list) || [];
    const addRecord = useMutation(api.waterData.add);
    const removeRecord = useMutation(api.waterData.remove);

    const [form, setForm] = useState({ day: '', usage: '', qualityScore: '' });
    const [adding, setAdding] = useState(false);
    const [formVisible, setFormVisible] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usage = parseFloat(form.usage);
        const qualityScore = parseFloat(form.qualityScore);
        if (!form.day || isNaN(usage) || isNaN(qualityScore)) return;
        if (qualityScore < 0 || qualityScore > 100) return;
        setAdding(true);
        try {
            await addRecord({
                day: form.day,
                usage,
                qualityScore,
                recordedAt: new Date().toISOString(),
            });
            setForm({ day: '', usage: '', qualityScore: '' });
            setFormVisible(false);
        } finally {
            setAdding(false);
        }
    };

    const chartData = useMemo(() => {
        if (records.length === 0) return [];

        const usages = records.map(r => r.usage);
        const qualities = records.map(r => r.qualityScore);
        const { slope: uSlope, intercept: uInt } = linearRegression(usages);
        const { slope: qSlope, intercept: qInt } = linearRegression(qualities);
        const n = records.length;

        const histPoints = records.map((r, i) => ({
            day: r.day,
            usage: r.usage,
            qualityScore: r.qualityScore,
            predictedUsage: null,
            predictedQuality: null,
            _id: r._id,
        }));

        const predPoints = Array.from({ length: 7 }, (_, j) => {
            const idx = n + j;
            const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            return {
                day: `${days[j % 7]}+${j + 1}`,
                usage: null,
                qualityScore: null,
                predictedUsage: Math.round(Math.min(Math.max(uSlope * idx + uInt, 500), 5000)),
                predictedQuality: Math.round(Math.min(Math.max(qSlope * idx + qInt, 0), 100)),
            };
        });

        return [...histPoints, ...predPoints];
    }, [records]);

    const avgUsage = records.length
        ? Math.round(records.reduce((a, r) => a + r.usage, 0) / records.length)
        : null;
    const avgQuality = records.length
        ? (records.reduce((a, r) => a + r.qualityScore, 0) / records.length).toFixed(1)
        : null;
    const peakUsage = records.length ? Math.max(...records.map(r => r.usage)) : null;

    return (
        <div className="flex-grow flex flex-col items-center pt-8 pb-32 px-4 sm:px-6 md:px-12 bg-background min-h-screen">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-black text-xs uppercase tracking-widest mb-5 border border-accent/20">
                    <Cpu className="w-4 h-4" /> AI Predictive Engine
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text mb-4 tracking-tight">
                    Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Analytics</span>
                </h1>
                <p className="text-text-muted text-base max-w-2xl mx-auto font-medium mb-6">
                    Log real daily water readings. The OLS regression model forecasts the next 7 days — no guesses, no mock numbers.
                </p>
                <button
                    onClick={() => setFormVisible(v => !v)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all text-sm uppercase tracking-wider"
                >
                    <PlusCircle className="w-4 h-4" /> Log Water Reading
                </button>
            </motion.div>

            {/* Add Form */}
            <AnimatePresence>
                {formVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        className="w-full max-w-2xl mb-8"
                    >
                        <form onSubmit={handleSubmit} className="glass p-6 rounded-3xl border border-glass-border shadow-xl space-y-4">
                            <h3 className="text-lg font-black text-text">New Reading</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Day Label</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Mon, 2025-03-06"
                                        value={form.day}
                                        onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-glass-border bg-surface text-sm font-semibold outline-none focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Usage (Gallons)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1540"
                                        value={form.usage}
                                        min={0}
                                        onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-glass-border bg-surface text-sm font-semibold outline-none focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Quality Score (0–100)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 87"
                                        value={form.qualityScore}
                                        min={0}
                                        max={100}
                                        onChange={e => setForm(f => ({ ...f, qualityScore: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-glass-border bg-surface text-sm font-semibold outline-none focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={adding}
                                className="w-full py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {adding ? 'Saving…' : 'Save to Database'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* KPI Strip */}
            {records.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Avg Daily Usage', value: `${avgUsage} Gal`, icon: Droplets, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Avg Quality Score', value: avgQuality, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
                        { label: 'Peak Demand', value: `${peakUsage} Gal`, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10' },
                    ].map(kpi => (
                        <div key={kpi.label} className="glass p-5 rounded-2xl border border-glass-border flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} flex-shrink-0`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{kpi.label}</p>
                                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Charts */}
            {records.length >= 2 && (
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 md:p-8 rounded-3xl border border-glass-border shadow-xl">
                        <h2 className="text-xl font-black text-text flex items-center gap-2 mb-1"><Droplets className="w-5 h-5 text-primary" /> Demand Forecast</h2>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-6">Live readings + OLS regression prediction (Gallons)</p>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gUsage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.07)" />
                                    <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontWeight: 'bold', fontSize: '12px' }} />
                                    <Area connectNulls={false} type="monotone" name="Logged Usage" dataKey="usage" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gUsage)" dot={{ r: 5, strokeWidth: 0 }} activeDot={{ r: 8 }} />
                                    <Area connectNulls={false} strokeDasharray="6 3" type="monotone" name="AI Forecast" dataKey="predictedUsage" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#gPred)" dot={false} activeDot={{ r: 7 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 md:p-8 rounded-3xl border border-glass-border shadow-xl">
                        <h2 className="text-xl font-black text-text flex items-center gap-2 mb-1"><Activity className="w-5 h-5 text-success" /> Quality Index</h2>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-6">Water safety score out of 100</p>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.07)" />
                                    <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ paddingTop: '16px', fontWeight: 'bold', fontSize: '12px' }} />
                                    <Line connectNulls={false} type="monotone" name="Historical Quality" dataKey="qualityScore" stroke="#10b981" strokeWidth={3} dot={{ r: 6, strokeWidth: 0 }} activeDot={{ r: 10 }} />
                                    <Line connectNulls={false} strokeDasharray="6 3" type="monotone" name="AI Forecast" dataKey="predictedQuality" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>
            )}

            {records.length === 1 && (
                <p className="text-text-muted text-center italic py-4 mb-6">Log at least 2 days of data to enable AI forecasting.</p>
            )}

            {/* Logged Data Table */}
            {records.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl glass rounded-3xl border border-glass-border shadow-xl overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-glass-border flex items-center justify-between">
                        <h3 className="font-black text-text">Logged Water Readings</h3>
                        <span className="text-xs text-text-muted font-bold">{records.length} records</span>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-surface/50">
                            <tr>
                                {['Day', 'Usage (Gal)', 'Quality Score', 'Logged At', ''].map(h => (
                                    <th key={h} className="py-3 px-5 text-xs font-black text-text-muted uppercase">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {records.map(r => (
                                <tr key={r._id} className="hover:bg-primary/5 transition-colors">
                                    <td className="py-3 px-5 text-sm font-black text-text">{r.day}</td>
                                    <td className="py-3 px-5 text-sm font-bold text-primary">{r.usage}</td>
                                    <td className="py-3 px-5">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${r.qualityScore >= 85 ? 'bg-success/10 text-success' : r.qualityScore >= 70 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                            {r.qualityScore}
                                        </span>
                                    </td>
                                    <td className="py-3 px-5 text-xs text-text-muted font-mono">{new Date(r.recordedAt).toLocaleString()}</td>
                                    <td className="py-3 px-5">
                                        <button onClick={() => removeRecord({ id: r._id })} className="p-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Empty state */}
            {records.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-text-muted">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg">No data recorded yet.</p>
                    <p className="text-sm mt-2">Click "Log Water Reading" above to add your first real measurement.</p>
                </motion.div>
            )}
        </div>
    );
}
