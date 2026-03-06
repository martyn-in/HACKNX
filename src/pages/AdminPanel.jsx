import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileWarning, CheckCircle, Clock, MapPin,
    Search, Download, Shield, AlertTriangle, X,
    TrendingUp, Activity, Zap, Trash2
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [
        keys.join(','),
        ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

function getTimeAgo(iso) {
    if (!iso) return "Unknown";
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminPanel() {
    const cloudReports = useQuery(api.reports.list);
    const updateCloudStatus = useMutation(api.reports.updateStatus);
    const cloudTeams = useQuery(api.teams.list);
    const addTeam = useMutation(api.teams.add);
    const updateTeamStatus = useMutation(api.teams.updateStatus);
    const removeTeam = useMutation(api.teams.remove);

    const [newTeamName, setNewTeamName] = useState('');
    const liveTeams = cloudTeams || [];

    const [selectedReport, setSelectedReport] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('reports');
    const [filterStatus, setFilterStatus] = useState('all');
    const [exportFlash, setExportFlash] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');
    const [passcode, setPasscode] = useState('');
    const [loginError, setLoginError] = useState(false);

    const reports = useMemo(() => {
        return (cloudReports || []).map(r => ({
            ...r,
            id: r._id,
        }));
    }, [cloudReports]);

    const filteredReports = reports.filter(r =>
        filterStatus === 'all' || r.status === filterStatus
    );

    const updateReportStatus = async (id, newStatus) => {
        await updateCloudStatus({ id, status: newStatus });
        setIsReviewOpen(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-danger/15 text-danger flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
            case 'investigating': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-warning/15 text-warning flex items-center gap-1 w-fit"><Search className="w-3 h-3" /> Investigating</span>;
            case 'resolved': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-success/15 text-success flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Resolved</span>;
            default: return null;
        }
    };

    const getPriorityDot = (priority) => {
        const colors = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-success' };
        return <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-text-muted'} inline-block`} />;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (passcode === '2025') {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminAuth', 'true');
            setLoginError(false);
        } else {
            setLoginError(true);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('adminAuth');
    };

    if (!isAuthenticated) {
        return (
            <div className="flex-grow flex items-center justify-center bg-background p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full border border-glass-border text-center"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-black text-text mb-2">Admin Access</h1>
                    <p className="text-text-muted text-sm mb-8 font-medium">Verify your credentials to manage the AquaGuardian network.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Enter Passcode</label>
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="••••"
                                className={`w-full px-5 py-4 rounded-2xl bg-surface/50 border ${loginError ? 'border-danger animate-shake' : 'border-glass-border'} focus:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-black text-text`}
                            />
                            {loginError && <p className="text-danger text-[10px] font-bold text-center mt-2 italic flex items-center justify-center gap-1"><X className="w-3 h-3" /> Access Denied. Check passcode.</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-widest text-sm"
                        >
                            Authorize Entry
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const kpis = [
        { label: 'Open Issues', value: reports.filter(r => r.status !== 'resolved').length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
        { label: 'Investigating', value: reports.filter(r => r.status === 'investigating').length, icon: Search, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Total Sync', value: cloudReports?.length || 0, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    ];

    return (
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">
            <div className="w-full md:w-64 glass border-r border-glass-border p-5 flex flex-col gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                        <p className="text-sm font-black text-text">Admin Panel</p>
                        <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Cloud Sync Active</p>
                    </div>
                </div>
                {['reports', 'teams'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all text-sm ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text hover:bg-primary/10 hover:text-primary'}`}>
                        {tab === 'reports' ? <><span className="flex items-center gap-2.5"><FileWarning className="w-4 h-4" /> Citizen Reports</span> <span className="text-xs bg-white/20 px-2 rounded-full">{reports.filter(r => r.status !== 'resolved').length}</span></> : <><span className="flex items-center gap-2.5"><Users className="w-4 h-4" /> Field Teams</span> <span className="text-xs bg-white/20 px-2 rounded-full">{liveTeams.length}</span></>}
                    </button>
                ))}
                <div className="mt-auto pt-4 border-t border-glass-border space-y-2">
                    {kpis.map(kpi => (
                        <div key={kpi.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/50 border border-glass-border">
                            <span className="text-xs text-text-muted font-semibold">{kpi.label}</span>
                            <span className={`text-sm font-black ${kpi.color}`}>{kpi.value}</span>
                        </div>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-danger border border-danger/20 rounded-xl hover:bg-danger/10 transition-colors"
                    >
                        Secure Logout
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                {activeTab === 'reports' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-black text-text">Live Triage</h1>
                            <div className="flex gap-3">
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-glass-border bg-surface text-sm font-semibold outline-none">
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="resolved">Resolved</option>
                                </select>
                            </div>
                        </div>

                        <div className="glass rounded-2xl overflow-hidden border border-glass-border shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-surface/50 border-b border-glass-border">
                                    <tr>
                                        <th className="py-4 px-5 text-xs font-black text-text-muted uppercase">Issue</th>
                                        <th className="py-4 px-5 text-xs font-black text-text-muted uppercase">Details</th>
                                        <th className="py-4 px-5 text-xs font-black text-text-muted uppercase">Status</th>
                                        <th className="py-4 px-5 text-xs font-black text-text-muted uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {filteredReports.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center">
                                                <Activity className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-10" />
                                                <p className="text-text-muted font-bold">No active reports to triage.</p>
                                            </td>
                                        </tr>
                                    ) : filteredReports.map((report, i) => (
                                        <tr key={report.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="py-4 px-5">
                                                <p className="text-sm font-black text-text">{report.type}</p>
                                                <p className="text-xs text-text-muted">{getTimeAgo(report.time)}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-sm font-semibold text-text">{report.user}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                                    <MapPin className="w-3 h-3 text-primary" /> {report.location}
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">{getStatusBadge(report.status)}</td>
                                            <td className="py-4 px-5">
                                                <button onClick={() => { setSelectedReport(report); setIsReviewOpen(true); }} className="px-3 py-1.5 text-xs font-black text-primary bg-primary/10 rounded-lg">Review</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'teams' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h1 className="text-2xl font-black text-text">Active Field Units</h1>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (newTeamName) {
                                    try {
                                        console.log("Attempting to add team:", newTeamName);
                                        await addTeam({ name: newTeamName, status: 'Available', color: 'bg-primary' });
                                        console.log("Team added successfully from frontend.");
                                        setNewTeamName('');
                                    } catch (err) {
                                        console.error("Frontend caught error adding team:", err);
                                        alert("Failed to add team. Check console.");
                                    }
                                }
                            }} className="flex w-full sm:w-auto gap-2">
                                <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="New Team Name..." className="px-4 py-2 w-full sm:w-64 rounded-xl border border-glass-border bg-surface text-sm font-semibold outline-none focus:border-primary transition-all" />
                                <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">Add</button>
                            </form>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {liveTeams.map(team => (
                                <div key={team._id} className="glass p-6 rounded-3xl border border-glass-border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl text-white ${team.color || 'bg-primary'}`}><Users className="w-6 h-6" /></div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateTeamStatus({ id: team._id, status: team.status === 'Available' ? 'On Site' : 'Available' })} className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase hover:opacity-80 transition-opacity whitespace-nowrap ${team.status === 'Available' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{team.status}</button>
                                            <button onClick={() => { if (window.confirm('Remove this team?')) removeTeam({ id: team._id }); }} className="p-1.5 rounded-lg text-danger bg-danger/10 hover:bg-danger/20 transition-colors" title="Delete Team"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-text">{team.name}</h3>
                                    <p className="text-xs text-text-muted mt-1 font-mono bg-surface/50 w-fit px-2 py-0.5 rounded-md border border-glass-border" title={team._id}>ID: ...{team._id.slice(-4)}</p>
                                    <button className="mt-4 w-full py-2.5 rounded-xl bg-surface border border-glass-border text-xs font-bold hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> View Schedule
                                    </button>
                                </div>
                            ))}
                            {liveTeams.length === 0 && <p className="text-text-muted italic py-10 col-span-1 md:col-span-2 lg:col-span-3 text-center">No field teams on record. Add one above.</p>}
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {isReviewOpen && selectedReport && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsReviewOpen(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-surface rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-glass-border">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-black text-text">Issue Details</h2>
                                <button onClick={() => setIsReviewOpen(false)} className="p-2 rounded-xl hover:bg-primary/10 text-text-muted"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4 mb-6">
                                {selectedReport.photo && <img src={selectedReport.photo} alt="Evidence" className="w-full h-48 object-cover rounded-2xl border border-glass-border" />}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface/80 border border-glass-border rounded-xl p-3"><p className="text-[10px] text-text-muted uppercase font-bold">Type</p><p className="text-sm font-black text-text">{selectedReport.type}</p></div>
                                    <div className="bg-surface/80 border border-glass-border rounded-xl p-3"><p className="text-[10px] text-text-muted uppercase font-bold">Reporter</p><p className="text-sm font-black text-text">{selectedReport.user}</p></div>
                                </div>
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4"><p className="text-xs text-primary font-bold uppercase mb-1">Description</p><p className="text-sm text-text-muted">{selectedReport.description}</p></div>
                            </div>
                            <div className="space-y-3">
                                {selectedReport.status === 'pending' && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-text-muted uppercase ml-1">Assign to Team</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {liveTeams.filter(t => t.status === 'Available').length === 0 && <p className="text-xs text-danger text-center italic py-2">No teams currently available.</p>}
                                            {liveTeams.filter(t => t.status === 'Available').map(team => (
                                                <button
                                                    key={team._id}
                                                    onClick={() => { updateReportStatus(selectedReport.id, 'investigating'); updateTeamStatus({ id: team._id, status: 'On Site' }); }}
                                                    className="w-full py-3 px-4 bg-surface border border-glass-border hover:border-primary rounded-xl flex items-center justify-between group transition-all"
                                                >
                                                    <span className="text-sm font-bold text-text group-hover:text-primary">{team.name}</span>
                                                    <Zap className="w-4 h-4 text-text-muted group-hover:text-primary" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedReport.status === 'investigating' && <button onClick={() => updateReportStatus(selectedReport.id, 'resolved')} className="w-full py-3 bg-success text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-success/20"><CheckCircle className="w-4 h-4" /> Mark Resolved</button>}
                                <button onClick={() => setIsReviewOpen(false)} className="w-full py-3 bg-surface border border-glass-border text-text-muted font-bold rounded-xl">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
