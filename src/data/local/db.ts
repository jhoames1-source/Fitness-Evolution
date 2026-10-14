/**
 * Base de datos local (IndexedDB vía Dexie) — estrategia LOCAL-FIRST.
 *
 * Aislamiento multiusuario en el dispositivo: cada usuario tiene SU PROPIA base de datos
 * (`fitness-evolution:<userId>`). Así, aunque varias personas usen el mismo teléfono,
 * los datos nunca se mezclan, y cerrar sesión puede borrar la base local sin afectar a otros.
 */
import Dexie, { type Table } from 'dexie';
import type * as S from './schema';

export class UserDb extends Dexie {
  profiles!: Table<S.ProfileRecord, string>;
  preferences!: Table<S.PreferenceRecord, string>;
  goals!: Table<S.GoalRecord, string>;
  weightLogs!: Table<S.WeightLogRecord, string>;
  bodyMeasurements!: Table<S.BodyMeasurementRecord, string>;
  progressPhotos!: Table<S.ProgressPhotoRecord, string>;
  workoutPlans!: Table<S.WorkoutPlanRecord, string>;
  workoutDays!: Table<S.WorkoutDayRecord, string>;
  workoutExercises!: Table<S.WorkoutExerciseRecord, string>;
  workoutSessions!: Table<S.WorkoutSessionRecord, string>;
  workoutSets!: Table<S.WorkoutSetRecord, string>;
  customFoods!: Table<S.CustomFoodRecord, string>;
  mealPlans!: Table<S.MealPlanRecord, string>;
  meals!: Table<S.MealRecord, string>;
  mealItems!: Table<S.MealItemRecord, string>;
  foodLogs!: Table<S.FoodLogRecord, string>;
  waterLogs!: Table<S.WaterLogRecord, string>;
  stepLogs!: Table<S.StepLogRecord, string>;
  sleepLogs!: Table<S.SleepLogRecord, string>;
  symptomLogs!: Table<S.SymptomLogRecord, string>;
  weeklyReviews!: Table<S.WeeklyReviewRecord, string>;
  userAchievements!: Table<S.UserAchievementRecord, string>;
  notificationSettings!: Table<S.NotificationSettingRecord, string>;
  outbox!: Table<S.OutboxEntry, number>;
  meta!: Table<S.MetaEntry, string>;
  photoBlobs!: Table<S.PhotoBlob, string>;

  constructor(public readonly userId: string) {
    super(`fitness-evolution:${userId}`);
    const daily = 'id, date, updatedAt';
    this.version(1).stores({
      profiles: 'id, updatedAt',
      preferences: 'id, updatedAt',
      goals: 'id, active, startDate, updatedAt',
      weightLogs: daily,
      bodyMeasurements: daily,
      progressPhotos: 'id, date, pose, updatedAt',
      workoutPlans: 'id, active, updatedAt',
      workoutDays: 'id, planId, weekday, updatedAt',
      workoutExercises: 'id, planId, dayId, updatedAt',
      workoutSessions: 'id, date, status, updatedAt',
      workoutSets: 'id, sessionId, exerciseId, updatedAt',
      customFoods: 'id, name, updatedAt',
      mealPlans: 'id, weekStart, active, updatedAt',
      meals: 'id, mealPlanId, updatedAt',
      mealItems: 'id, mealId, updatedAt',
      foodLogs: 'id, date, slot, updatedAt',
      waterLogs: daily,
      stepLogs: daily,
      sleepLogs: daily,
      symptomLogs: daily,
      weeklyReviews: 'id, weekStart, updatedAt',
      userAchievements: 'id, achievementId, updatedAt',
      notificationSettings: 'id, kind, updatedAt',
      outbox: '++seq, table, recordId',
      meta: 'key',
      photoBlobs: 'id',
    });
  }
}

const cache = new Map<string, UserDb>();

export function openUserDb(userId: string): UserDb {
  if (!userId) throw new Error('userId requerido para abrir la base local');
  let db = cache.get(userId);
  if (!db) {
    db = new UserDb(userId);
    cache.set(userId, db);
  }
  return db;
}

/** Borra por completo los datos locales de un usuario (p. ej. al cerrar sesión en un dispositivo compartido). */
export async function deleteUserDb(userId: string): Promise<void> {
  const db = cache.get(userId);
  db?.close();
  cache.delete(userId);
  await Dexie.delete(`fitness-evolution:${userId}`);
}
