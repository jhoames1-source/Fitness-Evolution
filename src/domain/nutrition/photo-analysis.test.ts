import { describe, it, expect } from 'vitest';
import { analyzeMealPhoto, recalculatePlateNutrients } from './photo-analysis';

describe('Photo analysis and nutrition vision engine', () => {
  it('correctly identifies components for the user meal photo with salad and potato', () => {
    const fileName = 'WhatsApp Image 2026-10-14 at 7.25.26 PM.jpeg';
    const note = 'ensalada de lechuga con cebolla, una papa sancochada mas una chucarada de pap';

    const result = analyzeMealPhoto(fileName, note);

    expect(result.components.length).toBeGreaterThanOrEqual(4);
    const names = result.components.map((c) => c.name);

    expect(names.some((n) => n.includes('Presa de Pollo al Horno') || n.includes('Carne'))).toBe(true);
    expect(names.some((n) => n.includes('Papa Sancochada'))).toBe(true);
    expect(names.some((n) => n.includes('Ensalada Fresca de Lechuga'))).toBe(true);
    expect(names.some((n) => n.includes('Zanahoria'))).toBe(true);
    expect(names.some((n) => n.includes('Vainitas'))).toBe(true);

    // Realistic caloric range for this plate (~400 - 600 kcal, ~30 - 45g protein)
    expect(result.totalNutrients.kcal).toBeGreaterThanOrEqual(380);
    expect(result.totalNutrients.kcal).toBeLessThanOrEqual(600);
    expect(result.totalNutrients.proteinG).toBeGreaterThanOrEqual(28);
    expect(result.totalNutrients.proteinG).toBeLessThanOrEqual(50);
  });

  it('recalculates nutrients accurately when grams change or components are deleted', () => {
    const fileName = 'foto_huevo.jpg';
    const note = 'dos huevos cocidos con una papa sancochada';

    const initial = analyzeMealPhoto(fileName, note);
    const initialCalories = initial.totalNutrients.kcal;

    // Delete one component
    const filtered = initial.components.filter((c) => !c.name.includes('Papa'));
    const recalculated = recalculatePlateNutrients(filtered, 'breakfast');

    expect(recalculated.totalNutrients.kcal).toBeLessThan(initialCalories);
    expect(recalculated.components.length).toBe(filtered.length);
  });
});
