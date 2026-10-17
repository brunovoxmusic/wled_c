import React, { useState } from 'react';
import { 
  Zap, 
  Crown, 
  Moon, 
  ShieldAlert, 
  Sliders, 
  Radio, 
  Layers, 
  Sparkles,
  Volume2,
  Settings2,
  Activity,
  Check,
  RotateCcw,
  Eye
} from 'lucide-react';
import { WLED_PRESETS, WledPreset } from '../data/wledData';

interface LiveConsoleProps {
  currentPreset: WledPreset;
  onSelectPreset: (preset: WledPreset) => void;
  onEmergencyTrigger: () => void;
  isEmergencyActive: boolean;
  audioEnergy: number;
  onAudioEnergyUpdate: (energy: number) => void;
  onOpenMidiManager?: () => void;
  // MIDI props from useMidi hook
  midiState: {
    isConnected: boolean;
    devices: string[];
    learningControlId: string | null;
    startLearning: (id: string) => void;
    mappings: Record<string, any>;
    resetToDefaults: () => void;
    lastEvent: any;
    sendVirtualMidi: (type: 'note' | 'cc', number: number, value?: number) => void;
  };
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({
  currentPreset,
  onSelectPreset,
  onEmergencyTrigger,
  isEmergencyActive,
  audioEnergy,
  onAudioEnergyUpdate,
  onOpenMidiManager,
  midiState,
}) => {
  const [masterBrightness, setMasterBrightness] = useState<number>(currentPreset.brightnessPct);
  const [masterSpeed, setMasterSpeed] = useState<number>(currentPreset.speed);
  const [isDropActive, setIsDropActive] = useState<boolean>(false);
  const [isBlackoutActive, setIsBlackoutActive] = useState<boolean>(false);
  const [showMidiDrawer, setShowMidiDrawer] = useState<boolean>(false);
  const [bpmMode, setBpmMode] = useState<'concert' | 'disco' | 'peak'>('disco');

  // Trigger Drop Flash
  const handleTriggerDropFlash = () => {
    setIsDropActive(true);
    setIsBlackoutActive(false);
    const dropPreset = WLED_PRESETS.find(p => p.code === '07_drop_stark_red') || WLED_PRESETS[6];
    onSelectPreset(dropPreset);

    setTimeout(() => {
      setIsDropActive(false);
      const returnPreset = WLED_PRESETS.find(p => p.code === '05_peak_disco_crown') || WLED_PRESETS[4];
      onSelectPreset(returnPreset);
    }, 1000);
  };

  // Trigger Blackout
  const handleToggleBlackout = () => {
    if (isBlackoutActive) {
      setIsBlackoutActive(false);
      onSelectPreset(currentPreset);
    } else {
      setIsBlackoutActive(true);
      // Temporary zero brightness
      const blackoutPreset = WLED_PRESETS.find(p => p.code === '01_door_royal_glow') || WLED_PRESETS[0];
      onSelectPreset({ ...blackoutPreset, brightnessPct: 0 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Top Native Control Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm tracking-tight">
                QUEENS LIVE VJ CONSOLE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950 text-red-400 border border-red-800/80">
                STAGE 792 LED
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Aktívny preset: <strong className="text-white">{currentPreset.name}</strong></span>
              <span>&middot;</span>
              <span>WLED #{currentPreset.effectId} ({currentPreset.effectName})</span>
            </div>
          </div>
        </div>

        {/* Right: Quick BPM & MIDI Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* BPM selector buttons */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => { setBpmMode('concert'); onAudioEnergyUpdate(0.5); }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                bpmMode === 'concert'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              112 Live
            </button>
            <button
              onClick={() => { setBpmMode('disco'); onAudioEnergyUpdate(0.85); }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                bpmMode === 'disco'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              128 Disco
            </button>
            <button
              onClick={() => { setBpmMode('peak'); onAudioEnergyUpdate(1.0); }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                bpmMode === 'peak'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              145 Peak
            </button>
          </div>

          {/* MIDI Drawer Button */}
          <button
            onClick={() => setShowMidiDrawer(!showMidiDrawer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1.5 transition-all ${
              midiState.learningControlId
                ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-bold'
                : showMidiDrawer
                ? 'bg-slate-800 text-white border-slate-600'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>
              {midiState.learningControlId 
                ? 'MIDI LEARN AKTÍVNY' 
                : 'MIDI Mappovanie'}
            </span>
            {midiState.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* MIDI Drawer / Mapping Toolbar (Expandable) */}
      {showMidiDrawer && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2.5 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono font-bold uppercase text-white">
                Web MIDI Learn &amp; Hardware Kontrolér (Akai APC / Launchpad / Traktor)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenMidiManager && (
                <button
                  onClick={onOpenMidiManager}
                  className="px-2.5 py-1 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 rounded flex items-center gap-1 shadow"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Tabuľka Mapovania
                </button>
              )}
              <button
                onClick={midiState.resetToDefaults}
                className="px-2.5 py-1 text-xs font-mono text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded flex items-center gap-1"
                title="Obnoviť predvolené mapovanie pre Launchpad / Akai APC"
              >
                <RotateCcw className="w-3 h-3" />
                Predvolený Launchpad Layout
              </button>
            </div>
          </div>

          {/* Connected Device Telemetry & Virtual Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Detegované MIDI vstupy:</span>
              <div className="text-emerald-400 font-semibold truncate">
                {midiState.devices.length > 0 
                  ? midiState.devices.join(', ') 
                  : 'Žiadne hardvérové MIDI zariadenie nepripojené (aktívny virtuálny režim)'}
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px] mb-1">Posledný zachytený MIDI signál:</span>
              <div className="text-amber-400 font-semibold truncate">
                {midiState.lastEvent ? midiState.lastEvent.rawStr : 'Čakám na MIDI správu (stlačte pad alebo otočte knob)...'}
              </div>
            </div>
          </div>

          {/* Quick Virtual MIDI Test Bar */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Virtuálny MIDI test (kliknutie odošle MIDI správu):</span>
            {[
              { label: 'Note 36 (Preset 1)', note: 36 },
              { label: 'Note 40 (Preset 5 Crown)', note: 40 },
              { label: 'Note 42 (Drop Flash)', note: 48 },
              { label: 'Note 49 (Blackout)', note: 49 },
            ].map(test => (
              <button
                key={test.note}
                onClick={() => midiState.sendVirtualMidi('note', test.note, 127)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
              >
                {test.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2 rounded border border-slate-800">
            <strong>Ako namappovať kontrolér:</strong> Kliknite na tlačidlo <span className="text-amber-400 font-bold">[MAP]</span> na ktoromkoľvek pade alebo fadere nižšie a následne stlačte tlačidlo na vašom MIDI kontroléri. Mapovanie sa okamžite uloží.
          </div>
        </div>
      )}

      {/* MASTER ACTION ROW: 3 Large Tactile Action Pads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* BIG DROP STARK RED PAD */}
        <button
          onClick={handleTriggerDropFlash}
          disabled={isDropActive}
          className={`p-4 rounded-xl font-mono text-left border-2 transition-all relative overflow-hidden flex flex-col justify-between h-28 group ${
            isDropActive
              ? 'bg-red-600 border-white text-white shadow-2xl shadow-red-600/70 scale-[0.98]'
              : 'bg-red-950/80 border-red-700 text-red-100 hover:bg-red-900 hover:border-red-500 shadow-lg shadow-red-950/50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 text-white">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              DROP STARK RED (1s)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 border border-white/20 text-white font-mono">
              {midiState.mappings['action_drop_flash'] ? `MIDI N#${midiState.mappings['action_drop_flash'].number}` : 'MIDI MAP'}
            </span>
          </div>

          <div>
            <div className="text-lg font-black tracking-tight text-white">
              {isDropActive ? 'DROP FLASH AKTÍVNY!' : 'DISCO DROP PULSE'}
            </div>
            <div className="text-[11px] text-red-200/90 font-sans mt-0.5">
              1-sekundový úder plnej kráľovskej červenej &middot; Zákaz bielej na DJ
            </div>
          </div>

          <div 
            onClick={(e) => { e.stopPropagation(); midiState.startLearning('action_drop_flash'); }}
            className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
              midiState.learningControlId === 'action_drop_flash' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/60 text-slate-300 hover:text-white'
            }`}
          >
            {midiState.learningControlId === 'action_drop_flash' ? 'Počúvam...' : 'Mappovať'}
          </div>
        </button>

        {/* BIG BLACKOUT PAD */}
        <button
          onClick={handleToggleBlackout}
          className={`p-4 rounded-xl font-mono text-left border-2 transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
            isBlackoutActive
              ? 'bg-slate-950 border-amber-400 text-amber-400 shadow-2xl scale-[0.98]'
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 text-slate-300">
              <Moon className="w-4 h-4 text-slate-400" />
              PRE-DROP SILENCE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 border border-slate-700 text-slate-400 font-mono">
              {midiState.mappings['action_blackout'] ? `MIDI N#${midiState.mappings['action_blackout'].number}` : 'MIDI MAP'}
            </span>
          </div>

          <div>
            <div className="text-lg font-black tracking-tight text-white">
              {isBlackoutActive ? 'BLACKOUT AKTÍVNY' : 'TOTAL BLACKOUT'}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              Zhasnutie pódia pred dropom &middot; Budovanie napätia v sále
            </div>
          </div>

          <div 
            onClick={(e) => { e.stopPropagation(); midiState.startLearning('action_blackout'); }}
            className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
              midiState.learningControlId === 'action_blackout' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/60 text-slate-400 hover:text-white'
            }`}
          >
            {midiState.learningControlId === 'action_blackout' ? 'Počúvam...' : 'Mappovať'}
          </div>
        </button>

        {/* BIG SAFE RED / EMERGENCY PAD */}
        <button
          onClick={onEmergencyTrigger}
          className={`p-4 rounded-xl font-mono text-left border-2 transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
            isEmergencyActive
              ? 'bg-red-600 border-white text-white shadow-2xl scale-[0.98]'
              : 'bg-slate-900 border-red-950 text-red-400 hover:border-red-800 hover:bg-red-950/40'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              NÚDZOVÝ REŽIM
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 border border-red-800 text-red-300 font-mono">
              {midiState.mappings['action_emergency'] ? `MIDI N#${midiState.mappings['action_emergency'].number}` : 'MIDI MAP'}
            </span>
          </div>

          <div>
            <div className="text-lg font-black tracking-tight text-white">
              {isEmergencyActive ? 'SAFE RED LOCK AKTÍVNY' : 'SAFE CRIMSON 20%'}
            </div>
            <div className="text-[11px] text-slate-400 font-sans mt-0.5">
              Statické orientačné svetlo pri zásahu personálu / polície
            </div>
          </div>

          <div 
            onClick={(e) => { e.stopPropagation(); midiState.startLearning('action_emergency'); }}
            className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer ${
              midiState.learningControlId === 'action_emergency' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/60 text-slate-400 hover:text-white'
            }`}
          >
            {midiState.learningControlId === 'action_emergency' ? 'Počúvam...' : 'Mappovať'}
          </div>
        </button>

      </div>

      {/* MASTER FADERS ROW (BRIGHTNESS & SPEED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        
        {/* Brightness Fader */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold uppercase">Master Brightness (Jas)</span>
              <button
                onClick={() => midiState.startLearning('fader_brightness')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                  midiState.learningControlId === 'fader_brightness' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {midiState.learningControlId === 'fader_brightness' ? 'Počúvam CC...' : midiState.mappings['fader_brightness'] ? `CC #${midiState.mappings['fader_brightness'].number}` : 'MAP CC'}
              </button>
            </div>
            <span className="text-red-500 font-bold text-sm">{masterBrightness} %</span>
          </div>

          <input
            type="range"
            min={5}
            max={100}
            value={masterBrightness}
            onChange={(e) => setMasterBrightness(Number(e.target.value))}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Speed Fader */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-bold uppercase">Effect Speed (Rýchlosť)</span>
              <button
                onClick={() => midiState.startLearning('fader_speed')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                  midiState.learningControlId === 'fader_speed' ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {midiState.learningControlId === 'fader_speed' ? 'Počúvam CC...' : midiState.mappings['fader_speed'] ? `CC #${midiState.mappings['fader_speed'].number}` : 'MAP CC'}
              </button>
            </div>
            <span className="text-amber-400 font-bold text-sm">{masterSpeed} / 255</span>
          </div>

          <input
            type="range"
            min={0}
            max={255}
            value={masterSpeed}
            onChange={(e) => setMasterSpeed(Number(e.target.value))}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

      </div>

      {/* 10 BIG TACTILE PERFORMANCE PADS (Launchpad Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-mono text-slate-400 font-bold tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-red-500" />
            10 Hlavných WLED Performance Padov (Kliknutie alebo MIDI Note)
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            Pripravené pre Akai APC Mini / Novation Launchpad / Korg
          </span>
        </div>

        {/* Big Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {WLED_PRESETS.map((preset, idx) => {
            const isSelected = currentPreset.id === preset.id;
            const controlKey = `preset_${preset.id}`;
            const mapping = midiState.mappings[controlKey];
            const isLearningThis = midiState.learningControlId === controlKey;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between h-32 select-none group ${
                  isSelected
                    ? 'bg-red-600/15 border-red-500 text-white shadow-xl shadow-red-950/60 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                {/* Pad Header: Pad number + MIDI badge */}
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    PAD {idx + 1}
                  </span>

                  {/* Mapping badge button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      midiState.startLearning(controlKey);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      isLearningThis
                        ? 'bg-amber-400 text-slate-950 animate-pulse'
                        : mapping
                        ? 'bg-slate-950 text-slate-300 border border-slate-700 hover:border-white'
                        : 'bg-slate-950 text-slate-500 hover:text-white'
                    }`}
                    title="Kliknite pre zmenu MIDI Noty"
                  >
                    {isLearningThis ? 'LEARN...' : mapping ? `N#${mapping.number}` : 'MAP'}
                  </button>
                </div>

                {/* Pad Body: Name & Phase */}
                <div className="space-y-0.5">
                  <div className={`font-bold text-sm tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {preset.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {preset.effectName} &middot; {preset.phase}
                  </div>
                </div>

                {/* Pad Footer: Color Swatches & Layer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                  <div className="flex items-center -space-x-1">
                    {preset.paletteColors.map((col, cIdx) => (
                      <span
                        key={cIdx}
                        className="w-3 h-3 rounded-full border border-black/60 inline-block"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400 font-semibold">{preset.targetLayer}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
