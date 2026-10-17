import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  GripHorizontal, 
  Move, 
  Maximize2, 
  Minimize2, 
  Pin, 
  PinOff, 
  Eye, 
  Sparkles, 
  Layers, 
  Volume2, 
  SunMedium,
  RotateCcw
} from 'lucide-react';
import { WledPreset } from '../data/wledData';
import { PresetVisualizer } from './PresetVisualizer';
import { CeilingVisualizer } from './CeilingVisualizer';

interface FloatingVisualizerWindowProps {
  currentPreset: WledPreset;
  onSelectPreset?: (preset: WledPreset) => void;
  audioEnergy: number;
  masterBrightness: number;
  masterSpeed: number;
}

const STORAGE_KEY_POS = 'queens_visualizer_floating_pos';
const STORAGE_KEY_COLLAPSED = 'queens_visualizer_collapsed';
const STORAGE_KEY_MODE = 'queens_visualizer_layout_mode';

export const FloatingVisualizerWindow: React.FC<FloatingVisualizerWindowProps> = ({
  currentPreset,
  onSelectPreset,
  audioEnergy,
  masterBrightness,
  masterSpeed,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Layout mode: 'mobile_sticky' | 'desktop_floating' | 'docked_inline'
  const [layoutMode, setLayoutMode] = useState<'mobile_sticky' | 'desktop_floating' | 'docked_inline'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 'mobile_sticky';
      const saved = localStorage.getItem(STORAGE_KEY_MODE);
      if (saved === 'docked_inline' || saved === 'desktop_floating') return saved;
      return 'desktop_floating'; // default on desktop as requested
    }
    return 'desktop_floating';
  });

  // Collapsed / rolled up state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  // Position for floating desktop mode (x, y)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    // Default initial position near top right of desktop
    return { x: Math.max(20, (typeof window !== 'undefined' ? window.innerWidth - 680 : 400)), y: 72 };
  });

  // Floating window size variant: 'compact' (540px) | 'standard' (660px)
  const [windowWidth, setWindowWidth] = useState<number>(660);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Internal visualizer engine view: 'preset' | 'stage_2d' | 'split'
  const [engineView, setEngineView] = useState<'preset' | 'stage_2d' | 'split'>('preset');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && layoutMode !== 'mobile_sticky') {
        setLayoutMode('mobile_sticky');
      } else if (!mobile && layoutMode === 'mobile_sticky') {
        setLayoutMode('desktop_floating');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layoutMode]);

  // Persist collapsed state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_COLLAPSED, String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  // Save layout mode
  const handleSetLayoutMode = useCallback((mode: 'mobile_sticky' | 'desktop_floating' | 'docked_inline') => {
    setLayoutMode(mode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (e) {
      // ignore
    }
  }, []);

  // Drag handlers for desktop floating mode
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on left click and not on buttons
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, select, input')) return;

    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx));
      const newY = Math.max(60, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(position));
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  // Reset position
  const handleResetPosition = () => {
    const defaultPos = { x: Math.max(20, window.innerWidth - 680), y: 72 };
    setPosition(defaultPos);
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(defaultPos));
    } catch (e) {
      // ignore
    }
  };

  const isFloating = !isMobile && layoutMode === 'desktop_floating';
  const isStickyMobile = isMobile || layoutMode === 'mobile_sticky';

  return (
    <>
      {/* Container wrapper */}
      <div
        style={
          isFloating
            ? {
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: isCollapsed ? 'auto' : `${Math.min(windowWidth, window.innerWidth - 20)}px`,
                maxWidth: '96vw',
                zIndex: 45,
              }
            : undefined
        }
        className={`transition-all duration-200 select-none ${
          isStickyMobile
            ? 'sticky top-[57px] z-30 w-full mb-4 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl'
            : isFloating
            ? 'shadow-2xl rounded-xl border border-slate-700/80 bg-slate-950/95 backdrop-blur-lg overflow-hidden'
            : 'w-full mb-4 rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden'
        }`}
      >
        {/* HEADER BAR & MINIMAL STRIP (WHEN COLLAPSED OR EXPANDED) */}
        <div
          onMouseDown={isFloating ? handleMouseDown : undefined}
          className={`px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs font-mono transition-colors border-b ${
            isFloating
              ? `cursor-grab active:cursor-grabbing bg-slate-900/90 border-slate-800 ${
                  isDragging ? 'border-red-500 bg-slate-900 shadow-lg' : ''
                }`
              : 'bg-slate-900/95 border-slate-800'
          }`}
        >
          {/* Left: Collapse Arrow + Title "PRESET VISUALIZER" */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Small arrow indicating rolled up / collapsed state */}
            <button
              onClick={toggleCollapse}
              className={`p-1 rounded-md transition-all flex items-center justify-center shrink-0 ${
                isCollapsed
                  ? 'bg-red-600 text-white shadow-md animate-pulse hover:bg-red-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isCollapsed ? 'Rozbaliť Preset Visualizer' : 'Zrolovať / schovať do pásika'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-white" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Draggable Icon handle for desktop */}
            {isFloating && (
              <span className="text-slate-500 hover:text-slate-300 shrink-0 cursor-grab" title="Presunúť okno ťahaním">
                <GripHorizontal className="w-4 h-4" />
              </span>
            )}

            {/* Title: PRESET VISUALIZER */}
            <div 
              onClick={toggleCollapse}
              className="flex items-center gap-2 cursor-pointer truncate"
              title="Kliknutím rozbalíte / zrolujete"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-extrabold text-white text-xs tracking-wider uppercase whitespace-nowrap">
                  PRESET VISUALIZER
                </span>
              </div>

              {/* Collapsed Status Pill */}
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 hidden sm:inline">&middot;</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/80 truncate">
                  {currentPreset.name}
                </span>

                {/* Palette swatch in header */}
                <div className="hidden sm:flex items-center -space-x-1 shrink-0 ml-1">
                  {currentPreset.paletteColors.map((c, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/70 inline-block"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Audio pulse */}
                <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400 font-bold shrink-0 ml-1">
                  <Volume2 className="w-3 h-3" />
                  {Math.round(audioEnergy * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Layout Mode Toggles */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* If not collapsed, display view engine tabs */}
            {!isCollapsed && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setEngineView('preset')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    engineView === 'preset' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Náhľad vybraného WLED efektu (Canvas/SVG)"
                >
                  Efekt
                </button>
                <button
                  onClick={() => setEngineView('stage_2d')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    engineView === 'stage_2d' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="2D pódiový model a segmenty"
                >
                  2D Pódium
                </button>
                <button
                  onClick={() => setEngineView('split')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    engineView === 'split' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Split view (oba vizualizéry)"
                >
                  Split
                </button>
              </div>
            )}

            {/* Desktop mode toggles: Dock vs Float */}
            {!isMobile && (
              <div className="flex items-center gap-1">
                {isFloating ? (
                  <>
                    <button
                      onClick={handleResetPosition}
                      className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-[10px]"
                      title="Resetovať pozíciu do pravého horného rohu"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleSetLayoutMode('docked_inline')}
                      className="px-2 py-1 rounded bg-slate-950 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1 text-[10px]"
                      title="Ukotviť na stránku pod navigáciu"
                    >
                      <Pin className="w-3 h-3 text-amber-400" />
                      <span className="hidden xl:inline">Ukotviť</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSetLayoutMode('desktop_floating')}
                    className="px-2 py-1 rounded bg-slate-950 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1 text-[10px]"
                    title="Odopnúť do plávajúceho okna (Drag & Drop)"
                  >
                    <PinOff className="w-3 h-3 text-cyan-400" />
                    <span className="hidden xl:inline">Plávajúce okno</span>
                  </button>
                )}
              </div>
            )}

            {/* Main Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold flex items-center gap-1"
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Otvoriť</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Schovať</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* EXPANDABLE BODY CONTENT */}
        {!isCollapsed && (
          <div className="p-2 sm:p-3 bg-slate-950">
            {engineView === 'preset' && (
              <PresetVisualizer
                currentPreset={currentPreset}
                audioEnergy={audioEnergy}
                masterBrightness={masterBrightness}
                masterSpeed={masterSpeed}
              />
            )}

            {engineView === 'stage_2d' && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                <CeilingVisualizer
                  currentPreset={currentPreset}
                  onSelectPreset={onSelectPreset || (() => {})}
                  audioEnergy={audioEnergy}
                />
              </div>
            )}

            {engineView === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <PresetVisualizer
                  currentPreset={currentPreset}
                  audioEnergy={audioEnergy}
                  masterBrightness={masterBrightness}
                  masterSpeed={masterSpeed}
                />
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
                  <CeilingVisualizer
                    currentPreset={currentPreset}
                    onSelectPreset={onSelectPreset || (() => {})}
                    audioEnergy={audioEnergy}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Placeholder space reservation when in mobile sticky mode so page flow doesn't jump */}
      {isStickyMobile && !isCollapsed && (
        <div className="h-1" />
      )}
    </>
  );
};
