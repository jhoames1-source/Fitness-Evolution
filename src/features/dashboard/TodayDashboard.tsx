import React, { useEffect, useState } from 'react';
import { useApp } from '../../app/AppContext';
import type { FoodLogRecord, WaterLogRecord, StepLogRecord } from '../../data/local/schema';
import { generateSmartAlerts } from '../../domain/alerts/engine';
import { waterTargetMl } from '../../domain/calc/energy';

export const TodayDashboard: React.FC = () => {
  const { profile, goal, db, setActiveTab, setIsMayaOpen } = useApp();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [waterLogs, setWaterLogs] = useState<WaterLogRecord[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLogRecord[]>([]);
  const [stepLog, setStepLog] = useState<StepLogRecord | null>(null);
  const [isAddingWater, setIsAddingWater] = useState(false);

  const loadDailyData = async () => {
    if (!profile) return;
    const w = await db.waterLogs.where('date').equals(todayStr).toArray();
    const f = await db.foodLogs.where('date').equals(todayStr).toArray();
    const s = await db.stepLogs.where('date').equals(todayStr).first();

    setWaterLogs(w.filter((x) => !x.deletedAt));
    setFoodLogs(f.filter((x) => !x.deletedAt));
    setStepLog(s && !s.deletedAt ? s : null);
  };

  useEffect(() => {
    loadDailyData();
  }, [profile, db]);

  const addWater = async (amountMl: number) => {
    if (!profile) return;
    setIsAddingWater(true);
    const now = new Date().toISOString();
    await db.waterLogs.put({
      id: crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      amountMl,
      at: now,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });
    await loadDailyData();
    setIsAddingWater(false);
  };

  const addSteps = async (amount: number) => {
    if (!profile) return;
    const now = new Date().toISOString();
    const currentSteps = stepLog?.steps ?? 0;
    const newSteps = currentSteps + amount;
    const km = parseFloat((newSteps * 0.00075).toFixed(2));

    await db.stepLogs.put({
      id: stepLog?.id || crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      steps: newSteps,
      distanceKm: km,
      source: 'manual',
      createdAt: stepLog?.createdAt || now,
      updatedAt: now,
      deletedAt: null,
      version: (stepLog?.version || 0) + 1,
    });
    await loadDailyData();
  };

  // Cálculos de consumo
  const totalWaterMl = waterLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const targetWater = profile ? waterTargetMl(profile.initialWeightKg, 60) : 2500;
  const waterPct = Math.min(100, Math.round((totalWaterMl / targetWater) * 100));

  const consumedCalories = foodLogs.reduce((acc, curr) => acc + curr.nutrients.kcal, 0);
  const consumedProtein = Math.round(foodLogs.reduce((acc, curr) => acc + curr.nutrients.proteinG, 0));
  const consumedCarbs = Math.round(foodLogs.reduce((acc, curr) => acc + curr.nutrients.carbsG, 0));
  const consumedFat = Math.round(foodLogs.reduce((acc, curr) => acc + curr.nutrients.fatG, 0));

  const targetCal = goal?.planCalories ?? 2000;
  const targetProtein = goal?.proteinG ?? 150;
  const calPct = Math.min(100, Math.round((consumedCalories / targetCal) * 100));
  const protPct = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));

  const stepsCount = stepLog?.steps ?? 0;
  const stepTarget = profile?.avgDailySteps ?? 8000;
  const stepPct = Math.min(100, Math.round((stepsCount / stepTarget) * 100));
  const targetKm = (stepTarget * 0.00075).toFixed(1);

  // Generar alertas
  const alerts = generateSmartAlerts({
    consecutiveTrainingDays: 2,
    daysWithoutFoodLog: foodLogs.length === 0 ? 1 : 0,
    calorieFloor: 1670,
    recentLoggedCalories: consumedCalories > 0 ? consumedCalories : undefined,
    consecutiveWeeksStalledWeight: 0,
    waistDecreasingWhileWeightStable: false,
    performanceDroppingWeeks: 0,
    hasNightSweatsNotice: false,
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Saludo y Encabezado */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 p-6 rounded-2xl border border-emerald-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              PANEL DIARIO • HOY
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              BUENOS DÍAS, {profile?.firstName?.toUpperCase() ?? 'ATLETA'}
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Objetivo en marcha: de {profile?.initialWeightKg} kg a {goal?.targetWeightKg} kg (Meta: {goal?.targetDate})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Peso Actual</div>
              <div className="text-lg font-bold text-white">{profile?.initialWeightKg} kg</div>
            </div>
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-4 py-2 text-center">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wide">Faltan</div>
              <div className="text-lg font-bold text-emerald-400">
                {goal ? (profile ? Math.max(0, profile.initialWeightKg - goal.targetWeightKg).toFixed(1) : '0') : '0'} kg
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Alertas Inteligentes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al) => (
            <div
              key={al.id}
              className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                al.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : al.type === 'celebration'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
              }`}
            >
              <span className="text-lg">
                {al.type === 'warning' ? '⚠️' : al.type === 'celebration' ? '🎉' : '💡'}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white">{al.title}</div>
                <div className="text-xs opacity-90 mt-0.5">{al.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Tarjetas Principales de Hoy: Calorías, Carbohidratos, Proteína, Agua, Pasos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Calorías */}
        <div className="bg-slate-900/90 border border-slate-800 p-4.5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Calorías</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {consumedCalories} <span className="text-[11px] font-normal text-slate-400">/ {targetCal} kcal</span>
              </div>
            </div>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-base">🥗</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${calPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
            <span>Déficit asignado</span>
            <span className="font-semibold text-emerald-400">{calPct}%</span>
          </div>
        </div>

        {/* Carbohidratos */}
        <div className="bg-slate-900/90 border border-amber-500/20 p-4.5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-semibold">Carbohidratos</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {consumedCarbs} <span className="text-[11px] font-normal text-slate-400">/ {goal?.carbsG ?? 0} g</span>
              </div>
            </div>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-base">🍞</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${goal ? Math.min(100, Math.round((consumedCarbs / (goal.carbsG || 1)) * 100)) : 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
            <span>Energía / Glucógeno</span>
            <span className="font-semibold text-amber-400">
              {goal ? Math.min(100, Math.round((consumedCarbs / (goal.carbsG || 1)) * 100)) : 0}%
            </span>
          </div>
        </div>

        {/* Proteína */}
        <div className="bg-slate-900/90 border border-cyan-500/20 p-4.5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[10px] text-cyan-400 uppercase font-semibold">Proteína</span>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">
                {consumedProtein} <span className="text-[11px] font-normal text-slate-400">/ {targetProtein} g</span>
              </div>
            </div>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-base">🍗</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${protPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
            <span>Grasas: {consumedFat}g</span>
            <span className="font-semibold text-cyan-400">{protPct}%</span>
          </div>
        </div>

        {/* Agua */}
        <div className="bg-slate-900/90 border border-blue-500/20 p-4.5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[10px] text-blue-400 uppercase font-semibold">Hidratación</span>
              <div className="text-lg font-bold text-blue-300 mt-0.5">
                {(totalWaterMl / 1000).toFixed(2)}{' '}
                <span className="text-[11px] font-normal text-slate-400">/ {(targetWater / 1000).toFixed(1)} L</span>
              </div>
            </div>
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-base">💧</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${waterPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              onClick={() => addWater(250)}
              disabled={isAddingWater}
              className="flex-1 py-1 px-1.5 text-[10px] font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg border border-blue-500/30 transition-colors"
            >
              +250ml
            </button>
            <button
              onClick={() => addWater(500)}
              disabled={isAddingWater}
              className="flex-1 py-1 px-1.5 text-[10px] font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg border border-blue-500/30 transition-colors"
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Pasos y Distancia en KM (Regla Caminata y Pasos Móvil) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4.5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Caminata & Pasos</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {stepsCount.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">pasos</span>
              </div>
              <div className="text-xs font-extrabold text-purple-400">
                {(stepsCount * 0.00075).toFixed(2)} km <span className="text-[10px] font-normal text-slate-400">/ {targetKm} km</span>
              </div>
            </div>
            <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-base">🚶</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stepPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
            <span>Meta: {stepTarget.toLocaleString()} pasos</span>
            <span className="font-semibold text-purple-400">{stepPct}%</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <button
              onClick={() => addSteps(1000)}
              className="flex-1 py-1 px-1.5 text-[10px] font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
            >
              +1,000 (~0.75km)
            </button>
            <button
              onClick={() => addSteps(3000)}
              className="flex-1 py-1 px-1.5 text-[10px] font-semibold bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg border border-purple-500/30 transition-colors"
            >
              +3,000 (~2.25km)
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bloque de Entrenamiento de Hoy */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-semibold text-emerald-400">Sesión Programada</div>
            <h3 className="text-xl font-bold text-white mt-0.5">Piernas A (Enfoque Cuádriceps)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Rutina American Line Optimizada • ~70 min</p>
          </div>
          <button
            onClick={() => setActiveTab('training')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            🏋️ Iniciar Entrenamiento
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">1. Ejercicio Principal</div>
            <div className="text-sm font-semibold text-white mt-0.5">Sentadillas Smith</div>
            <div className="text-xs text-slate-400">4 series • 8-12 reps (RIR 2)</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">2. Bisagra de Cadera</div>
            <div className="text-sm font-semibold text-white mt-0.5">Peso Muerto Rumano Manc.</div>
            <div className="text-xs text-slate-400">3 series • 8-10 reps (RIR 2)</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">3. Aislamiento</div>
            <div className="text-sm font-semibold text-white mt-0.5">Extensiones de Pierna</div>
            <div className="text-xs text-slate-400">3 series • 12-15 reps (RIR 1)</div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">4. Recuperación Activa</div>
            <div className="text-sm font-semibold text-white mt-0.5">Caminata Suave</div>
            <div className="text-xs text-slate-400">15 min • Zona 2 regenerativa</div>
          </div>
        </div>
      </div>

      {/* 5. Acciones Rápidas Tácticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setIsMayaOpen(true)}
          className="py-3 px-4 bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
        >
          <span>🤖</span> Consultar a Maya AI
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>⏱️</span> Temporizadores / HIIT
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>🥗</span> + Registrar Comida
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>⚖️</span> + Registrar Peso
        </button>
        <button
          onClick={() => setActiveTab('training')}
          className="py-3 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <span>🎖️</span> Desafío Calistenia
        </button>
      </div>
    </div>
  );
};
