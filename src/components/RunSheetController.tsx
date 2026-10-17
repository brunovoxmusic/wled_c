import React, { useState } from 'react';
import { 
  Play, 
  Crown, 
  Zap, 
  Printer, 
  AlertOctagon
} from 'lucide-react';
import { RUN_SHEET_DATA, WLED_PRESETS, WledPreset } from '../data/wledData';

interface RunSheetControllerProps {
  currentPreset: WledPreset;
  onSelectPreset: (preset: WledPreset) => void;
  onEmergencyTrigger: () => void;
}

export const RunSheetController: React.FC<RunSheetControllerProps> = ({
  currentPreset,
  onSelectPreset,
  onEmergencyTrigger,
}) => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [lastActionTime, setLastActionTime] = useState<string>('Pripravené');
  const [dropFlashActive, setDropFlashActive] = useState<boolean>(false);

  const handleTriggerRow = (idx: number, presetCode: string) => {
    setActivePhaseIndex(idx);
    const target = WLED_PRESETS.find(p => p.code === presetCode);
    if (target) {
      onSelectPreset(target);
      const now = new Date();
      setLastActionTime(`${now.toLocaleTimeString()} (1 klik / OK)`);
    }
  };

  const handleInstantDropFlash = () => {
    // 1-second stark red drop impact (strict rule: NO white on DJ)
    setDropFlashActive(true);
    const dropPreset = WLED_PRESETS.find(p => p.code === '07_drop_stark_red') || WLED_PRESETS[6];
    onSelectPreset(dropPreset);

    setTimeout(() => {
      setDropFlashActive(false);
      // Return to Peak Crown
      const peakPreset = WLED_PRESETS.find(p => p.code === '05_peak_disco_crown') || WLED_PRESETS[4];
      onSelectPreset(peakPreset);
    }, 1000); // 1.0s safe cut
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Controller Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs uppercase font-mono text-red-500 font-semibold tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            Live Automatizácia &amp; VJ Konzóla · QUEENS Pub Púchov
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Jednostranový Run-Sheet Disco &amp; Live</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              (KPI: prepnutie &le; 3 kliknutia / &le; 10s)
            </span>
          </h2>
        </div>

        {/* Quick Instant Overrides */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantDropFlash}
            disabled={dropFlashActive}
            className={`px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              dropFlashActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/60'
                : 'bg-slate-800 text-red-400 border border-red-900/80 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-red-400" />
            {dropFlashActive ? 'DROP IMPACT AKTÍVNY (1s)' : 'DROP STARK RED (1s Auto-Cut)'}
          </button>
          <button
            onClick={onEmergencyTrigger}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded text-xs font-mono font-semibold flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            Safe Crimson (Núdza)
          </button>
        </div>
      </div>

      {/* Timeline Phase Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 no-print">
        {RUN_SHEET_DATA.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleTriggerRow(idx, item.presetCode)}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              activePhaseIndex === idx
                ? 'border-red-500 bg-red-500/10 text-white shadow'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] font-mono text-red-400 block truncate">{item.timeWindow}</span>
            <span className="font-semibold text-xs text-white block mt-0.5 truncate">{item.phase}</span>
            <span className="text-[10px] font-mono text-slate-400 block truncate mt-1">{item.presetCode}</span>
          </button>
        ))}
      </div>

      {/* Main Single-Page Run-Sheet Card (Optimized for Screen & Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-red-500" />
              <span>MASTER RUN-SHEET · OFICIÁLNY PLÁN OPERÁTORA (QUEENS)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              QUEENS pub Púchov · 792 LED (6 Trubíc + 24×18 Matrix) · 3× ESP32
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <span className="text-xs text-slate-400 font-mono">
              Posledná akcia: <strong className="text-emerald-400">{lastActionTime}</strong>
            </span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Tlač tabuľky
            </button>
          </div>
        </div>

        {/* The Single-Page Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Časový interval</th>
                <th className="py-3 px-3">Fáza noci &amp; Program</th>
                <th className="py-3 px-3">Cieľový preset</th>
                <th className="py-3 px-3">Zapojené segmenty</th>
                <th className="py-3 px-3">Spúšťač</th>
                <th className="py-3 px-3">Svetelná choreografia QUEENS</th>
                <th className="py-3 px-3 text-right no-print">Akcia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {RUN_SHEET_DATA.map((row, idx) => {
                const isSelected = currentPreset.code === row.presetCode;

                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-red-500/10' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-red-400 whitespace-nowrap">
                      {row.timeWindow}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{row.phase}</span>
                      <span className="text-slate-400 text-[11px]">{row.musicEnergy}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-300 font-medium whitespace-nowrap">
                      {row.presetCode}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                      {row.primarySegments}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                        row.triggerType.includes('MANUÁLNE')
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : row.triggerType.includes('Audio')
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {row.triggerType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      {row.lightingAction}
                    </td>
                    <td className="py-3 px-3 text-right no-print">
                      <button
                        onClick={() => handleTriggerRow(idx, row.presetCode)}
                        className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Aktívna' : 'Aktivovať'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Operating Notes */}
        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
          <p>
            <strong>Striktný limit na DJ pult:</strong> Zákaz plnej bielej chráni zrak DJa a vystupujúcich umelcov. Tlačidlo <em>DROP STARK RED</em> spustí 1-sekundový tvrdý červený úder na 1. dobu beatu a automaticky vráti Peak Crown preset.
          </p>
          <p>
            <strong>Pravidlo 3 kliknutí:</strong> Prechod medzi autonómnym a manuálnym režimom prebieha okamžite jedným klikom na daný časový slot.
          </p>
        </div>
      </div>
    </div>
  );
};
