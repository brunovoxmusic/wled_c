import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Crown, Layers, Eye } from 'lucide-react';
import { WLED_PRESETS, WledPreset } from '../data/wledData';

interface StageVisualizerProps {
  currentPreset: WledPreset;
  onSelectPreset: (preset: WledPreset) => void;
  audioEnergy: number; // 0.0 to 1.0 from audio simulator/FFT
}

export const CeilingVisualizer: React.FC<StageVisualizerProps> = ({
  currentPreset,
  onSelectPreset,
  audioEnergy,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [activeSegments, setActiveSegments] = useState<{ [key: string]: boolean }>({
    matrix: true, // 24x18 Matrix (Hero)
    leftTubes: true, // 3 Vertical Tubes Left
    rightTubes: true, // 3 Vertical Tubes Right
    crownDetail: true, // Royal Crown Graphic Overlay
  });
  const [customSpeed, setCustomSpeed] = useState<number>(currentPreset.speed);
  const [customBrightness, setCustomBrightness] = useState<number>(currentPreset.brightnessPct);
  const [fps, setFps] = useState<number>(44);

  // Sync state when parent preset changes
  useEffect(() => {
    setCustomSpeed(currentPreset.speed);
    setCustomBrightness(currentPreset.brightnessPct);
  }, [currentPreset]);

  const toggleSegment = (key: string) => {
    setActiveSegments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let effectPhase = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Calculate FPS
      frameCount++;
      if (time - fpsTimer > 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      if (isRunning) {
        effectPhase += dt * (customSpeed / 255) * 4;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Deep dark club background (QUEENS pub interior)
      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, width, height);

      // Stage wooden platform base
      const stageY = height * 0.72;
      const stageHeight = height * 0.28;
      
      const stageGrad = ctx.createLinearGradient(0, stageY, 0, height);
      stageGrad.addColorStop(0, '#120708');
      stageGrad.addColorStop(1, '#050203');
      ctx.fillStyle = stageGrad;
      ctx.fillRect(width * 0.1, stageY, width * 0.8, stageHeight);
      ctx.strokeStyle = '#2A0D10';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.1, stageY, width * 0.8, stageHeight);

      // Colors from current preset
      const primaryHex = currentPreset.paletteColors[0] || '#D90429';
      const secondaryHex = currentPreset.paletteColors[1] || '#F59E0B';
      const accentHex = currentPreset.paletteColors[2] || '#FFFFFF';

      const masterBri = customBrightness / 100;
      const beatBoost = audioEnergy * 0.7; // Audio beat pulse

      // 1. REAR STAGE MATRIX: 24 Columns × 18 Rows (432 LEDs, zigzag cable)
      if (activeSegments.matrix) {
        const cols = 24;
        const rows = 18;
        const matrixW = width * 0.52;
        const matrixH = height * 0.44;
        const startX = width * 0.24;
        const startY = height * 0.18;

        const cellW = matrixW / cols;
        const cellH = matrixH / rows;

        // Matrix background frame
        ctx.fillStyle = '#0B090A';
        ctx.fillRect(startX - 8, startY - 8, matrixW + 16, matrixH + 16);
        ctx.strokeStyle = '#3D0A0E';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(startX - 8, startY - 8, matrixW + 16, matrixH + 16);

        // Simple Crown shape definition (24x18 grid)
        // 1 = crown pixel, 0 = background
        const isCrownPixel = (c: number, r: number) => {
          // Centered crown from row 4 to 13, cols 6 to 17
          if (r < 5 || r > 14 || c < 5 || c > 18) return false;
          // Crown base (row 13-14)
          if (r >= 12 && r <= 14 && c >= 6 && c <= 17) return true;
          // Crown peaks
          if (r >= 6 && (c === 6 || c === 11 || c === 12 || c === 17)) return true;
          if (r >= 8 && (c === 7 || c === 8 || c === 10 || c === 13 || c === 15 || c === 16)) return true;
          if (r >= 10 && c >= 7 && c <= 16) return true;
          return false;
        };

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * cellW + cellW * 0.5;
            const y = startY + r * cellH + cellH * 0.5;

            let ledColor = primaryHex;
            let alpha = 0.2 * masterBri;

            if (currentPreset.effectName === '2D Freqmatrix' && activeSegments.crownDetail && isCrownPixel(c, r)) {
              // Royal Crown lights up brightly in gold/white
              alpha = Math.min(1, (0.5 + beatBoost * 0.8) * masterBri);
              ledColor = beatBoost > 0.4 ? accentHex : secondaryHex;
            } else if (currentPreset.effectName === '2D GEQ (Audio)') {
              // 24 columns reacting to frequency
              const bandIdx = Math.floor((c / cols) * 16);
              const colHeightThreshold = (1 - (r / rows));
              if (audioEnergy > colHeightThreshold * 0.8) {
                alpha = Math.min(1, (audioEnergy + 0.3) * masterBri);
                ledColor = audioEnergy > 0.6 ? accentHex : primaryHex;
              }
            } else if (currentPreset.effectName === 'Meteor') {
              const meteorHead = (effectPhase * 18 + c * 2) % (rows * 2);
              const dist = Math.abs(r - meteorHead);
              if (dist < 4) {
                alpha = (1 - dist / 4) * masterBri;
                ledColor = dist < 1 ? accentHex : primaryHex;
              }
            } else if (currentPreset.effectName === 'Flow' || currentPreset.effectName === 'Plasma') {
              const wave = Math.sin(c * 0.3 - effectPhase * 2 + r * 0.2);
              alpha = ((wave + 1) * 0.4 + 0.1 + beatBoost * 0.2) * masterBri;
              ledColor = wave > 0.2 ? primaryHex : secondaryHex;
            } else if (currentPreset.effectName === 'Solid') {
              alpha = masterBri;
              ledColor = primaryHex;
            }

            alpha = Math.min(1, Math.max(0, alpha));

            // Draw matrix LED dot
            ctx.beginPath();
            ctx.arc(x, y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(ledColor, alpha);
            ctx.fill();

            if (alpha > 0.6) {
              ctx.beginPath();
              ctx.arc(x, y, 7, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(ledColor, alpha * 0.2);
              ctx.fill();
            }
          }
        }
      }

      // 2. VERTICAL TUBES: 6 Trubice (3 Left, 3 Right, each 60 LEDs)
      const renderTubesGroup = (startX: number, spacing: number, isActive: boolean, isLeft: boolean) => {
        if (!isActive) return;
        const tubeCount = 3;
        const ledsPerTube = 30; // visual representation
        const tubeTopY = height * 0.20;
        const tubeBottomY = height * 0.68;
        const tubeHeight = tubeBottomY - tubeTopY;

        for (let t = 0; t < tubeCount; t++) {
          const tubeX = startX + t * spacing;

          // Tube aluminum enclosure silhouette
          ctx.fillStyle = '#08090C';
          ctx.fillRect(tubeX - 5, tubeTopY - 4, 10, tubeHeight + 8);
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 1;
          ctx.strokeRect(tubeX - 5, tubeTopY - 4, 10, tubeHeight + 8);

          for (let p = 0; p < ledsPerTube; p++) {
            const ledY = tubeTopY + (p / (ledsPerTube - 1)) * tubeHeight;

            let ledColor = primaryHex;
            let alpha = 0.25 * masterBri;

            if (currentPreset.effectName === '2D GEQ (Audio)') {
              // Tube acts as individual equalizer column
              const tubeBand = isLeft ? t : (t + 3);
              const heightFraction = 1 - (p / ledsPerTube);
              if (audioEnergy > heightFraction * 0.8) {
                alpha = Math.min(1, (audioEnergy + 0.3) * masterBri);
                ledColor = audioEnergy > 0.6 ? accentHex : secondaryHex;
              }
            } else if (currentPreset.effectName === 'Chaser') {
              const head = (effectPhase * 20) % ledsPerTube;
              const d = Math.abs((ledsPerTube - 1 - p) - head); // Running upwards
              if (d < 5) {
                alpha = (1 - d / 5) * masterBri;
                ledColor = d < 1 ? accentHex : primaryHex;
              }
            } else if (currentPreset.effectName === 'Meteor') {
              const head = (effectPhase * 25 + t * 6) % ledsPerTube;
              const d = Math.abs(p - head); // Falling downwards
              if (d < 6) {
                alpha = (1 - d / 6) * masterBri;
                ledColor = d < 1 ? accentHex : secondaryHex;
              }
            } else if (currentPreset.effectName === 'Breathe') {
              const breathe = (Math.sin(effectPhase * 2 + t * 0.5) + 1) * 0.5;
              alpha = (0.2 + breathe * 0.8 + beatBoost * 0.3) * masterBri;
            } else if (currentPreset.effectName === 'Solid') {
              alpha = masterBri;
            }

            alpha = Math.min(1, Math.max(0, alpha));

            ctx.beginPath();
            ctx.arc(tubeX, ledY, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(ledColor, alpha);
            ctx.fill();

            if (alpha > 0.6) {
              ctx.beginPath();
              ctx.arc(tubeX, ledY, 6.5, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(ledColor, alpha * 0.3);
              ctx.fill();
            }
          }
        }
      };

      // Draw 3 Left tubes & 3 Right tubes
      renderTubesGroup(width * 0.12, width * 0.035, activeSegments.leftTubes, true);
      renderTubesGroup(width * 0.80, width * 0.035, activeSegments.rightTubes, false);

      // 3. DJ / LIVE BAND BOOTH (Front Center Stage)
      const boothW = width * 0.26;
      const boothH = height * 0.12;
      const boothX = width * 0.5 - boothW * 0.5;
      const boothY = height * 0.64;

      // Booth front face (Dark Matte Black)
      ctx.fillStyle = '#0D0E12';
      ctx.fillRect(boothX, boothY, boothW, boothH);
      ctx.strokeStyle = '#D90429';
      ctx.lineWidth = 1;
      ctx.strokeRect(boothX, boothY, boothW, boothH);

      // DJ Booth Crown Emblem
      ctx.fillStyle = '#D90429';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QUEENS PUB STAGE', width * 0.5, boothY + boothH * 0.55);

      // DJ Silhouette (Strict Rule: NO direct white light on DJ)
      ctx.fillStyle = '#030406';
      ctx.beginPath();
      ctx.arc(width * 0.5, boothY - 14, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(width * 0.47, boothY - 4, 30, 20);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentPreset, customSpeed, customBrightness, isRunning, activeSegments, audioEnergy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top visualizer status bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div>
          <span className="text-xs text-red-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Crown className="w-3.5 h-3.5" />
            2D Stage Simulácia · QUEENS Pub Púchov (792 LED)
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>6 Vertikálnych trubíc + 24×18 Matrix</span>
            <span className="text-xs font-mono text-slate-400 font-normal">
              ({currentPreset.code})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">FPS:</span>
            <span className="text-emerald-400 font-bold">{fps}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Audio Beat:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-75"
                style={{ width: `${Math.round(audioEnergy * 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pozastaviť' : 'Spustiť'}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl aspect-[16/9] max-h-[560px]">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain block"
        />

        {/* Overlay info box */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded text-xs font-mono space-y-1">
          <div className="text-slate-300">
            WLED Efekt: <span className="text-red-400 font-bold">{currentPreset.effectName}</span> (#{currentPreset.effectId})
          </div>
          <div className="text-slate-400 text-[11px]">
            Paleta: {currentPreset.paletteName} · Vrstva: {currentPreset.targetLayer}
          </div>
        </div>

        {/* Segment Toggle Pill Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded text-xs">
          <span className="text-slate-400 text-[10px] uppercase font-mono px-1">Segmenty:</span>
          {[
            { key: 'matrix', label: '24×18 Matrix' },
            { key: 'leftTubes', label: 'Trubice 1–3' },
            { key: 'rightTubes', label: 'Trubice 4–6' },
            { key: 'crownDetail', label: 'Queens Koruna' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => toggleSegment(s.key)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                activeSegments[s.key]
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Quick Preset Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 rounded-lg p-5">
        
        {/* Sliders */}
        <div className="space-y-4">
          <span className="text-xs uppercase font-mono text-slate-400 font-semibold block">
            Rýchle live parametre
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Master Brightness (Jas):</span>
              <span className="text-red-400">{customBrightness} %</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={customBrightness}
              onChange={(e) => setCustomBrightness(Number(e.target.value))}
              className="w-full accent-red-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Effect Speed (Rýchlosť):</span>
              <span className="text-amber-400">{customSpeed} / 255</span>
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={customSpeed}
              onChange={(e) => setCustomSpeed(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Presets Grid */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs uppercase font-mono text-slate-400 font-semibold block">
            Rýchly výber WLED presetu pre QUEENS:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WLED_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`p-2 rounded text-left border transition-all text-xs ${
                  currentPreset.id === p.id
                    ? 'border-red-500 bg-red-500/10 text-white font-medium shadow'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-[11px] text-red-400 truncate font-semibold">{p.code}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.effectName} · {p.phase}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
