import React, { useState } from 'react';
import { 
  Radio, 
  Settings2, 
  RotateCcw, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Sliders, 
  Check, 
  Play, 
  Sparkles,
  Zap,
  ShieldAlert,
  Moon,
  Volume2,
  Crown
} from 'lucide-react';
import { APP_INTERNAL_ACTIONS, AppActionDefinition, MidiMapping, DEFAULT_MIDI_MAPPINGS } from '../types/midi';

interface MidiMappingManagerProps {
  mappings: Record<string, MidiMapping>;
  learningControlId: string | null;
  onStartLearning: (controlId: string) => void;
  onUpdateMapping: (controlId: string, updatedFields: Partial<MidiMapping>) => void;
  onClearMapping: (controlId: string) => void;
  onResetToDefaults: () => void;
  onClearAllMappings: () => void;
  onSaveMappings: (mappings: Record<string, MidiMapping>) => void;
  onTriggerAction: (controlId: string, value?: number) => void;
  isConnected: boolean;
  devices: string[];
  lastEvent: any;
  onSendVirtualMidi: (type: 'note' | 'cc', number: number, value?: number) => void;
  onClose?: () => void;
}

export const MidiMappingManager: React.FC<MidiMappingManagerProps> = ({
  mappings,
  learningControlId,
  onStartLearning,
  onUpdateMapping,
  onClearMapping,
  onResetToDefaults,
  onClearAllMappings,
  onSaveMappings,
  onTriggerAction,
  isConnected,
  devices,
  lastEvent,
  onSendVirtualMidi,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [recentlyTriggered, setRecentlyTriggered] = useState<string | null>(null);

  // Filter actions
  const filteredActions = APP_INTERNAL_ACTIONS.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTestTrigger = (controlId: string, type: 'note' | 'cc', number: number) => {
    setRecentlyTriggered(controlId);
    onTriggerAction(controlId, type === 'cc' ? 127 : 127);
    setTimeout(() => {
      setRecentlyTriggered(null);
    }, 600);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mappings, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', 'queens_midi_mappings.json');
    dlAnchorElem.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            onSaveMappings(parsed);
          }
        } catch (err) {
          // ignore invalid
        }
      };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-2xl">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              MidiMappingManager &middot; Vizuálne Pre-Mapovanie Kontrolérov
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mapovanie interných akcií QUEENS (Emergency, Blackout, Drop, Presety 1–10, Fadery) na hardvérové MIDI Note a CC správy. Zmeny sa okamžite ukladajú do <code className="text-red-400 font-mono">localStorage</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onResetToDefaults}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Obnoviť predvolené mapovanie Akai / Launchpad"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Launchpad Default
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <label className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold ml-2"
            >
              Hotovo
            </button>
          )}
        </div>
      </div>

      {/* Live MIDI Telemetry Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Hardvérový stav:</span>
          <span className={`font-bold flex items-center gap-1.5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            <Radio className="w-3.5 h-3.5" />
            {isConnected ? 'MIDI Rozhranie Aktívne' : 'Simulovaný / iFrame Mód'}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between truncate">
          <span className="text-slate-400 shrink-0 mr-2">Zariadenia:</span>
          <span className="text-slate-200 truncate font-semibold">
            {devices.length > 0 ? devices.join(', ') : 'Virtuálna klávesnica'}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between truncate">
          <span className="text-slate-400 shrink-0 mr-2">Posledný signál:</span>
          <span className="text-red-400 font-bold truncate">
            {lastEvent ? lastEvent.rawStr : 'Čakám na MIDI...'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {['all', 'Taktické Akcie', 'WLED Presety', 'Master Fadery'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Všetky akcie' : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hľadať akciu alebo preset..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-red-500 text-xs"
          />
        </div>
      </div>

      {/* Main Mapping Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 w-5/12">Interná Akcia v Aplikácii</th>
              <th className="py-3 px-3 w-2/12">Typ Správy</th>
              <th className="py-3 px-3 w-2/12">Číslo Noty / CC (0–127)</th>
              <th className="py-3 px-3 w-1.5/12">MIDI Kanál</th>
              <th className="py-3 px-4 w-1.5/12 text-right">Learn &amp; Test</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredActions.map((action) => {
              const currentMap = mappings[action.id] || {
                controlId: action.id,
                name: action.name,
                type: action.defaultType,
                number: action.defaultNumber,
                channel: 1,
              };

              const isLearningThis = learningControlId === action.id;
              const isTriggered = recentlyTriggered === action.id;

              return (
                <tr 
                  key={action.id}
                  className={`transition-colors ${
                    isTriggered
                      ? 'bg-red-500/20'
                      : isLearningThis
                      ? 'bg-amber-400/15'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  {/* Left Column: Action Name & Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        {action.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        action.category === 'Taktické Akcie'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : action.category === 'Master Fadery'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {action.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {action.description}
                    </div>
                  </td>

                  {/* Right Column 1: Type (Note vs CC) */}
                  <td className="py-3 px-3">
                    <select
                      value={currentMap.type}
                      onChange={(e) => onUpdateMapping(action.id, { type: e.target.value as 'note' | 'cc' })}
                      className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="note">MIDI Note</option>
                      <option value="cc">Control Change (CC)</option>
                    </select>
                  </td>

                  {/* Right Column 2: Note / CC Number */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={127}
                        value={currentMap.number}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(127, parseInt(e.target.value || '0', 10)));
                          onUpdateMapping(action.id, { number: val });
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-bold focus:outline-none focus:border-red-500"
                      />
                      <span className="text-[11px] text-slate-500">
                        ({currentMap.type === 'note' ? `Nota ${currentMap.number}` : `CC #${currentMap.number}`})
                      </span>
                    </div>
                  </td>

                  {/* Right Column 3: MIDI Channel */}
                  <td className="py-3 px-3">
                    <select
                      value={currentMap.channel || 1}
                      onChange={(e) => onUpdateMapping(action.id, { channel: parseInt(e.target.value, 10) })}
                      className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value={0}>Všetky (Omni)</option>
                      {Array.from({ length: 16 }, (_, i) => i + 1).map(ch => (
                        <option key={ch} value={ch}>Kanál {ch}</option>
                      ))}
                    </select>
                  </td>

                  {/* Right Column 4: Learn & Test Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Test trigger */}
                      <button
                        onClick={() => handleTestTrigger(action.id, currentMap.type, currentMap.number)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 font-semibold"
                        title="Vyskúšať akciu teraz"
                      >
                        <Play className="w-3 h-3 text-emerald-400" />
                        Test
                      </button>

                      {/* MIDI Learn Button */}
                      <button
                        onClick={() => onStartLearning(action.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          isLearningThis
                            ? 'bg-amber-400 text-slate-950 animate-pulse shadow-md shadow-amber-400/40'
                            : 'bg-red-600/80 hover:bg-red-600 text-white'
                        }`}
                        title="Počúvať stlačenie tlačidla na MIDI kontroléri"
                      >
                        {isLearningThis ? 'Počúvam...' : 'Learn'}
                      </button>

                      {/* Clear mapping */}
                      <button
                        onClick={() => onClearMapping(action.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                        title="Vymazať toto mapovanie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 pt-1 gap-2">
        <div className="space-y-0.5">
          <p>
            <strong>Tip integrátora:</strong> Kliknutím na <strong>Learn</strong> stačí stlačiť pad alebo otočiť fader na fyzickom MIDI kontroléri a hodnota sa priradí automaticky.
          </p>
          <p className="text-slate-500 text-[11px]">
            Mapovania sú perzistentne uložené v lokálnom úložisku prehliadača (localStorage).
          </p>
        </div>

        <button
          onClick={onClearAllMappings}
          className="text-red-400 hover:text-red-300 text-[11px] underline font-mono shrink-0"
        >
          Vymazať všetky mapovania
        </button>
      </div>

    </div>
  );
};
