import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';
import { getChartData, getAIPredictions } from '../services/mockDataService';
import { Activity, ShieldAlert, Droplets, TrendingUp, Cpu, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const exportToCSV = (data, filename) => {
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => row[k]).join(','))].join('\n');
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
    const [historicalData, setHistoricalData] = useState([]);
    const [aiData, setAiData] = useState([]);

    useEffect(() => {
        setHistoricalData(getChartData());
        setAiData(getAIPredictions());
    }, []);

    const kpis = [
        { name: t.dashboard.avgPh, value: '7.1', change: '+0.2', type: 'positive', icon: Activity },
        { name: t.dashboard.risk, value: '14%', change: '-2%', type: 'positive', icon: ShieldAlert },
        { name: t.dashboard.usage, value: '1.2M', change: '+12k', type: 'negative', icon: Droplets },
        { name: t.dashboard.sensors, value: '100%', change: '0%', type: 'neutral', icon: Cpu },
    ];

    return (
        <div className="flex-grow p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-text">{t.dashboard.title}</h1>
                    <p className="text-text-muted mt-2">{t.dashboard.subtitle}</p>
                </div>

                {/* Export CSV Button */}
                <motion.button
                    id="export-csv-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportToCSV(
                        [...historicalData.map(d => ({ type: 'historical', ...d })),
                        ...aiData.map(d => ({ type: 'ai_prediction', ...d }))],
                        'aquaguardian_data.csv'
                    )}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all text-sm"
                >
                    <Download className="w-4 h-4" />
                    {t.dashboard.exportCSV}
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
                        className="glass p-6 rounded-2xl flex flex-col transition-colors duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${kpi.type === 'positive' ? 'text-success bg-success/10' :
                                kpi.type === 'negative' ? 'text-danger bg-danger/10' : 'text-text-muted bg-surface/50 border border-glass-border'
                                }`}>
                                {kpi.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-text mb-1 tracking-tight">{kpi.value}</h3>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{kpi.name}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Historical Quality Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-6 rounded-3xl transition-colors duration-300"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-text tracking-tight uppercase tracking-[0.05em]">{t.dashboard.qualityTrend}</h2>
                        <motion.button
                            id="export-quality-csv"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => exportToCSV(historicalData, 'water_quality_trend.csv')}
                            className="p-2 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-all"
                            title="Export this chart as CSV"
                        >
                            <Download className="w-4 h-4" />
                        </motion.button>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="currentColor" className="text-text-muted opacity-50" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="currentColor" className="text-text-muted opacity-50" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                                <ChartTooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: 'var(--text)', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="qualityScore" name="Quality Score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorQuality)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* AI Predictive Risk Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass p-6 rounded-3xl relative overflow-hidden transition-colors duration-300"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[80px]"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-text flex items-center gap-2 tracking-tight">
                                <Cpu className="w-5 h-5 text-accent" />
                                {t.dashboard.aiForecast}
                            </h2>
                            <p className="text-sm text-text-muted mt-1">{t.dashboard.aiSubtitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <motion.button
                                id="export-ai-csv"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => exportToCSV(aiData, 'ai_predictions.csv')}
                                className="p-2 bg-primary/10 rounded-lg text-warning hover:bg-primary/20 transition-all backdrop-blur-md"
                                title="Export AI predictions as CSV"
                            >
                                <Download className="w-4 h-4" />
                            </motion.button>
                            <div className="p-2 bg-primary/10 rounded-lg text-warning backdrop-blur-md">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="h-72 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={aiData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" stroke="currentColor" className="text-text-muted opacity-50" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="currentColor" className="text-text-muted opacity-50" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                                <ChartTooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: 'var(--text)', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'var(--text-muted)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predictedRisk"
                                    name="Risk Probability %"
                                    stroke="var(--warning)"
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--warning)' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
