import React, { useRef, useEffect, useState } from 'react';
import { 
  Eye, 
  Activity, 
  Layers, 
  Sparkles, 
  Sliders, 
  Zap, 
  Play, 
  Pause, 
  Crown, 
  Gauge, 
  Radio, 
  Maximize2, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { WledPreset } from '../data/wledData';

export interface PresetVisualizerProps {
  currentPreset: WledPreset;
  audioEnergy?: number;
  masterBrightness?: number;
  masterSpeed?: number;
  className?: string;
  onTweakSpeed?: (speed: number) => void;
  onTweakBrightness?: (brightness: number) => void;
}

export const PresetVisualizer: React.FC<PresetVisualizerProps> = ({
  currentPreset,
  audioEnergy = 0.5,
  masterBrightness,
  masterSpeed,
  className = '',
  onTweakSpeed,
  onTweakBrightness,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'canvas_bloom' | 'svg_topology' | 'scope_stream'>('canvas_bloom');
  const [isMirrorActive, setIsMirrorActive] = useState<boolean>(true);
  const [showMetrics, setShowMetrics] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  // Speed and brightness factoring in masters
  const effectiveSpeed = masterSpeed !== undefined ? masterSpeed : currentPreset.speed;
  const effectiveBrightness = masterBrightness !== undefined ? masterBrightness : currentPreset.brightnessPct;

  // Real-time Canvas Rendering Loop
  useEffect(() => {
    if (viewMode !== 'canvas_bloom' && viewMode !== 'scope_stream') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsInterval = performance.now();
    let phase = 0;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Calculate real FPS
      frameCounter++;
      if (now - fpsInterval > 500) {
        setFps(Math.round((frameCounter * 1000) / (now - fpsInterval)));
        frameCounter = 0;
        fpsInterval = now;
      }

      if (isPlaying) {
        // Speed scaling (WLED 0-255 mapped to reasonable cycle frequency)
        const speedFactor = (effectiveSpeed / 128) * 2.5;
        phase += dt * speedFactor;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear with obsidian background
      ctx.fillStyle = '#08090C';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle spatial floor perspective grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const horizonY = height * 0.72;

      // Horizon line
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Perspective floor lines
      for (let x = 0; x <= width; x += width / 12) {
        ctx.beginPath();
        ctx.moveTo(x, horizonY);
        ctx.lineTo(width / 2 + (x - width / 2) * 2.4, height);
        ctx.stroke();
      }

      const colors = currentPreset.paletteColors && currentPreset.paletteColors.length > 0 
        ? currentPreset.paletteColors 
        : ['#E11D48', '#BE123C', '#000000'];
      const briNorm = Math.max(0.05, effectiveBrightness / 100);
      const audioBoost = 1 + audioEnergy * 0.45;

      if (viewMode === 'canvas_bloom') {
        // --- 1. RENDER 24x18 MATRIX ON BACK WALL ---
        const matrixW = width * 0.52;
        const matrixH = height * 0.48;
        const matrixX = (width - matrixW) / 2;
        const matrixY = height * 0.12;

        const cols = 24;
        const rows = 18;
        const cellW = matrixW / cols;
        const cellH = matrixH / rows;

        // Ambient Matrix Glow
        const matrixGlow = ctx.createRadialGradient(
          width / 2, matrixY + matrixH / 2, 20,
          width / 2, matrixY + matrixH / 2, matrixW * 0.6
        );
        matrixGlow.addColorStop(0, `${colors[0]}33`);
        matrixGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = matrixGlow;
        ctx.fillRect(matrixX - 40, matrixY - 30, matrixW + 80, matrixH + 60);

        // Matrix Grid Frame
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(matrixX - 2, matrixY - 2, matrixW + 4, matrixH + 4);

        // Render each pixel in 24x18 matrix
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const px = matrixX + c * cellW + cellW / 2;
            const py = matrixY + r * cellH + cellH / 2;

            let intensity = 0;
            let pixelColor = colors[0];

            const effectCode = currentPreset.code;

            if (effectCode === '05_peak_disco_crown') {
              // QUEENS Royal Crown pattern
              const normX = c / cols;
              const normY = r / rows;
              const isBase = normY > 0.65 && normY < 0.82 && normX > 0.25 && normX < 0.75;
              const isCenterPeak = normY > 0.22 && normY <= 0.65 && Math.abs(normX - 0.5) < 0.08;
              const isLeftPeak = normY > 0.32 && normY <= 0.65 && Math.abs(normX - 0.32) < 0.06;
              const isRightPeak = normY > 0.32 && normY <= 0.65 && Math.abs(normX - 0.68) < 0.06;
              const isDiadem = normY > 0.48 && normY <= 0.65 && normX > 0.25 && normX < 0.75;

              if (isBase || isCenterPeak || isLeftPeak || isRightPeak || isDiadem) {
                intensity = 0.8 + Math.sin(phase * 4 + normX * 6) * 0.2;
                pixelColor = isCenterPeak ? (colors[1] || '#FFFFFF') : colors[0];
              } else {
                intensity = Math.max(0.04, Math.sin(phase * 2 + normY * 4) * 0.15);
                pixelColor = colors[2] || '#330000';
              }
            } else if (effectCode === '06_peak_eq_meter') {
              // 6-Band Audio EQ columns mapped onto matrix
              const band = Math.floor((c / cols) * 6);
              const bandLevel = Math.min(1, Math.sin(phase * 5 + band * 1.3) * 0.4 + 0.4 + audioEnergy * 0.5);
              const activeRows = Math.floor(bandLevel * rows);
              const invRow = rows - 1 - r;

              if (invRow <= activeRows) {
                intensity = 0.7 + (invRow / rows) * 0.3;
                pixelColor = invRow > rows * 0.75 ? '#F43F5E' : invRow > rows * 0.5 ? '#F59E0B' : colors[0];
              } else {
                intensity = 0.05;
                pixelColor = '#1e1014';
              }
            } else if (effectCode === '07_drop_stark_red') {
              // Drop Stark Impact Pulse
              const distFromCenter = Math.sqrt(Math.pow((c - cols / 2) / (cols / 2), 2) + Math.pow((r - rows / 2) / (rows / 2), 2));
              const ring = Math.sin(phase * 12 - distFromCenter * 8);
              intensity = Math.max(0.2, (ring > 0 ? 1 : 0.35) * audioBoost);
              pixelColor = '#E11D48';
            } else if (effectCode === '08_peak_rain_meteor') {
              // Rain Meteor Strike
              const dropPos = (phase * 8 + c * 3.7) % rows;
              const dist = (r - dropPos + rows) % rows;
              if (dist < 4) {
                intensity = Math.max(0.1, 1 - dist * 0.24);
                pixelColor = dist === 0 ? '#FFFFFF' : colors[0];
              } else {
                intensity = 0.05;
                pixelColor = colors[1] || '#4A000E';
              }
            } else if (effectCode === '01_door_royal_glow' || effectCode === '09_outro_velvet_amber') {
              // Smooth Flow Wave
              const wave = Math.sin(phase * 1.5 + (c / cols) * 3 + (r / rows) * 2);
              intensity = 0.3 + wave * 0.3;
              const colorIdx = Math.floor(((wave + 1) / 2) * (colors.length - 1));
              pixelColor = colors[colorIdx] || colors[0];
            } else if (effectCode === '02_warmup_vertical_pulse') {
              // Harmonic Breathe
              const breathe = (Math.sin(phase * 3) + 1) / 2;
              intensity = 0.2 + breathe * 0.7 * audioBoost;
              pixelColor = breathe > 0.6 ? (colors[1] || colors[0]) : colors[0];
            } else if (effectCode === '10_safe_ambient_red') {
              // Safe Crimson Uniform
              intensity = 0.25;
              pixelColor = '#9F1239';
            } else {
              // Generic Chase / Wave
              const wave = Math.sin(phase * 3 + (c + r) * 0.3);
              intensity = 0.3 + wave * 0.4;
              pixelColor = colors[0];
            }

            // Apply global brightness
            const finalAlpha = Math.min(1, Math.max(0.04, intensity * briNorm));
            ctx.fillStyle = pixelColor;
            ctx.globalAlpha = finalAlpha;
            ctx.beginPath();
            ctx.arc(px, py, cellW * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Extra bloom for high intensity pixels
            if (finalAlpha > 0.65) {
              ctx.shadowColor = pixelColor;
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
        ctx.globalAlpha = 1;

        // --- 2. RENDER 6 VERTICAL TUBES (3 Left, 3 Right) ---
        const tubeWidth = 14;
        const tubeHeight = height * 0.58;
        const tubeY = height * 0.15;
        const tubePositions = [
          // Left Tubes (1, 2, 3)
          width * 0.08,
          width * 0.13,
          width * 0.18,
          // Right Tubes (4, 5, 6)
          width * 0.82,
          width * 0.87,
          width * 0.92,
        ];

        tubePositions.forEach((tx, tIdx) => {
          const isLeft = tIdx < 3;
          const tubeNum = tIdx + 1;

          // Tube housing silhouette
          ctx.fillStyle = '#0f1118';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(tx - tubeWidth / 2, tubeY, tubeWidth, tubeHeight, 6);
          ctx.fill();
          ctx.stroke();

          // 60 LEDs per tube simulation (rendered in segments)
          const ledSteps = 30; // sampled
          const stepH = tubeHeight / ledSteps;

          for (let l = 0; l < ledSteps; l++) {
            const ly = tubeY + (ledSteps - 1 - l) * stepH;
            const normH = l / ledSteps;

            let ledIntensity = 0.4;
            let ledColor = colors[0];

            if (currentPreset.code === '06_peak_eq_meter') {
              // Each tube acts as 1 band of 6-band EQ
              const bandLvl = Math.sin(phase * 4 + tIdx * 1.1) * 0.4 + 0.45 + audioEnergy * 0.4;
              ledIntensity = normH <= bandLvl ? 0.9 : 0.08;
              ledColor = normH > 0.8 ? '#FDA4AF' : normH > 0.5 ? '#F59E0B' : colors[0];
            } else if (currentPreset.code === '04_build_ladder_chase') {
              // Ladder chase upwards
              const chasePos = (phase * 6 + (isLeft ? tIdx : 5 - tIdx) * 1.5) % 1;
              const dist = Math.abs(normH - chasePos);
              ledIntensity = Math.max(0.08, 1 - dist * 4);
              ledColor = dist < 0.15 ? '#FFFFFF' : colors[0];
            } else if (currentPreset.code === '07_drop_stark_red') {
              // Strobe flash
              ledIntensity = (Math.sin(phase * 16) > 0 ? 1 : 0.4) * audioBoost;
              ledColor = '#E11D48';
            } else if (currentPreset.code === '10_safe_ambient_red') {
              ledIntensity = 0.22;
              ledColor = '#9F1239';
            } else {
              // Default wave
              const wave = Math.sin(phase * 3 + normH * 4 + tIdx * 0.8);
              ledIntensity = 0.3 + wave * 0.4;
              ledColor = colors[tIdx % colors.length];
            }

            const alpha = Math.min(1, Math.max(0.05, ledIntensity * briNorm));
            ctx.fillStyle = ledColor;
            ctx.globalAlpha = alpha;
            ctx.fillRect(tx - tubeWidth / 2 + 2, ly, tubeWidth - 4, stepH - 1.5);

            // Tube glow
            if (alpha > 0.5) {
              ctx.shadowColor = ledColor;
              ctx.shadowBlur = 8;
              ctx.fillRect(tx - tubeWidth / 2 + 3, ly, tubeWidth - 6, stepH - 1.5);
              ctx.shadowBlur = 0;
            }
          }
          ctx.globalAlpha = 1;

          // Tube Index Label
          ctx.fillStyle = '#64748B';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`T${tubeNum}`, tx, tubeY + tubeHeight + 14);
        });

        // Stage Floor Wash Reflection & High-Gloss Mirror Surface
        const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        floorGrad.addColorStop(0, `${colors[0]}28`);
        floorGrad.addColorStop(0.5, `${colors[0]}12`);
        floorGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, horizonY, width, height - horizonY);

        // True Mirror Reflection of WLED Devices (Tubes + Matrix)
        if (isMirrorActive) {
          // 1. Mirrored Matrix Reflection downwards with quadratic falloff
          const mirrorMatrixTop = horizonY + 4;
          const mirrorMatrixH = matrixH * 0.45;
          const mirrorMatrixGrad = ctx.createLinearGradient(0, mirrorMatrixTop, 0, mirrorMatrixTop + mirrorMatrixH);
          mirrorMatrixGrad.addColorStop(0, `${colors[0]}60`);
          mirrorMatrixGrad.addColorStop(0.4, `${colors[1] || colors[0]}25`);
          mirrorMatrixGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mirrorMatrixGrad;
          ctx.fillRect(matrixX, mirrorMatrixTop, matrixW, mirrorMatrixH);

          // 2. Mirrored 6 Tubes Reflection
          tubePositions.forEach((tx, tIdx) => {
            const mirrorTubeTop = horizonY + 4;
            const mirrorTubeH = tubeHeight * 0.42;
            const mGrad = ctx.createLinearGradient(tx, mirrorTubeTop, tx, mirrorTubeTop + mirrorTubeH);
            const tubeColor = colors[tIdx % colors.length];
            mGrad.addColorStop(0, `${tubeColor}70`);
            mGrad.addColorStop(0.5, `${tubeColor}25`);
            mGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = mGrad;
            ctx.beginPath();
            ctx.roundRect(tx - tubeWidth / 2, mirrorTubeTop, tubeWidth, mirrorTubeH, [0, 0, 6, 6]);
            ctx.fill();
          });

          // 3. Acoustic ripple waves across mirrored floor
          ctx.strokeStyle = `${colors[0]}40`;
          ctx.lineWidth = 1;
          for (let r = 1; r <= 3; r++) {
            const rippleY = horizonY + r * 22 + Math.sin(phase * 4 + r) * 3;
            if (rippleY < height) {
              ctx.beginPath();
              ctx.moveTo(width * 0.08, rippleY);
              ctx.lineTo(width * 0.92, rippleY);
              ctx.stroke();
            }
          }
        }

        // DJ Booth Shadow / Protection Cone (Rule: No full white on DJ)
        ctx.fillStyle = 'rgba(8, 9, 12, 0.85)';
        ctx.beginPath();
        const boothW = width * 0.28;
        const boothH = height * 0.16;
        ctx.roundRect((width - boothW) / 2, horizonY + 8, boothW, boothH, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DJ BOOTH ZONE (DARK SHIELDED)', width / 2, horizonY + boothH * 0.65);

      } else if (viewMode === 'scope_stream') {
        // --- 3. LINEAR OSCILLOSCOPE SCOPE MODE ---
        ctx.fillStyle = 'rgba(16, 18, 24, 0.6)';
        ctx.fillRect(20, 20, width - 40, height - 40);

        // Center line
        const midY = height / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, midY);
        ctx.lineTo(width - 30, midY);
        ctx.stroke();

        // Waveform 1: Matrix Flux
        ctx.beginPath();
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 2.5;
        for (let x = 30; x < width - 30; x += 4) {
          const normX = (x - 30) / (width - 60);
          const freq = 6 + (effectiveSpeed / 255) * 8;
          const amp = (height * 0.28) * briNorm * (1 + audioEnergy * 0.35);
          const y = midY + Math.sin(phase * 4 + normX * freq) * amp * Math.cos(normX * 2);
          if (x === 30) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Waveform 2: Vertical Tubes Accent Pulse
        ctx.beginPath();
        ctx.strokeStyle = colors[1] || '#F59E0B';
        ctx.lineWidth = 1.8;
        for (let x = 30; x < width - 30; x += 6) {
          const normX = (x - 30) / (width - 60);
          const amp = (height * 0.18) * briNorm * audioBoost;
          const y = midY + Math.cos(phase * 6 + normX * 12) * amp;
          if (x === 30) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // FFT Bars along bottom
        const bars = 24;
        const barW = (width - 60) / bars;
        for (let b = 0; b < bars; b++) {
          const bH = Math.min(height * 0.25, Math.abs(Math.sin(phase * 5 + b * 0.8)) * (height * 0.22) * audioBoost);
          ctx.fillStyle = b < 6 ? '#E11D48' : b < 16 ? '#F59E0B' : '#38BDF8';
          ctx.fillRect(30 + b * barW, height - 35 - bH, barW - 2, bH);
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentPreset, audioEnergy, effectiveSpeed, effectiveBrightness, isPlaying, viewMode]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* Top HUD Control Strip */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Preset Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                PRESET VISUALIZER &middot; {currentPreset.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                WLED #{currentPreset.effectId} ({currentPreset.effectName})
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800/80">
                {currentPreset.targetLayer}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>Paleta: <strong className="text-slate-200">{currentPreset.paletteName}</strong></span>
              <span>&middot;</span>
              <span>Fáza: <strong className="text-slate-200">{currentPreset.phase}</strong></span>
              <span>&middot;</span>
              <span className="text-emerald-400 font-bold">{fps} FPS</span>
            </div>
          </div>
        </div>

        {/* Right: Viewport Mode Switches & Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setViewMode('canvas_bloom')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'canvas_bloom'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Real-time fotonický shader (Canvas)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Canvas Shading</span>
            </button>

            <button
              onClick={() => setViewMode('svg_topology')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'svg_topology'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vektorová schéma pódia a rozptylu lúčov (SVG)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>SVG Topológia</span>
            </button>

            <button
              onClick={() => setViewMode('scope_stream')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'scope_stream'
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Osciloskopické priebehy a FFT spektrum"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Osciloskop</span>
            </button>
          </div>

          {/* Mirror stage toggle button */}
          <button
            onClick={() => setIsMirrorActive(!isMirrorActive)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              isMirrorActive
                ? 'bg-red-950/80 text-red-200 border-red-700 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Zrkadlová vizualizácia WLED zariadení a odrazu pódia"
          >
            <span className={`w-2 h-2 rounded-full ${isMirrorActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span>Zrkadlenie</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
            title={isPlaying ? 'Pozastaviť simuláciu' : 'Spustiť simuláciu'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      <div className="relative bg-slate-950 aspect-[16/9] max-h-[460px] w-full flex items-center justify-center overflow-hidden">
        
        {/* MODE 1 & 3: CANVAS (Bloom & Scope) */}
        {(viewMode === 'canvas_bloom' || viewMode === 'scope_stream') && (
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-contain"
          />
        )}

        {/* MODE 2: SVG ARCHITECTURAL VECTOR BLUEPRINT */}
        {viewMode === 'svg_topology' && (
          <div className="w-full h-full p-4 flex items-center justify-center">
            <svg 
              viewBox="0 0 960 540" 
              className="w-full h-full max-h-[460px] drop-shadow-2xl select-none"
            >
              <defs>
                {/* Glow Filter */}
                <filter id="svg-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Linear Gradients from Palette */}
                <linearGradient id="svg-tube-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor={currentPreset.paletteColors[0] || '#E11D48'} stopOpacity="0.3" />
                  <stop offset="70%" stopColor={currentPreset.paletteColors[0] || '#E11D48'} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={currentPreset.paletteColors[1] || '#FDA4AF'} stopOpacity="1" />
                </linearGradient>

                <linearGradient id="svg-matrix-glow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={currentPreset.paletteColors[0] || '#E11D48'} stopOpacity="0.8" />
                  <stop offset="50%" stopColor={currentPreset.paletteColors[1] || '#9F1239'} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={currentPreset.paletteColors[2] || '#000000'} stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Blueprint Grid Lines */}
              <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1">
                {Array.from({ length: 19 }).map((_, i) => (
                  <line key={`h-${i}`} x1="40" y1={30 + i * 26} x2="920" y2={30 + i * 26} />
                ))}
                {Array.from({ length: 33 }).map((_, i) => (
                  <line key={`v-${i}`} x1="40 + i * 27.5" y1="30" x2="40 + i * 27.5" y2="510" />
                ))}
              </g>

              {/* Rear Stage Matrix (432 LED, 24x18) */}
              <rect
                x="260"
                y="70"
                width="440"
                height="280"
                rx="8"
                fill="url(#svg-matrix-glow)"
                stroke="#E11D48"
                strokeWidth="2"
                filter="url(#svg-neon-glow)"
                className="transition-all duration-300"
              />

              {/* Matrix Zigzag Wiring Indication Line */}
              <path
                d="M 280 85 L 680 85 L 680 115 L 280 115 L 280 145 L 680 145 L 680 175 L 280 175 L 280 205 L 680 205 L 680 235 L 280 235 L 280 265 L 680 265 L 680 295 L 280 295 L 280 325 L 680 325"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Crown Center Detail in SVG */}
              <g transform="translate(480, 210) scale(0.9)" className="transition-all">
                <path
                  d="M -60 40 L 60 40 L 75 -20 L 30 15 L 0 -45 L -30 15 L -75 -20 Z"
                  fill={currentPreset.code === '05_peak_disco_crown' ? '#F59E0B' : '#E11D48'}
                  fillOpacity={currentPreset.code === '05_peak_disco_crown' ? '0.9' : '0.35'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="url(#svg-neon-glow)"
                />
              </g>

              {/* Beam Cones from Tubes to Stage */}
              <polygon
                points="100,120 180,480 70,480"
                fill={currentPreset.paletteColors[0] || '#E11D48'}
                fillOpacity="0.08"
              />
              <polygon
                points="860,120 890,480 780,480"
                fill={currentPreset.paletteColors[0] || '#E11D48'}
                fillOpacity="0.08"
              />

              {/* 6 Vertical Tubes (3 Left, 3 Right) */}
              {[
                { id: 1, x: 90, label: 'T1' },
                { id: 2, x: 135, label: 'T2' },
                { id: 3, x: 180, label: 'T3' },
                { id: 4, x: 780, label: 'T4' },
                { id: 5, x: 825, label: 'T5' },
                { id: 6, x: 870, label: 'T6' },
              ].map(tube => (
                <g key={tube.id} transform={`translate(${tube.x}, 90)`}>
                  {/* Outer structure */}
                  <rect
                    x="-10"
                    y="0"
                    width="20"
                    height="320"
                    rx="6"
                    fill="#101218"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />
                  {/* Neon LED Core */}
                  <rect
                    x="-6"
                    y="4"
                    width="12"
                    height="312"
                    rx="4"
                    fill="url(#svg-tube-grad)"
                    filter="url(#svg-neon-glow)"
                  />
                  {/* Label */}
                  <text
                    x="0"
                    y="345"
                    fill="#94A3B8"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {tube.label}
                  </text>
                </g>
              ))}

              {/* DJ Booth Shielding Area */}
              <rect
                x="360"
                y="380"
                width="240"
                height="80"
                rx="8"
                fill="#0F1118"
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x="480"
                y="426"
                fill="#94A3B8"
                fontSize="12"
                fontFamily="monospace"
                textAnchor="middle"
                fontWeight="bold"
              >
                DJ BOOTH (NO WHITE BEAM)
              </text>

              {/* Topology Annotations */}
              <text x="480" y="55" fill="#FFFFFF" fontSize="13" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                ZADNÝ MATRIX: 24 × 18 = 432 LED (ESP32 #1, 10 cm pitch)
              </text>
              <text x="135" y="65" fill="#E11D48" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                TRUBICE 1–3 (ESP32 #2)
              </text>
              <text x="825" y="65" fill="#E11D48" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                TRUBICE 4–6 (ESP32 #3)
              </text>
            </svg>
          </div>
        )}

        {/* Live Overlay HUD Info Badges (Bottom Left & Right) */}
        {showMetrics && (
          <>
            <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1 shadow-lg pointer-events-none">
              <div className="text-slate-400">Optický výstup:</div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>Efekt: <strong className="text-red-400">{currentPreset.effectName}</strong></span>
                <span>&middot;</span>
                <span>Jas: <strong className="text-amber-400">{effectiveBrightness}%</strong></span>
                <span>&middot;</span>
                <span>Rýchlosť: <strong className="text-cyan-400">{effectiveSpeed}</strong></span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1 shadow-lg text-right pointer-events-none">
              <div className="text-slate-400">Audio-reaktivita:</div>
              <div className="text-white font-bold flex items-center gap-2 justify-end">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  {Math.round(audioEnergy * 100)}%
                </span>
                <span>&middot;</span>
                <span className="text-slate-300">UDP Sync &le; 35ms</span>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Footer Inspector & Swatch Strip */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Palette Swatches */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Aktívna paleta:</span>
          <div className="flex items-center gap-1.5">
            {currentPreset.paletteColors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                <span
                  className="w-3 h-3 rounded-full border border-black/80 inline-block shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-slate-300 font-semibold">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rationale and Optical Safety Warning */}
        <div className="text-slate-400 text-[11px] max-w-xl truncate">
          <strong className="text-slate-200">Zámer:</strong> {currentPreset.empiricalRationale}
        </div>
      </div>

    </div>
  );
};
