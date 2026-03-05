import { motion } from 'framer-motion';
import { ArrowRight, Droplets, Activity, Globe2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
    { id: 1, name: 'People lack safe drinking water', value: '2.2 Billion', icon: Globe2 },
    { id: 2, name: 'Deaths annually from dirty water', value: '1.2 Million', icon: Activity },
    { id: 3, name: 'Global wastewater untreated', value: '80%', icon: Droplets },
];

const features = [
    {
        name: 'Real-time Water Quality',
        description: 'Monitor water safety indicators instantly across thousands of connected sensors.',
        icon: Activity,
    },
    {
        name: 'AI Risk Prediction',
        description: 'Anticipate contamination events before they reach communities using machine learning.',
        icon: Shield,
    },
    {
        name: 'Community Reporting',
        description: 'Empower citizens to crowdsource reports on leaks and sanitation failures.',
        icon: Globe2,
    },
];

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative px-6 lg:px-8 mt-16 md:mt-24 pb-16">
                <div className="mx-auto max-w-5xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Solving SDG 6: Clean Water & Sanitation
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text mb-8 leading-tight">
                            Safeguarding Every Drop with
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                                Artificial Intelligence
                            </span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl leading-8 text-text-muted max-w-3xl mx-auto">
                            AquaGuardian is a startup-grade platform that combines IoT sensor integration, community crowdsourcing, and predictive AI to map, monitor, and manage the world's most precious resource.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/map"
                                className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-accent transition-all hover:scale-105 active:scale-95"
                            >
                                View Live Map
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/report"
                                className="rounded-xl px-6 py-3.5 text-sm font-semibold text-text border border-glass-border bg-surface/50 backdrop-blur-md hover:bg-surface hover:text-primary transition-all shadow-sm"
                            >
                                Report an Issue
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Global Crisis Section (Stats) */}
            <section className="py-16 relative z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="glass p-8 md:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300"
                    >
                        <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-danger/20 rounded-full blur-[80px]"></div>

                        <div className="mx-auto max-w-2xl lg:max-w-none relative z-10">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black tracking-tight text-text sm:text-4xl">The Global Water Crisis</h2>
                                <p className="mt-4 text-lg text-text-muted">
                                    Clean water is a human right, yet billions suffer from lack of access and unsafe sanitation.
                                </p>
                            </div>
                            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={stat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="flex flex-col items-center bg-surface/50 rounded-2xl p-6 border border-glass-border hover:bg-surface transition-colors duration-300 shadow-sm"
                                    >
                                        <stat.icon className="w-10 h-10 text-danger mb-4" />
                                        <dd className="text-4xl font-extrabold tracking-tight text-text mb-2 tabular-nums">{stat.value}</dd>
                                        <dt className="text-base text-text-muted font-medium text-center">{stat.name}</dt>
                                    </motion.div>
                                ))}
                            </dl>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features & Solution Section */}
            <section className="py-24 relative transition-colors duration-300">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center mb-16">
                        <h2 className="text-base font-bold leading-7 text-primary font-bold uppercase tracking-widest">The Solution</h2>
                        <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-text">
                            Everything you need to manage water ecosystems
                        </p>
                    </div>
                    <div className="mx-auto max-w-2xl lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col glass p-8 rounded-3xl border border-glass-border shadow-lg shadow-black/5"
                                >
                                    <dt className="flex items-center gap-x-3 text-lg font-bold leading-7 text-text mb-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="flex flex-auto flex-col text-base leading-7 text-text-muted transition-colors duration-300">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            {/* Guardian Community & Impact Tracker */}
            <section className="py-24 bg-surface/30 relative border-y border-glass-border transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-black text-text mb-6">Citizen <span className="text-primary italic">Guardians</span></h2>
                            <p className="text-lg text-text-muted mb-8 leading-relaxed">
                                Our platform rewards community action. By reporting leaks and monitoring quality, these top guardians have saved thousands of liters of fresh water this month.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { name: 'Arjun Mehra', reports: 14, impact: '1,240L saved', rank: 1 },
                                    { name: 'Priya K.', reports: 11, impact: '980L saved', rank: 2 },
                                    { name: 'Siddharth S.', reports: 9, impact: '650L saved', rank: 3 },
                                ].map((guardian) => (
                                    <div key={guardian.name} className="flex items-center gap-4 bg-surface/80 p-5 rounded-2xl shadow-lg border border-glass-border backdrop-blur-sm transition-colors duration-300">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${guardian.rank === 1 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/30' : 'bg-primary/10 text-primary'}`}>
                                            {guardian.rank}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-text text-lg">{guardian.name}</h4>
                                            <p className="text-xs text-text-muted uppercase tracking-wider">{guardian.reports} verified reports</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-primary font-black text-lg">{guardian.impact}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-surface p-12 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-glass-border text-center relative overflow-hidden transition-colors duration-300"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

                            <Droplets className="w-16 h-16 text-primary mx-auto mb-8 animate-bounce" />
                            <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-4">Total Community Impact</h3>
                            <div className="text-7xl font-black text-text mb-2 tabular-nums tracking-tight">142,850</div>
                            <p className="text-primary font-black text-xl uppercase tracking-[0.2em]">Liters Saved Today</p>

                            <div className="mt-10 pt-10 border-t border-glass-border grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-3xl font-black text-text tracking-tight">840</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">Leaks Fixed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-text tracking-tight">12,400</div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mt-1">Citizens Active</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Impact CTA Section */}
            <section className="py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-primary to-accent rounded-[3.5rem] p-8 md:p-20 text-center shadow-2xl shadow-primary/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50"></div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-8 relative z-10">
                            Ready to make an impact?
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg md:text-xl text-white mb-12 relative z-10">
                            Join local authorities, NGOs, and communities worldwide in utilizing AquaGuardian to secure a sustainable future for water resources.
                        </p>
                        <div className="relative z-10 flex justify-center gap-4">
                            <Link
                                to="/dashboard"
                                className="rounded-2xl bg-white px-10 py-5 text-base font-bold text-primary shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                            >
                                Open Analytics Dashboard
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
