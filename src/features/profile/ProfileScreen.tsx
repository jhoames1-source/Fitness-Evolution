import React, { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { DEMO_USERS } from '../../seed-content/demo-users';
import { bmi, bmr, tdee } from '../../domain/calc/energy';
import { evaluateGoal, GoalEvaluation } from '../../domain/goals/feasibility';
import { PrimaryGoal, Sex, ExperienceLevel } from '../../domain/types';

export const ProfileScreen: React.FC = () => {
  const { profile, goal, preferences, db, activeUserId, setActiveUserId, theme, toggleTheme, refreshData } = useApp();

  // Estados para modal de editar/crear perfil con evaluación
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || 'Atleta');
  const [editLastName, setEditLastName] = useState(profile?.lastName || 'Evolution');
  const [editSex, setEditSex] = useState<Sex>(profile?.sex || 'male');
  const [editBirthDate, setEditBirthDate] = useState(profile?.birthDate || '1988-06-15');
  const [editHeightCm, setEditHeightCm] = useState(profile?.heightCm?.toString() || '172');
  const [editWeightKg, setEditWeightKg] = useState(profile?.initialWeightKg?.toString() || '78');
  const [editTargetWeightKg, setEditTargetWeightKg] = useState(goal?.targetWeightKg?.toString() || '70');
  const [editTargetDate, setEditTargetDate] = useState(goal?.targetDate || '2026-12-31');
  const [editGoal, setEditGoal] = useState<PrimaryGoal>(goal?.primary || 'lose_weight');
  const [editLevel, setEditLevel] = useState<ExperienceLevel>(profile?.level || 'intermediate');
  const [editDaysPerWeek, setEditDaysPerWeek] = useState<number>(profile?.trainingDaysPerWeek || 6);
  const [editTrainingTime, setEditTrainingTime] = useState<'dawn' | 'morning' | 'afternoon' | 'night'>(
    (preferences?.trainingTime as any) || 'morning'
  );

  const [evaluationPreview, setEvaluationPreview] = useState<GoalEvaluation | null>(null);

  // Sincronizar formulario cada vez que se abre el modal o cambia el perfil activo
  const openEditModal = () => {
    if (profile) {
      setEditFirstName(profile.firstName);
      setEditLastName(profile.lastName);
      setEditSex(profile.sex);
      setEditBirthDate(profile.birthDate);
      setEditHeightCm(profile.heightCm.toString());
      setEditWeightKg(profile.initialWeightKg.toString());
      setEditLevel(profile.level);
      setEditDaysPerWeek(profile.trainingDaysPerWeek);
    }
    if (goal) {
      setEditTargetWeightKg(goal.targetWeightKg.toString());
      setEditTargetDate(goal.targetDate);
      setEditGoal(goal.primary);
    }
    if (preferences) {
      setEditTrainingTime((preferences.trainingTime as any) || 'morning');
    }
    setIsEditModalOpen(true);
    // Ejecutar cálculo previo con los datos sincronizados
    const w = profile?.initialWeightKg ?? 78;
    const tw = goal?.targetWeightKg ?? 70;
    const h = profile?.heightCm ?? 172;
    const res = evaluateGoal({
      body: {
        sex: profile?.sex ?? 'male',
        birthDate: profile?.birthDate ?? '1988-06-15',
        heightCm: h,
        weightKg: w,
      },
      activity: {
        dailyActivity: profile?.dailyActivity ?? 'moderate',
        trainingDaysPerWeek: (profile?.trainingDaysPerWeek as any) ?? 6,
        sessionMinutes: 75,
      },
      level: profile?.level ?? 'intermediate',
      goal: goal?.primary ?? 'lose_weight',
      targetWeightKg: tw,
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: goal?.targetDate ?? '2026-12-31',
    });
    setEvaluationPreview(res);
  };

  // Métricas metabólicas del perfil activo
  const currentBmi = profile ? bmi(profile.initialWeightKg, profile.heightCm) : null;
  const currentBmr = profile
    ? bmr(
        {
          sex: profile.sex,
          birthDate: profile.birthDate,
          heightCm: profile.heightCm,
          weightKg: profile.initialWeightKg,
        },
        profile.bmrMethod
      )
    : 1670;

  const currentTdee = profile
    ? tdee(currentBmr, {
        dailyActivity: profile.dailyActivity,
        trainingDaysPerWeek: profile.trainingDaysPerWeek,
        sessionMinutes: 75,
      })
    : 2600;

  // Evaluar razonamiento biométrico antes de guardar
  const handleCalculateFeasibility = () => {
    const w = parseFloat(editWeightKg) || 78;
    const tw = parseFloat(editTargetWeightKg) || 70;
    const h = parseFloat(editHeightCm) || 172;

    const result = evaluateGoal({
      body: {
        sex: editSex,
        birthDate: editBirthDate,
        heightCm: h,
        weightKg: w,
      },
      activity: {
        dailyActivity: 'moderate',
        trainingDaysPerWeek: (editDaysPerWeek as any) || 6,
        sessionMinutes: 75,
      },
      level: editLevel,
      goal: editGoal,
      targetWeightKg: tw,
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: editTargetDate,
    });

    setEvaluationPreview(result);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    const now = new Date().toISOString();
    const w = parseFloat(editWeightKg) || 78;
    const tw = parseFloat(editTargetWeightKg) || 70;
    const h = parseFloat(editHeightCm) || 172;

    // Actualizar perfil
    await db.profiles.update(profile.id, {
      firstName: editFirstName,
      lastName: editLastName,
      sex: editSex,
      birthDate: editBirthDate,
      heightCm: h,
      initialWeightKg: w,
      level: editLevel,
      trainingDaysPerWeek: (editDaysPerWeek as any) || 6,
      updatedAt: now,
    });

    // Evaluar y guardar meta calculada
    const evalRes = evaluateGoal({
      body: { sex: editSex, birthDate: editBirthDate, heightCm: h, weightKg: w },
      activity: { dailyActivity: 'moderate', trainingDaysPerWeek: (editDaysPerWeek as any) || 6, sessionMinutes: 75 },
      level: editLevel,
      goal: editGoal,
      targetWeightKg: tw,
      startDate: now.slice(0, 10),
      targetDate: editTargetDate,
    });

    if (goal) {
      await db.goals.update(goal.id, {
        primary: editGoal,
        startWeightKg: w,
        targetWeightKg: tw,
        targetDate: editTargetDate,
        feasibility: evalRes.status,
        planCalories: evalRes.planCalories,
        proteinG: evalRes.macros.proteinG,
        fatG: evalRes.macros.fatG,
        carbsG: evalRes.macros.carbsG,
        fiberG: evalRes.macros.fiberG,
        updatedAt: now,
      });
    }

    if (preferences) {
      await db.preferences.update(preferences.id, {
        trainingTime: editTrainingTime,
        updatedAt: now,
      });
    }

    await refreshData();
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            CONFIGURACIÓN Y MULTIUSUARIO
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Perfil y Evaluación Biométrica</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza tus datos de peso, talla y objetivo para calibrar el motor de razonamiento fisiológico.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openEditModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <span>✏️</span> Editar / Evaluar Perfil
          </button>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
        </div>
      </div>

      {/* 2. Conmutador Multiusuario */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>👥</span> Selector de Usuario (Aislamiento de Cuentas)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada usuario cuenta con su propia base de datos local e historial independiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_USERS.map((u) => {
            const isSelected = activeUserId === u.id;
            // Para el usuario actualmente activo, mostrar los datos en vivo de Dexie
            const displayName = isSelected && profile ? `${profile.firstName} ${profile.lastName}` : `${u.firstName} ${u.lastName}`;
            const displayWeight = isSelected && profile ? profile.initialWeightKg : u.initialWeightKg;
            const displayTargetWeight = isSelected && goal ? goal.targetWeightKg : u.targetWeightKg;
            const displayGoal = isSelected && goal ? goal.primary : u.primaryGoal;
            const displayDays = isSelected && profile ? profile.trainingDaysPerWeek : u.trainingDaysPerWeek;
            const displayHeight = isSelected && profile ? profile.heightCm : u.heightCm;

            return (
              <button
                key={u.id}
                onClick={() => setActiveUserId(u.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-white">{displayName}</span>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                      ACTIVO
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300">
                  {displayGoal === 'lose_weight'
                    ? `🎯 Pérdida de Peso (${displayWeight}→${displayTargetWeight} kg)`
                    : displayGoal === 'gain_muscle'
                    ? `💪 Ganancia Muscular (${displayWeight}→${displayTargetWeight} kg)`
                    : `⚖️ Mantenimiento (${displayWeight} kg)`}
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  {u.sex === 'male' ? 'Hombre' : 'Mujer'} • {displayHeight} cm • {displayDays} días entreno
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Datos Biométricos del Perfil Activo */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📊</span> Métricas Metabólicas y Razonamiento Fisiológico
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">Estatura</div>
            <div className="text-xl font-bold text-white mt-1">{profile?.heightCm} cm</div>
            <div className="text-[10px] text-slate-500">{(Number(profile?.heightCm || 172) / 100).toFixed(2)} m</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">IMC Actual</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{currentBmi?.value}</div>
            <div className="text-[10px] text-slate-500">
              {currentBmi?.value && currentBmi.value >= 25 ? 'Sobrepeso leve' : 'Rango normal'}
            </div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">TMB (Metabolismo Basal)</div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{currentBmr} kcal</div>
            <div className="text-[10px] text-slate-500">Mifflin-St Jeor</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase">GET (Gasto Energético Total)</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{currentTdee} kcal</div>
            <div className="text-[10px] text-slate-500">{profile?.trainingDaysPerWeek} días/sem</div>
          </div>
        </div>

        {/* Desglose de Macronutrientes Clave Requeridos (Carbohidratos, Proteína, Grasas, Fibra) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-inner space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
              MACRONUTRIENTES OBJETIVO DIARIOS CALCULADOS
            </span>
            <span className="text-xs font-bold text-slate-400">
              Calorías: <span className="text-emerald-400 text-sm font-extrabold">{goal?.planCalories} kcal</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Carbohidratos */}
            <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-amber-400 uppercase font-bold">🍞 Carbohidratos</div>
              <div className="text-2xl font-black text-amber-300 mt-0.5">{goal?.carbsG ?? 0} g</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {goal ? Math.round(((goal.carbsG * 4) / goal.planCalories) * 100) : 0}% de calorías
              </div>
            </div>

            {/* Proteínas */}
            <div className="bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-cyan-400 uppercase font-bold">🥩 Proteínas</div>
              <div className="text-2xl font-black text-cyan-300 mt-0.5">{goal?.proteinG ?? 0} g</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {profile && goal ? (goal.proteinG / profile.initialWeightKg).toFixed(1) : 0} g/kg peso
              </div>
            </div>

            {/* Grasas */}
            <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-rose-400 uppercase font-bold">🥑 Grasas</div>
              <div className="text-2xl font-black text-rose-300 mt-0.5">{goal?.fatG ?? 0} g</div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {goal ? Math.round(((goal.fatG * 9) / goal.planCalories) * 100) : 0}% de calorías
              </div>
            </div>

            {/* Fibra */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">🌾 Fibra Mínima</div>
              <div className="text-2xl font-black text-emerald-300 mt-0.5">{goal?.fiberG ?? 30} g</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Digestión y saciedad</div>
            </div>
          </div>
        </div>

        {/* Recomendación de plan y rutina */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              DIAGNÓSTICO CALÓRICO Y RUTINA RECOMENDADA
            </span>
            <div className="text-sm font-semibold text-white mt-0.5">
              Objetivo: {goal?.primary === 'lose_weight' ? 'Pérdida de Peso' : goal?.primary === 'gain_muscle' ? 'Ganancia Muscular' : 'Mantenimiento'} ({profile?.initialWeightKg} kg → {goal?.targetWeightKg} kg)
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {profile?.trainingDaysPerWeek && profile.trainingDaysPerWeek >= 5
                ? '⭐ Se recomienda rutina dividida en 6 días (American Line Optimizada) o Calistenia Militar Táctica.'
                : '⭐ Se recomienda rutina Torso/Pierna (4 días) o Full-Body (3 días).'}
            </div>
          </div>

          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Calorías Diarias Asignadas</span>
            <span className="text-lg font-extrabold text-emerald-400">{goal?.planCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* 4. MODAL: Editor de Perfil con Evaluación Inteligente en Tiempo Real */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Editar Perfil y Objetivo</h3>
                <p className="text-xs text-slate-400">Ingresa tus medidas corporales y metas para recalcular tu plan.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nombre:</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Apellido:</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Sexo:</label>
                <select
                  value={editSex}
                  onChange={(e) => setEditSex(e.target.value as Sex)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Fecha de Nacimiento:</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Estatura / Talla (cm):</label>
                <input
                  type="number"
                  placeholder="Ej. 172"
                  value={editHeightCm}
                  onChange={(e) => setEditHeightCm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Peso Actual (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 78.0"
                  value={editWeightKg}
                  onChange={(e) => setEditWeightKg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Objetivo:</label>
                <select
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value as PrimaryGoal)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="lose_weight">Pérdida de Peso</option>
                  <option value="lose_fat">Pérdida de Grasa</option>
                  <option value="gain_muscle">Ganancia de Masa Muscular (Hipertrofia)</option>
                  <option value="maintain">Mantenimiento y Recomposición</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Peso Objetivo (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 70.0"
                  value={editTargetWeightKg}
                  onChange={(e) => setEditTargetWeightKg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Fecha Límite Objetivo:</label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nivel de Experiencia:</label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as ExperienceLevel)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Días de Entrenamiento:</label>
                <select
                  value={editDaysPerWeek}
                  onChange={(e) => setEditDaysPerWeek(parseInt(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="3">3 días por semana (Full Body)</option>
                  <option value="4">4 días por semana (Torso/Pierna)</option>
                  <option value="5">5 días por semana</option>
                  <option value="6">6 días por semana (American Line / Calistenia)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Horario de Entrenamiento:</label>
                <select
                  value={editTrainingTime}
                  onChange={(e) => setEditTrainingTime(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="dawn">🌅 Madrugada (5:00 AM - 7:00 AM)</option>
                  <option value="morning">☀️ Mañana (8:00 AM - 11:30 AM)</option>
                  <option value="afternoon">🌇 Tarde (3:00 PM - 6:30 PM)</option>
                  <option value="night">🌙 Noche (7:00 PM - 10:00 PM)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateFeasibility}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 transition-colors"
            >
              🔄 Recalcular Viabilidad Fisiológica e IA
            </button>

            {/* Vista previa de la evaluación fisiológica */}
            {evaluationPreview && (
              <div className="p-4 bg-slate-850 rounded-xl border border-slate-750 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Dictamen del Motor Fisiológico:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    evaluationPreview.status === 'too_aggressive'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {evaluationPreview.status === 'too_aggressive' ? 'Demasiado Agresivo' : 'Objetivo Viable'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 text-center bg-slate-900 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TMB</span>
                    <span className="font-bold text-white">{evaluationPreview.bmr} kcal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">GET Estimado</span>
                    <span className="font-bold text-amber-400">{evaluationPreview.tdee} kcal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Plan Recomendado</span>
                    <span className="font-bold text-emerald-400">{evaluationPreview.planCalories} kcal</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {evaluationPreview.messages.join(' ')}
                </p>

                {/* Recomendación de rutina sugerida y Evaluación de Cronobiología */}
                <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-emerald-300 text-[11px] space-y-1.5">
                  <div>
                    💡 <strong>Evaluación IA de Rutina:</strong> {
                      editDaysPerWeek >= 6
                        ? 'Se asigna Plan Dividido de 6 días con 1 día de descanso completo (supercompensación neuromuscular).'
                        : editDaysPerWeek >= 4
                        ? 'Se asigna división Upper/Lower (Torso/Pierna de 4 días) para máxima recuperación y balance.'
                        : 'Se asigna rutina de cuerpo completo (Full Body de 3 días) con días alternos de estímulo.'
                    }
                  </div>
                  <div className="pt-1 border-t border-emerald-500/20 text-slate-300">
                    ⏰ <strong>Optimización por Horario ({editTrainingTime === 'dawn' ? 'Madrugada' : editTrainingTime === 'morning' ? 'Mañana' : editTrainingTime === 'afternoon' ? 'Tarde' : 'Noche'}):</strong> {
                      editTrainingTime === 'dawn'
                        ? 'Mayor pico natural de cortisol y testosterona. Requiere calentamiento articular extendido (12-15 min) e hidratación previa con electrolitos.'
                        : editTrainingTime === 'morning'
                        ? 'Excelente ventana metabólica. Desayuno ligero 60 min antes (carbohidratos de absorción media como avena o fruta) para optimizar la fuerza.'
                        : editTrainingTime === 'afternoon'
                        ? 'Pico óptimo de temperatura corporal y síntesis de fuerza. Ideal para levantar cargas máximas y buscar marcas de sobrecarga progresiva.'
                        : 'Permite desestresarse del día. Finalizar el entreno al menos 2 horas antes de dormir para no alterar la melatonina ni el sueño profundo.'
                    }
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Guardar Perfil y Aplicar Rutina
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
