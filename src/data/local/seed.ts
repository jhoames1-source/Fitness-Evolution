/**
 * INICIALIZADOR DE DATOS REALES PARA EL USUARIO DEMO
 * Rellena la base de datos local (Dexie) del usuario seleccionado
 * con su plan de entrenamiento estructurado, metas calóricas y registros iniciales.
 */
import { openUserDb } from './db';
import { DEMO_USERS, DEMO_USER_1_ID } from '../../seed-content/demo-users';
import { evaluateGoal } from '../../domain/goals/feasibility';
import { FOODS } from '../../seed-content/foods';
import { nutrientsFor } from '../../domain/nutrition/nutrients';

export async function seedDemoUser(userId = DEMO_USER_1_ID): Promise<void> {
  const db = openUserDb(userId);
  const existing = await db.profiles.get(userId);
  if (existing) {
    // Ya está inicializado
    return;
  }

  const found = DEMO_USERS.find((d) => d.id === userId);
  const u = found ?? DEMO_USERS[0]!;
  const now = new Date().toISOString();
  const todayStr = now.slice(0, 10);

  // 1. Perfil
  await db.profiles.put({
    id: u.id,
    userId: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    birthDate: u.birthDate,
    sex: u.sex,
    heightCm: u.heightCm,
    initialWeightKg: u.initialWeightKg,
    level: u.level,
    trainingDaysPerWeek: u.trainingDaysPerWeek,
    dailyActivity: u.dailyActivity,
    avgSleepHours: u.avgSleepHours,
    avgDailySteps: u.avgDailySteps,
    bmrMethod: 'mifflin_st_jeor',
    role: 'user',
    onboardingCompleted: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  // 2. Preferencias
  await db.preferences.put({
    id: crypto.randomUUID(),
    userId: u.id,
    theme: 'dark',
    dislikedFoodIds: [],
    unavailableFoodIds: [],
    allergies: [],
    dietaryRestrictions: [],
    budget: 'medium',
    mealsPerDay: 4,
    equipment: ['barbell', 'dumbbell', 'machine', 'cable', 'smith', 'bench', 'pullup_bar'],
    availableWeekdays: [1, 2, 3, 4, 5, 6],
    sessionMinutes: 75,
    stepGoal: u.avgDailySteps,
    waterGoalMl: 2800,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  // 3. Evaluar Meta con el motor de viabilidad
  const evalResult = evaluateGoal({
    body: {
      sex: u.sex,
      birthDate: u.birthDate,
      heightCm: u.heightCm,
      weightKg: u.initialWeightKg,
    },
    activity: {
      dailyActivity: u.dailyActivity,
      trainingDaysPerWeek: u.trainingDaysPerWeek,
      sessionMinutes: 75,
      avgDailySteps: u.avgDailySteps,
    },
    level: u.level,
    goal: u.primaryGoal,
    targetWeightKg: u.targetWeightKg,
    startDate: u.startDate,
    targetDate: u.targetDate,
  });

  const goalId = crypto.randomUUID();
  await db.goals.put({
    id: goalId,
    userId: u.id,
    primary: u.primaryGoal,
    secondary: [...u.secondaryGoals],
    startWeightKg: u.initialWeightKg,
    targetWeightKg: u.targetWeightKg,
    startDate: u.startDate,
    targetDate: u.targetDate,
    feasibility: evalResult.status,
    planCalories: evalResult.planCalories,
    proteinG: evalResult.macros.proteinG,
    fatG: evalResult.macros.fatG,
    carbsG: evalResult.macros.carbsG,
    fiberG: evalResult.macros.fiberG,
    active: true,
    acceptedAlternative: evalResult.alternatives[0]?.id || null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  // 4. Peso inicial
  await db.weightLogs.put({
    id: crypto.randomUUID(),
    userId: u.id,
    date: u.startDate,
    time: '07:30',
    weightKg: u.initialWeightKg,
    note: 'Peso inicial de partida registrado en ayunas.',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  // 5. Cargar Rutina Optimizada como Activa y Rutina Original como Base
  const routine = u.routineOptimized;
  if (routine) {
    const planId = crypto.randomUUID();
    await db.workoutPlans.put({
      id: planId,
      userId: u.id,
      name: routine.name,
      source: routine.source,
      split: routine.split,
      basedOnPlanId: null,
      warmupMin: routine.warmupMin,
      notes: routine.generalNotes,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });

    for (let dIdx = 0; dIdx < routine.days.length; dIdx++) {
      const day = routine.days[dIdx]!;
      const dayId = crypto.randomUUID();
      await db.workoutDays.put({
        id: dayId,
        userId: u.id,
        planId,
        weekday: day.weekday,
        title: day.title,
        isRest: day.isRest,
        position: dIdx,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1,
      });

      for (let eIdx = 0; eIdx < day.exercises.length; eIdx++) {
        const item = day.exercises[eIdx]!;
        await db.workoutExercises.put({
          id: crypto.randomUUID(),
          userId: u.id,
          planId,
          dayId,
          exerciseId: item.exerciseId,
          position: eIdx,
          sets: item.sets,
          repsMin: item.reps[0],
          repsMax: item.reps[1],
          rirMin: item.rir?.[0],
          rirMax: item.rir?.[1],
          restSec: item.restSec,
          superset: item.superset || null,
          notes: item.notes,
          setsAssumed: item.setsAssumed || false,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          version: 1,
        });
      }
    }
  }

  // 6. Registros de muestra para el día de HOY (Agua, comida, pasos)
  await db.waterLogs.put({
    id: crypto.randomUUID(),
    userId: u.id,
    date: todayStr,
    amountMl: 750,
    at: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  await db.stepLogs.put({
    id: crypto.randomUUID(),
    userId: u.id,
    date: todayStr,
    steps: 4250,
    source: 'manual',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });

  // Comida de desayuno de muestra
  const egg = FOODS.find((f) => f.id === 'huevo_sancochado')!;
  const oats = FOODS.find((f) => f.id === 'avena')!;
  await db.foodLogs.put({
    id: crypto.randomUUID(),
    userId: u.id,
    date: todayStr,
    slot: 'breakfast',
    foodId: egg.id,
    foodName: egg.name,
    amount: 100,
    unit: 'g',
    nutrients: nutrientsFor(egg, 100),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });
  await db.foodLogs.put({
    id: crypto.randomUUID(),
    userId: u.id,
    date: todayStr,
    slot: 'breakfast',
    foodId: oats.id,
    foodName: oats.name,
    amount: 40,
    unit: 'g',
    nutrients: nutrientsFor(oats, 40),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    version: 1,
  });
}
