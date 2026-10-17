import React, { useState } from 'react';
import { Download, Copy, Check, Send, Crown, Layers, Server } from 'lucide-react';
import { 
  SAMPLE_WLED_PRESETS_JSON, 
  SAMPLE_WLED_CFG_ESP1_MASTER_JSON, 
  SAMPLE_WLED_CFG_ESP2_TUBES_JSON 
} from '../data/wledData';

export const JsonStudio: React.FC = () => {
  const [activeJsonTab, setActiveJsonTab] = useState<'presets' | 'cfg_esp1' | 'cfg_esp2' | 'rest'>('presets');
  const [copied, setCopied] = useState(false);
  const [espIp, setEspIp] = useState('192.168.10.41');
  const [selectedPresetId, setSelectedPresetId] = useState('5');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const presetsJsonString = JSON.stringify(SAMPLE_WLED_PRESETS_JSON, null, 2);
  const cfgEsp1String = JSON.stringify(SAMPLE_WLED_CFG_ESP1_MASTER_JSON, null, 2);
  const cfgEsp2String = JSON.stringify(SAMPLE_WLED_CFG_ESP2_TUBES_JSON, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSimulateRestDispatch = () => {
    setDispatchStatus('Odosielam JSON payload na Master ESP32 (' + espIp + ')...');
    setTimeout(() => {
      setDispatchStatus(`Úspech: POST http://${espIp}/json/state -> HTTP 200 OK (Preset ${selectedPresetId} aktivovaný na pódiu)`);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono text-red-500 font-semibold tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5" />
            Integrácia &amp; Konfigurácie 3× ESP32 · QUEENS Pub Púchov
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            WLED JSON API Studio &amp; Multi-Controller Backup
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Súbory <code className="text-red-400">presets.json</code> a hardvérové konfigurácie pre Master ESP32 #1 (Matrix) a Slave ESP32 #2 a #3 (Trubice) pripravené na priame nahratie do WLED.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveJsonTab('presets')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeJsonTab === 'presets'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            presets.json (Všetky)
          </button>
          <button
            onClick={() => setActiveJsonTab('cfg_esp1')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeJsonTab === 'cfg_esp1'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            cfg-esp1-matrix.json
          </button>
          <button
            onClick={() => setActiveJsonTab('cfg_esp2')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeJsonTab === 'cfg_esp2'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            cfg-esp2-tubes.json
          </button>
          <button
            onClick={() => setActiveJsonTab('rest')}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeJsonTab === 'rest'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REST Dispatcher
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeJsonTab === 'presets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <span className="font-semibold text-white text-sm block">
                Spoločná knižnica presetov pre QUEENS (presets.json)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Obsahuje definície 10 presetov pre 24×18 matrix aj bočné trubice.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleCopy(presetsJsonString)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopírované' : 'Kopírovať JSON'}
              </button>
              <button
                onClick={() => handleDownload(presetsJsonString, 'queens-presets.json')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Stiahnuť presets.json
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px]">
            {presetsJsonString}
          </pre>
        </div>
      )}

      {activeJsonTab === 'cfg_esp1' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <span className="font-semibold text-white text-sm block">
                Konfigurácia Master ESP32 #1: Zadný Matrix 24×18 (cfg-esp1.json)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                IP 192.168.10.41 &middot; GPIO 16 (432 LED zigzag) &middot; ABL limit 12 000 mA &middot; Sync Master
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleCopy(cfgEsp1String)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopírované' : 'Kopírovať JSON'}
              </button>
              <button
                onClick={() => handleDownload(cfgEsp1String, 'cfg-esp1-matrix-master.json')}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Stiahnuť cfg-esp1.json
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px]">
            {cfgEsp1String}
          </pre>
        </div>
      )}

      {activeJsonTab === 'cfg_esp2' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <span className="font-semibold text-white text-sm block">
                Konfigurácia Slave ESP32 #2 &amp; #3: Vertikálne trubice (cfg-esp2.json)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                IP 192.168.10.42 / 43 &middot; GPIO 16, 17, 18 (3× 60 LED) &middot; Sync Slave
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handleCopy(cfgEsp2String)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopírované' : 'Kopírovať JSON'}
              </button>
              <button
                onClick={() => handleDownload(cfgEsp2String, 'cfg-esp2-tubes-slave.json')}
                className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Stiahnuť cfg-esp2.json
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px]">
            {cfgEsp2String}
          </pre>
        </div>
      )}

      {activeJsonTab === 'rest' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
          <span className="text-xs uppercase font-mono text-slate-400 font-semibold block">
            Priame testovanie volania WLED REST API na pódiu
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-mono block mb-1">
                Cieľová IP adresa Master ESP32 #1:
              </label>
              <input
                type="text"
                value={espIp}
                onChange={(e) => setEspIp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-mono block mb-1">
                Aktivovať Preset QUEENS:
              </label>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:border-red-500 focus:outline-none"
              >
                <option value="1">Preset 1: 01_door_royal_glow</option>
                <option value="2">Preset 2: 02_warmup_vertical_pulse</option>
                <option value="3">Preset 3: 03_concert_sub_amber</option>
                <option value="4">Preset 4: 04_build_matrix_chase</option>
                <option value="5">Preset 5: 05_peak_disco_crown (Royal Crown)</option>
                <option value="7">Preset 7: 07_drop_stark_red (Zákaz bielej)</option>
                <option value="10">Preset 10: 10_safe_ambient_red (Núdza)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded border border-slate-800 font-mono text-xs space-y-2">
            <span className="text-slate-400 block text-[11px]">curl príkaz:</span>
            <div className="text-red-400 overflow-x-auto text-[11px]">
              curl -X POST -H &quot;Content-Type: application/json&quot; -d &apos;&#123;&quot;on&quot;:true,&quot;ps&quot;:{selectedPresetId},&quot;transition&quot;:2&#125;&apos; http://{espIp}/json/state
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateRestDispatch}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow"
            >
              <Send className="w-3.5 h-3.5" />
              Odoslať príkaz na Master ESP32
            </button>
            {dispatchStatus && (
              <span className="text-xs font-mono text-emerald-400 animate-fade-in">
                {dispatchStatus}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
