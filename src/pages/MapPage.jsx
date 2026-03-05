import { useState, useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { generateMockSensors } from '../services/mockDataService';
import { AlertTriangle, CheckCircle, Info, Plus, Minus, Cpu, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';

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

// Fix Leaflet's default icon path issues with bundlers
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

// Generate 7-day trend data for a sensor
const generateTrendData = (sensor) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const basePh = parseFloat(sensor.metrics.ph);
    return days.map(day => ({
        day,
        ph: parseFloat((basePh + (Math.random() - 0.5) * 0.8).toFixed(2)),
        turbidity: parseFloat((parseFloat(sensor.metrics.turbidity) + (Math.random() - 0.5) * 2).toFixed(1)),
        risk: Math.max(0, Math.min(100, sensor.aiRiskScore + Math.round((Math.random() - 0.5) * 30))),
    }));
};

export default function MapPage() {
    const { t } = useLanguage();
    const [sensors, setSensors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heatmapMode, setHeatmapMode] = useState(false);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [trendData, setTrendData] = useState([]);

    const center = [13.0827, 78.5000];

    useEffect(() => {
        setTimeout(() => {
            setSensors(generateMockSensors(100));
            setLoading(false);
        }, 800);
    }, []);

    const openTrend = (sensor) => {
        setSelectedSensor(sensor);
        setTrendData(generateTrendData(sensor));
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary border-r-2 border-r-transparent"></div>
            </div>
        );
    }

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
                    <div className="mt-3 flex items-center gap-4 text-xs font-bold">
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

                    {/* Heatmap Toggle */}
                    <button
                        id="heatmap-toggle"
                        onClick={() => setHeatmapMode(h => !h)}
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${heatmapMode ? 'bg-accent text-white shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                        <Layers className="w-4 h-4" />
                        {heatmapMode ? t.map.markers : t.map.heatmap} {t.map.legend}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {sensors.map(sensor => (
                        <div
                            key={sensor.id}
                            onClick={() => openTrend(sensor)}
                            className="bg-surface/50 border border-glass-border rounded-2xl p-4 hover:bg-surface transition-all duration-300 cursor-pointer shadow-sm group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-text group-hover:text-primary transition-colors text-sm">{sensor.locationName}</h3>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-sm ${getStatusBg(sensor.status)} ${getStatusColor(sensor.status)}`}>
                                    {sensor.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-text-muted mt-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="opacity-50 font-medium">pH:</span> <span className="font-bold text-text">{sensor.metrics.ph}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="opacity-50 font-medium">Turb:</span> <span className="font-bold text-text">{sensor.metrics.turbidity}</span>
                                </div>
                                <div className="col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-glass-border">
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-50">AI Risk Score</span>
                                    <span className={`font-black text-lg ${sensor.aiRiskScore > 70 ? 'text-danger' : sensor.aiRiskScore > 40 ? 'text-warning' : 'text-success'}`}>
                                        {sensor.aiRiskScore}<span className="text-[10px] ml-0.5 opacity-50">%</span>
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-primary mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                📊 Click to view 7-day trend →
                            </p>
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
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {sensors.map(sensor => (
                        <Fragment key={sensor.id}>
                            {/* Heatmap circles (larger when heatmap mode) */}
                            {heatmapMode ? (
                                <Circle
                                    center={[sensor.lat, sensor.lng]}
                                    radius={sensor.status === 'danger' ? 4000 : sensor.status === 'warning' ? 2500 : 1500}
                                    pathOptions={{
                                        color: sensor.status === 'danger' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#10b981',
                                        fillColor: sensor.status === 'danger' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#10b981',
                                        fillOpacity: 0.25,
                                        weight: 0,
                                    }}
                                />
                            ) : (
                                <>
                                    {sensor.status !== 'safe' && (
                                        <Circle
                                            center={[sensor.lat, sensor.lng]}
                                            radius={sensor.status === 'danger' ? 1200 : 600}
                                            pathOptions={{
                                                color: sensor.status === 'danger' ? 'var(--danger)' : 'var(--warning)',
                                                fillColor: sensor.status === 'danger' ? 'var(--danger)' : 'var(--warning)',
                                                fillOpacity: 0.15,
                                                stroke: false
                                            }}
                                        />
                                    )}
                                    <Marker
                                        position={[sensor.lat, sensor.lng]}
                                        icon={sensor.status === 'danger' ? dangerIcon : sensor.status === 'warning' ? warningIcon : safeIcon}
                                        eventHandlers={{ click: () => openTrend(sensor) }}
                                    >
                                        <Popup className="custom-popup">
                                            <div className="p-2 min-w-[200px] bg-surface rounded-xl text-text border border-glass-border shadow-2xl">
                                                <h3 className="font-black text-lg border-b border-glass-border pb-3 mb-3 flex justify-between items-center">
                                                    {sensor.locationName}
                                                    <span className="text-text-muted text-[10px] font-medium opacity-50">#{sensor.id}</span>
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                                        <span>Status</span>
                                                        <span className={`${getStatusColor(sensor.status)} font-black uppercase text-xs`}>{sensor.status}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-text-muted">pH Level</span>
                                                        <span className="font-bold">{sensor.metrics.ph}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-text-muted">Turbidity</span>
                                                        <span className="font-bold">{sensor.metrics.turbidity} NTU</span>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-glass-border bg-primary/5 -mx-2 -mb-2 p-3 rounded-b-xl">
                                                        <div className="flex items-center gap-2 mb-1.5 text-primary">
                                                            <Cpu className="w-3.5 h-3.5" />
                                                            <span className="font-black text-[10px] uppercase tracking-wider">AI Risk: {sensor.aiRiskScore}%</span>
                                                        </div>
                                                        <p className="text-[11px] font-medium italic text-text-muted leading-relaxed">
                                                            "{sensor.aiInsight}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </>
                            )}
                        </Fragment>
                    ))}
                </MapContainer>
            </div>

            {/* Water Quality Trend Modal */}
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
                            className="bg-surface rounded-3xl shadow-2xl border border-glass-border w-full max-w-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-start p-6 border-b border-glass-border">
                                <div>
                                    <h3 className="font-black text-xl text-text">{selectedSensor.locationName}</h3>
                                    <p className="text-sm text-text-muted mt-0.5">7-Day Water Quality Trend</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-black uppercase rounded-xl ${getStatusBg(selectedSensor.status)} ${getStatusColor(selectedSensor.status)}`}>
                                        {selectedSensor.status}
                                    </span>
                                    <button
                                        id="trend-modal-close"
                                        onClick={() => setSelectedSensor(null)}
                                        className="p-2 rounded-xl hover:bg-primary/10 text-text-muted hover:text-primary transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* pH Trend */}
                                <div>
                                    <h4 className="text-sm font-black text-text mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-primary inline-block" /> pH Level (Safe: 6.5–8.5)
                                    </h4>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData}>
                                                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-text-muted opacity-50" />
                                                <YAxis domain={[5, 9]} fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-text-muted opacity-50" />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                                                <ChartTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
                                                <Line type="monotone" dataKey="ph" name="pH" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Risk Score Trend */}
                                <div>
                                    <h4 className="text-sm font-black text-text mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-warning inline-block" /> AI Risk Score (%)
                                    </h4>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData}>
                                                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-text-muted opacity-50" />
                                                <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} stroke="currentColor" className="text-text-muted opacity-50" />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                                                <ChartTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
                                                <Line type="monotone" dataKey="risk" name="Risk %" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
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
