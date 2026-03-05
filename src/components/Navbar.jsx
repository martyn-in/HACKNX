import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Map as MapIcon, BarChart3, AlertTriangle, ShieldCheck, Sun, Moon, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ toggleTheme, theme }) => {
    const location = useLocation();
    const { lang, setLanguage, t } = useLanguage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    const navLinks = [
        { name: t.nav.home, path: '/', icon: <Droplets className="w-5 h-5" /> },
        { name: t.nav.map, path: '/map', icon: <MapIcon className="w-5 h-5" /> },
        { name: t.nav.dashboard, path: '/dashboard', icon: <BarChart3 className="w-5 h-5" /> },
        { name: t.nav.report, path: '/report', icon: <AlertTriangle className="w-5 h-5" /> },
        { name: t.nav.admin, path: '/admin', icon: <ShieldCheck className="w-5 h-5" /> },
    ];

    const languages = [
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-glass-border shadow-sm backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            AquaGuardian
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <nav className="flex space-x-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text'
                                            }`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="h-6 w-px bg-glass-border mx-2" />

                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                id="lang-toggle"
                                onClick={() => setLangOpen(o => !o)}
                                className="flex items-center gap-1.5 p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                                aria-label="Switch language"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase">{lang}</span>
                            </button>
                            <AnimatePresence>
                                {langOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute right-0 top-12 glass rounded-2xl shadow-2xl border border-glass-border overflow-hidden min-w-[140px]"
                                    >
                                        {languages.map(l => (
                                            <button
                                                key={l.code}
                                                id={`lang-${l.code}`}
                                                onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/10 ${lang === l.code ? 'text-primary font-bold' : 'text-text'}`}
                                            >
                                                <span>{l.flag}</span> {l.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            id="mobile-menu-toggle"
                            onClick={() => setMenuOpen(o => !o)}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-glass-border overflow-hidden"
                    >
                        <nav className="p-4 space-y-1">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/20 text-primary' : 'text-text hover:bg-primary/10 hover:text-primary'}`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Language Switcher Mobile */}
                            <div className="pt-3 border-t border-glass-border flex gap-2 flex-wrap">
                                {languages.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => { setLanguage(l.code); setMenuOpen(false); }}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${lang === l.code ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                    >
                                        {l.flag} {l.label}
                                    </button>
                                ))}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
