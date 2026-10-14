import { describe, it, expect } from 'vitest';
import { evaluateGoal } from './feasibility';

describe('Motor de Viabilidad de Objetivos (feasibility.ts)', () => {
  it('evalúa el objetivo del usuario actual (78kg -> 70kg al 31/12/2026)', () => {
    const today = new Date('2026-10-12T00:00:00');
    const result = evaluateGoal(
      {
        body: {
          sex: 'male',
          birthDate: '1988-06-15',
          heightCm: 172,
          weightKg: 78,
        },
        activity: {
          dailyActivity: 'moderate',
          trainingDaysPerWeek: 6,
          sessionMinutes: 60,
        },
        level: 'intermediate',
        goal: 'lose_weight',
        targetWeightKg: 70,
        startDate: '2026-10-12',
        targetDate: '2026-12-31', // ~11.4 semanas para bajar 8 kg -> ~0.70 kg/semana (~0.9% peso)
      },
      today
    );

    // Debe ser clasificado como ambicioso (límite superior de lo seguro)
    expect(result.status).toBe('ambitious');
    expect(result.weeklyPctBodyWeight).toBeCloseTo(0.9, 1);
    expect(result.planCalories).toBeGreaterThanOrEqual(result.calorieFloor);
    // Debe proponer alternativas
    expect(result.alternatives.length).toBeGreaterThan(0);
    expect(result.alternatives.some((a) => a.id === 'safe_pace_same_target')).toBe(true);
  });

  it('detecta un objetivo demasiado agresivo (ej. bajar 10 kg en 3 semanas) y propone alternativa segura', () => {
    const today = new Date('2026-10-12T00:00:00');
    const result = evaluateGoal(
      {
        body: {
          sex: 'male',
          birthDate: '1988-06-15',
          heightCm: 172,
          weightKg: 78,
        },
        activity: {
          dailyActivity: 'sedentary',
          trainingDaysPerWeek: 3,
        },
        level: 'beginner',
        goal: 'lose_weight',
        targetWeightKg: 68,
        startDate: '2026-10-12',
        targetDate: '2026-11-02', // 3 semanas para 10 kg -> >3 kg/semana (>4% peso)
      },
      today
    );

    expect(result.status).toBe('too_aggressive');
    // Las calorías asignadas para el plan no deben ser peligrosas
    expect(result.planCalories).toBeGreaterThanOrEqual(result.calorieFloor);
    expect(result.messages.some((m) => m.includes('demasiado agresivo'))).toBe(true);
    expect(result.alternatives.length).toBeGreaterThan(0);
  });

  it('maneja objetivos de ganancia muscular de forma realista según nivel', () => {
    const today = new Date('2026-10-12T00:00:00');
    const result = evaluateGoal(
      {
        body: {
          sex: 'male',
          birthDate: '2002-04-10',
          heightCm: 180,
          weightKg: 68,
        },
        activity: {
          dailyActivity: 'light',
          trainingDaysPerWeek: 4,
        },
        level: 'beginner',
        goal: 'gain_muscle',
        targetWeightKg: 74,
        startDate: '2026-10-12',
        targetDate: '2027-04-12', // 6 meses para 6 kg -> ~1 kg/mes (adecuado para principiante)
      },
      today
    );

    expect(['comfortable', 'moderate']).toContain(result.status);
    expect(result.planCalories).toBeGreaterThan(result.tdee); // Superávit controlado
  });
});
