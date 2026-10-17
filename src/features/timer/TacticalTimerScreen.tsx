import React, { useState, useEffect, useRef } from 'react';

type TimerMode = 'interval' | 'countdown' | 'stopwatch';

export const TacticalTimerScreen: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('interval');

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq = 880, duration = 0.15, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not permitted or supported in background
    }
  };

  // ===================== MODO 1: INTERVAL / HIIT / TABATA =====================
  const [rounds, setRounds] = useState(8);
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);
  const [prepSec, setPrepSec] = useState(5);

  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'prep' | 'work' | 'rest' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(prepSec);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);

  useEffect(() => {
    let timer: number | null = null;
    if (isIntervalRunning && phase !== 'idle' && phase !== 'finished') {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(440, 0.08); // Pip preparatorio
          } else if (prev === 1) {
            playBeep(880, 0.3); // Pip de cambio de fase
          }

          if (prev <= 1) {
            // Cambio de fase
            if (phase === 'prep') {
              setPhase('work');
              return workSec;
            } else if (phase === 'work') {
              if (currentRound >= rounds) {
                setPhase('finished');
                setIsIntervalRunning(false);
                playBeep(1200, 0.6);
                return 0;
              } else {
                setPhase('rest');
                return restSec;
              }
            } else if (phase === 'rest') {
              setCurrentRound((r) => r + 1);
              setPhase('work');
              return workSec;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isIntervalRunning, phase, workSec, restSec, rounds, currentRound]);

  const startInterval = () => {
    setCurrentRound(1);
    setPhase('prep');
    setTimeLeft(prepSec);
    setIsIntervalRunning(true);
    playBeep(660, 0.2);
  };

  const pauseInterval = () => setIsIntervalRunning(false);
  const resumeInterval = () => setIsIntervalRunning(true);
  const resetInterval = () => {
    setIsIntervalRunning(false);
    setPhase('idle');
    setCurrentRound(1);
    setTimeLeft(prepSec);
  };

  // ===================== MODO 2: COUNTDOWN / DESCANSO ENTRE SERIES =====================
  const [countdownTarget, setCountdownTarget] = useState(60);
  const [countdownLeft, setCountdownLeft] = useState(60);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  useEffect(() => {
    let t: number | null = null;
    if (isCountdownRunning && countdownLeft > 0) {
      t = window.setInterval(() => {
        setCountdownLeft((prev) => {
          if (prev <= 4 && prev > 1) playBeep(500, 0.08);
          if (prev === 1) {
            playBeep(1000, 0.5);
            setIsCountdownRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [isCountdownRunning, countdownLeft]);

  const setAndStartCountdown = (seconds: number) => {
    setCountdownTarget(seconds);
    setCountdownLeft(seconds);
    setIsCountdownRunning(true);
    playBeep(700, 0.15);
  };

  // ===================== MODO 3: CRONÓMETRO CLÁSICO =====================
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    let frameId: number;
    if (isStopwatchRunning) {
      lastTimeRef.current = performance.now();
      const update = (now: number) => {
        const delta = now - lastTimeRef.current;
        lastTimeRef.current = now;
        setStopwatchMs((prev) => prev + delta);
        frameId = requestAnimationFrame(update);
      };
      frameId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isStopwatchRunning]);

  const formatStopwatch = (totalMs: number) => {
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Selector de modo estilo HUD Táctico */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
        <button
          onClick={() => setMode('interval')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
            mode === 'interval'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⚡ Interval / HIIT
        </button>
        <button
          onClick={() => setMode('countdown')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
            mode === 'countdown'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⏱️ Descanso Sets
        </button>
        <button
          onClick={() => setMode('stopwatch')}
          className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
            mode === 'stopwatch'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⏱ Cronómetro
        </button>
      </div>

      {/* ================= VISTA INTERVAL / TABATA ================= */}
      {mode === 'interval' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Banner de fase */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
            <span className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold">
              TABATA PROTOCOL // RONDA {currentRound} DE {rounds}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                phase === 'work'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : phase === 'rest'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : phase === 'prep'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {phase === 'prep' ? 'Preparación' : phase === 'work' ? '¡Trabajo!' : phase === 'rest' ? 'Descanso' : phase === 'finished' ? 'Misión Cumplida' : 'En Espera'}
            </span>
          </div>

          {/* Gran Display Numérico */}
          <div className="my-8">
            <div
              className={`font-mono text-7xl md:text-9xl font-black tracking-tight ${
                phase === 'work' ? 'text-emerald-400' : phase === 'rest' ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {timeLeft.toString().padStart(2, '0')}
            </div>
            <div className="text-xs tracking-widest text-slate-400 font-mono mt-2">SEGUNDOS RESTANTES</div>
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-3">
            {phase === 'idle' || phase === 'finished' ? (
              <button
                onClick={startInterval}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
              >
                ▶ Iniciar Protocolo
              </button>
            ) : isIntervalRunning ? (
              <button
                onClick={pauseInterval}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all uppercase"
              >
                ⏸ Pausar
              </button>
            ) : (
              <button
                onClick={resumeInterval}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all uppercase"
              >
                ▶ Reanudar
              </button>
            )}
            <button
              onClick={resetInterval}
              className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all"
            >
              Reiniciar
            </button>
          </div>

          {/* Configuración rápida de parámetros */}
          {phase === 'idle' && (
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Rondas</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRounds((r) => Math.max(1, r - 1))} className="px-2 py-0.5 bg-slate-800 rounded font-bold">-</button>
                  <span className="font-mono font-bold text-white text-sm">{rounds}</span>
                  <button onClick={() => setRounds((r) => r + 1)} className="px-2 py-0.5 bg-slate-800 rounded font-bold">+</button>
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Trabajo (s)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWorkSec((s) => Math.max(5, s - 5))} className="px-2 py-0.5 bg-slate-800 rounded font-bold">-</button>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{workSec}s</span>
                  <button onClick={() => setWorkSec((s) => s + 5)} className="px-2 py-0.5 bg-slate-800 rounded font-bold">+</button>
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Descanso (s)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRestSec((s) => Math.max(5, s - 5))} className="px-2 py-0.5 bg-slate-800 rounded font-bold">-</button>
                  <span className="font-mono font-bold text-amber-400 text-sm">{restSec}s</span>
                  <button onClick={() => setRestSec((s) => s + 5)} className="px-2 py-0.5 bg-slate-800 rounded font-bold">+</button>
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <label className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Prep (s)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPrepSec((s) => Math.max(0, s - 1))} className="px-2 py-0.5 bg-slate-800 rounded font-bold">-</button>
                  <span className="font-mono font-bold text-cyan-400 text-sm">{prepSec}s</span>
                  <button onClick={() => setPrepSec((s) => s + 1)} className="px-2 py-0.5 bg-slate-800 rounded font-bold">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VISTA COUNTDOWN / DESCANSO ENTRE SERIES ================= */}
      {mode === 'countdown' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold mb-4">
            TEMPORIZADOR DE RECUPERACIÓN MUSCULAR
          </div>

          <div className="my-8">
            <div className="font-mono text-8xl md:text-9xl font-black text-emerald-400 tracking-tight">
              {countdownLeft}s
            </div>
            <div className="text-xs text-slate-400 font-mono mt-2">
              OBJETIVO: {countdownTarget} SEGUNDOS
            </div>
          </div>

          {/* Presets directos de descanso */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[30, 60, 90, 120].map((sec) => (
              <button
                key={sec}
                onClick={() => setAndStartCountdown(sec)}
                className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  countdownTarget === sec && isCountdownRunning
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            {isCountdownRunning ? (
              <button
                onClick={() => setIsCountdownRunning(false)}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase"
              >
                Pausar
              </button>
            ) : (
              <button
                onClick={() => setIsCountdownRunning(true)}
                disabled={countdownLeft <= 0}
                className="px-6 py-3 bg-emerald-500 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl uppercase"
              >
                Iniciar
              </button>
            )}
            <button
              onClick={() => {
                setIsCountdownRunning(false);
                setCountdownLeft(countdownTarget);
              }}
              className="px-5 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* ================= VISTA CRONÓMETRO CLÁSICO ================= */}
      {mode === 'stopwatch' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="text-xs uppercase tracking-widest font-mono text-emerald-400 font-bold mb-4">
            CRONÓMETRO OPERATIVO
          </div>

          <div className="my-8">
            <div className="font-mono text-6xl md:text-8xl font-black text-slate-100 tracking-tight">
              {formatStopwatch(stopwatchMs)}
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {isStopwatchRunning ? (
              <button
                onClick={() => setIsStopwatchRunning(false)}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-xl uppercase"
              >
                Detener
              </button>
            ) : (
              <button
                onClick={() => setIsStopwatchRunning(true)}
                className="px-6 py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl uppercase"
              >
                Iniciar
              </button>
            )}
            <button
              onClick={() => {
                if (isStopwatchRunning) {
                  setLaps((prev) => [stopwatchMs, ...prev]);
                } else {
                  setStopwatchMs(0);
                  setLaps([]);
                }
              }}
              className="px-5 py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
            >
              {isStopwatchRunning ? 'Vuelta / Lap' : 'Reiniciar'}
            </button>
          </div>

          {laps.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-left border-t border-slate-800 pt-4">
              {laps.map((lapMs, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/60 px-4 py-2 rounded-lg text-xs font-mono">
                  <span className="text-slate-400">Vuelta #{laps.length - idx}</span>
                  <span className="text-emerald-400 font-bold">{formatStopwatch(lapMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
