import type { Food, Nutrients } from './types';

/** Nutrientes para una cantidad (g o ml) de un alimento. */
export function nutrientsFor(food: Food, amount: number): Nutrients {
  if (!(amount >= 0)) throw new Error('Cantidad inválida');
  const f = amount / 100;
  const p = food.per100;
  return {
    kcal: Math.round(p.kcal * f),
    proteinG: r1(p.proteinG * f),
    carbsG: r1(p.carbsG * f),
    fatG: r1(p.fatG * f),
    fiberG: r1(p.fiberG * f),
    alcoholG: p.alcoholG ? r1(p.alcoholG * f) : undefined,
  };
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  const t = items.reduce(
    (a, n) => ({
      kcal: a.kcal + n.kcal,
      proteinG: a.proteinG + n.proteinG,
      carbsG: a.carbsG + n.carbsG,
      fatG: a.fatG + n.fatG,
      fiberG: a.fiberG + n.fiberG,
      alcoholG: (a.alcoholG ?? 0) + (n.alcoholG ?? 0),
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, alcoholG: 0 } as Nutrients,
  );
  return {
    kcal: Math.round(t.kcal),
    proteinG: r1(t.proteinG),
    carbsG: r1(t.carbsG),
    fatG: r1(t.fatG),
    fiberG: r1(t.fiberG),
    alcoholG: t.alcoholG ? r1(t.alcoholG) : undefined,
  };
}

/** kcal calculadas por Atwater a partir de los macros (control de calidad de datos). */
export function atwaterKcal(n: Nutrients): number {
  return Math.round(n.proteinG * 4 + n.carbsG * 4 + n.fatG * 9 + (n.alcoholG ?? 0) * 7);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
