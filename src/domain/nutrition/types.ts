export type FoodCategory =
  | 'protein'
  | 'carbs'
  | 'vegetables'
  | 'fruits'
  | 'fats'
  | 'dairy'
  | 'drinks'
  | 'dishes'
  | 'processed';

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein: 'Proteínas',
  carbs: 'Carbohidratos',
  vegetables: 'Verduras',
  fruits: 'Frutas',
  fats: 'Grasas',
  dairy: 'Lácteos',
  drinks: 'Bebidas',
  dishes: 'Platos Típicos y Preparados',
  processed: 'Alimentos procesados',
};

export interface Nutrients {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  /** Etanol en g (7 kcal/g). Se informa aparte de los macros. */
  alcoholG?: number;
}

export interface Serving {
  label: string;
  /** gramos o mililitros según la unidad del alimento */
  amount: number;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  /** Unidad de referencia; los valores son por 100 g o 100 ml */
  unit: 'g' | 'ml';
  per100: Nutrients;
  servings: Serving[];
  /** Fuente aproximada de los datos */
  source: 'CENAN-TPCA' | 'USDA' | 'estimado';
  tags?: string[];
  notes?: string;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  drink: 'Bebida',
};
