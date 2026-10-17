import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Radio, Activity, Zap, Play, Square, Crown } from 'lucide-react';

interface AudioSyncPanelProps {
  onAudioEnergyUpdate: (energy: number) => void;
  onSilenceTriggered: () => void;
}

export const AudioSyncPanel: React.FC<AudioSyncPanelProps> = ({
  onAudioEnergyUpdate,
  onSilenceTriggered,
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSynthPlaying, setIsSynthPlaying] = useState(true);
  const [isBreakdown, setIsBreakdown] = useState(false);
  const [genreMode, setGenreMode] = useState<'disco' | 'concert' | 'fast'>('disco');
  const [squelch, setSquelch] = useState(10);
  const [gain, setGain] = useState(38);
  const [packetCount, setPacketCount] = useState(18420);
  const [latencyMs, setLatencyMs] = useState(22);
  const [bands, setBands] = useState<number[]>([20, 50, 95, 90, 45, 35, 25, 20, 15, 12, 14, 16, 20, 30, 25, 12]);
  const [micNotice, setMicNotice] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Synth rhythm loop based on selected genre mode in QUEENS (80-180 BPM)
  useEffect(() => {
    let synthInterval: any = null;
    let step = 0;

    const bpm = genreMode === 'disco' ? 128 : genreMode === 'concert' ? 112 : 145;
    const intervalMs = Math.round((60000 / bpm) / 4); // 16th notes

    if (isSynthPlaying && !isMicActive) {
      synthInterval = setInterval(() => {
        step = (step + 1) % 16;
        setPacketCount((p) => p + 1);

        if (isBreakdown) {
          const silenceBands = [4, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
          setBands(silenceBands);
          onAudioEnergyUpdate(0.05);
          return;
        }

        const isKick = step % 4 === 0;
        const isSnare = step % 8 === 4;
        const isHihat = step % 2 === 1;

        const energy = isKick ? 0.95 : isSnare ? 0.75 : isHihat ? 0.40 : 0.2;
        onAudioEnergyUpdate(energy);

        const newBands = Array.from({ length: 16 }, (_, i) => {
          if (i < 3) {
            // Sub/Bass for Kick
            return Math.min(100, Math.max(5, (isKick ? 95 : 25) + (Math.random() * 10 - 5)));
          } else if (i < 8) {
            // Mid for Vocals & Guitars
            return Math.min(100, Math.max(5, (isSnare ? 85 : 30) + (Math.random() * 15 - 7)));
          } else {
            // Highs for Hi-hats & Cymbals
            return Math.min(100, Math.max(5, (isHihat ? 75 : 15) + (Math.random() * 15 - 7)));
          }
        });
        setBands(newBands);

        // Latency simulation jitter (18-28ms)
        setLatencyMs(Math.round(18 + Math.random() * 7));
      }, intervalMs);
    }

    return () => {
      if (synthInterval) clearInterval(synthInterval);
    };
  }, [isSynthPlaying, isMicActive, isBreakdown, genreMode, onAudioEnergyUpdate]);

  // Real microphone handler
  const toggleMicrophone = async () => {
    if (isMicActive) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsMicActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      setIsMicActive(true);
      setIsSynthPlaying(false);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const processAudio = () => {
        analyser.getByteFrequencyData(dataArray);

        const newBands: number[] = [];
        let totalSum = 0;
        for (let i = 0; i < 16; i++) {
          const val = (dataArray[i] / 255) * 100 * (gain / 38);
          newBands.push(Math.min(100, val));
          totalSum += val;
        }

        const avgEnergy = totalSum / (16 * 100);
        const finalEnergy = avgEnergy < squelch / 100 ? 0 : avgEnergy;
        setBands(newBands);
        onAudioEnergyUpdate(finalEnergy);
        setPacketCount((p) => p + 1);

        animationFrameRef.current = requestAnimationFrame(processAudio);
      };

    } catch (err) {
      // Graceful fallback to built-in techno/disco audio engine when microphone is restricted in iframe
      setIsMicActive(false);
      setIsSynthPlaying(true);
      setMicNotice('Prístup k mikrofónu je v tomto prostredí obmedzený. Systém automaticky prepol na vstavaný QUEENS Disco & Live generátor zvuku.');
    }
  };

  const handleTestSilence = () => {
    setIsBreakdown(true);
    setTimeout(() => {
      onSilenceTriggered();
    }, 3600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono text-red-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-red-500" />
            Audio-Reaktivita · QUEENS Pub Púchov (80–180 BPM)
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            UDP Sound Sync Master (ESP32 #1 &rarr; Port 11988)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Master ESP32 #1 spracúva linkový zvuk z mixpultu a vysiela 16-pásmový FFT vektor na slave trubice ESP32 #2 a ESP32 #3 s latenciou pod 30 ms.
          </p>
        </div>

        {/* Source Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMicrophone}
            className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-all ${
              isMicActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            {isMicActive ? 'Vypnúť mikrofón' : 'Aktivovať reálny mikrofón / Line-In'}
          </button>
        </div>
      </div>

      {/* Graceful Microphone Notice Banner */}
      {micNotice && (
        <div className="bg-amber-950/50 border border-amber-800/80 rounded-lg p-3.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{micNotice}</span>
          </div>
          <button
            onClick={() => setMicNotice(null)}
            className="text-amber-400 hover:text-white font-mono text-[11px] underline ml-4 shrink-0"
          >
            Zavrieť
          </button>
        </div>
      )}

      {/* Main Grid: Telemetry & FFT Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Telemetry Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
            Stav UDP Sound Sync
          </span>

          {/* Genre mode selector */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
              Simulovaný žánrový režim:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <button
                onClick={() => { setGenreMode('concert'); setIsBreakdown(false); }}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  genreMode === 'concert'
                    ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Live (112)
              </button>
              <button
                onClick={() => { setGenreMode('disco'); setIsBreakdown(false); }}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  genreMode === 'disco'
                    ? 'border-red-500 bg-red-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Disco (128)
              </button>
              <button
                onClick={() => { setGenreMode('fast'); setIsBreakdown(false); }}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  genreMode === 'fast'
                    ? 'border-cyan-400 bg-cyan-400/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Peak (145)
              </button>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Protokol:</span>
              <span className="text-slate-200">WLED SoundSync v2</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Cieľový UDP Port:</span>
              <span className="text-red-400 font-bold">11988 (Broadcast)</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Pakety:</span>
              <span className="text-slate-200">{packetCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Nameraná latencia:</span>
              <span className="text-emerald-400 font-bold">{latencyMs} ms (&le; 80 ms KPI)</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Slave príjem:</span>
              <span className="text-amber-400 font-semibold">ESP32 #2 &amp; ESP32 #3 (SYNC OK)</span>
            </div>
          </div>

          {/* Squelch & Gain */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Squelch (Noise Floor):</span>
                <span className="text-slate-200 font-semibold">{squelch}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={squelch}
                onChange={(e) => setSquelch(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Gain (Citlivosť):</span>
                <span className="text-slate-200 font-semibold">{gain}</span>
              </div>
              <input
                type="range"
                min={10}
                max={80}
                value={gain}
                onChange={(e) => setGain(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Silence Simulator button */}
          <div className="pt-2">
            <button
              onClick={handleTestSilence}
              className={`w-full py-2 px-3 text-xs font-mono font-medium rounded border transition-colors ${
                isBreakdown
                  ? 'bg-red-950 text-red-200 border-red-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isBreakdown ? 'Ticho aktívne... (Decay po 3.5s)' : 'Simulovať Breakdown / Ticho (4s)'}
            </button>
            {isBreakdown && (
              <button
                onClick={() => setIsBreakdown(false)}
                className="w-full mt-2 py-1.5 text-xs font-mono text-red-400 hover:underline text-center block"
              >
                Obnoviť beat (DROP KICK)
              </button>
            )}
          </div>
        </div>

        {/* Right: 16-Band FFT Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-mono text-slate-400 font-semibold">
                16-Pásmové spektrum linkového zvuku z mixu
              </span>
              <span className="text-xs font-mono text-slate-500">
                Sub &middot; Bass &middot; Mid &middot; Treble (80–180 BPM)
              </span>
            </div>

            {/* Bars container */}
            <div className="h-64 bg-slate-950 rounded-lg p-4 border border-slate-800 flex items-end justify-between gap-1 sm:gap-2">
              {bands.map((val, idx) => {
                const isSub = idx < 3;
                const isMid = idx >= 3 && idx < 8;
                const barColor = isSub
                  ? 'bg-red-500'
                  : isMid
                  ? 'bg-amber-400'
                  : 'bg-white';

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
                      {Math.round(val)}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all duration-75 ${barColor}`}
                      style={{ height: `${Math.max(4, val)}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-500">
                      {idx < 6 ? `T${idx + 1}` : `B${idx + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Footer */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>
              <strong>Mapovanie na pódiu:</strong> Pásma T1–T6 riadia priamo 6 vertikálnych trubíc; stredové pásma synchronizujú korunu na matrixe.
            </span>
            <span className="text-red-400 font-mono">
              QUEENS UDP Latencia &le; 28 ms
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
