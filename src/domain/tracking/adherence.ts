/**
 * SISTEMA DE ADHERENCIA Y SEGUIMIENTO SEMANAL
 * Calcula la adherencia por pilares (Entrenamiento, Nutrición, Agua, Pasos, Sueño).
 * FILOSOFÍA REQUERIDA: No culpabilizar. Identificar fortalezas y áreas de apoyo.
 */

export interface PillarAdherence {
  actual: number;
  target: number;
  percentage: number;
  unit: string;
  feedback: string;
}

export interface WeeklyAdherenceReport {
  weekStart: string;
  workout: PillarAdherence;
  nutrition: PillarAdherence;
  water: PillarAdherence;
  steps: PillarAdherence;
  sleep: PillarAdherence;
  overallScorePct: number;
  reflectionPrompt: string;
  keyWin: string;
  focusArea: string;
}

export interface AdherenceInputData {
  weekStart: string;
  completedWorkouts: number;
  plannedWorkouts: number;
  daysMetCalorieGoal: number; // +/- 150 kcal
  daysLoggedNutrition: number;
  avgDailyWaterMl: number;
  targetWaterMl: number;
  avgDailySteps: number;
  targetDailySteps: number;
  avgSleepHours: number;
  targetSleepHours?: number;
}

export function calculateWeeklyAdherence(data: AdherenceInputData): WeeklyAdherenceReport {
  const {
    weekStart,
    completedWorkouts,
    plannedWorkouts,
    daysMetCalorieGoal,
    daysLoggedNutrition,
    avgDailyWaterMl,
    targetWaterMl,
    avgDailySteps,
    targetDailySteps,
    avgSleepHours,
    targetSleepHours = 7.5,
  } = data;

  // 1. Entrenamiento
  const workoutPct = plannedWorkouts > 0 ? Math.min(100, Math.round((completedWorkouts / plannedWorkouts) * 100)) : 100;
  const workoutFeedback =
    workoutPct >= 90
      ? '¡Excelente consistencia con las sesiones programadas!'
      : workoutPct >= 70
      ? 'Buen ritmo. Recuerda que la constancia supera a la perfección.'
      : 'Semanas complejas ocurren. Ajustemos el plan si los horarios están apretados.';

  // 2. Nutrición (pondera registro constante + precisión)
  const loggingPct = Math.min(100, Math.round((daysLoggedNutrition / 7) * 100));
  const precisionPct = daysLoggedNutrition > 0 ? Math.min(100, Math.round((daysMetCalorieGoal / daysLoggedNutrition) * 100)) : 0;
  const nutritionPct = Math.round(loggingPct * 0.4 + precisionPct * 0.6);
  const nutritionFeedback =
    nutritionPct >= 80
      ? 'Control nutricional muy sólido.'
      : 'El registro diario te da claridad sin necesidad de obsesionarse con los gramos.';

  // 3. Agua
  const waterPct = targetWaterMl > 0 ? Math.min(100, Math.round((avgDailyWaterMl / targetWaterMl) * 100)) : 100;
  const waterFeedback =
    waterPct >= 85 ? 'Hidratación óptima.' : 'Ten a mano una botella en tu espacio de trabajo o entrenamiento.';

  // 4. Pasos (NEAT)
  const stepsPct = targetDailySteps > 0 ? Math.min(100, Math.round((avgDailySteps / targetDailySteps) * 100)) : 100;
  const stepsFeedback =
    stepsPct >= 85
      ? 'Gasto de actividad diaria excelente.'
      : 'Paseos de 10 minutos tras las comidas principales suman mucho gasto sin fatiga.';

  // 5. Sueño
  const sleepPct = targetSleepHours > 0 ? Math.min(100, Math.round((avgSleepHours / targetSleepHours) * 100)) : 100;
  const sleepFeedback =
    avgSleepHours >= 7 ? 'Descanso recuperador adecuado.' : 'El descanso insuficiente eleva el hambre y frena el rendimiento.';

  // Puntuación global ponderada (Entrenamiento 30%, Nutrición 30%, Pasos 15%, Agua 15%, Sueño 10%)
  const overallScorePct = Math.round(
    workoutPct * 0.3 + nutritionPct * 0.3 + stepsPct * 0.15 + waterPct * 0.15 + sleepPct * 0.1
  );

  // Identificar mayor logro y foco de mejora
  const pillars = [
    { name: 'Entrenamiento', pct: workoutPct },
    { name: 'Nutrición', pct: nutritionPct },
    { name: 'Hidratación', pct: waterPct },
    { name: 'Pasos', pct: stepsPct },
    { name: 'Sueño', pct: sleepPct },
  ];
  pillars.sort((a, b) => b.pct - a.pct);
  const best = pillars[0]!;
  const worst = pillars[pillars.length - 1]!;

  return {
    weekStart,
    workout: {
      actual: completedWorkouts,
      target: plannedWorkouts,
      percentage: workoutPct,
      unit: 'sesiones',
      feedback: workoutFeedback,
    },
    nutrition: {
      actual: daysMetCalorieGoal,
      target: 7,
      percentage: nutritionPct,
      unit: 'días',
      feedback: nutritionFeedback,
    },
    water: {
      actual: Math.round(avgDailyWaterMl),
      target: Math.round(targetWaterMl),
      percentage: waterPct,
      unit: 'ml/día',
      feedback: waterFeedback,
    },
    steps: {
      actual: Math.round(avgDailySteps),
      target: Math.round(targetDailySteps),
      percentage: stepsPct,
      unit: 'pasos/día',
      feedback: stepsFeedback,
    },
    sleep: {
      actual: Math.round(avgSleepHours * 10) / 10,
      target: targetSleepHours,
      percentage: sleepPct,
      unit: 'h/noche',
      feedback: sleepFeedback,
    },
    overallScorePct,
    reflectionPrompt:
      'Esta métrica es una brújula de hábitos, no un juicio de valor. Una adherencia del 80% sostenida meses rinde más que un 100% que se abandona en dos semanas.',
    keyWin: `Tu pilar más firme esta semana fue ${best.name} (${best.pct}%).`,
    focusArea: `Oportunidad para la próxima semana: sumar un pequeño hábito en ${worst.name} (${worst.pct}%).`,
  };
}
