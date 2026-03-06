import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Activity, ShieldAlert, Droplets, TrendingUp, Cpu, Download, FileText, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export default function Dashboard() {
    const { t } = useLanguage();
    const reports = useQuery(api.reports.list) || [];

    const kpis = useMemo(() => {
        const total = reports.length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const resolved = reports.filter(r => r.status === 'resolved').length;
        const highPriority = reports.filter(r => r.priority === 'high').length;

        return [
            { name: 'Total Reports', value: total.toString(), type: 'neutral', icon: FileText, color: 'text-primary' },
            { name: 'Pending Review', value: pending.toString(), type: 'negative', icon: Clock, color: 'text-warning' },
            { name: 'Issues Resolved', value: resolved.toString(), type: 'positive', icon: CheckCircle, color: 'text-success' },
            { name: 'High Priority', value: highPriority.toString(), type: 'negative', icon: ShieldAlert, color: 'text-danger' },
        ];
    }, [reports]);

    const chartData = useMemo(() => {
        const counts = {};
        reports.forEach(r => {
            const date = new Date(r.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            counts[date] = (counts[date] || 0) + 1;
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [reports]);

    const statusData = useMemo(() => {
        return [
            { name: 'Pending', value: reports.filter(r => r.status === 'pending').length, color: '#f59e0b' },
            { name: 'Investigating', value: reports.filter(r => r.status === 'investigating').length, color: '#3b82f6' },
            { name: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: '#10b981' },
        ].filter(d => d.value > 0);
    }, [reports]);

    return (
        <div className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-black text-text tracking-tight uppercase">Live Analytics</h1>
                    <p className="text-text-muted mt-2 font-medium">Real-time crowdsourced water data and community impact monitoring.</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportToCSV(reports, 'aquaguardian_reports.csv')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all text-sm uppercase tracking-widest"
                >
                    <Download className="w-4 h-4" />
                    Export Reports CSV
                </motion.button>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-3xl flex flex-col hover:bg-surface/80 transition-all duration-300 border border-glass-border shadow-sm group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${kpi.color} bg-current/10`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-text mb-1 tracking-tight tabular-nums">{kpi.value}</h3>
                        <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{kpi.name}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Report Volume Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-8 rounded-[2.5rem] border border-glass-border shadow-xl hover:shadow-2xl transition-all"
                >
                    <h2 className="text-xl font-black text-text mb-8 flex items-center gap-2 uppercase tracking-widest">
                        <Activity className="w-5 h-5 text-primary" />
                        Report Volume
                    </h2>
                    <div className="h-72 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px] font-bold fill-text-muted" />
                                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold fill-text-muted" />
                                    <ChartTooltip
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: 'var(--primary)', fontWeight: 'black', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted font-bold opacity-30">
                                No report data available yet.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Status Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-8 rounded-[2.5rem] border border-glass-border shadow-xl relative overflow-hidden"
                >
                    <h2 className="text-xl font-black text-text mb-8 flex items-center gap-2 uppercase tracking-widest relative z-10">
                        <CheckCircle className="w-5 h-5 text-success" />
                        Status Distribution
                    </h2>
                    <div className="h-72 w-full relative z-10">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
                                        itemStyle={{ fontWeight: 'black' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted font-bold opacity-30">
                                No distribution data available.
                            </div>
                        )}
                        <div className="flex justify-center gap-6 mt-4">
                            {statusData.map(d => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-[10px] font-black uppercase text-text-muted">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
