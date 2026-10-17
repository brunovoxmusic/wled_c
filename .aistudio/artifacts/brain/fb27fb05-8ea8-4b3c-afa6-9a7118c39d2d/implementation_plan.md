# WLED Techno Club Lighting Architecture & Autonomous Production Suite

Kompletná produkčná špecifikácia, art direction a interaktívna riadiaca konzola pre undergroundový techno klub so stropným rastrom, stage akcentmi, 5V WS2812B napájacou infraštruktúrou a autonómnym UDP Sound Sync zvukovým riadením (WLED 0.15.x).

## User Review & Critical Decisions

> [!IMPORTANT]
> Na základe Vašich odpovedí v 1. fáze boli do architektúry zapracované nasledujúce pevné vstupné parametre:
> - **Typ priestoru & Žáner**: Underground techno klub s centrálnym tanečným parketom, DJ stageom a priestorovým stropným rastrom (sightlines smerujú na DJ pult a stropnú geometriu).
> - **LED technológia & Napájanie**: 5V adresovateľné WS2812B LED pásy s hustou injekciou napájania (každé 2–2,5 m obojstranne) a hardvérovým WLED ABL (Automatic Brightness Limiter).
> - **Režim riadenia**: Plne autonómny režim riadený UDP zvukovým tokom a časovou automatizáciou, s okamžitým manuálnym VJ/núdzovým overrideom (KPI: prepnutie scény $\le 3$ kliknutia / $\le 10$ s).
> - **Audio-reaktivita**: Dedikovaný WLED UDP Sound Sync master vysielač (ESP32 umiestnený pri DJ mixpulte s linkovým vstupom/I2S) vysielajúci frekvenčné pásma na porte 11988 na slave kontroléry.

---

## 1. Overview & Core Concept

### What It Does
Aplikácia kombinuje **oficiálnu, priamo nasaditeľnú 9-sekčnú produkčnú dokumentáciu v slovenskom jazyku** a **interaktívny WLED kontrolér & simulátor**. Poskytuje:
1. **Presný 9-sekčný technický a umelecký dokument**: Segmentácia, art direction, 10 overených WLED 0.15.x presetov, UDP audio reaktivita, jednostranový run-sheet, výpočet 5V napájania s injekčnými bodmi, JSON API payloady, FMEA matica a on-site testovací protokol s tweak manuálom.
2. **Interaktívnu produkčnú konzolu**:
   - Živý 2D simulátor stropného rastru a stageu s reálnymi WLED algoritmami (Palettes, Speed, Intensity, FFT audio reakcia).
   - Zvukový FFT analyzér (mikrofón alebo syntetický techno generátor s kick/sub/hats) s UDP paketovým monitorom.
   - Live Run-Sheet Player s fázami noci (Door, Warm-up, Build, Peak, Outro, Emergency) a okamžitým prepínaním.
   - Kalkulátor napájania a poklesu napätia v reálnom čase s heat-mapou záťaže a ABL limitom.
   - Export hotových súborov `presets.json` a `cfg.json` pre okamžité nahratie do WLED web rozhrania.

### Target Audience & Persona
- **Lighting Designer & Art Director**: Tvorba a ladenie scén, farebného scenára a vizuálnej dynamiky.
- **WLED Integrátor / Elektrikár**: Dimenzovanie 5V napájacích zdrojov, injekčných káblov a FMEA fail-safe nastavení.
- **Club Operator / VJ / Manažér**: Autonómny chod s možnosťou manuálneho zásahu v havarijných a zlomových momentoch večera.

### Key Value
Odstraňuje chaos a improvizáciu. Zaručuje nulovú „efektovú polievku“, maximálne 3 odtiene na scénu, dodržanie fotosenzitívnych limitov ($\le 3$ bliky/s) a bezpečnosť 5V rozvodov bez rizika prehriatia káblov alebo reštartov kontrolérov.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Prieskum a štúdium produkčnej špecifikácie (9 sekcií)**: Prehľadné záložky a čitateľné typografické zobrazenie celého produkčného manuálu pripraveného na tlač alebo export do PDF.
2. **Živá vizualizácia a testovanie presetov**: Výber fáz noci, aktivácia jednotlivých segmentov (Stropný raster, Stage DJ arch, Bočné línie, Blindery) s okamžitou odozvou na simulovaný beat.
3. **Kalkulátor 5V napájania a injekcií**: Zadanie dĺžok pásov, počtu LED a sledovanie prúdového odberu, poklesu napätia a odporúčaných prierezov káblov (AWG/mm²).
4. **FMEA a havarijné scenáre**: Simulácia zlyhania siete alebo UDP streamu priamo v UI s vizuálnym potvrdením, že systém prejde do safe-presetu bez tmy.
5. **Generovanie WLED JSON konfigurácií**: Okamžité stiahnutie `presets.json` pre nahratie cez WLED Backup/Restore.

### Visual Identity & Theme
- **Aesthetic Direction**: Priemyselný dark-mode inšpirovaný rackovými konzolami a hardvérovými syntezátormi. Žiadne krikľavé umelé gradienty ani zbytočné "AI badges".
- **Color Palette**:
  - Neutrálne plátno: Hlboká bridlicovo-uhľová (`#090D16`, `#0F172A`) pre minimálnu únavu očí v tme réžie.
  - Povrchy a panely: `#131C2E` s precíznymi 1px deliacimi linkami (`#1E293B`).
  - Akcenty a vrstvy:
    - *Wash*: Teplý jantár a hlboká rubínová (`#FF4400`, `#880000`)
    - *Accent*: Ľadový kobalt a cyan (`#00E5FF`, `#0055FF`)
    - *Detail*: Čistá neutrálna biela s obmedzeným jasom (`#E2E8F0`)
- **Typography**:
  - Nadpisy a navigácia: *Plus Jakarta Sans* / *Outfit* (polotučné, čisté línie).
  - Telemetria a hodnoty: *JetBrains Mono* / *tabular-nums* pre prúdové odbery, frekvencie, BPM a JSON kód.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Architektúra 5V WS2812B vs 12V WS2815
- **Zvolený prístup**: Implementácia prísnej schémy obojstrannej injekcie každé 2 metre pri 5V napájaní s kalkulovaným odporom medených vodičov a aktivovaným WLED Automatic Brightness Limiterom (ABL).
- **Dôvod**: Užívateľ explicitne potvrdil 5V WS2812B s hustou injekciou. 5V je lacnejšie a ľahšie dostupné, avšak extrémne náchylné na úbytok napätia ($IR$ drop).
- **Alternatívy**: 12V WS2815 má backup dátovú linku a menšie prúdy, no vyžaduje 12V zdroje. Návrh plne rešpektuje 5V a zabezpečuje ho zdvojenými rozvodmi 2,5 mm² CYA.

### Decision 2: Autonómne riadenie cez UDP Sound Sync Master
- **Zvolený prístup**: Samostatný ESP32 master pri DJ pultovom Line-Out prevádza audio na UDP pakety typu 1 (WLED v2 Sound Sync broadcast) na porte 11988. Slave jednotky na strope a pódiu počúvajú v UDP skupinách bez nutnosti neustáleho manuálneho zásahu.
- **Dôvod**: Autonómne klubové prostredie vyžaduje, aby svetlá reagovali na dynamiku hudby (kick, sub-bass, ticho v breakoch) aj keď personál nalieva drinky.

### Decision 3: Interaktívna aplikácia s kompletným 9-sekčným dokumentom
- **Zvolený prístup**: Aplikácia obsahuje plnohodnotné zobrazenie formátovaného 9-sekčného slovenského dokumentu pripraveného na okamžitú tlač/export + interaktívne vizualizačné nástroje a generátor JSON pre WLED.
- **Dôvod**: Spĺňa 100% požiadaviek promptu na štruktúrovaný 9-sekčný dokument a zároveň poskytuje VJ-ovi funkčný digitálny nástroj.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WLED CLUB LIGHTING STUDIO                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Project Brand · 4-5 Navigation Sections · Quick Emergency Action  │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ Navigation Sidebar    │ Main Viewport Container                             │
│ ────────────────────  │ ─────────────────────────────────────────────────── │
│ 01. Master Blueprint  │ Tab 1: 9-Section Complete Slovak Deployment Contract│
│ 02. Live Visualizer   │ Tab 2: Interactive 2D Ceiling & Stage LED Canvas    │
│ 03. Audio & UDP Sync  │ Tab 3: Web Audio FFT Analyzer & Sound Sync Monitor  │
│ 04. Run-Sheet Player  │ Tab 4: 1-Click Phase & Scene Automation Timeline    │
│ 05. Power Calculator  │ Tab 5: 5V Bus Injection & Thermal Budget Engine     │
│ 06. WLED JSON Studio  │ Tab 6: Instant presets.json & cfg.json Payload Gen  │
│ 07. FMEA Simulator    │ Tab 7: Network & Power Failure Mode Testing         │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

### Data Model & State Entities
- **LED Infrastructure Model**:
  - Celkovo 1200 LED (600 LED stropný raster 5x120 LED, 300 LED DJ arch, 300 LED bočné línie a wash).
  - Segmenty: 0: Strop Matrix, 1: DJ Front Arch (Hero), 2: Side Washes, 3: Blindery/Strobe.
- **Preset Registry (8-12 reálnych WLED 0.15.x efektov)**:
  - `01_door_deep_flow`, `02_warmup_sub_pulse`, `03_warmup_liquid_amber`, `04_build_raster_chase`, `05_peak_meteor_strike`, `06_peak_audio_energy`, `07_drop_blind_wash`, `08_peak_acid_grid`, `09_outro_analog_glow`, `10_safe_ambient_red`.
  - Každý preset obsahuje ID, názov, FX index, rýchlosť (0-255), intenzitu (0-255), paletu, jas %, vrstvu (wash/akcent/detail) a fázu noci.
- **Power Calculation Engine**:
  - Dynamický výpočet: $I = N_{\text{LED}} \times 0.055\text{ A}$ (pri 100% bielej), s limitom $40\text{ mA}$ pre bežnú prevádzku, výpočet úbytku napätia $\Delta V = I \cdot R_{\text{kabel}}$, kontrola $20\%$ rezervy PSU.

---

## Plan Verification & Next Steps
Po Vašom schválení tohto plánu bezodkladne implementujem kompletnú aplikáciu vrátane všetkých 9 detailných sekcií a interaktívnych nástrojov.
