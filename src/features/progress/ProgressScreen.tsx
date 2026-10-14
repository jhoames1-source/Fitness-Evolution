import React, { useEffect, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { calculateWeeklyAdherence, WeeklyAdherenceReport } from '../../domain/tracking/adherence';
import type { WeightLogRecord, BodyMeasurementRecord } from '../../data/local/schema';

export const ProgressScreen: React.FC = () => {
  const { profile, goal, db } = useApp();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [weightLogs, setWeightLogs] = useState<WeightLogRecord[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurementRecord[]>([]);

  // Inputs para nuevo registro
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [readiness, setReadiness] = useState<'tired' | 'ok' | 'strong'>('ok');
  const [nightSweats, setNightSweats] = useState<0 | 1 | 2 | 3>(0);

  const [adherenceReport, setAdherenceReport] = useState<WeeklyAdherenceReport | null>(null);

  const loadData = async () => {
    if (!profile) return;
    const w = await db.weightLogs.toArray();
    const m = await db.bodyMeasurements.toArray();

    setWeightLogs(w.filter((x) => !x.deletedAt).sort((a, b) => b.date.localeCompare(a.date)));
    setMeasurements(m.filter((x) => !x.deletedAt).sort((a, b) => b.date.localeCompare(a.date)));

    // Calcular reporte de adherencia de la semana
    const rep = calculateWeeklyAdherence({
      weekStart: todayStr,
      completedWorkouts: 5,
      plannedWorkouts: profile.trainingDaysPerWeek || 6,
      daysMetCalorieGoal: 6,
      daysLoggedNutrition: 6,
      avgDailyWaterMl: 2600,
      targetWaterMl: 2800,
      avgDailySteps: 8400,
      targetDailySteps: profile.avgDailySteps || 8000,
      avgSleepHours: profile.avgSleepHours || 7.5,
    });
    setAdherenceReport(rep);
  };

  useEffect(() => {
    loadData();
  }, [profile, db]);

  const handleSaveWeight = async () => {
    if (!profile || !newWeight) return;
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;

    const now = new Date().toISOString();
    await db.weightLogs.put({
      id: crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      time: new Date().toTimeString().slice(0, 5),
      weightKg: val,
      note: 'Registro manual en ayunas',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });

    setNewWeight('');
    await loadData();
  };

  const handleSaveWaist = async () => {
    if (!profile || !newWaist) return;
    const val = parseFloat(newWaist);
    if (isNaN(val) || val <= 0) return;

    const now = new Date().toISOString();
    await db.bodyMeasurements.put({
      id: crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      waistCm: val,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });

    setNewWaist('');
    await loadData();
  };

  const handleSaveSymptoms = async () => {
    if (!profile) return;
    const now = new Date().toISOString();
    await db.symptomLogs.put({
      id: crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      readiness,
      nightSweats,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });
    await loadData();
  };

  const exportCsv = () => {
    let csv = 'Fecha,Tipo,Valor,Unidad\n';
    weightLogs.forEach((w) => {
      csv += `${w.date},Peso,${w.weightKg},kg\n`;
    });
    measurements.forEach((m) => {
      if (m.waistCm) csv += `${m.date},Cintura,${m.waistCm},cm\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-evolution-progreso-${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const latestWeight = weightLogs[0]?.weightKg ?? profile?.initialWeightKg ?? 78;
  const lostWeight = Math.max(0, (profile?.initialWeightKg ?? 78) - latestWeight);
  const remainingWeight = goal ? Math.max(0, latestWeight - goal.targetWeightKg) : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            SEGUIMIENTO Y MÉTRICAS
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Evolución de Progreso</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta: {goal?.targetWeightKg} kg al {goal?.targetDate}
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <span>📥</span> Exportar Datos (CSV)
        </button>
      </div>

      {/* 2. Tarjetas de Peso y Tendencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-[10px] text-slate-400 uppercase">Peso Actual</div>
          <div className="text-2xl font-bold text-white mt-1">{latestWeight} kg</div>
          <div className="text-[10px] text-slate-500">Inicial: {profile?.initialWeightKg} kg</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-[10px] text-emerald-400 uppercase font-bold">Peso Perdido</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">-{lostWeight.toFixed(1)} kg</div>
          <div className="text-[10px] text-slate-500">Ritmo saludable</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-[10px] text-slate-400 uppercase">Faltante</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{remainingWeight.toFixed(1)} kg</div>
          <div className="text-[10px] text-slate-500">Objetivo: {goal?.targetWeightKg} kg</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <div className="text-[10px] text-slate-400 uppercase">Adherencia Semanal</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{adherenceReport?.overallScorePct ?? 84}%</div>
          <div className="text-[10px] text-slate-500">5 pilares evaluados</div>
        </div>
      </div>

      {/* 3. Registro Rápido de Peso y Medidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Registro de Peso */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>⚖️</span> Registrar Peso Corporal
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="Ej. 77.5"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleSaveWeight}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Guardar Peso
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Consejo: Pésate 3 o 4 mañanas por semana en ayunas. El sistema utiliza el promedio semanal para filtrar variaciones naturales de agua y glucógeno.
          </p>
        </div>

        {/* Registro de Cintura */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📏</span> Registrar Circunferencia de Cintura
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              placeholder="Ej. 88.0"
              value={newWaist}
              onChange={(e) => setNewWaist(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleSaveWaist}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Guardar Cintura
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            La cintura a la altura del ombligo es el indicador más confiable de pérdida de grasa visceral, especialmente cuando el peso en báscula fluctúa.
          </p>
        </div>
      </div>

      {/* 4. Módulo de Recuperación y Síntomas (Regla 31) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🧘</span> Check-in Diario de Recuperación y Síntomas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo preventivo del estado de fatiga y salud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Energía y Disposición */}
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-2">
              Nivel de energía / disposición hoy:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReadiness('tired')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  readiness === 'tired'
                    ? 'bg-rose-950/40 border-rose-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-2xl">😫</div>
                <div className="text-[10px] mt-1 font-semibold">AGOTADO</div>
              </button>
              <button
                onClick={() => setReadiness('ok')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  readiness === 'ok'
                    ? 'bg-amber-950/40 border-amber-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-2xl">😐</div>
                <div className="text-[10px] mt-1 font-semibold">NORMAL</div>
              </button>
              <button
                onClick={() => setReadiness('strong')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  readiness === 'strong'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <div className="text-2xl">💪</div>
                <div className="text-[10px] mt-1 font-semibold">MÁQUINA</div>
              </button>
            </div>
          </div>

          {/* Sudoración nocturna / Síntomas atípicos */}
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-2">
              Episodios de sudoración nocturna anormal:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([0, 1, 2, 3] as (0 | 1 | 2 | 3)[]).map((val) => (
                <button
                  key={val}
                  onClick={() => setNightSweats(val)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    nightSweats === val
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {val === 0 ? 'Ninguno' : `${val} vez`}
                </button>
              ))}
            </div>
            {nightSweats > 0 && (
              <p className="text-[10px] text-amber-300 mt-2 bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
                Aviso preventivo: Si la sudoración nocturna es persistente o se acompaña de fiebre involuntaria, se recomienda consultar a un profesional sanitario.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveSymptoms}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
        >
          Guardar Estado de Recuperación
        </button>
      </div>

      {/* 5. Desglose de Adherencia Semanal (Regla 29) */}
      {adherenceReport && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white">Adherencia Semanal Global</h3>
              <p className="text-xs text-slate-400 mt-0.5">{adherenceReport.reflectionPrompt}</p>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {adherenceReport.overallScorePct}%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              adherenceReport.workout,
              adherenceReport.nutrition,
              adherenceReport.water,
              adherenceReport.steps,
              adherenceReport.sleep,
            ].map((p, idx) => {
              const names = ['Entrenamiento', 'Nutrición', 'Agua', 'Pasos', 'Sueño'];
              return (
                <div key={idx} className="bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-300">{names[idx]}</span>
                    <span className="font-bold text-emerald-400">{p.percentage}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2">
                    {p.actual} / {p.target} {p.unit}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug">{p.feedback}</div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-400">✨ {adherenceReport.keyWin}</div>
            <div className="text-slate-400">🎯 {adherenceReport.focusArea}</div>
          </div>
        </div>
      )}
    </div>
  );
};
