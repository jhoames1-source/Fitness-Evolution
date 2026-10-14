import { describe, it, expect } from 'vitest';
import { findAlternatives, PAIN_NOTICE } from './alternatives';
import { EXERCISES, getExercise } from '../../seed-content/exercises';

describe('Motor de Ejercicios Alternativos (alternatives.ts)', () => {
  it('encuentra alternativas a "Press plano con mancuernas" cuando las mancuernas están ocupadas', () => {
    const base = getExercise('db_bench_press');
    const result = findAlternatives(base, 'dumbbells_busy', EXERCISES);

    expect(result.suggestions.length).toBeGreaterThan(0);
    // Ninguna sugerencia debe requerir mancuernas
    for (const s of result.suggestions) {
      expect(s.exercise.equipment.includes('dumbbell')).toBe(false);
      // Deben ser ejercicios de empuje o pecho
      expect(s.exercise.primary).toBe('chest');
    }
  });

  it('encuentra alternativas a "Sentadilla en máquina Smith" cuando la máquina está ocupada', () => {
    const base = getExercise('smith_squat');
    const result = findAlternatives(base, 'machine_busy', EXERCISES);

    expect(result.suggestions.length).toBeGreaterThan(0);
    for (const s of result.suggestions) {
      expect(s.exercise.equipment.includes('smith')).toBe(false);
      expect(s.exercise.equipment.includes('machine')).toBe(false);
      expect(s.exercise.pattern).toBe('squat');
    }
  });

  it('incluye advertencia de seguridad y reduce carga articular ante motivo "pain"', () => {
    const base = getExercise('barbell_bench_press'); // jointStress = 2
    const result = findAlternatives(base, 'pain', EXERCISES);

    expect(result.safetyNotice).toBe(PAIN_NOTICE);
    for (const s of result.suggestions) {
      expect(s.exercise.jointStress).toBeLessThanOrEqual(base.jointStress);
    }
  });

  it('devuelve solo opciones sin equipamiento cuando el motivo es "no_equipment"', () => {
    const base = getExercise('lat_pulldown');
    const result = findAlternatives(base, 'no_equipment', EXERCISES);

    expect(result.suggestions.length).toBeGreaterThan(0);
    for (const s of result.suggestions) {
      expect(s.exercise.equipment.every((eq) => eq === 'bodyweight' || eq === 'band')).toBe(true);
    }
  });
});
