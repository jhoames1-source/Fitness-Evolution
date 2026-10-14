/**
 * MOTOR DE PROGRESIÓN Y SOBRECARGA PROGRESIVA
 * Analiza el historial de series de un ejercicio específico.
 * Si el usuario logra:
 *   - Mismo peso + más repeticiones
 *   - Mismo número de repeticiones + mayor peso
 *   - Mismo peso y reps pero con mayor RIR (menor esfuerzo percibido)
 * -> Dispara la señal "PROGRESIÓN DETECTADA".
 * Sugiere incrementos prudentes (ej. +2.5% a 5% en tren superior / +5% a 10% en tren inferior)
 * SOLO cuando se alcanza el tope superior del rango de repeticiones en todas las series de trabajo con RIR adecuado.
 * NUNCA fuerza un aumento automático irresponsable.
 */

export interface HistoricalSet {
  date: string;
  weightKg: number;
  reps: number;
  rir?: number;
  completed: boolean;
}

export interface ExerciseSessionHistory {
  date: string;
  sets: HistoricalSet[];
}

export interface ProgressionAnalysis {
  progressionDetected: boolean;
  type?: 'weight_increase' | 'reps_increase' | 'efficiency_rir' | 'none';
  message: string;
  recommendation?: {
    action: 'increase_load' | 'maintain_load_seek_reps' | 'deload_or_review';
    suggestedWeightKg?: number;
    explanation: string;
  };
}

export function evaluateProgression(params: {
  exerciseName: string;
  targetRepRange: [number, number];
  previousSession?: ExerciseSessionHistory;
  currentSession: ExerciseSessionHistory;
  isLowerBody?: boolean;
}): ProgressionAnalysis {
  const { exerciseName, targetRepRange, previousSession, currentSession, isLowerBody } = params;

  const validCurrentSets = currentSession.sets.filter((s) => s.completed && s.reps > 0);
  if (validCurrentSets.length === 0) {
    return {
      progressionDetected: false,
      message: 'No hay series válidas completadas en la sesión actual.',
    };
  }

  // Si es la primera sesión registrada
  if (!previousSession || previousSession.sets.length === 0) {
    const allAtTop = validCurrentSets.every((s) => s.reps >= targetRepRange[1]);
    return {
      progressionDetected: false,
      message: `Primera sesión registrada de ${exerciseName}. Carga base establecida.`,
      recommendation: allAtTop
        ? {
            action: 'increase_load',
            explanation: `Completaste todas las series en el tope del rango (${targetRepRange[1]} reps). Considera subir un pequeño incremento en la próxima sesión.`,
          }
        : {
            action: 'maintain_load_seek_reps',
            explanation: `Mantén la carga actual e intenta sumar repeticiones controladas hacia el rango de ${targetRepRange[0]}–${targetRepRange[1]}.`,
          },
    };
  }

  const validPrevSets = previousSession.sets.filter((s) => s.completed && s.reps > 0);

  // Calcular métricas agregadas (peso medio y repeticiones medias de las series de trabajo)
  const prevAvgWeight = validPrevSets.reduce((acc, s) => acc + s.weightKg, 0) / validPrevSets.length;
  const currAvgWeight = validCurrentSets.reduce((acc, s) => acc + s.weightKg, 0) / validCurrentSets.length;

  const prevTotalReps = validPrevSets.reduce((acc, s) => acc + s.reps, 0);
  const currTotalReps = validCurrentSets.reduce((acc, s) => acc + s.reps, 0);

  // Caso 1: Mayor peso manteniendo o aumentando reps
  if (currAvgWeight > prevAvgWeight && currTotalReps >= prevTotalReps) {
    const diffKg = Math.round((currAvgWeight - prevAvgWeight) * 10) / 10;
    return {
      progressionDetected: true,
      type: 'weight_increase',
      message: `¡PROGRESIÓN DETECTADA en ${exerciseName}! Aumentaste el peso en promedio +${diffKg} kg manteniendo el volumen de repeticiones.`,
      recommendation: {
        action: 'maintain_load_seek_reps',
        explanation: 'Excelente adaptación. Afianza esta nueva carga durante 1 o 2 sesiones antes de volver a subir peso.',
      },
    };
  }

  // Caso 2: Mismo peso pero más repeticiones
  if (Math.abs(currAvgWeight - prevAvgWeight) < 0.5 && currTotalReps > prevTotalReps) {
    const diffReps = currTotalReps - prevTotalReps;
    const allHitTop = validCurrentSets.every((s) => s.reps >= targetRepRange[1]);
    const pctInc = isLowerBody ? 0.05 : 0.025; // 5% tren inferior, 2.5% tren superior
    const nextWeight = Math.round((currAvgWeight * (1 + pctInc)) * 2) / 2;

    return {
      progressionDetected: true,
      type: 'reps_increase',
      message: `¡PROGRESIÓN DETECTADA en ${exerciseName}! Conseguiste +${diffReps} repeticiones totales con el mismo peso.`,
      recommendation: allHitTop
        ? {
            action: 'increase_load',
            suggestedWeightKg: nextWeight,
            explanation: `Llegaste al tope del rango (${targetRepRange[1]} reps) en todas las series. Se recomienda subir a ~${nextWeight} kg.`,
          }
        : {
            action: 'maintain_load_seek_reps',
            explanation: `Sigue sumando repeticiones hasta que todas las series alcancen ${targetRepRange[1]} reps de forma sólida.`,
          },
    };
  }

  // Caso 3: RIR mejorado (mismo peso y reps pero menor fatiga)
  const prevAvgRir = validPrevSets.reduce((acc, s) => acc + (s.rir ?? 0), 0) / validPrevSets.length;
  const currAvgRir = validCurrentSets.reduce((acc, s) => acc + (s.rir ?? 0), 0) / validCurrentSets.length;

  if (Math.abs(currAvgWeight - prevAvgWeight) < 0.5 && currTotalReps === prevTotalReps && currAvgRir > prevAvgRir + 0.5) {
    return {
      progressionDetected: true,
      type: 'efficiency_rir',
      message: `¡PROGRESIÓN DE EFICIENCIA en ${exerciseName}! Moviste la misma carga y repeticiones con mayor reserva (RIR más alto, menor esfuerzo).`,
      recommendation: {
        action: 'maintain_load_seek_reps',
        explanation: 'Tu sistema nervioso y muscular están dominando el movimiento. En la próxima sesión busca 1 o 2 repeticiones extra.',
      },
    };
  }

  // Sin progresión evidente o rendimiento similar
  return {
    progressionDetected: false,
    message: `Rendimiento consolidado en ${exerciseName}. Mantén el foco en la técnica limpia.`,
    recommendation: {
      action: 'maintain_load_seek_reps',
      explanation: 'La adaptación muscular requiere consolidar estímulos. Prioriza el control excéntrico y la técnica antes de incrementar.',
    },
  };
}
