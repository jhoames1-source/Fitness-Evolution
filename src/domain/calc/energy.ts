/**
 * MOTOR DE CÁLCULO — estimaciones energéticas y nutricionales.
 *
 * ⚠️ Todas las salidas son ESTIMACIONES poblacionales, no diagnósticos médicos.
 * Referencias:
 *  - Mifflin MD, St Jeor ST et al. Am J Clin Nutr 1990;51:241-7.
 *  - Roza AM, Shizgal HM (Harris-Benedict revisada). Am J Clin Nutr 1984;40:168-82.
 *  - Katch-McArdle: BMR = 370 + 21.6 × masa magra (kg).
 *  - Proteína en déficit para personas entrenadas: 1.6–2.4 g/kg (ISSN 2017; Helms 2014).
 *  - Fibra: 14 g por 1000 kcal (Dietary Guidelines for Americans).
 */
import type { ActivityData, BmrMethod, BodyData, DailyActivity, PrimaryGoal, Sex } from '../types';

export const ESTIMATE_DISCLAIMER =
  'Estimación orientativa basada en fórmulas poblacionales. No constituye diagnóstico ni prescripción médica.';

/** Energía aproximada por kg de cambio de peso corporal (mezcla grasa/agua/magro). */
export const KCAL_PER_KG = 7700;

export function ageFromBirthDate(birthDate: string, today: Date = new Date()): number {
  const b = new Date(birthDate + 'T00:00:00');
  if (Number.isNaN(b.getTime())) throw new Error('Fecha de nacimiento inválida');
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

// ---------------------------------------------------------------- IMC
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obesity_1' | 'obesity_2' | 'obesity_3';

export const BMI_LABELS: Record<BmiCategory, string> = {
  underweight: 'Bajo peso',
  normal: 'Rango normal',
  overweight: 'Sobrepeso',
  obesity_1: 'Obesidad grado I',
  obesity_2: 'Obesidad grado II',
  obesity_3: 'Obesidad grado III',
};

export function bmi(weightKg: number, heightCm: number): { value: number; category: BmiCategory } {
  assertPositive(weightKg, 'peso');
  assertPositive(heightCm, 'estatura');
  const h = heightCm / 100;
  const value = round1(weightKg / (h * h));
  let category: BmiCategory;
  if (value < 18.5) category = 'underweight';
  else if (value < 25) category = 'normal';
  else if (value < 30) category = 'overweight';
  else if (value < 35) category = 'obesity_1';
  else if (value < 40) category = 'obesity_2';
  else category = 'obesity_3';
  return { value, category };
}

/** Peso correspondiente a un IMC dado para una estatura. */
export function weightForBmi(targetBmi: number, heightCm: number): number {
  const h = heightCm / 100;
  return round1(targetBmi * h * h);
}

// ---------------------------------------------------------------- TMB
export function bmr(body: BodyData, method: BmrMethod = 'mifflin_st_jeor', today?: Date): number {
  const age = ageFromBirthDate(body.birthDate, today);
  const { sex, weightKg: w, heightCm: h } = body;
  switch (method) {
    case 'mifflin_st_jeor':
      return Math.round(10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161));
    case 'harris_benedict_revised':
      return Math.round(
        sex === 'male'
          ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * age
          : 447.593 + 9.247 * w + 3.098 * h - 4.33 * age,
      );
    case 'katch_mcardle': {
      if (body.bodyFatPct == null) throw new Error('Katch-McArdle requiere % de grasa corporal');
      const lbm = w * (1 - body.bodyFatPct / 100);
      return Math.round(370 + 21.6 * lbm);
    }
  }
}

/** Métodos disponibles para el usuario según los datos que tiene. */
export function availableBmrMethods(body: BodyData): BmrMethod[] {
  const m: BmrMethod[] = ['mifflin_st_jeor', 'harris_benedict_revised'];
  if (body.bodyFatPct != null) m.push('katch_mcardle');
  return m;
}

// ---------------------------------------------------------------- GET / TDEE
/**
 * Factor de actividad NO deportiva (trabajo/estilo de vida). El entrenamiento se suma aparte
 * para no contar dos veces la actividad.
 */
const LIFESTYLE_PAL: Record<DailyActivity, number> = {
  sedentary: 1.2,
  light: 1.35,
  moderate: 1.5,
  high: 1.65,
  very_high: 1.8,
};

export function activityFactor(a: ActivityData): number {
  const base = LIFESTYLE_PAL[a.dailyActivity];
  // ≈ +0.025 por día de entrenamiento de ~60 min, escalado por duración.
  const minutes = a.sessionMinutes ?? 60;
  const training = a.trainingDaysPerWeek * 0.025 * (minutes / 60);
  return round3(Math.min(base + training, 2.2));
}

export function tdee(bmrKcal: number, a: ActivityData): number {
  return Math.round(bmrKcal * activityFactor(a));
}

// ---------------------------------------------------------------- Macros
export interface MacroTargets {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  /** g/kg usados para la proteína (transparencia) */
  proteinPerKg: number;
  /** Peso de referencia usado (ajustado si IMC ≥ 30) */
  referenceWeightKg: number;
  warnings: string[];
}

const PROTEIN_G_PER_KG: Record<PrimaryGoal, number> = {
  lose_weight: 2.0,
  lose_fat: 2.0,
  recomposition: 2.0,
  gain_muscle: 1.8,
  improve_strength: 1.8,
  improve_fitness: 1.6,
  maintain: 1.6,
};

export function macroTargets(params: {
  calories: number;
  weightKg: number;
  heightCm: number;
  goal: PrimaryGoal;
}): MacroTargets {
  const { calories, weightKg, heightCm, goal } = params;
  const warnings: string[] = [];
  // En obesidad, calcular la proteína sobre un peso de referencia (IMC 25) evita cifras excesivas.
  const { value: bmiValue } = bmi(weightKg, heightCm);
  const referenceWeightKg = bmiValue >= 30 ? weightForBmi(25, heightCm) : weightKg;
  const proteinPerKg = PROTEIN_G_PER_KG[goal];
  const proteinG = Math.round(referenceWeightKg * proteinPerKg);

  // Grasa: 0.8 g/kg, nunca < 20 % de las kcal ni < 0.6 g/kg.
  let fatG = Math.round(referenceWeightKg * 0.8);
  const minFatByPct = Math.round((calories * 0.2) / 9);
  const minFatByKg = Math.round(referenceWeightKg * 0.6);
  fatG = Math.max(fatG, minFatByPct, minFatByKg);

  const carbsKcal = calories - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(0, Math.round(carbsKcal / 4));
  if (carbsG < 100) {
    warnings.push(
      'Los carbohidratos quedan por debajo de 100 g/día; puede afectar al rendimiento en el entrenamiento.',
    );
  }
  const fiberG = Math.round((calories / 1000) * 14);
  return { calories, proteinG, fatG, carbsG, fiberG, proteinPerKg, referenceWeightKg, warnings };
}

// ---------------------------------------------------------------- Agua
/** ~35 ml/kg/día + 500 ml por cada hora de entrenamiento en días de entreno. */
export function waterTargetMl(weightKg: number, trainingMinutesToday = 0): number {
  const base = weightKg * 35;
  const extra = (trainingMinutesToday / 60) * 500;
  return Math.round((base + extra) / 50) * 50;
}

// ---------------------------------------------------------------- Mínimo seguro
/** Suelo calórico: nunca por debajo de la TMB ni de 1500 (H) / 1200 (M). */
export function calorieFloor(sex: Sex, bmrKcal: number): number {
  return Math.max(bmrKcal, sex === 'male' ? 1500 : 1200);
}

// ---------------------------------------------------------------- utils
function assertPositive(n: number, label: string) {
  if (!(Number.isFinite(n) && n > 0)) throw new Error(`Valor de ${label} inválido`);
}
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
