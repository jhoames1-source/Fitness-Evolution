import React, { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { AMERICAN_LINE_ORIGINAL, AMERICAN_LINE_OPTIMIZED, AMERICAN_LINE_CHANGES } from '../../seed-content/routines/american-line';
import { MILITARY_CALISTHENICS_ROUTINE } from '../../seed-content/routines/military-calisthenics';
import { EXERCISES, getExercise } from '../../seed-content/exercises';
import { findAlternatives, SwapReason, SWAP_REASON_LABELS } from '../../domain/training/alternatives';
import type { RoutineDay, RoutineExercise } from '../../domain/training/routine';

export const TrainingScreen: React.FC = () => {
  const { profile, goal, preferences } = useApp();
  const [viewMode, setViewMode] = useState<'optimized' | 'original' | 'military' | 'comparison'>('optimized');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Estados para ejercicios alternativos
  const [activeSwapExercise, setActiveSwapExercise] = useState<RoutineExercise | null>(null);
  const [swapReason, setSwapReason] = useState<SwapReason>('machine_busy');
  const [replacedExercises, setReplacedExercises] = useState<Record<string, string>>({});

  // Estados para desplegar/colapsar ejercicios y agregar/eliminar series dinámicamente
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});
  const [customSetsCount, setCustomSetsCount] = useState<Record<string, number>>({});
  const [activeGuideExerciseId, setActiveGuideExerciseId] = useState<string | null>(null);

  // Estados para series completadas durante el entreno
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string; rir: string }>>({});

  const baseRoutine =
    viewMode === 'original'
      ? AMERICAN_LINE_ORIGINAL
      : viewMode === 'military'
      ? MILITARY_CALISTHENICS_ROUTINE
      : AMERICAN_LINE_OPTIMIZED;

  const userDays = profile?.trainingDaysPerWeek ?? 6;

  // Sincronización inteligente de días según el perfil del usuario (IA adaptativa)
  // Si es Calistenia Militar (Desafío 21), mostramos los 21 días completos operativos sin recortes.
  const activeDays: RoutineDay[] = React.useMemo(() => {
    if (viewMode === 'military') {
      return MILITARY_CALISTHENICS_ROUTINE.days;
    }

    const nonRestDays = baseRoutine.days.filter((d) => !d.isRest);
    const restDay = baseRoutine.days.find((d) => d.isRest) ?? {
      weekday: 7 as const,
      title: 'Descanso y Recuperación',
      focus: [],
      isRest: true,
      exercises: [],
    };

    if (userDays >= nonRestDays.length) {
      return baseRoutine.days;
    }

    // Tomar los primeros N días activos según la frecuencia seleccionada en su perfil
    const selectedDays = nonRestDays.slice(0, userDays).map((d, idx) => ({
      ...d,
      weekday: (idx + 1) as any,
    }));

    return [...selectedDays, { ...restDay, weekday: (userDays + 1) as any }];
  }, [baseRoutine, userDays, viewMode]);

  const currentDay: RoutineDay = (activeDays[selectedDayIdx] ?? activeDays[0])!;

  const toggleExerciseCollapse = (exId: string) => {
    setCollapsedExercises((prev) => ({ ...prev, [exId]: !prev[exId] }));
  };

  const handleAddSet = (exerciseKey: string, currentSets: number) => {
    const nextCount = (customSetsCount[exerciseKey] ?? currentSets) + 1;
    setCustomSetsCount((prev) => ({ ...prev, [exerciseKey]: nextCount }));
  };

  const handleRemoveSet = (exerciseKey: string, currentSets: number) => {
    const current = customSetsCount[exerciseKey] ?? currentSets;
    if (current <= 1) return;
    setCustomSetsCount((prev) => ({ ...prev, [exerciseKey]: current - 1 }));
  };

  const toggleSetComplete = (setKey: string) => {
    setCompletedSets((prev) => ({ ...prev, [setKey]: !prev[setKey] }));
  };

  const handleInputChange = (setKey: string, field: 'weight' | 'reps' | 'rir', val: string) => {
    setSetInputs((prev) => ({
      ...prev,
      [setKey]: {
        weight: prev[setKey]?.weight ?? '',
        reps: prev[setKey]?.reps ?? '',
        rir: prev[setKey]?.rir ?? '',
        [field]: val,
      },
    }));
  };

  // Abrir modal de sustitución
  const openSwapModal = (item: RoutineExercise) => {
    setActiveSwapExercise(item);
  };

  const applySwap = (originalId: string, newId: string) => {
    setReplacedExercises((prev) => ({ ...prev, [originalId]: newId }));
    setActiveSwapExercise(null);
  };

  const routineTitle =
    viewMode === 'military'
      ? 'Desafío Táctico Calistenia Militar'
      : viewMode === 'original'
      ? 'Plan Original (Imagen de Gimnasio)'
      : 'Plan American Line Optimizado';

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado y Selector de Vista */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              MÓDULO DE ENTRENAMIENTO • {profile?.firstName?.toUpperCase() ?? 'ATLETA'} ({profile?.initialWeightKg ?? 78} kg → {goal?.targetWeightKg ?? 70} kg)
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{routineTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Frecuencia configurada: {userDays} días por semana {userDays >= 6 ? '• Domingo descanso' : '• Días de descanso alternos'}
            </p>
          </div>

          <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('optimized')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'optimized'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ⭐ Optimizada
            </button>
            <button
              onClick={() => { setViewMode('military'); setSelectedDayIdx(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'military'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🪖 Calistenia Militar
            </button>
            <button
              onClick={() => { setViewMode('original'); setSelectedDayIdx(0); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'original'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📄 Original (Imagen)
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'comparison'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ⚖️ Comparativa
            </button>
          </div>
        </div>
      </div>

      {/* 2. Vista de Comparativa y Cambios (Regla 12) */}
      {viewMode === 'comparison' ? (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Análisis: Rutina Original vs. Optimizada</h2>
            <p className="text-xs text-slate-400 mt-1">
              Conservamos la estructura base de la imagen (Piernas / Pecho / Espalda) ajustando volumen y seguridad biomecánica.
            </p>
          </div>

          <div className="space-y-3">
            {AMERICAN_LINE_CHANGES.map((ch, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-850/60 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 md:items-start"
              >
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start">
                  {ch.category}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-semibold text-white">
                    {ch.before && <span className="text-slate-400 line-through mr-2">{ch.before}</span>}
                    <span className="text-emerald-400">→ {ch.after}</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">{ch.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Días de la Semana */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {activeDays.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  selectedDayIdx === idx
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="uppercase tracking-wider text-[10px]">
                  {viewMode === 'military' ? `Día ${idx + 1}` : `Día ${day.weekday}`}
                </div>
                <div className="font-semibold text-xs text-white mt-0.5 truncate max-w-[140px]">
                  {viewMode === 'military' ? day.title.replace(/^Día \d+:\s*/, '') : day.title}
                </div>
              </button>
            ))}
          </div>

          {/* Sesión del Día */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{currentDay.title}</h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-extrabold uppercase">
                    {preferences?.trainingTime === 'dawn'
                      ? '🌅 Madrugada (5:00-7:00 AM)'
                      : preferences?.trainingTime === 'afternoon'
                      ? '🌇 Tarde (3:00-6:30 PM)'
                      : preferences?.trainingTime === 'night'
                      ? '🌙 Noche (7:00-10:00 PM)'
                      : '☀️ Mañana (8:00-11:30 AM)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentDay.isRest
                    ? 'Día de descanso total o caminata regenerativa suave.'
                    : `${currentDay.exercises.length} ejercicios programados`}
                </p>
              </div>

              {/* Banner de Evaluación IA de Rendimiento */}
              <div className="text-xs text-right bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  ⚡ Dictamen IA de Rendimiento
                </span>
                <span className="text-slate-300 text-[11px]">
                  {preferences?.trainingTime === 'dawn'
                    ? 'Calienta 10-15 min: articulaciones rígidas al despertar.'
                    : preferences?.trainingTime === 'afternoon'
                    ? 'Fuerza en punto máximo: ideal para records de sobrecarga.'
                    : preferences?.trainingTime === 'night'
                    ? 'Evita cafeína tardía para proteger tu sueño y recuperación.'
                    : 'Ventana metabólica óptima: buena energía glucolítica.'}
                </span>
              </div>
            </div>

            {currentDay.isRest ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-4xl">🧘</span>
                <p className="mt-3 text-sm font-medium text-slate-300">Día de Recuperación y Crecimiento Muscular</p>
                <p className="text-xs text-slate-500 mt-1">Aprovecha para descansar, hidratarte y pasear a ritmo suave.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentDay.exercises.map((item, exIdx) => {
                  const effectiveId = replacedExercises[item.exerciseId] || item.exerciseId;
                  const ex = getExercise(effectiveId);
                  const isReplaced = effectiveId !== item.exerciseId;
                  const exKey = `${currentDay.weekday}-${ex.id}`;
                  const isCollapsed = collapsedExercises[exKey] === true;
                  const currentSetsTotal = customSetsCount[exKey] ?? item.sets;

                  return (
                    <div
                      key={exIdx}
                      className="bg-slate-850/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all shadow-md"
                    >
                      {/* Cabecera Desplegable del Ejercicio */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
                        <div
                          onClick={() => toggleExerciseCollapse(exKey)}
                          className="flex items-center gap-3 cursor-pointer select-none flex-1"
                        >
                          <button
                            type="button"
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-transform"
                          >
                            {isCollapsed ? '▶' : '▼'}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-400">#{exIdx + 1}</span>
                              <h4 className="text-base font-bold text-white hover:text-emerald-300 transition-colors">
                                {ex.name}
                              </h4>
                              {isReplaced && (
                                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                                  Sustituido
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {currentSetsTotal} series • {item.reps[0]}-{item.reps[1]} reps • RIR {item.rir ? `${item.rir[0]}-${item.rir[1]}` : '2'} • Descanso {item.restSec ?? ex.restSec}s
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción: Ver Técnica / Video y Máquina Ocupada */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setActiveGuideExerciseId(ex.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1.5 transition-colors"
                            title="Ver técnica, video e indicaciones"
                          >
                            <span>🎬</span> Guía / Técnica
                          </button>

                          <button
                            onClick={() => openSwapModal(item)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <span>🔄</span> Alternativas
                          </button>
                        </div>
                      </div>

                      {/* Contenido Desplegable: Series y Controles de Progresión */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-3 border-t border-slate-800/80">
                          {/* Barra de control para Agregar / Eliminar Series */}
                          <div className="flex justify-between items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs">
                            <span className="text-slate-400 font-medium">
                              Series activas: <strong className="text-white">{currentSetsTotal}</strong> (Ajusta según sobrecarga progresiva o aumento de peso)
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRemoveSet(exKey, item.sets)}
                                disabled={currentSetsTotal <= 1}
                                className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-colors ${
                                  currentSetsTotal <= 1
                                    ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                    : 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                                }`}
                                title="Eliminar una serie si aumentaste peso y requieres menos volumen"
                              >
                                ➖ Quitar Serie
                              </button>
                              <button
                                onClick={() => handleAddSet(exKey, item.sets)}
                                className="px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-700 hover:bg-emerald-900/60 transition-colors"
                                title="Agregar una serie para progresar en volumen"
                              >
                                ➕ Añadir Serie
                              </button>
                            </div>
                          </div>

                          {/* Listado de Series */}
                          <div className="space-y-2">
                            {Array.from({ length: currentSetsTotal }).map((_, sIdx) => {
                              const setKey = `${currentDay.weekday}-${ex.id}-${sIdx}`;
                              const isDone = completedSets[setKey];
                              const input = setInputs[setKey] || { weight: '', reps: '', rir: '' };

                              return (
                                <div
                                  key={sIdx}
                                  className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                                    isDone ? 'bg-emerald-950/30 border border-emerald-500/30' : 'bg-slate-800/40 border border-slate-800'
                                  }`}
                                >
                                  <span className="w-14 font-bold text-slate-300">Serie {sIdx + 1}</span>

                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="number"
                                      step="0.5"
                                      placeholder="kg"
                                      value={input.weight}
                                      onChange={(e) => handleInputChange(setKey, 'weight', e.target.value)}
                                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-bold"
                                    />
                                    <span className="text-slate-500 font-semibold">kg</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="number"
                                      placeholder="reps"
                                      value={input.reps}
                                      onChange={(e) => handleInputChange(setKey, 'reps', e.target.value)}
                                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-bold"
                                    />
                                    <span className="text-slate-500 font-semibold">reps</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="number"
                                      placeholder="RIR"
                                      value={input.rir}
                                      onChange={(e) => handleInputChange(setKey, 'rir', e.target.value)}
                                      className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-bold"
                                    />
                                    <span className="text-slate-500 font-semibold">RIR</span>
                                  </div>

                                  <button
                                    onClick={() => toggleSetComplete(setKey)}
                                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
                                      isDone
                                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                    }`}
                                  >
                                    {isDone ? '✓ Hecha' : 'Completar'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* 3. Modal de Sustitución de Ejercicios (Regla 13: MÁQUINA OCUPADA, DOLOR, etc.) */}
      {activeSwapExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Sustituir Ejercicio</h3>
                <p className="text-xs text-slate-400">
                  Ejercicio actual: <span className="text-white font-medium">{getExercise(activeSwapExercise.exerciseId).name}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveSwapExercise(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Motivo de cambio */}
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-2">
                ¿Por qué necesitas una alternativa?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['machine_busy', 'dumbbells_busy', 'barbell_busy', 'cable_busy', 'pain', 'no_equipment'] as SwapReason[]).map(
                  (reason) => (
                    <button
                      key={reason}
                      onClick={() => setSwapReason(reason)}
                      className={`p-2 rounded-lg border text-xs text-left font-medium transition-colors ${
                        swapReason === reason
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {SWAP_REASON_LABELS[reason]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Alternativas calculadas por el motor biomecánico */}
            <div className="space-y-3 pt-2">
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Opciones compatibles (mismo patrón biomecánico):
              </span>

              {findAlternatives(
                getExercise(activeSwapExercise.exerciseId),
                swapReason,
                EXERCISES,
                { availableEquipment: preferences?.equipment }
              ).suggestions.map((sug) => (
                <div
                  key={sug.exercise.id}
                  className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-sm text-white">{sug.exercise.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {sug.reasons.join(' • ')}
                    </div>
                  </div>
                  <button
                    onClick={() => applySwap(activeSwapExercise.exerciseId, sug.exercise.id)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Elegir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de Guía Técnica e Indicaciones con Video Demostrativo */}
      {activeGuideExerciseId && (() => {
        const guideEx = getExercise(activeGuideExerciseId);
        const videoSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(guideEx.name + ' tecnica correcta ejecucion')}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    INDICACIONES Y GUÍA BIOMECÁNICA
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{guideEx.name}</h3>
                </div>
                <button
                  onClick={() => setActiveGuideExerciseId(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Botón de Video Demostrativo */}
              <div className="p-3.5 bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">▶️</span>
                  <div>
                    <div className="text-xs font-bold text-white">Video Demostrativo del Ejercicio</div>
                    <div className="text-[10px] text-slate-400">Aprende la trayectoria y postura correcta en video</div>
                  </div>
                </div>
                <a
                  href={videoSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 shadow flex items-center gap-1"
                >
                  <span>Ver Video</span> ↗
                </a>
              </div>

              {/* Parámetros clave */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">Descanso</span>
                  <span className="font-bold text-white">{guideEx.restSec}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Rango Reps</span>
                  <span className="font-bold text-emerald-400">{guideEx.reps[0]}-{guideEx.reps[1]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Esfuerzo RIR</span>
                  <span className="font-bold text-amber-400">{guideEx.rir[0]}-{guideEx.rir[1]}</span>
                </div>
              </div>

              {/* Técnica Correcta */}
              {guideEx.technique.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✓</span> Técnica e Indicaciones Paso a Paso
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    {guideEx.technique.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errores Comunes */}
              {guideEx.commonErrors.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠️</span> Errores Frecuentes a Evitar
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    {guideEx.commonErrors.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span className="leading-relaxed">{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setActiveGuideExerciseId(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Cerrar e Iniciar Serie
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
