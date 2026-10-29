import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Wind, 
  CloudSun, 
  ShieldAlert, 
  TrendingUp, 
  BookOpen, 
  Layers, 
  Menu, 
  X, 
  ExternalLink,
  Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', code: '01', icon: Layers },
  { path: '/air-quality', label: 'Air Quality', code: '02', icon: Wind },
  { path: '/weather', label: 'Weather & Context', code: '03', icon: CloudSun },
  { path: '/anomalies', label: 'Anomaly Lab', code: '04', icon: ShieldAlert },
  { path: '/forecast', label: 'Forecast Lab', code: '05', icon: TrendingUp },
  { path: '/methodology', label: 'Methodology', code: '06', icon: BookOpen },
];

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#000000] flex flex-col md:flex-row antialiased">
      {/* Top Mobile Bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] bg-[#FFFFFF] sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] animate-pulse" />
          <span className="font-mono text-xs tracking-widest font-bold text-[#14213D]">
            M.E.I. / MUMBAI
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded text-[#14213D] hover:bg-[#E5E5E5] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-[#FFFFFF] z-40 p-6 flex flex-col justify-between border-b border-[#E5E5E5] animate-fadeIn">
          <nav className="flex flex-col space-y-2">
            <span className="text-[10px] font-mono tracking-wider text-[#14213D]/60 uppercase mb-2">
              Observatory Modules
            </span>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-md text-sm transition-all ${
                    isActive 
                      ? 'bg-[#14213D] text-[#FFFFFF] font-semibold shadow-sm' 
                      : 'text-[#14213D] hover:bg-[#E5E5E5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[#FCA311]' : 'text-[#14213D]/70'} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`font-mono text-xs ${isActive ? 'text-[#FCA311]' : 'text-[#14213D]/50'}`}>
                    {item.code}
                  </span>
                </NavLink>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-[#E5E5E5] font-mono text-xs text-[#14213D]/70 space-y-1">
            <div>COVERAGE: AUG 2022 — OCT 2026</div>
            <div>STATUS: HISTORICAL RESEARCH ARCHIVE</div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Rail */}
      <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 bg-[#FFFFFF] border-r border-[#E5E5E5] shrink-0 sticky top-0 h-screen select-none shadow-xs">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] shadow-xs" />
            <span className="font-mono text-[11px] tracking-widest font-bold text-[#14213D]">
              M.E.I. / MUMBAI
            </span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-[#14213D]">
            Mumbai Environmental Intelligence
          </h1>
          <p className="text-[11px] text-[#14213D]/70 mt-1 italic">
            “Reading the city through its atmosphere.”
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono tracking-widest text-[#14213D]/60 uppercase font-semibold">
            Platform Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs transition-all ${
                  isActive
                    ? 'bg-[#14213D] text-[#FFFFFF] font-semibold shadow-md'
                    : 'text-[#14213D] hover:bg-[#E5E5E5] hover:text-[#000000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={16} 
                    className={isActive ? 'text-[#FCA311]' : 'text-[#14213D]/60 group-hover:text-[#14213D]'} 
                  />
                  <span>{item.label}</span>
                </div>
                <span className={`font-mono text-[10px] font-semibold ${isActive ? 'text-[#FCA311]' : 'text-[#14213D]/50'}`}>
                  {item.code}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Metadata & Provenance Footer */}
        <div className="p-5 border-t border-[#E5E5E5] bg-[#F4F6F9] text-[11px] space-y-3 font-mono">
          <div className="space-y-1 text-[#14213D]/80">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-[#14213D]">STATION</span>
              <span>MUMBAI (COASTAL)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span>AQI RECORDS</span>
              <span className="font-bold text-[#14213D]">1,545 OBS</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span>LAST RECORD</span>
              <span className="font-bold text-[#14213D]">27 OCT 2026</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
            <span className="text-[10px] text-[#14213D]/70 flex items-center gap-1 font-semibold">
              <Activity size={10} className="text-[#FCA311]" />
              RESEARCH ARCHIVE
            </span>
            <a 
              href="https://www.kaggle.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-bold text-[#14213D] hover:text-[#FCA311] hover:underline flex items-center gap-0.5"
            >
              DATA <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>

        {/* Global Academic Disclaimer Footer */}
        <footer className="border-t border-[#E5E5E5] bg-[#FFFFFF] px-6 py-6 text-xs text-[#14213D]/70">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-bold text-[#14213D]">
                Mumbai Environmental Intelligence (M.E.I.) — Smart-City Analytics
              </p>
              <p className="text-[11px] mt-0.5 text-[#14213D]/70">
                Analytical research platform for exploratory air quality and meteorological modeling. 
                Forecasts &amp; anomaly flags are diagnostic outputs, not official emergency advisories.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] shrink-0">
              <NavLink to="/methodology" className="hover:text-[#FCA311] text-[#14213D] font-semibold underline">
                Methodology &amp; Provenance
              </NavLink>
              <span>•</span>
              <span className="text-[#FCA311] font-bold bg-[#14213D] px-2 py-0.5 rounded">
                Isolation Forest + Holt–Winters
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
