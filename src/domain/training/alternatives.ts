/**
 * SISTEMA DE EJERCICIOS ALTERNATIVOS
 * Dado un ejercicio y un motivo (máquina ocupada, dolor, sin equipamiento…), devuelve
 * alternativas ordenadas que conservan, en lo posible, el patrón de movimiento y el músculo.
 *
 * Orden de preferencia:
 *  1. Alternativas curadas del catálogo.
 *  2. Mismo patrón de movimiento + mismo músculo principal.
 *  3. Mismo músculo principal (otro patrón) como último recurso.
 */
import type { Equipment, Exercise, SwapReason } from './types';
export type { SwapReason } from './types';
export { SWAP_REASON_LABELS } from './types';

export interface SwapContext {
  /** Equipamiento disponible del usuario. Si se omite se asume gimnasio completo. */
  availableEquipment?: Equipment[];
  level?: Exercise['level'];
  /** Ejercicios que el usuario marcó como "no puedo hacer" */
  excludedIds?: string[];
  limit?: number;
}

export interface SwapSuggestion {
  exercise: Exercise;
  score: number;
  reasons: string[];
}

export interface SwapResult {
  suggestions: SwapSuggestion[];
  /** Mensaje de seguridad obligatorio para el motivo "dolor" */
  safetyNotice?: string;
}

export const PAIN_NOTICE =
  'Si notas dolor agudo, detén el ejercicio. Si la molestia persiste o empeora, se recomienda consultar a un profesional sanitario.';

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 } as const;

/** Equipamiento que queda descartado según el motivo. */
function blockedEquipment(reason: SwapReason): Set<Equipment> {
  switch (reason) {
    case 'dumbbells_busy':
      return new Set(['dumbbell']);
    case 'barbell_busy':
      return new Set(['barbell', 'ez_bar']);
    case 'cable_busy':
      return new Set(['cable']);
    case 'machine_busy':
      return new Set(['machine', 'smith']);
    default:
      return new Set();
  }
}

function equipmentAllowed(ex: Exercise, reason: SwapReason, ctx: SwapContext): boolean {
  if (reason === 'no_equipment') {
    const extra = new Set<Equipment>(ctx.availableEquipment?.filter((q): q is 'band' => q === 'band') ?? []);
    return ex.equipment.every((q) => q === 'bodyweight' || extra.has(q));
  }
  const blocked = blockedEquipment(reason);
  if (ex.equipment.some((q) => blocked.has(q))) return false;
  if (ctx.availableEquipment) {
    const avail = new Set<Equipment>([...ctx.availableEquipment, 'bodyweight']);
    if (!ex.equipment.every((q) => avail.has(q))) return false;
  }
  return true;
}

export function findAlternatives(
  base: Exercise,
  reason: SwapReason,
  catalog: readonly Exercise[],
  ctx: SwapContext = {},
): SwapResult {
  const limit = ctx.limit ?? 5;
  const excluded = new Set([base.id, ...(ctx.excludedIds ?? [])]);
  const curated = new Map(base.alternatives.map((id, i) => [id, i]));

  const score = (ex: Exercise): SwapSuggestion | null => {
    if (excluded.has(ex.id)) return null;
    if (!equipmentAllowed(ex, reason, ctx)) return null;
    if (reason === 'pain' && ex.jointStress >= base.jointStress && ex.jointStress > 1) return null;

    const reasons: string[] = [];
    let s = 0;
    const isCurated = curated.has(ex.id);
    if (isCurated) {
      s += 4 - Math.min(curated.get(ex.id)! * 0.3, 2);
      reasons.push('Alternativa recomendada');
    }
    if (ex.pattern === base.pattern) {
      s += 3;
      reasons.push('Mismo patrón de movimiento');
    }
    if (ex.primary === base.primary) {
      s += 2;
      reasons.push('Mismo músculo principal');
    } else if (!isCurated) {
      return null; // no proponer ejercicios de otro músculo salvo curados
    }
    s += 0.5 * ex.secondary.filter((m) => base.secondary.includes(m)).length;
    if (reason === 'pain') {
      s += (base.jointStress - ex.jointStress) * 1.5;
      reasons.push('Menor carga articular');
    }
    if (ctx.level && LEVEL_RANK[ex.level] > LEVEL_RANK[ctx.level]) s -= 2;
    return { exercise: ex, score: Math.round(s * 100) / 100, reasons };
  };

  let suggestions = catalog
    .map(score)
    .filter((x): x is SwapSuggestion => x !== null)
    .sort((a, b) => b.score - a.score);

  // Si hay suficientes del mismo patrón, priorizarlas sobre "mismo músculo, otro patrón".
  const samePattern = suggestions.filter((x) => x.exercise.pattern === base.pattern);
  if (samePattern.length >= Math.min(3, limit)) {
    suggestions = [...samePattern, ...suggestions.filter((x) => x.exercise.pattern !== base.pattern)];
  }

  return {
    suggestions: suggestions.slice(0, limit),
    safetyNotice: reason === 'pain' ? PAIN_NOTICE : undefined,
  };
}
