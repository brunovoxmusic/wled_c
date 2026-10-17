export interface WledSegment {
  id: number;
  name: string;
  role: 'hero' | 'accent' | 'wash' | 'detail';
  controller: string;
  gpio: string;
  startLed: number;
  stopLed: number;
  ledCount: number;
  physicalLocation: string;
  sightlineNotes: string;
}

export interface WledPreset {
  id: number;
  code: string;
  name: string;
  effectName: string;
  effectId: number;
  speed: number;
  intensity: number;
  paletteName: string;
  paletteColors: string[];
  brightnessPct: number;
  targetLayer: 'Wash' | 'Akcent' | 'Detail';
  phase: 'Door' | 'Warm-up' | 'Concert / Build' | 'Disco Peak' | 'Drop' | 'Outro' | 'Safety';
  empiricalRationale: string;
}

export interface RunSheetRow {
  timeWindow: string;
  phase: string;
  musicEnergy: string;
  presetCode: string;
  presetName: string;
  primarySegments: string;
  triggerType: 'Čas / Autonómne' | 'UDP Audio Beat' | 'MANUÁLNE (1 klik)';
  lightingAction: string;
  kpiActionCount: number;
}

export interface FmeaRow {
  failureMode: string;
  liveImpact: string;
  detectionMethod: string;
  mitigationAndFailSafe: string;
  guaranteedState: string;
}

export interface TweakRule {
  priority: number;
  symptom: string;
  quickAction: string;
  wledParameter: string;
  safetyReason: string;
}

// 1. Segmentácia pre QUEENS pub Púchov (792 LED celkovo: 360 v trubiciach + 432 v matrixi)
export const WLED_SEGMENTS: WledSegment[] = [
  {
    id: 0,
    name: 'Zadný Stage Matrix 24×18 (Hero Wall)',
    role: 'hero',
    controller: 'ESP32 #1 (Master Sound & Matrix)',
    gpio: 'GPIO 16',
    startLed: 0,
    stopLed: 432,
    ledCount: 432,
    physicalLocation: 'Zadná stena pódia (24 stĺpcov × 18 riadkov, zigzag rozostup 10 cm, plocha 2,4 × 1,8 m)',
    sightlineNotes: 'Absolútny stred pozornosti celej 150 m² sály. Zobrazuje grafiku kráľovskej koruny, 2D ekvalizér a textúry.',
  },
  {
    id: 1,
    name: 'Ľavé vertikálne trubice (Tubes Left 1–3)',
    role: 'accent',
    controller: 'ESP32 #2 (Slave Stage Left)',
    gpio: 'GPIO 16, 17, 18',
    startLed: 0,
    stopLed: 180,
    ledCount: 180,
    physicalLocation: 'Ľavé hliníkové rohové konštrukcie pódia (3 trubice × 1 m, 60 LED/m)',
    sightlineNotes: 'Definujú vertikálny rám pódia zľava, vytvárajú bežiace stĺpce a smerové impulzy do výšky.',
  },
  {
    id: 2,
    name: 'Pravé vertikálne trubice (Tubes Right 4–6)',
    role: 'accent',
    controller: 'ESP32 #3 (Slave Stage Right)',
    gpio: 'GPIO 16, 17, 18',
    startLed: 0,
    stopLed: 180,
    ledCount: 180,
    physicalLocation: 'Pravé hliníkové rohové konštrukcie pódia (3 trubice × 1 m, 60 LED/m)',
    sightlineNotes: 'Symetrické ohraničenie pódia sprava. Pri stereo efektoch fungujú ako pravý kanál ekvalizéra.',
  },
  {
    id: 3,
    name: 'Matrix Stredový Crown / Sub-Bass Akcent',
    role: 'detail',
    controller: 'ESP32 #1 (Sub-segment)',
    gpio: 'GPIO 16 (Virtuálny subseg)',
    startLed: 120,
    stopLed: 312,
    ledCount: 192,
    physicalLocation: 'Centrálna oblasť zadného matrixu vyhradená pre motív kráľovskej koruny QUEENS',
    sightlineNotes: 'Silueta koruny priamo za účinkujúcim alebo DJom; fotogenický instagramový bod pre návštevníkov.',
  },
];

// 2. Knižnica 10 overených presetov pre WLED 0.15.x v QUEENS
export const WLED_PRESETS: WledPreset[] = [
  {
    id: 1,
    code: '01_door_royal_glow',
    name: 'Door Royal Velvet Glow',
    effectName: 'Flow',
    effectId: 74,
    speed: 16,
    intensity: 60,
    paletteName: 'Royal Red & Black',
    paletteColors: ['#7A0000', '#D90429', '#0B090A'],
    brightnessPct: 25,
    targetLayer: 'Wash',
    phase: 'Door',
    empiricalRationale: 'Intímna zamatová červená uvíta hostí pubu, trubice jemne dýchajú bez oslnenia zraku.',
  },
  {
    id: 2,
    code: '02_warmup_vertical_pulse',
    name: 'Warmup Vertical Pulse',
    effectName: 'Breathe',
    effectId: 2,
    speed: 34,
    intensity: 85,
    paletteName: 'Queens Crimson & Amber',
    paletteColors: ['#990000', '#D90429', '#F59E0B'],
    brightnessPct: 40,
    targetLayer: 'Akcent',
    phase: 'Warm-up',
    empiricalRationale: 'Trubice jemne pulzujú do tempa 100–115 BPM, matrix drží tiché monochromatické pozadie.',
  },
  {
    id: 3,
    code: '03_concert_sub_amber',
    name: 'Concert Live Organic Wash',
    effectName: 'Plasma',
    effectId: 88,
    speed: 40,
    intensity: 110,
    paletteName: 'Sunset Gold & Red',
    paletteColors: ['#D90429', '#F59E0B', '#1C0606'],
    brightnessPct: 50,
    targetLayer: 'Wash',
    phase: 'Concert / Build',
    empiricalRationale: 'Organický teplý podmaz pre živé kapely; neťahá pozornosť od hudobníkov a skvele vyzerá na videu.',
  },
  {
    id: 4,
    code: '04_build_matrix_chase',
    name: 'Build Vertical Ladder Chase',
    effectName: 'Chaser',
    effectId: 84,
    speed: 120,
    intensity: 180,
    paletteName: 'Queens White & Crimson',
    paletteColors: ['#FFFFFF', '#D90429', '#0B090A'],
    brightnessPct: 65,
    targetLayer: 'Akcent',
    phase: 'Concert / Build',
    empiricalRationale: 'Svetlo na trubiciach stúpa od podlahy k stropu, čím graduje energiu pred disco dropom.',
  },
  {
    id: 5,
    code: '05_peak_disco_crown',
    name: 'Peak Queens Royal Crown',
    effectName: '2D Freqmatrix',
    effectId: 133,
    speed: 155,
    intensity: 210,
    paletteName: 'Crown Red & Gold',
    paletteColors: ['#D90429', '#F59E0B', '#FFFFFF'],
    brightnessPct: 80,
    targetLayer: 'Detail',
    phase: 'Disco Peak',
    empiricalRationale: 'Motív kráľovskej koruny pulzujúci na zadnom matrixi v plnom discorytme (128–140 BPM).',
  },
  {
    id: 6,
    code: '06_peak_audio_tubes',
    name: 'Peak 6-Band Equalizer',
    effectName: '2D GEQ (Audio)',
    effectId: 128,
    speed: 170,
    intensity: 230,
    paletteName: 'Queens Contrast',
    paletteColors: ['#D90429', '#FFFFFF', '#0B090A'],
    brightnessPct: 75,
    targetLayer: 'Akcent',
    phase: 'Disco Peak',
    empiricalRationale: 'Každá zo 6 trubíc reprezentuje jedno frekvenčné pásmo (B1–B6) – stage sa mení na živý ekvalizér.',
  },
  {
    id: 7,
    code: '07_drop_stark_red',
    name: 'Drop Stark Red Impact',
    effectName: 'Solid',
    effectId: 0,
    speed: 255,
    intensity: 255,
    paletteName: 'Pure Stark Red',
    paletteColors: ['#FF0000', '#FF0000', '#FF0000'],
    brightnessPct: 100,
    targetLayer: 'Wash',
    phase: 'Drop',
    empiricalRationale: 'Jednorazový úder plnej červenej na 1. dobu (max 1 s). Žiadna biela na DJ pult, nulové oslnenie.',
  },
  {
    id: 8,
    code: '08_peak_queen_meteor',
    name: 'Peak Rain Meteor Strike',
    effectName: 'Meteor',
    effectId: 43,
    speed: 160,
    intensity: 220,
    paletteName: 'Queens Ice & Crimson',
    paletteColors: ['#FFFFFF', '#D90429', '#F59E0B'],
    brightnessPct: 85,
    targetLayer: 'Akcent',
    phase: 'Disco Peak',
    empiricalRationale: 'Dážď svetelných kvapiek padajúci súčasne cez matrix aj bočné trubice počas najsilnejšej hodiny noci.',
  },
  {
    id: 9,
    code: '09_outro_velvet_fade',
    name: 'Outro Velvet Amber Fade',
    effectName: 'Flow',
    effectId: 74,
    speed: 20,
    intensity: 50,
    paletteName: 'Warm Ember Velvet',
    paletteColors: ['#7A0000', '#A33B00', '#0B090A'],
    brightnessPct: 30,
    targetLayer: 'Wash',
    phase: 'Outro',
    empiricalRationale: 'Pomalé tlmené chladnutie atmosféry pri zatváraní pubu, stabilizácia zreničiek odchádzajúcich hostí.',
  },
  {
    id: 10,
    code: '10_safe_ambient_red',
    name: 'Emergency Safe Crimson',
    effectName: 'Solid',
    effectId: 0,
    speed: 0,
    intensity: 0,
    paletteName: 'Safe Deep Red',
    paletteColors: ['#990000', '#990000', '#000000'],
    brightnessPct: 20,
    targetLayer: 'Wash',
    phase: 'Safety',
    empiricalRationale: 'Fail-safe núdzové svetlo pri výpadku siete/zvuku; minimálny prúd (2 A), žiadna panika a nulová tma.',
  },
];

// 3. Jednostranový Run-Sheet pre QUEENS (Disco noci & Koncerty)
export const RUN_SHEET_DATA: RunSheetRow[] = [
  {
    timeWindow: '21:00 – 22:30',
    phase: 'DOOR / PUB MOOD',
    musicEnergy: 'Background Disco / Soul / Pop (80–105 BPM)',
    presetCode: '01_door_royal_glow',
    presetName: 'Royal Velvet Glow (25 % jas)',
    primarySegments: 'Matrix zadná stena (tlmene) + Trubice (20 %)',
    triggerType: 'Čas / Autonómne',
    lightingAction: 'Pomalý zamatovo červený flow, trubice v jemnom podmaze, žiadne ostré prechody.',
    kpiActionCount: 1,
  },
  {
    timeWindow: '22:30 – 00:00',
    phase: 'WARM-UP / ZAHRIEVANIE',
    musicEnergy: 'Commercial House & Disco Hits (110–122 BPM)',
    presetCode: '02_warmup_vertical_pulse',
    presetName: 'Vertical Pulse (40 % jas, Crimson)',
    primarySegments: 'Trubice 1–6 (Akcent) + Matrix (Wash)',
    triggerType: 'UDP Audio Beat',
    lightingAction: 'Vertikálne trubice pulzujú jemne na basový kick, matrix zobrazuje tichú textúru.',
    kpiActionCount: 1,
  },
  {
    timeWindow: '00:00 – 01:00',
    phase: 'LIVE CONCERT / BUILD',
    musicEnergy: 'Živá kapela / Koncert / Rock / Pop (115–135 BPM)',
    presetCode: '03_concert_sub_amber',
    presetName: 'Concert Live Wash (50 % jas, Amber-Gold)',
    primarySegments: 'Matrix celá plocha + Bočné trubice',
    triggerType: 'MANUÁLNE (1 klik)',
    lightingAction: 'Organický teplý jantárový náter, ktorý nezatieňuje kapelu a perfektne vykresľuje tváre.',
    kpiActionCount: 1,
  },
  {
    timeWindow: 'PRE-DROP / BREAK',
    phase: 'BREAKDOWN SILENCE',
    musicEnergy: 'Riser / Ticho pred dropom / DJ hecovačka',
    presetCode: '04_build_matrix_chase',
    presetName: 'Vertical Ladder Chase (Matrix tlmene)',
    primarySegments: 'Trubice 1–6 ONLY (Matrix stiahnutý)',
    triggerType: 'UDP Audio Beat',
    lightingAction: 'Matrix zhasne (čierna stena), svetlo na trubiciach beží prudko nahor a graduje očakávanie.',
    kpiActionCount: 1,
  },
  {
    timeWindow: 'DROP MOMENT',
    phase: 'DISCO IMPACT DROP',
    musicEnergy: 'First Kick Drop (128–140 BPM)',
    presetCode: '07_drop_stark_red',
    presetName: 'Stark Red Impact (100 % Červená, 1 s)',
    primarySegments: 'VŠETKY SEGMENTY (0.8–1.0 s)',
    triggerType: 'MANUÁLNE (1 klik)',
    lightingAction: 'Tvrdý jednosekundový úder čistej kráľovskej červenej na celý stage! Bez bielej na DJa.',
    kpiActionCount: 1,
  },
  {
    timeWindow: '01:00 – 03:30',
    phase: 'DISCO PEAK HOURS',
    musicEnergy: 'Peak Disco Party / Club Dance (126–145 BPM)',
    presetCode: '05_peak_disco_crown',
    presetName: 'Queens Royal Crown + 06_peak_audio',
    primarySegments: 'Matrix Crown Hero + Trubice EQ',
    triggerType: 'UDP Audio Beat',
    lightingAction: 'Matrix pulzuje motív kráľovskej koruny, 6 trubíc skáče ako 6-pásmový živý ekvalizér.',
    kpiActionCount: 1,
  },
  {
    timeWindow: '03:30 – 05:00',
    phase: 'OUTRO / ZÁVER',
    musicEnergy: 'Slow Melodic Disco / Chill Pop (85–100 BPM)',
    presetCode: '09_outro_velvet_fade',
    presetName: 'Velvet Amber Fade (30 % jas)',
    primarySegments: 'Matrix + Trubice (Wash)',
    triggerType: 'Čas / Autonómne',
    lightingAction: 'Tlmený zamatový odchod, upokojenie zraku pred zapnutím servisných svetiel pubu.',
    kpiActionCount: 1,
  },
  {
    timeWindow: 'NÚDZA / HAID',
    phase: 'SAFE AMBIENT',
    musicEnergy: 'Stop hudby / Zásah personálu / Polícia',
    presetCode: '10_safe_ambient_red',
    presetName: 'Safe Deep Red (20 % Červená)',
    primarySegments: 'VŠETKY SEGMENTY (Statické)',
    triggerType: 'MANUÁLNE (1 klik)',
    lightingAction: 'Okamžité rovnomerné orientačné červené svetlo, žiadny pohyb ani blikanie. Odber iba 2 A.',
    kpiActionCount: 1,
  },
];

// 4. FMEA Analýza zlyhaní upravená pre 3× ESP32 v QUEENS
export const FMEA_DATA: FmeaRow[] = [
  {
    failureMode: 'Reboot Master ESP32 #1 (Brownout / prepätie na matrixi)',
    liveImpact: 'Zhasnutie matrixu na 1,5 až 1,8 sekundy; slave trubice na ESP32 #2 a #3 pokračujú v lokálnom efekte.',
    detectionMethod: 'WLED boot log v konzole, výpadok UDP sync paketov.',
    mitigationAndFailSafe: 'Boot Preset nastavený na Preset 10 (Safe Crimson). Po 1,8 s sa matrix rozsvieti v tlmenom červenom svetle bez bieleho záblesku a obnoví UDP sync.',
    guaranteedState: 'Trubice svietia nepretržite; matrix nabehne do bezpečnej červenej bez oslepenia účinkujúcich.',
  },
  {
    failureMode: 'Výpadok Wi-Fi routera (RF šum z mobilov návštevníkov pubu)',
    liveImpact: 'Strata spojenia s tabletom/mobilom VJ operátora.',
    detectionMethod: 'Timeout web rozhrania, nesvieti linka na routeri.',
    mitigationAndFailSafe: 'Každý z 3 ESP32 beží autonómne vo vlastnej FLASH pamäti. Pri výpadku &gt; 30 s Master ESP32 automaticky vytvorí záložný AP "QUEENS-STAGE-SAFE-AP".',
    guaranteedState: 'Svetlá bežia plynule ďalej podľa zvuku a časovača; VJ sa pripojí priamo na záložný AP z mobilu.',
  },
  {
    failureMode: 'Pád UDP Sound Sync streamu (ticho na pódiu / pauza v koncerte)',
    liveImpact: 'Audio-reaktívne efekty na trubiciach a matrixi by mohli zamrznúť.',
    detectionMethod: 'Počítadlo UDP paketov &gt; 3 500 ms bez signálu.',
    mitigationAndFailSafe: 'Silence Decay mechanizmus WLED: po 3,5 s ticha automatický plynulý fading do pomalého Breathe (Preset 02) s 30 % jasom.',
    guaranteedState: 'Plynulý prechod do pokojného ambientu bez trhania a bez zamrznutých svietiacich bodov.',
  },
  {
    failureMode: 'Masívny úbytok napätia na koncoch matrixu (&Delta;V &gt; 1,8 V)',
    liveImpact: 'Koncové LED diódy zigzag pásu menia farbu z bielej na matne červenú a modrá zložka zhasína.',
    detectionMethod: 'Vizuálna chromatická aberácia, namerané napätie pod 3,4 V na okraji rámu.',
    mitigationAndFailSafe: 'Softvérový WLED ABL limit nastavený na 12 000 mA (12 A) na Master ESP32; zákaz dlhodobej plnej bielej; návrh 2 doplnkových injekcií na konce.',
    guaranteedState: 'Sýte červené a jantárové farby Queens brandingu ostávajú 100 % stabilné a rovnomerné.',
  },
  {
    failureMode: 'Prehriatie PCB kontrolérov trubíc (ESP32 #2 a #3)',
    liveImpact: 'Zopnutie tepelnej ochrany meniča na PCB trubíc pri 60 LED/m.',
    detectionMethod: 'Nárast teploty krabičky kontroléra &gt; 60 °C.',
    mitigationAndFailSafe: 'Napájanie trubíc obmedzené WLED ABL na 2 800 mA na kanál (max 45 mA/LED). Hliníkové profily trubíc slúžia ako pasívne chladiče.',
    guaranteedState: 'Trubice nepresiahnu povrchovú teplotu 39 °C ani po 8-hodinovej disco prevádzke.',
  },
];

// 5. Tweak protokol pre QUEENS (5 zákrokov podľa priority rizika)
export const TWEAK_RULES: TweakRule[] = [
  {
    priority: 1,
    symptom: 'Svetlo oslepuje DJa alebo účinkujúcu kapelu na pódiu',
    quickAction: 'Zníž Master Brightness na 50 % alebo prepni matrix na Preset 03 (Concert Live Wash).',
    wledParameter: 'WLED JSON: {"bri": 128}',
    safetyReason: 'Zákaz plnej bielej na DJ pult je prioritný; zníženie jasu chráni zrak vystupujúcich aj senzory kamier.',
  },
  {
    priority: 2,
    symptom: 'Trubice kmitajú príliš agresívne pri rýchlej disco hudbe (140+ BPM)',
    quickAction: 'Zníž rýchlosť Speed na trubiciach zo 170 na 85 (pod 3 záblesky/sekundu).',
    wledParameter: 'WLED Segment: seg[1].sx = 85, seg[2].sx = 85',
    safetyReason: 'Dodržanie bezpečnosti fotosenzibility: frekvencia vizuálnych zmien nesmie presiahnuť 3 Hz.',
  },
  {
    priority: 3,
    symptom: 'Audio reaktivita ignoruje basy pri živej kapele (odlišný signál ako DJ)',
    quickAction: 'Na ESP32 #1 zníž Squelch z 12 na 6 a zvýš Gain na 45 pre dynamický live zvuk.',
    wledParameter: 'Audio Config: Squelch = 6, Gain = 45',
    safetyReason: 'Živá kapela má širší dynamický rozsah ako skomprimovaný disco master; vyžaduje vyššiu citlivosť.',
  },
  {
    priority: 4,
    symptom: 'V sále je hustý dym a biele svetlo z trubíc robí mliečnu stenu',
    quickAction: 'Aktivuj paletu Queens Pure Red (#D90429 & #000000) cez tlačidlo v hornom paneli.',
    wledParameter: 'WLED Palette: Pal 49 (Red&Black) alebo Preset 07',
    safetyReason: 'Monochromatické červené svetlo má najväčšiu vlnovú dĺžku (650 nm) a hladko preniká cez dym bez oslnenia.',
  },
  {
    priority: 5,
    symptom: 'Koncové riadky matrixu na zadnej stene menia odtieň do žltej/červenej',
    quickAction: 'Zníž ABL limit na ESP32 #1 na 10 000 mA a obmedz jas na 70 %.',
    wledParameter: 'WLED Config -> LED Preferences -> Maximum Current: 10000 mA',
    safetyReason: 'Okamžitá ochrana pred úbytkom napätia na tenkom zigzag kábli s jediným stredovým napájaním.',
  },
];

// 6. JSON konfigurácie pre 3× ESP32 v QUEENS
export const SAMPLE_WLED_PRESETS_JSON = {
  "0": {},
  "1": {
    "n": "01_door_royal_glow",
    "on": true,
    "bri": 64,
    "transition": 20,
    "mainseg": 0,
    "seg": [
      {"id": 0, "start": 0, "stop": 432, "on": true, "bri": 80, "col": [[122, 0, 0], [217, 4, 41], [11, 9, 10]], "fx": 74, "sx": 16, "ix": 60, "pal": 35},
      {"id": 1, "start": 0, "stop": 180, "on": true, "bri": 60, "col": [[217, 4, 41], [0, 0, 0], [0, 0, 0]], "fx": 2, "sx": 20, "ix": 50, "pal": 49}
    ]
  },
  "5": {
    "n": "05_peak_disco_crown",
    "on": true,
    "bri": 204,
    "transition": 2,
    "mainseg": 0,
    "seg": [
      {"id": 0, "start": 0, "stop": 432, "on": true, "bri": 220, "col": [[217, 4, 41], [245, 158, 11], [255, 255, 255]], "fx": 133, "sx": 155, "ix": 210, "pal": 14},
      {"id": 1, "start": 0, "stop": 180, "on": true, "bri": 200, "col": [[217, 4, 41], [255, 255, 255], [0, 0, 0]], "fx": 128, "sx": 170, "ix": 230, "pal": 57}
    ]
  },
  "7": {
    "n": "07_drop_stark_red",
    "on": true,
    "bri": 255,
    "transition": 0,
    "mainseg": 0,
    "seg": [
      {"id": 0, "start": 0, "stop": 432, "on": true, "bri": 255, "col": [[255, 0, 0], [255, 0, 0], [255, 0, 0]], "fx": 0, "sx": 255, "ix": 255, "pal": 0},
      {"id": 1, "start": 0, "stop": 180, "on": true, "bri": 255, "col": [[255, 0, 0], [255, 0, 0], [255, 0, 0]], "fx": 0, "sx": 255, "ix": 255, "pal": 0}
    ]
  },
  "10": {
    "n": "10_safe_ambient_red",
    "on": true,
    "bri": 50,
    "transition": 10,
    "mainseg": 0,
    "seg": [
      {"id": 0, "start": 0, "stop": 432, "on": true, "bri": 50, "col": [[153, 0, 0], [0, 0, 0], [0, 0, 0]], "fx": 0, "sx": 0, "ix": 0, "pal": 0},
      {"id": 1, "start": 0, "stop": 180, "on": true, "bri": 40, "col": [[153, 0, 0], [0, 0, 0], [0, 0, 0]], "fx": 0, "sx": 0, "ix": 0, "pal": 0}
    ]
  }
};

export const SAMPLE_WLED_CFG_ESP1_MASTER_JSON = {
  "rev": [1, 0],
  "vid": 2408100,
  "id": {
    "mdns": "queens-matrix-master",
    "name": "QUEENS Stage Matrix (Master)",
    "inv": "Light"
  },
  "nw": {
    "ins": [
      {
        "ssid": "QUEENS_STAGE_PROD",
        "psk": "QueensCrown2026",
        "ip": [192, 168, 10, 41],
        "gw": [192, 168, 10, 1],
        "sn": [255, 255, 255, 0]
      }
    ]
  },
  "ap": {
    "ssid": "QUEENS-STAGE-SAFE-AP",
    "psk": "queenscrownsafe",
    "chan": 6,
    "behav": 1
  },
  "def": {
    "on": true,
    "bri": 64,
    "bootPres": 10
  },
  "if": {
    "sync": {
      "port": 21324,
      "recv": {
        "bri": true,
        "col": true,
        "fx": true,
        "grp": 1
      },
      "send": {
        "dir": true,
        "btn": true,
        "va": true,
        "hue": true,
        "mid": true,
        "grp": 1
      }
    }
  },
  "hw": {
    "led": {
      "total": 432,
      "maxpwr": 12000,
      "ledma": 55,
      "fps": 44,
      "matrix": {
        "w": 24,
        "h": 18,
        "serp": true,
        "rev": false,
        "vert": false
      },
      "ins": [
        {
          "start": 0,
          "len": 432,
          "pin": [16],
          "order": 0,
          "type": 22
        }
      ]
    }
  }
};

export const SAMPLE_WLED_CFG_ESP2_TUBES_JSON = {
  "rev": [1, 0],
  "vid": 2408100,
  "id": {
    "mdns": "queens-tubes-left",
    "name": "QUEENS Tubes Left (Slave)",
    "inv": "Light"
  },
  "nw": {
    "ins": [
      {
        "ssid": "QUEENS_STAGE_PROD",
        "psk": "QueensCrown2026",
        "ip": [192, 168, 10, 42],
        "gw": [192, 168, 10, 1],
        "sn": [255, 255, 255, 0]
      }
    ]
  },
  "def": {
    "on": true,
    "bri": 64,
    "bootPres": 10
  },
  "if": {
    "sync": {
      "port": 21324,
      "recv": {
        "bri": true,
        "col": true,
        "fx": true,
        "grp": 1
      },
      "send": {
        "grp": 0
      }
    }
  },
  "hw": {
    "led": {
      "total": 180,
      "maxpwr": 8400,
      "ledma": 55,
      "fps": 55,
      "ins": [
        { "start": 0, "len": 60, "pin": [16], "order": 0, "type": 22 },
        { "start": 60, "len": 60, "pin": [17], "order": 0, "type": 22 },
        { "start": 120, "len": 60, "pin": [18], "order": 0, "type": 22 }
      ]
    }
  }
};
