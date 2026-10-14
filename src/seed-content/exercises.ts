/**
 * CATÁLOGO BASE DE EJERCICIOS (contenido propio, no copiado de terceros).
 * Se sincroniza como catálogo global; el admin podrá editarlo y los usuarios crear los suyos.
 * mediaUrl queda en null hasta incorporar contenido multimedia propio.
 */
import type { Equipment, Exercise, MovementPattern, MuscleGroup } from '../domain/training/types';

type Opts = Partial<Omit<Exercise, 'id' | 'name' | 'primary' | 'secondary' | 'equipment' | 'pattern'>>;

function e(
  id: string,
  name: string,
  primary: MuscleGroup,
  secondary: MuscleGroup[],
  equipment: Equipment[],
  pattern: MovementPattern,
  o: Opts = {},
): Exercise {
  return {
    id,
    name,
    primary,
    secondary,
    equipment,
    pattern,
    level: o.level ?? 'beginner',
    sets: o.sets ?? [3, 4],
    reps: o.reps ?? [8, 12],
    rir: o.rir ?? [1, 3],
    restSec: o.restSec ?? 90,
    jointStress: o.jointStress ?? 2,
    technique: o.technique ?? [],
    commonErrors: o.commonErrors ?? [],
    alternatives: o.alternatives ?? [],
    timed: o.timed,
    mediaUrl: null,
    notes: o.notes,
  };
}

const COMPOUND = { restSec: 150, rir: [1, 3] as [number, number] };
const ISO = { restSec: 75, reps: [10, 15] as [number, number] };

export const EXERCISES: Exercise[] = [
  // ======================= CUÁDRICEPS / SENTADILLA
  e('smith_squat', 'Sentadilla en máquina Smith', 'quads', ['glutes', 'adductors'], ['smith'], 'squat', {
    ...COMPOUND, jointStress: 2,
    technique: ['Pies ligeramente adelantados respecto a la barra', 'Bajar controlado hasta donde mantengas la espalda neutra', 'Empujar con todo el pie'],
    commonErrors: ['Rodillas que colapsan hacia dentro', 'Rebotar abajo', 'Levantar los talones'],
    alternatives: ['leg_press', 'goblet_squat', 'back_squat', 'hack_squat', 'bodyweight_squat'],
  }),
  e('back_squat', 'Sentadilla con barra', 'quads', ['glutes', 'adductors', 'core'], ['barbell'], 'squat', {
    ...COMPOUND, level: 'intermediate', jointStress: 3, reps: [5, 10],
    technique: ['Barra sobre trapecios, abdomen firme', 'Rodillas siguen la dirección de los pies', 'Profundidad según movilidad'],
    commonErrors: ['Redondear la zona lumbar', 'Desplazar el peso a la punta de los pies'],
    alternatives: ['smith_squat', 'leg_press', 'goblet_squat'],
  }),
  e('leg_press', 'Prensa de piernas', 'quads', ['glutes', 'adductors'], ['machine'], 'squat', {
    ...COMPOUND, reps: [10, 15], jointStress: 1,
    technique: ['Espalda y glúteos pegados al respaldo', 'Bajar hasta ~90° de rodilla sin despegar la pelvis'],
    commonErrors: ['Bloquear rodillas arriba', 'Despegar la pelvis al bajar'],
    alternatives: ['hack_squat', 'smith_squat', 'goblet_squat'],
  }),
  e('hack_squat', 'Sentadilla hack', 'quads', ['glutes'], ['machine'], 'squat', {
    ...COMPOUND, level: 'intermediate',
    technique: ['Espalda apoyada', 'Bajar controlado'], commonErrors: ['Rango corto'],
    alternatives: ['leg_press', 'smith_squat'],
  }),
  e('goblet_squat', 'Sentadilla goblet con mancuerna', 'quads', ['glutes', 'core'], ['dumbbell'], 'squat', {
    reps: [10, 15], jointStress: 1,
    technique: ['Mancuerna pegada al pecho', 'Codos entre las rodillas al bajar'],
    commonErrors: ['Inclinar el tronco en exceso'],
    alternatives: ['bodyweight_squat', 'leg_press', 'bulgarian_split_squat'],
  }),
  e('bulgarian_split_squat', 'Sentadilla búlgara', 'quads', ['glutes'], ['dumbbell', 'bench'], 'squat', {
    level: 'intermediate', reps: [8, 12],
    technique: ['Pie trasero apoyado en banco', 'Tronco ligeramente inclinado'], commonErrors: ['Paso demasiado corto'],
    alternatives: ['walking_lunge', 'goblet_squat'],
  }),
  e('walking_lunge', 'Zancadas caminando', 'quads', ['glutes', 'hamstrings'], ['bodyweight'], 'squat', {
    reps: [10, 16], technique: ['Paso largo y controlado', 'Rodilla trasera cerca del suelo'], commonErrors: ['Rodilla delantera hacia dentro'],
    alternatives: ['bulgarian_split_squat', 'bodyweight_squat'],
  }),
  e('bodyweight_squat', 'Sentadilla con peso corporal', 'quads', ['glutes'], ['bodyweight'], 'squat', {
    reps: [15, 25], jointStress: 1, rir: [1, 2],
    technique: ['Tempo lento (3 s bajada) para aumentar la dificultad'], commonErrors: ['Rango parcial'],
    alternatives: ['walking_lunge', 'goblet_squat'],
  }),

  // ======================= EXTENSIÓN DE RODILLA
  e('leg_extension', 'Extensión de piernas en máquina', 'quads', [], ['machine'], 'knee_extension', {
    ...ISO, jointStress: 2,
    technique: ['Rodilla alineada con el eje de la máquina', 'Pausa de 1 s arriba'],
    commonErrors: ['Balancear el cuerpo', 'Bajar sin control'],
    alternatives: ['sissy_squat', 'band_knee_extension', 'goblet_squat'],
  }),
  e('sissy_squat', 'Sissy squat asistida', 'quads', [], ['bodyweight'], 'knee_extension', {
    ...ISO, level: 'intermediate', jointStress: 2,
    technique: ['Sujétate a un soporte', 'Rodillas hacia delante, cadera extendida'], commonErrors: ['Bajar demasiado sin control'],
    alternatives: ['leg_extension', 'band_knee_extension'],
  }),
  e('band_knee_extension', 'Extensión de rodilla con banda', 'quads', [], ['band'], 'knee_extension', {
    ...ISO, reps: [15, 20], jointStress: 1,
    technique: ['Banda anclada detrás, tobillo dentro de la banda'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['leg_extension', 'sissy_squat'],
  }),

  // ======================= FLEXIÓN DE RODILLA (ISQUIOS)
  e('seated_leg_curl', 'Curl femoral sentado', 'hamstrings', ['calves'], ['machine'], 'knee_flexion', {
    ...ISO, reps: [10, 12], jointStress: 1,
    technique: ['Inclina el tronco ligeramente hacia delante para estirar más el isquio', 'Controla la fase de vuelta'],
    commonErrors: ['Levantar la cadera del asiento'],
    alternatives: ['lying_leg_curl', 'db_leg_curl', 'nordic_curl', 'band_leg_curl'],
  }),
  e('lying_leg_curl', 'Curl femoral tumbado', 'hamstrings', ['calves'], ['machine'], 'knee_flexion', {
    ...ISO, reps: [10, 12], jointStress: 1,
    technique: ['Cadera pegada al banco'], commonErrors: ['Arquear la zona lumbar'],
    alternatives: ['seated_leg_curl', 'db_leg_curl', 'band_leg_curl'],
  }),
  e('db_leg_curl', 'Curl femoral con mancuerna', 'hamstrings', [], ['dumbbell', 'bench'], 'knee_flexion', {
    ...ISO, technique: ['Mancuerna entre los pies, tumbado boca abajo'], commonErrors: ['Perder la mancuerna por falta de agarre'],
    alternatives: ['lying_leg_curl', 'band_leg_curl'],
  }),
  e('nordic_curl', 'Curl nórdico (excéntrico)', 'hamstrings', ['glutes'], ['bodyweight'], 'knee_flexion', {
    level: 'advanced', reps: [4, 8], restSec: 120, jointStress: 2,
    technique: ['Talones fijados, bajar lo más lento posible', 'Ayúdate con las manos al final'],
    commonErrors: ['Flexionar la cadera'],
    alternatives: ['seated_leg_curl', 'band_leg_curl'],
  }),
  e('band_leg_curl', 'Curl femoral con banda', 'hamstrings', [], ['band'], 'knee_flexion', {
    ...ISO, reps: [15, 20], jointStress: 1,
    technique: ['Banda anclada delante, boca abajo'], commonErrors: ['Rango corto'],
    alternatives: ['seated_leg_curl', 'db_leg_curl'],
  }),

  // ======================= BISAGRA DE CADERA
  e('db_romanian_deadlift', 'Peso muerto rumano con mancuernas', 'hamstrings', ['glutes', 'back'], ['dumbbell'], 'hip_hinge', {
    ...COMPOUND, reps: [8, 12],
    technique: ['Rodillas ligeramente flexionadas y fijas', 'Llevar la cadera atrás con la espalda neutra', 'Mancuernas pegadas a las piernas'],
    commonErrors: ['Redondear la espalda', 'Convertirlo en sentadilla'],
    alternatives: ['romanian_deadlift', 'cable_pull_through', 'hyperextension_45', 'single_leg_rdl'],
  }),
  e('romanian_deadlift', 'Peso muerto rumano con barra', 'hamstrings', ['glutes', 'back'], ['barbell'], 'hip_hinge', {
    ...COMPOUND, level: 'intermediate', reps: [6, 10], jointStress: 3,
    technique: ['Barra rozando los muslos', 'Bajar hasta notar estiramiento sin perder la neutralidad'],
    commonErrors: ['Bajar demasiado redondeando la espalda'],
    alternatives: ['db_romanian_deadlift', 'cable_pull_through'],
  }),
  e('cable_pull_through', 'Pull-through en polea', 'glutes', ['hamstrings'], ['cable'], 'hip_hinge', {
    reps: [12, 15], jointStress: 1,
    technique: ['De espaldas a la polea baja, cuerda entre las piernas', 'Extender la cadera apretando glúteos'],
    commonErrors: ['Tirar con los brazos'],
    alternatives: ['db_romanian_deadlift', 'hyperextension_45'],
  }),
  e('hyperextension_45', 'Hiperextensiones a 45°', 'glutes', ['hamstrings', 'back'], ['bench'], 'hip_hinge', {
    reps: [12, 20], jointStress: 1,
    technique: ['Borde del banco a la altura de la cadera', 'Subir hasta alinear el tronco con las piernas, sin hiperextender'],
    commonErrors: ['Hiperextender la zona lumbar arriba', 'Hacerlo con impulso'],
    alternatives: ['cable_pull_through', 'db_romanian_deadlift', 'glute_bridge'],
  }),
  e('single_leg_rdl', 'Peso muerto rumano a una pierna', 'hamstrings', ['glutes', 'core'], ['bodyweight'], 'hip_hinge', {
    reps: [10, 12], technique: ['Cadera nivelada', 'Pierna libre alineada con el tronco'], commonErrors: ['Rotar la pelvis'],
    alternatives: ['db_romanian_deadlift', 'glute_bridge'],
  }),

  // ======================= GLÚTEOS (EXTENSIÓN DE CADERA)
  e('glute_machine', 'Máquina de glúteos (patada)', 'glutes', ['hamstrings'], ['machine'], 'hip_extension', {
    ...ISO, reps: [12, 20], jointStress: 1,
    technique: ['Extender la cadera sin arquear la espalda', 'Pausa arriba'],
    commonErrors: ['Compensar con la zona lumbar'],
    alternatives: ['cable_kickback', 'hip_thrust', 'glute_bridge', 'band_kickback'],
  }),
  e('hip_thrust', 'Hip thrust con barra', 'glutes', ['hamstrings'], ['barbell', 'bench'], 'hip_extension', {
    ...COMPOUND, reps: [8, 12], jointStress: 1,
    technique: ['Escápulas en el banco, barbilla recogida', 'Bloquear con glúteos, no con la zona lumbar'],
    commonErrors: ['Hiperextender la columna'],
    alternatives: ['glute_bridge', 'glute_machine', 'cable_kickback'],
  }),
  e('glute_bridge', 'Puente de glúteos', 'glutes', ['hamstrings'], ['bodyweight'], 'hip_extension', {
    reps: [15, 25], jointStress: 1,
    technique: ['Talones cerca de los glúteos', 'Pausa de 2 s arriba (o a una pierna para progresar)'],
    commonErrors: ['Empujar con la punta de los pies'],
    alternatives: ['hip_thrust', 'band_kickback'],
  }),
  e('cable_kickback', 'Patada de glúteo en polea', 'glutes', [], ['cable'], 'hip_extension', {
    ...ISO, technique: ['Tobillera en polea baja', 'Tronco estable'], commonErrors: ['Balancear'],
    alternatives: ['glute_machine', 'band_kickback'],
  }),
  e('band_kickback', 'Patada de glúteo con banda', 'glutes', [], ['band'], 'hip_extension', {
    ...ISO, reps: [15, 25], jointStress: 1, technique: ['En cuadrupedia o de pie'], commonErrors: ['Arquear la espalda'],
    alternatives: ['glute_bridge', 'cable_kickback'],
  }),

  // ======================= ADUCTORES
  e('adductor_machine', 'Aductores en máquina', 'adductors', [], ['machine'], 'hip_adduction', {
    ...ISO, reps: [12, 15], jointStress: 1,
    technique: ['Rango cómodo, controlando la apertura'], commonErrors: ['Abrir más allá de tu movilidad'],
    alternatives: ['cable_adduction', 'copenhagen_plank', 'side_lunge'],
  }),
  e('cable_adduction', 'Aducción en polea', 'adductors', [], ['cable'], 'hip_adduction', {
    ...ISO, technique: ['Tobillera en polea baja, cruzar la pierna por delante'], commonErrors: ['Inclinar el tronco'],
    alternatives: ['adductor_machine', 'copenhagen_plank'],
  }),
  e('copenhagen_plank', 'Plancha Copenhague', 'adductors', ['core'], ['bench'], 'hip_adduction', {
    level: 'intermediate', reps: [20, 40], timed: true, jointStress: 2,
    technique: ['Empezar con la rodilla apoyada (versión corta)'], commonErrors: ['Hundir la cadera'],
    alternatives: ['adductor_machine', 'side_lunge'],
  }),
  e('side_lunge', 'Zancada lateral', 'adductors', ['quads', 'glutes'], ['bodyweight'], 'hip_adduction', {
    reps: [10, 12], technique: ['Pierna estirada mantiene el pie apoyado'], commonErrors: ['Rodilla hacia dentro'],
    alternatives: ['adductor_machine', 'copenhagen_plank'],
  }),

  // ======================= PANTORRILLAS
  e('seated_calf_raise', 'Pantorrilla sentado en máquina', 'calves', [], ['machine'], 'calf_raise', {
    ...ISO, reps: [15, 20], restSec: 60, jointStress: 1,
    technique: ['Rango completo: estirar abajo con pausa', 'Subir hasta la punta'], commonErrors: ['Rebotar', 'Rango corto'],
    alternatives: ['db_seated_calf_raise', 'standing_calf_raise', 'single_leg_calf_raise'],
  }),
  e('standing_calf_raise', 'Pantorrilla de pie en máquina', 'calves', [], ['machine'], 'calf_raise', {
    ...ISO, reps: [10, 15], restSec: 60, jointStress: 1,
    technique: ['Rodillas casi extendidas', 'Pausa abajo de 1–2 s'], commonErrors: ['Flexionar rodillas para impulsarse'],
    alternatives: ['smith_calf_raise', 'leg_press_calf_raise', 'single_leg_calf_raise'],
  }),
  e('smith_calf_raise', 'Pantorrilla de pie en Smith', 'calves', [], ['smith'], 'calf_raise', {
    ...ISO, restSec: 60, technique: ['Puntas sobre un disco o step'], commonErrors: ['Rango corto'],
    alternatives: ['standing_calf_raise', 'single_leg_calf_raise'],
  }),
  e('leg_press_calf_raise', 'Pantorrilla en prensa', 'calves', [], ['machine'], 'calf_raise', {
    ...ISO, restSec: 60, jointStress: 1, technique: ['Puntas en el borde inferior de la plataforma'], commonErrors: ['Doblar rodillas'],
    alternatives: ['standing_calf_raise', 'single_leg_calf_raise'],
  }),
  e('single_leg_calf_raise', 'Pantorrilla a una pierna (escalón)', 'calves', [], ['bodyweight'], 'calf_raise', {
    ...ISO, reps: [12, 20], restSec: 45, jointStress: 1,
    technique: ['En un escalón, mancuerna opcional', 'Pausa abajo y arriba'], commonErrors: ['Rebotar'],
    alternatives: ['standing_calf_raise', 'seated_calf_raise'],
  }),
  e('db_seated_calf_raise', 'Pantorrilla sentado con mancuernas', 'calves', [], ['dumbbell', 'bench'], 'calf_raise', {
    ...ISO, reps: [15, 25], restSec: 45, jointStress: 1, technique: ['Mancuernas sobre las rodillas, puntas sobre un disco'],
    commonErrors: ['Rango corto'], alternatives: ['seated_calf_raise', 'single_leg_calf_raise'],
  }),

  // ======================= PECHO — PLANO
  e('db_bench_press', 'Press plano con mancuernas', 'chest', ['triceps', 'shoulders'], ['dumbbell', 'bench'], 'horizontal_push', {
    ...COMPOUND,
    technique: ['Escápulas retraídas y deprimidas', 'Codos a ~45–60° del torso', 'Bajar hasta notar estiramiento del pecho'],
    commonErrors: ['Codos a 90° (más estrés en el hombro)', 'Rebotar las mancuernas'],
    alternatives: ['barbell_bench_press', 'machine_chest_press', 'cable_chest_press', 'push_up'],
  }),
  e('barbell_bench_press', 'Press de banca con barra', 'chest', ['triceps', 'shoulders'], ['barbell', 'bench'], 'horizontal_push', {
    ...COMPOUND, level: 'intermediate', reps: [6, 10], jointStress: 2,
    technique: ['Pies firmes, ligera extensión torácica', 'Barra a la parte baja del pecho'],
    commonErrors: ['Rebotar en el pecho', 'Levantar glúteos'],
    alternatives: ['db_bench_press', 'smith_bench_press', 'machine_chest_press', 'push_up'],
  }),
  e('smith_bench_press', 'Press de banca en Smith', 'chest', ['triceps', 'shoulders'], ['smith', 'bench'], 'horizontal_push', {
    ...COMPOUND, technique: ['Banco colocado para que la barra baje a la parte baja del pecho'], commonErrors: ['Banco mal posicionado'],
    alternatives: ['barbell_bench_press', 'db_bench_press', 'machine_chest_press'],
  }),
  e('machine_chest_press', 'Press de pecho en máquina', 'chest', ['triceps', 'shoulders'], ['machine'], 'horizontal_push', {
    ...COMPOUND, jointStress: 1, technique: ['Asas a la altura media del pecho'], commonErrors: ['Hombros adelantados'],
    alternatives: ['db_bench_press', 'cable_chest_press', 'push_up'],
  }),
  e('cable_chest_press', 'Press de pecho en polea', 'chest', ['triceps', 'shoulders'], ['cable'], 'horizontal_push', {
    reps: [10, 12], jointStress: 1, technique: ['Paso adelante, empujar al frente y juntar ligeramente'], commonErrors: ['Perder la estabilidad del tronco'],
    alternatives: ['machine_chest_press', 'db_bench_press', 'push_up'],
  }),
  e('push_up', 'Flexiones', 'chest', ['triceps', 'shoulders', 'core'], ['bodyweight'], 'horizontal_push', {
    reps: [8, 20], jointStress: 1,
    technique: ['Cuerpo en línea recta', 'Manos algo más anchas que los hombros'],
    commonErrors: ['Cadera hundida', 'Rango parcial'],
    alternatives: ['db_bench_press', 'machine_chest_press', 'band_chest_press'],
  }),
  e('band_chest_press', 'Press de pecho con banda', 'chest', ['triceps'], ['band'], 'horizontal_push', {
    reps: [12, 20], jointStress: 1, technique: ['Banda anclada detrás a la altura del pecho'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['push_up', 'cable_chest_press'],
  }),

  // ======================= PECHO — INCLINADO
  e('db_incline_press', 'Press inclinado con mancuernas', 'chest', ['shoulders', 'triceps'], ['dumbbell', 'bench'], 'incline_push', {
    ...COMPOUND,
    technique: ['Banco a 30° (no más de 45°)', 'Bajar hacia la parte alta del pecho'],
    commonErrors: ['Banco demasiado inclinado (pasa a ser hombro)'],
    alternatives: ['barbell_incline_press', 'incline_machine_press', 'cable_low_to_high_fly', 'decline_push_up'],
  }),
  e('barbell_incline_press', 'Press inclinado con barra', 'chest', ['shoulders', 'triceps'], ['barbell', 'bench'], 'incline_push', {
    ...COMPOUND, level: 'intermediate', reps: [6, 10],
    technique: ['Banco a 30°', 'Barra a la parte alta del pecho'], commonErrors: ['Rebotar'],
    alternatives: ['db_incline_press', 'smith_incline_press', 'incline_machine_press'],
  }),
  e('smith_incline_press', 'Press inclinado en Smith', 'chest', ['shoulders', 'triceps'], ['smith', 'bench'], 'incline_push', {
    ...COMPOUND, technique: ['Banco a 30°'], commonErrors: ['Banco mal posicionado'],
    alternatives: ['barbell_incline_press', 'db_incline_press'],
  }),
  e('incline_machine_press', 'Press inclinado en máquina', 'chest', ['shoulders', 'triceps'], ['machine'], 'incline_push', {
    ...COMPOUND, jointStress: 1, technique: ['Asas a la altura de la clavícula'], commonErrors: ['Elevar los hombros'],
    alternatives: ['db_incline_press', 'cable_low_to_high_fly'],
  }),
  e('cable_low_to_high_fly', 'Cruce de poleas de abajo hacia arriba', 'chest', ['shoulders'], ['cable'], 'incline_push', {
    ...ISO, jointStress: 1, technique: ['Poleas bajas, llevar las manos a la altura de la barbilla'], commonErrors: ['Doblar los codos en exceso'],
    alternatives: ['db_incline_press', 'incline_machine_press'],
  }),
  e('decline_push_up', 'Flexiones con pies elevados', 'chest', ['shoulders', 'triceps'], ['bodyweight'], 'incline_push', {
    reps: [8, 15], technique: ['Pies sobre un banco: enfatiza la parte alta del pecho'], commonErrors: ['Cadera hundida'],
    alternatives: ['db_incline_press', 'push_up'],
  }),

  // ======================= PECHO — DECLINADO
  e('db_decline_press', 'Press declinado con mancuernas', 'chest', ['triceps'], ['dumbbell', 'bench'], 'decline_push', {
    ...COMPOUND, reps: [10, 15],
    technique: ['Banco ligeramente declinado (15–30°)', 'Pies bien asegurados'], commonErrors: ['Declinación excesiva'],
    alternatives: ['barbell_decline_press', 'cable_high_to_low_fly', 'chest_dip', 'db_bench_press'],
  }),
  e('barbell_decline_press', 'Press declinado con barra', 'chest', ['triceps'], ['barbell', 'bench'], 'decline_push', {
    ...COMPOUND, level: 'intermediate', technique: ['Barra a la parte baja del pecho'], commonErrors: ['Sin compañero de seguridad'],
    alternatives: ['db_decline_press', 'cable_high_to_low_fly'],
  }),
  e('cable_high_to_low_fly', 'Cruce de poleas de arriba hacia abajo', 'chest', ['triceps'], ['cable'], 'decline_push', {
    ...ISO, jointStress: 1, technique: ['Poleas altas, llevar las manos hacia la cadera'], commonErrors: ['Encoger los hombros'],
    alternatives: ['db_decline_press', 'chest_dip'],
  }),
  e('chest_dip', 'Fondos en paralelas (pecho)', 'chest', ['triceps', 'shoulders'], ['bodyweight'], 'decline_push', {
    level: 'intermediate', reps: [6, 12], jointStress: 3,
    technique: ['Tronco inclinado hacia delante', 'Bajar solo hasta donde el hombro esté cómodo'],
    commonErrors: ['Bajar demasiado con los hombros adelantados'],
    alternatives: ['db_decline_press', 'cable_high_to_low_fly', 'machine_dip'],
  }),

  // ======================= PECHO — APERTURAS
  e('cable_crossover', 'Cruce de poleas', 'chest', ['shoulders'], ['cable'], 'chest_fly', {
    ...ISO, jointStress: 1,
    technique: ['Codos ligeramente flexionados y fijos', 'Juntar las manos frente al pecho'],
    commonErrors: ['Convertirlo en un press', 'Abrir demasiado'],
    alternatives: ['pec_deck', 'db_fly', 'band_fly'],
  }),
  e('pec_deck', 'Contractor de pecho (pec deck)', 'chest', [], ['machine'], 'chest_fly', {
    ...ISO, jointStress: 1, technique: ['Asas a la altura del pecho'], commonErrors: ['Hombros adelantados'],
    alternatives: ['cable_crossover', 'db_fly'],
  }),
  e('db_fly', 'Aperturas con mancuernas', 'chest', ['shoulders'], ['dumbbell', 'bench'], 'chest_fly', {
    ...ISO, jointStress: 2, technique: ['Bajar solo hasta notar estiramiento'], commonErrors: ['Bajar demasiado con los brazos rectos'],
    alternatives: ['cable_crossover', 'pec_deck'],
  }),
  e('band_fly', 'Aperturas con banda', 'chest', [], ['band'], 'chest_fly', {
    ...ISO, reps: [15, 20], jointStress: 1, technique: ['Banda anclada detrás'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['cable_crossover', 'push_up'],
  }),

  // ======================= ESPALDA — TIRÓN VERTICAL
  e('lat_pulldown', 'Jalón al pecho', 'back', ['biceps'], ['cable'], 'vertical_pull', {
    ...COMPOUND, restSec: 120,
    technique: ['Agarre algo más ancho que los hombros', 'Llevar la barra a la parte alta del pecho deprimiendo escápulas'],
    commonErrors: ['Inclinarse demasiado atrás', 'Tirar solo con los brazos'],
    alternatives: ['neutral_grip_pulldown', 'assisted_pull_up', 'pull_up', 'band_pulldown'],
  }),
  e('behind_neck_pulldown', 'Jalón tras nuca', 'back', ['biceps'], ['cable'], 'vertical_pull', {
    ...COMPOUND, level: 'advanced', jointStress: 3,
    technique: ['Solo con buena movilidad de hombro y sin dolor', 'Rango corto, sin forzar el cuello'],
    commonErrors: ['Adelantar la cabeza', 'Forzar la rotación externa del hombro'],
    alternatives: ['lat_pulldown', 'neutral_grip_pulldown'],
    notes: 'Mismo estímulo dorsal que el jalón al pecho con mayor estrés en hombro y cuello. Se recomienda el jalón al pecho.',
  }),
  e('neutral_grip_pulldown', 'Jalón con agarre neutro', 'back', ['biceps'], ['cable'], 'vertical_pull', {
    ...COMPOUND, jointStress: 1, technique: ['Agarre en V o neutro, codos hacia las costillas'], commonErrors: ['Encoger hombros'],
    alternatives: ['lat_pulldown', 'assisted_pull_up'],
  }),
  e('pull_up', 'Dominadas', 'back', ['biceps', 'core'], ['pullup_bar'], 'vertical_pull', {
    ...COMPOUND, level: 'intermediate', reps: [5, 10],
    technique: ['Iniciar deprimiendo escápulas', 'Barbilla sobre la barra sin balanceo'], commonErrors: ['Kipping', 'Rango parcial'],
    alternatives: ['assisted_pull_up', 'lat_pulldown', 'band_pulldown'],
  }),
  e('assisted_pull_up', 'Dominadas asistidas', 'back', ['biceps'], ['machine'], 'vertical_pull', {
    ...COMPOUND, jointStress: 1, technique: ['Contrapeso que permita 8–12 repeticiones'], commonErrors: ['Rango parcial'],
    alternatives: ['lat_pulldown', 'pull_up'],
  }),
  e('band_pulldown', 'Jalón con banda', 'back', ['biceps'], ['band'], 'vertical_pull', {
    reps: [12, 20], jointStress: 1, technique: ['Banda anclada arriba, arrodillado'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['lat_pulldown', 'pull_up'],
  }),

  // ======================= ESPALDA — TIRÓN HORIZONTAL
  e('db_one_arm_row', 'Remo a una mano con mancuerna (serrucho)', 'back', ['biceps', 'shoulders'], ['dumbbell', 'bench'], 'horizontal_pull', {
    ...COMPOUND,
    technique: ['Mano y rodilla en el banco, espalda neutra', 'Llevar el codo hacia la cadera'],
    commonErrors: ['Rotar el tronco para subir más peso'],
    alternatives: ['seated_cable_row', 'machine_row', 'barbell_row', 'inverted_row'],
  }),
  e('db_bent_over_row', 'Remo inclinado con mancuernas', 'back', ['biceps', 'shoulders'], ['dumbbell'], 'horizontal_pull', {
    ...COMPOUND, jointStress: 2,
    technique: ['Tronco a ~45°, espalda neutra', 'Codos hacia atrás'], commonErrors: ['Redondear la espalda'],
    alternatives: ['seated_cable_row', 'machine_row', 'barbell_row'],
  }),
  e('barbell_row', 'Remo con barra', 'back', ['biceps', 'shoulders'], ['barbell'], 'horizontal_pull', {
    ...COMPOUND, level: 'intermediate', jointStress: 3,
    technique: ['Tronco a ~45°', 'Barra hacia el ombligo'], commonErrors: ['Usar impulso de cadera'],
    alternatives: ['db_bent_over_row', 'seated_cable_row', 'machine_row'],
  }),
  e('seated_cable_row', 'Remo sentado en polea', 'back', ['biceps', 'shoulders'], ['cable'], 'horizontal_pull', {
    ...COMPOUND, jointStress: 1, technique: ['Pecho alto, llevar el agarre al abdomen', 'Juntar escápulas al final'],
    commonErrors: ['Balancear el tronco'],
    alternatives: ['machine_row', 'db_one_arm_row', 'band_row'],
  }),
  e('machine_row', 'Remo en máquina con apoyo de pecho', 'back', ['biceps', 'shoulders'], ['machine'], 'horizontal_pull', {
    ...COMPOUND, jointStress: 1, technique: ['Pecho apoyado, tirar con los codos'], commonErrors: ['Encoger hombros'],
    alternatives: ['seated_cable_row', 'db_one_arm_row'],
  }),
  e('inverted_row', 'Remo invertido', 'back', ['biceps', 'core'], ['bodyweight'], 'horizontal_pull', {
    reps: [8, 15], jointStress: 1,
    technique: ['Bajo una barra baja o mesa resistente', 'Cuerpo recto, pecho a la barra'], commonErrors: ['Cadera hundida'],
    alternatives: ['seated_cable_row', 'band_row'],
  }),
  e('band_row', 'Remo con banda', 'back', ['biceps'], ['band'], 'horizontal_pull', {
    reps: [12, 20], jointStress: 1, technique: ['Banda anclada al frente'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['seated_cable_row', 'inverted_row'],
  }),

  // ======================= DELTOIDES POSTERIOR
  e('face_pull', 'Face pull en polea', 'shoulders', ['back'], ['cable'], 'rear_delt', {
    ...ISO, reps: [12, 15], jointStress: 1,
    technique: ['Cuerda a la altura de la cara', 'Separar la cuerda y rotar externamente'], commonErrors: ['Tirar con la zona lumbar'],
    alternatives: ['reverse_pec_deck', 'db_rear_delt_fly', 'band_pull_apart'],
  }),
  e('reverse_pec_deck', 'Pájaros en máquina (contractor inverso)', 'shoulders', ['back'], ['machine'], 'rear_delt', {
    ...ISO, jointStress: 1, technique: ['Brazos casi extendidos, abrir hacia atrás'], commonErrors: ['Juntar escápulas en exceso'],
    alternatives: ['face_pull', 'db_rear_delt_fly'],
  }),
  e('db_rear_delt_fly', 'Pájaros con mancuernas', 'shoulders', ['back'], ['dumbbell'], 'rear_delt', {
    ...ISO, technique: ['Tronco inclinado, abrir hacia los lados'], commonErrors: ['Usar demasiado peso'],
    alternatives: ['face_pull', 'reverse_pec_deck', 'band_pull_apart'],
  }),
  e('band_pull_apart', 'Separación de banda', 'shoulders', ['back'], ['band'], 'rear_delt', {
    ...ISO, reps: [15, 25], jointStress: 1, technique: ['Brazos extendidos a la altura del pecho'], commonErrors: ['Encoger hombros'],
    alternatives: ['face_pull', 'db_rear_delt_fly'],
  }),

  // ======================= HOMBROS — PRESS
  e('db_shoulder_press', 'Press de hombro con mancuernas sentado', 'shoulders', ['triceps'], ['dumbbell', 'bench'], 'vertical_push', {
    ...COMPOUND,
    technique: ['Respaldo a ~80°', 'Mancuernas ligeramente por delante de los hombros'],
    commonErrors: ['Arquear la zona lumbar'],
    alternatives: ['machine_shoulder_press', 'barbell_overhead_press', 'pike_push_up', 'band_overhead_press'],
  }),
  e('behind_neck_press', 'Press tras nuca', 'shoulders', ['triceps'], ['barbell'], 'vertical_push', {
    ...COMPOUND, level: 'advanced', jointStress: 3,
    technique: ['Solo con movilidad completa y sin dolor', 'Bajar solo hasta la altura de las orejas'],
    commonErrors: ['Adelantar la cabeza', 'Bajar demasiado'],
    alternatives: ['db_shoulder_press', 'machine_shoulder_press'],
    notes: 'Mayor estrés en la articulación del hombro que el press frontal, sin ventaja clara de hipertrofia.',
  }),
  e('machine_shoulder_press', 'Press de hombro en máquina', 'shoulders', ['triceps'], ['machine'], 'vertical_push', {
    ...COMPOUND, jointStress: 1, technique: ['Asas a la altura de los hombros'], commonErrors: ['Despegar la espalda'],
    alternatives: ['db_shoulder_press', 'band_overhead_press'],
  }),
  e('barbell_overhead_press', 'Press militar con barra', 'shoulders', ['triceps', 'core'], ['barbell'], 'vertical_push', {
    ...COMPOUND, level: 'intermediate', reps: [5, 10], jointStress: 2,
    technique: ['Glúteos y abdomen firmes', 'Barra en línea vertical'], commonErrors: ['Hiperextender la espalda'],
    alternatives: ['db_shoulder_press', 'machine_shoulder_press'],
  }),
  e('pike_push_up', 'Flexiones en pica', 'shoulders', ['triceps'], ['bodyweight'], 'vertical_push', {
    level: 'intermediate', reps: [6, 12], technique: ['Cadera alta, cabeza hacia el suelo entre las manos'], commonErrors: ['Rango corto'],
    alternatives: ['db_shoulder_press', 'band_overhead_press'],
  }),
  e('band_overhead_press', 'Press de hombro con banda', 'shoulders', ['triceps'], ['band'], 'vertical_push', {
    reps: [12, 20], jointStress: 1, technique: ['Pisar la banda'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['db_shoulder_press', 'pike_push_up'],
  }),

  // ======================= ELEVACIONES
  e('db_lateral_raise', 'Elevaciones laterales con mancuernas', 'shoulders', [], ['dumbbell'], 'lateral_raise', {
    ...ISO, reps: [12, 15], jointStress: 1,
    technique: ['Subir hasta la altura del hombro', 'Codos ligeramente flexionados'], commonErrors: ['Balanceo', 'Encoger trapecios'],
    alternatives: ['cable_lateral_raise', 'machine_lateral_raise', 'band_lateral_raise'],
  }),
  e('cable_lateral_raise', 'Elevación lateral en polea', 'shoulders', [], ['cable'], 'lateral_raise', {
    ...ISO, reps: [12, 15], jointStress: 1, technique: ['Polea baja, cable por delante o detrás del cuerpo'], commonErrors: ['Inclinar el tronco'],
    alternatives: ['db_lateral_raise', 'machine_lateral_raise'],
  }),
  e('machine_lateral_raise', 'Elevación lateral en máquina', 'shoulders', [], ['machine'], 'lateral_raise', {
    ...ISO, jointStress: 1, technique: ['Eje alineado con el hombro'], commonErrors: ['Encoger trapecios'],
    alternatives: ['db_lateral_raise', 'cable_lateral_raise'],
  }),
  e('band_lateral_raise', 'Elevación lateral con banda', 'shoulders', [], ['band'], 'lateral_raise', {
    ...ISO, reps: [15, 25], jointStress: 1, technique: ['Pisar la banda'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['db_lateral_raise'],
  }),
  e('db_front_raise', 'Elevaciones frontales con mancuernas', 'shoulders', [], ['dumbbell'], 'front_raise', {
    ...ISO, reps: [10, 15], technique: ['Subir hasta la altura de los ojos'], commonErrors: ['Balanceo con la espalda'],
    alternatives: ['cable_front_raise', 'band_front_raise'],
    notes: 'El deltoides anterior ya recibe mucho trabajo en los presses de pecho y hombro.',
  }),
  e('cable_front_raise', 'Elevación frontal en polea', 'shoulders', [], ['cable'], 'front_raise', {
    ...ISO, jointStress: 1, technique: ['Polea baja detrás del cuerpo'], commonErrors: ['Balanceo'],
    alternatives: ['db_front_raise', 'band_front_raise'],
  }),
  e('band_front_raise', 'Elevación frontal con banda', 'shoulders', [], ['band'], 'front_raise', {
    ...ISO, reps: [15, 20], jointStress: 1, technique: ['Pisar la banda'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['db_front_raise'],
  }),

  // ======================= BÍCEPS
  e('db_curl', 'Curl de bíceps con mancuernas', 'biceps', ['forearms'], ['dumbbell'], 'elbow_flexion', {
    ...ISO, reps: [8, 12],
    technique: ['Codos pegados al cuerpo', 'Supinar al subir'], commonErrors: ['Balanceo del tronco', 'Bajar sin control'],
    alternatives: ['barbell_curl', 'cable_curl', 'hammer_curl', 'band_curl'],
  }),
  e('barbell_curl', 'Curl con barra', 'biceps', ['forearms'], ['barbell'], 'elbow_flexion', {
    ...ISO, reps: [8, 12], technique: ['Agarre al ancho de hombros'], commonErrors: ['Impulso con la cadera'],
    alternatives: ['ez_bar_curl', 'db_curl', 'cable_curl'],
  }),
  e('ez_bar_curl', 'Curl con barra Z', 'biceps', ['forearms'], ['ez_bar'], 'elbow_flexion', {
    ...ISO, reps: [8, 12], jointStress: 1, technique: ['Agarre semisupino: menos tensión en la muñeca'], commonErrors: ['Balanceo'],
    alternatives: ['barbell_curl', 'db_curl', 'cable_curl'],
  }),
  e('ez_preacher_curl', 'Curl predicador con barra Z (banco Scott)', 'biceps', [], ['ez_bar', 'bench'], 'elbow_flexion', {
    ...ISO, reps: [8, 12],
    technique: ['Axilas apoyadas en el borde del banco', 'No bloquear del todo abajo con peso alto'],
    commonErrors: ['Levantar los codos del apoyo'],
    alternatives: ['machine_preacher_curl', 'db_preacher_curl', 'cable_curl'],
  }),
  e('machine_preacher_curl', 'Curl predicador en máquina', 'biceps', [], ['machine'], 'elbow_flexion', {
    ...ISO, jointStress: 1, technique: ['Codos alineados con el eje'], commonErrors: ['Rango corto'],
    alternatives: ['ez_preacher_curl', 'cable_curl'],
  }),
  e('db_preacher_curl', 'Curl predicador con mancuerna', 'biceps', [], ['dumbbell', 'bench'], 'elbow_flexion', {
    ...ISO, technique: ['Un brazo a la vez'], commonErrors: ['Levantar el codo'],
    alternatives: ['ez_preacher_curl', 'machine_preacher_curl'],
  }),
  e('cable_curl', 'Curl en polea', 'biceps', ['forearms'], ['cable'], 'elbow_flexion', {
    ...ISO, jointStress: 1, technique: ['Polea baja, barra recta o cuerda'], commonErrors: ['Adelantar los codos'],
    alternatives: ['db_curl', 'ez_bar_curl', 'band_curl'],
  }),
  e('hammer_curl', 'Curl martillo', 'biceps', ['forearms'], ['dumbbell'], 'elbow_flexion', {
    ...ISO, technique: ['Agarre neutro'], commonErrors: ['Balanceo'],
    alternatives: ['cable_curl', 'db_curl'],
  }),
  e('band_curl', 'Curl con banda', 'biceps', [], ['band'], 'elbow_flexion', {
    ...ISO, reps: [15, 20], jointStress: 1, technique: ['Pisar la banda'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['db_curl', 'cable_curl'],
  }),
  e('chin_up', 'Dominadas supinas', 'biceps', ['back'], ['pullup_bar'], 'elbow_flexion', {
    level: 'intermediate', reps: [5, 10], restSec: 120,
    technique: ['Agarre supino al ancho de hombros'], commonErrors: ['Balanceo'],
    alternatives: ['db_curl', 'band_curl'],
  }),

  // ======================= TRÍCEPS
  e('cable_pushdown_bar', 'Jalón de tríceps con barra en polea', 'triceps', [], ['cable'], 'elbow_extension', {
    ...ISO, reps: [10, 15], jointStress: 1,
    technique: ['Codos pegados al costado', 'Extender completamente sin mover los hombros'], commonErrors: ['Usar el peso del cuerpo'],
    alternatives: ['rope_pushdown', 'machine_dip', 'band_pushdown', 'bench_dip'],
  }),
  e('rope_pushdown', 'Jalón de tríceps con cuerda', 'triceps', [], ['cable'], 'elbow_extension', {
    ...ISO, reps: [12, 15], jointStress: 1, technique: ['Separar la cuerda al final'], commonErrors: ['Codos que se abren'],
    alternatives: ['cable_pushdown_bar', 'band_pushdown'],
  }),
  e('overhead_cable_extension', 'Extensión de tríceps tras nuca en polea', 'triceps', [], ['cable'], 'elbow_extension', {
    ...ISO, reps: [10, 15], jointStress: 2,
    technique: ['De espaldas a la polea, codos apuntando al frente', 'Estira la cabeza larga del tríceps'],
    commonErrors: ['Abrir los codos', 'Arquear la espalda'],
    alternatives: ['db_overhead_extension', 'ez_skull_crusher', 'band_overhead_extension'],
  }),
  e('db_overhead_extension', 'Extensión de tríceps sobre la cabeza con mancuerna', 'triceps', [], ['dumbbell'], 'elbow_extension', {
    ...ISO, technique: ['Sentado con respaldo, mancuerna con ambas manos'], commonErrors: ['Abrir los codos'],
    alternatives: ['overhead_cable_extension', 'ez_skull_crusher'],
  }),
  e('ez_skull_crusher', 'Press francés con barra Z', 'triceps', [], ['ez_bar', 'bench'], 'elbow_extension', {
    ...ISO, level: 'intermediate', reps: [8, 12], jointStress: 2,
    technique: ['Bajar la barra detrás de la cabeza'], commonErrors: ['Codos abiertos'],
    alternatives: ['db_overhead_extension', 'overhead_cable_extension'],
  }),
  e('machine_dip', 'Fondos en máquina', 'triceps', ['chest'], ['machine'], 'elbow_extension', {
    ...ISO, jointStress: 1, technique: ['Tronco erguido'], commonErrors: ['Hombros adelantados'],
    alternatives: ['cable_pushdown_bar', 'bench_dip'],
  }),
  e('bench_dip', 'Fondos en banco', 'triceps', ['chest'], ['bench'], 'elbow_extension', {
    reps: [10, 15], jointStress: 3,
    technique: ['Bajar solo hasta 90° de codo', 'Espalda cerca del banco'], commonErrors: ['Bajar demasiado (estrés en el hombro)'],
    alternatives: ['diamond_push_up', 'cable_pushdown_bar'],
  }),
  e('diamond_push_up', 'Flexiones diamante', 'triceps', ['chest'], ['bodyweight'], 'elbow_extension', {
    reps: [6, 15], technique: ['Manos juntas bajo el pecho, codos pegados'], commonErrors: ['Cadera hundida'],
    alternatives: ['bench_dip', 'band_pushdown'],
  }),
  e('band_pushdown', 'Extensión de tríceps con banda', 'triceps', [], ['band'], 'elbow_extension', {
    ...ISO, reps: [15, 25], jointStress: 1, technique: ['Banda anclada arriba'], commonErrors: ['Tensión insuficiente'],
    alternatives: ['cable_pushdown_bar', 'diamond_push_up'],
  }),
  e('band_overhead_extension', 'Extensión de tríceps tras nuca con banda', 'triceps', [], ['band'], 'elbow_extension', {
    ...ISO, reps: [15, 20], jointStress: 1, technique: ['Banda anclada abajo, de espaldas'], commonErrors: ['Abrir codos'],
    alternatives: ['overhead_cable_extension', 'db_overhead_extension'],
  }),

  // ======================= ABDOMEN / CORE
  e('crunch', 'Crunch abdominal', 'abs', [], ['bodyweight'], 'spinal_flexion', {
    reps: [12, 20], restSec: 45, jointStress: 1,
    technique: ['Enrollar la columna, no tirar del cuello'], commonErrors: ['Tirar de la cabeza con las manos'],
    alternatives: ['cable_crunch', 'dead_bug'],
  }),
  e('cable_crunch', 'Crunch en polea alta', 'abs', [], ['cable'], 'spinal_flexion', {
    reps: [10, 15], restSec: 60, jointStress: 1,
    technique: ['Arrodillado, flexionar la columna llevando los codos a los muslos'], commonErrors: ['Flexionar la cadera en lugar de la columna'],
    alternatives: ['crunch', 'hanging_knee_raise'],
  }),
  e('hanging_knee_raise', 'Elevación de rodillas colgado', 'abs', ['core'], ['pullup_bar'], 'hip_flexion', {
    level: 'intermediate', reps: [8, 15], restSec: 60,
    technique: ['Retroversión de pelvis al subir', 'Sin balanceo'], commonErrors: ['Balancearse'],
    alternatives: ['reverse_crunch', 'cable_crunch'],
  }),
  e('reverse_crunch', 'Crunch inverso', 'abs', [], ['bodyweight'], 'hip_flexion', {
    reps: [10, 15], restSec: 45, jointStress: 1, technique: ['Despegar la pelvis del suelo'], commonErrors: ['Impulso con las piernas'],
    alternatives: ['hanging_knee_raise', 'crunch'],
  }),
  e('plank', 'Plancha frontal', 'core', ['abs'], ['bodyweight'], 'anti_extension', {
    reps: [30, 60], timed: true, restSec: 45, jointStress: 1,
    technique: ['Glúteos y abdomen contraídos', 'Línea recta de cabeza a talones'], commonErrors: ['Cadera hundida o muy alta'],
    alternatives: ['dead_bug', 'ab_wheel'],
  }),
  e('ab_wheel', 'Rueda abdominal', 'core', ['abs'], ['bodyweight'], 'anti_extension', {
    level: 'intermediate', reps: [6, 12], restSec: 60,
    technique: ['Desde rodillas, avanzar solo mientras la zona lumbar no se arquee'], commonErrors: ['Hundir la zona lumbar'],
    alternatives: ['plank', 'dead_bug'],
  }),
  e('dead_bug', 'Dead bug', 'core', ['abs'], ['bodyweight'], 'anti_extension', {
    reps: [8, 12], restSec: 45, jointStress: 1, technique: ['Zona lumbar pegada al suelo', 'Movimiento lento brazo-pierna opuestos'],
    commonErrors: ['Arquear la espalda'], alternatives: ['plank', 'crunch'],
  }),
  e('pallof_press', 'Pallof press', 'core', ['abs'], ['cable'], 'anti_rotation', {
    reps: [10, 12], restSec: 45, jointStress: 1, technique: ['De lado a la polea, extender los brazos sin rotar'],
    commonErrors: ['Permitir la rotación del tronco'], alternatives: ['band_pallof_press', 'side_plank'],
  }),
  e('band_pallof_press', 'Pallof press con banda', 'core', ['abs'], ['band'], 'anti_rotation', {
    reps: [10, 15], restSec: 45, jointStress: 1, technique: ['Banda anclada a la altura del pecho'], commonErrors: ['Rotar'],
    alternatives: ['pallof_press', 'side_plank'],
  }),
  e('side_plank', 'Plancha lateral', 'core', ['abs'], ['bodyweight'], 'lateral_flexion', {
    reps: [20, 45], timed: true, restSec: 45, jointStress: 1,
    technique: ['Codo bajo el hombro, cadera alta'], commonErrors: ['Dejar caer la cadera'],
    alternatives: ['pallof_press', 'db_side_bend'],
    notes: 'Trabaja oblicuos de forma segura. Recordatorio: no existe la pérdida de grasa localizada.',
  }),
  e('db_side_bend', 'Flexión lateral con mancuerna', 'abs', ['core'], ['dumbbell'], 'lateral_flexion', {
    reps: [12, 15], restSec: 45, technique: ['Una mancuerna, movimiento lento'], commonErrors: ['Rotar el tronco'],
    alternatives: ['side_plank', 'pallof_press'],
  }),
  e('bicycle_crunch', 'Crunch bicicleta', 'abs', ['core'], ['bodyweight'], 'spinal_flexion', {
    reps: [12, 20], restSec: 45, technique: ['Rotación controlada, no tirar del cuello'], commonErrors: ['Hacerlo muy rápido'],
    alternatives: ['side_plank', 'crunch'],
  }),

  // ======================= CARDIO
  e('walk_outdoor', 'Caminata', 'cardio', [], ['bodyweight'], 'cardio_liss', {
    sets: [1, 1], reps: [20, 45], timed: true, restSec: 0, jointStress: 1, rir: [3, 5],
    technique: ['Ritmo en el que puedas hablar (zona 2)'], commonErrors: [],
    alternatives: ['treadmill_incline_walk', 'stationary_bike_liss', 'elliptical_liss'],
  }),
  e('treadmill_incline_walk', 'Caminata inclinada en cinta', 'cardio', ['glutes', 'calves'], ['cardio_machine'], 'cardio_liss', {
    sets: [1, 1], reps: [15, 40], timed: true, restSec: 0, jointStress: 1, rir: [3, 5],
    technique: ['Inclinación 6–12 %, sin agarrarse de la cinta'], commonErrors: ['Sujetarse de las barras'],
    alternatives: ['walk_outdoor', 'elliptical_liss', 'stationary_bike_liss'],
  }),
  e('stationary_bike_liss', 'Bicicleta estática (suave)', 'cardio', ['quads'], ['cardio_machine'], 'cardio_liss', {
    sets: [1, 1], reps: [20, 45], timed: true, restSec: 0, jointStress: 1, rir: [3, 5],
    technique: ['Sillín a la altura de la cadera'], commonErrors: [], alternatives: ['walk_outdoor', 'elliptical_liss'],
  }),
  e('elliptical_liss', 'Elíptica (suave)', 'cardio', [], ['cardio_machine'], 'cardio_liss', {
    sets: [1, 1], reps: [20, 45], timed: true, restSec: 0, jointStress: 1, rir: [3, 5],
    technique: ['Postura erguida'], commonErrors: [], alternatives: ['stationary_bike_liss', 'walk_outdoor'],
  }),
  e('bike_hiit', 'HIIT en bicicleta', 'cardio', ['quads'], ['cardio_machine'], 'cardio_hiit', {
    sets: [1, 1], reps: [12, 20], timed: true, restSec: 0, jointStress: 1, rir: [1, 2], level: 'intermediate',
    technique: ['Ej.: 8–10 × (30 s intenso / 90 s suave)', 'Calentar 3–5 min antes'], commonErrors: ['Sesiones demasiado largas: el HIIT real no se sostiene 30 min'],
    alternatives: ['rower_hiit', 'elliptical_hiit', 'bodyweight_hiit'],
  }),
  e('rower_hiit', 'HIIT en remo', 'cardio', ['back'], ['cardio_machine'], 'cardio_hiit', {
    sets: [1, 1], reps: [12, 20], timed: true, restSec: 0, level: 'intermediate', rir: [1, 2],
    technique: ['Piernas-tronco-brazos en ese orden'], commonErrors: ['Tirar solo con los brazos'],
    alternatives: ['bike_hiit', 'elliptical_hiit'],
  }),
  e('elliptical_hiit', 'HIIT en elíptica', 'cardio', [], ['cardio_machine'], 'cardio_hiit', {
    sets: [1, 1], reps: [12, 20], timed: true, restSec: 0, jointStress: 1, rir: [1, 2],
    technique: ['Intervalos de resistencia alta'], commonErrors: [], alternatives: ['bike_hiit', 'rower_hiit'],
  }),
  e('bodyweight_hiit', 'HIIT con peso corporal', 'cardio', ['quads', 'core'], ['bodyweight'], 'cardio_hiit', {
    sets: [1, 1], reps: [10, 20], timed: true, restSec: 0, jointStress: 2, rir: [1, 2],
    technique: ['Ej.: jumping jacks, sentadillas, mountain climbers 30 s / 30 s'], commonErrors: ['Perder técnica por fatiga'],
    alternatives: ['bike_hiit', 'walk_outdoor'],
  }),

  // ======================= MAQUINAS ESPECIALIZADAS GYM TOTAL (M1-M12 APK)
  e('pec_deck_fly', 'Aperturas en máquina Pec Deck / Contractor', 'chest', ['shoulders'], ['machine'], 'chest_fly', {
    reps: [10, 15], restSec: 60, jointStress: 1,
    technique: ['Codos a la altura media del pectoral', 'Apretar 1 segundo en contracción máxima', 'Controlar el estiramiento excéntrico'],
    commonErrors: ['Despegar la espalda del respaldo', 'Excesiva carga forzando hombros'],
    alternatives: ['cable_crossover', 'db_chest_fly'],
  }),
  e('chest_press_machine', 'Press de pecho en máquina guiada', 'chest', ['triceps', 'shoulders'], ['machine'], 'horizontal_push', {
    ...COMPOUND, jointStress: 1,
    technique: ['Asiento a la altura donde los agarres queden a nivel de pezones', 'Empujar exhalando sin hiperextender codos'],
    commonErrors: ['Hombros elevados hacia las orejas'],
    alternatives: ['barbell_bench_press', 'smith_bench_press', 'db_bench_press'],
  }),
  e('incline_chest_press_machine', 'Press inclinado en máquina guiada', 'chest', ['shoulders', 'triceps'], ['machine'], 'incline_push', {
    ...COMPOUND, jointStress: 1,
    technique: ['Respaldo a 30-45°', 'Empujar apuntando a la clavícula'],
    commonErrors: ['Arquear la zona baja de la espalda'],
    alternatives: ['db_incline_press', 'barbell_incline_press'],
  }),
  e('lat_pulldown_v_bar', 'Jalón en polea con agarre cerrado V', 'back', ['biceps', 'forearms'], ['cable'], 'vertical_pull', {
    ...COMPOUND, reps: [10, 12],
    technique: ['Torso con leve inclinación (10°)', 'Llevar el agarre V al esternón sacando pecho'],
    commonErrors: ['Balancear todo el tronco hacia atrás'],
    alternatives: ['lat_pulldown', 'neutral_grip_pulldown'],
  }),
  e('seated_cable_row_wide', 'Remo sentado en polea con agarre ancho', 'back', ['shoulders', 'biceps'], ['cable'], 'horizontal_pull', {
    ...COMPOUND, reps: [10, 12],
    technique: ['Barra ancha prono', 'Tirar hacia el abdomen alto retrayendo escápulas'],
    commonErrors: ['Encorvar la espalda lumbar al estirar'],
    alternatives: ['seated_cable_row', 'chest_supported_row'],
  }),
  e('t_bar_row_machine', 'Remo en barra T con apoyo en pecho', 'back', ['biceps'], ['machine'], 'horizontal_pull', {
    ...COMPOUND, jointStress: 1,
    technique: ['Pecho apoyado firmemente en la almohadilla', 'Tirar con codos hacia atrás'],
    commonErrors: ['Despegar el esternón del soporte'],
    alternatives: ['chest_supported_row', 'db_one_arm_row'],
  }),
  e('standing_calf_raise_smith', 'Pantorrillas de pie en máquina Smith', 'calves', [], ['smith'], 'calf_raise', {
    reps: [12, 18], restSec: 60, jointStress: 1,
    technique: ['Metatarsos sobre un escalón o bloque', 'Bajar al máximo estiramiento con pausa de 2 segundos', 'Subir explosivo'],
    commonErrors: ['Rebotar rápido usando el tendón de Aquiles'],
    alternatives: ['standing_calf_raise', 'seated_calf_raise'],
  }),
  e('seated_calf_machine', 'Elevación de talones en máquina sentado', 'calves', [], ['machine'], 'calf_raise', {
    reps: [15, 20], restSec: 60, jointStress: 1,
    technique: ['Aisla el sóleo', 'Rango completo de flexión plantar'],
    commonErrors: ['Peso excesivo con rango de movimiento recortado'],
    alternatives: ['seated_calf_raise', 'standing_calf_raise_smith'],
  }),
  e('machine_bicep_preacher', 'Curl en banco Scott / predicador en máquina', 'biceps', ['forearms'], ['machine'], 'elbow_flexion', {
    ...ISO, jointStress: 1,
    technique: ['Brazos alineados con la almohadilla', 'Aislamiento estricto del bíceps braquial'],
    commonErrors: ['Despegar los codos en la fase final'],
    alternatives: ['ez_preacher_curl', 'cable_bicep_curl'],
  }),
  e('cable_tricep_rope_overhead', 'Extensión de tríceps tras nuca con cuerda en polea', 'triceps', [], ['cable'], 'elbow_extension', {
    ...ISO, jointStress: 1,
    technique: ['Tronco inclinado hacia adelante', 'Abrir la cuerda al final de la extensión'],
    commonErrors: ['Mover los codos hacia los lados'],
    alternatives: ['overhead_cable_extension', 'rope_pushdown'],
  }),
  e('cable_ab_crunch_kneeling', 'Crunch abdominal en polea alta de rodillas', 'abs', ['core'], ['cable'], 'spinal_flexion', {
    reps: [12, 18], restSec: 60, jointStress: 1,
    technique: ['De rodillas sujetando la cuerda tras la cabeza', 'Flexionar la columna llevando costillas a la pelvis'],
    commonErrors: ['Mover las caderas hacia atrás como si fuera una sentadilla'],
    alternatives: ['cable_crunch', 'hanging_knee_raise'],
  }),
  e('cable_woodchopper', 'Leñador en polea (Woodchopper diagonal)', 'abs', ['core'], ['cable'], 'anti_rotation', {
    reps: [12, 15], restSec: 45, jointStress: 1,
    technique: ['Giro de polea alta a cadera opuesta activando oblicuos'],
    commonErrors: ['Girar solo los brazos sin rotación torácica controlada'],
    alternatives: ['pallof_press', 'cable_twist'],
  }),

  // ======================= CALISTENIA MILITAR & PESO CORPORAL (DESAFÍO 21 APK)
  e('military_archer_pushup', 'Flexiones arquero militares', 'chest', ['triceps', 'shoulders', 'core'], ['bodyweight'], 'horizontal_push', {
    level: 'advanced', reps: [6, 10], restSec: 75, jointStress: 2,
    technique: ['Manos abiertas más del ancho biacromial', 'Bajar cargando todo el peso sobre un brazo mientras el otro se extiende recto'],
    commonErrors: ['Desalinear la pelvis y perder tensión en el core'],
    alternatives: ['push_up', 'diamond_push_up', 'dips_parallel_bars'],
  }),
  e('military_spiderman_pushup', 'Flexiones Spiderman tácticas', 'chest', ['core', 'abs', 'shoulders'], ['bodyweight'], 'horizontal_push', {
    level: 'intermediate', reps: [10, 16], restSec: 60, jointStress: 2,
    technique: ['Llevar la rodilla al codo ipsilateral simultáneamente en cada flexión'],
    commonErrors: ['Tocar el suelo con la rodilla'],
    alternatives: ['push_up', 'mountain_climbers'],
  }),
  e('tactical_burpee_jump', 'Burpees militares con salto táctico y palmada', 'cardio', ['quads', 'chest', 'core'], ['bodyweight'], 'cardio_hiit', {
    level: 'intermediate', reps: [10, 18], timed: true, restSec: 45, jointStress: 2,
    technique: ['Pecho a tierra con flexión completa', 'Salto vertical explosivo'],
    commonErrors: ['Arquear la columna lumbar al subir de la flexión'],
    alternatives: ['bodyweight_hiit', 'mountain_climbers'],
  }),
  e('military_mountain_climbers', 'Escaladores militares continuos de alta cadencia', 'core', ['abs', 'shoulders', 'cardio'], ['bodyweight'], 'cardio_hiit', {
    level: 'beginner', reps: [30, 50], timed: true, restSec: 45, jointStress: 1,
    technique: ['Posición de plancha alta', 'Rodillas alternas al pecho a ritmo dinámico'],
    commonErrors: ['Elevar demasiado los glúteos'],
    alternatives: ['plank', 'hanging_knee_raise'],
  }),
  e('tactical_hollow_body_hold', 'Hollow Body Hold militar (bloqueo pélvico)', 'abs', ['core'], ['bodyweight'], 'anti_extension', {
    level: 'intermediate', reps: [30, 60], timed: true, restSec: 60, jointStress: 1,
    technique: ['Espalda lumbar 100% pegada al suelo', 'Brazos extendidos atrás y piernas juntas estiradas a 15cm del piso'],
    commonErrors: ['Despegar la zona lumbar del piso'],
    alternatives: ['plank', 'dead_bug'],
  }),
  e('military_bear_crawl', 'Paso del oso táctico militar (Bear Crawl)', 'core', ['shoulders', 'quads'], ['bodyweight'], 'cardio_hiit', {
    level: 'intermediate', reps: [20, 40], timed: true, restSec: 60, jointStress: 1,
    technique: ['Rodillas a 5cm del piso bajo las caderas', 'Desplazamiento cruzado mano derecha-pie izquierdo manteniendo espalda plana'],
    commonErrors: ['Levantar los glúteos en exceso'],
    alternatives: ['plank', 'bodyweight_hiit'],
  }),
  e('military_jump_squat', 'Sentadillas militares con salto pliométrico', 'quads', ['glutes', 'calves'], ['bodyweight'], 'squat', {
    level: 'intermediate', reps: [15, 20], restSec: 60, jointStress: 2,
    technique: ['Sentadilla profunda seguida de triple extensión explosiva de tobillos, rodillas y caderas', 'Recepción suave en punta de pies amortiguando'],
    commonErrors: ['Aterrizar con rodillas rígidas o colapsadas'],
    alternatives: ['bodyweight_squat', 'walking_lunge'],
  }),
  e('tactical_pistol_squat_progression', 'Pistol Squat táctico asistido (una pierna)', 'quads', ['glutes', 'core'], ['bodyweight'], 'squat', {
    level: 'advanced', reps: [5, 8], restSec: 90, jointStress: 3,
    technique: ['Una pierna suspendida hacia adelante sin tocar el piso', 'Bajar hasta profundidad completa sobre la pierna de apoyo manteniendo talón pegado'],
    commonErrors: ['Levantar el talón del suelo'],
    alternatives: ['bulgarian_split_squat', 'walking_lunge'],
  }),
];

export const EXERCISE_BY_ID: ReadonlyMap<string, Exercise> = new Map(EXERCISES.map((x) => [x.id, x]));

export function getExercise(id: string): Exercise {
  const ex = EXERCISE_BY_ID.get(id);
  if (!ex) throw new Error(`Ejercicio no encontrado: ${id}`);
  return ex;
}
