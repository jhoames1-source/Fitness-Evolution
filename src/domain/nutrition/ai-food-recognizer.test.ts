import { describe, it, expect } from 'vitest';
import { recognizeAndEstimateFood } from './ai-food-recognizer';

describe('AI Food Recognizer and Estimator', () => {
  it('recognizes traditional dishes like lomo saltado and estimates accurate macros', () => {
    const res = recognizeAndEstimateFood({ query: 'lomo saltado con papas' });
    expect(res.name).toContain('Lomo Saltado');
    expect(res.category).toBe('dishes');
    expect(res.per100.proteinG).toBeGreaterThan(10);
    expect(res.per100.carbsG).toBeGreaterThan(10);
    expect(res.per100.kcal).toBeGreaterThanOrEqual(130);
    expect(res.confidencePct).toBeGreaterThanOrEqual(90);
  });

  it('recognizes andean foods like tarwi/chocho with high protein values', () => {
    const res = recognizeAndEstimateFood({ query: 'chocho tarwi' });
    expect(res.name).toContain('Tarwi');
    expect(res.category).toBe('protein');
    expect(res.per100.proteinG).toBeGreaterThanOrEqual(15);
    expect(res.confidencePct).toBeGreaterThanOrEqual(90);
  });

  it('recognizes fitness supplements like whey protein and estimates >70g protein/100g', () => {
    const res = recognizeAndEstimateFood({ query: 'proteina whey' });
    expect(res.name).toContain('Whey');
    expect(res.category).toBe('protein');
    expect(res.per100.proteinG).toBeGreaterThanOrEqual(75);
    expect(res.per100.kcal).toBeGreaterThanOrEqual(350);
  });

  it('generatively infers compound or generic queries cleanly', () => {
    const res = recognizeAndEstimateFood({ query: 'jugo de fresa y naranja' });
    expect(res.unit).toBe('ml');
    expect(res.category).toBe('drinks');
    expect(res.per100.kcal).toBeLessThan(100);
  });

  it('supports passing plain string directly as input', () => {
    const res = recognizeAndEstimateFood('caldo verde con quesillo');
    expect(res.name.toLowerCase()).toContain('caldo verde');
    expect(res.category).toBe('dishes');
    expect(res.per100.proteinG).toBeGreaterThan(3);
    expect(res.confidencePct).toBeGreaterThanOrEqual(90);
  });

  it('recognizes traditional Andean preparations like sango de trigo and cuy frito', () => {
    const sango = recognizeAndEstimateFood('sango de trigo');
    expect(sango.name).toContain('Sango');
    expect(sango.category).toBe('dishes');

    const cuy = recognizeAndEstimateFood('cuy frito con papas');
    expect(cuy.name).toContain('Cuy');
    expect(cuy.category).toBe('protein');
    expect(cuy.per100.proteinG).toBeGreaterThan(15);
  });
});
