/**
 * PERFILES DE PRUEBA Y DEMOSTRACIÓN (Regla 58 y 62)
 *
 * Usuario 1: Perfil real del usuario (Pérdida de peso / grasa)
 *   - 38 años, Masculino, 1.72 m, 78 kg -> 70 kg (Fecha: 31/12/2026)
 *   - 6 días de entrenamiento, domingo descanso.
 *   - Rutina base: "Plan American Line" de la imagen aportada.
 *   - Lista de 34 alimentos del usuario integrada.
 *
 * Usuario 2: Ganancia de masa muscular (Hipertrofia)
 *   - 24 años, Masculino, 1.80 m, 68 kg -> 74 kg
 *   - 4 días de entrenamiento (Upper/Lower).
 *
 * Usuario 3: Mantenimiento y recomposición
 *   - 30 años, Femenino, 1.65 m, 60 kg -> 60 kg
 *   - 3 días de entrenamiento (Full Body).
 */

import { AMERICAN_LINE_ORIGINAL, AMERICAN_LINE_OPTIMIZED } from './routines/american-line';
import { DEMO_USER_FOOD_IDS } from './foods';

export const DEMO_USER_1_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_USER_2_ID = '00000000-0000-0000-0000-000000000002';
export const DEMO_USER_3_ID = '00000000-0000-0000-0000-000000000003';

export const DEMO_USERS = [
  {
    id: DEMO_USER_1_ID,
    email: 'usuario.demo@fitnessevolution.app',
    firstName: 'Atleta',
    lastName: 'Evolution',
    birthDate: '1988-06-15', // 38 años en 2026
    sex: 'male' as const,
    heightCm: 172,
    initialWeightKg: 78,
    currentWeightKg: 78,
    targetWeightKg: 70,
    startDate: '2026-10-12',
    targetDate: '2026-12-31',
    primaryGoal: 'lose_weight' as const,
    secondaryGoals: ['reduce_waist', 'improve_strength'] as const,
    level: 'intermediate' as const,
    trainingDaysPerWeek: 6 as const,
    dailyActivity: 'moderate' as const,
    avgSleepHours: 7,
    avgDailySteps: 8500,
    favoriteFoods: DEMO_USER_FOOD_IDS,
    routineOriginal: AMERICAN_LINE_ORIGINAL,
    routineOptimized: AMERICAN_LINE_OPTIMIZED,
  },
  {
    id: DEMO_USER_2_ID,
    email: 'carlos.hipertrofia@fitnessevolution.app',
    firstName: 'Carlos',
    lastName: 'Musculación',
    birthDate: '2002-04-10', // 24 años
    sex: 'male' as const,
    heightCm: 180,
    initialWeightKg: 68,
    currentWeightKg: 68,
    targetWeightKg: 74,
    startDate: '2026-10-12',
    targetDate: '2027-04-12',
    primaryGoal: 'gain_muscle' as const,
    secondaryGoals: ['increase_strength'] as const,
    level: 'beginner' as const,
    trainingDaysPerWeek: 4 as const,
    dailyActivity: 'light' as const,
    avgSleepHours: 8,
    avgDailySteps: 7000,
  },
  {
    id: DEMO_USER_3_ID,
    email: 'laura.mantenimiento@fitnessevolution.app',
    firstName: 'Laura',
    lastName: 'Equilibrio',
    birthDate: '1996-09-20', // 30 años
    sex: 'female' as const,
    heightCm: 165,
    initialWeightKg: 60,
    currentWeightKg: 60,
    targetWeightKg: 60,
    startDate: '2026-10-12',
    targetDate: '2027-01-12',
    primaryGoal: 'maintain' as const,
    secondaryGoals: ['improve_fitness', 'improve_habits'] as const,
    level: 'intermediate' as const,
    trainingDaysPerWeek: 3 as const,
    dailyActivity: 'moderate' as const,
    avgSleepHours: 7.5,
    avgDailySteps: 9000,
  },
];
