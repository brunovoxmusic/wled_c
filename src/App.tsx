import React, { useState, useCallback } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { LiveConsole } from './components/LiveConsole';
import { RunSheetController } from './components/RunSheetController';
import { PowerCalculator } from './components/PowerCalculator';
import { MasterDocumentView } from './components/MasterDocumentView';
import { MidiMappingManager } from './components/MidiMappingManager';
import { StageCanvasWidget } from './components/StageCanvasWidget';
import { WLED_PRESETS, WledPreset } from './data/wledData';
import { useMidi } from './hooks/useMidi';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [currentPreset, setCurrentPreset] = useState<WledPreset>(WLED_PRESETS[4]); // 05_peak_disco_crown
  const [previousPreset, setPreviousPreset] = useState<WledPreset>(WLED_PRESETS[4]);
  const [audioEnergy, setAudioEnergy] = useState<number>(0.5);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);

  const handleSelectPreset = useCallback((preset: WledPreset) => {
    setCurrentPreset(preset);
    if (preset.code === '10_safe_ambient_red') {
      setIsEmergencyActive(true);
    } else {
      setIsEmergencyActive(false);
      setPreviousPreset(preset);
    }
  }, []);

  const handleEmergencyTrigger = useCallback(() => {
    setIsEmergencyActive(prev => {
      if (prev) {
        setCurrentPreset(previousPreset);
        return false;
      } else {
        setPreviousPreset(currentPreset);
        const safePreset = WLED_PRESETS.find(p => p.code === '10_safe_ambient_red') || WLED_PRESETS[9];
        setCurrentPreset(safePreset);
        return true;
      }
    });
  }, [currentPreset, previousPreset]);

  // MIDI control callback
  const handleMidiTrigger = useCallback((controlId: string, value?: number) => {
    const id = controlId.toLowerCase().trim();

    // Check if it's Emergency
    if (id.includes('emergency')) {
      handleEmergencyTrigger();
      return;
    }

    // Check if it's Blackout
    if (id.includes('blackout')) {
      const blackoutPreset = WLED_PRESETS.find(p => p.code === '01_door_royal_glow') || WLED_PRESETS[0];
      handleSelectPreset({ ...blackoutPreset, brightnessPct: 0 });
      return;
    }

    // Check if it's Drop Flash
    if (id.includes('drop')) {
      const dropPreset = WLED_PRESETS.find(p => p.code === '07_drop_stark_red') || WLED_PRESETS[6];
      handleSelectPreset(dropPreset);
      setTimeout(() => {
        const peakPreset = WLED_PRESETS.find(p => p.code === '05_peak_disco_crown') || WLED_PRESETS[4];
        handleSelectPreset(peakPreset);
      }, 1000);
      return;
    }

    // Check if it's a preset pad (e.g. preset_1, preset 1, Preset 1, etc.)
    const presetMatch = id.match(/preset[_\s]*(\d+)/i);
    if (presetMatch) {
      const pId = parseInt(presetMatch[1], 10);
      const targetPreset = WLED_PRESETS.find(p => p.id === pId);
      if (targetPreset) {
        handleSelectPreset(targetPreset);
        return;
      }
    }

    // Master Brightness Fader
    if (id.includes('brightness') && typeof value === 'number') {
      const mappedBri = Math.round((value / 127) * 100);
      setCurrentPreset(prev => ({ ...prev, brightnessPct: mappedBri }));
      return;
    }

    // Master Speed Fader
    if (id.includes('speed') && typeof value === 'number') {
      const mappedSpeed = Math.round((value / 127) * 255);
      setCurrentPreset(prev => ({ ...prev, speed: mappedSpeed }));
      return;
    }
  }, [handleSelectPreset, handleEmergencyTrigger]);

  const midiState = useMidi(handleMidiTrigger);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Header Contract */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onEmergencyTrigger={handleEmergencyTrigger}
        isEmergencyActive={isEmergencyActive}
        midiConnected={midiState.isConnected}
      />

      {/* ADAPTIVE STAGE CANVAS WIDGET (Mobile Sticky Dock & Desktop Floating Drag & Drop) */}
      <StageCanvasWidget
        currentPreset={currentPreset}
        audioEnergy={audioEnergy}
        masterBrightness={currentPreset.brightnessPct}
        masterSpeed={currentPreset.speed}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'console' && (
          <LiveConsole
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            onEmergencyTrigger={handleEmergencyTrigger}
            isEmergencyActive={isEmergencyActive}
            audioEnergy={audioEnergy}
            onAudioEnergyUpdate={setAudioEnergy}
            onOpenMidiManager={() => setActiveTab('midi_manager')}
            midiState={midiState}
          />
        )}

        {activeTab === 'midi_manager' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <MidiMappingManager
              mappings={midiState.mappings}
              learningControlId={midiState.learningControlId}
              onStartLearning={midiState.startLearning}
              onUpdateMapping={midiState.updateSingleMapping}
              onClearMapping={midiState.clearMapping}
              onResetToDefaults={midiState.resetToDefaults}
              onClearAllMappings={midiState.clearAllMappings}
              onSaveMappings={midiState.saveMappings}
              onTriggerAction={handleMidiTrigger}
              isConnected={midiState.isConnected}
              devices={midiState.devices}
              lastEvent={midiState.lastEvent}
              onSendVirtualMidi={midiState.sendVirtualMidi}
            />
          </div>
        )}

        {activeTab === 'runsheet' && (
          <RunSheetController
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            onEmergencyTrigger={handleEmergencyTrigger}
          />
        )}

        {activeTab === 'power' && <PowerCalculator />}

        {activeTab === 'doc' && <MasterDocumentView />}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-6 text-center text-xs text-slate-500 font-mono no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-bold text-slate-300">QUEENS Pub Púchov &middot; WLED 0.15.x Live Workstation</span>
          </div>
          <span className="text-slate-400">
            792 LED (6 Trubíc + 24×18 Matrix) &middot; Web MIDI &middot; UDP Port 11988
          </span>
        </div>
      </footer>
    </div>
  );
}
