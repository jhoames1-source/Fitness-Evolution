/**
 * RUTINA BASE DEL USUARIO DEMO: "Plan de entrenamiento American Line (Objetivo fitness)"
 * Transcrita manualmente desde la imagen aportada (docs/rutina-original-american-line.jpg).
 *
 * - La ORIGINAL se conserva sin eliminar nada (sec. 12 del requerimiento).
 * - Donde la imagen dice "x 8-16" sin número de series, se asumen 4 series según el pie de la
 *   tabla ("trabajo serio: 3–4 series, 8–12 reps") y se marca setsAssumed = true.
 * - La OPTIMIZADA mantiene la estructura (Piernas / Pecho+Bíceps / Espalda+Hombros+Tríceps ×2)
 *   y los ejercicios del usuario cuando es razonable.
 */
import type { RoutineChange, RoutineDay, RoutineTemplate } from '../../domain/training/routine';

// ------------------------------------------------------------------ ORIGINAL
const legsOriginal = (weekday: 1 | 4, withAbs: boolean): RoutineDay => ({
  weekday,
  title: 'Piernas',
  focus: ['quads', 'hamstrings', 'glutes', 'calves'],
  isRest: false,
  exercises: [
    { exerciseId: 'smith_squat', sets: 4, reps: [15, 15], sourceText: 'SENTADILLAS SMITH 4X15' },
    { exerciseId: 'leg_extension', sets: 4, reps: [12, 12], sourceText: 'EXTENSIONES DE PIERNAS 4X12' },
    { exerciseId: 'seated_leg_curl', sets: 4, reps: [12, 12], sourceText: 'CURL FEMORAL SENTADO 4X12' },
    { exerciseId: 'seated_calf_raise', sets: 5, reps: [20, 20], sourceText: 'PATORRILLA SENTADO 5 SERIES DE 20' },
    { exerciseId: 'standing_calf_raise', sets: 4, reps: [15, 15], sourceText: 'PANTORRILLA PARADO 4 SERIES DE 15' },
    { exerciseId: 'glute_machine', sets: 4, reps: [20, 20], sourceText: 'MAQUINA DE GLUTEOS 4X20' },
    { exerciseId: 'adductor_machine', sets: 4, reps: [15, 15], sourceText: 'ADUPTORES EN MAQUINA 4X15' },
    { exerciseId: 'hyperextension_45', sets: 4, reps: [20, 20], sourceText: 'HIPEREXTENCIONES 4X20' },
    ...(withAbs
      ? [{ exerciseId: 'crunch', sets: 10, reps: [20, 20] as [number, number], sourceText: '10 SERIES DE 20 DE CUALQUIER TIPO DE ABDOMEN', notes: '"Cualquier tipo de abdomen": se usa crunch como referencia.' }]
      : []),
    { exerciseId: 'walk_outdoor', sets: 1, reps: [20, 20], sourceText: 'CAMINATA MAXIMO 20 MIN' },
  ],
});

const chestOriginal = (weekday: 2 | 5): RoutineDay => {
  const fri = weekday === 5;
  return {
    weekday,
    title: 'Pecho + Bíceps + Abdomen',
    focus: ['chest', 'biceps', 'abs'],
    isRest: false,
    exercises: [
      { exerciseId: fri ? 'barbell_incline_press' : 'db_incline_press', sets: 4, reps: [8, 16], setsAssumed: true, sourceText: fri ? 'PECHO ALTO CON CABLE O BARRA X 8-16' : 'PECHO ALTO CON MANCUERNA X 8-16', notes: fri ? 'La imagen permite cable o barra.' : undefined },
      { exerciseId: fri ? 'barbell_decline_press' : 'db_decline_press', sets: 4, reps: [16, 16], sourceText: fri ? 'PECHO DECLINADO CON CABLE O BARRA 4X16' : 'PECHO DECLINADO CON MANCUERNA 4X16' },
      { exerciseId: fri ? 'barbell_bench_press' : 'db_bench_press', sets: 4, reps: [8, 16], setsAssumed: true, sourceText: fri ? 'PECHO PLANO CON CABLE O BARRA X 8-16' : 'PECHO PLANO CON MANCUERNA X 8-16' },
      { exerciseId: 'cable_crossover', sets: 4, reps: [8, 16], setsAssumed: true, sourceText: 'CRUCE CON POLEAS X 8-16' },
      { exerciseId: 'db_curl', sets: 4, reps: [8, 13], setsAssumed: true, sourceText: 'CURL DE BICES CON MANCUERNA X 8-13' },
      { exerciseId: 'barbell_curl', sets: 4, reps: [8, 16], setsAssumed: true, sourceText: 'CURL CON BARRA X 8-16' },
      { exerciseId: 'ez_preacher_curl', sets: 4, reps: [8, 16], setsAssumed: true, sourceText: 'CURL CON BARRA Z EN BANCO SCOT X 8-16' },
      fri
        ? { exerciseId: 'crunch', sets: 11, reps: [20, 20], sourceText: '11 SERIES DE 20 DE CUALQUIER TIPO DE ABDOMEN', notes: 'La imagen dice 11 series (posible errata de 10).' }
        : { exerciseId: 'crunch', sets: 10, reps: [20, 20], sourceText: '10 SERIES DE 20 DE CUALQUIER TIPO DE ABDOMEN' },
      ...(fri
        ? [
            { exerciseId: 'crunch', sets: 5, reps: [20, 20] as [number, number], setsAssumed: true, sourceText: 'INTERCOSTADOS 100', notes: 'Término ambiguo ("intercostados"); revisar con el usuario. 100 reps ≈ 5×20.' },
            { exerciseId: 'bicycle_crunch', sets: 5, reps: [20, 20] as [number, number], setsAssumed: true, sourceText: 'OBLICUOS 100', notes: '100 reps ≈ 5×20.' },
          ]
        : []),
    ],
  };
};

const backOriginal = (weekday: 3 | 6): RoutineDay => ({
  weekday,
  title: 'Espalda + Hombros + Tríceps',
  focus: ['back', 'shoulders', 'triceps'],
  isRest: false,
  exercises: [
    { exerciseId: 'lat_pulldown', sets: 4, reps: [16, 16], sourceText: 'JALON FRONTAL Y TRAS NUCA 4X16' },
    { exerciseId: 'behind_neck_pulldown', sets: 4, reps: [16, 16], sourceText: 'JALON FRONTAL Y TRAS NUCA 4X16' },
    { exerciseId: 'db_one_arm_row', sets: 4, reps: [16, 16], sourceText: 'SERRUCHO Y REMO CON MANCUERNA 4X16' },
    { exerciseId: 'db_bent_over_row', sets: 4, reps: [16, 16], sourceText: 'SERRUCHO Y REMO CON MANCUERNA 4X16' },
    { exerciseId: 'db_lateral_raise', sets: 3, reps: [13, 13], superset: 'A', sourceText: 'HOMBROS (SUPER): VUELOS LATERALES Y FRONTALES 3X13' },
    { exerciseId: 'db_front_raise', sets: 3, reps: [13, 13], superset: 'A', sourceText: 'HOMBROS (SUPER): VUELOS LATERALES Y FRONTALES 3X13' },
    { exerciseId: 'behind_neck_press', sets: 3, reps: [16, 16], sourceText: 'PRES TRAS NUCA 3X16' },
    { exerciseId: 'cable_pushdown_bar', sets: 3, reps: [13, 15], sourceText: 'JALON TRICEPS CON BARRA 3X15A13', notes: 'Pirámide 15→13 reps.' },
    { exerciseId: 'overhead_cable_extension', sets: 3, reps: [13, 15], sourceText: 'JALON TRICEPS TRAS NUCA 3X15A13' },
    { exerciseId: 'bike_hiit', sets: 1, reps: [30, 30], sourceText: '30 MINUTOS DE CARDIO HIT' },
  ],
});

const rest: RoutineDay = { weekday: 7, title: 'Descanso', focus: [], isRest: true, exercises: [] };

export const AMERICAN_LINE_ORIGINAL: RoutineTemplate = {
  id: 'american_line_original',
  name: 'Plan American Line (original)',
  source: 'imported_image',
  split: 'body_part',
  warmupMin: 12,
  generalNotes: [
    'Calentamiento de 10 a 15 minutos.',
    '4 a 5 ejercicios por músculo (espalda, pecho, piernas).',
    '3 a 4 ejercicios por músculo (hombros, brazos, pantorrilla, antebrazo).',
    'Dar prioridad a la técnica.',
    'Calentamiento: carga ligera-moderada, 2–3 series de 15.',
    'Trabajo serio: carga moderada-alta, 3–4 series de 8–12.',
  ],
  days: [legsOriginal(1, false), chestOriginal(2), backOriginal(3), legsOriginal(4, true), chestOriginal(5), backOriginal(6), rest],
};

// ------------------------------------------------------------------ OPTIMIZADA
export const AMERICAN_LINE_OPTIMIZED: RoutineTemplate = {
  id: 'american_line_optimized',
  name: 'Plan American Line (optimizado)',
  source: 'optimized',
  split: 'body_part',
  basedOn: 'american_line_original',
  warmupMin: 10,
  generalNotes: [
    'Calentamiento general de 5–10 min + 1–2 series de aproximación ligeras en el primer ejercicio de cada grupo.',
    'Progresión doble: cuando completes todas las series en el tope del rango con el RIR indicado, sube la carga 2.5–5 %.',
    'RIR = repeticiones que podrías hacer de más. RIR 2 = terminar la serie sintiendo que quedaban 2.',
    'Pasos diarios: objetivo 8 000–10 000. Es la forma de gasto extra que menos interfiere con la recuperación.',
    'Si el rendimiento cae 2 semanas seguidas, o el sueño o la energía empeoran, hacer una semana de descarga (−40 % de series).',
    'Dar prioridad a la técnica.',
  ],
  days: [
    {
      weekday: 1, title: 'Piernas A (cuádriceps)', focus: ['quads', 'hamstrings', 'glutes', 'calves'], isRest: false,
      exercises: [
        { exerciseId: 'smith_squat', sets: 4, reps: [8, 12], rir: [1, 3], restSec: 150 },
        { exerciseId: 'db_romanian_deadlift', sets: 3, reps: [8, 10], rir: [2, 3], restSec: 150 },
        { exerciseId: 'leg_extension', sets: 3, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'seated_leg_curl', sets: 3, reps: [10, 12], rir: [1, 2] },
        { exerciseId: 'glute_machine', sets: 3, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'adductor_machine', sets: 2, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'standing_calf_raise', sets: 4, reps: [10, 15], rir: [1, 2], restSec: 60 },
        { exerciseId: 'walk_outdoor', sets: 1, reps: [15, 20], notes: 'Suave, para recuperar.' },
      ],
    },
    {
      weekday: 2, title: 'Pecho + Bíceps + Core', focus: ['chest', 'biceps', 'core'], isRest: false,
      exercises: [
        { exerciseId: 'db_incline_press', sets: 4, reps: [8, 12], rir: [1, 3], restSec: 150 },
        { exerciseId: 'db_bench_press', sets: 3, reps: [8, 12], rir: [1, 3], restSec: 150 },
        { exerciseId: 'cable_crossover', sets: 3, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'db_curl', sets: 3, reps: [8, 12], rir: [1, 2] },
        { exerciseId: 'ez_preacher_curl', sets: 3, reps: [10, 12], rir: [1, 2] },
        { exerciseId: 'cable_crunch', sets: 3, reps: [10, 15], rir: [1, 2] },
        { exerciseId: 'plank', sets: 3, reps: [30, 45] },
      ],
    },
    {
      weekday: 3, title: 'Espalda + Hombros + Tríceps', focus: ['back', 'shoulders', 'triceps'], isRest: false,
      exercises: [
        { exerciseId: 'lat_pulldown', sets: 4, reps: [8, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'db_one_arm_row', sets: 3, reps: [8, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'db_bent_over_row', sets: 3, reps: [10, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'db_shoulder_press', sets: 3, reps: [8, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'db_lateral_raise', sets: 3, reps: [12, 15], rir: [0, 2], superset: 'A' },
        { exerciseId: 'face_pull', sets: 3, reps: [12, 15], rir: [1, 2], superset: 'A' },
        { exerciseId: 'cable_pushdown_bar', sets: 3, reps: [10, 15], rir: [1, 2] },
        { exerciseId: 'overhead_cable_extension', sets: 3, reps: [10, 15], rir: [1, 2] },
        { exerciseId: 'bike_hiit', sets: 1, reps: [15, 20], notes: '8–10 × (30 s intenso / 90 s suave). Si estás cansado, cambia a 25–30 min de cardio suave.' },
      ],
    },
    {
      weekday: 4, title: 'Piernas B (isquios y glúteos)', focus: ['hamstrings', 'glutes', 'quads', 'calves'], isRest: false,
      exercises: [
        { exerciseId: 'leg_press', sets: 4, reps: [10, 12], rir: [1, 3], restSec: 150 },
        { exerciseId: 'hyperextension_45', sets: 3, reps: [12, 15], rir: [1, 3], notes: 'Añade un disco cuando 15 reps sean fáciles.' },
        { exerciseId: 'lying_leg_curl', sets: 3, reps: [10, 12], rir: [1, 2] },
        { exerciseId: 'leg_extension', sets: 2, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'glute_machine', sets: 3, reps: [10, 15], rir: [1, 2] },
        { exerciseId: 'adductor_machine', sets: 2, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'seated_calf_raise', sets: 4, reps: [15, 20], rir: [1, 2], restSec: 60 },
        { exerciseId: 'hanging_knee_raise', sets: 3, reps: [8, 15] },
        { exerciseId: 'side_plank', sets: 2, reps: [30, 45], notes: 'Por lado.' },
        { exerciseId: 'walk_outdoor', sets: 1, reps: [15, 20] },
      ],
    },
    {
      weekday: 5, title: 'Pecho + Bíceps + Core (variante)', focus: ['chest', 'biceps', 'core'], isRest: false,
      exercises: [
        { exerciseId: 'barbell_bench_press', sets: 4, reps: [6, 10], rir: [1, 3], restSec: 180 },
        { exerciseId: 'barbell_incline_press', sets: 3, reps: [8, 12], rir: [1, 3], restSec: 150, notes: 'O press inclinado en polea/máquina.' },
        { exerciseId: 'cable_high_to_low_fly', sets: 3, reps: [12, 15], rir: [1, 2], notes: 'Sustituye al press declinado (porción inferior del pecho).' },
        { exerciseId: 'barbell_curl', sets: 3, reps: [8, 12], rir: [1, 2] },
        { exerciseId: 'hammer_curl', sets: 2, reps: [10, 15], rir: [1, 2] },
        { exerciseId: 'pallof_press', sets: 3, reps: [10, 12], notes: 'Por lado. Trabaja oblicuos sin cientos de repeticiones.' },
        { exerciseId: 'dead_bug', sets: 3, reps: [8, 12] },
      ],
    },
    {
      weekday: 6, title: 'Espalda + Hombros + Tríceps (variante)', focus: ['back', 'shoulders', 'triceps'], isRest: false,
      exercises: [
        { exerciseId: 'neutral_grip_pulldown', sets: 4, reps: [8, 12], rir: [1, 3], restSec: 120, notes: 'O dominadas asistidas.' },
        { exerciseId: 'seated_cable_row', sets: 3, reps: [10, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'db_one_arm_row', sets: 3, reps: [10, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'machine_shoulder_press', sets: 3, reps: [10, 12], rir: [1, 3], restSec: 120 },
        { exerciseId: 'cable_lateral_raise', sets: 3, reps: [12, 15], rir: [0, 2], superset: 'A' },
        { exerciseId: 'reverse_pec_deck', sets: 3, reps: [12, 15], rir: [1, 2], superset: 'A' },
        { exerciseId: 'rope_pushdown', sets: 3, reps: [12, 15], rir: [1, 2] },
        { exerciseId: 'db_overhead_extension', sets: 2, reps: [10, 12], rir: [1, 2] },
        { exerciseId: 'stationary_bike_liss', sets: 1, reps: [20, 30], notes: 'Cardio suave; HIIT solo si la recuperación es buena.' },
      ],
    },
    { ...rest, title: 'Descanso (caminata ligera opcional)' },
  ],
};

export const AMERICAN_LINE_CHANGES: RoutineChange[] = [
  { day: 'all', type: 'adjust_reps', before: 'Básicos a 15–16 reps', after: 'Básicos a 6–12 reps con RIR 1–3', category: 'eficacia', reason: 'En déficit calórico, la señal más importante para conservar el músculo es mantener cargas altas. Coincide con la propia indicación de la tabla: "trabajo serio 8–12".' },
  { day: 3, type: 'replace', before: 'Jalón tras nuca', after: 'Jalón al pecho / agarre neutro', category: 'seguridad', reason: 'Trabaja el dorsal igual que el jalón frontal, pero fuerza la rotación externa del hombro y adelanta la cabeza. No aporta ventaja y tiene más riesgo.' },
  { day: 3, type: 'replace', before: 'Press tras nuca', after: 'Press de hombro con mancuernas (sáb.: en máquina)', category: 'seguridad', reason: 'El press frontal da el mismo estímulo con menos estrés en el hombro.' },
  { day: 3, type: 'replace', before: 'Elevaciones frontales', after: 'Face pull (sáb.: pájaros en máquina)', category: 'equilibrio', reason: 'El deltoides anterior ya recibe mucho trabajo en los presses (~20 series de pecho a la semana). El posterior no tenía trabajo directo, y es importante para la postura y la salud del hombro.' },
  { day: 1, type: 'add', after: 'Peso muerto rumano con mancuernas', category: 'equilibrio', reason: 'La rutina no tenía ninguna bisagra de cadera. Los isquiotibiales solo recibían el curl femoral.' },
  { day: 4, type: 'replace', before: 'Sentadilla Smith (repetida)', after: 'Prensa de piernas + curl tumbado', category: 'eficacia', reason: 'Variar el estímulo entre los dos días de pierna reparte la fatiga articular y aporta un ángulo distinto.' },
  { day: 'all', type: 'adjust_volume', before: 'Pecho: 4 ejercicios × 4 series (~32 series/semana)', after: '3 ejercicios (~20 series/semana)', category: 'recuperación', reason: 'Más de ~20–25 series semanales rara vez añade beneficio y compromete la recuperación en déficit.' },
  { day: 5, type: 'replace', before: 'Press declinado con barra', after: 'Cruce de poleas de arriba a abajo', category: 'eficacia', reason: 'Trabaja la porción inferior del pecho con menos fatiga, ya que el press plano cubre casi todo el músculo.' },
  { day: 'all', type: 'adjust_volume', before: 'Bíceps: 3 ejercicios × 4 series (24/semana)', after: '2 ejercicios × 3 series (~11/semana + remos)', category: 'volumen', reason: 'Los remos y jalones ya trabajan el bíceps. El volumen original superaba al de espalda en proporción.' },
  { day: 'all', type: 'replace', before: 'Abdomen 10–11 × 20 + "oblicuos 100" + "intercostados 100"', after: '4–6 series variadas (crunch en polea, plancha, Pallof, elevaciones)', category: 'eficacia', reason: 'La grasa abdominal no se reduce con abdominales: depende del déficit calórico total. Para la fuerza del core bastan pocas series variadas y con carga.' },
  { day: 3, type: 'adjust_cardio', before: 'HIIT 30 min (miércoles y sábado)', after: 'HIIT 15–20 min el miércoles; cardio suave el sábado', category: 'recuperación', reason: 'Un HIIT real no se sostiene 30 minutos. Dos sesiones intensas además de 6 días de pesas en déficit aumentan el riesgo de fatiga acumulada.' },
  { day: 1, type: 'adjust_cardio', before: 'Caminata máximo 20 min', after: 'Caminata 15–20 min + objetivo de 8 000–10 000 pasos diarios', category: 'eficacia', reason: 'Caminar más a lo largo del día aumenta el gasto con muy poca fatiga. No hay motivo para limitarlo.' },
  { day: 'all', type: 'adjust_volume', before: 'Pantorrillas 9 series por sesión', after: '4 series por sesión con pausa abajo', category: 'tiempo', reason: 'Menos series con rango completo y pausa dan un estímulo comparable y ahorran tiempo.' },
  { day: 'all', type: 'adjust_volume', before: 'Sesiones estimadas de 95–110 min', after: '~65–80 min', category: 'tiempo', reason: 'Sesiones más cortas son más fáciles de sostener 6 días por semana y facilitan la adherencia.' },
];
