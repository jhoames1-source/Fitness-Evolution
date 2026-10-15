/**
 * Registros persistidos localmente (IndexedDB) y sincronizados con Postgres.
 * Convenciones (idénticas en el servidor):
 *  - id: UUID generado en el cliente → la sincronización es idempotente (sin duplicados).
 *  - updatedAt: ISO; se usa para last-write-wins en registros editables.
 *  - deletedAt: borrado lógico (tombstone) para propagar eliminaciones.
 *  - Fechas de día como 'YYYY-MM-DD' en la zona horaria local del usuario.
 */
import type { ActivityData, BmrMethod, DailyActivity, ExperienceLevel, PrimaryGoal, SecondaryGoal, Sex } from '@/domain/types';
import type { Equipment } from '@/domain/training/types';
import type { IsoWeekday, SplitType } from '@/domain/training/routine';
import type { MealSlot, Nutrients } from '@/domain/nutrition/types';

export interface SyncMeta {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  version: number;
}

export interface ProfileRecord extends SyncMeta {
  firstName: string;
  lastName: string;
  birthDate: string;
  sex: Sex;
  heightCm: number;
  initialWeightKg: number;
  level: ExperienceLevel;
  trainingDaysPerWeek: ActivityData['trainingDaysPerWeek'];
  dailyActivity: DailyActivity;
  avgSleepHours?: number;
  avgDailySteps?: number;
  bodyFatPct?: number;
  bmrMethod: BmrMethod;
  role: 'user' | 'admin';
  onboardingCompleted: boolean;
}

export interface PreferenceRecord extends SyncMeta {
  theme: 'light' | 'dark' | 'system';
  dislikedFoodIds: string[];
  unavailableFoodIds: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  budget: 'low' | 'medium' | 'high';
  mealsPerDay: 3 | 4 | 5 | 6;
  workSchedule?: string;
  trainingTime?: string;
  equipment: Equipment[];
  availableWeekdays: IsoWeekday[];
  sessionMinutes: 30 | 45 | 60 | 75 | 90;
  stepGoal: number;
  waterGoalMl?: number;
}

export interface GoalRecord extends SyncMeta {
  primary: PrimaryGoal;
  secondary: SecondaryGoal[];
  startWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDate: string;
  /** Resultado del motor de viabilidad al crear el objetivo */
  feasibility: string;
  planCalories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  active: boolean;
  /** Si el usuario aceptó una alternativa: su id */
  acceptedAlternative?: string | null;
}

export interface WeightLogRecord extends SyncMeta { date: string; time: string; weightKg: number; note?: string }
export interface BodyMeasurementRecord extends SyncMeta { date: string; waistCm?: number; abdomenCm?: number; hipCm?: number; chestCm?: number; armCm?: number; thighCm?: number; bodyFatPct?: number }
export interface ProgressPhotoRecord extends SyncMeta { date: string; pose: 'front' | 'side' | 'back'; storagePath?: string | null; localBlobId?: string | null }

export interface WorkoutPlanRecord extends SyncMeta { name: string; source: 'imported_image' | 'generated' | 'manual' | 'optimized'; split: SplitType; basedOnPlanId?: string | null; warmupMin: number; notes: string[]; active: boolean }
export interface WorkoutDayRecord extends SyncMeta { planId: string; weekday: IsoWeekday; title: string; isRest: boolean; position: number }
export interface WorkoutExerciseRecord extends SyncMeta { planId: string; dayId: string; exerciseId: string; position: number; sets: number; repsMin: number; repsMax: number; rirMin?: number; rirMax?: number; restSec?: number; superset?: string | null; notes?: string; setsAssumed?: boolean }

export interface WorkoutSessionRecord extends SyncMeta { date: string; planId?: string | null; dayId?: string | null; startedAt: string; finishedAt?: string | null; status: 'in_progress' | 'completed' | 'skipped'; perceivedEffort?: number; notes?: string }
export interface WorkoutSetRecord extends SyncMeta { sessionId: string; workoutExerciseId?: string | null; exerciseId: string; /** si se usó una alternativa: id del ejercicio planificado */ substitutedFrom?: string | null; setNumber: number; weightKg?: number; reps?: number; durationSec?: number; rir?: number; restSec?: number; completed: boolean; isWarmup: boolean }

export interface CustomFoodRecord extends SyncMeta {
  name: string;
  category: string;
  unit: 'g' | 'ml';
  per100: Nutrients;
  servings: { label: string; amount: number }[];
  tags?: string[];
  notes?: string;
  source?: string;
}
export interface MealPlanRecord extends SyncMeta { weekStart: string; calories: number; generatedFrom: string; active: boolean }
export interface MealRecord extends SyncMeta { mealPlanId: string; weekday: IsoWeekday; slot: MealSlot; position: number }
export interface MealItemRecord extends SyncMeta { mealId: string; foodId: string; amount: number }

/** food_log copia los nutrientes en el momento del registro: el historial no cambia si se edita el alimento. */
export interface FoodLogRecord extends SyncMeta { date: string; slot: MealSlot; foodId: string; foodName: string; amount: number; unit: 'g' | 'ml'; nutrients: Nutrients }
export interface WaterLogRecord extends SyncMeta { date: string; amountMl: number; at: string }
export interface StepLogRecord extends SyncMeta { date: string; steps: number; distanceKm?: number; source: 'manual' | 'health_connect' }
export interface SleepLogRecord extends SyncMeta { date: string; hours: number; quality?: 1 | 2 | 3 | 4 | 5 }
export interface SymptomLogRecord extends SyncMeta {
  date: string;
  nightSweats?: 0 | 1 | 2 | 3;
  fatigue?: 0 | 1 | 2 | 3;
  muscleSoreness?: 0 | 1 | 2 | 3;
  jointPain?: 0 | 1 | 2 | 3;
  stress?: 0 | 1 | 2 | 3;
  energy?: 1 | 2 | 3 | 4 | 5;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  readiness?: 'tired' | 'ok' | 'strong';
  notes?: string;
}
export interface WeeklyReviewRecord extends SyncMeta { weekStart: string; avgWeightKg?: number; weightDeltaKg?: number; waistDeltaCm?: number; adherencePct?: number; hunger?: number; energy?: number; sleep?: number; pain?: number; stress?: number; recommendation: string; adjustments: string[] }
export interface UserAchievementRecord extends SyncMeta { achievementId: string; unlockedAt: string }
export interface NotificationSettingRecord extends SyncMeta { kind: 'workout' | 'meal' | 'water' | 'weight' | 'measurement' | 'rest'; enabled: boolean; times: string[]; weekdays: IsoWeekday[] }

export interface OutboxEntry {
  seq?: number;
  table: SyncTable;
  recordId: string;
  op: 'upsert' | 'delete';
  queuedAt: string;
  attempts: number;
}

export interface MetaEntry { key: string; value: string }
export interface PhotoBlob { id: string; blob: Blob }

export const SYNC_TABLES = [
  'profiles', 'preferences', 'goals', 'weightLogs', 'bodyMeasurements', 'progressPhotos',
  'workoutPlans', 'workoutDays', 'workoutExercises', 'workoutSessions', 'workoutSets',
  'customFoods', 'mealPlans', 'meals', 'mealItems', 'foodLogs', 'waterLogs', 'stepLogs',
  'sleepLogs', 'symptomLogs', 'weeklyReviews', 'userAchievements', 'notificationSettings',
] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

/** Nombre de la tabla en Postgres (snake_case). */
export const REMOTE_TABLE: Record<SyncTable, string> = {
  profiles: 'profiles', preferences: 'user_preferences', goals: 'goals', weightLogs: 'weight_logs',
  bodyMeasurements: 'body_measurements', progressPhotos: 'progress_photos', workoutPlans: 'workout_plans',
  workoutDays: 'workout_days', workoutExercises: 'workout_exercises', workoutSessions: 'workout_sessions',
  workoutSets: 'workout_sets', customFoods: 'custom_foods', mealPlans: 'meal_plans', meals: 'meals',
  mealItems: 'meal_items', foodLogs: 'food_logs', waterLogs: 'water_logs', stepLogs: 'step_logs',
  sleepLogs: 'sleep_logs', symptomLogs: 'symptom_logs', weeklyReviews: 'weekly_reviews',
  userAchievements: 'user_achievements', notificationSettings: 'notification_settings',
};
