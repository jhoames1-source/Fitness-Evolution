import { describe, it, expect } from 'vitest';
import {
  bmi,
  bmr,
  tdee,
  macroTargets,
  waterTargetMl,
  calorieFloor,
  ageFromBirthDate,
} from './energy';

describe('Motor de Cálculo Energético (energy.ts)', () => {
  it('calcula la edad correctamente a partir de la fecha de nacimiento', () => {
    const refDate = new Date('2026-10-12T00:00:00');
    expect(ageFromBirthDate('1988-06-15', refDate)).toBe(38);
    expect(ageFromBirthDate('2002-04-10', refDate)).toBe(24);
  });

  it('calcula el IMC y su categoría', () => {
    // 78 kg y 172 cm -> 78 / (1.72^2) = 26.37 -> Sobrepeso
    const res = bmi(78, 172);
    expect(res.value).toBe(26.4);
    expect(res.category).toBe('overweight');

    // 70 kg y 172 cm -> 70 / (1.72^2) = 23.66 -> Normal
    const targetBmi = bmi(70, 172);
    expect(targetBmi.value).toBe(23.7);
    expect(targetBmi.category).toBe('normal');
  });

  it('calcula la TMB según Mifflin-St Jeor para hombre de 38 años, 78 kg y 172 cm', () => {
    // 10*78 + 6.25*172 - 5*38 + 5 = 780 + 1075 - 190 + 5 = 1670 kcal
    const val = bmr(
      {
        sex: 'male',
        birthDate: '1988-06-15',
        heightCm: 172,
        weightKg: 78,
      },
      'mifflin_st_jeor',
      new Date('2026-10-12T00:00:00')
    );
    expect(val).toBe(1670);
  });

  it('calcula el TDEE considerando actividad moderada y 6 días de entreno', () => {
    const bmrVal = 1670;
    const res = tdee(bmrVal, {
      dailyActivity: 'moderate', // 1.5
      trainingDaysPerWeek: 6, // 6 * 0.025 = +0.15 -> total 1.65
      sessionMinutes: 60,
    });
    // 1670 * 1.65 = 2755.5 -> 2756
    expect(res).toBeGreaterThan(2500);
    expect(res).toBeLessThan(2850);
  });

  it('reparte macros respetando los requerimientos de proteína para pérdida de peso', () => {
    const targets = macroTargets({
      calories: 1850,
      weightKg: 78,
      heightCm: 172,
      goal: 'lose_weight',
    });

    // 78 kg * 2.0 g/kg = 156 g proteína
    expect(targets.proteinG).toBe(156);
    // Grasa mínima de seguridad
    expect(targets.fatG).toBeGreaterThanOrEqual(50);
    // Carbohidratos positivos y fibra calculada
    expect(targets.carbsG).toBeGreaterThan(100);
    expect(targets.fiberG).toBe(26);
  });

  it('respeta el suelo calórico de seguridad', () => {
    const floorMale = calorieFloor('male', 1670);
    expect(floorMale).toBe(1670);

    const floorFemale = calorieFloor('female', 1150);
    expect(floorFemale).toBe(1200); // Nunca menos de 1200 kcal para mujeres
  });

  it('calcula la meta de agua incluyendo extra por entrenamiento', () => {
    // 78 kg * 35 ml = 2730 + (60/60 * 500) = 3230 -> redondeo a 3250 ml
    const water = waterTargetMl(78, 60);
    expect(water).toBe(3250);
  });
});
