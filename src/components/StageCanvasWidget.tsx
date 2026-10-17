import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Crown, 
  ChevronDown, 
  ChevronUp, 
  GripHorizontal, 
  Sparkles, 
  Layers, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  Pin, 
  PinOff,
  Maximize2,
  Sliders,
  Check,
  Zap,
  Activity
} from 'lucide-react';
import { WLED_PRESETS, WledPreset } from '../data/wledData';

interface StageCanvasWidgetProps {
  currentPreset: WledPreset;
  audioEnergy: number;
  masterBrightness?: number;
  masterSpeed?: number;
  onSelectPreset?: (preset: WledPreset) => void;
}

// Convert hex color to rgba string
const hexToRgba = (hex: string, alpha: number) => {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(225, 29, 72, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const StageCanvasWidget: React.FC<StageCanvasWidgetProps> = ({
  currentPreset,
  audioEnergy,
  masterBrightness,
  masterSpeed,
  onSelectPreset,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive mobile detection (< 768px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Display mode: 'floating' (desktop default) or 'docked' (sticky top below header)
  const [dockMode, setDockMode] = useState<'floating' | 'docked'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 'docked';
      const saved = localStorage.getItem('queens_canvas_dock_mode');
      if (saved === 'docked' || saved === 'floating') return saved;
    }
    return 'floating';
  });

  // Collapse / Roll-up state (persisted)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('queens_canvas_collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Visualizer render style inside canvas: 'stage_2d' (Pódium & Trubice) vs 'fx_bloom' (Fotonický Shader) vs 'dual'
  const [renderStyle, setRenderStyle] = useState<'stage_2d' | 'fx_bloom'>('stage_2d');
  
  // Mirror visualization state (Zrkadlenie L/R synchronizácia WLED zariadení)
  const [isMirrorActive, setIsMirrorActive] = useState<boolean>(true);
  const [isAnimationRunning, setIsAnimationRunning] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  // Floating Window Drag & Drop Coordinates
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('queens_floating_canvas_pos');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return parsed;
          }
        } catch {
          // ignore corrupted json
        }
      }
      // Default top-right position on desktop
      return {
        x: Math.max(20, window.innerWidth - 490),
        y: 68,
      };
    }
    return { x: 800, y: 70 };
  });

  // Dragging interaction state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Window size preset: 'compact' (380px) | 'standard' (480px) | 'wide' (600px)
  const [sizePreset, setSizePreset] = useState<'compact' | 'standard' | 'wide'>('standard');

  // Handle window resizing to keep bounds checked
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && dockMode === 'floating') {
        // Automatically switch to docked on small screens
        setDockMode('docked');
      }

      // Keep floating window inside viewport bounds
      setPosition(prev => {
        const maxX = Math.max(10, window.innerWidth - (sizePreset === 'compact' ? 380 : sizePreset === 'wide' ? 620 : 490));
        const maxY = Math.max(60, window.innerHeight - 120);
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(60, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dockMode, sizePreset]);

  // Persist settings
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('queens_canvas_collapsed', String(next));
      return next;
    });
  }, []);

  const toggleDockMode = useCallback(() => {
    setDockMode(prev => {
      const next = prev === 'floating' ? 'docked' : 'floating';
      localStorage.setItem('queens_canvas_dock_mode', next);
      return next;
    });
  }, []);

  const resetPosition = useCallback(() => {
    const defaultPos = {
      x: Math.max(20, window.innerWidth - (sizePreset === 'compact' ? 390 : sizePreset === 'wide' ? 630 : 500)),
      y: 68,
    };
    setPosition(defaultPos);
    localStorage.setItem('queens_floating_canvas_pos', JSON.stringify(defaultPos));
  }, [sizePreset]);

  // Drag listeners
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMobile || dockMode === 'docked') return;
    // Don't start drag if clicking an interactive button
    if ((e.target as HTMLElement).closest('button, select, input, a')) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const widgetWidth = sizePreset === 'compact' ? 380 : sizePreset === 'wide' ? 620 : 490;
    const maxX = Math.max(10, window.innerWidth - widgetWidth - 10);
    const maxY = Math.max(60, window.innerHeight - 80);

    const newX = Math.min(Math.max(10, dragStartRef.current.startX + deltaX), maxX);
    const newY = Math.min(Math.max(55, dragStartRef.current.startY + deltaY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('queens_floating_canvas_pos', JSON.stringify(position));
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Speed and Brightness factoring masters
  const effectiveSpeed = masterSpeed !== undefined ? masterSpeed : currentPreset.speed;
  const effectiveBrightness = masterBrightness !== undefined ? masterBrightness : currentPreset.brightnessPct;

  // Real-time Stage & Optical Canvas Drawing Loop
  useEffect(() => {
    if (isCollapsed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let phase = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // FPS calculation
      frameCount++;
      if (time - fpsTimer > 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      if (isAnimationRunning) {
        phase += dt * (effectiveSpeed / 255) * 3.5;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Primary colors from preset
      const primaryHex = currentPreset.paletteColors[0] || '#D90429';
      const secondaryHex = currentPreset.paletteColors[1] || '#F59E0B';
      const accentHex = currentPreset.paletteColors[2] || '#FFFFFF';

      const masterBri = Math.max(0.05, effectiveBrightness / 100);
      const beatBoost = audioEnergy * 0.75;

      // Clear dark club background (Obsidian black)
      ctx.fillStyle = '#07090E';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient club grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      const gridSize = 28;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (renderStyle === 'stage_2d') {
        // ==========================================
        // 2D STAGE SIMULATION (QUEENS PUB STAGE 150m²)
        // 6 Vertical Tubes + 24x18 Matrix + DJ Booth + Floor Reflections
        // ==========================================

        const stageY = height * 0.72;
        const stageHeight = height * 0.28;

        // Wooden stage platform base
        const stageGrad = ctx.createLinearGradient(0, stageY, 0, height);
        stageGrad.addColorStop(0, '#150A0D');
        stageGrad.addColorStop(1, '#080305');
        ctx.fillStyle = stageGrad;
        ctx.fillRect(width * 0.08, stageY, width * 0.84, stageHeight);
        ctx.strokeStyle = '#380E14';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.08, stageY, width * 0.84, stageHeight);

        // Stage Floor Light Reflections (Mirror effect on polished floor)
        const floorGrad = ctx.createLinearGradient(0, stageY, 0, height);
        floorGrad.addColorStop(0, hexToRgba(primaryHex, 0.15 * masterBri + beatBoost * 0.1));
        floorGrad.addColorStop(0.7, 'transparent');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(width * 0.08, stageY, width * 0.84, stageHeight * 0.6);

        // 1. REAR STAGE MATRIX (24 Columns x 18 Rows = 432 LEDs)
        const cols = 24;
        const rows = 18;
        const matrixW = width * 0.50;
        const matrixH = height * 0.44;
        const matrixX = width * 0.25;
        const matrixY = height * 0.16;

        const cellW = matrixW / cols;
        const cellH = matrixH / rows;

        // Matrix aluminum frame
        ctx.fillStyle = '#0A0C11';
        ctx.fillRect(matrixX - 6, matrixY - 6, matrixW + 12, matrixH + 12);
        ctx.strokeStyle = '#4C0519';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(matrixX - 6, matrixY - 6, matrixW + 12, matrixH + 12);

        // Royal Crown Shape Mask (24x18)
        const isCrownPixel = (c: number, r: number) => {
          if (r < 5 || r > 14 || c < 5 || c > 18) return false;
          if (r >= 12 && r <= 14 && c >= 6 && c <= 17) return true; // Base
          if (r >= 6 && (c === 6 || c === 11 || c === 12 || c === 17)) return true; // Peaks
          if (r >= 8 && (c === 7 || c === 8 || c === 10 || c === 13 || c === 15 || c === 16)) return true;
          if (r >= 10 && c >= 7 && c <= 16) return true;
          return false;
        };

        // Render Matrix LEDs
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Apply Mirror logic if enabled (reflect left half onto right half)
            const activeCol = isMirrorActive && c >= cols / 2 ? cols - 1 - c : c;
            const x = matrixX + c * cellW + cellW * 0.5;
            const y = matrixY + r * cellH + cellH * 0.5;

            let ledColor = primaryHex;
            let alpha = 0.18 * masterBri;

            if (currentPreset.effectName === '2D Freqmatrix' && isCrownPixel(c, r)) {
              // Royal Crown glow
              alpha = Math.min(1, (0.55 + beatBoost * 0.7) * masterBri);
              ledColor = beatBoost > 0.45 ? accentHex : secondaryHex;
            } else if (currentPreset.effectName === '2D GEQ (Audio)') {
              // 24-band Audio Frequency Matrix
              const bandProgress = (rows - 1 - r) / rows;
              const colHeight = (Math.sin(activeCol * 0.5 + phase * 2) * 0.35 + 0.5) * (0.4 + beatBoost * 0.6);
              if (colHeight > bandProgress) {
                alpha = Math.min(1, (0.6 + beatBoost * 0.4) * masterBri);
                ledColor = bandProgress > 0.7 ? accentHex : primaryHex;
              }
            } else if (currentPreset.effectName === 'Meteor') {
              const meteorHead = (phase * 16 + activeCol * 1.5) % (rows * 2);
              const dist = Math.abs(r - meteorHead);
              if (dist < 4) {
                alpha = (1 - dist / 4) * masterBri;
                ledColor = dist < 1 ? accentHex : primaryHex;
              }
            } else if (currentPreset.effectName === 'Flow' || currentPreset.effectName === 'Plasma') {
              const wave = Math.sin(activeCol * 0.35 - phase * 2.2 + r * 0.25);
              alpha = ((wave + 1) * 0.4 + 0.1 + beatBoost * 0.25) * masterBri;
              ledColor = wave > 0.15 ? primaryHex : secondaryHex;
            } else if (currentPreset.effectName === 'Solid') {
              alpha = masterBri;
              ledColor = primaryHex;
            } else {
              // General reactive wave
              const generalWave = Math.sin(activeCol * 0.4 + phase * 3);
              alpha = ((generalWave + 1) * 0.4 + 0.15) * masterBri;
              ledColor = generalWave > 0.3 ? secondaryHex : primaryHex;
            }

            alpha = Math.min(1, Math.max(0.04, alpha));

            // Dot
            ctx.beginPath();
            ctx.arc(x, y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(ledColor, alpha);
            ctx.fill();

            // Glow on bright dots
            if (alpha > 0.55) {
              ctx.beginPath();
              ctx.arc(x, y, 6.2, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(ledColor, alpha * 0.25);
              ctx.fill();
            }
          }
        }

        // 2. VERTICAL LED TUBES (6 TUBES: 3 LEFT, 3 RIGHT, 60 LED/m each)
        const renderTubes = (startX: number, spacing: number, isLeft: boolean) => {
          const tubeCount = 3;
          const ledsPerTube = 28;
          const tubeTopY = height * 0.18;
          const tubeBottomY = height * 0.68;
          const tubeHeight = tubeBottomY - tubeTopY;

          for (let t = 0; t < tubeCount; t++) {
            // In mirror mode, tube index mirrors symmetric left to right
            const activeTubeIdx = isMirrorActive && !isLeft ? tubeCount - 1 - t : t;
            const tubeX = startX + t * spacing;

            // Aluminum enclosure
            ctx.fillStyle = '#090B10';
            ctx.fillRect(tubeX - 5, tubeTopY - 4, 10, tubeHeight + 8);
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 1;
            ctx.strokeRect(tubeX - 5, tubeTopY - 4, 10, tubeHeight + 8);

            // Light beam projection cone onto stage floor
            const beamGrad = ctx.createLinearGradient(tubeX, tubeBottomY, tubeX, height);
            beamGrad.addColorStop(0, hexToRgba(primaryHex, 0.25 * masterBri));
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(tubeX - 4, tubeBottomY);
            ctx.lineTo(tubeX + 4, tubeBottomY);
            ctx.lineTo(tubeX + 18 * (isLeft ? -1 : 1), height);
            ctx.lineTo(tubeX - 18 * (isLeft ? -1 : 1), height);
            ctx.fill();

            for (let p = 0; p < ledsPerTube; p++) {
              const ledY = tubeTopY + (p / (ledsPerTube - 1)) * tubeHeight;
              let ledColor = primaryHex;
              let alpha = 0.25 * masterBri;

              if (currentPreset.effectName === '2D GEQ (Audio)') {
                const heightFraction = 1 - (p / ledsPerTube);
                const colBoost = Math.sin(activeTubeIdx + phase) * 0.2 + 0.6;
                if (audioEnergy * colBoost > heightFraction * 0.75) {
                  alpha = Math.min(1, (audioEnergy + 0.3) * masterBri);
                  ledColor = audioEnergy > 0.6 ? accentHex : secondaryHex;
                }
              } else if (currentPreset.effectName === 'Chaser') {
                const head = (phase * 22 + activeTubeIdx * 4) % ledsPerTube;
                const d = Math.abs((ledsPerTube - 1 - p) - head);
                if (d < 5) {
                  alpha = (1 - d / 5) * masterBri;
                  ledColor = d < 1 ? accentHex : primaryHex;
                }
              } else if (currentPreset.effectName === 'Meteor') {
                const head = (phase * 24 + activeTubeIdx * 6) % ledsPerTube;
                const d = Math.abs(p - head);
                if (d < 5) {
                  alpha = (1 - d / 5) * masterBri;
                  ledColor = d < 1 ? accentHex : secondaryHex;
                }
              } else if (currentPreset.effectName === 'Breathe') {
                const breathe = (Math.sin(phase * 2 + activeTubeIdx * 0.6) + 1) * 0.5;
                alpha = (0.2 + breathe * 0.8 + beatBoost * 0.3) * masterBri;
              } else {
                const wave = Math.sin(p * 0.25 - phase * 3 + activeTubeIdx);
                alpha = ((wave + 1) * 0.4 + 0.15) * masterBri;
              }

              alpha = Math.min(1, Math.max(0.05, alpha));

              ctx.beginPath();
              ctx.arc(tubeX, ledY, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(ledColor, alpha);
              ctx.fill();

              if (alpha > 0.55) {
                ctx.beginPath();
                ctx.arc(tubeX, ledY, 5.5, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba(ledColor, alpha * 0.28);
                ctx.fill();
              }
            }
          }
        };

        // 3 Left Tubes and 3 Right Tubes
        renderTubes(width * 0.11, width * 0.038, true);
        renderTubes(width * 0.78, width * 0.038, false);

        // 3. FRONT CENTER DJ BOOTH (WITH STRICT SAFETY WHITE ENFORCEMENT)
        const boothW = width * 0.24;
        const boothH = height * 0.11;
        const boothX = width * 0.5 - boothW * 0.5;
        const boothY = height * 0.65;

        // Booth structure
        ctx.fillStyle = '#08090D';
        ctx.fillRect(boothX, boothY, boothW, boothH);
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(boothX, boothY, boothW, boothH);

        // Subtle DJ Silhouette & Crown Text
        ctx.fillStyle = '#E11D48';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('QUEENS DJ BOOTH', width * 0.5, boothY + boothH * 0.58);

        // Safety warning pill if someone tries white
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(width * 0.5 - 42, boothY + boothH - 5, 84, 12);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px monospace';
        ctx.fillText('NO WHITE ON DJ', width * 0.5, boothY + boothH + 4);

        // DJ figure
        ctx.fillStyle = '#030406';
        ctx.beginPath();
        ctx.arc(width * 0.5, boothY - 11, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(width * 0.47, boothY - 2, 24, 15);

      } else {
        // ==========================================
        // PHOTONIC FX BLOOM / SHADER SIMULATION
        // ==========================================
        const cx = width / 2;
        const cy = height / 2;

        // Radial optical beam blooms
        const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.5);
        radial.addColorStop(0, hexToRgba(primaryHex, 0.45 * masterBri + beatBoost * 0.3));
        radial.addColorStop(0.4, hexToRgba(secondaryHex, 0.2 * masterBri));
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        // High frequency optical rays
        const rayCount = 18;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * Math.PI * 2 + phase;
          const rayLength = (width * 0.35) * (0.6 + Math.sin(phase * 4 + i) * 0.4);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * rayLength, cy + Math.sin(angle) * rayLength);
          ctx.strokeStyle = hexToRgba(i % 2 === 0 ? primaryHex : secondaryHex, 0.4 * masterBri);
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Center Royal Crown icon in gold
        ctx.save();
        ctx.translate(cx, cy);
        const scale = 1 + beatBoost * 0.3;
        ctx.scale(scale, scale);
        ctx.fillStyle = accentHex;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👑', 0, 0);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentPreset, effectiveBrightness, effectiveSpeed, isAnimationRunning, isCollapsed, isMirrorActive, renderStyle, audioEnergy]);

  // Dimensions based on preset
  const widgetWidth = sizePreset === 'compact' ? 380 : sizePreset === 'wide' ? 620 : 490;
  const canvasHeight = sizePreset === 'compact' ? 190 : sizePreset === 'wide' ? 310 : 245;

  // -------------------------------------------------------------
  // RENDER: STICKY DOCKED MODE (Always on Mobile, or user selected)
  // -------------------------------------------------------------
  if (isMobile || dockMode === 'docked') {
    return (
      <div 
        ref={containerRef}
        className="sticky top-[57px] z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl transition-all duration-300 select-none"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main slim header bar */}
          <div className="py-2 flex items-center justify-between gap-2 text-xs font-mono">
            {/* Title & expand/collapse strip */}
            <div 
              onClick={toggleCollapse}
              className="flex items-center gap-2 cursor-pointer min-w-0"
              title={isCollapsed ? 'Rozbaliť Preset Visualizer' : 'Zbaliť Preset Visualizer'}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
                className={`p-1 rounded-md transition-all flex items-center justify-center shrink-0 ${
                  isCollapsed
                    ? 'bg-red-600 text-white shadow-md animate-pulse hover:bg-red-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title={isCollapsed ? 'Rozbaliť náhľad' : 'Zbaliť do lišty'}
              >
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-white" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-300" />
                )}
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <Crown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-extrabold text-white text-xs tracking-wider uppercase">
                  PRESET VISUALIZER
                </span>
              </div>

              <span className="text-slate-600 hidden sm:inline">&middot;</span>

              {/* Active preset name badge */}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800/80 truncate">
                {currentPreset.name}
              </span>

              {/* Color swatches */}
              <div className="hidden sm:flex items-center -space-x-1 shrink-0 ml-1">
                {currentPreset.paletteColors.map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/70 inline-block shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Audio Beat meter */}
              <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-bold shrink-0 ml-2">
                <Volume2 className="w-3 h-3" />
                {Math.round(audioEnergy * 100)}%
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Style switch: Stage 2D vs FX Bloom */}
              {!isCollapsed && (
                <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                  <button
                    onClick={() => setRenderStyle('stage_2d')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      renderStyle === 'stage_2d' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pódium 2D
                  </button>
                  <button
                    onClick={() => setRenderStyle('fx_bloom')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      renderStyle === 'fx_bloom' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fotonický Bloom
                  </button>
                </div>
              )}

              {/* Mirror toggle button */}
              {!isCollapsed && (
                <button
                  onClick={() => setIsMirrorActive(!isMirrorActive)}
                  className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                    isMirrorActive 
                      ? 'bg-amber-950/70 border-amber-600 text-amber-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                  title="Zrkadlenie L/R WLED synchronizácie"
                >
                  <Activity className="w-3 h-3" />
                  <span>Zrkadlenie {isMirrorActive ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Switch to Floating on Desktop */}
              {!isMobile && (
                <button
                  onClick={toggleDockMode}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                  title="Prepnúť na plávajúce okno (Drag & Drop)"
                >
                  <PinOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Odopnúť okno</span>
                </button>
              )}

              {/* Collapse/Expand Toggle */}
              <button
                onClick={toggleCollapse}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
                  isCollapsed
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Prepnúť zbalenie náhľadu"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-white" />
                    <span>Otvoriť</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Zbaliť</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Canvas View */}
          {!isCollapsed && (
            <div className="pb-3 pt-1">
              <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={960}
                  height={380}
                  className="w-full h-44 sm:h-64 object-cover block"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur border border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
                    {fps} FPS
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-300">
                    {renderStyle === 'stage_2d' ? '6 Trubíc + Matrix 24×18 (792 LED)' : 'Photonic Shader Engine'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <button
                    onClick={() => setIsAnimationRunning(!isAnimationRunning)}
                    className="p-1 rounded bg-black/80 hover:bg-black text-slate-300 hover:text-white border border-slate-800 text-xs"
                    title={isAnimationRunning ? 'Pozastaviť' : 'Spustiť'}
                  >
                    {isAnimationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: FLOATING DRAG & DROP WINDOW (Desktop default mode)
  // -------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isCollapsed ? 'auto' : `${widgetWidth}px`,
      }}
      className={`fixed z-40 select-none transition-shadow rounded-xl border shadow-2xl backdrop-blur-xl ${
        isDragging 
          ? 'border-red-500 shadow-red-950/70 shadow-2xl ring-2 ring-red-500/30' 
          : 'border-slate-800 hover:border-slate-700 bg-slate-950/90'
      }`}
    >
      {/* Draggable Titlebar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`px-3 py-2 flex items-center justify-between gap-2 border-b rounded-t-xl transition-colors cursor-grab active:cursor-grabbing ${
          isDragging ? 'bg-red-950/50 border-red-500/50' : 'bg-slate-900/90 border-slate-800/80 hover:bg-slate-900'
        }`}
        title="Kliknite a potiahnite pre premiestnenie okna kamkoľvek na obrazovke"
      >
        {/* Left Side: Grip Handle + Title + Toggle Arrow */}
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          
          <button
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
            className={`p-1 rounded-md transition-all flex items-center justify-center shrink-0 ${
              isCollapsed
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isCollapsed ? 'Rozbaliť náhľad' : 'Zbaliť do lišty'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-slate-300" />
            )}
          </button>

          <span className="font-extrabold text-white text-xs tracking-wider uppercase flex items-center gap-1.5 truncate">
            <Crown className="w-3.5 h-3.5 text-red-500 shrink-0" />
            PRESET VISUALIZER
          </span>

          {/* Active Preset name */}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800/80 truncate max-w-[130px]">
            {currentPreset.name}
          </span>
        </div>

        {/* Right Side: Window Control Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          {/* Audio meter */}
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
            <Volume2 className="w-2.5 h-2.5" />
            {Math.round(audioEnergy * 100)}%
          </span>

          {/* Dock / Pin to Top Button */}
          <button
            onClick={toggleDockMode}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="Pripnúť hore pod hlavičku (Sticky Dock)"
          >
            <Pin className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Reset Position Button */}
          <button
            onClick={resetPosition}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="Obnoviť predvolenú pozíciu vpravo hore"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize / Maximize Chevron */}
          <button
            onClick={toggleCollapse}
            className={`p-1 rounded transition-colors ${
              isCollapsed ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isCollapsed ? 'Rozbaliť' : 'Zbaliť'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Body Content */}
      {!isCollapsed && (
        <div className="p-2 space-y-2">
          {/* Subheader: Render style switch + Mirror Sync + Size presets */}
          <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
            {/* View Style Switch */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setRenderStyle('stage_2d')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  renderStyle === 'stage_2d' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pódium 2D
              </button>
              <button
                onClick={() => setRenderStyle('fx_bloom')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  renderStyle === 'fx_bloom' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bloom FX
              </button>
            </div>

            {/* Mirror Sync Toggle */}
            <button
              onClick={() => setIsMirrorActive(!isMirrorActive)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                isMirrorActive 
                  ? 'bg-amber-950/70 border-amber-600 text-amber-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Zrkadlenie L/R WLED synchronizácie"
            >
              <Activity className="w-3 h-3" />
              <span>Zrkadlenie {isMirrorActive ? 'ON' : 'OFF'}</span>
            </button>

            {/* Size options */}
            <div className="flex items-center gap-1">
              {(['compact', 'standard', 'wide'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSizePreset(s)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                    sizePreset === s ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={`Nastaviť veľkosť: ${s}`}
                >
                  {s === 'compact' ? 'S' : s === 'standard' ? 'M' : 'L'}
                </button>
              ))}
            </div>
          </div>

          {/* The Main High-Performance Canvas */}
          <div className="relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={960}
              height={480}
              style={{ height: `${canvasHeight}px` }}
              className="w-full object-cover block"
            />

            {/* Top status overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur border border-slate-800 text-[9px] font-mono text-emerald-400 font-bold">
                {fps} FPS
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur border border-slate-800 text-[9px] font-mono text-slate-300">
                {renderStyle === 'stage_2d' ? 'Pódium QUEENS (792 LED)' : 'Photonic FX'}
              </span>
            </div>

            {/* Bottom info & Play/Pause */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="px-2 py-0.5 rounded bg-black/80 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2">
                <span>{currentPreset.effectName}</span>
                <span className="text-slate-500">&middot;</span>
                <div className="flex items-center -space-x-1">
                  {currentPreset.paletteColors.map((c, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full border border-black inline-block"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-1">
                <button
                  onClick={() => setIsAnimationRunning(!isAnimationRunning)}
                  className="p-1 rounded bg-black/80 hover:bg-black text-slate-300 hover:text-white border border-slate-800 text-xs"
                  title={isAnimationRunning ? 'Pozastaviť animáciu' : 'Spustiť animáciu'}
                >
                  {isAnimationRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
