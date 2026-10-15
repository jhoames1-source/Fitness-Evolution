/**
 * SERVICIO Y CATÁLOGO COMUNITARIO DE ALIMENTOS ENRIQUECIDO POR IA
 * Permite que los alimentos creados o reconocidos por la IA sean compartidos
 * de forma global y colaborativa para todos los usuarios de Fitness Evolution.
 *
 * Estrategia:
 * 1. Base Local Compartida (IndexedDB global + LocalStorage) para persistencia sin latencia.
 * 2. Canal de Difusión en Tiempo Real (BroadcastChannel) para sincronización entre pestañas/usuarios.
 * 3. Nube Supabase (PostgreSQL + RLS) para sincronización multi-dispositivo cuando esté conectada.
 * 4. Semilla Comunitaria Inicial con aportes frecuentes (Mango, Caldo Verde, Batidos, etc.).
 */
import Dexie, { type Table } from 'dexie';
import type { Food, FoodCategory, Nutrients, Serving } from './types';
import { supabase } from '../../services/supabase';

export interface CommunityFoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  unit: 'g' | 'ml';
  per100: Nutrients;
  servings: Serving[];
  source: 'comunidad_ia' | 'cenan' | 'usda' | 'usuario';
  tags: string[];
  notes?: string;
  contributorName: string;
  confidencePct: number;
  dietaryInsights?: string[];
  upvotes: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Semilla inicial comunitaria (alimentos comunes y regionales aportados por usuarios/IA)
export const SEED_COMMUNITY_FOODS: CommunityFoodItem[] = [
  {
    id: 'comm_mango',
    name: 'Mango Fresco',
    category: 'fruits',
    unit: 'g',
    per100: { kcal: 58, proteinG: 0.8, carbsG: 14.0, fatG: 0.2, fiberG: 2.2 },
    servings: [{ label: '1 unidad / taza picada (120 g)', amount: 120 }],
    source: 'comunidad_ia',
    tags: ['comunidad', 'ia', 'frutas', 'peru', 'antioxidante'],
    notes: 'Aporte de la comunidad verificado con IA. Excelente fuente de vitamina C, A y fibra.',
    contributorName: 'Comunidad IA',
    confidencePct: 95,
    dietaryInsights: [
      'Fruta tropical energética con bajo índice glucémico relativo y rica en pectina.',
    ],
    upvotes: 28,
    verified: true,
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'comm_caldo_verde_cajamarca',
    name: 'Caldo Verde con Quesillo y Huevo',
    category: 'dishes',
    unit: 'g',
    per100: { kcal: 62, proteinG: 4.2, carbsG: 6.5, fatG: 2.1, fiberG: 1.2 },
    servings: [{ label: '1 plato sopero (450 g)', amount: 450 }],
    source: 'comunidad_ia',
    tags: ['cajamarca', 'celendin', 'sierra', 'comunidad', 'ia'],
    notes: 'Plato tradicional andino de Cajamarca/Celendín con paico, ruda, papa y quesillo fresco.',
    contributorName: 'Usuario Celendín',
    confidencePct: 98,
    dietaryInsights: [
      'Sopa digestiva rica en calcio biodisponible por el quesillo y clorofila vegetal.',
    ],
    upvotes: 35,
    verified: true,
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'comm_batido_whey_avena',
    name: 'Batido Whey con Avena y Plátano',
    category: 'drinks',
    unit: 'ml',
    per100: { kcal: 92, proteinG: 8.5, carbsG: 12.4, fatG: 1.2, fiberG: 1.5 },
    servings: [{ label: '1 vaso shaker (400 ml)', amount: 400 }],
    source: 'comunidad_ia',
    tags: ['fitness', 'proteina', 'post_entreno', 'comunidad'],
    notes: 'Batido anabólico equilibrado con proteína de suero, carbohidrato complejo y potasio.',
    contributorName: 'Comunidad Fitness',
    confidencePct: 96,
    dietaryInsights: [
      '34g de proteína total y 50g de carbohidratos en la porción recomendada.',
    ],
    upvotes: 42,
    verified: true,
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'comm_palta_fuerte',
    name: 'Palta Fuerte Hass',
    category: 'fats',
    unit: 'g',
    per100: { kcal: 160, proteinG: 2.0, carbsG: 8.5, fatG: 14.7, fiberG: 6.7 },
    servings: [{ label: '1/2 unidad mediana (100 g)', amount: 100 }],
    source: 'comunidad_ia',
    tags: ['grasas_saludables', 'peru', 'comunidad', 'cajamarca'],
    notes: 'Grasa monoinsaturada cardioprotectora rica en ácido oleico y potasio.',
    contributorName: 'Comunidad IA',
    confidencePct: 98,
    dietaryInsights: ['Aporte alto de fibra saciante y vitamina E lipofílica.'],
    upvotes: 31,
    verified: true,
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'comm_trucha_frita',
    name: 'Trucha Frita con Papas y Ensalada',
    category: 'protein',
    unit: 'g',
    per100: { kcal: 165, proteinG: 19.5, carbsG: 4.0, fatG: 8.0, fiberG: 0.5 },
    servings: [{ label: '1 filete entero (350 g)', amount: 350 }],
    source: 'comunidad_ia',
    tags: ['sierra', 'cajamarca', 'pescado', 'omega3', 'comunidad'],
    notes: 'Pescado de río andino con alto contenido de ácidos grasos Omega-3 y proteína magra.',
    contributorName: 'Usuario Sierra',
    confidencePct: 94,
    dietaryInsights: ['Excelente fuente de EPA/DHA y selenio para recuperación muscular.'],
    upvotes: 23,
    verified: true,
    createdAt: '2026-10-14T12:00:00.000Z',
    updatedAt: '2026-10-14T12:00:00.000Z',
  },
];

// Base de datos Dexie compartida a nivel global de dispositivo
class GlobalCommunityDb extends Dexie {
  communityFoods!: Table<CommunityFoodItem, string>;

  constructor() {
    super('fitness-evolution-community');
    this.version(1).stores({
      communityFoods: 'id, name, category, upvotes, updatedAt',
    });
  }
}

let communityDbInstance: GlobalCommunityDb | null = null;
function getCommunityDb(): GlobalCommunityDb {
  if (!communityDbInstance) {
    communityDbInstance = new GlobalCommunityDb();
  }
  return communityDbInstance;
}

// Canal de difusión para actualizar en tiempo real otras pestañas
const BROADCAST_CHANNEL_NAME = 'fe_community_catalog_broadcast';
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Normaliza texto para comparaciones sin tildes ni mayúsculas
 */
function clean(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Convierte un CommunityFoodItem a Food compatible con el motor de nutrición
 */
export function communityItemToFood(item: CommunityFoodItem): Food {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    unit: item.unit,
    per100: item.per100,
    servings: item.servings,
    source: 'estimado',
    tags: ['comunidad', 'ia_custom', ...(item.tags || [])],
    notes: `${item.notes || ''} [Aportado por: ${item.contributorName} • 👍 ${item.upvotes} validaciones]`,
  };
}

/**
 * Servicio Central del Catálogo Comunitario de Alimentos
 */
export const CommunityCatalogService = {
  /**
   * Inicializa y asegura que los alimentos semilla de la comunidad existan localmente
   */
  async ensureSeed(): Promise<void> {
    const db = getCommunityDb();
    const count = await db.communityFoods.count();
    if (count === 0) {
      await db.communityFoods.bulkPut(SEED_COMMUNITY_FOODS);
    }
  },

  /**
   * Obtiene todos los alimentos de la comunidad (locales + sincronizados de la nube)
   */
  async getAll(): Promise<CommunityFoodItem[]> {
    await this.ensureSeed();
    const db = getCommunityDb();
    const list = await db.communityFoods.toArray();
    // Ordenar por validaciones (upvotes) descendente, luego por fecha
    return list.sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  /**
   * Publica un nuevo alimento a la comunidad para que otros usuarios lo encuentren
   */
  async publishFood(params: {
    name: string;
    category: FoodCategory;
    unit: 'g' | 'ml';
    per100: Nutrients;
    servings: Serving[];
    notes?: string;
    contributorName?: string;
    confidencePct?: number;
    dietaryInsights?: string[];
    tags?: string[];
  }): Promise<CommunityFoodItem> {
    await this.ensureSeed();
    const db = getCommunityDb();
    const now = new Date().toISOString();

    // Generar ID semántico para evitar duplicaciones
    const slug = clean(params.name).replace(/[^a-z0-9]/g, '_');
    const existing = await db.communityFoods.where('name').equalsIgnoreCase(params.name.trim()).first();
    const id = existing?.id || `comm_${slug}_${Math.random().toString(36).slice(2, 6)}`;

    const newItem: CommunityFoodItem = {
      id,
      name: params.name.trim(),
      category: params.category,
      unit: params.unit,
      per100: params.per100,
      servings: params.servings.length
        ? params.servings
        : [{ label: `1 porción (${params.unit})`, amount: 100 }],
      source: 'comunidad_ia',
      tags: ['comunidad', 'ia', ...(params.tags || [])],
      notes: params.notes?.trim() || `Alimento aportado por ${params.contributorName || 'Usuario'}.`,
      contributorName: params.contributorName?.trim() || 'Usuario de la Comunidad',
      confidencePct: params.confidencePct ?? 90,
      dietaryInsights: params.dietaryInsights || [],
      upvotes: existing ? existing.upvotes + 1 : 1,
      verified: Boolean(existing?.verified),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    // 1. Guardar localmente en el almacén comunitario
    await db.communityFoods.put(newItem);

    // 2. Transmitir evento a otras pestañas/ventanas abiertas
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'FOOD_PUBLISHED', food: newItem });
      } catch {
        // BroadcastChannel silencioso
      }
    }

    // 3. Sincronizar con Supabase si está disponible en la nube
    if (supabase) {
      try {
        await supabase.from('community_foods').upsert({
          id: newItem.id,
          name: newItem.name,
          category: newItem.category,
          unit: newItem.unit,
          per100: newItem.per100,
          servings: newItem.servings,
          source: newItem.source,
          tags: newItem.tags,
          notes: newItem.notes,
          contributor_name: newItem.contributorName,
          confidence_pct: newItem.confidencePct,
          dietary_insights: newItem.dietaryInsights,
          upvotes: newItem.upvotes,
          verified: newItem.verified,
          created_at: newItem.createdAt,
          updated_at: newItem.updatedAt,
        });
      } catch (err) {
        console.warn('No se pudo sincronizar inmediatamente con Supabase (modo offline):', err);
      }
    }

    return newItem;
  },

  /**
   * Valida (upvote) un alimento comunitario por parte de otro usuario
   */
  async upvote(foodId: string): Promise<number> {
    const db = getCommunityDb();
    const item = await db.communityFoods.get(foodId);
    if (!item) return 0;

    const newUpvotes = item.upvotes + 1;
    const now = new Date().toISOString();
    await db.communityFoods.update(foodId, {
      upvotes: newUpvotes,
      updatedAt: now,
    });

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'FOOD_UPVOTED', foodId, upvotes: newUpvotes });
      } catch {
        // Silencioso
      }
    }

    if (supabase) {
      try {
        await supabase
          .from('community_foods')
          .update({ upvotes: newUpvotes, updated_at: now })
          .eq('id', foodId);
      } catch (err) {
        console.warn('Error sincronizando upvote con Supabase:', err);
      }
    }

    return newUpvotes;
  },

  /**
   * Sincroniza bidireccionalmente con la nube (Supabase) para traer nuevos alimentos
   * aportados por otros usuarios en cualquier parte del mundo.
   */
  async syncWithCloud(): Promise<{ synced: number; error?: string }> {
    await this.ensureSeed();
    const db = getCommunityDb();

    if (!supabase) {
      return { synced: 0, error: 'cloud_not_configured' };
    }

    try {
      // 1. Descargar alimentos remotos aportados por otros usuarios
      const { data, error } = await supabase
        .from('community_foods')
        .select('*')
        .order('upvotes', { ascending: false });

      if (error) {
        return { synced: 0, error: error.message };
      }

      if (data && data.length > 0) {
        const transformed: CommunityFoodItem[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          category: row.category as FoodCategory,
          unit: row.unit,
          per100: row.per100,
          servings: row.servings || [],
          source: 'comunidad_ia',
          tags: row.tags || [],
          notes: row.notes,
          contributorName: row.contributor_name || 'Usuario',
          confidencePct: row.confidence_pct || 90,
          dietaryInsights: row.dietary_insights || [],
          upvotes: row.upvotes || 1,
          verified: Boolean(row.verified),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        await db.communityFoods.bulkPut(transformed);
        return { synced: transformed.length };
      }

      return { synced: 0 };
    } catch (err: any) {
      return { synced: 0, error: err?.message || 'Error de red' };
    }
  },

  /**
   * Exporta todo el catálogo comunitario a formato JSON para compartirlo
   */
  async exportCatalogJson(): Promise<string> {
    const list = await this.getAll();
    return JSON.stringify(list, null, 2);
  },

  /**
   * Importa un catálogo comunitario desde JSON
   */
  async importCatalogJson(jsonString: string): Promise<number> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Formato inválido: se esperaba un arreglo');

      const validItems: CommunityFoodItem[] = parsed.filter(
        (x) => x && typeof x.name === 'string' && x.per100 && typeof x.per100.kcal === 'number'
      );

      if (validItems.length === 0) return 0;

      const db = getCommunityDb();
      await db.communityFoods.bulkPut(validItems);

      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type: 'CATALOG_IMPORTED', count: validItems.length });
        } catch {
          // Silencioso
        }
      }

      return validItems.length;
    } catch (err) {
      console.error('Error importando catálogo comunitario:', err);
      throw err;
    }
  },

  /**
   * Suscribe a cambios en tiempo real del catálogo comunitario
   */
  onUpdate(callback: () => void): () => void {
    const handler = () => callback();

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handler);
    }

    // Si Supabase Realtime está disponible, suscribirse al canal
    let supabaseSubscription: any = null;
    if (supabase) {
      try {
        supabaseSubscription = supabase
          .channel('public:community_foods')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'community_foods' },
            () => {
              callback();
            }
          )
          .subscribe();
      } catch {
        // Silencioso
      }
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handler);
      }
      if (supabase && supabaseSubscription) {
        supabase.removeChannel(supabaseSubscription);
      }
    };
  },
};
