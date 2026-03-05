import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import AdminPanel from './pages/AdminPanel';
import AquaBot from './components/AquaBot';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative w-full transition-colors duration-300 bg-background text-text">
          {/* Decorative background elements */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
          </div>

          <Navbar toggleTheme={toggleTheme} theme={theme} />

          <main className="flex-grow flex flex-col w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>

          {/* Global AquaBot Chatbot */}
          <AquaBot />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
