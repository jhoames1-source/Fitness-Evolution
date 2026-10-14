/**
 * Análisis de una rutina: volumen semanal por músculo, frecuencia, duración estimada
 * y advertencias. Se usa para comparar "rutina original vs optimizada".
 *
 * Referencias de volumen (series efectivas/músculo/semana): ~10–20 es un rango habitual
 * para hipertrofia en personas entrenadas (Schoenfeld 2017; Baz-Valle 2022).
 * Los músculos secundarios cuentan 0.5 series.
 */
import type { Exercise, MuscleGroup } from './types';
import type { RoutineTemplate } from './routine';

export interface RoutineAnalysis {
  weeklySets: Partial<Record<MuscleGroup, number>>;
  frequency: Partial<Record<MuscleGroup, number>>;
  sessionMinutes: { weekday: number; title: string; minutes: number; workingSets: number }[];
  trainingDays: number;
  warnings: string[];
}

const SECONDS_PER_SET = 40;
const VOLUME_RANGE: [number, number] = [10, 22];
const TRACKED: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves'];

export function analyzeRoutine(r: RoutineTemplate, getExercise: (id: string) => Exercise): RoutineAnalysis {
  const weeklySets: Partial<Record<MuscleGroup, number>> = {};
  const freqDays: Partial<Record<MuscleGroup, Set<number>>> = {};
  const sessionMinutes: RoutineAnalysis['sessionMinutes'] = [];
  const warnings: string[] = [];

  for (const day of r.days) {
    if (day.isRest) continue;
    let seconds = r.warmupMin * 60;
    let workingSets = 0;
    const seenSuperset = new Set<string>();
    for (const item of day.exercises) {
      const ex = getExercise(item.exerciseId);
      if (ex.primary === 'cardio') {
        seconds += item.reps[1] * 60;
        continue;
      }
      workingSets += item.sets;
      const rest = item.restSec ?? ex.restSec;
      // En superserie el descanso se comparte entre los dos ejercicios.
      const restFactor = item.superset ? (seenSuperset.has(item.superset) ? 1 : 0.25) : 1;
      if (item.superset) seenSuperset.add(item.superset);
      seconds += item.sets * (SECONDS_PER_SET + rest * restFactor);

      add(weeklySets, ex.primary, item.sets);
      (freqDays[ex.primary] ??= new Set()).add(day.weekday);
      for (const m of ex.secondary) add(weeklySets, m, item.sets * 0.5);
    }
    sessionMinutes.push({ weekday: day.weekday, title: day.title, minutes: Math.round(seconds / 60), workingSets });
  }

  const frequency: Partial<Record<MuscleGroup, number>> = {};
  for (const [m, s] of Object.entries(freqDays)) frequency[m as MuscleGroup] = s!.size;

  for (const m of TRACKED) {
    const v = weeklySets[m] ?? 0;
    if (v < VOLUME_RANGE[0]) warnings.push(`Volumen bajo para ${m}: ${v} series/semana.`);
    if (v > VOLUME_RANGE[1] + 8) warnings.push(`Volumen muy alto para ${m}: ${v} series/semana; puede comprometer la recuperación.`);
  }
  const push = (weeklySets.chest ?? 0);
  const pull = (weeklySets.back ?? 0);
  if (push > 0 && pull / push < 0.8) warnings.push('Más volumen de empuje que de tirón: conviene equilibrar con trabajo de espalda.');
  for (const s of sessionMinutes) {
    if (s.minutes > 90) warnings.push(`${s.title}: sesión estimada de ${s.minutes} min.`);
  }

  return { weeklySets: roundAll(weeklySets), frequency, sessionMinutes, trainingDays: sessionMinutes.length, warnings };
}

function add(rec: Partial<Record<MuscleGroup, number>>, m: MuscleGroup, n: number) {
  rec[m] = (rec[m] ?? 0) + n;
}
function roundAll(rec: Partial<Record<MuscleGroup, number>>) {
  for (const k of Object.keys(rec) as MuscleGroup[]) rec[k] = Math.round(rec[k]! * 10) / 10;
  return rec;
}
