import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  CommunityCatalogService,
  SEED_COMMUNITY_FOODS,
  communityItemToFood,
} from './community-catalog';

describe('Community Food Catalog Service', () => {
  beforeEach(async () => {
    await CommunityCatalogService.ensureSeed();
  });

  it('loads community seed foods including Mango and regional dishes', async () => {
    const list = await CommunityCatalogService.getAll();
    expect(list.length).toBeGreaterThanOrEqual(SEED_COMMUNITY_FOODS.length);
    const mango = list.find((x) => x.name.toLowerCase().includes('mango'));
    expect(mango).toBeDefined();
    expect(mango?.per100.kcal).toBe(58);
    expect(mango?.category).toBe('fruits');
  });

  it('publishes a new AI food to the community catalog', async () => {
    const newFood = await CommunityCatalogService.publishFood({
      name: 'Batido Especial de Arándanos y Proteína',
      category: 'drinks',
      unit: 'ml',
      per100: { kcal: 75, proteinG: 7.2, carbsG: 9.0, fatG: 1.0, fiberG: 1.8 },
      servings: [{ label: '1 vaso (300ml)', amount: 300 }],
      notes: 'Batido antioxidante post-entrenamiento.',
      contributorName: 'Atleta Cajamarca',
    });

    expect(newFood.id).toBeDefined();
    expect(newFood.upvotes).toBe(1);

    const list = await CommunityCatalogService.getAll();
    const found = list.find((x) => x.name.includes('Arándanos'));
    expect(found).toBeDefined();
    expect(found?.contributorName).toBe('Atleta Cajamarca');
  });

  it('increments upvotes on community validation', async () => {
    const list = await CommunityCatalogService.getAll();
    const first = list[0]!;
    const initialVotes = first.upvotes;

    const updatedVotes = await CommunityCatalogService.upvote(first.id);
    expect(updatedVotes).toBe(initialVotes + 1);
  });

  it('converts a community item into a domain Food object properly', () => {
    const item = SEED_COMMUNITY_FOODS[0]!;
    const food = communityItemToFood(item);
    expect(food.id).toBe(item.id);
    expect(food.name).toBe(item.name);
    expect(food.tags).toContain('comunidad');
    expect(food.tags).toContain('ia_custom');
    expect(food.notes).toContain(item.contributorName);
  });

  it('exports and imports community catalog in JSON format', async () => {
    const jsonStr = await CommunityCatalogService.exportCatalogJson();
    expect(typeof jsonStr).toBe('string');
    expect(jsonStr).toContain('Mango');

    const importedCount = await CommunityCatalogService.importCatalogJson(jsonStr);
    expect(importedCount).toBeGreaterThanOrEqual(SEED_COMMUNITY_FOODS.length);
  });
});
