import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileWarning, CheckCircle, Clock, MapPin,
    Search, Download, Shield, AlertTriangle, X,
    TrendingUp, Activity, Zap
} from 'lucide-react';

const MOCK_REPORTS = [
    { id: 'REP-8492', type: 'Contamination', location: 'Zone A - Main Street', time: '10 mins ago', status: 'pending', user: 'Anonymous', priority: 'high' },
    { id: 'REP-8491', type: 'Pipeline Leak', location: 'Zone C - Industrial Park', time: '2 hours ago', status: 'investigating', user: 'John D.', priority: 'medium' },
    { id: 'REP-8490', type: 'Sanitation', location: 'Zone B - Public School 4', time: '5 hours ago', status: 'resolved', user: 'Maria S.', priority: 'low' },
    { id: 'REP-8489', type: 'Water Shortage', location: 'Zone D - Residential Block', time: '1 day ago', status: 'resolved', user: 'Anonymous', priority: 'medium' },
    { id: 'REP-8488', type: 'Contamination', location: 'Zone A - East Suburb', time: '1 day ago', status: 'resolved', user: 'David W.', priority: 'high' },
    { id: 'REP-8487', type: 'Pipeline Leak', location: 'Zone E - Commercial Hub', time: '2 days ago', status: 'resolved', user: 'Priya K.', priority: 'low' },
];

const FIELD_TEAMS = [
    { id: 'TM-01', name: 'Alpha Unit', members: 4, status: 'deployed', location: 'Zone A', task: 'Contamination Response' },
    { id: 'TM-02', name: 'Beta Unit', members: 3, status: 'standby', location: 'Base', task: 'On Standby' },
    { id: 'TM-03', name: 'Gamma Unit', members: 5, status: 'deployed', location: 'Zone C', task: 'Pipeline Inspection' },
    { id: 'TM-04', name: 'Delta Unit', members: 2, status: 'standby', location: 'Base', task: 'On Standby' },
];

// CSV export utility
const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [
        keys.join(','),
        ...data.map(row => keys.map(k => `"${String(row[k]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export default function AdminPanel() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('reports');
    const [filterStatus, setFilterStatus] = useState('all');
    const [exportFlash, setExportFlash] = useState(false);

    const updateReportStatus = (id, newStatus) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setIsReviewOpen(false);
    };

    const handleExport = () => {
        const data = filteredReports.map(r => ({
            ID: r.id, Type: r.type, Location: r.location,
            'Reported By': r.user, Status: r.status,
            Priority: r.priority, Time: r.time
        }));
        exportToCSV(data, 'admin_reports.csv');
        setExportFlash(true);
        setTimeout(() => setExportFlash(false), 2000);
    };

    const filteredReports = filterStatus === 'all'
        ? reports
        : reports.filter(r => r.status === filterStatus);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-danger/15 text-danger flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            );
            case 'investigating': return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-warning/15 text-warning flex items-center gap-1 w-fit">
                    <Search className="w-3 h-3" /> Investigating
                </span>
            );
            case 'resolved': return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-success/15 text-success flex items-center gap-1 w-fit">
                    <CheckCircle className="w-3 h-3" /> Resolved
                </span>
            );
            default: return null;
        }
    };

    const getPriorityDot = (priority) => {
        const colors = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-success' };
        return <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-text-muted'} inline-block`} />;
    };

    const kpis = [
        { label: 'Open Issues', value: reports.filter(r => r.status !== 'resolved').length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
        { label: 'Investigating', value: reports.filter(r => r.status === 'investigating').length, icon: Search, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Resolved Today', value: reports.filter(r => r.status === 'resolved').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Resolution Rate', value: '92%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    ];

    return (
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">

            {/* Sidebar */}
            <div className="w-full md:w-64 glass border-r border-glass-border p-5 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-text">Admin Panel</p>
                        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Municipality Control</p>
                    </div>
                </div>

                {[
                    { id: 'reports', label: 'Citizen Reports', icon: FileWarning, count: reports.filter(r => r.status !== 'resolved').length },
                    { id: 'teams', label: 'Field Teams', icon: Users, count: FIELD_TEAMS.filter(t => t.status === 'deployed').length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        id={`admin-tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'text-text hover:bg-primary/10 hover:text-primary'}`}
                    >
                        <span className="flex items-center gap-2.5">
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </span>
                        {tab.count > 0 && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}

                {/* KPI mini cards */}
                <div className="mt-auto pt-4 border-t border-glass-border space-y-2">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/50 border border-glass-border">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                                    <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                                </div>
                                <span className="text-xs text-text-muted font-semibold">{kpi.label}</span>
                            </div>
                            <span className={`text-sm font-black ${kpi.color}`}>{kpi.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-black text-text">Incoming Reports Triage</h1>
                                <p className="text-sm text-text-muted mt-1">Manage crowdsourced issues and dispatch field teams.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Filter */}
                                <select
                                    id="admin-filter-status"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 rounded-xl border border-glass-border bg-surface text-text text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="resolved">Resolved</option>
                                </select>

                                {/* Export CSV */}
                                <motion.button
                                    id="admin-export-csv"
                                    onClick={handleExport}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${exportFlash
                                        ? 'bg-success text-white shadow-success/30'
                                        : 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/30 hover:opacity-90'}`}
                                >
                                    {exportFlash ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    {exportFlash ? 'Downloaded!' : 'Export CSV'}
                                </motion.button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="glass rounded-2xl overflow-hidden border border-glass-border shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface/50 border-b border-glass-border">
                                            {['Issue ID', 'Type', 'Location', 'Reported By', 'Priority', 'Status', 'Action'].map(h => (
                                                <th key={h} className="py-4 px-5 text-xs font-black text-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-glass-border">
                                        {filteredReports.map((report, i) => (
                                            <motion.tr
                                                key={report.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-primary/5 transition-colors"
                                            >
                                                <td className="py-4 px-5 text-sm font-black text-text">{report.id}</td>
                                                <td className="py-4 px-5 text-sm font-semibold text-text">{report.type}</td>
                                                <td className="py-4 px-5 text-sm text-text-muted">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                                        {report.location}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <p className="text-sm font-semibold text-text">{report.user}</p>
                                                    <p className="text-xs text-text-muted">{report.time}</p>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-text capitalize">
                                                        {getPriorityDot(report.priority)} {report.priority}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5">{getStatusBadge(report.status)}</td>
                                                <td className="py-4 px-5">
                                                    <button
                                                        onClick={() => { setSelectedReport(report); setIsReviewOpen(true); }}
                                                        className="px-3 py-1.5 text-xs font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                                                    >
                                                        Review →
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredReports.length === 0 && (
                                    <div className="py-12 text-center text-text-muted font-semibold">
                                        No reports found for selected filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* FIELD TEAMS TAB */}
                {activeTab === 'teams' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-black text-text">Field Teams</h1>
                                <p className="text-sm text-text-muted mt-1">Monitor and manage dispatch units in the field.</p>
                            </div>
                            <motion.button
                                id="export-teams-csv"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => exportToCSV(FIELD_TEAMS.map(t => ({
                                    ID: t.id, Name: t.name, Members: t.members,
                                    Status: t.status, Location: t.location, Task: t.task
                                })), 'field_teams.csv')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-bold shadow-md shadow-primary/30"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {FIELD_TEAMS.map((team, i) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass rounded-2xl p-6 border border-glass-border shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${team.status === 'deployed' ? 'bg-success/15' : 'bg-text-muted/10'}`}>
                                                <Users className={`w-5 h-5 ${team.status === 'deployed' ? 'text-success' : 'text-text-muted'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-text">{team.name}</h3>
                                                <p className="text-xs text-text-muted">{team.id} · {team.members} members</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-black rounded-full ${team.status === 'deployed'
                                            ? 'bg-success/15 text-success'
                                            : 'bg-text-muted/10 text-text-muted'}`}>
                                            {team.status === 'deployed' ? '🟢' : '⭕'} {team.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-text-muted font-semibold">Current Location</span>
                                            <span className="font-bold text-text flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-primary" /> {team.location}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted font-semibold">Active Task</span>
                                            <span className="font-bold text-text">{team.task}</span>
                                        </div>
                                    </div>

                                    {team.status === 'standby' && (
                                        <button className="mt-4 w-full py-2 bg-primary/10 text-primary text-xs font-black rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5" /> Dispatch Team
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isReviewOpen && selectedReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsReviewOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-glass-border"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-text">Review {selectedReport.id}</h2>
                                    <p className="text-sm text-text-muted mt-1">Triage and assign action</p>
                                </div>
                                <button
                                    id="admin-modal-close"
                                    onClick={() => setIsReviewOpen(false)}
                                    className="p-2 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Type', value: selectedReport.type },
                                        { label: 'Priority', value: selectedReport.priority },
                                        { label: 'Reported By', value: selectedReport.user },
                                        { label: 'Time', value: selectedReport.time },
                                    ].map(item => (
                                        <div key={item.label} className="bg-surface/80 border border-glass-border rounded-xl p-3">
                                            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                                            <p className="text-sm font-black text-text capitalize">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-surface/80 border border-glass-border rounded-xl p-4">
                                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> Location
                                    </p>
                                    <p className="text-sm font-bold text-text">{selectedReport.location}</p>
                                </div>

                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Citizen Report</p>
                                    <p className="text-sm text-text-muted leading-relaxed italic">
                                        "Citizen reports brown coloration in drinking water since 8 AM today. Multiple neighbors affected in the East Wing sector."
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {getStatusBadge(selectedReport.status)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {selectedReport.status === 'pending' && (
                                    <button
                                        onClick={() => updateReportStatus(selectedReport.id, 'investigating')}
                                        className="w-full py-3 bg-warning text-white font-bold rounded-xl hover:bg-warning/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-warning/20"
                                    >
                                        <Search className="w-5 h-5" /> Start Investigation & Dispatch Team
                                    </button>
                                )}
                                {selectedReport.status === 'investigating' && (
                                    <button
                                        onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                                        className="w-full py-3 bg-success text-white font-bold rounded-xl hover:bg-success/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-success/20"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Mark as Resolved & Notify Citizens
                                    </button>
                                )}
                                {selectedReport.status === 'resolved' && (
                                    <div className="w-full py-3 bg-success/10 text-success font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                                        <CheckCircle className="w-5 h-5" /> This report has been resolved.
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsReviewOpen(false)}
                                    className="w-full py-3 bg-surface border border-glass-border text-text-muted font-bold rounded-xl hover:bg-primary/5 hover:text-text transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
