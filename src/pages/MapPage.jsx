import { useState, useEffect, Fragment, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { AlertTriangle, Info, Plus, Minus, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Custom Zoom Control Component
const ZoomControls = () => {
    const map = useMap();
    return (
        <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
            <button
                onClick={() => map.zoomIn()}
                className="glass w-12 h-12 flex items-center justify-center rounded-xl text-text hover:bg-surface transition-all shadow-xl border border-glass-border"
                title="Zoom In"
            >
                <Plus className="w-6 h-6" />
            </button>
            <button
                onClick={() => map.zoomOut()}
                className="glass w-12 h-12 flex items-center justify-center rounded-xl text-text hover:bg-surface transition-all shadow-xl border border-glass-border"
                title="Zoom Out"
            >
                <Minus className="w-6 h-6" />
            </button>
        </div>
    );
};

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for different statuses
const createCustomIcon = (color) => {
    return new L.DivIcon({
        className: 'custom-icon',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
};

const safeIcon = createCustomIcon('#10b981');
const warningIcon = createCustomIcon('#f59e0b');
const dangerIcon = createCustomIcon('#ef4444');

export default function MapPage() {
    const { t } = useLanguage();
    const realReports = useQuery(api.reports.list) || [];
    const [loading, setLoading] = useState(true);
    const [selectedSensor, setSelectedSensor] = useState(null);

    const center = useMemo(() => [13.0827, 78.5000], []);

    useEffect(() => {
        if (realReports) {
            setLoading(false);
        }
    }, [realReports]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'danger': return 'text-danger';
            case 'warning': return 'text-warning';
            default: return 'text-success';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'danger': return 'bg-danger/20';
            case 'warning': return 'bg-warning/20';
            default: return 'bg-success/20';
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary border-r-2 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col md:flex-row relative h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-full md:w-96 glass md:h-full z-10 flex flex-col border-r border-glass-border md:relative transition-colors duration-300"
            >
                <div className="p-6 pb-4 border-b border-glass-border">
                    <h2 className="text-2xl font-black text-text mb-1 tracking-tight">{t.map.networkTitle}</h2>
                    <p className="text-sm text-text-muted">{t.map.networkDesc}</p>

                    {/* Legend */}
                    <div className="mt-4 flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-success">
                            <span className="w-3 h-3 rounded-full bg-success inline-block" /> {t.map.safe}
                        </span>
                        <span className="flex items-center gap-1.5 text-warning">
                            <span className="w-3 h-3 rounded-full bg-warning inline-block" /> {t.map.warning}
                        </span>
                        <span className="flex items-center gap-1.5 text-danger">
                            <span className="w-3 h-3 rounded-full bg-danger inline-block" /> {t.map.danger}
                        </span>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {realReports.length === 0 ? (
                        <div className="text-center py-10">
                            <AlertTriangle className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
                            <p className="text-sm text-text-muted font-medium">No live reports yet.</p>
                        </div>
                    ) : realReports.map(report => (
                        <div
                            key={report._id}
                            onClick={() => report.lat && setSelectedSensor(report)}
                            className="bg-surface/50 border border-glass-border rounded-2xl p-4 hover:bg-surface transition-all duration-300 cursor-pointer shadow-sm group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-text group-hover:text-primary transition-colors text-sm">{report.type}</h3>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-sm ${getStatusBg(report.status)} ${getStatusColor(report.status)}`}>
                                    {report.status}
                                </span>
                            </div>
                            <p className="text-xs text-text-muted line-clamp-2 mb-3">{report.description}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                <MapPin className="w-3 h-3" />
                                <span>{report.location}</span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-glass-border flex justify-between items-center text-[10px]">
                                <span className="text-text-muted italic">By {report.user}</span>
                                <span className="text-text-muted">{new Date(report.time).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Map Container */}
            <div className="flex-grow h-full relative z-0">
                <MapContainer
                    center={center}
                    zoom={7}
                    className="w-full h-full min-h-[400px]"
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <ZoomControls />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {realReports.filter(r => r.lat && r.lng).map(report => (
                        <Fragment key={report._id}>
                            <Circle
                                center={[report.lat, report.lng]}
                                radius={report.priority === 'high' ? 2000 : 1000}
                                pathOptions={{
                                    color: report.status === 'resolved' ? '#10b981' : report.priority === 'high' ? '#ef4444' : '#f59e0b',
                                    fillColor: report.status === 'resolved' ? '#10b981' : report.priority === 'high' ? '#ef4444' : '#f59e0b',
                                    fillOpacity: 0.2,
                                    weight: 1
                                }}
                            />
                            <Marker
                                position={[report.lat, report.lng]}
                                icon={report.status === 'resolved' ? safeIcon : report.priority === 'high' ? dangerIcon : warningIcon}
                                eventHandlers={{ click: () => setSelectedSensor(report) }}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px] bg-surface rounded-xl text-text border border-glass-border shadow-2xl">
                                        <h3 className="font-black text-lg border-b border-glass-border pb-3 mb-3 flex justify-between items-center">
                                            {report.type}
                                            <span className="text-text-muted text-[10px] font-medium opacity-50">#{report._id.slice(-4)}</span>
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                <span>Status</span>
                                                <span className={`${getStatusColor(report.status)} font-black uppercase text-xs`}>{report.status}</span>
                                            </div>
                                            <p className="text-xs text-text-muted italic">"{report.description}"</p>
                                            <div className="mt-4 pt-4 border-t border-glass-border bg-primary/5 -mx-2 -mb-2 p-3 rounded-b-xl">
                                                <div className="flex items-center gap-2 mb-1.5 text-primary">
                                                    <Info className="w-3.5 h-3.5" />
                                                    <span className="font-black text-[10px] uppercase tracking-wider">Reported by {report.user}</span>
                                                </div>
                                                <p className="text-[11px] font-medium text-text-muted leading-relaxed">
                                                    At: {report.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </Fragment>
                    ))}
                </MapContainer>
            </div>

            <AnimatePresence>
                {selectedSensor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedSensor(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface rounded-3xl shadow-2xl border border-glass-border w-full max-w-lg overflow-hidden"
                        >
                            <div className="flex justify-between items-start p-6 border-b border-glass-border">
                                <div>
                                    <h3 className="font-black text-xl text-text">{selectedSensor.type}</h3>
                                    <p className="text-sm text-text-muted mt-0.5">Reported by {selectedSensor.user}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-black uppercase rounded-xl ${getStatusBg(selectedSensor.status)} ${getStatusColor(selectedSensor.status)}`}>
                                        {selectedSensor.status}
                                    </span>
                                    <button
                                        onClick={() => setSelectedSensor(null)}
                                        className="p-2 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {selectedSensor.photo && (
                                    <img src={selectedSensor.photo} alt="Evidence" className="w-full h-48 object-cover rounded-2xl border border-glass-border mb-4" />
                                )}
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <p className="text-xs text-primary font-bold uppercase mb-1 flex items-center gap-2">
                                        <Info className="w-3.5 h-3.5" /> Description
                                    </p>
                                    <p className="text-sm text-text-muted leading-relaxed">{selectedSensor.description}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-muted font-bold py-2">
                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {selectedSensor.location}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .leaflet-container {
                    background: #0f172a;
                    font-family: inherit;
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
