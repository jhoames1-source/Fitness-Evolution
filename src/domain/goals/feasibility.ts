/**
 * MOTOR INTELIGENTE DE OBJETIVOS
 * Evalúa si un objetivo de peso es razonable en el tiempo disponible y propone alternativas.
 *
 * Criterios (pérdida): ritmo semanal como % del peso corporal.
 *   ≤ 0.5 %  cómodo · ≤ 0.75 % moderado · ≤ 1.0 % ambicioso · > 1.0 % demasiado agresivo
 *   (Helms et al. 2014; Garthe et al. 2011: 0.5–1 %/sem preserva mejor la masa magra).
 * Además, las calorías resultantes nunca pueden quedar por debajo del suelo de seguridad.
 *
 * Criterios (ganancia muscular), % del peso por mes según experiencia
 *   (aproximación de Aragon): principiante 1–1.5 %, intermedio 0.5–1 %, avanzado 0.25–0.5 %.
 *
 * Nunca se obliga al usuario a un ritmo inseguro: si el objetivo es demasiado agresivo,
 * las calorías del plan se fijan en el ritmo seguro y se muestran alternativas.
 */
import type { ActivityData, BmrMethod, BodyData, ExperienceLevel, PrimaryGoal } from '../types';
import {
  KCAL_PER_KG,
  bmi,
  bmr as calcBmr,
  calorieFloor,
  macroTargets,
  round1,
  round2,
  tdee as calcTdee,
  weightForBmi,
  type MacroTargets,
} from '../calc/energy';

export type FeasibilityStatus = 'invalid' | 'comfortable' | 'moderate' | 'ambitious' | 'too_aggressive';

export const STATUS_LABELS: Record<FeasibilityStatus, string> = {
  invalid: 'Objetivo no válido',
  comfortable: 'Objetivo cómodo',
  moderate: 'Objetivo moderado',
  ambitious: 'Objetivo ambicioso',
  too_aggressive: 'El objetivo podría ser demasiado agresivo',
};

export interface GoalInput {
  body: BodyData;
  activity: ActivityData;
  level: ExperienceLevel;
  goal: PrimaryGoal;
  targetWeightKg: number;
  /** ISO YYYY-MM-DD */
  startDate: string;
  /** ISO YYYY-MM-DD */
  targetDate: string;
  bmrMethod?: BmrMethod;
}

export interface GoalAlternative {
  id: 'safe_pace_same_target' | 'same_date_intermediate_target' | 'keep_original';
  title: string;
  description: string;
  targetWeightKg: number;
  targetDate: string;
  weeklyChangeKg: number;
  calories: number;
}

export interface GoalEvaluation {
  status: FeasibilityStatus;
  messages: string[];
  bmr: number;
  tdee: number;
  weeks: number;
  /** Negativo = pérdida */
  weeklyChangeKg: number;
  weeklyPctBodyWeight: number;
  /** Diferencia diaria respecto al GET que exigiría el objetivo tal cual (negativo = déficit) */
  requiredDailyEnergyDelta: number;
  /** Calorías que usará el plan (pueden diferir de las requeridas si eran inseguras) */
  planCalories: number;
  planDailyEnergyDelta: number;
  calorieFloor: number;
  macros: MacroTargets;
  alternatives: GoalAlternative[];
}

const LOSS_GOALS: PrimaryGoal[] = ['lose_weight', 'lose_fat'];
const LOSS_SAFE_PCT = 0.6; // ritmo propuesto en la alternativa "mismo objetivo"
const LOSS_MAX_RECOMMENDED_PCT = 0.75;
const LOSS_LIMIT_PCT = 1.0;

/** Ritmo máximo recomendado de ganancia (% peso/semana) según experiencia. */
const GAIN_MAX_PCT_WEEK: Record<ExperienceLevel, number> = {
  beginner: 1.5 / 4.33,
  intermediate: 1.0 / 4.33,
  advanced: 0.5 / 4.33,
};

export function evaluateGoal(input: GoalInput, today?: Date): GoalEvaluation {
  const { body, activity, goal, targetWeightKg, startDate, targetDate, level } = input;
  const messages: string[] = [];
  const bmrKcal = calcBmr(body, input.bmrMethod ?? 'mifflin_st_jeor', today);
  const tdeeKcal = calcTdee(bmrKcal, activity);
  const floor = calorieFloor(body.sex, bmrKcal);
  const days = daysBetween(startDate, targetDate);
  const weeks = round1(days / 7);
  const delta = round2(targetWeightKg - body.weightKg); // negativo = bajar
  const minHealthyWeight = weightForBmi(18.5, body.heightCm);

  const base = (status: FeasibilityStatus, planCalories: number, extra: Partial<GoalEvaluation> = {}): GoalEvaluation => ({
    status,
    messages,
    bmr: bmrKcal,
    tdee: tdeeKcal,
    weeks,
    weeklyChangeKg: weeks > 0 ? round2(delta / weeks) : 0,
    weeklyPctBodyWeight: weeks > 0 ? round2((Math.abs(delta) / weeks / body.weightKg) * 100) : 0,
    requiredDailyEnergyDelta: weeks > 0 ? Math.round((delta * KCAL_PER_KG) / days) : 0,
    planCalories,
    planDailyEnergyDelta: planCalories - tdeeKcal,
    calorieFloor: floor,
    macros: macroTargets({ calories: planCalories, weightKg: body.weightKg, heightCm: body.heightCm, goal }),
    alternatives: [],
    ...extra,
  });

  // ------------------------------------------------ validaciones
  if (!(targetWeightKg > 0)) {
    messages.push('Introduce un peso objetivo válido.');
    return base('invalid', tdeeKcal);
  }
  if (days < 7) {
    messages.push('La fecha objetivo debe estar al menos 7 días después de la fecha de inicio.');
    return base('invalid', tdeeKcal);
  }

  // ------------------------------------------------ objetivos sin cambio de peso principal
  if (goal === 'maintain' || goal === 'improve_fitness' || goal === 'improve_strength' || goal === 'recomposition') {
    let cal = tdeeKcal;
    if (goal === 'recomposition' && bmi(body.weightKg, body.heightCm).value >= 25) {
      cal = Math.max(floor, Math.round(tdeeKcal * 0.9));
      messages.push('Recomposición con déficit ligero (~10 %) y proteína alta.');
    } else {
      messages.push('Calorías de mantenimiento estimadas. El progreso se medirá por rendimiento y medidas.');
    }
    if (Math.abs(delta) > 0 && goal === 'maintain' && Math.abs(delta) > 2) {
      messages.push('Tu peso objetivo difiere más de 2 kg del actual: considera "perder peso" o "ganar masa muscular".');
    }
    return base('comfortable', cal);
  }

  // ------------------------------------------------ pérdida
  if (LOSS_GOALS.includes(goal)) {
    if (delta >= 0) {
      messages.push('El peso objetivo no es inferior al actual. Revisa el objetivo seleccionado.');
      return base('invalid', tdeeKcal);
    }
    const lossKg = -delta;
    const rateKg = lossKg / weeks;
    const pct = (rateKg / body.weightKg) * 100;
    const requiredCalories = Math.round(tdeeKcal - (rateKg * KCAL_PER_KG) / 7);

    let status: FeasibilityStatus =
      pct <= 0.5 ? 'comfortable' : pct <= LOSS_MAX_RECOMMENDED_PCT ? 'moderate' : pct <= LOSS_LIMIT_PCT ? 'ambitious' : 'too_aggressive';

    if (requiredCalories < floor) {
      status = 'too_aggressive';
      messages.push(`Alcanzarlo exigiría ~${requiredCalories} kcal/día, por debajo del mínimo seguro estimado (${floor} kcal).`);
    }
    if (targetWeightKg < minHealthyWeight) {
      status = 'too_aggressive';
      messages.push(`El peso objetivo corresponde a un IMC inferior a 18.5 (mínimo orientativo: ${minHealthyWeight} kg).`);
    }

    const safeTarget = Math.max(targetWeightKg, minHealthyWeight);
    const alternatives: GoalAlternative[] = [];

    // A) mismo objetivo, ritmo seguro
    const safeRate = (body.weightKg * LOSS_SAFE_PCT) / 100;
    const weeksA = Math.ceil((body.weightKg - safeTarget) / safeRate);
    alternatives.push({
      id: 'safe_pace_same_target',
      title: `Llegar a ${safeTarget} kg con un ritmo sostenible`,
      description: `Ritmo de ~${round2(safeRate)} kg/semana (${LOSS_SAFE_PCT} % del peso).`,
      targetWeightKg: safeTarget,
      targetDate: addDays(startDate, weeksA * 7),
      weeklyChangeKg: -round2(safeRate),
      calories: Math.max(floor, Math.round(tdeeKcal - (safeRate * KCAL_PER_KG) / 7)),
    });

    // B) misma fecha, objetivo intermedio
    const maxRate = Math.min(rateKg, (body.weightKg * LOSS_MAX_RECOMMENDED_PCT) / 100);
    const calB = Math.max(floor, Math.round(tdeeKcal - (maxRate * KCAL_PER_KG) / 7));
    const effRateB = ((tdeeKcal - calB) * 7) / KCAL_PER_KG;
    const targetB = Math.max(safeTarget, roundHalf(body.weightKg - effRateB * weeks));
    if (targetB > targetWeightKg) {
      alternatives.push({
        id: 'same_date_intermediate_target',
        title: `Mantener la fecha con una meta intermedia de ${targetB} kg`,
        description: `Ritmo de ~${round2(effRateB)} kg/semana; luego se continúa hacia ${targetWeightKg} kg.`,
        targetWeightKg: targetB,
        targetDate,
        weeklyChangeKg: -round2(effRateB),
        calories: calB,
      });
    }

    // C) mantener original (solo si no es inseguro)
    if (status === 'ambitious') {
      alternatives.push({
        id: 'keep_original',
        title: 'Mantener el objetivo original',
        description: 'Está en el límite superior del rango recomendado. Vigila hambre, sueño, energía y rendimiento.',
        targetWeightKg,
        targetDate,
        weeklyChangeKg: -round2(rateKg),
        calories: requiredCalories,
      });
    }

    let planCalories: number;
    if (status === 'too_aggressive') {
      messages.unshift('El objetivo podría ser demasiado agresivo. Te proponemos un objetivo alternativo.');
      planCalories = alternatives[0]!.calories;
    } else {
      planCalories = requiredCalories;
      if (status === 'ambitious') messages.unshift('Objetivo ambicioso: alcanzable, pero en el límite superior del ritmo recomendado.');
      if (status === 'moderate') messages.unshift('Objetivo moderado y razonable.');
      if (status === 'comfortable') messages.unshift('Objetivo cómodo y sostenible.');
    }
    return base(status, planCalories, { alternatives: status === 'comfortable' || status === 'moderate' ? [] : alternatives });
  }

  // ------------------------------------------------ ganancia muscular
  if (delta <= 0) {
    messages.push('Para ganar masa muscular el peso objetivo debería ser mayor al actual. Considera "recomposición".');
    return base('invalid', tdeeKcal);
  }
  const rateKg = delta / weeks;
  const pct = (rateKg / body.weightKg) * 100;
  const maxPct = GAIN_MAX_PCT_WEEK[level];
  const status: FeasibilityStatus =
    pct <= maxPct * 0.75 ? 'comfortable' : pct <= maxPct ? 'moderate' : pct <= maxPct * 1.5 ? 'ambitious' : 'too_aggressive';
  const surplus = (r: number) => clamp(Math.round((r * KCAL_PER_KG) / 7), 150, 500);
  const safeRate = (body.weightKg * maxPct) / 100;
  const alternatives: GoalAlternative[] = [];
  if (status === 'ambitious' || status === 'too_aggressive') {
    const weeksA = Math.ceil(delta / safeRate);
    alternatives.push({
      id: 'safe_pace_same_target',
      title: `Llegar a ${targetWeightKg} kg con un ritmo que favorezca músculo sobre grasa`,
      description: `~${round2(safeRate)} kg/semana según tu nivel de experiencia.`,
      targetWeightKg,
      targetDate: addDays(startDate, weeksA * 7),
      weeklyChangeKg: round2(safeRate),
      calories: tdeeKcal + surplus(safeRate),
    });
    alternatives.push({
      id: 'same_date_intermediate_target',
      title: `Mantener la fecha con una meta de ${roundHalf(body.weightKg + safeRate * weeks)} kg`,
      description: 'Una ganancia más lenta suele implicar menos acumulación de grasa.',
      targetWeightKg: roundHalf(body.weightKg + safeRate * weeks),
      targetDate,
      weeklyChangeKg: round2(safeRate),
      calories: tdeeKcal + surplus(safeRate),
    });
    messages.push(
      status === 'too_aggressive'
        ? 'El objetivo podría ser demasiado agresivo: una ganancia tan rápida sería mayoritariamente grasa.'
        : 'Objetivo ambicioso para tu nivel de experiencia.',
    );
  } else {
    messages.push('Ritmo de ganancia razonable para tu nivel.');
  }
  const planRate = status === 'too_aggressive' ? safeRate : rateKg;
  return base(status, tdeeKcal + surplus(planRate), { alternatives });
}

// ---------------------------------------------------------------- fechas
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.UTC(...isoParts(fromIso));
  const b = Date.UTC(...isoParts(toIso));
  return Math.round((b - a) / 86_400_000);
}
export function addDays(iso: string, days: number): string {
  const [y, m, d] = isoParts(iso);
  return new Date(Date.UTC(y, m, d + days)).toISOString().slice(0, 10);
}
function isoParts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Fecha inválida: ${iso}`);
  return [y, m - 1, d];
}
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const roundHalf = (n: number) => Math.round(n * 2) / 2;
