import React, { useState } from 'react';
import { useApp } from '../../app/AppContext';

export const PlanScreen: React.FC = () => {
  const { profile, goal, preferences } = useApp();

  // Estados para importación de rutina por imagen (Regla 48)
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrDetectedDays, setOcrDetectedDays] = useState<
    { title: string; exercises: string[] }[] | null
  >(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportedFile(file);
    setIsProcessingOcr(true);
    setSaveSuccess(false);

    // Simulación del motor OCR con pantalla de revisión obligatoria
    setTimeout(() => {
      setOcrDetectedDays([
        {
          title: 'Lunes - Piernas',
          exercises: [
            'Sentadilla Smith - 4x15',
            'Extensiones de piernas - 4x12',
            'Curl femoral sentado - 4x12',
            'Pantorrilla sentado - 5x20',
          ],
        },
        {
          title: 'Martes - Pecho y Bíceps',
          exercises: [
            'Pecho alto con mancuerna - 4x8-16',
            'Pecho declinado con mancuerna - 4x16',
            'Pecho plano con mancuerna - 4x8-16',
            'Curl de bíceps con mancuerna - 4x8-13',
          ],
        },
        {
          title: 'Miércoles - Espalda, Hombros y Tríceps',
          exercises: [
            'Jalón frontal y tras nuca - 4x16',
            'Remo con mancuerna / Serrucho - 4x16',
            'Vuelos laterales y frontales (super) - 3x13',
            'Jalón tríceps en polea - 3x15-13',
          ],
        },
      ]);
      setIsProcessingOcr(false);
    }, 1200);
  };

  const handleConfirmOcr = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setOcrDetectedDays(null);
      setImportedFile(null);
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
          PLANIFICACIÓN MAESTRA
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Tu Plan Personalizado</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Diseñado a partir de tu perfil antropométrico, actividad y objetivos.
        </p>
      </div>

      {/* 2. Tarjeta del Plan Personalizado (Regla 54) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs uppercase font-bold text-emerald-400">OBJETIVO PRINCIPAL</div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Pérdida de Grasa con Mantenimiento de Masa Magra
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Horizonte Temporal</span>
            <span className="text-sm font-bold text-white">
              {profile?.initialWeightKg} kg → {goal?.targetWeightKg} kg ({goal?.targetDate})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Calorías Objetivo</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{goal?.planCalories}</div>
            <div className="text-[10px] text-slate-500">Estimación fisiológica</div>
          </div>
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
            <div className="text-[10px] text-amber-400 uppercase font-bold">🍞 Carbohidratos</div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">{goal?.carbsG ?? 0} g</div>
            <div className="text-[10px] text-slate-400">Energía y glucógeno muscular</div>
          </div>
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl">
            <div className="text-[10px] text-cyan-400 uppercase font-bold">🥩 Proteínas</div>
            <div className="text-2xl font-extrabold text-cyan-300 mt-1">{goal?.proteinG ?? 0} g</div>
            <div className="text-[10px] text-slate-400">
              {profile && goal ? (goal.proteinG / profile.initialWeightKg).toFixed(1) : '2.0'} g/kg peso
            </div>
          </div>
          <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl">
            <div className="text-[10px] text-rose-400 uppercase font-bold">🥑 Grasas Saludables</div>
            <div className="text-2xl font-extrabold text-rose-300 mt-1">{goal?.fatG ?? 0} g</div>
            <div className="text-[10px] text-slate-400">Soporte hormonal óptimo</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">🌾 Fibra Diaria</span>
            <span className="text-lg font-bold text-emerald-400">{goal?.fiberG ?? 30} g</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">Frecuencia Entreno</span>
            <span className="text-lg font-bold text-amber-400">{profile?.trainingDaysPerWeek ?? 6} días/sem</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">⏰ Horario Preferido</span>
            <span className="text-xs font-bold text-cyan-300 block mt-1">
              {preferences?.trainingTime === 'dawn'
                ? '🌅 Madrugada (5-7 AM)'
                : preferences?.trainingTime === 'afternoon'
                ? '🌇 Tarde (3-6:30 PM)'
                : preferences?.trainingTime === 'night'
                ? '🌙 Noche (7-10 PM)'
                : '☀️ Mañana (8-11:30 AM)'}
            </span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block">Pasos Diarios (NEAT)</span>
            <span className="text-lg font-bold text-purple-400">{profile?.avgDailySteps ?? 8500}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <div className="font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>🛡️</span> Fundamentos Fisiológicos y Cronobiología:
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-extrabold uppercase">
              IA Sincronizada
            </span>
          </div>
          <p>
            • <strong>Preservación Muscular:</strong> En déficit energético, la alta ingesta de proteína ({goal?.proteinG ?? 156}g) sumada a estímulos de fuerza pesados (6-12 reps con RIR 1-3) envía la señal hormonal necesaria para no catabolizar masa muscular.
          </p>
          <p>
            • <strong>Sincronización Circadiana ({preferences?.trainingTime === 'dawn' ? 'Madrugada' : preferences?.trainingTime === 'afternoon' ? 'Tarde' : preferences?.trainingTime === 'night' ? 'Noche' : 'Mañana'}):</strong>{' '}
            {preferences?.trainingTime === 'dawn'
              ? 'La temperatura corporal central es menor. Exige calentamiento articular de 10-15 min antes de series pesadas para proteger articulaciones y espina dorsal.'
              : preferences?.trainingTime === 'afternoon'
              ? 'Punto culminante de temperatura corporal y síntesis de glucógeno. Máximo reclutamiento de unidades motoras para sobrecarga progresiva.'
              : preferences?.trainingTime === 'night'
              ? 'Excelente disponibilidad de combustible tras las comidas del día. Finaliza 2h antes de dormir y evita estimulantes para resguardar la hormona de crecimiento nocturna.'
              : 'Ventana metabólica matutina: excelente foco mental y digestión liviana para máxima concentración en el entrenamiento.'}
          </p>
          <p>
            • <strong>Cardio Estratégico:</strong> El exceso de cardio intenso puede interferir con la fuerza. Por ello se priorizan caminatas suaves y un único estímulo HIIT breve entre semana.
          </p>
        </div>
      </div>

      {/* 3. Módulo de Importación de Rutina por Imagen (Regla 11 y 48) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📷</span> Importar Rutina desde Imagen / Fotografía
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube la foto de tu tabla de gimnasio. El sistema detectará días, ejercicios y repeticiones para que los revises y edites antes de guardar.
          </p>
        </div>

        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-colors">
          <input
            type="file"
            accept="image/*"
            id="routine-upload"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label htmlFor="routine-upload" className="cursor-pointer space-y-2 block">
            <span className="text-3xl block">📋</span>
            <span className="text-sm font-semibold text-emerald-400 block">
              {importedFile ? importedFile.name : 'Haz clic para seleccionar o arrastra una imagen'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Formatos soportados: JPG, PNG, WEBP de pizarras o tablas impresas.
            </span>
          </label>
        </div>

        {isProcessingOcr && (
          <div className="p-4 bg-slate-800/80 rounded-xl text-center text-xs text-emerald-400 font-semibold animate-pulse">
            🔍 Analizando texto de la rutina, agrupando días y series...
          </div>
        )}

        {/* Pantalla de Revisión Obligatoria antes de guardar (Regla 48) */}
        {ocrDetectedDays && (
          <div className="p-5 bg-slate-850 rounded-2xl border border-emerald-500/30 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Revisión y Corrección de Datos Detectados
                </h4>
                <p className="text-[11px] text-slate-400">
                  Verifica que los ejercicios y series coincidan con tu imagen antes de confirmar.
                </p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                Paso de Verificación
              </span>
            </div>

            <div className="space-y-3">
              {ocrDetectedDays.map((day, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-emerald-400 mb-1">{day.title}</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {day.exercises.map((ex, eIdx) => (
                      <li key={eIdx}>{ex}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {saveSuccess ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs text-center font-bold rounded-xl">
                ✓ ¡Rutina verificada e incorporada a tu catálogo activo!
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmOcr}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  ✓ Confirmar e Importar como Rutina Activa
                </button>
                <button
                  onClick={() => setOcrDetectedDays(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
