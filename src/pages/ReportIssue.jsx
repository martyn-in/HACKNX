import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Send, AlertCircle, CheckCircle, Trophy, Star, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LEADERBOARD = [
    { name: 'Arjun Mehra', reports: 14, impact: '1,240L saved', rank: 1, points: 720, badge: '🥇' },
    { name: 'Priya K.', reports: 11, impact: '980L saved', rank: 2, points: 560, badge: '🥈' },
    { name: 'Siddharth S.', reports: 9, impact: '650L saved', rank: 3, points: 450, badge: '🥉' },
    { name: 'Meera V.', reports: 7, impact: '520L saved', rank: 4, points: 350, badge: '⭐' },
    { name: 'Ravi T.', reports: 5, impact: '380L saved', rank: 5, points: 250, badge: '⭐' },
];

export default function ReportIssue() {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [myPoints, setMyPoints] = useState(parseInt(localStorage.getItem('guardianPoints') || '0'));
    const [showPointsBurst, setShowPointsBurst] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);

            // Add points
            const newPoints = myPoints + 50;
            setMyPoints(newPoints);
            localStorage.setItem('guardianPoints', newPoints);
            setShowPointsBurst(true);

            setTimeout(() => setShowPointsBurst(false), 3000);
            setTimeout(() => setIsSuccess(false), 5000);
        }, 1500);
    };

    const getPointsBadge = (pts) => {
        if (pts >= 500) return { label: 'Platinum Guardian', color: 'from-purple-400 to-pink-500', icon: '💎' };
        if (pts >= 200) return { label: 'Gold Guardian', color: 'from-yellow-400 to-amber-500', icon: '🥇' };
        if (pts >= 100) return { label: 'Silver Guardian', color: 'from-slate-300 to-slate-500', icon: '🥈' };
        if (pts >= 50) return { label: 'Bronze Guardian', color: 'from-amber-600 to-orange-600', icon: '🥉' };
        return { label: 'Rookie Guardian', color: 'from-primary to-accent', icon: '🌊' };
    };

    const badge = getPointsBadge(myPoints);

    return (
        <div className="flex-grow p-6 lg:p-8 max-w-6xl mx-auto w-full">
            {/* Points Burst Notification */}
            <AnimatePresence>
                {showPointsBurst && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
                    >
                        <Zap className="w-5 h-5 animate-bounce" />
                        <div>
                            <p className="text-sm font-black">{t.report.pointsEarned}</p>
                            <p className="text-xs opacity-80">{t.report.pointsDesc}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 text-center"
                    >
                        <span className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
                            <AlertCircle className="w-8 h-8" />
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">{t.report.title}</h1>
                        <p className="text-text-muted max-w-2xl mx-auto">{t.report.desc}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-3xl p-6 md:p-10 shadow-xl"
                    >
                        {isSuccess ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="w-10 h-10 text-success" />
                                </div>
                                <h2 className="text-2xl font-bold text-text mb-2">{t.report.successTitle}</h2>
                                <p className="text-text-muted max-w-sm mb-4">{t.report.successDesc}</p>
                                <div className="flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black mb-6">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span>+50 {t.report.pointsEarned}</span>
                                </div>
                                <button
                                    onClick={() => setIsSuccess(false)}
                                    className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-accent transition-colors"
                                >
                                    {t.report.submitAnother}
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-text">{t.report.issueType}</label>
                                        <select required className="w-full px-4 py-3 rounded-xl border border-glass-border bg-surface/70 focus:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text">
                                            <option value="">Select an issue...</option>
                                            <option value="leak">Pipeline Leakage</option>
                                            <option value="contamination">Water Contamination / Dirty Water</option>
                                            <option value="sanitation">Sanitation Infrastructure Failure</option>
                                            <option value="shortage">Severe Water Shortage</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-text">{t.report.location}</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                            <input
                                                type="text"
                                                required
                                                defaultValue="Chennai City Center, Zone A"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-glass-border bg-surface/50 text-text-muted cursor-not-allowed outline-none"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text">{t.report.description}</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder={t.report.descPlaceholder}
                                        className="w-full px-4 py-3 rounded-xl border border-glass-border bg-surface/70 focus:bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text resize-none"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-text">{t.report.photoEvidence}</label>
                                    <div className="border-2 border-dashed border-glass-border rounded-2xl p-8 text-center hover:bg-surface/30 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                                            <Camera className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-medium text-text">{t.report.upload}</p>
                                        <p className="text-xs text-text-muted mt-1">{t.report.uploadSub}</p>
                                    </div>
                                </div>

                                {/* Points Preview */}
                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <Zap className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-bold text-text">Earn +50 Guardian Points</p>
                                        <p className="text-xs text-text-muted">Submitting this report adds to your community impact score.</p>
                                    </div>
                                </div>

                                <button
                                    id="submit-report-btn"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            {t.report.submit}
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>

                {/* Guardian Sidebar */}
                <div className="space-y-6">
                    {/* My Guardian Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden"
                    >
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${badge.color} opacity-20 blur-2xl`} />
                        <h3 className="text-sm font-black uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" /> My Guardian Status
                        </h3>
                        <div className="text-center">
                            <div className="text-5xl mb-3">{badge.icon}</div>
                            <div className={`text-2xl font-black bg-gradient-to-r ${badge.color} bg-clip-text text-transparent mb-1`}>
                                {myPoints}
                            </div>
                            <p className="text-sm text-text-muted font-semibold">Guardian Points</p>
                            <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-black text-white bg-gradient-to-r ${badge.color}`}>
                                {badge.label}
                            </div>
                        </div>

                        {/* Progress to next tier */}
                        {myPoints < 500 && (
                            <div className="mt-4 pt-4 border-t border-glass-border">
                                <div className="flex justify-between text-xs text-text-muted font-semibold mb-2">
                                    <span>Progress to next tier</span>
                                    <span>{myPoints % 100}/100 pts</span>
                                </div>
                                <div className="w-full bg-glass-border rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(myPoints % 100)}%` }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                        className={`h-2 rounded-full bg-gradient-to-r ${badge.color}`}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Leaderboard */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-3xl p-6 shadow-xl"
                    >
                        <h3 className="text-sm font-black uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" /> {t.report.leaderboard}
                        </h3>
                        <div className="space-y-3">
                            {LEADERBOARD.map((guardian, i) => (
                                <motion.div
                                    key={guardian.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.08 }}
                                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${i === 0 ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-surface/50 border border-glass-border'}`}
                                >
                                    <span className="text-xl">{guardian.badge}</span>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-text text-sm truncate">{guardian.name}</p>
                                        <p className="text-xs text-text-muted">{guardian.reports} reports · {guardian.impact}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-primary font-black text-sm">{guardian.points}</span>
                                        <p className="text-[10px] text-text-muted">pts</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
