import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Droplets } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Multiple varied responses per topic (rotated to avoid repetition)
const botResponsePool = {
    ph: [
        "💧 The ideal pH for drinking water is **6.5 to 8.5**. Values below 6 indicate acidity — which can corrode pipes and leach metals like lead into your water. Our sensors auto-flag anything outside this range.",
        "🔬 pH stands for 'potential of Hydrogen'. A reading of 7 is neutral; anything lower is acidic, higher is alkaline. Regular tap water should sit between **6.5–8.5** for safe human consumption.",
        "⚗️ Acidic water (pH < 6.5) can cause a metallic or sour taste and may dissolve heavy metals from plumbing. Highly alkaline water (pH > 8.5) may indicate mineral contamination. Our AI flags spikes in real time.",
        "📊 Fun fact: Rainwater is naturally slightly acidic (pH ~5.6) due to CO₂. By the time water reaches your tap, treatment processes raise it to a safe 6.5–8.5. If our sensors show departures from this, an alert is triggered immediately.",
    ],
    turbidity: [
        "🌊 Turbidity measures water cloudiness from suspended particles like silt, algae, or bacteria. Safe drinking water must be **below 4 NTU**. Anything higher can harbor pathogens that survive standard chlorination.",
        "🔭 High turbidity isn't just a visual problem — particles can shield bacteria and viruses from disinfectants. Our sensors measure NTU continuously, and readings above 4 NTU trigger a **warning alert** automatically.",
        "🪨 Turbidity spikes often appear after heavy rainfall, when runoff carries sediment into reservoirs. Our AI cross-references rainfall data with turbidity readings to predict contamination events **24–48 hours in advance**.",
        "📉 A sudden turbidity increase in a previously clear source is a red flag. It could mean upstream construction, a sewage breach, or pipe damage. If you notice cloudy water at home, report it on our Report Issue page immediately!",
    ],
    contamination: [
        "☣️ Water contamination can come from: industrial discharge (heavy metals, chemicals), agricultural runoff (pesticides, nitrates), aging pipes (lead, copper), or illegal sewage dumping. Each has a distinct sensor signature our AI is trained to detect.",
        "🏭 Industrial contamination is especially dangerous because heavy metals like arsenic, lead, and mercury accumulate in the body over time. Our sensor network flags unusual conductivity and chemical readings that indicate industrial pollutants.",
        "🌾 Agricultural runoff is the #1 source of water contamination in South India. Nitrate levels above 10 mg/L are unsafe for infants. Our dashboard tracks nitrate patterns across growing seasons and issues early warnings.",
        "🚰 If your water has a foul smell (rotten egg = hydrogen sulfide, chlorine smell = over-treatment, musty = algae), unusual color (brown = rust/sediment, blue-green = copper/algae), or strange taste — report it immediately! Don't drink it.",
    ],
    report: [
        "📝 To report a water issue: tap **'Report Issue'** in the navbar → choose the issue type → describe what you're seeing → optionally upload a photo → submit. Your report goes directly to the municipal water authority.",
        "🚨 Reporting takes less than 2 minutes! Every verified report earns you **+50 Guardian Points** and helps authorities prioritize repairs. The more detail you provide (location, time, photos), the faster the response.",
        "📸 Pro tip: when reporting, include a photo of the water, your location, and the time you first noticed the issue. This dramatically speeds up investigation. You'll earn Guardian Points and can track your report's status.",
        "👩‍💼 Reports submitted through AquaGuardian are routed to the nearest municipal authority and are classified by AI into priority levels. Danger-level reports get escalated to emergency response teams within 2 hours.",
    ],
    safe: [
        "✅ Water is safe to drink when: pH is 6.5–8.5 ✓, turbidity is below 4 NTU ✓, no harmful bacteria (E. coli = 0 CFU/100mL) ✓, nitrates below 10 mg/L ✓, and our AI Risk Score is below **40%** ✓.",
        "🛡️ The WHO defines safe drinking water by 4 criteria: (1) Free from pathogens, (2) No toxic chemicals, (3) Acceptable taste/smell/appearance, (4) No radioactive substances. Our sensors track all measurable indicators in real time.",
        "⚠️ Even visually clear water can be unsafe — many contaminants are invisible. Always check sensor readings for your area on the Risk Map before drinking from an unfamiliar source. When in doubt, boil or filter first.",
        "🧪 Boiling kills bacteria and viruses but does NOT remove heavy metals or chemical contaminants. If our map shows a 'danger' rating in your area, boiling alone is not enough — use a certified filtration system or bottled water.",
    ],
    sensor: [
        "📡 AquaGuardian's IoT sensors measure 8 parameters in real time: **pH, turbidity, dissolved oxygen, temperature, conductivity, nitrates, heavy metals, and microbial activity**. Data is uploaded to our cloud every 5 minutes.",
        "🔧 Our weather-proof sensors are installed at water treatment plants, river intake points, distribution nodes, and community taps. Each unit has a 2-year battery life and connects via cellular or LoRa networks.",
        "🤖 Sensor data feeds directly into our AI engine, which uses a trained model to predict contamination events 24–48 hours in advance. The model was trained on 3 years of water quality data from 200 cities across India.",
        "⚡ When a sensor detects out-of-range values, it triggers a 3-tier alert: Yellow (Warning — monitor), Orange (High Risk — prepare), Red (Danger — avoid consumption and report). Authorities get SMS + dashboard notifications instantly.",
    ],
    map: [
        "🗺️ The Risk Map plots **100+ live sensor nodes** across South India. 🟢 Green = Safe (AI risk < 40%), 🟠 Orange = Warning (40–70%), 🔴 Red = Danger (>70%). Click any node to view live readings + 7-day trends.",
        "📍 You can toggle between **Marker Mode** (individual sensor dots) and **Heatmap Mode** (colored zones showing contamination density). Heatmap mode is great for spotting regional patterns at a glance.",
        "🔍 Each map marker shows pH, turbidity, AI risk score, and a natural language AI insight like 'Sediment influx detected — likely upstream runoff'. Click a sensor card in the sidebar to see a 7-day pH and risk chart.",
        "🌐 The map is centered on South India (Bangalore, Chennai, Hyderabad, Kochi), with sensors spread across 18+ cities. We're expanding to North India in Q3 2025. You can zoom, pan, and click freely to explore.",
    ],
    guardian: [
        "🏅 The Guardian Points system rewards community action! Submit a water issue report → earn **+50 points**. Reach 100 pts = Bronze Guardian 🥉, 200 pts = Silver 🥈, 500 pts = Gold 🥇, 500+ pts = Platinum 💎.",
        "🌟 Guardian Points are persistent — they're saved to your device. Top guardians appear on the **Community Leaderboard** on the Report Issue page. The #1 guardian this month saved over 1,240 liters of fresh water!",
        "🎖️ Your Guardian tier unlocks recognition in the app. Platinum Guardians (500+ pts) get a special badge and are featured in our monthly community impact report shared with partner NGOs and authorities.",
        "📊 Each report you submit has a measurable impact. On average, 1 verified leak report leads to **148 liters** of water saved per day until fixed. Your Guardian Points reflect your real-world environmental impact.",
    ],
    temperature: [
        "🌡️ Water temperature affects the solubility of oxygen and the growth of pathogens. Warmer water holds less dissolved oxygen, which harms aquatic life. Our sensors track temperature and flag readings above **30°C** in drinking water sources.",
        "🔥 Elevated water temperature can accelerate bacterial growth (especially Legionella in pipes above 20°C) and increase chemical reaction rates. Our AI correlates temperature spikes with other parameters to detect compounding risks.",
    ],
    oxygen: [
        "💨 Dissolved Oxygen (DO) is critical for aquatic ecosystems. Healthy rivers need **>6 mg/L** of DO. Low DO (hypoxia) kills fish and indicates organic pollution — often from sewage or agricultural waste decomposition.",
        "🐟 DO levels below 2 mg/L create 'dead zones' where almost nothing can survive. Our sensors detect DO drops in real time and correlate with upstream discharge events. Low DO often precedes other contamination indicators.",
    ],
    hello: [
        "👋 Hello! I'm AquaBot, your AI water quality assistant. I can answer questions about: pH levels, turbidity, contamination types, how to report issues, the sensor network, Guardian Points, or the Risk Map. What's on your mind? 🌊",
        "🌊 Hi there! Great to see you. Ask me anything about AquaGuardian — the sensor network, water safety standards, how to earn Guardian Points, or what the map colors mean. I'm here to help!",
        "💧 Hey! I'm AquaBot. Water safety is my specialty. You can ask me about contamination risks, what makes water unsafe, how our IoT sensors work, or how to use the platform. Fire away!",
    ],
    help: [
        "🔍 Here's what I can help with:\n• 💧 Water quality (pH, turbidity, DO)\n• ☣️ Contamination types & causes\n• 🗺️ How to read the Risk Map\n• 📝 How to report an issue\n• 🏅 Guardian Points & leaderboard\n• 📡 How IoT sensors work\n\nJust ask anything!",
        "📚 Topic ideas you can ask me about:\n1. 'What is a safe pH level?'\n2. 'How do I report contamination?'\n3. 'What does turbidity mean?'\n4. 'How does the heatmap work?'\n5. 'How do I earn Guardian Points?'\n6. 'Is my area's water safe?'",
    ],
    default: [
        "🤔 Interesting question! I'm best at answering about water quality (pH, turbidity, contamination), how to use AquaGuardian (map, sensors, reporting), or Guardian Points. Could you rephrase, or try one of those topics?",
        "💬 I didn't quite catch that — I specialize in water quality topics. Try asking about pH levels, turbidity, contamination, the Risk Map, sensor data, or Guardian Points. I'll give you detailed answers! 🌊",
        "🌊 I'm still learning! For best results, ask me about: water safety standards, contamination risks, how to report issues, how the sensor network works, or how Guardian Points are earned.",
        "🔬 That's outside my current knowledge zone! I focus on water quality science and the AquaGuardian platform. Try: 'What is a safe pH?', 'How does turbidity affect health?', or 'How do I earn Guardian Points?'",
    ],
};

// Track how many times each topic has been asked to rotate responses
const topicCounters = {};

const getResponse = (msg) => {
    const lower = msg.toLowerCase();

    let topic = 'default';
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('namaste') || lower.includes('hola')) topic = 'hello';
    else if (lower.includes('help') || lower.includes('what can') || lower.includes('how do') || lower.includes('guide')) topic = 'help';
    else if (lower.includes('ph') || lower.includes('acid') || lower.includes('alkaline')) topic = 'ph';
    else if (lower.includes('turbid') || lower.includes('cloudy') || lower.includes('ntu') || lower.includes('clear')) topic = 'turbidity';
    else if (lower.includes('oxygen') || lower.includes(' do ') || lower.includes('dissolved')) topic = 'oxygen';
    else if (lower.includes('temp') || lower.includes('hot') || lower.includes('warm') || lower.includes('cold')) topic = 'temperature';
    else if (lower.includes('contamin') || lower.includes('pollut') || lower.includes('dirty') || lower.includes('smell') || lower.includes('color') || lower.includes('taste')) topic = 'contamination';
    else if (lower.includes('report') || lower.includes('submit') || lower.includes('issue') || lower.includes('complain')) topic = 'report';
    else if (lower.includes('safe') || lower.includes('drink') || lower.includes('potable') || lower.includes('boil') || lower.includes('filter')) topic = 'safe';
    else if (lower.includes('sensor') || lower.includes('iot') || lower.includes('monitor') || lower.includes('device')) topic = 'sensor';
    else if (lower.includes('map') || lower.includes('marker') || lower.includes('node') || lower.includes('heatmap') || lower.includes('red') || lower.includes('green')) topic = 'map';
    else if (lower.includes('guardian') || lower.includes('point') || lower.includes('leaderboard') || lower.includes('badge') || lower.includes('rank')) topic = 'guardian';

    const pool = botResponsePool[topic];
    topicCounters[topic] = ((topicCounters[topic] || 0) + 1) % pool.length;
    return pool[topicCounters[topic]];
};

export default function AquaBot() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: t.chatbot.greeting, ts: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const send = () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(m => [...m, { role: 'user', text: userMsg, ts: Date.now() }]);
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMessages(m => [...m, { role: 'bot', text: getResponse(userMsg), ts: Date.now() }]);
        }, 900 + Math.random() * 600);
    };

    const handleKey = (e) => { if (e.key === 'Enter') send(); };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                id="aquabot-toggle"
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[2000] w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-xl shadow-primary/40 flex items-center justify-center text-white"
                aria-label="Open AquaBot chat"
            >
                <AnimatePresence mode="wait">
                    {open
                        ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6" /></motion.div>
                        : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle className="w-6 h-6" /></motion.div>
                    }
                </AnimatePresence>
                {!open && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-[1999] w-80 md:w-96 glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-glass-border"
                        style={{ height: '480px' }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 border-b border-glass-border bg-gradient-to-r from-primary/20 to-accent/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
                                <Droplets className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-text text-sm">{t.chatbot.title}</p>
                                <p className="text-[11px] text-success font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-success rounded-full inline-block animate-pulse" />
                                    {t.chatbot.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-gradient-to-br from-primary to-accent text-white rounded-br-md shadow-md'
                                        : 'bg-surface text-text border border-glass-border rounded-bl-md shadow-sm'
                                        }`}>
                                        {m.text}
                                    </div>
                                </motion.div>
                            ))}
                            {typing && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-surface border border-glass-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center shadow-sm">
                                        {[0, 1, 2].map(i => (
                                            <motion.span
                                                key={i}
                                                className="w-2 h-2 bg-primary rounded-full"
                                                animate={{ y: [0, -4, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-glass-border flex gap-2">
                            <input
                                id="aquabot-input"
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={t.chatbot.placeholder}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-glass-border text-text text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <motion.button
                                id="aquabot-send"
                                onClick={send}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-md disabled:opacity-50"
                                disabled={!input.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
