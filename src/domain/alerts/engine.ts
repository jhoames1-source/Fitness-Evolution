/**
 * MOTOR DE ALERTAS INTELIGENTES
 * Genera avisos contextuales basados en patrones de uso, entrenamiento y nutrición.
 * ⚠️ REGLA: Nunca diagnosticar enfermedades ni emitir juicios morales.
 */

export interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'celebration' | 'medical_notice';
  title: string;
  message: string;
  actionText?: string;
}

export interface UserContextSnapshot {
  consecutiveTrainingDays: number;
  daysWithoutFoodLog: number;
  calorieFloor: number;
  recentLoggedCalories?: number;
  consecutiveWeeksStalledWeight: number;
  waistDecreasingWhileWeightStable: boolean;
  performanceDroppingWeeks: number;
  hasNightSweatsNotice: boolean;
}

export function generateSmartAlerts(ctx: UserContextSnapshot): AlertItem[] {
  const alerts: AlertItem[] = [];

  // Alerta 1: Sobrecarga de días seguidos
  if (ctx.consecutiveTrainingDays >= 6) {
    alerts.push({
      id: 'consecutive_days',
      type: 'warning',
      title: 'Descanso Recomendado',
      message: `Has completado ${ctx.consecutiveTrainingDays} días consecutivos de entrenamiento. El descanso es donde el músculo se repara y crece. Recuerda tu día de recuperación.`,
      actionText: 'Ver plan de descanso',
    });
  }

  // Alerta 2: Déficit extremo o corte peligroso
  if (ctx.recentLoggedCalories && ctx.recentLoggedCalories < ctx.calorieFloor - 100) {
    alerts.push({
      id: 'extreme_deficit',
      type: 'warning',
      title: 'Aporte Calórico Muy Bajo',
      message: `Tus calorías registradas recientemente (${ctx.recentLoggedCalories} kcal) están por debajo del suelo mínimo seguro (${ctx.calorieFloor} kcal). Restricciones excesivas comprometen el metabolismo y masa muscular.`,
      actionText: 'Revisar metas calóricas',
    });
  }

  // Alerta 3: Desconexión del registro de comida
  if (ctx.daysWithoutFoodLog >= 3) {
    alerts.push({
      id: 'missing_food_logs',
      type: 'info',
      title: 'Retoma tu Registro Nutricional',
      message: `Han pasado ${ctx.daysWithoutFoodLog} días sin registrar alimentos. El registro no busca perfección, sino darte visibilidad de lo que nutre tu cuerpo.`,
      actionText: 'Registrar comida rápida',
    });
  }

  // Alerta 4: Recomposición corporal
  if (ctx.waistDecreasingWhileWeightStable) {
    alerts.push({
      id: 'recomp_detected',
      type: 'celebration',
      title: 'Recomposición Corporal Activa',
      message: '¡Tu cintura está disminuyendo aunque el peso en báscula se mantenga estable! Esto indica ganancia de densidad muscular y pérdida de grasa simultánea.',
    });
  }

  // Alerta 5: Estancamiento de peso prolongado
  if (ctx.consecutiveWeeksStalledWeight >= 2 && !ctx.waistDecreasingWhileWeightStable) {
    alerts.push({
      id: 'weight_stalled',
      type: 'info',
      title: 'Peso Promedio Estable',
      message: 'Tu promedio semanal no ha variado en 2 semanas. El motor de revisión semanal puede evaluar un ajuste progresivo de pasos o calorías.',
      actionText: 'Hacer revisión semanal',
    });
  }

  // Alerta 6: Caída prolongada de rendimiento
  if (ctx.performanceDroppingWeeks >= 2) {
    alerts.push({
      id: 'performance_drop',
      type: 'warning',
      title: 'Disminución de Rendimiento Detectada',
      message: 'Tus cargas o repeticiones han disminuido 2 semanas consecutivas. Suele deberse a falta de sueño, estrés o déficit calórico prolongado. Considera una semana suave.',
    });
  }

  // Alerta 7: Síntoma de alarma (Regla 31)
  if (ctx.hasNightSweatsNotice) {
    alerts.push({
      id: 'symptom_alert',
      type: 'medical_notice',
      title: 'Aviso de Recuperación y Salud',
      message: 'Has registrado episodios repetidos de sudoración nocturna. Se recomienda consultar a un profesional sanitario para una valoración integral.',
    });
  }

  return alerts;
}
