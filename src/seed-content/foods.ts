/**
 * BASE DE ALIMENTOS INICIAL
 * Valores por 100 g (o 100 ml en bebidas). Fuentes aproximadas: Tabla Peruana de Composición
 * de Alimentos (CENAN/INS) y USDA FoodData Central. Son valores de referencia: la composición
 * real varía según la marca, la preparación y el tamaño de la porción.
 *
 * tags: 'usuario' = alimentos aportados por el usuario demo.
 */
import type { Food, FoodCategory, Nutrients, Serving } from '../domain/nutrition/types';

function f(
  id: string,
  name: string,
  category: FoodCategory,
  per100: [kcal: number, p: number, c: number, fat: number, fiber: number, alcohol?: number],
  servings: Serving[],
  o: { unit?: 'g' | 'ml'; source?: Food['source']; tags?: string[]; notes?: string } = {},
): Food {
  const [kcal, proteinG, carbsG, fatG, fiberG, alcoholG] = per100;
  const n: Nutrients = { kcal, proteinG, carbsG, fatG, fiberG };
  if (alcoholG) n.alcoholG = alcoholG;
  return { id, name, category, unit: o.unit ?? 'g', per100: n, servings, source: o.source ?? 'USDA', tags: o.tags, notes: o.notes };
}

export const FOODS: Food[] = [
  f('aceite_de_semillas', 'Aceite de semillas', 'fats', [900, 0, 0, 100, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('anticucho', 'Anticucho', 'dishes', [103.4, 14, 3.7, 3.3, 0], [{ label: '1 plato', amount: 261 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('arroz_a_la_cubana', 'Arroz a la cubana', 'dishes', [144.6, 3.2, 21.1, 5.8, 0], [{ label: '1 plato', amount: 415 }], { tags: ['usuario', 'peru'] }),
  f('arroz_chaufa', 'Arroz chaufa', 'dishes', [139, 9.1, 14.2, 4.8, 0], [{ label: '1 plato', amount: 400 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('arroz_cocido', 'Arroz cocido', 'carbs', [130, 2.7, 28.2, 0.3, 2.5], [{ label: '1 plato', amount: 200 }], { tags: ['usuario', 'peru'] }),
  f('arroz_con_leche', 'Arroz con leche', 'dishes', [118, 2.8, 21, 2.5, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('arroz_con_marisco', 'Arroz con marisco', 'dishes', [103.5, 6.5, 13.8, 2.4, 0], [{ label: '1 plato', amount: 517 }], { tags: ['usuario', 'peru'] }),
  f('arroz_con_pollo', 'Arroz con pollo', 'dishes', [158.2, 10, 21.7, 3.9, 0], [{ label: '1 plato', amount: 469 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('avena_salvado', 'Avena, Salvado', 'carbs', [383, 17, 58.9, 8.8, 2.5], [{ label: '50 g', amount: 50 }], { tags: ['usuario', 'peru'] }),
  f('azucar_morena', 'Azucar morena', 'processed', [373, 0, 96.4, 0, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('berenjena', 'Berenjena', 'vegetables', [16, 11, 26, 0.1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('bistec', 'Bistec', 'protein', [120, 24, 0, 26.7, 0], [{ label: '120 g', amount: 120 }], { tags: ['usuario', 'peru'] }),
  f('caballa', 'Caballa', 'protein', [170, 17, 0, 11.1, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('cafe', 'Café', 'drinks', [5, 0.3, 0.7, 0.1, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('camote_cocido', 'Camote cocido', 'carbs', [113, 2, 19.8, 3.3, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('camote_frito', 'Camote frito', 'carbs', [151, 1.5, 18.3, 8.3, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('cerdo_carne_chicharron', 'Cerdo carne - chicharron', 'protein', [545, 61.3, 0, 31.3, 0], [{ label: '100 g', amount: 100 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('cereal_trigo', 'Cereal trigo', 'carbs', [360, 8, 27, 0, 2.5], [{ label: '50 g', amount: 50 }], { tags: ['usuario', 'peru'] }),
  f('cerveza', 'Cerveza', 'drinks', [48, 0.6, 3.8, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('ceviche', 'Ceviche', 'dishes', [83.2, 8.7, 9.5, 0.7, 0], [{ label: '1 plato', amount: 506 }], { tags: ['usuario', 'peru'] }),
  f('chia', 'Chia', 'fats', [490, 17, 42, 31, 0], [{ label: '10 g', amount: 10 }], { tags: ['usuario', 'peru'] }),
  f('chicharron_de_pollo', 'Chicharrón de pollo', 'protein', [181, 14.7, 10.8, 8.4, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('choclo_cocido', 'Choclo cocido', 'carbs', [96, 3.4, 21, 1.2, 2.5], [{ label: '125 g', amount: 125 }], { tags: ['usuario', 'peru'] }),
  f('chocolate', 'Chocolate', 'processed', [564, 8.9, 50.8, 37.9, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('conserva_de_durazno', 'Conserva de durazno', 'fruits', [71.8, 0.8, 16.5, 0, 2.5], [{ label: '170 g', amount: 170 }], { tags: ['usuario', 'peru'] }),
  f('cuy_frito', 'Cuy frito', 'dishes', [135.8, 10.4, 11.7, 5.2, 0], [{ label: '1 plato', amount: 450 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('empanadas', 'Empanadas', 'dishes', [385, 5, 43.5, 21.2, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('fideos', 'Fideos', 'carbs', [369, 12.5, 75.2, 1.2, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('freppe', 'Freppe', 'drinks', [97.3, 3.1, 14.3, 3.2, 0], [{ label: '150 g', amount: 150 }], { tags: ['usuario', 'peru'] }),
  f('fresa', 'Fresa', 'fruits', [27, 0.9, 5.6, 0.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('gaseosa', 'Gaseosa', 'drinks', [48, 0, 12, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('gelatina', 'Gelatina', 'processed', [99.3, 2, 22.7, 0, 0], [{ label: '150 g', amount: 150 }], { tags: ['usuario', 'peru'] }),
  f('guiso_de_frejoles_pierna_de_pollo', 'Guiso de frejoles + pierna de pollo', 'dishes', [112.9, 9.4, 11, 3.6, 0], [{ label: '1 plato', amount: 450 }], { tags: ['usuario', 'peru'] }),
  f('helado_bakanazo', 'Helado Bakanazo', 'processed', [212.3, 4.4, 21.9, 11.4, 0], [{ label: '114 g', amount: 114 }], { tags: ['usuario', 'peru'] }),
  f('huevo_frito', 'Huevo frito', 'protein', [214.5, 13.3, 0.7, 17.3, 0], [{ label: '1 unidad (55g)', amount: 55 }], { tags: ['usuario', 'peru', 'huevo', 'desayuno'] }),
  f('huevo_cocido_sancochado', 'Huevo cocido / sancochado (huevo duro)', 'protein', [155, 13.0, 1.1, 11.0, 0], [{ label: '1 unidad (50g)', amount: 50 }, { label: '2 unidades (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'huevo', 'proteina_magra', 'desayuno'],
    notes: 'Huevo entero hervido. Referencia de proteína de alto valor biológico (PDCAAS 1.0).'
  }),
  f('clara_de_huevo_cocida', 'Clara de huevo sancochada / cocida', 'protein', [52, 11.0, 0.7, 0.2, 0], [{ label: '1 clara (33g)', amount: 33 }, { label: '3 claras (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'huevo', 'proteina_magra', 'desayuno'],
    notes: 'Proteína pura libre de grasa, ideal para déficits calóricos agresivos.'
  }),
  f('huevo_revuelto_con_aceite', 'Huevo revuelto casero', 'protein', [182, 12.5, 1.2, 14.2, 0], [{ label: '2 huevos (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'huevo', 'desayuno']
  }),
  f('huevo_escalfado_poche', 'Huevo escalfado / poché', 'protein', [143, 12.6, 0.8, 9.5, 0], [{ label: '1 unidad (50g)', amount: 50 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'huevo', 'fitness']
  }),
  f('tortilla_de_verduras_huevo', 'Tortilla de huevo con verduras', 'dishes', [145, 10.2, 3.8, 9.8, 1.2], [{ label: '1 porción (150g)', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'huevo']
  }),
  f('pechuga_pollo_plancha', 'Pechuga de pollo a la plancha', 'protein', [165, 31.0, 0, 3.6, 0], [{ label: '1 filete (150g)', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'pollo', 'proteina_magra', 'fitness']
  }),
  f('pollo_al_horno_presa', 'Pollo al horno casero dorado (presa)', 'protein', [185, 24.5, 0, 9.5, 0], [{ label: '1 presa (140g)', amount: 140 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'pollo', 'almuerzo']
  }),
  f('carne_res_guisada', 'Carne de res guisada / estofado casero', 'protein', [195, 23.0, 3.0, 10.0, 0.5], [{ label: '1 porción (140g)', amount: 140 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'carne', 'almuerzo']
  }),
  f('atun_lata_al_agua', 'Atún en lata en agua (escurrido)', 'protein', [116, 26.0, 0, 1.0, 0], [{ label: '1 lata escurrida (120g)', amount: 120 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'pescado', 'proteina_magra']
  }),
  f('atun_lata_en_aceite', 'Atún en lata en aceite (escurrido)', 'protein', [198, 27.0, 0, 10.0, 0], [{ label: '1 lata escurrida (120g)', amount: 120 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'pescado', 'proteina']
  }),
  f('zanahoria_sancochada', 'Zanahoria sancochada en bastones', 'vegetables', [35, 0.8, 8.2, 0.2, 2.8], [{ label: '1 porción (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'verdura'],
    notes: 'Rica en betacarotenos y fibra soluble.'
  }),
  f('vainitas_sancochadas', 'Vainitas verdes sancochadas / salteadas', 'vegetables', [31, 1.8, 7.0, 0.2, 3.4], [{ label: '1 porción (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'verdura'],
    notes: 'Aporte de fibra verde y micronutrientes digestivos.'
  }),
  f('cebolla_roja_picada', 'Cebolla roja picada / ensalada en pluma', 'vegetables', [40, 1.1, 9.3, 0.1, 1.7], [{ label: '1/2 taza (80g)', amount: 80 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'verdura'],
    notes: 'Contiene quercetina y compuestos azufrados antiinflamatorios.'
  }),
  f('tomate_fresco_rodajas', 'Tomate fresco en rodajas', 'vegetables', [18, 0.9, 3.9, 0.2, 1.2], [{ label: '1 tomate mediano (120g)', amount: 120 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'verdura'],
    notes: 'Fuente de licopeno antioxidante y potasio.'
  }),
  f('ensalada_lechuga_cebolla', 'Ensalada fresca de lechuga con cebolla roja', 'vegetables', [22, 1.2, 4.2, 0.2, 1.8], [{ label: '1 plato de ensalada (120g)', amount: 120 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'verdura', 'ensalada']
  }),
  f('brocoli_al_vapor', 'Brócoli al vapor', 'vegetables', [35, 2.8, 7.2, 0.4, 2.6], [{ label: '1 taza (100g)', amount: 100 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'verdura']
  }),
  f('lentejas_guisadas_caseras', 'Lentejas guisadas caseras con aderezo', 'carbs', [116, 9.0, 20.0, 0.4, 7.9], [{ label: '1 plato (200g)', amount: 200 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'menestras', 'legumbres']
  }),
  f('frijoles_canario_guisados', 'Frejoles canario guisados', 'carbs', [120, 8.5, 21.0, 0.5, 6.5], [{ label: '1 plato (200g)', amount: 200 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'menestras']
  }),
  f('arroz_integral_cocido', 'Arroz integral cocido', 'carbs', [112, 2.6, 23.5, 0.9, 1.8], [{ label: '1 taza (150g)', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'carbs']
  }),
  f('avena_cocida_casera', 'Avena en hojuelas cocida con canela', 'carbs', [71, 2.5, 12.0, 1.4, 1.7], [{ label: '1 tazón (200g)', amount: 200 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'desayuno', 'fitness', 'carbs']
  }),
  f('avena_con_leche_fresca', 'Avena cocida con leche de vaca', 'dishes', [105, 4.8, 15.2, 3.2, 1.4], [{ label: '1 tazón (220g)', amount: 220 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'desayuno', 'peru']
  }),
  f('leche_descremada_fresca', 'Leche descremada / light', 'dairy', [35, 3.4, 4.9, 0.1, 0], [{ label: '1 vaso (200ml)', amount: 200 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'dairy'], unit: 'ml'
  }),
  f('yogur_griego_natural', 'Yogur griego natural (sin azúcar)', 'dairy', [95, 10.0, 3.6, 4.5, 0], [{ label: '1 pote (150g)', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'fitness', 'proteina_magra', 'dairy']
  }),
  f('queso_fresco_mesa', 'Queso fresco pasteurizado de mesa', 'dairy', [180, 16.0, 2.0, 12.0, 0], [{ label: '1 tajada (60g)', amount: 60 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'peru', 'dairy', 'desayuno']
  }),
  f('aceite_de_oliva_extra', 'Aceite de oliva extra virgen', 'fats', [884, 0, 0, 100, 0], [{ label: '1 cucharada (12g)', amount: 12 }], {
    source: 'CENAN-TPCA', tags: ['usuario', 'grasas_saludables', 'fats']
  }),
  f('humitas', 'Humitas', 'dishes', [153.3, 4.5, 15.3, 8.9, 0], [{ label: '150 g', amount: 150 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('jugo_de_maracuya', 'Jugo de maracuya', 'dishes', [22, 0, 5.6, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'], unit: 'ml' }),
  f('jugo_de_naranja', 'Jugo de naranja', 'fruits', [50, 0.6, 11.5, 0.1, 2.5], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('jugo_de_pina', 'Jugo de piña', 'fruits', [51, 0.3, 12, 0, 2.5], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('ketchup', 'Ketchup', 'processed', [150, 2, 3.5, 0, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('leche', 'Leche', 'dairy', [63, 3.2, 4.6, 3.7, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('lechuga', 'Lechuga', 'vegetables', [19, 1.8, 2.2, 0.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('lentejas', 'Lentejas', 'carbs', [325, 25, 54, 2.5, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('limonada', 'Limonada', 'drinks', [48, 0, 12, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('linaza', 'Linaza', 'fats', [530, 18, 29, 42, 0], [{ label: '10 g', amount: 10 }], { tags: ['usuario', 'peru'] }),
  f('mandaria', 'Mandaria', 'fruits', [41, 0.7, 9.1, 0.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('mango', 'Mango', 'fruits', [73, 0.7, 16.8, 0.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('mani_tostado', 'Mani tostado', 'fats', [585, 23.7, 21.5, 49.7, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('manzana', 'Manzana', 'fruits', [45, 0.2, 10.4, 0.3, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('marcianos_de_fruta', 'Marcianos de Fruta', 'processed', [115, 0.9, 16.1, 5.2, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('mayonesa', 'Mayonesa', 'fats', [708, 1.7, 1, 87, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('mermelada', 'Mermelada', 'processed', [272, 0.6, 70, 0.1, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('mil_hojas', 'Mil hojas', 'processed', [630, 8.6, 45, 46.2, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('milanesa_de_pollo', 'Milanesa de pollo', 'protein', [240, 14.6, 14.8, 13.6, 0], [{ label: '120 g', amount: 120 }], { tags: ['usuario', 'peru'] }),
  f('mostaza', 'Mostaza', 'processed', [75, 4.7, 6.4, 4.4, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('naranja', 'Naranja', 'fruits', [53, 1, 11.7, 0.2, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('nispero', 'Nispero', 'fruits', [28, 0.4, 6.1, 0.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('palta', 'Palta', 'fats', [232, 1.9, 3.2, 23.5, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pan_blanco', 'Pan Blanco', 'carbs', [270, 8.1, 64, 0.5, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pan_integral', 'Pan Integral', 'carbs', [230, 9, 47.5, 1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('papa', 'Papa', 'carbs', [80, 2.1, 18, 1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('papa_frita', 'Papa frita', 'carbs', [547, 6.6, 49.8, 37.5, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('papa_pure', 'Papa pure', 'carbs', [98, 1, 6.7, 7.4, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('papa_sancochada', 'Papa sancochada', 'carbs', [142, 2.9, 31.7, 0.3, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('pasas', 'Pasas', 'fruits', [301, 1.9, 72, 0.6, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pepino', 'Pepino', 'vegetables', [10.4, 0.7, 2, 0.1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pina', 'Piña', 'fruits', [55, 0.5, 12.7, 0.2, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pistachos', 'Pistachos', 'fats', [600, 21, 28, 48, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pizza_con_jamos_y_queso', 'Pizza con jamos y queso', 'dishes', [224, 14, 25.2, 7.5, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pizza_de_molde', 'Pizza de molde', 'dishes', [246, 6.6, 46.9, 3.4, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('platano', 'Platano', 'fruits', [85, 1.2, 19.5, 0.3, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pollo_a_la_brasa', 'Pollo a la brasa', 'protein', [149.5, 12.3, 9.6, 6.6, 0], [{ label: '1 plato', amount: 400 }], { tags: ['usuario', 'peru'] }),
  f('pollo_pecho', 'Pollo pecho', 'protein', [108, 22.4, 0, 21, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pollo_pierna', 'Pollo pierna', 'protein', [130, 19.6, 0, 5.7, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('pollo_pierna_frita', 'Pollo pierna frita', 'protein', [250, 24.5, 1.5, 15.2, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('queso_suizo', 'Queso Suizo', 'dairy', [301, 20.5, 0.9, 25.7, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('ron', 'Ron', 'drinks', [231, 0, 0, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('salchicha', 'Salchicha', 'processed', [290, 10.3, 2.8, 26, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('sopa_de_arina_de_arverja', 'Sopa de arina de arverja', 'dishes', [305.8, 19.9, 67, 2.4, 0], [{ label: '120 g', amount: 120 }], { tags: ['usuario', 'peru'] }),
  f('sopa_de_fideos', 'Sopa de fideos', 'dishes', [43.5, 1.4, 7.2, 1.1, 0], [{ label: '1 plato', amount: 600 }], { tags: ['usuario', 'peru'] }),
  f('sopa_de_semola', 'Sopa de semola', 'dishes', [40, 1.6, 6.5, 0.9, 0], [{ label: '1 plato', amount: 800 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('tallarine', 'Tallarine', 'carbs', [287, 9.2, 56.8, 2.6, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('taza_de_chocolate', 'Taza de chocolate', 'processed', [471, 5.4, 58.9, 32.1, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('trucha_frita', 'Trucha frita', 'protein', [190, 24, 0, 10.5, 0], [{ label: '100 g', amount: 100 }], { tags: ['cajamarca', 'celendin', 'peru', 'usuario'] }),
  f('uva', 'Uva', 'fruits', [61, 0.5, 15.6, 0.1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('vino_tinto', 'Vino tinto', 'drinks', [65, 0.2, 0.1, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('vodka', 'Vodka', 'drinks', [231, 0, 0, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('whisky', 'Whisky', 'drinks', [250, 0, 0, 0, 0], [{ label: '100 ml', amount: 100 }], { tags: ['usuario', 'peru'], unit: 'ml' }),
  f('yogur', 'Yogur', 'dairy', [61, 3.3, 4, 0.9, 0], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('yuca_cocida', 'Yuca cocida', 'carbs', [173, 1.4, 37.5, 2.1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),
  f('yuca_frita', 'Yuca frita', 'carbs', [182, 0.9, 22.7, 10.1, 2.5], [{ label: '100 g', amount: 100 }], { tags: ['usuario', 'peru'] }),

  // ======================= GASTRONOMÍA Y PRODUCTOS ANDINOS DE LA SIERRA / CAJAMARCA Y CELENDÍN (CENAN / INS)
  // --- PLATOS TÍPICOS DE CELENDÍN Y CAJAMARCA
  f('caldo_verde_cajamarquino', 'Caldo verde cajamarquino (con huevo y quesillo)', 'dishes', [68, 4.8, 7.5, 2.2, 1.8], [{ label: '1 plato sopero', amount: 450 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'sierra', 'plato_tipico'],
    notes: 'Sopa ancestral con molienda de paico, ruda, hierbabuena y chamuca, papas nativas, huevo y quesillo fresco.'
  }),
  f('sopa_de_pan_celendina', 'Sopa de pan celendina (pizza celendina)', 'dishes', [112, 5.2, 14.8, 3.8, 1.2], [{ label: '1 plato', amount: 400 }], {
    source: 'CENAN-TPCA', tags: ['celendin', 'cajamarca', 'sierra', 'plato_tipico'],
    notes: 'Platillo emblemático de Celendín a base de pan campesino horneado, caldo criollo, huevos y abundante quesillo derretido.'
  }),
  f('sopa_de_chochoca_cecina', 'Sopa de chochoca con cecina andina', 'dishes', [89, 5.8, 11.4, 2.4, 1.5], [{ label: '1 plato', amount: 450 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'sierra', 'plato_tipico'],
    notes: 'Caldo altamente energético con harina de maíz chochoca secado al sol, cecina y papa amarilla.'
  }),
  f('picante_de_cuy_con_papas', 'Picante de cuy con papas y salsa de maní', 'dishes', [168, 14.2, 10.5, 7.8, 1.4], [{ label: '1 porción generosa', amount: 450 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'sierra', 'proteina_magra'],
    notes: 'Plato bandera andino. Carne de cuy magra de alto valor biológico con ají panca y maní.'
  }),
  f('frutos_verdes_celendinos', 'Frutos verdes celendinos (plátano verde cocido/guisado)', 'dishes', [115, 2.1, 24.5, 1.2, 3.2], [{ label: '1 plato', amount: 300 }], {
    source: 'CENAN-TPCA', tags: ['celendin', 'sierra', 'plato_tipico'],
    notes: 'Preparación típica tradicional de Celendín a base de plátano verde cocinado con aderezo serrano.'
  }),
  f('chicharron_con_mote_cajamarca', 'Chicharrón de cerdo con mote y hierbabuena', 'dishes', [245, 18.2, 15.4, 12.8, 2.1], [{ label: '1 porción', amount: 350 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'sierra'],
    notes: 'Costilla y pulpa de cerdo cocinada en su grasa natural servida con mote blanco y salsa criolla.'
  }),
  f('sopa_de_carnaval_cajamarquina', 'Sopa de carnaval cajamarquina', 'dishes', [82, 4.6, 9.8, 2.8, 1.4], [{ label: '1 plato', amount: 500 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'sierra', 'plato_tipico'],
    notes: 'Guiso festivo tradicional de papas, carne de res/cerdo, repollo y fideos.'
  }),

  // --- LÁCTEOS ARTESANALES DE CELENDÍN Y CAJAMARCA
  f('quesillo_fresco_celendin', 'Quesillo fresco artesanal de Celendín', 'dairy', [178, 18.5, 2.5, 10.2, 0], [{ label: '1 rebanada', amount: 60 }], {
    source: 'CENAN-TPCA', tags: ['celendin', 'cajamarca', 'sierra', 'proteina_magra'],
    notes: 'Cuajada fresca no prensada de leche de vaca de pastura andina. Excelente biodisponibilidad de calcio y caseína.'
  }),
  f('queso_mantecoso_cajamarquino', 'Queso mantecoso cajamarquino', 'dairy', [295, 21.0, 1.8, 22.8, 0], [{ label: '1 porción', amount: 50 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'sierra'],
    notes: 'Queso madurado de textura suave y elástica con amasado artesanal tradicional.'
  }),
  f('manjar_blanco_cajamarquino', 'Manjar blanco tradicional de Cajamarca', 'dairy', [315, 6.2, 54.0, 8.5, 0], [{ label: '1 cucharada', amount: 25 }], {
    source: 'CENAN-TPCA', tags: ['cajamarca', 'celendin', 'dulce_tradicional'],
    notes: 'Dulce de leche pura de vaca cocinada en paila de cobre a fuego lento.'
  }),

  // --- TUBÉRCULOS Y RAÍCES ANDINAS DE ALTURA
  f('oca_sancochada', 'Oca sancochada (asoleada)', 'carbs', [61, 1.0, 14.5, 0.4, 2.1], [{ label: '1 porción', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'tuberculo_andino'],
    notes: 'Tubérculo dulce andino rico en agua y almidón de lenta asimilación; tradicionalmente asoleada.'
  }),
  f('olluco_sancochado', 'Olluco picado / sancochado', 'carbs', [59, 1.1, 14.3, 0.1, 1.4], [{ label: '1 porción', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'tuberculo_andino'],
    notes: 'Tubérculo con alto contenido de mucílago gastroprotector y muy bajo en lípidos.'
  }),
  f('mashua_cocida', 'Mashua / Isaño cocido', 'carbs', [45, 1.2, 10.6, 0.1, 2.3], [{ label: '1 porción', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'tuberculo_andino'],
    notes: 'Poderoso tubérculo andino con glucosinolatos y propiedades antioxidantes y diuréticas.'
  }),
  f('papa_amarilla_nativa', 'Papa amarilla nativa sancochada', 'carbs', [97, 2.1, 22.4, 0.1, 1.8], [{ label: '1 papa mediana', amount: 120 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'celendin'],
    notes: 'Textura harinosa superior rica en carotenoides y carbohidratos complejos.'
  }),

  // --- MAÍCES, CEREALES Y GRANOS ANDINOS
  f('chochoca_harina', 'Harina de chochoca andina', 'carbs', [345, 6.5, 78.0, 2.5, 4.2], [{ label: '50 g', amount: 50 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'celendin', 'grano_andino'],
    notes: 'Maíz tierno cocido, secado al sol de la sierra y molido en molino de piedra.'
  }),
  f('mote_blanco_sancochado', 'Mote blanco sancochado con sal', 'carbs', [103, 2.6, 22.2, 0.8, 3.2], [{ label: '1 taza', amount: 160 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'celendin'],
    notes: 'Maíz gigante deshollejado hervido. Excelente fuente de energía y saciedad prolongada.'
  }),
  f('cancha_serrana_tostada', 'Cancha serrana tostada (maíz tostado)', 'carbs', [342, 6.7, 76.5, 2.7, 5.8], [{ label: '1 puñado', amount: 40 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'celendin'],
    notes: 'Acompañamiento por excelencia en caldos y platos cajamarquinos, rico en fibra crujiente.'
  }),
  f('quinua_blanca_cocida', 'Quinua blanca andina cocida', 'carbs', [89, 3.2, 16.3, 1.3, 2.8], [{ label: '1 porción', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'superalimento', 'proteina_vegetal'],
    notes: 'Pseudocereal con todos los 9 aminoácidos esenciales, magnesio y hierro.'
  }),
  f('mote_de_habas_cocidas', 'Habas sancochadas con cáscara (mote de habas)', 'carbs', [110, 7.6, 18.2, 0.7, 5.4], [{ label: '1 taza', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'celendin'],
    notes: 'Leguminosa andina de alto valor proteico vegetal y fibra prebiótica.'
  }),
  f('pan_guanaco_celendin', 'Pan guanaco celendino tradicional', 'carbs', [265, 7.8, 55.4, 2.2, 2.4], [{ label: '1 unidad', amount: 70 }], {
    source: 'CENAN-TPCA', tags: ['celendin', 'panaderia_andina'],
    notes: 'Pan artesanal campesino de Celendín elaborado en horno de leña con masa madre local.'
  }),

  // --- FRUTAS Y BEBIDAS NATIVAS DE LA SIERRA
  f('aguaymanto_fresco', 'Aguaymanto fresco andino', 'fruits', [51, 1.9, 12.4, 0.2, 4.9], [{ label: '1 taza', amount: 140 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'fruta_nativa', 'antioxidante'],
    notes: 'Baya dorada andina rica en vitamina C, vitamina A y flavonoides reductores de estrés oxidativo.'
  }),
  f('chirimoya_cumbe', 'Chirimoya fresca de valle andino', 'fruits', [72, 1.9, 17.7, 0.3, 4.0], [{ label: '1 porción', amount: 150 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'fruta_nativa'],
    notes: 'Pulpa blanca carnosa con potasio, magnesio y azúcares naturales de rápida absorción.'
  }),
  f('chocolate_de_taza_celendino', 'Chocolate puro de taza de Celendín (pasto cacao 100%)', 'processed', [505, 12.0, 31.0, 42.0, 11.5], [{ label: '1 taza preparada', amount: 200 }], {
    source: 'CENAN-TPCA', tags: ['celendin', 'cajamarca', 'cacao_puro'],
    notes: 'Famoso chocolate de mesa celendino con pasta de cacao pura, teobromina estimulante y polifenoles.'
  }),
  f('chicha_de_jora_fermentada', 'Chicha de jora andina tradicional', 'drinks', [42, 0.6, 8.2, 0.1, 0.4, 1.5], [{ label: '1 vaso', amount: 250 }], {
    source: 'CENAN-TPCA', tags: ['sierra', 'cajamarca', 'bebida_ancestral'], unit: 'ml',
    notes: 'Bebida fermentada de maíz germinado (jora), rica en probióticos y enzimas digestivas.'
  }),
];

export const FOOD_BY_ID: ReadonlyMap<string, Food> = new Map(FOODS.map((x) => [x.id, x]));

/** Ids de los 34 alimentos aportados por el usuario demo. */
export const DEMO_USER_FOOD_IDS = FOODS.filter((x) => x.tags?.includes('usuario')).map((x) => x.id);
