import type { MuscleGroup } from './types';

/** 1 = lunes … 7 = domingo (ISO-8601) */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAY_LABELS: Record<IsoWeekday, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  /** Rango de repeticiones, o minutos/segundos si el ejercicio es por tiempo */
  reps: [number, number];
  rir?: [number, number];
  restSec?: number;
  /** Ejercicios con la misma etiqueta se hacen en superserie */
  superset?: string;
  notes?: string;
  /** true si el número de series no estaba en la fuente y se asumió */
  setsAssumed?: boolean;
  /** Texto original de la fuente (imagen/OCR) para trazabilidad */
  sourceText?: string;
}

export interface RoutineDay {
  weekday: IsoWeekday;
  title: string;
  focus: MuscleGroup[];
  isRest: boolean;
  exercises: RoutineExercise[];
}

export type SplitType = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part' | 'custom';

export interface RoutineTemplate {
  id: string;
  name: string;
  source: 'imported_image' | 'generated' | 'manual' | 'optimized';
  split: SplitType;
  /** id de la rutina de la que deriva (p. ej. original → optimizada) */
  basedOn?: string;
  warmupMin: number;
  generalNotes: string[];
  days: RoutineDay[];
}

export interface RoutineChange {
  day: IsoWeekday | 'all';
  type: 'replace' | 'add' | 'remove' | 'adjust_volume' | 'adjust_reps' | 'adjust_cardio';
  before?: string;
  after?: string;
  reason: string;
  category: 'seguridad' | 'equilibrio' | 'volumen' | 'recuperación' | 'eficacia' | 'tiempo';
}
