import { useState, useEffect, useCallback, useRef } from 'react';
import { MidiMapping, MidiEventLog, DEFAULT_MIDI_MAPPINGS } from '../types/midi';

export const MIDI_STORAGE_KEY = 'queens_midi_mappings';

export function useMidi(
  onTriggerControl: (controlId: string, value?: number) => void
) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [learningControlId, setLearningControlId] = useState<string | null>(null);
  const [mappings, setMappings] = useState<Record<string, MidiMapping>>(() => {
    try {
      const saved = localStorage.getItem(MIDI_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_MIDI_MAPPINGS;
  });
  const [lastEvent, setLastEvent] = useState<MidiEventLog | null>(null);
  const [midiNotice, setMidiNotice] = useState<string | null>(null);

  const mappingsRef = useRef(mappings);
  mappingsRef.current = mappings;

  const learningRef = useRef(learningControlId);
  learningRef.current = learningControlId;

  const onTriggerRef = useRef(onTriggerControl);
  onTriggerRef.current = onTriggerControl;

  // Save mappings to localStorage
  const saveMappings = useCallback((newMappings: Record<string, MidiMapping>) => {
    setMappings(newMappings);
    try {
      localStorage.setItem(MIDI_STORAGE_KEY, JSON.stringify(newMappings));
    } catch (e) {
      // ignore
    }
  }, []);

  // Update a single control's mapping
  const updateSingleMapping = useCallback((controlId: string, updatedFields: Partial<MidiMapping>) => {
    setMappings(prev => {
      const current = prev[controlId] || {
        controlId,
        name: controlId,
        type: 'note',
        number: 0,
        channel: 1,
      };
      const updated = {
        ...prev,
        [controlId]: {
          ...current,
          ...updatedFields,
        },
      };
      try {
        localStorage.setItem(MIDI_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  }, []);

  // Process incoming MIDI message
  const handleMidiMessage = useCallback((event: any) => {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const command = status >> 4;
    const channel = (status & 0xf) + 1;
    const number = data[1];
    const value = data.length > 2 ? data[2] : 0;

    let eventType: 'noteon' | 'noteoff' | 'cc' | null = null;

    if (command === 9) {
      // Note On
      eventType = value > 0 ? 'noteon' : 'noteoff';
    } else if (command === 8) {
      // Note Off
      eventType = 'noteoff';
    } else if (command === 11) {
      // CC
      eventType = 'cc';
    }

    if (!eventType) return;

    const logItem: MidiEventLog = {
      timestamp: Date.now(),
      type: eventType,
      number,
      value,
      channel,
      rawStr: `${eventType.toUpperCase()} #${number} (Val: ${value}, Ch: ${channel})`,
    };
    setLastEvent(logItem);

    // If in Learn Mode:
    const activeLearning = learningRef.current;
    if (activeLearning && (eventType === 'noteon' || eventType === 'cc')) {
      const updated = { ...mappingsRef.current };
      updated[activeLearning] = {
        controlId: activeLearning,
        name: updated[activeLearning]?.name || activeLearning,
        type: eventType === 'noteon' ? 'note' : 'cc',
        number,
        channel,
      };
      saveMappings(updated);
      setLearningControlId(null);
      return;
    }

    // Normal mode: check if mapped
    if (eventType === 'noteon') {
      for (const [ctrlId, map] of Object.entries(mappingsRef.current)) {
        if (map.type === 'note' && map.number === number) {
          if (!map.channel || map.channel === 0 || map.channel === channel) {
            onTriggerRef.current(ctrlId, value);
          }
        }
      }
    } else if (eventType === 'cc') {
      for (const [ctrlId, map] of Object.entries(mappingsRef.current)) {
        if (map.type === 'cc' && map.number === number) {
          if (!map.channel || map.channel === 0 || map.channel === channel) {
            onTriggerRef.current(ctrlId, value);
          }
        }
      }
    }
  }, [saveMappings]);

  // Request Web MIDI Access safely
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      setIsSupported(false);
      return;
    }

    let midiAccessObj: any = null;

    navigator.requestMIDIAccess({ sysex: false })
      .then((midiAccess) => {
        midiAccessObj = midiAccess;
        setIsConnected(true);

        const updateInputs = () => {
          const inputNames: string[] = [];
          midiAccess.inputs.forEach((input: any) => {
            inputNames.push(input.name || 'Neznáme MIDI zariadenie');
            input.onmidimessage = handleMidiMessage;
          });
          setDevices(inputNames);
        };

        updateInputs();
        midiAccess.onstatechange = updateInputs;
      })
      .catch(() => {
        setIsConnected(false);
        setMidiNotice('Web MIDI API je v iFrame režime v simulovanom móde. Môžete použiť virtuálnu klávesnicu alebo pripojiť kontrolér.');
      });

    return () => {
      if (midiAccessObj) {
        midiAccessObj.inputs?.forEach((input: any) => {
          input.onmidimessage = null;
        });
      }
    };
  }, [handleMidiMessage]);

  // Virtual MIDI trigger for testing
  const sendVirtualMidi = useCallback((type: 'note' | 'cc', number: number, value: number = 127) => {
    handleMidiMessage({
      data: [type === 'note' ? 0x90 : 0xB0, number, value],
    });
  }, [handleMidiMessage]);

  const startLearning = useCallback((controlId: string) => {
    setLearningControlId(prev => prev === controlId ? null : controlId);
  }, []);

  const resetToDefaults = useCallback(() => {
    saveMappings(DEFAULT_MIDI_MAPPINGS);
    setLearningControlId(null);
  }, [saveMappings]);

  const clearMapping = useCallback((controlId: string) => {
    setMappings(prev => {
      const updated = { ...prev };
      delete updated[controlId];
      try {
        localStorage.setItem(MIDI_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  }, []);

  const clearAllMappings = useCallback(() => {
    setMappings({});
    try {
      localStorage.setItem(MIDI_STORAGE_KEY, JSON.stringify({}));
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    isSupported,
    isConnected,
    devices,
    selectedDevice,
    setSelectedDevice,
    learningControlId,
    startLearning,
    mappings,
    saveMappings,
    updateSingleMapping,
    resetToDefaults,
    clearMapping,
    clearAllMappings,
    lastEvent,
    sendVirtualMidi,
    midiNotice,
    setMidiNotice,
  };
}
