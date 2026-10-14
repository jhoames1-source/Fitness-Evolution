/**
 * Tipos de dominio compartidos. No dependen de React ni de la base de datos.
 */

export type Sex = 'male' | 'female';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type DailyActivity = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';
export type TrainingDaysPerWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type PrimaryGoal =
  | 'lose_weight'
  | 'lose_fat'
  | 'maintain'
  | 'gain_muscle'
  | 'recomposition'
  | 'improve_fitness'
  | 'improve_strength';

export type SecondaryGoal =
  | 'reduce_waist'
  | 'improve_endurance'
  | 'increase_strength'
  | 'improve_strength'
  | 'improve_habits'
  | 'increase_steps'
  | 'improve_fitness';

export type BmrMethod = 'mifflin_st_jeor' | 'harris_benedict_revised' | 'katch_mcardle';

export interface BodyData {
  sex: Sex;
  /** Fecha de nacimiento ISO (YYYY-MM-DD) */
  birthDate: string;
  heightCm: number;
  weightKg: number;
  /** % de grasa corporal, si se conoce (habilita Katch-McArdle) */
  bodyFatPct?: number;
}

export interface ActivityData {
  dailyActivity: DailyActivity;
  trainingDaysPerWeek: TrainingDaysPerWeek;
  /** Duración media de la sesión en minutos */
  sessionMinutes?: number;
  avgDailySteps?: number;
}
