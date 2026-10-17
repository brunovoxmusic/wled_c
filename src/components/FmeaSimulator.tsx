import React, { useState } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  WifiOff, 
  VolumeX, 
  ZapOff, 
  Thermometer, 
  CheckCircle,
  Crown
} from 'lucide-react';
import { FMEA_DATA } from '../data/wledData';

export const FmeaSimulator: React.FC = () => {
  const [activeFault, setActiveFault] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([
    'Všetky systémy v QUEENS nominálne. 3× ESP32 pripojené na QUEENS_STAGE_PROD.',
    'Master ESP32 #1 (192.168.10.41): Matrix 24×18 ABL limit 12 000 mA aktívny.',
    'Slave ESP32 #2 & #3 (192.168.10.42 / 43): 6 Trubíc prijíma UDP sync na porte 11988.',
    'Mean Well LRS-200-5 (Matrix): 4.98 V pri stredovom bode, odber 11.2 A (Headroom 72%).'
  ]);

  const triggerFault = (faultType: string) => {
    setActiveFault(faultType);
    const now = new Date().toLocaleTimeString();

    if (faultType === 'reboot') {
      setSimulationLog(prev => [
        `[${now}] ⚡ INJEKCIA ZLYHANIA: Brownout na Master ESP32 #1 (Matrix)! Kontrolér vykonáva hard reset...`,
        `[${now}] 🛡️ FAIL-SAFE: Slave trubice (ESP32 #2 a #3) pokračujú v lokálnom efekte bez zhasnutia.`,
        `[${now}] 🛡️ FAIL-SAFE: WLED Boot Preset 10 v EEPROM rozsvieti matrix za 1.8 s v tlmenom červenom svetle.`,
        `[${now}] ✅ VÝSLEDOK: Pódium neostalo ani na stotinu sekundy v tme; žiadne oslepenie bieleho štartu.`,
        ...prev
      ]);
    } else if (faultType === 'wifi') {
      setSimulationLog(prev => [
        `[${now}] 📶 INJEKCIA ZLYHANIA: Výpadok Wi-Fi routera (simulácia 2-minútového blackoutu siete).`,
        `[${now}] 🛡️ FAIL-SAFE: Všetky 3 ESP32 pokračujú v autonómnom cykle lokálne z FLASH pamäte.`,
        `[${now}] 🛡️ FAIL-SAFE: Po 30 s Master ESP32 aktivoval záložný AP 'QUEENS-STAGE-SAFE-AP'.`,
        `[${now}] ✅ VÝSLEDOK: Šou beží plynule ďalej; VJ sa okamžite pripája priamo na mobilný AP.`,
        ...prev
      ]);
    } else if (faultType === 'audio') {
      setSimulationLog(prev => [
        `[${now}] 🔊 INJEKCIA ZLYHANIA: Ticho na mixpulte / pauza kapely (&gt; 3 500 ms bez UDP signálu).`,
        `[${now}] 🛡️ FAIL-SAFE: WLED Silence Decay aktivovaný na všetkých 3 kontroléroch.`,
        `[${now}] ✅ VÝSLEDOK: Hladký prechod do pomalého červeného Flow (Preset 01), jas znížený na 25 %. Žiadne zamrznuté pixely.`,
        ...prev
      ]);
    } else if (faultType === 'voltage') {
      setSimulationLog(prev => [
        `[${now}] ⚠️ INJEKCIA ZLYHANIA: Pokus o rozsvietenie plnej bielej na matrixi pri jedinej stredovej injekcii!`,
        `[${now}] 🛡️ FAIL-SAFE: WLED ABL limit okamžite zasiahol a orezal celkový prúd na 12 000 mA.`,
        `[${now}] ✅ VÝSLEDOK: Napätie na okrajoch nekleslo pod kritických 3,6 V. Diódy nezmenili odtieň a zdroj nevypol.`,
        ...prev
      ]);
    } else if (faultType === 'thermal') {
      setSimulationLog(prev => [
        `[${now}] 🔥 INJEKCIA ZLYHANIA: Zvýšená teplota PCB kontroléra ľavých trubíc (58 °C).`,
        `[${now}] 🛡️ FAIL-SAFE: Prúdový limit na ESP32 #2 znížený na 6 A, hliníkové trubice odvádzajú teplo do konštrukcie.`,
        `[${now}] ✅ VÝSLEDOK: Teplota stabilizovaná na 37 °C; neprerušená disco prevádzka.`,
        ...prev
      ]);
    }
  };

  const resetAllFaults = () => {
    setActiveFault(null);
    const now = new Date().toLocaleTimeString();
    setSimulationLog(prev => [
      `[${now}] 🔄 RESET: Všetky poruchy zrušené. 3× ESP32 v nominálnom disco/live režime.`,
      ...prev
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <span className="text-xs uppercase font-mono text-red-500 font-semibold tracking-wider flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5" />
          FMEA Analýza Zlyhaní &amp; Hazard-Testing · QUEENS Pub Púchov
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Failure-Mode Simulátor pre 3× ESP32 (Testovanie havarijných stavov)
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Simulujte v reálnom čase kritické zlyhania siete, zvuku, hardvéru alebo napájania a overte, že systém spĺňa bezpečnostnú požiadavku: <strong>ani jedno zlyhanie nesmie spôsobiť tmu, paniku ani nekontrolovaný záblesk</strong>.
        </p>
      </div>

      {/* Interactive Switchboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Buttons to inject faults */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-300 font-semibold">
              Injekcia havárie
            </span>
            {activeFault && (
              <button
                onClick={resetAllFaults}
                className="text-xs text-red-400 hover:underline font-mono font-bold"
              >
                Reset porúch
              </button>
            )}
          </div>

          <button
            onClick={() => triggerFault('reboot')}
            className={`w-full p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
              activeFault === 'reboot'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>1. Brownout / Reset Master ESP32</span>
            </div>
            <span className="text-[10px] text-slate-500">&lt; 1.8s</span>
          </button>

          <button
            onClick={() => triggerFault('wifi')}
            className={`w-full p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
              activeFault === 'wifi'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>2. Výpadok Wi-Fi siete (2 min)</span>
            </div>
            <span className="text-[10px] text-slate-500">AP Fallback</span>
          </button>

          <button
            onClick={() => triggerFault('audio')}
            className={`w-full p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
              activeFault === 'audio'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-cyan-400" />
              <span>3. Pád UDP Sound Sync / Ticho</span>
            </div>
            <span className="text-[10px] text-slate-500">Decay 3.5s</span>
          </button>

          <button
            onClick={() => triggerFault('voltage')}
            className={`w-full p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
              activeFault === 'voltage'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ZapOff className="w-4 h-4 text-yellow-400" />
              <span>4. Úbytok napätia na matrixi</span>
            </div>
            <span className="text-[10px] text-slate-500">ABL limit</span>
          </button>

          <button
            onClick={() => triggerFault('thermal')}
            className={`w-full p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
              activeFault === 'thermal'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>5. Prehriatie PCB trubíc</span>
            </div>
            <span className="text-[10px] text-slate-500">Truss chlad</span>
          </button>
        </div>

        {/* Live Event Log Console */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                FMEA Live Event Log &amp; Telemetria
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Fail-Safe Engine Aktívny
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
              {simulationLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span><strong>Garantovaný stav:</strong> Nikdy nesmie nastať tma na pódiu QUEENS.</span>
            <span className="text-red-400 font-mono">WLED Boot Preset: #10 (Safe Crimson)</span>
          </div>
        </div>

      </div>

      {/* Complete FMEA Reference Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
          Oficiálna matica zlyhaní FMEA pre QUEENS Pub Púchov
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Režim zlyhania</th>
                <th className="py-2.5 px-3">Dôsledok naživo</th>
                <th className="py-2.5 px-3">Detekcia</th>
                <th className="py-2.5 px-3">Mitigácia a Fail-Safe architektúra</th>
                <th className="py-2.5 px-3">Garantovaný výsledný stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {FMEA_DATA.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-red-400 text-xs">
                    {row.failureMode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {row.liveImpact}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs">
                    {row.detectionMethod}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-xs">
                    {row.mitigationAndFailSafe}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 text-xs font-medium">
                    {row.guaranteedState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
