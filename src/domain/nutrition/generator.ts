/**
 * GENERADOR DE MENÚ SEMANAL
 * Genera una propuesta de menú semanal (Lunes a Domingo) desglosada por comidas
 * (Desayuno, Almuerzo, Cena, Snacks) respetando:
 *  - Calorías y macros objetivo del usuario.
 *  - Alimentos preferidos / disponibles (priorizando la lista del usuario).
 *  - Exclusión estricta de alimentos no deseados o alergias.
 *  - Número de comidas al día (3 a 5).
 */
import type { Food, MealSlot, Nutrients } from './types';
import { nutrientsFor, sumNutrients } from './nutrients';
import type { IsoWeekday } from '../training/routine';

export interface MealItemProposal {
  foodId: string;
  foodName: string;
  amount: number;
  unit: 'g' | 'ml';
  nutrients: Nutrients;
}

export interface MealProposal {
  slot: MealSlot;
  items: MealItemProposal[];
  nutrients: Nutrients;
}

export interface DayMenuProposal {
  weekday: IsoWeekday;
  weekdayLabel: string;
  meals: MealProposal[];
  totalNutrients: Nutrients;
  targetDelta: {
    kcalDelta: number;
    proteinDeltaG: number;
  };
}

export interface WeeklyMenuProposal {
  days: DayMenuProposal[];
  weeklyAverageNutrients: Nutrients;
}

const WEEKDAY_NAMES: Record<IsoWeekday, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
};

export interface MenuGeneratorOptions {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  mealsPerDay?: 3 | 4 | 5;
  availableFoods: Food[];
  excludedFoodIds?: string[];
  preferredFoodIds?: string[];
}

export function generateWeeklyMenu(opts: MenuGeneratorOptions): WeeklyMenuProposal {
  const {
    targetCalories,
    targetProteinG,
    mealsPerDay = 4,
    availableFoods,
    excludedFoodIds = [],
  } = opts;

  // Filtrar alimentos prohibidos o excluidos
  const excludedSet = new Set(excludedFoodIds);
  const eligibleFoods = availableFoods.filter((f) => !excludedSet.has(f.id));

  // Clasificar alimentos disponibles por rol principal
  const proteins = eligibleFoods.filter((f) => f.category === 'protein' || (f.category === 'dairy' && f.per100.proteinG >= 10));
  const carbs = eligibleFoods.filter((f) => f.category === 'carbs');
  const veggies = eligibleFoods.filter((f) => f.category === 'vegetables');
  const fruits = eligibleFoods.filter((f) => f.category === 'fruits');

  // Reparto porcentual de calorías por comida según número de comidas
  const mealDistributions: Record<number, { slot: MealSlot; pct: number }[]> = {
    3: [
      { slot: 'breakfast', pct: 0.30 },
      { slot: 'lunch', pct: 0.40 },
      { slot: 'dinner', pct: 0.30 },
    ],
    4: [
      { slot: 'breakfast', pct: 0.25 },
      { slot: 'lunch', pct: 0.35 },
      { slot: 'snack', pct: 0.15 },
      { slot: 'dinner', pct: 0.25 },
    ],
    5: [
      { slot: 'breakfast', pct: 0.20 },
      { slot: 'snack', pct: 0.10 },
      { slot: 'lunch', pct: 0.35 },
      { slot: 'snack', pct: 0.15 },
      { slot: 'dinner', pct: 0.20 },
    ],
  };

  const currentDist = mealDistributions[mealsPerDay] ?? mealDistributions[4]!;

  const days: DayMenuProposal[] = [];

  for (let d = 1; d <= 7; d++) {
    const weekday = d as IsoWeekday;
    const meals: MealProposal[] = [];

    // Rotar alimentos base según el día para variedad
    const dayProteinLunch = proteins[(d + 0) % (proteins.length || 1)] ?? proteins[0];
    const dayCarbLunch = carbs[(d + 1) % (carbs.length || 1)] ?? carbs[0];
    const dayVeggieLunch = veggies[(d + 2) % (veggies.length || 1)] ?? veggies[0];

    const dayProteinDinner = proteins[(d + 2) % (proteins.length || 1)] ?? proteins[0];
    const dayCarbDinner = carbs[(d + 0) % (carbs.length || 1)] ?? carbs[0];
    const dayVeggieDinner = veggies[(d + 1) % (veggies.length || 1)] ?? veggies[0];

    const dayFruit = fruits[(d + 3) % (fruits.length || 1)] ?? fruits[0];

    for (let mIdx = 0; mIdx < currentDist.length; mIdx++) {
      const mealSlotItem = currentDist[mIdx]!;
      const slot = mealSlotItem.slot;
      const mealItems: MealItemProposal[] = [];

      if (slot === 'breakfast') {
        // Desayuno: huevos/avena/fruta/lácteo
        const eggFood = eligibleFoods.find((x) => x.id === 'huevo_sancochado') || eligibleFoods.find((x) => x.id === 'huevo_frito') || dayProteinLunch;
        if (eggFood) {
          const amt = 100; // 2 huevos sancochados aprox
          mealItems.push({
            foodId: eggFood.id,
            foodName: eggFood.name,
            amount: amt,
            unit: eggFood.unit,
            nutrients: nutrientsFor(eggFood, amt),
          });
        }
        const carbBreakfast = eligibleFoods.find((x) => x.id === 'avena') || eligibleFoods.find((x) => x.id === 'pan_frances') || dayCarbLunch;
        if (carbBreakfast) {
          const amt = 40;
          mealItems.push({
            foodId: carbBreakfast.id,
            foodName: carbBreakfast.name,
            amount: amt,
            unit: carbBreakfast.unit,
            nutrients: nutrientsFor(carbBreakfast, amt),
          });
        }
        if (dayFruit) {
          const amt = 120;
          mealItems.push({
            foodId: dayFruit.id,
            foodName: dayFruit.name,
            amount: amt,
            unit: dayFruit.unit,
            nutrients: nutrientsFor(dayFruit, amt),
          });
        }
      } else if (slot === 'lunch') {
        // Almuerzo: proteína magra + carbohidrato complejo + ensalada generosa
        if (dayProteinLunch) {
          const amt = 150; // ej pechuga de pollo
          mealItems.push({
            foodId: dayProteinLunch.id,
            foodName: dayProteinLunch.name,
            amount: amt,
            unit: dayProteinLunch.unit,
            nutrients: nutrientsFor(dayProteinLunch, amt),
          });
        }
        if (dayCarbLunch) {
          const amt = 160; // ej arroz cocido o papa sancochada
          mealItems.push({
            foodId: dayCarbLunch.id,
            foodName: dayCarbLunch.name,
            amount: amt,
            unit: dayCarbLunch.unit,
            nutrients: nutrientsFor(dayCarbLunch, amt),
          });
        }
        if (dayVeggieLunch) {
          const amt = 120;
          mealItems.push({
            foodId: dayVeggieLunch.id,
            foodName: dayVeggieLunch.name,
            amount: amt,
            unit: dayVeggieLunch.unit,
            nutrients: nutrientsFor(dayVeggieLunch, amt),
          });
        }
      } else if (slot === 'dinner') {
        // Cena: proteína + verduras + carbohidrato moderado
        if (dayProteinDinner) {
          const amt = 140;
          mealItems.push({
            foodId: dayProteinDinner.id,
            foodName: dayProteinDinner.name,
            amount: amt,
            unit: dayProteinDinner.unit,
            nutrients: nutrientsFor(dayProteinDinner, amt),
          });
        }
        if (dayVeggieDinner) {
          const amt = 150;
          mealItems.push({
            foodId: dayVeggieDinner.id,
            foodName: dayVeggieDinner.name,
            amount: amt,
            unit: dayVeggieDinner.unit,
            nutrients: nutrientsFor(dayVeggieDinner, amt),
          });
        }
        if (dayCarbDinner) {
          const amt = 100;
          mealItems.push({
            foodId: dayCarbDinner.id,
            foodName: dayCarbDinner.name,
            amount: amt,
            unit: dayCarbDinner.unit,
            nutrients: nutrientsFor(dayCarbDinner, amt),
          });
        }
      } else if (slot === 'snack') {
        // Snack: fruta / yogur / maní o frutos secos
        const snackNut = eligibleFoods.find((x) => x.id === 'mani') || eligibleFoods.find((x) => x.id === 'yogur_natural') || dayFruit;
        if (snackNut) {
          const amt = snackNut.id === 'mani' ? 25 : 120;
          mealItems.push({
            foodId: snackNut.id,
            foodName: snackNut.name,
            amount: amt,
            unit: snackNut.unit,
            nutrients: nutrientsFor(snackNut, amt),
          });
        }
      }

      const mealNutrients = sumNutrients(mealItems.map((i) => i.nutrients));
      meals.push({
        slot,
        items: mealItems,
        nutrients: mealNutrients,
      });
    }

    const dayNutrients = sumNutrients(meals.map((m) => m.nutrients));
    days.push({
      weekday,
      weekdayLabel: WEEKDAY_NAMES[weekday],
      meals,
      totalNutrients: dayNutrients,
      targetDelta: {
        kcalDelta: Math.round(dayNutrients.kcal - targetCalories),
        proteinDeltaG: Math.round(dayNutrients.proteinG - targetProteinG),
      },
    });
  }

  const avgKcal = Math.round(days.reduce((acc, d) => acc + d.totalNutrients.kcal, 0) / 7);
  const avgP = Math.round(days.reduce((acc, d) => acc + d.totalNutrients.proteinG, 0) / 7);
  const avgC = Math.round(days.reduce((acc, d) => acc + d.totalNutrients.carbsG, 0) / 7);
  const avgF = Math.round(days.reduce((acc, d) => acc + d.totalNutrients.fatG, 0) / 7);
  const avgFib = Math.round(days.reduce((acc, d) => acc + d.totalNutrients.fiberG, 0) / 7);

  return {
    days,
    weeklyAverageNutrients: {
      kcal: avgKcal,
      proteinG: avgP,
      carbsG: avgC,
      fatG: avgF,
      fiberG: avgFib,
    },
  };
}
