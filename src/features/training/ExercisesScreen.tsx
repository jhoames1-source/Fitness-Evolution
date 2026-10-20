import React, { useState } from 'react';
import { EXERCISES } from '../../seed-content/exercises';
import { SUPPLEMENTS, Supplement } from '../../seed-content/supplements';
import { MUSCLE_LABELS, EQUIPMENT_LABELS, MuscleGroup, Equipment } from '../../domain/training/types';
import type { Exercise } from '../../domain/training/types';

type CatalogTab = 'machines' | 'calisthenics' | 'dumbbells' | 'kettlebell' | 'bands' | 'supplements' | 'all';

export const ExercisesScreen: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogTab>('machines');
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all');
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<Exercise | null>(null);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);

  // Filtrado de suplementos
  const filteredSupplements = SUPPLEMENTS.filter((sup) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sup.name.toLowerCase().includes(q) ||
      sup.scientificSummary.toLowerCase().includes(q) ||
      sup.benefits.some((b) => b.toLowerCase().includes(q))
    );
  });

  // Filtrado según el apartado activo
  const filteredExercises = EXERCISES.filter((ex) => {
    // 1. Filtro de apartado:
    if (activeCatalog === 'machines') {
      const hasMachine = ex.equipment.some((eq) =>
        ['machine', 'cable', 'smith', 'cardio_machine'].includes(eq)
      );
      if (!hasMachine) return false;
    } else if (activeCatalog === 'calisthenics') {
      const isBodyweight = ex.equipment.every((eq) =>
        ['bodyweight', 'pullup_bar', 'bench', 'band'].includes(eq)
      );
      if (!isBodyweight) return false;
    } else if (activeCatalog === 'dumbbells') {
      const isFreeWeight = ex.equipment.some((eq) =>
        ['dumbbell', 'barbell', 'ez_bar'].includes(eq)
      );
      if (!isFreeWeight) return false;
    } else if (activeCatalog === 'kettlebell') {
      if (!ex.equipment.includes('kettlebell')) return false;
    } else if (activeCatalog === 'bands') {
      if (!ex.equipment.includes('band')) return false;
    }

    // 2. Filtro por grupo muscular:
    if (selectedMuscle !== 'all' && ex.primary !== selectedMuscle) {
      return false;
    }

    // 3. Filtro por buscador:
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = ex.name.toLowerCase().includes(q);
      const matchMuscle = MUSCLE_LABELS[ex.primary]?.toLowerCase().includes(q);
      if (!matchName && !matchMuscle) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
          BIBLIOTECA TÉCNICA DE EJERCICIOS
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Explorador de Ejercicios y Técnica</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Consulta la técnica correcta, errores comunes y biomecánica tanto para máquinas de gimnasio como para calistenia militar sin equipamiento.
        </p>

        {/* Pestañas de categoría de ejercicios y suplementación */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => setActiveCatalog('machines')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'machines'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>🏋️‍♂️</span>
            <span>Máquinas & Poleas</span>
          </button>

          <button
            onClick={() => setActiveCatalog('calisthenics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'calisthenics'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>🪖</span>
            <span>Calistenia Militar (21 Días)</span>
          </button>

          <button
            onClick={() => setActiveCatalog('dumbbells')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'dumbbells'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>⚡</span>
            <span>Mancuernas & Barras</span>
          </button>

          <button
            onClick={() => setActiveCatalog('kettlebell')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'kettlebell'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>🔔</span>
            <span>Kettlebells / Rusas</span>
          </button>

          <button
            onClick={() => setActiveCatalog('bands')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'bands'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>🎗️</span>
            <span>Bandas & Elásticos</span>
          </button>

          <button
            onClick={() => setActiveCatalog('supplements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'supplements'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>💊</span>
            <span>Suplementos A-Z ({SUPPLEMENTS.length})</span>
          </button>

          <button
            onClick={() => setActiveCatalog('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCatalog === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <span>📚</span>
            <span>Todos ({EXERCISES.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Filtros y Búsqueda (solo si no estamos en suplementos) */}
      {activeCatalog !== 'supplements' ? (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Selector de Grupo Muscular */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedMuscle('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedMuscle === 'all'
                  ? 'bg-slate-700 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            {(['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'abs', 'calves'] as MuscleGroup[]).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedMuscle === m
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {MUSCLE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar suplemento (creatina, whey, bcaa...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Mostrando {filteredSupplements.length} suplementos validados científicamente
          </div>
        </div>
      )}

      {/* 3. Renderizado: Suplementos vs Ejercicios */}
      {activeCatalog === 'supplements' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSupplements.map((sup) => (
            <div
              key={sup.id}
              onClick={() => setSelectedSupplement(sup)}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {sup.evidenceLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">
                    {sup.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{sup.name}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {sup.scientificSummary}
                </p>

                <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div>
                    <span className="text-slate-500 font-mono">DOSIS: </span>
                    <span className="text-emerald-300 font-medium">{sup.dosage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono">TIMING: </span>
                    <span className="text-cyan-300 font-medium">{sup.timing}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>{sup.benefits.length} beneficios clínicos</span>
                <span className="text-emerald-400 font-semibold hover:underline">Ver ficha técnica →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedDetailExercise(ex)}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {MUSCLE_LABELS[ex.primary]}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {ex.level === 'beginner' ? 'Principiante' : ex.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">{ex.name}</h3>

                <div className="flex flex-wrap gap-1 mt-2">
                  {ex.equipment.map((eq: Equipment) => (
                    <span key={eq} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-750">
                      {EQUIPMENT_LABELS[eq] || eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>{ex.sets[0]}-{ex.sets[1]} series • {ex.reps[0]}-{ex.reps[1]} reps</span>
                <span className="text-emerald-400 font-semibold hover:underline">Ver técnica →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeCatalog !== 'supplements' && filteredExercises.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-sm">No se encontraron ejercicios con los filtros seleccionados.</p>
        </div>
      )}

      {/* Modal de Suplemento */}
      {selectedSupplement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {selectedSupplement.evidenceLevel} • {selectedSupplement.category.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedSupplement.name}</h2>
              </div>
              <button
                onClick={() => setSelectedSupplement(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
              <span className="font-bold text-white block mb-1">Mecanismo Científico:</span>
              {selectedSupplement.scientificSummary}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Dosis Recomendada</span>
                <span className="text-emerald-300 font-semibold">{selectedSupplement.dosage}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Momento de Toma</span>
                <span className="text-cyan-300 font-semibold">{selectedSupplement.timing}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Beneficios Clínicos Clave:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedSupplement.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedSupplement.precautions && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <span className="font-bold block mb-0.5">⚠️ Precaución:</span>
                {selectedSupplement.precautions}
              </div>
            )}

            <button
              onClick={() => setSelectedSupplement(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* 4. Modal Detallado de Técnica y Errores */}
      {selectedDetailExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {MUSCLE_LABELS[selectedDetailExercise.primary]}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedDetailExercise.name}</h2>
              </div>
              <button
                onClick={() => setSelectedDetailExercise(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Botón y Video Demostrativo */}
            <div className="p-3.5 bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">▶️</span>
                <div>
                  <div className="text-xs font-bold text-white">Video Demostrativo del Ejercicio</div>
                  <div className="text-[10px] text-slate-400">Guía visual de postura, agarre y recorrido articular</div>
                </div>
              </div>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedDetailExercise.name + ' tecnica biomecanica correcta')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 shadow flex items-center gap-1"
              >
                <span>Ver Video</span> ↗
              </a>
            </div>

            {/* Equipamiento y Parámetros */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Equipamiento:</span>
                <span className="font-semibold text-slate-200">
                  {selectedDetailExercise.equipment.map((q) => EQUIPMENT_LABELS[q] || q).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Descanso sugerido:</span>
                <span className="font-semibold text-slate-200">{selectedDetailExercise.restSec} segundos</span>
              </div>
            </div>

            {/* Técnica */}
            {selectedDetailExercise.technique.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✓</span> Técnica Correcta
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {selectedDetailExercise.technique.map((t, idx) => (
                    <li key={idx} className="leading-relaxed">{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Errores comunes */}
            {selectedDetailExercise.commonErrors.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> Errores Frecuentes a Evitar
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                  {selectedDetailExercise.commonErrors.map((err, idx) => (
                    <li key={idx} className="leading-relaxed">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedDetailExercise(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
