/**
 * MOTOR DE REVISIÓN SEMANAL Y AJUSTES DINÁMICOS
 * Evalúa los datos de los últimos 7 a 14 días:
 *  - Media móvil de peso corporal y evolución de cintura.
 *  - Nivel de adherencia nutricional y deportiva.
 *  - Síntomas de fatiga, hambre, estrés y calidad de sueño.
 * Determina si MANTENER o RECOMENDAR UN AJUSTE PROGRESIVO Y PEQUEÑO.
 */

export interface WeeklyReviewInputs {
  previousAvgWeightKg?: number;
  currentAvgWeightKg: number;
  previousWaistCm?: number;
  currentWaistCm?: number;
  weeksOnPlan: number;
  goalType: 'lose_weight' | 'lose_fat' | 'gain_muscle' | 'maintain' | 'recomposition';
  targetWeightKg: number;
  currentPlanCalories: number;
  adherenceOverallPct: number;
  trainingAdherencePct: number;
  avgSleepHours: number;
  symptoms: {
    avgHungerRating?: number; // 1 (nada) a 5 (insoportable)
    avgEnergyRating?: number; // 1 (agotado) a 5 (máquina)
    avgStressRating?: number; // 1 a 5
    persistentJointPain?: boolean;
    nightSweatsEpisodes?: number;
  };
}

export interface ReviewRecommendation {
  status: 'maintain' | 'adjust_calories_down' | 'adjust_calories_up' | 'increase_steps' | 'deload_recommended' | 'medical_consult_alert';
  headline: string;
  weightDeltaKg: number;
  waistDeltaCm?: number;
  proposedCalories: number;
  calorieDelta: number;
  proposedDailyStepsDelta?: number;
  reasons: string[];
  medicalAlert?: string;
}

export function evaluateWeeklyReview(input: WeeklyReviewInputs): ReviewRecommendation {
  const {
    previousAvgWeightKg,
    currentAvgWeightKg,
    previousWaistCm,
    currentWaistCm,
    goalType,
    currentPlanCalories,
    adherenceOverallPct,
    avgSleepHours,
    symptoms,
  } = input;

  const weightDeltaKg = previousAvgWeightKg
    ? Math.round((currentAvgWeightKg - previousAvgWeightKg) * 10) / 10
    : 0;

  const waistDeltaCm = previousWaistCm && currentWaistCm
    ? Math.round((currentWaistCm - previousWaistCm) * 10) / 10
    : undefined;

  const reasons: string[] = [];

  // 1. Alerta médica prioritaria (Regla 31: Síntomas de alarma / Sudoración nocturna)
  let medicalAlert: string | undefined;
  if ((symptoms.nightSweatsEpisodes ?? 0) >= 3) {
    medicalAlert =
      'Has reportado varios episodios de sudoración nocturna esta semana. Se recomienda consultar a un profesional sanitario para descartar causas clínicas ajenas al ejercicio.';
  }

  // 2. Comprobar necesidad de descarga (Deload) por fatiga acumulada
  if (symptoms.persistentJointPain || ((symptoms.avgEnergyRating ?? 3) <= 2 && avgSleepHours < 6.5 && input.trainingAdherencePct >= 90)) {
    reasons.push('Se detectan signos de fatiga acumulada o molestia articular tras entrenar con alta frecuencia.');
    reasons.push('Recomendación: Realizar una semana de descarga (-40% volumen de series de pesas) para regenerar tendones y sistema nervioso.');
    return {
      status: 'deload_recommended',
      headline: 'Semana de Descarga Recomendada (Deload)',
      weightDeltaKg,
      waistDeltaCm,
      proposedCalories: currentPlanCalories,
      calorieDelta: 0,
      reasons,
      medicalAlert,
    };
  }

  // 3. Objetivos de Pérdida de Grasa / Peso
  if (goalType === 'lose_weight' || goalType === 'lose_fat') {
    // Escenario A: Peso baja adecuadamente (-0.3 a -0.9 kg/sem)
    if (weightDeltaKg <= -0.3 && weightDeltaKg >= -1.0) {
      reasons.push(`El peso promedio bajó ${Math.abs(weightDeltaKg)} kg esta semana, dentro de la ventana de pérdida óptima (0.5%–1.0% semanal).`);
      if (waistDeltaCm !== undefined && waistDeltaCm < 0) {
        reasons.push(`La cintura se redujo ${Math.abs(waistDeltaCm)} cm, confirmando pérdida preferencial de tejido graso.`);
      }
      reasons.push('Mantener el plan actual sin cambios.');
      return {
        status: 'maintain',
        headline: 'Progreso Óptimo: Mantener Plan',
        weightDeltaKg,
        waistDeltaCm,
        proposedCalories: currentPlanCalories,
        calorieDelta: 0,
        reasons,
        medicalAlert,
      };
    }

    // Escenario B: Peso estable o sube ligeramente, PERO la cintura disminuye
    if (weightDeltaKg > -0.2 && waistDeltaCm !== undefined && waistDeltaCm <= -0.5) {
      reasons.push('El peso en báscula se mantuvo estable, pero tu cintura disminuyó. Esto es característico de recomposición corporal o retención de líquido temporal en músculo.');
      reasons.push('Recomendación: No precipitar recortes calóricos innecesarios. Mantener.');
      return {
        status: 'maintain',
        headline: 'Recomposición Detectada: Mantener Plan',
        weightDeltaKg,
        waistDeltaCm,
        proposedCalories: currentPlanCalories,
        calorieDelta: 0,
        reasons,
        medicalAlert,
      };
    }

    // Escenario C: Peso no baja (estancamiento) con adherencia alta (>85%)
    if (weightDeltaKg > -0.2 && adherenceOverallPct >= 85 && input.weeksOnPlan >= 2) {
      // Ajuste prudente: recorte leve de ~100 a 150 kcal o aumento de pasos
      const calCut = 120;
      const newCal = Math.max(1500, currentPlanCalories - calCut);
      reasons.push('El peso medio lleva 2 o más semanas sin cambios significativos a pesar de tu buena adherencia.');
      reasons.push(`Ajuste conservador: Reducción de ~${calCut} kcal/día o sumar +1,500 pasos diarios para reactivar el déficit.`);
      return {
        status: 'adjust_calories_down',
        headline: 'Ajuste Dinámico Progresivo Sugerido',
        weightDeltaKg,
        waistDeltaCm,
        proposedCalories: newCal,
        calorieDelta: -calCut,
        proposedDailyStepsDelta: 1500,
        reasons,
        medicalAlert,
      };
    }

    // Escenario D: Peso no baja pero la adherencia fue moderada/baja (<75%)
    if (weightDeltaKg > -0.2 && adherenceOverallPct < 75) {
      reasons.push('La adherencia registrada estuvo por debajo del 75%. Es frecuente que comidas no registradas o fines de semana compensen el déficit entre semana.');
      reasons.push('Recomendación: Mantener las calorías del plan y buscar mayor consistencia en el registro antes de bajar la comida.');
      return {
        status: 'maintain',
        headline: 'Foco en Consistencia: Mantener Plan',
        weightDeltaKg,
        waistDeltaCm,
        proposedCalories: currentPlanCalories,
        calorieDelta: 0,
        reasons,
        medicalAlert,
      };
    }

    // Escenario E: Peso baja demasiado rápido (> -1.2 kg/sem)
    if (weightDeltaKg < -1.2) {
      const calAdd = 150;
      reasons.push(`El peso medio cayó ${Math.abs(weightDeltaKg)} kg esta semana. Un ritmo demasiado veloz compromete la masa muscular y eleva el riesgo de rebote.`);
      reasons.push(`Recomendación: Aumentar +${calAdd} kcal para situar la pérdida en un ritmo más seguro y sostenible.`);
      return {
        status: 'adjust_calories_up',
        headline: 'Pérdida Demasiado Acelerada: Suavizar Déficit',
        weightDeltaKg,
        waistDeltaCm,
        proposedCalories: currentPlanCalories + calAdd,
        calorieDelta: calAdd,
        reasons,
        medicalAlert,
      };
    }
  }

  // Objetivo por defecto / Mantenimiento
  reasons.push('Rendimiento y medidas estables.');
  return {
    status: 'maintain',
    headline: 'Evolución Estable: Continuar',
    weightDeltaKg,
    waistDeltaCm,
    proposedCalories: currentPlanCalories,
    calorieDelta: 0,
    reasons,
    medicalAlert,
  };
}
