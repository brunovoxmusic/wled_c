import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  Layers, 
  Sliders, 
  Volume2, 
  CalendarClock, 
  Zap, 
  Wifi, 
  AlertTriangle, 
  Wrench,
  Crown
} from 'lucide-react';
import { 
  WLED_SEGMENTS, 
  WLED_PRESETS, 
  RUN_SHEET_DATA, 
  FMEA_DATA, 
  TWEAK_RULES,
  SAMPLE_WLED_PRESETS_JSON,
  SAMPLE_WLED_CFG_ESP1_MASTER_JSON,
  SAMPLE_WLED_CFG_ESP2_TUBES_JSON
} from '../data/wledData';

export const MasterDocumentView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sec1');

  const handleCopyMarkdown = () => {
    const markdownContent = generateCompleteQueensMarkdown();
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = (onlyRunSheet = false) => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-500 font-semibold font-mono">
            <Crown className="w-4 h-4 text-red-500" />
            <span>Oficiálna produkčná špecifikácia · QUEENS Pub Púchov</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            WLED Stage Architecture &amp; Production Blueprint
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Kompletný systém riadenia klubovej scény: 6 vertikálnych trubíc (360 LED) + zadný 24×18 matrix (432 LED) = 792 LED WS2812B (5V), 3× synchronizované ESP32 a jednostranový run-sheet pre disco a koncerty (80–180 BPM).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handlePrint(false)}
            className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            Tlačiť dokument
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md transition-colors flex items-center gap-2 shadow-lg shadow-red-950/50"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Skopírované do schránky!' : 'Kopírovať Markdown'}
          </button>
        </div>
      </div>

      {/* Table of contents bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs text-slate-400 no-print">
        <span className="text-slate-500 font-medium">Navigácia:</span>
        {[
          { id: 'sec1', label: '1. Segmentácia & Sightlines' },
          { id: 'sec2', label: '2. Art Direction' },
          { id: 'sec3', label: '3. Knižnica Presetov' },
          { id: 'sec4', label: '4. Audio-Reaktivita' },
          { id: 'sec5', label: '5. Scény & Run-Sheet' },
          { id: 'sec6', label: '6. Napájanie & Bezpečnosť' },
          { id: 'sec7', label: '7. API & 3× ESP32' },
          { id: 'sec8', label: '8. FMEA Analýza' },
          { id: 'sec9', label: '9. On-Site Protokol' },
        ].map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
              activeSection === sec.id
                ? 'bg-slate-800 text-red-400 font-medium'
                : 'hover:text-slate-200'
            }`}
          >
            {sec.label}
          </a>
        ))}
      </div>

      {/* Main 9 Sections Content */}
      <article className="space-y-14 text-slate-200 text-base leading-relaxed">
        
        {/* SEKČNÝ BLOK 1 */}
        <section id="sec1" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <span>01. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            1. Segmentácia, mapovanie a sightlines (QUEENS Pub Púchov)
          </h2>
          <div className="text-sm text-slate-400 space-y-3">
            <p>
              Klubová sála QUEENS pub Púchov má plochu približne <strong>150 m²</strong> s vyvýšeným pódiom (stage) pre DJov a živé koncerty. Celý svetelný ekosystém pozostáva z <strong>792 digitálnych LED 5V WS2812B</strong> rozdelených medzi 3 hardvérové kontroléry ESP32.
            </p>
            <p>
              <strong>Rozmiestnenie hardvéru a zorné línie (Sightlines):</strong><br />
              1. <strong>Zadný Matrix 24×18 (432 LED):</strong> Rozmer cca 2,4 m šírka × 1,8 m výška na zadnej stene pódia (zigzag zapojenie, 10 cm rozostup). Predstavuje hlavný <em>Hero</em> prvok – priamy stred zorného poľa pre 100 % publika a čelné video zábery.<br />
              2. <strong>6× Vertikálne trubice (spolu 360 LED):</strong> 1 m dlhé hliníkové trubice s mliečnym difúzorom (60 LED/m) osadené na rohových truss konštrukciách po stranách pódia (3 vľavo, 3 vpravo). Vytvárajú vertikálny rám stageu a priestorovú hĺbku.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 mt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Segment / Hardvér</th>
                  <th className="py-3 px-4">Rola</th>
                  <th className="py-3 px-4">Kontrolér &amp; GPIO</th>
                  <th className="py-3 px-4">Rozsah LED</th>
                  <th className="py-3 px-4">Fyzické umiestnenie</th>
                  <th className="py-3 px-4">Sightlines &amp; Kamery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                {WLED_SEGMENTS.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {seg.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                        seg.role === 'hero' 
                          ? 'bg-red-950 text-red-300 border border-red-800' 
                          : seg.role === 'accent'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {seg.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      <div>{seg.controller}</div>
                      <div className="text-slate-500">{seg.gpio}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                      {seg.ledCount} ks ({seg.startLed}–{seg.stopLed - 1})
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{seg.physicalLocation}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{seg.sightlineNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-lg border border-red-950/60 text-xs space-y-2 mt-4">
            <span className="font-semibold text-red-400 uppercase tracking-wide flex items-center gap-1.5 font-mono">
              <Crown className="w-3.5 h-3.5" />
              Pravidlo z praxe (Sightlines &amp; Zákaz bielej na DJ pult):
            </span>
            <p className="text-slate-300">
              V súlade so zadaním platí <strong>striktný zákaz priameho bieleho svetla smerom na DJ pult</strong>. Biele svetlo zhasína kontrast displayov na mixpulte/prehrávačoch a vytvára nežiaduce odlesky na čelných mobilných kamerách. Na pódiu sa preto ako wash pozadia používa výhradne sýta kráľovská červená (#D90429) a teplý jantár (#F59E0B), zatiaľ čo biela farba je povolená iba ako krátky vertikálny akcent na bočných trubiciach smerujúci k stropu.
            </p>
          </div>
        </section>

        {/* SEKČNÝ BLOK 2 */}
        <section id="sec2" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Sliders className="w-4 h-4" />
            <span>02. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            2. Art direction a farebný scenár noci (Kráľovská identita QUEENS)
          </h2>
          
          {/* Design language v 3 vetách */}
          <div className="p-4 bg-slate-900/90 border-l-2 border-red-500 rounded-r-lg space-y-2">
            <span className="text-xs uppercase font-mono text-red-400 font-bold tracking-wider">
              Design Language QUEENS v 3 vetách:
            </span>
            <p className="text-sm text-slate-200 italic">
              1. Vizuálna identita QUEENS stavia na kráľovskej dôstojnosti: hlboká zamatová červená a nepreniknuteľná čierna tvoria dominantný základ priestoru, oživený geometrickou siluetou kráľovskej koruny na zadnej stene pódia.<br />
              2. Každá scéna prísne dodržiava pravidlo maximálne troch odtieňov (Kráľovská červená #D90429, Čierna #0B090A a Zlatý/Biely akcent #F59E0B/#FFFFFF), čím radikálne odstraňuje lacnú "dúhovú polievku".<br />
              3. Svetelný pohyb dokonale kopíruje žánrovú dynamiku pubu od uvoľneného pop/rocku (80–110 BPM) cez živé koncerty až po gradujúci disco a club dance vrchol (128–180 BPM).
            </p>
          </div>

          {/* Pravidlo vrstvenia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-lg">
              <span className="text-red-400 font-bold uppercase block mb-1">1. Vrstva: WASH (Zamatový podklad)</span>
              <p className="text-slate-400">
                Matrix na zadnej stene vytvára plošné farebné pozadie v sýtych červených tónoch. Poskytuje priestorovú hĺbku bez oslnenia účinkujúcich na pódiu.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-lg">
              <span className="text-amber-400 font-bold uppercase block mb-1">2. Vrstva: AKCENT (Vertikálne trubice)</span>
              <p className="text-slate-400">
                6 vertikálnych línií po stranách stageu. Kinetické bežiace svetlo (chaser, meteor, rebrík) vyvoláva dojem výšky a dynamiky pódia.
              </p>
            </div>
            <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-lg">
              <span className="text-white font-bold uppercase block mb-1">3. Vrstva: DETAIL (Kráľovská koruna)</span>
              <p className="text-slate-400">
                Stredový 2D vzor koruny na matrixe rezonujúci s rytmom basového bubna (kick) a snare v kľúčových zlomoch skladieb.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300 mt-2">
            <h3 className="font-semibold text-white">Energetická krivka noci (Disco &amp; Concert Timeline):</h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">21:00 – 22:30 (Door):</strong> Zamatový pokoj (25 % jas), paleta Royal Red &amp; Black. Trubice dýchajú na minimálnom jase. Dôraz na príjemnú pubovú atmosféru.</li>
              <li><strong className="text-slate-200">22:30 – 00:00 (Warm-up):</strong> Pulzovanie 110–122 BPM, jemné zapájanie bočných trubíc do rytmu, matrix drží statické červeno-jantárové pozadie.</li>
              <li><strong className="text-slate-200">00:00 – 01:00 (Live Concert / Build):</strong> Teplý jantárovo-červený organický wash (50 % jas). Svetlo podporuje hudobníkov, nezatieňuje tváre.</li>
              <li><strong className="text-slate-200">01:00 – 03:30 (Disco Peak):</strong> Maximálna energia (128–145 BPM), motív kráľovskej koruny pulzujúci na matrixe, trubice v 6-pásmovom audio ekvalizéri.</li>
              <li><strong className="text-slate-200">03:30 – 05:00 (Outro):</strong> Pozvoľné uvoľnenie (30 % jas), teplý amber fade, upokojenie zreničiek pred záverečným rozsvietením.</li>
            </ul>
          </div>
        </section>

        {/* SEKČNÝ BLOK 3 */}
        <section id="sec3" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Sliders className="w-4 h-4" />
            <span>03. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            3. Knižnica presetov (WLED 0.15.x pre QUEENS)
          </h2>
          <p className="text-sm text-slate-400">
            Kolekcia 10 striktne overených presetov podľa pravidla <code className="text-red-400 font-mono">NN_fáza_náznak</code>. Všetky efekty boli skontrolované voči oficiálnemu registru WLED 0.15.x pre 1D a 2D matice. Na pódiu bežia maximálne 2 dominantné efekty súčasne.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Kód &amp; Názov</th>
                  <th className="py-2.5 px-3">WLED Efekt (FX ID)</th>
                  <th className="py-2.5 px-3">Rýchlosť</th>
                  <th className="py-2.5 px-3">Intenzita</th>
                  <th className="py-2.5 px-3">Paleta</th>
                  <th className="py-2.5 px-3">Jas %</th>
                  <th className="py-2.5 px-3">Vrstva</th>
                  <th className="py-2.5 px-3">Fáza</th>
                  <th className="py-2.5 px-3">Odôvodnenie z praxe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-sans">
                {WLED_PRESETS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-red-400 whitespace-nowrap">
                      {p.code}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {p.effectName} <span className="text-slate-500">(#{p.effectId})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{p.speed}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{p.intensity}</td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1">
                          {p.paletteColors.map((c, i) => (
                            <span 
                              key={i} 
                              className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block" 
                              style={{ backgroundColor: c }} 
                            />
                          ))}
                        </div>
                        <span className="text-xs">{p.paletteName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-semibold">{p.brightnessPct} %</td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-slate-300 uppercase font-mono">{p.targetLayer}</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">{p.phase}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs italic">{p.empiricalRationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEKČNÝ BLOK 4 */}
        <section id="sec4" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Volume2 className="w-4 h-4" />
            <span>04. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            4. Audio-reaktivita a multi-instance synchronizácia
          </h2>
          <div className="text-sm text-slate-300 space-y-3">
            <p>
              Pre QUEENS pub s pestrým žánrovým rozsahom (80 až 180 BPM: disco, pop, živé kapely, DJ sety) je <strong>kľúčová presná dynamická odozva bez falošných zábleskov</strong>.
            </p>
            <p>
              <strong>Hardvérové audio zapojenie:</strong><br />
              Master ESP32 #1 prijíma čistý galvanicky oddelený linkový signál (Line Out / Booth Out) z hlavného mixpultu. Zvukový signál je prevádzaný cez I2S prevodník do 16 frekvenčných pásiem a vysielaný cez <strong>WLED UDP Sound Sync broadcast (port 11988)</strong> na slave jednotky ESP32 #2 a ESP32 #3.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-red-400 font-bold uppercase font-mono">Audio parametre &amp; UDP Sync:</span>
              <ul className="space-y-1.5 text-slate-300">
                <li>· <strong>UDP Port:</strong> 11988 (WLED SoundSync v2)</li>
                <li>· <strong>Reálna latencia odozvy:</strong> &le; 28 ms (garantovaný KPI &le; 80 ms)</li>
                <li>· <strong>Attack / Decay:</strong> Attack = 10 ms (okamžitý náraz na kick), Decay = 120 ms (plynulý dobeh bez trasenia)</li>
                <li>· <strong>Squelch:</strong> 10 (odfiltruje šepot a hluk v sále pred začiatkom produkcie)</li>
                <li>· <strong>Gain:</strong> 38 (nastavené pre nominálnu úroveň 0 dBu z mixu)</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-amber-400 font-bold uppercase font-mono">Správanie pri tichu (Silence Decay):</span>
              <p className="text-slate-300">
                Ak po dobu &ge; 3,5 s nepríde žiaden audio signál (prestávka kapely, príhovor moderátora, ticho pred dropom):
              </p>
              <p className="text-slate-400 italic">
                WLED automaticky a plynule zosunie jas na 25 % a prepne z rýchleho GEQ módu do pomalého "Flow" (Preset 01). Žiadne zamrznutie diód v náhodnom rozsvietenom bode.
              </p>
            </div>
          </div>
        </section>

        {/* SEKČNÝ BLOK 5 */}
        <section id="sec5" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <CalendarClock className="w-4 h-4" />
            <span>05. SEKCIÁ</span>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              5. Scény, automatizácia a JEDNOSTRANOVÝ RUN-SHEET (QUEENS)
            </h2>
            <button
              onClick={() => handlePrint(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-500 transition-colors flex items-center gap-1.5 no-print shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              Tlačiť Run-Sheet (1 strana)
            </button>
          </div>
          
          <p className="text-sm text-slate-400">
            Kombinovaná prevádzka: <strong>autonómny režim</strong> počas úvodných hodín (časovač + audio detekcia) a <strong>manuálna VJ obsluha</strong> počas koncertov a disco špičiek. Zmena scény garantovane vyžaduje <strong>maximálne 1 až 2 kliknutia (&le; 5 sekúnd)</strong>.
          </p>

          {/* Dedicated 1-Page Run Sheet Container for print and view */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Crown className="w-4 h-4 text-red-500" />
                  <span>QUEENS PUB PÚCHOV · MASTER RUN-SHEET NOCI</span>
                </h3>
                <span className="text-xs text-red-400 font-mono">
                  WLED v0.15.x · 6 Trubíc + 24×18 Matrix (792 LED) · KPI: &le; 3 akcie
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Piatok / Sobota (21:00 – 05:00) · 80–180 BPM
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Časový slot</th>
                    <th className="py-2.5 px-3">Fáza &amp; Hudobná energia</th>
                    <th className="py-2.5 px-3">Preset Lookup</th>
                    <th className="py-2.5 px-3">Aktívne segmenty</th>
                    <th className="py-2.5 px-3">Spúšťač (Trigger)</th>
                    <th className="py-2.5 px-3">Svetelná akcia &amp; Negatívny priestor</th>
                    <th className="py-2.5 px-3 text-center">Akcie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {RUN_SHEET_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-red-400 whitespace-nowrap">
                        {row.timeWindow}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-white block">{row.phase}</span>
                        <span className="text-slate-400 text-[11px]">{row.musicEnergy}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-300 font-medium whitespace-nowrap">
                        {row.presetCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                        {row.primarySegments}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          row.triggerType.includes('MANUÁLNE')
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : row.triggerType.includes('Audio')
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {row.triggerType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-xs">
                        {row.lightingAction}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-center text-slate-400 font-semibold">
                        {row.kpiActionCount} klik
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-2">
              <span><strong>Zlaté pravidlo pre VJ v QUEENS:</strong> Pri zlomoch nikdy nepúšťaj bielu na DJ pult; použi 1-sekundový Drop Stark Red (Preset 07).</span>
              <span className="text-red-400 font-mono font-medium">Safe Mode tlačidlo pri bare = Preset 10</span>
            </div>
          </div>
        </section>

        {/* SEKČNÝ BLOK 6 */}
        <section id="sec6" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>06. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            6. Napájanie, teplo a bezpečnosť (5V WS2812B &amp; Riziko Matrixu)
          </h2>
          
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              Inštalácia v QUEENS obsahuje celkovo <strong>792 LED pri 5V napájaní</strong>. V zadaní je uvedené špecifické hardvérové usporiadanie:
              trubice sú napájané cez PCB kontrolérov a zadný matrix (432 LED) má <em>iba jedno napájanie v strede zigzag kábla</em>.
            </p>
          </div>

          {/* Dôkladný výpočet rizika matrixu */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-white text-base">Inžiniersky výpočet &amp; Analýza rizika stredového napájania matrixu:</h3>
            
            <div className="p-4 bg-red-950/40 border border-red-900/60 rounded text-xs space-y-2">
              <span className="font-bold text-red-400 uppercase font-mono block">
                UPOZORNENIE SENIOR INTEGRÁTORA: Úbytok napätia na 24×18 matrixi
              </span>
              <p className="text-slate-300">
                Matrix má 432 LED s rozostupom 10 cm = <strong>celková dĺžka zigzag kábla je až 43,2 metra!</strong><br />
                Ak je napájanie zapojené iba v strede (na 216. LED), od stredu k obom okrajom vedie <strong>21,6 metra kábla</strong>.
                Prierez vodičov v bežných zigzag pásoch je zvyčajne iba 0,2–0,3 mm² (odpor cca 0,08 &Omega;/m).
                Pri pokuse o rozsvietenie plnej bielej by úbytok napätia na okrajoch dosiahol &Delta;V &gt; 2,1 V, čo by znamenalo pokles napätia na koncoch pod 2,9 V! Výsledok: koncové diódy zhasnú, modré čipy prestanú svietiť a matrix na okrajoch zožltne alebo sčervenie.
              </p>
              <div className="font-mono text-emerald-400 font-semibold pt-1">
                → RIEŠENIE WLED: Softvérový ABL limit na ESP32 #1 nastavený prísne na 12 000 mA (12 A) + zákaz dlhodobej plnej bielej.
                ODPORÚČANIE PRE ELEKTRIKÁRA: Doplniť 2 pomocné injekcie vodičom CYA 1,5 mm² na začiatok a koniec zigzag trasy.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">Teoretické maximum (100 % Biela):</span>
                <span className="text-base text-red-400 font-bold">43,56 A (217,8 W)</span>
                <span className="text-[11px] text-slate-500 block mt-1">792 LED × 55 mA / LED</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">Reálna klubová disco prevádzka:</span>
                <span className="text-base text-amber-400 font-bold">16,0 – 24,0 A (80–120 W)</span>
                <span className="text-[11px] text-slate-500 block mt-1">Queens palety (červená + jantár)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-slate-400 block mb-1">Hardvérový headroom PSU:</span>
                <span className="text-base text-emerald-400 font-bold">&gt; 42 % (Bezpečné)</span>
                <span className="text-[11px] text-slate-500 block mt-1">Mean Well LRS-200-5 + LRS-150-5</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <p>
                <strong>Napájanie trubíc cez PCB kontrolérov:</strong>
                Každá trubica má 60 LED (odber max 1,8 A v disco paletách). Plošné spoje kontrolérov ESP32 #2 a #3 musia mať medené cesty dimenzované na prúd aspoň 5 A na vetvu, alebo je potrebné priviesť 5V priamo na svorkovnicu trubíc.
              </p>
              <p>
                <strong>Fotosenzibilita a bezpečnosť davu:</strong>
                Frekvencia všetkých stroboskopických zmien je striktne obmedzená na <strong>maximálne 3 záblesky za sekundu (&le; 3 Hz)</strong>. Zákaz stroboskopu v bielej farbe chráni návštevníkov pubu pred epileptickým rizikom.
              </p>
              <p>
                <strong>Haze &amp; Dym v priestore QUEENS:</strong>
                Povolený je certifikovaný vodný dym (water-based hazer, napr. Chauvet Hurricane Haze). Teplota hliníkových profilov vertikálnych trubíc po 8 hodinách nepresahuje <strong>39 °C</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* SEKČNÝ BLOK 7 */}
        <section id="sec7" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Wifi className="w-4 h-4" />
            <span>07. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            7. API, integrácie a sieťová topológia (3× ESP32 v QUEENS)
          </h2>
          <div className="text-sm text-slate-300 space-y-3">
            <p>
              Všetky 3 kontroléry ESP32 komunikujú v oddelenej stage podsieti cez fixné statické IP adresy a synchronizujú sa cez <strong>WLED UDP Sync Groups</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-red-400 font-bold block">1. Prepnutie scény na Master ESP32 #1:</span>
              <pre className="bg-slate-950 p-2.5 rounded text-slate-300 overflow-x-auto text-[11px]">
{`POST http://192.168.10.41/json/state
Content-Type: application/json

{
  "on": true,
  "bri": 204,
  "transition": 2,
  "ps": 5
}`}
              </pre>
              <span className="text-slate-400 text-[11px] font-sans block">Aktivuje preset 05 (Royal Crown) a cez UDP Sync Group 1 okamžite prehodí aj trubice.</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-amber-400 font-bold block">2. Núdzové červené svetlo (Safe Crimson):</span>
              <pre className="bg-slate-950 p-2.5 rounded text-slate-300 overflow-x-auto text-[11px]">
{`POST http://192.168.10.41/json/state
Content-Type: application/json

{
  "on": true,
  "bri": 50,
  "ps": 10,
  "transition": 0
}`}
              </pre>
              <span className="text-slate-400 text-[11px] font-sans block">Okamžité bezpečné orientačné svetlo v celom priestore bez prechodu (0 ms).</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2">
              <span className="text-red-400 font-semibold uppercase font-mono">Pripravené konfiguračné súbory WLED 0.15.x:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(SAMPLE_WLED_PRESETS_JSON, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'queens-presets.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-[11px] font-bold"
                >
                  Stiahnuť presets.json
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(SAMPLE_WLED_CFG_ESP1_MASTER_JSON, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cfg-esp1-matrix.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-mono text-[11px] font-bold"
                >
                  Stiahnuť cfg-esp1.json
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(SAMPLE_WLED_CFG_ESP2_TUBES_JSON, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cfg-esp2-tubes.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded font-mono text-[11px] font-bold"
                >
                  Stiahnuť cfg-esp2.json
                </button>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>ESP32 #1 (Matrix Master + Sound):</strong> IP <code className="text-slate-200 font-mono">192.168.10.41</code> · Sync Group 1 (Send &amp; Receive).</li>
              <li><strong>ESP32 #2 (Ľavé trubice 1–3):</strong> IP <code className="text-slate-200 font-mono">192.168.10.42</code> · Sync Group 1 (Receive Only).</li>
              <li><strong>ESP32 #3 (Pravé trubice 4–6):</strong> IP <code className="text-slate-200 font-mono">192.168.10.43</code> · Sync Group 1 (Receive Only).</li>
              <li><strong>Záložný AP mód:</strong> SSID <code className="text-slate-200 font-mono">QUEENS-STAGE-SAFE-AP</code> (kanál 6, WPA2, heslo: queenscrownsafe).</li>
            </ul>
          </div>
        </section>

        {/* SEKČNÝ BLOK 8 */}
        <section id="sec8" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>08. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            8. Spoľahlivosť: Failure-mode analýza (FMEA pre QUEENS)
          </h2>
          <p className="text-sm text-slate-400">
            Analýza zlyhaní zaručuje, že <strong>žiadne technické zlyhanie nespôsobí tmu na pódiu, paniku v sále ani oslepenie DJa</strong>.
          </p>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Režim zlyhania</th>
                  <th className="py-3 px-3">Dôsledok naživo</th>
                  <th className="py-3 px-3">Detekcia</th>
                  <th className="py-3 px-3">Mitigácia &amp; Fail-Safe mechanizmus</th>
                  <th className="py-3 px-3">Garantovaný stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-sans">
                {FMEA_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-red-400 font-mono text-[11px]">
                      {row.failureMode}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {row.liveImpact}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-xs">
                      {row.detectionMethod}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      {row.mitigationAndFailSafe}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-[11px] font-medium">
                      {row.guaranteedState}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEKČNÝ BLOK 9 */}
        <section id="sec9" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
            <Wrench className="w-4 h-4" />
            <span>09. SEKCIÁ</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            9. On-site testovací plán a tweak protokol pre operátora QUEENS
          </h2>
          <div className="text-sm text-slate-300 space-y-3">
            <p>
              Pred otvorením pubu (do 20:30) musí obsluha vykonať predprodukčný kontrolný zoznam vrátane <strong>2-minútového hazard-testu výpadku Wi-Fi routera</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-red-400 font-bold uppercase font-mono">Predprodukčný kontrolný zoznam (Checklist):</span>
              <ul className="space-y-1.5 text-slate-300">
                <li>[✓] <strong>FPS Test:</strong> Kontrola WLED UI info boxu na matrixi – stabilné FPS &ge; 40 pri všetkých 432 LED.</li>
                <li>[✓] <strong>Audio Latencia:</strong> Reakcia 6 trubíc na basový kick pultu do 30 ms (&le; 80 ms KPI).</li>
                <li>[✓] <strong>Zákaz bielej na DJa:</strong> Fyzická kontrola zorného poľa – žiadny biely lúč z trubíc ani matrixu nesmeruje do očí DJa.</li>
                <li>[✓] <strong>Matrix Okraje:</strong> Vizuálna kontrola pri červenej farbe – okraje matrixu nesmú vykazovať pokles jasu.</li>
                <li>[✓] <strong>Hazard-Test (2 min bez siete):</strong> Vypnutie Wi-Fi routera zo zásuvky na 2 minúty. Všetky 3 kontroléry pokračujú v autonómnej synchronizácii.</li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2">
              <span className="text-amber-400 font-bold uppercase font-mono">Tweak protokol pre obsluhu QUEENS (5 zákrokov):</span>
              <div className="space-y-2 text-slate-300">
                {TWEAK_RULES.map((rule) => (
                  <div key={rule.priority} className="border-b border-slate-800/80 pb-1.5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-red-400 font-bold">#{rule.priority}</span>
                      <span className="text-white font-medium">{rule.symptom}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      &rarr; <strong>Riešenie:</strong> {rule.quickAction} (<code className="text-slate-300 font-mono">{rule.wledParameter}</code>)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </article>
    </div>
  );
};

function generateCompleteQueensMarkdown(): string {
  return `# WLED STAGE ARCHITECTURE & PRODUCTION BLUEPRINT · QUEENS PUB PÚCHOV
**Verzia WLED:** 0.15.x  
**Priestor:** Sála cca 150 m² s pódiom · QUEENS pub Púchov (https://www.queenspub.sk/)  
**Inštalácia LED:** 6 vertikálnych trubíc (WS2812B 5V, 360 LED) + 1 zadný matrix 24×18 (432 LED) = 792 LED  
**Kontroléry:** 3× ESP32 (Matrix Master + 2× Slave Tubes) synchronizované cez UDP port 11988  
**Hudba & Program:** Disco + živé koncerty, 80–180 BPM  
**Branding:** Kráľovská koruna QUEENS, Červená (#D90429), Čierna (#0B090A), Biela (#FFFFFF), Zlatá (#F59E0B)  
**Zákazy:** Striktný zákaz plnej bielej smerom na DJ pult!  

---

## 1. SEGMENTÁCIA, MAPOVANIE A SIGHTLINES
- Celkový počet LED: 792 ks (WS2812B, 5V).
- **Segment 0 (Hero Wall Matrix):** 0 – 431 (432 LED, 24×18 zigzag, rozostup 10 cm, ESP32 #1). Hlavná vizuálna kotva 100 % sály, motív kráľovskej koruny.
- **Segment 1 (Tubes Left 1–3):** 0 – 179 (180 LED, 3 trubice po 60 LED, ESP32 #2). Ľavý rám pódia.
- **Segment 2 (Tubes Right 4–6):** 0 – 179 (180 LED, 3 trubice po 60 LED, ESP32 #3). Pravý rám pódia.
- **Segment 3 (Detail Crown):** Sub-segment na matrixe pre motív koruny za DJom/kapelou.
- **Sightlines:** Kamery snímajú stage čelne z parketu. Zákaz bielej na DJa chráni čitateľnosť displayov a zabraňuje prepalom na snímačoch smartfónov.

---

## 2. ART DIRECTION A FAREBNÝ SCENÁR NOCI
**Design Language QUEENS v 3 vetách:**
1. Vizuálna identita stavia na kráľovskej dôstojnosti: hlboká zamatová červená a nepreniknuteľná čierna tvoria dominantný základ, oživený motívom koruny na zadnej stene.
2. Každá scéna prísne dodržiava pravidlo maximálne troch odtieňov (Kráľovská červená #D90429, Čierna #0B090A, Zlatá #F59E0B / Biela #FFFFFF), bez nevkusných dúh.
3. Pohyb svetla kopíruje žánre od 80 BPM (pubový soul/pop) cez živé koncerty až po 145+ BPM disco špičky.

**Pravidlo vrstvenia:** Každá scéna kombinuje aspoň 2 z 3 vrstiev (Wash matrixu, Akcent trubíc, Detail koruny).
**Energetická krivka:**
- 21:00 – 22:30 (Door): 25 % jas, Royal Red & Black (#7A0000, #D90429, #0B090A).
- 22:30 – 00:00 (Warm-up): 40 % jas, Crimson & Amber (#990000, #F59E0B). Pulzovanie 110–122 BPM.
- 00:00 – 01:00 (Concert Live Build): 50 % jas, Sunset Gold & Red (#D90429, #F59E0B). Organické koncertné pozadie.
- 01:00 – 03:30 (Disco Peak): 75–85 % jas, motív koruny na matrixe, trubice ako 6-pásmový audio ekvalizér.
- 03:30 – 05:00 (Outro): 30 % jas, Velvet Amber Fade (#7A0000, #A33B00).

---

## 3. KNIŽNICA PRESETOV (WLED 0.15.x PRE QUEENS)
| Kód | Názov | Efekt | Rýchlosť | Intenzita | Paleta | Jas % | Vrstva | Fáza | Odôvodnenie z praxe |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 01_door_royal_glow | Royal Velvet Glow | Flow (#74) | 16 | 60 | Royal Red (#35) | 25% | Wash | Door | Intímny zamatový úvod bez oslnenia zraku. |
| 02_warmup_vertical_pulse | Vertical Pulse | Breathe (#2) | 34 | 85 | Crimson&Amber (#49) | 40% | Akcent | Warm-up | Trubice jemne pulzujú do tempa 100-115 BPM. |
| 03_concert_sub_amber | Concert Live Wash | Plasma (#88) | 40 | 110 | Sunset Gold (#35) | 50% | Wash | Concert | Organické koncertné pozadie pre živé kapely. |
| 04_build_matrix_chase | Ladder Chase | Chaser (#84) | 120 | 180 | White&Crimson (#57) | 65% | Akcent | Build | Svetlo stúpa po trubiciach k stropu pred dropom. |
| 05_peak_disco_crown | Queens Royal Crown | 2D Freqmatrix (#133) | 155 | 210 | Crown Gold (#14) | 80% | Detail | Disco Peak | Motív koruny na matrixe pulzujúci s kickom. |
| 06_peak_audio_tubes | 6-Band Equalizer | 2D GEQ (#128) | 170 | 230 | Queens Contrast (#57) | 75% | Akcent | Disco Peak | 6 trubíc skáče ako 6 frekvenčných pásiem. |
| 07_drop_stark_red | Stark Red Impact | Solid (#0) | 255 | 255 | Pure Red (#0) | 100% | Wash | Drop | 1s červený úder na 1. dobu. Žiadna biela na DJa. |
| 08_peak_queen_meteor | Rain Meteor Strike | Meteor (#43) | 160 | 220 | Ice&Crimson (#57) | 85% | Akcent | Disco Peak | Kinetický dážď svetla cez trubice a matrix. |
| 09_outro_velvet_fade | Velvet Amber Fade | Flow (#74) | 20 | 50 | Ember Velvet (#35) | 30% | Wash | Outro | Pomalé chladnutie atmosféry pri zatváraní. |
| 10_safe_ambient_red | Emergency Crimson | Solid (#0) | 0 | 0 | Deep Red (#49) | 20% | Wash | Safety | Fail-safe: rovnomerné červené núdzové svetlo (2 A). |

---

## 4. AUDIO-REAKTIVITA & UDP SOUND SYNC
- Zdroj: Master ESP32 #1 na linkovom výstupe mixpultu (Rec/Booth Out), UDP port 11988 broadcast.
- Rozsah žánrov: 80 až 180 BPM (disco, kapely, dance).
- Latencia reakcie: <= 28 ms (KPI <= 80 ms).
- Nastavenia: Attack = 10 ms, Decay = 120 ms, Squelch = 10, Gain = 38.
- Silence Decay: Po 3,5 s ticha automatický fading do jemného Flow (Preset 01), žiadne zamrznutie.

---

## 5. JEDNOSTRANOVÝ RUN-SHEET PRE QUEENS
| Čas | Fáza | Preset | Segmenty | Spúšťač | Akcia | Kliky |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 21:00-22:30 | DOOR | 01_door_royal_glow | Matrix + Trubice (20%) | Čas | Zamatový červený flow | 1 |
| 22:30-00:00 | WARM-UP | 02_warmup_vertical_pulse | Trubice (Akcent) + Matrix | UDP Audio | Pulzovanie do 115 BPM | 1 |
| 00:00-01:00 | LIVE CONCERT | 03_concert_sub_amber | Matrix + Trubice | MANUÁLNE | Teplý koncertný wash pre kapelu | 1 |
| PRE-DROP | BREAKDOWN | 04_build_matrix_chase | Trubice ONLY (Matrix OFF) | UDP Audio | Matrix zhasnutý, trubice letia nahor | 1 |
| DROP | DISCO DROP | 07_drop_stark_red | VŠETKY (max 1 s) | MANUÁLNE | 1s červený úder na 1. dobu beatu | 1 |
| 01:00-03:30 | DISCO PEAK | 05_peak_disco_crown | Matrix Crown + Trubice EQ | UDP Audio | Koruna na matrixe + 6-pásmový EQ | 1 |
| 03:30-05:00 | OUTRO | 09_outro_velvet_fade | Matrix + Trubice | Čas | Tlmený zamatový odchod hostí | 1 |
| NÚDZA | SAFE AMBIENT | 10_safe_ambient_red | VŠETKY SEGMENTY | MANUÁLNE | Červené orientačné svetlo, stop blikania | 1 |

---

## 6. NAPÁJANIE, TEPLO A BEZPEČNOSŤ (5V WS2812B)
- Celkový počet LED: 792 ks (360 trubice + 432 matrix).
- Teoretické maximum (100% biela): 792 × 55 mA = 43,56 A (217,8 W).
- Reálna disco/koncertná prevádzka: 16,0 – 24,0 A (80–120 W).
- **Riziko stredového napájania matrixu:** 432 LED s rozostupom 10 cm = 43,2 m zigzag kábla! Z jedného stredového bodu je to 21,6 m na okraj. Pri plnom jase by Delta V presiahol 2,1 V a okraje by zlyhali.
  - Softvérová ochrana: WLED ABL limit na ESP32 #1 nastavený na 12 000 mA (12 A).
  - Hardvérové odporúčanie: Doplniť 2 pomocné injekcie vodičom CYA 1,5 mm² na začiatok a koniec trasy.
- Zdroje: Mean Well LRS-200-5 (matrix) + LRS-150-5 (trubice). Headroom > 42 %.
- Bezpečnosť: Zákaz plnej bielej na DJ pult! Fotosenzibilita <= 3 Hz. Teplota profilov <= 39 °C.

---

## 7. API, INTEGRÁCIE A SIEŤ (3× ESP32)
- Statické IP: Matrix Master 192.168.10.41, Ľavé trubice 192.168.10.42, Pravé trubice 192.168.10.43.
- UDP Sync Groups: Group 1 (All Stage), Group 2 (Tubes Only), Group 3 (Matrix Only).
- AP Fallback: QUEENS-STAGE-SAFE-AP (kanál 6, heslo: queenscrownsafe).
- Zálohy: presets.json a cfg.json uložené vo flash pamäti každého ESP32.

---

## 8. FMEA ANALÝZA ZLYHANÍ
- Reboot ESP32 #1 -> Boot Preset 10 rozsvieti Safe Crimson do 1,8 s; slave trubice pokračujú lokálne.
- Výpadok Wi-Fi -> Kontroléry pokračujú autonómne z flash pamäte; Master aktivuje záložný AP.
- Pád UDP zvuku -> Silence decay do jemného Flow po 3,5 s ticha; žiadny zamrznutý bod.
- Úbytok napätia na matrixi -> ABL obmedzovač chráni farby pred žltnutím/červenaním.
- Prehriatie PCB trubíc -> Prúd obmedzený na 2,8 A na kanál; pasívne chladenie hliníkovou lištou.

---

## 9. ON-SITE TESTOVACÍ PLÁN A TWEAK PROTOKOL
- Checklist: FPS >= 40, Audio latencia <= 30 ms, Kontrola zákazu bielej na DJa, Kontrola okrajov matrixu, Hazard-test (vypnutie routera na 2 min).
- Tweak hierarchia: 1. Master Brightness (zníž na 50 %), 2. Rýchlosť trubíc (zníž pod 3 Hz), 3. Audio Squelch (uprav pre kapelu vs DJ), 4. Paleta (prepnúť na Queens Pure Red cez dym), 5. Matrix ABL Limit (stiahni na 10 000 mA).
`;
}
