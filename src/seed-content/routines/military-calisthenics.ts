/**
 * PROGRAMA DE CALISTENIA MILITAR / TÁCTICA
 * Inspirado e integrado a partir de la ingeniería inversa de "Desafío 21" (WebAPK Calistenia).
 * Diseñado específicamente para entrenar sin máquinas ni gimnasio (peso corporal y barra de dominadas).
 * Enfoque: Fuerza relativa, resistencia muscular, acondicionamiento físico militar y pérdida de grasa.
 */
import type { RoutineDay, RoutineTemplate } from '../../domain/training/routine';

const day1PushTactical: RoutineDay = {
  weekday: 1,
  title: 'Calistenia Militar: Empuje y Potencia Pectoral',
  focus: ['chest', 'triceps', 'shoulders', 'core'],
  isRest: false,
  exercises: [
    { exerciseId: 'push_up', sets: 5, reps: [15, 25], restSec: 60, notes: 'Cadencia militar controlada (2s bajada, 1s pausa, 1s subida explosiva).' },
    { exerciseId: 'decline_push_up', sets: 4, reps: [12, 18], restSec: 60, notes: 'Pies sobre banco, silla o escalón para enfatizar haz clavicular.' },
    { exerciseId: 'diamond_push_up', sets: 4, reps: [10, 15], restSec: 60, notes: 'Manos juntas, enfoque en tríceps y porción esternal.' },
    { exerciseId: 'pike_push_up', sets: 4, reps: [8, 12], restSec: 75, notes: 'Empuje vertical para fuerza de deltoides y hombro militar.' },
    { exerciseId: 'bench_dip', sets: 3, reps: [15, 20], restSec: 45, notes: 'Fondos en silla o banco.' },
    { exerciseId: 'plank', sets: 4, reps: [45, 60], restSec: 45, notes: 'Plancha isométrica abdominal con bloqueo pélvico.' },
  ],
};

const day2PullTactical: RoutineDay = {
  weekday: 2,
  title: 'Calistenia Militar: Tracción y Resistencia Dorsal',
  focus: ['back', 'biceps', 'core'],
  isRest: false,
  exercises: [
    { exerciseId: 'pull_up', sets: 5, reps: [6, 12], restSec: 90, notes: 'Dominadas estrictas tácticas. Barbilla sobre barra sin kipping.' },
    { exerciseId: 'chin_up', sets: 4, reps: [6, 10], restSec: 90, notes: 'Dominadas supinas con énfasis en bíceps y dorsal ancho.' },
    { exerciseId: 'inverted_row', sets: 4, reps: [10, 15], restSec: 60, notes: 'Remo australiano/invertido bajo barra baja o mesa resistente.' },
    { exerciseId: 'hanging_knee_raise', sets: 4, reps: [12, 16], restSec: 60, notes: 'Elevación de rodillas colgado en barra para flexores de cadera y abdomen.' },
    { exerciseId: 'dead_bug', sets: 3, reps: [12, 15], restSec: 45, notes: 'Control lumbopélvico y estabilidad anti-extensión.' },
  ],
};

const day3LegsConditioning: RoutineDay = {
  weekday: 3,
  title: 'Calistenia Militar: Piernas y Acondicionamiento Operativo',
  focus: ['quads', 'hamstrings', 'glutes', 'calves', 'cardio'],
  isRest: false,
  exercises: [
    { exerciseId: 'walking_lunge', sets: 4, reps: [20, 30], restSec: 60, notes: 'Zancadas militares continuas (10-15 por pierna).' },
    { exerciseId: 'bodyweight_squat', sets: 4, reps: [20, 30], restSec: 60, notes: 'Sentadilla libre con ritmo sostenido.' },
    { exerciseId: 'bulgarian_split_squat', sets: 3, reps: [12, 15], restSec: 60, notes: 'Fuerza unilateral de cuádriceps y glúteo.' },
    { exerciseId: 'single_leg_rdl', sets: 3, reps: [10, 12], restSec: 45, notes: 'Bisagra unipodal para equilibrio e isquiotibiales.' },
    { exerciseId: 'single_leg_calf_raise', sets: 4, reps: [20, 25], restSec: 45, notes: 'Elevación de talones en escalón.' },
    { exerciseId: 'bodyweight_hiit', sets: 1, reps: [15, 20], restSec: 0, notes: 'Circuito militar: Burpees + Jumping Jacks + Mountain Climbers.' },
  ],
};

const day4RestRecovery: RoutineDay = {
  weekday: 4,
  title: 'Recuperación Activa Militar y Movilidad',
  focus: ['cardio', 'core'],
  isRest: true,
  exercises: [
    { exerciseId: 'walk_outdoor', sets: 1, reps: [30, 45], notes: 'Marcha continua a paso ligero (ritmo zona 2 para regeneración celular).' },
  ],
};

const day5FullTacticalChallenge: RoutineDay = {
  weekday: 5,
  title: 'Desafío 21: Full-Body Calistenia Táctica',
  focus: ['chest', 'back', 'quads', 'core'],
  isRest: false,
  exercises: [
    { exerciseId: 'pull_up', sets: 4, reps: [5, 10], restSec: 75, notes: 'Tracción vertical estricta.' },
    { exerciseId: 'push_up', sets: 4, reps: [15, 25], restSec: 60, notes: 'Flexiones militares estándar.' },
    { exerciseId: 'bodyweight_squat', sets: 4, reps: [25, 30], restSec: 60, notes: 'Volumen alto de piernas.' },
    { exerciseId: 'sissy_squat', sets: 3, reps: [10, 12], restSec: 60, notes: 'Extensión cuádriceps corporal.' },
    { exerciseId: 'hanging_knee_raise', sets: 4, reps: [10, 15], restSec: 45, notes: 'Abdomen en suspensión.' },
    { exerciseId: 'bodyweight_hiit', sets: 1, reps: [15, 20], notes: 'Intervalos tácticamente demandantes.' },
  ],
};

const day6CoreGripTactical: RoutineDay = {
  weekday: 6,
  title: 'Calistenia Militar: Núcleo, Agarre y Resistencia',
  focus: ['abs', 'core', 'biceps', 'cardio'],
  isRest: false,
  exercises: [
    { exerciseId: 'chin_up', sets: 4, reps: [6, 10], restSec: 75, notes: 'Enfoque en fuerza de tracción y antebrazos.' },
    { exerciseId: 'inverted_row', sets: 3, reps: [12, 15], restSec: 60, notes: 'Volumen dorsal horizontal.' },
    { exerciseId: 'plank', sets: 3, reps: [60, 90], restSec: 45, notes: 'Plancha militar extendida.' },
    { exerciseId: 'side_plank', sets: 3, reps: [30, 45], restSec: 45, notes: 'Por lado.' },
    { exerciseId: 'bicycle_crunch', sets: 3, reps: [20, 25], restSec: 45, notes: 'Coordinación y oblicuos.' },
    { exerciseId: 'walk_outdoor', sets: 1, reps: [25, 35], notes: 'Caminata de enfriamiento operativo.' },
  ],
};

const day7Rest: RoutineDay = {
  weekday: 7,
  title: 'Descanso Total Operativo',
  focus: [],
  isRest: true,
  exercises: [],
};

export const MILITARY_CALISTHENICS_ROUTINE: RoutineTemplate = {
  id: 'military_calisthenics_routine',
  name: 'Calistenia Militar — Desafío Táctico (Sin Gimnasio)',
  source: 'generated',
  split: 'custom',
  warmupMin: 10,
  generalNotes: [
    'Programa de acondicionamiento y fuerza corporal pura derivado de la ingeniería inversa de Desafío 21.',
    'No requiere gimnasio ni pesas. Solo necesitas tu propio peso corporal y una barra de dominadas o parque.',
    'Excelente tanto para pérdida de grasa acelerada como para acondicionamiento funcional extremo.',
    'Control de cadencia: cada repetición se ejecuta con bloqueo articular limpio y sin balanceos tramposos.',
    'Hidratación recomendada: mínimo 2.5 a 3.0 litros diarios.',
  ],
  days: [
    day1PushTactical,
    day2PullTactical,
    day3LegsConditioning,
    day4RestRecovery,
    day5FullTacticalChallenge,
    day6CoreGripTactical,
    day7Rest,
  ],
};
