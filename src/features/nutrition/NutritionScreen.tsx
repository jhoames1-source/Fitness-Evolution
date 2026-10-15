import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { FOODS } from '../../seed-content/foods';
import { nutrientsFor } from '../../domain/nutrition/nutrients';
import { generateWeeklyMenu, WeeklyMenuProposal } from '../../domain/nutrition/generator';
import {
  analyzeMealPhoto,
  PlatePhotoAnalysisResult,
  DetectedFoodComponent,
  recalculatePlateNutrients,
} from '../../domain/nutrition/photo-analysis';
import type { FoodLogRecord } from '../../data/local/schema';
import type { MealSlot } from '../../domain/nutrition/types';

export const NutritionScreen: React.FC = () => {
  const { profile, goal, db } = useApp();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [foodLogs, setFoodLogs] = useState<FoodLogRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('lunch');
  const [selectedFoodId, setSelectedFoodId] = useState(FOODS[0]!.id);
  const [amountInput, setAmountInput] = useState('150');
  const [searchFilter, setSearchFilter] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<
    'all' | 'popular' | 'protein' | 'carbs' | 'vegetables' | 'dairy' | 'cajamarca'
  >('popular');
  const [activeTab, setActiveTab] = useState<'today' | 'weekly_plan' | 'sierra_catalog'>('today');

  // Estados para subida y análisis con IA de foto del plato de comida
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [dishDescription, setDishDescription] = useState('');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<PlatePhotoAnalysisResult | null>(null);
  const [savePhotoSuccess, setSavePhotoSuccess] = useState(false);

  // Estados para añadir componente manual al plato de foto
  const [isAddingExtraComponent, setIsAddingExtraComponent] = useState(false);
  const [extraFoodId, setExtraFoodId] = useState('huevo_cocido_sancochado');
  const [extraFoodGrams, setExtraFoodGrams] = useState('100');

  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuProposal | null>(null);

  const loadLogs = async () => {
    if (!profile) return;
    const logs = await db.foodLogs.where('date').equals(todayStr).toArray();
    setFoodLogs(logs.filter((x) => !x.deletedAt));
  };

  useEffect(() => {
    loadLogs();

    if (goal) {
      const menu = generateWeeklyMenu({
        targetCalories: goal.planCalories,
        targetProteinG: goal.proteinG,
        targetCarbsG: goal.carbsG,
        targetFatG: goal.fatG,
        availableFoods: FOODS,
      });
      setWeeklyMenu(menu);
    }
  }, [profile, goal, db]);

  const handleSaveMeal = async () => {
    if (!profile) return;
    const food = FOODS.find((f) => f.id === selectedFoodId);
    if (!food) return;

    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;

    const now = new Date().toISOString();
    const nutrients = nutrientsFor(food, amt);

    await db.foodLogs.put({
      id: crypto.randomUUID(),
      userId: profile.id,
      date: todayStr,
      slot: selectedSlot,
      foodId: food.id,
      foodName: food.name,
      amount: amt,
      unit: food.unit,
      nutrients,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
    });

    await loadLogs();
    setIsModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
    setPhotoAnalysisResult(null);
    setSavePhotoSuccess(false);
  };

  const handleRunPhotoAnalysis = () => {
    if (!photoFile) return;
    setIsAnalyzingPhoto(true);

    setTimeout(() => {
      const result = analyzeMealPhoto(photoFile.name, dishDescription);
      setPhotoAnalysisResult(result);
      setIsAnalyzingPhoto(false);
    }, 1200);
  };

  // Modificar gramos de un componente detectado en la foto
  const handleUpdateComponentGrams = (idx: number, newGrams: number) => {
    if (!photoAnalysisResult) return;
    const clamped = Math.max(10, Math.min(1000, newGrams));
    const updated = photoAnalysisResult.components.map((c, i) => {
      if (i !== idx) return c;
      const factor = clamped / 100;
      return {
        ...c,
        estimatedGrams: clamped,
        nutrients: {
          kcal: Math.round(c.per100g.kcal * factor),
          proteinG: parseFloat((c.per100g.proteinG * factor).toFixed(1)),
          carbsG: parseFloat((c.per100g.carbsG * factor).toFixed(1)),
          fatG: parseFloat((c.per100g.fatG * factor).toFixed(1)),
          fiberG: parseFloat((c.per100g.fiberG * factor).toFixed(1)),
        },
      };
    });
    setPhotoAnalysisResult(recalculatePlateNutrients(updated, photoAnalysisResult.suggestedSlot));
  };

  // Eliminar un componente erróneo detectado en la foto
  const handleRemoveComponent = (idx: number) => {
    if (!photoAnalysisResult) return;
    const updated = photoAnalysisResult.components.filter((_, i) => i !== idx);
    setPhotoAnalysisResult(recalculatePlateNutrients(updated, photoAnalysisResult.suggestedSlot));
  };

  // Añadir un componente manual adicional al plato
  const handleAddExtraComponent = () => {
    if (!photoAnalysisResult) return;
    const food = FOODS.find((f) => f.id === extraFoodId) || FOODS[0]!;
    const grams = parseFloat(extraFoodGrams) || 100;
    const factor = grams / 100;
    const newComp: DetectedFoodComponent = {
      name: food.name,
      category: food.tags?.includes('cajamarca')
        ? 'cajamarca_regional'
        : (food.category as DetectedFoodComponent['category']) || 'protein',
      estimatedGrams: grams,
      confidencePct: 100,
      per100g: food.per100,
      nutrients: {
        kcal: Math.round(food.per100.kcal * factor),
        proteinG: parseFloat((food.per100.proteinG * factor).toFixed(1)),
        carbsG: parseFloat((food.per100.carbsG * factor).toFixed(1)),
        fatG: parseFloat((food.per100.fatG * factor).toFixed(1)),
        fiberG: parseFloat((food.per100.fiberG * factor).toFixed(1)),
      },
      visualCue: 'Componente incorporado manualmente por el usuario',
    };
    const updated = [...photoAnalysisResult.components, newComp];
    setPhotoAnalysisResult(recalculatePlateNutrients(updated, photoAnalysisResult.suggestedSlot));
    setIsAddingExtraComponent(false);
  };

  const handleConfirmPhotoAnalysis = async () => {
    if (!profile || !photoAnalysisResult) return;
    const now = new Date().toISOString();

    for (const comp of photoAnalysisResult.components) {
      await db.foodLogs.put({
        id: crypto.randomUUID(),
        userId: profile.id,
        date: todayStr,
        slot: photoAnalysisResult.suggestedSlot,
        foodId: `photo_detected_${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        foodName: comp.name,
        amount: comp.estimatedGrams,
        unit: 'g',
        nutrients: comp.nutrients,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        version: 1,
      });
    }

    setSavePhotoSuccess(true);
    await loadLogs();
    setTimeout(() => {
      setIsPhotoModalOpen(false);
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
      setDishDescription('');
      setPhotoAnalysisResult(null);
      setSavePhotoSuccess(false);
    }, 1800);
  };

  const selectedFood = FOODS.find((f) => f.id === selectedFoodId) ?? FOODS[0]!;
  const previewNutrients = nutrientsFor(selectedFood, parseFloat(amountInput) || 0);

  // Normalizador para búsqueda insensible a mayúsculas y acentos
  const normalize = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Conjunto de alimentos básicos y frecuentes para orden preferente
  const POPULAR_FOOD_IDS = useMemo(
    () =>
      new Set([
        'huevo_cocido_sancochado',
        'huevo_frito',
        'clara_de_huevo_cocida',
        'pechuga_pollo_plancha',
        'pollo_al_horno_presa',
        'carne_res_guisada',
        'atun_lata_al_agua',
        'arroz_cocido',
        'papa_sancochada',
        'zanahoria_sancochada',
        'vainitas_sancochadas',
        'ensalada_lechuga_cebolla',
        'avena_cocida_casera',
        'palta',
        'quesillo_fresco_celendin',
        'cuy_frito',
      ]),
    []
  );

  // Catálogo inteligente filtrado
  const filteredFoods = useMemo(() => {
    let list = FOODS;

    // Filtro por categoría seleccionada
    if (catalogCategory === 'popular') {
      list = list.filter((f) => POPULAR_FOOD_IDS.has(f.id) || f.tags?.includes('usuario'));
    } else if (catalogCategory === 'protein') {
      list = list.filter(
        (f) =>
          f.category === 'protein' ||
          f.tags?.includes('huevo') ||
          f.tags?.includes('proteina_magra')
      );
    } else if (catalogCategory === 'carbs') {
      list = list.filter((f) => f.category === 'carbs');
    } else if (catalogCategory === 'vegetables') {
      list = list.filter(
        (f) =>
          f.category === 'vegetables' ||
          f.tags?.includes('verdura') ||
          f.tags?.includes('ensalada')
      );
    } else if (catalogCategory === 'dairy') {
      list = list.filter((f) => f.category === 'dairy');
    } else if (catalogCategory === 'cajamarca') {
      list = list.filter((f) => f.tags?.includes('cajamarca') || f.tags?.includes('celendin'));
    }

    // Búsqueda por texto multi-término
    if (searchFilter.trim()) {
      const tokens = normalize(searchFilter).split(/\s+/).filter(Boolean);
      list = list.filter((f) => {
        const searchable = normalize(
          `${f.name} ${f.tags?.join(' ') || ''} ${f.category} ${f.notes || ''}`
        );
        return tokens.every((token) => searchable.includes(token));
      });
    } else if (catalogCategory === 'all') {
      // Si está en 'all' y sin búsqueda, mostrar primero los populares y básicos
      list = [...list].sort((a, b) => {
        const aPop = POPULAR_FOOD_IDS.has(a.id) ? 1 : 0;
        const bPop = POPULAR_FOOD_IDS.has(b.id) ? 1 : 0;
        if (aPop !== bPop) return bPop - aPop;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [catalogCategory, searchFilter, POPULAR_FOOD_IDS]);

  const totalKcal = foodLogs.reduce((acc, f) => acc + f.nutrients.kcal, 0);
  const totalProt = Math.round(foodLogs.reduce((acc, f) => acc + f.nutrients.proteinG, 0));
  const totalCarbs = Math.round(foodLogs.reduce((acc, f) => acc + f.nutrients.carbsG, 0));
  const totalFat = Math.round(foodLogs.reduce((acc, f) => acc + f.nutrients.fatG, 0));

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* 1. Encabezado */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            PLAN NUTRICIONAL Y COMIDAS
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Nutrición Adaptativa</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta diaria: {goal?.planCalories ?? 1850} kcal • {goal?.proteinG ?? 150}g proteína
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Hoy ({totalKcal} kcal)
          </button>
          <button
            onClick={() => setActiveTab('weekly_plan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'weekly_plan'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Menú Semanal (L-D)
          </button>
          <button
            onClick={() => setActiveTab('sierra_catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sierra_catalog'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                : 'bg-slate-800 text-amber-300 hover:text-white border border-amber-500/30'
            }`}
          >
            <span>🏔️</span>
            <span>Despensa Sierra / Celendín</span>
          </button>
        </div>
      </div>

      {activeTab === 'today' ? (
        <>
          {/* Resumen de Macros del Día */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Calorías Hoy</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{totalKcal}</div>
              <div className="text-[10px] text-slate-500">Meta: {goal?.planCalories} kcal</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Proteína</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{totalProt}g</div>
              <div className="text-[10px] text-slate-500">Meta: {goal?.proteinG}g</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Carbohidratos</div>
              <div className="text-xl font-bold text-amber-400 mt-1">{totalCarbs}g</div>
              <div className="text-[10px] text-slate-500">Meta: {goal?.carbsG}g</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Grasas</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{totalFat}g</div>
              <div className="text-[10px] text-slate-500">Meta: {goal?.fatG}g</div>
            </div>
          </div>

          {/* Botones de Registro Rápido */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Alimentos Registrados Hoy</h3>
              <p className="text-xs text-slate-400">Control estricto de macronutrientes para pérdida de grasa y retención muscular.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <span>📸</span>
                <span>Subir Foto del Plato (IA)</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1"
              >
                <span>+</span>
                <span>Registrar Comida</span>
              </button>
            </div>
          </div>

          {/* Lista de Registros */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl divide-y divide-slate-800">
            {foodLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay alimentos registrados hoy todavía. ¡Usa el botón superior para añadir tu primera comida!
              </div>
            ) : (
              foodLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mr-2">
                      {log.slot}
                    </span>
                    <span className="font-semibold text-white">{log.foodName}</span>
                    <span className="text-slate-400 ml-2">
                      ({log.amount} {log.unit})
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium">
                    <span className="text-emerald-400 font-bold">{log.nutrients.kcal} kcal</span> •{' '}
                    <span>{log.nutrients.proteinG}g P</span> • <span>{log.nutrients.carbsG}g C</span> •{' '}
                    <span>{log.nutrients.fatG}g G</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : activeTab === 'weekly_plan' ? (
        /* Menú Semanal Generado */
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Menú equilibrado automáticamente con tus alimentos favoritos respetando tus {goal?.planCalories} kcal diarias:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyMenu?.days.map((day) => (
              <div
                key={day.weekday}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-base">{day.weekdayLabel}</h4>
                  <div className="text-xs text-emerald-400 font-semibold">
                    {day.totalNutrients.kcal} kcal • {day.totalNutrients.proteinG}g P
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {day.meals.map((meal, mIdx) => (
                    <div key={mIdx} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                        {meal.slot} ({meal.nutrients.kcal} kcal)
                      </div>
                      <div className="text-slate-300">
                        {meal.items.map((i) => `${i.foodName} (${i.amount}g)`).join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Catálogo de Productos y Gastronomía de la Sierra / Cajamarca / Celendín */
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏔️</span>
              <div>
                <h3 className="text-base font-bold text-white">Despensa Nutricional Andina: Cajamarca & Celendín</h3>
                <p className="text-xs text-amber-200">
                  Tabla de Composición de Alimentos del CENAN / INS adaptada a tu objetivo de fitness, pérdida de grasa y retención muscular.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-slate-850/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block">🥩 Proteínas de Alto Valor</span>
                <span className="text-slate-300 text-[11px]">Cuy (19% prot, bajo colesterol), Trucha andina (Omega-3), Quesillo fresco de Celendín.</span>
              </div>
              <div className="bg-slate-850/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block">🥔 Carbohidratos Complejos</span>
                <span className="text-slate-300 text-[11px]">Papa nativa, Oca asoleada, Olluco, Chochoca y Mote: saciedad prolongada y almidón resistente.</span>
              </div>
              <div className="bg-slate-850/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-cyan-400 font-bold block">🌿 Fitonutrientes & Digestión</span>
                <span className="text-slate-300 text-[11px]">Caldo verde (paico, chamuca, hierbabuena), aguaymanto (antioxidantes) y cacao celendino.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FOODS.filter((f) => f.tags?.includes('cajamarca') || f.tags?.includes('celendin') || f.tags?.includes('sierra')).map((f) => (
              <div
                key={f.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl transition-all shadow-md space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white">{f.name}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono uppercase whitespace-nowrap">
                      {f.category}
                    </span>
                  </div>
                  {f.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {f.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div className="bg-slate-850 p-1 rounded">
                      <span className="text-slate-500 block">Kcal</span>
                      <span className="font-extrabold text-emerald-400">{f.per100.kcal}</span>
                    </div>
                    <div className="bg-slate-850 p-1 rounded">
                      <span className="text-slate-500 block">Prot</span>
                      <span className="font-extrabold text-cyan-300">{f.per100.proteinG}g</span>
                    </div>
                    <div className="bg-slate-850 p-1 rounded">
                      <span className="text-slate-500 block">Carb</span>
                      <span className="font-extrabold text-amber-300">{f.per100.carbsG}g</span>
                    </div>
                    <div className="bg-slate-850 p-1 rounded">
                      <span className="text-slate-500 block">Grasa</span>
                      <span className="font-extrabold text-rose-300">{f.per100.fatG}g</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right mt-1.5 font-mono">
                    Valores por cada 100 {f.unit} • {f.source}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Registro de Comida */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Registrar Alimento</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Momento del día */}
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Comida:</label>
              <div className="flex gap-1">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      selectedSlot === slot
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Buscador inteligente de alimentos y selector por categoría */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Buscar en Catálogo:</label>

              {/* Pestañas rápidas de categorías */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'popular', label: '🔥 Populares' },
                  { id: 'protein', label: '🍳 Huevos & Proteína' },
                  { id: 'carbs', label: '🥔 Tubérculos & Arroz' },
                  { id: 'vegetables', label: '🥗 Verduras' },
                  { id: 'cajamarca', label: '🏔️ Cajamarca / Celendín' },
                  { id: 'dairy', label: '🥛 Lácteos' },
                  { id: 'all', label: 'Todos' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCatalogCategory(cat.id as any)}
                    className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all ${
                      catalogCategory === cat.id
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Input de búsqueda multi-término */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej. Huevo cocido, frito, papa, pollo, cuy, atún..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Lista scrollable de resultados */}
              <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {filteredFoods.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No se encontraron alimentos para &quot;{searchFilter}&quot;. Prueba con otro término.
                  </div>
                ) : (
                  filteredFoods.slice(0, 40).map((f) => {
                    const isRegional = f.tags?.includes('cajamarca') || f.tags?.includes('celendin');
                    const isSelected = selectedFoodId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFoodId(f.id)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex justify-between items-center ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                          {isRegional && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 whitespace-nowrap">
                              🏔️ Andino
                            </span>
                          )}
                          <span className="truncate">{f.name}</span>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 whitespace-nowrap font-mono">
                          <span className="text-emerald-400 font-bold">{f.per100.kcal} kcal</span> •{' '}
                          <span>{f.per100.proteinG}g P</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cantidad con atajos rápidos */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-300 font-semibold">
                  Cantidad ({selectedFood.unit}):
                </label>
                <div className="flex gap-1">
                  {['50', '100', '150', '200', '250'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAmountInput(g)}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                        amountInput === g
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            {/* Preview de Nutrientes */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex justify-around">
              <div>
                <span className="text-slate-500 block text-[10px]">Calorías</span>
                <span className="font-bold text-emerald-400">{previewNutrients.kcal} kcal</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Proteína</span>
                <span className="font-bold text-cyan-400">{previewNutrients.proteinG}g</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Carbs</span>
                <span className="font-bold text-amber-400">{previewNutrients.carbsG}g</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Grasas</span>
                <span className="font-bold text-rose-400">{previewNutrients.fatG}g</span>
              </div>
            </div>

            <button
              onClick={handleSaveMeal}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Guardar en Registro Diario
            </button>
          </div>
        </div>
      )}

      {/* Modal de Subida y Evaluación de Foto de Plato por IA */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <div>
                  <h3 className="text-base font-bold text-white">Evaluación Nutricional por Fotografía</h3>
                  <p className="text-[11px] text-purple-300">Visión computacional y cálculo biomecánico-dietético</p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Zona de subida de imagen */}
            <div className="space-y-3">
              <div className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-2xl p-5 text-center transition-all bg-purple-950/10">
                <input
                  type="file"
                  accept="image/*"
                  id="meal-photo-upload"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="meal-photo-upload" className="cursor-pointer space-y-2 block">
                  {photoPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={photoPreviewUrl}
                        alt="Plato analizado"
                        className="max-h-48 mx-auto rounded-xl object-cover shadow-lg border border-purple-500/40"
                      />
                      <span className="text-xs font-semibold text-purple-300 block">
                        ✓ {photoFile?.name} (Haz clic para cambiar foto)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-3xl block">🍽️</span>
                      <span className="text-xs font-bold text-purple-300 block">
                        Toca aquí para subir o tomar foto de tu plato
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Identificará arroz, pollo, trucha, cuy, verduras, legumbres, quesillo, etc.
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Nota opcional del plato */}
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Nota o ingredientes especiales (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pechuga a la plancha con arroz blanco y ensalada fresca"
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Botón para iniciar análisis IA */}
              {photoFile && !photoAnalysisResult && (
                <button
                  onClick={handleRunPhotoAnalysis}
                  disabled={isAnalyzingPhoto}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzingPhoto ? (
                    <>
                      <span className="animate-spin text-sm">⚙️</span>
                      <span>Analizando alimentos, volumen y densidad calórica...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Analizar Plato con IA Especializada</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Resultado del análisis computacional de la foto con edición interactiva */}
            {photoAnalysisResult && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="bg-slate-850 p-4 rounded-xl border border-purple-500/30 space-y-3">
                  {/* Título y Selector de Momento de Comida */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {photoAnalysisResult.plateTitle}
                      </span>
                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        {photoAnalysisResult.overallDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold px-1">Registrar en:</span>
                      {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() =>
                            setPhotoAnalysisResult({ ...photoAnalysisResult, suggestedSlot: slot })
                          }
                          className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize transition-all ${
                            photoAnalysisResult.suggestedSlot === slot
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {slot === 'breakfast'
                            ? 'Desayuno'
                            : slot === 'lunch'
                            ? 'Almuerzo'
                            : slot === 'dinner'
                            ? 'Cena'
                            : 'Snack'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de Macros Detectados en Vivo */}
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-semibold">Calorías</span>
                      <span className="text-base font-extrabold text-emerald-400">
                        {photoAnalysisResult.totalNutrients.kcal}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-cyan-500/20">
                      <span className="text-[10px] text-cyan-400 block font-semibold">Proteína</span>
                      <span className="text-base font-extrabold text-cyan-300">
                        {photoAnalysisResult.totalNutrients.proteinG}g
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-amber-500/20">
                      <span className="text-[10px] text-amber-400 block font-semibold">Carbs</span>
                      <span className="text-base font-extrabold text-amber-300">
                        {photoAnalysisResult.totalNutrients.carbsG}g
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-rose-500/20">
                      <span className="text-[10px] text-rose-400 block font-semibold">Grasas</span>
                      <span className="text-base font-extrabold text-rose-300">
                        {photoAnalysisResult.totalNutrients.fatG}g
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg border border-teal-500/20">
                      <span className="text-[10px] text-teal-400 block font-semibold">Fibra</span>
                      <span className="text-base font-extrabold text-teal-300">
                        {photoAnalysisResult.totalNutrients.fiberG}g
                      </span>
                    </div>
                  </div>

                  {/* Componentes individuales detectados con edición en tiempo real */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                        Componentes del plato ({photoAnalysisResult.components.length}):
                      </div>
                      <span className="text-[10px] text-purple-300">
                        Toca + / - o edita los gramos para ajustar tu porción
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {photoAnalysisResult.components.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90 space-y-1.5 hover:border-slate-700 transition-all"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs">{c.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                                  {c.category}
                                </span>
                                <span className="text-[9px] text-emerald-400 font-mono">
                                  ({c.confidencePct}% conf.)
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{c.visualCue}</p>
                            </div>

                            {/* Botón para eliminar componente erróneo */}
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(cIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1 text-sm transition-colors rounded hover:bg-slate-800"
                              title="Eliminar este alimento del plato"
                            >
                              🗑️
                            </button>
                          </div>

                          {/* Controles de ajuste de gramos y macros en vivo */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Porción:</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateComponentGrams(cIdx, c.estimatedGrams - 25)}
                                className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center text-xs active:scale-95"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={c.estimatedGrams}
                                onChange={(e) =>
                                  handleUpdateComponentGrams(cIdx, parseFloat(e.target.value) || 0)
                                }
                                className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white font-mono"
                              />
                              <span className="text-[10px] text-slate-400">g</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateComponentGrams(cIdx, c.estimatedGrams + 25)}
                                className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center text-xs active:scale-95"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-[11px] text-slate-300 font-mono">
                              <span className="text-emerald-400 font-bold">{c.nutrients.kcal} kcal</span> •{' '}
                              <span className="text-cyan-300">{c.nutrients.proteinG}g P</span> •{' '}
                              <span className="text-amber-300">{c.nutrients.carbsG}g C</span> •{' '}
                              <span className="text-rose-300">{c.nutrients.fatG}g G</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botón y panel para añadir alimento extra que no fue detectado */}
                    {isAddingExtraComponent ? (
                      <div className="bg-slate-900 p-3 rounded-xl border border-purple-500/40 space-y-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-purple-300">Añadir Componente Extra al Plato:</span>
                          <button
                            type="button"
                            onClick={() => setIsAddingExtraComponent(false)}
                            className="text-slate-400 hover:text-white text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={extraFoodId}
                            onChange={(e) => setExtraFoodId(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            {FOODS.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name} ({f.per100.kcal} kcal/100g)
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={extraFoodGrams}
                              onChange={(e) => setExtraFoodGrams(e.target.value)}
                              className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono"
                              placeholder="g"
                            />
                            <span className="text-xs text-slate-400">g</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddExtraComponent}
                          className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors"
                        >
                          ✓ Añadir al Plato y Recalcular Macros
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingExtraComponent(true)}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-purple-300 hover:text-purple-200 border border-purple-500/30 border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>➕</span>
                        <span>¿Falta algún alimento? Toca aquí para agregarlo</span>
                      </button>
                    )}
                  </div>

                  {/* Veredicto de especialista y recomendaciones */}
                  <div className="bg-indigo-950/30 p-3 rounded-lg border border-indigo-500/30 text-xs space-y-1">
                    <div className="font-bold text-indigo-300 flex items-center gap-1">
                      <span>🩺</span> Veredicto de Nutricionista Deportivo:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {photoAnalysisResult.dietitianVerdict}
                    </p>
                    <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5 mt-1">
                      {photoAnalysisResult.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {savePhotoSuccess ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs text-center font-bold rounded-xl animate-fade-in">
                    ✓ ¡Alimentos y macronutrientes del plato guardados en tu registro de hoy!
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirmPhotoAnalysis}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                      ✓ Confirmar e Incorporar ({photoAnalysisResult.totalNutrients.kcal} kcal • {photoAnalysisResult.totalNutrients.proteinG}g Prot)
                    </button>
                    <button
                      onClick={() => setPhotoAnalysisResult(null)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
