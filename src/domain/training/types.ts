export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'adductors'
  | 'calves'
  | 'abs'
  | 'core'
  | 'forearms'
  | 'cardio';

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quads: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  glutes: 'Glúteos',
  adductors: 'Aductores',
  calves: 'Pantorrillas',
  abs: 'Abdomen',
  core: 'Core',
  forearms: 'Antebrazos',
  cardio: 'Cardio',
};

export type Equipment =
  | 'barbell'
  | 'ez_bar'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'smith'
  | 'bench'
  | 'pullup_bar'
  | 'band'
  | 'bodyweight'
  | 'cardio_machine';

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  ez_bar: 'Barra Z',
  dumbbell: 'Mancuernas',
  kettlebell: 'Kettlebell',
  cable: 'Polea',
  machine: 'Máquina',
  smith: 'Máquina Smith',
  bench: 'Banco',
  pullup_bar: 'Barra de dominadas',
  band: 'Bandas',
  bodyweight: 'Peso corporal',
  cardio_machine: 'Máquina de cardio',
};

export type MovementPattern =
  | 'squat'
  | 'knee_extension'
  | 'knee_flexion'
  | 'hip_hinge'
  | 'hip_extension'
  | 'hip_adduction'
  | 'calf_raise'
  | 'horizontal_push'
  | 'incline_push'
  | 'decline_push'
  | 'chest_fly'
  | 'vertical_pull'
  | 'horizontal_pull'
  | 'rear_delt'
  | 'vertical_push'
  | 'lateral_raise'
  | 'front_raise'
  | 'elbow_flexion'
  | 'elbow_extension'
  | 'spinal_flexion'
  | 'anti_extension'
  | 'anti_rotation'
  | 'lateral_flexion'
  | 'hip_flexion'
  | 'cardio_liss'
  | 'cardio_hiit';

/** Motivo por el que el usuario pide una alternativa. */
export type SwapReason = 'machine_busy' | 'dumbbells_busy' | 'barbell_busy' | 'cable_busy' | 'pain' | 'no_equipment';

export const SWAP_REASON_LABELS: Record<SwapReason, string> = {
  machine_busy: 'Máquina ocupada',
  dumbbells_busy: 'Mancuernas ocupadas',
  barbell_busy: 'Barra ocupada',
  cable_busy: 'Polea ocupada',
  pain: 'Dolor / molestia',
  no_equipment: 'No tengo equipamiento',
};

export interface Exercise {
  id: string;
  name: string;
  primary: MuscleGroup;
  secondary: MuscleGroup[];
  /** Todo el equipamiento necesario (bodyweight = nada) */
  equipment: Equipment[];
  level: 'beginner' | 'intermediate' | 'advanced';
  pattern: MovementPattern;
  sets: [number, number];
  reps: [number, number];
  /** Repeticiones en reserva recomendadas */
  rir: [number, number];
  restSec: number;
  /** 1 = baja carga articular · 3 = alta (orienta las alternativas por dolor) */
  jointStress: 1 | 2 | 3;
  technique: string[];
  commonErrors: string[];
  /** Alternativas curadas (ids). El motor añade otras por patrón y grupo muscular. */
  alternatives: string[];
  /** Ejercicio por tiempo (s) en lugar de repeticiones */
  timed?: boolean;
  mediaUrl?: string | null;
  notes?: string;
}
