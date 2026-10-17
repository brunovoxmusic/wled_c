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
    <header className="sticky top-0 z-50 flex items-center justify-between gap-6 px-5 py-3 bg-slate-900/95 backdrop-blur border-b border-slate-800 no-print select-none">
      {/* Zone 1: Single text wordmark with subtle Crown icon */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setActiveTab('console'); }}
          className="text-base sm:text-lg font-black tracking-tight text-white hover:text-red-400 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Crown className="w-5 h-5 text-red-500 fill-red-500/20 shrink-0" />
          <span>QUEENS VJ WORKSTATION</span>
        </a>
        <span className="text-[11px] font-mono text-slate-400 hidden xl:inline-block border-l border-slate-800 pl-2.5">
          Púchov Stage &middot; 792 LED &middot; 3× ESP32
        </span>
      </div>

      {/* Zone 2: Streamlined high-visibility native tabs */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'console'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Live Konzóla</span>
        </button>

        <button
          onClick={() => setActiveTab('midi_manager')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'midi_manager'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>MIDI Mapovanie</span>
          {midiConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('runsheet')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'runsheet'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Run-Sheet Noci</span>
        </button>

        <button
          onClick={() => setActiveTab('power')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'power'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>5V Napájanie &amp; Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('doc')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'doc'
              ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dokumentácia &amp; JSON</span>
        </button>
      </nav>

      {/* Zone 3: 1 tactile Primary Action (Emergency Safe Red) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEmergencyTrigger}
          className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 shadow ${
            isEmergencyActive
              ? 'bg-red-600 text-white animate-pulse shadow-red-600/50'
              : 'bg-red-950/80 text-red-200 border border-red-800 hover:bg-red-900'
          }`}
          title="Okamžité núdzové tlmené červené orientačné svetlo (Preset 10)"
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">{isEmergencyActive ? 'NÚDZA ZOPNUTÁ' : 'Safe Red (Núdza)'}</span>
          <span className="sm:hidden">NÚDZA</span>
        </button>
      </div>
    </header>
  );
};
