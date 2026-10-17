export interface MidiMapping {
  controlId: string;
  name: string;
  type: 'note' | 'cc';
  number: number; // Note number (0-127) or CC number (0-127)
  channel: number; // 1-16 (0 = any)
}

export interface MidiEventLog {
  timestamp: number;
  type: 'noteon' | 'noteoff' | 'cc';
  number: number;
  value: number;
  channel: number;
  rawStr: string;
}

export interface AppActionDefinition {
  id: string;
  name: string;
  category: 'Taktické Akcie' | 'WLED Presety' | 'Master Fadery';
  description: string;
  defaultType: 'note' | 'cc';
  defaultNumber: number;
}

export const APP_INTERNAL_ACTIONS: AppActionDefinition[] = [
  // Taktické Akcie
  {
    id: 'action_emergency',
    name: 'Emergency Safe Red',
    category: 'Taktické Akcie',
    description: 'Okamžité uzamknutie do tlmeného červeného orientačného svetla (Preset 10)',
    defaultType: 'note',
    defaultNumber: 50,
  },
  {
    id: 'action_blackout',
    name: 'Blackout / Silence',
    category: 'Taktické Akcie',
    description: 'Okamžité zhasnutie pódia pred dropom (budovanie napätia v sále)',
    defaultType: 'note',
    defaultNumber: 49,
  },
  {
    id: 'action_drop_flash',
    name: 'Drop Stark Red (1s)',
    category: 'Taktické Akcie',
    description: '1-sekundový tvrdý červený úder na 1. dobu beatu s automatickým návratom',
    defaultType: 'note',
    defaultNumber: 48,
  },

  // Master Fadery
  {
    id: 'fader_brightness',
    name: 'Master Brightness (Fader)',
    category: 'Master Fadery',
    description: 'Plynulá regulácia globálneho jasu scény (0–100 %)',
    defaultType: 'cc',
    defaultNumber: 1,
  },
  {
    id: 'fader_speed',
    name: 'Effect Speed (Fader)',
    category: 'Master Fadery',
    description: 'Regulácia rýchlosti WLED efektu na pódiu (0–255)',
    defaultType: 'cc',
    defaultNumber: 2,
  },

  // WLED Presety 1–10
  {
    id: 'preset_1',
    name: 'Preset 1: Royal Velvet Glow',
    category: 'WLED Presety',
    description: 'Door fáza: Zamatový červený flow, intímne uvítanie hostí',
    defaultType: 'note',
    defaultNumber: 36,
  },
  {
    id: 'preset_2',
    name: 'Preset 2: Vertical Pulse',
    category: 'WLED Presety',
    description: 'Warm-up fáza: Vertikálne trubice jemne pulzujú do tempa 115 BPM',
    defaultType: 'note',
    defaultNumber: 37,
  },
  {
    id: 'preset_3',
    name: 'Preset 3: Concert Live Wash',
    category: 'WLED Presety',
    description: 'Concert fáza: Teplý jantárový podmaz pre živé kapely',
    defaultType: 'note',
    defaultNumber: 38,
  },
  {
    id: 'preset_4',
    name: 'Preset 4: Ladder Chase',
    category: 'WLED Presety',
    description: 'Build fáza: Svetlo stúpa po trubiciach k stropu pred dropom',
    defaultType: 'note',
    defaultNumber: 39,
  },
  {
    id: 'preset_5',
    name: 'Preset 5: Queens Royal Crown',
    category: 'WLED Presety',
    description: 'Disco Peak: Motív kráľovskej koruny pulzujúci na zadnom matrixi',
    defaultType: 'note',
    defaultNumber: 40,
  },
  {
    id: 'preset_6',
    name: 'Preset 6: 6-Band Equalizer',
    category: 'WLED Presety',
    description: 'Disco Peak: 6 trubíc funguje ako živý 6-pásmový audio ekvalizér',
    defaultType: 'note',
    defaultNumber: 41,
  },
  {
    id: 'preset_7',
    name: 'Preset 7: Stark Red Impact',
    category: 'WLED Presety',
    description: 'Drop fáza: Monochromatický červený úder (zákaz bielej na DJa)',
    defaultType: 'note',
    defaultNumber: 42,
  },
  {
    id: 'preset_8',
    name: 'Preset 8: Rain Meteor Strike',
    category: 'WLED Presety',
    description: 'Disco Peak: Dážď svetla padajúci súčasne cez matrix aj trubice',
    defaultType: 'note',
    defaultNumber: 43,
  },
  {
    id: 'preset_9',
    name: 'Preset 9: Velvet Amber Fade',
    category: 'WLED Presety',
    description: 'Outro fáza: Pokojné zamatové dohasínanie atmosféry pri zatváraní',
    defaultType: 'note',
    defaultNumber: 44,
  },
  {
    id: 'preset_10',
    name: 'Preset 10: Safe Crimson Ambient',
    category: 'WLED Presety',
    description: 'Safety fáza: Havarijné statické červené svetlo pri nízkom odbere',
    defaultType: 'note',
    defaultNumber: 45,
  },
];

export const DEFAULT_MIDI_MAPPINGS: Record<string, MidiMapping> = APP_INTERNAL_ACTIONS.reduce((acc, action) => {
  acc[action.id] = {
    controlId: action.id,
    name: action.name,
    type: action.defaultType,
    number: action.defaultNumber,
    channel: 1,
  };
  return acc;
}, {} as Record<string, MidiMapping>);
