import React from 'react';
import { ShieldAlert, Crown, Sliders, CalendarClock, Zap, FileText, Radio } from 'lucide-react';

export type ActiveTab = 
  | 'console' 
  | 'midi_manager'
  | 'runsheet' 
  | 'power' 
  | 'doc';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onEmergencyTrigger: () => void;
  isEmergencyActive: boolean;
  midiConnected: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onEmergencyTrigger,
  isEmergencyActive,
  midiConnected,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 no-print select-none shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Row 1 / Zone 1: Wordmark & Emergency Quick Trigger on mobile */}
        <div className="flex items-center justify-between gap-3">
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); setActiveTab('console'); }}
            className="text-sm sm:text-base font-black tracking-tight text-white hover:text-red-400 transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500/20 shrink-0" />
            <span>QUEENS VJ WORKSTATION</span>
          </a>

          {/* Emergency button visible on top right in mobile view */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onEmergencyTrigger}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 shadow ${
                isEmergencyActive
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-950/90 text-red-200 border border-red-700'
              }`}
              title="Okamžité núdzové tlmené červené orientačné svetlo"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-300 shrink-0" />
              <span>{isEmergencyActive ? 'NÚDZA' : 'Safe Red'}</span>
            </button>
          </div>
        </div>

        {/* Row 2 / Zone 2: Horizontal Scrollable Native Tabs for Mobile & Desktop */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-1 px-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'console'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Konzóla</span>
          </button>

          <button
            onClick={() => setActiveTab('midi_manager')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'midi_manager'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>MIDI Map</span>
            {midiConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('runsheet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'runsheet'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Run-Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('power')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'power'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>5V Napájanie</span>
          </button>

          <button
            onClick={() => setActiveTab('doc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'doc'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>WLED Docs &amp; JSON</span>
          </button>
        </nav>

        {/* Desktop Emergency Button */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onEmergencyTrigger}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 shadow ${
              isEmergencyActive
                ? 'bg-red-600 text-white animate-pulse shadow-red-600/50'
                : 'bg-red-950/80 text-red-200 border border-red-700 hover:bg-red-900'
            }`}
            title="Okamžité núdzové tlmené červené orientačné svetlo (Preset 10)"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{isEmergencyActive ? 'NÚDZA ZOPNUTÁ' : 'Safe Red (Núdza)'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
