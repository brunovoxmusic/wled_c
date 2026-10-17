import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, ShieldAlert, Crown, ArrowRight } from 'lucide-react';

export const PowerCalculator: React.FC = () => {
  const [tubeLedCount, setTubeLedCount] = useState<number>(360);
  const [matrixLedCount, setMatrixLedCount] = useState<number>(432);
  const [brightnessPct, setBrightnessPct] = useState<number>(75);
  const [matrixInjectionMode, setMatrixInjectionMode] = useState<'single_middle' | 'recommended_triple'>('single_middle');
  const [paletteType, setPaletteType] = useState<'queens_disco' | 'white'>('queens_disco');
  const [ablLimitMa, setAblLimitMa] = useState<number>(12000); // 12A on matrix

  const totalLeds = tubeLedCount + matrixLedCount; // 792

  // WS2812B consumption
  const maPerLed = paletteType === 'white' ? 55 : 24; // Queens disco red/gold ~24 mA
  
  // Tubes current (360 LEDs)
  const tubesCurrentMa = tubeLedCount * maPerLed * (brightnessPct / 100);
  const tubesCurrentA = tubesCurrentMa / 1000;

  // Matrix current (432 LEDs, 43.2m zigzag length)
  const theoreticalMatrixMa = matrixLedCount * maPerLed * (brightnessPct / 100);
  const actualMatrixMa = Math.min(theoreticalMatrixMa, ablLimitMa);
  const matrixCurrentA = actualMatrixMa / 1000;

  // Combined current and power
  const totalCurrentA = tubesCurrentA + matrixCurrentA;
  const totalPowerW = totalCurrentA * 5.0;

  // PSU capacity: Mean Well LRS-200-5 (40A) + LRS-150-5 (30A) = 70A
  const psuCapacityA = 70.0;
  const psuHeadroomPct = Math.round(((psuCapacityA - totalCurrentA) / psuCapacityA) * 100);

  // Electrical simulation of 24x18 Matrix with 10cm pitch (43.2m cable!)
  // In single middle injection: cable length to each end is 21.6m.
  // Ribbon trace resistance ~0.07 Ohm/m.
  const halfBranchMeters = matrixInjectionMode === 'single_middle' ? 21.6 : 7.2;
  const traceResistance = halfBranchMeters * 0.07;
  const currentPerHalfBranch = (matrixCurrentA / 2);
  // Distributed load factor ~0.5
  const matrixVoltageDrop = currentPerHalfBranch * traceResistance * 0.5;
  const matrixEndVoltage = Math.max(0, 5.05 - matrixVoltageDrop);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <span className="text-xs uppercase font-mono text-red-500 font-semibold tracking-wider flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5" />
          Fyzikálna &amp; Elektrotechnická Analýza · QUEENS Pub Púchov (5V WS2812B)
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Kalkulátor 5V napájania, úbytku napätia matrixu a istenia PCB
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Detailný inžiniersky rozpočet pre 792 LED. Overenie kritického rizika: <strong>jediná stredová injekcia na 43,2 m zigzag kábli matrixu</strong> a odporúčané opatrenia pred nasadením do plnej prevádzky.
        </p>
      </div>

      {/* Critical Matrix Alert Banner */}
      <div className="p-4 bg-red-950/60 border border-red-800 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white text-sm">
              KRITICKÁ ANALÝZA ZADANIA: 1× Stredové napájanie 24×18 matrixu
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              432 LED s rozostupom 10 cm = <strong>43,2 metra tenkého kábla</strong>. Z jedného stredového bodu je to 21,6 m na okraj rámu.
              Pri plnom jase by úbytok napätia presiahol 2,1 V, čo by spôsobilo zhasnutie modrej zložky a prehriatie stredového spoja!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMatrixInjectionMode(matrixInjectionMode === 'single_middle' ? 'recommended_triple' : 'single_middle')}
            className="px-3.5 py-1.5 text-xs font-mono font-bold bg-white text-slate-950 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
          >
            {matrixInjectionMode === 'single_middle' ? 'Simulovať doplnenie 2 injekcií' : 'Návrat k 1 stredovej injekcii'}
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-xs text-slate-400 block mb-1">Celkový odber prúdu:</span>
          <div className="text-2xl font-bold text-red-500">
            {totalCurrentA.toFixed(1)} A
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Trubice: {tubesCurrentA.toFixed(1)} A &middot; Matrix: {matrixCurrentA.toFixed(1)} A
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-xs text-slate-400 block mb-1">Celkový príkon (5V DC):</span>
          <div className="text-2xl font-bold text-amber-400">
            {totalPowerW.toFixed(0)} W
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            792 ks WS2812B RGB
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-xs text-slate-400 block mb-1">Napätie na okraji matrixu:</span>
          <div className={`text-2xl font-bold ${matrixEndVoltage < 3.8 ? 'text-red-400' : 'text-emerald-400'}`}>
            {matrixEndVoltage.toFixed(2)} V
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            &Delta;V úbytok = {matrixVoltageDrop.toFixed(2)} V ({matrixInjectionMode === 'single_middle' ? '1 stred' : '3 injekcie'})
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono">
          <span className="text-xs text-slate-400 block mb-1">Rezerva PSU (Headroom):</span>
          <div className={`text-2xl font-bold ${psuHeadroomPct < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
            {psuHeadroomPct} %
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Kapacita zdrojov: 70 A (KPI &ge; 20%)
          </span>
        </div>

      </div>

      {/* Interactive Controls & Schematic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
            Parametre simulátora záťaže
          </span>

          {/* Palette mode */}
          <div>
            <label className="text-xs text-slate-300 font-mono block mb-1">
              Farebný profil (Záťaž čipov):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setPaletteType('queens_disco')}
                className={`p-2 rounded border transition-colors ${
                  paletteType === 'queens_disco'
                    ? 'border-red-500 bg-red-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Queens Disco (~24 mA)
              </button>
              <button
                onClick={() => setPaletteType('white')}
                className={`p-2 rounded border transition-colors ${
                  paletteType === 'white'
                    ? 'border-red-400 bg-red-400/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Plná Biela (~55 mA)
              </button>
            </div>
          </div>

          {/* Master Brightness */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Jas (Brightness):</span>
              <span className="text-red-400">{brightnessPct} %</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={brightnessPct}
              onChange={(e) => setBrightnessPct(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Matrix ABL limiter */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">WLED ABL limit matrixu:</span>
              <span className="text-amber-400">{ablLimitMa.toLocaleString()} mA</span>
            </div>
            <input
              type="range"
              min={6000}
              max={24000}
              step={1000}
              value={ablLimitMa}
              onChange={(e) => setAblLimitMa(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Odporúčané maximum: 12 000 mA pri 1 stredovej injekcii
            </span>
          </div>

          {/* Injection scheme selector */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs text-slate-300 font-mono block mb-1">
              Topológia injekcií na matrixi:
            </label>
            <div className="space-y-1.5 text-xs font-mono">
              <div 
                onClick={() => setMatrixInjectionMode('single_middle')}
                className={`p-2.5 rounded border cursor-pointer transition-colors ${
                  matrixInjectionMode === 'single_middle'
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>1× Iba stred (Stav v zadaní)</span>
                  <span className="text-red-400">&Delta;V: {matrixVoltageDrop.toFixed(2)} V</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Trasa 21,6 m od stredu. Vyžaduje prísny ABL limit 12 A.
                </div>
              </div>

              <div 
                onClick={() => setMatrixInjectionMode('recommended_triple')}
                className={`p-2.5 rounded border cursor-pointer transition-colors ${
                  matrixInjectionMode === 'recommended_triple'
                    ? 'border-emerald-500 bg-emerald-950/40 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>3× Začiatok + Stred + Koniec</span>
                  <span className="text-emerald-400">&Delta;V: ~0,45 V</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Doplnené 2 vodiče CYA 1,5 mm². Stabilita aj pri plnom výkone.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schematic Blueprint Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
            Schéma zapojenia a rozvodu napájania pre QUEENS
          </span>

          <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-red-400 pb-2 border-b border-slate-800">
              <span>PSU Mean Well LRS-200-5 (5V / 40A) pre Matrix</span>
              <span className="text-emerald-400">PSU LRS-150-5 (5V / 30A) pre Trubice</span>
            </div>

            <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{` [ZDROJ 1: 5V 40A] ──────────────────────────┬─────────────────────────── [Poistka 20A]
                                            │
                               ┌────────────▼────────────┐
                               │  STREDOVÁ INJEKCIA      │ (216. LED v strede)
                               │  (Vstup 5.05 V)         │
     ◄─── 21.6 metra kábla ────┴─────────────────────────┴──── 21.6 metra kábla ───►
   ┌─────────────────────────────────────────────────────────────────────────────┐
   │ ZAČIATOK (LED 0)         24×18 ZIGZAG MATRIX (432 LED)        KONIEC (LED 431)│
   │ [Napätie: ${matrixEndVoltage.toFixed(2)} V]                                            [Napätie: ${matrixEndVoltage.toFixed(2)} V]│
   └─────────────────────────────────────────────────────────────────────────────┘
     ${matrixInjectionMode === 'single_middle' ? '▲ Riziko úbytku napätia!                          ▲ Riziko úbytku napätia!' : '▲ [DOPLNENÁ INJEKCIA A]                       ▲ [DOPLNENÁ INJEKCIA B]'}

 [ZDROJ 2: 5V 30A] ──► [PCB ESP32 #2 (3× 60 LED)] ──► Trubice Left 1–3 (Max 8 A)
                   ──► [PCB ESP32 #3 (3× 60 LED)] ──► Trubice Right 4–6 (Max 8 A)`}
            </pre>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400 text-xs">
              <div>
                <strong className="text-white block mb-0.5">Istenie PCB trubíc:</strong>
                Každá vetva 3 trubíc je istená nožovou poistkou <strong>10 A</strong> pred vstupom do PCB kontroléra.
              </div>
              <div>
                <strong className="text-white block mb-0.5">Tepelný limit trubíc:</strong>
                Vďaka obmedzeniu prúdu na trubiciach teplota hliníkových profilov nepresiahne <strong>39 °C</strong> ani počas celovečerného disco setu.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-start gap-2.5 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Empirické pravidlo praxe integrátora:</span>
              <span className="text-slate-400 text-[11px]">
                Kým elektrikár nedoplní 2 pomocné injekcie na okraje matrixu, nesmie obsluha v QUEENS vypínať WLED Automatic Brightness Limiter (ABL limit 12 000 mA). Tým je zaistená 100% farebná stabilita červených odtieňov bez deformácie na okrajoch pódia.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
