import {
  AppState,
  CraftingRecipe,
  CraftingRecipeMap,
  CraftingStation,
  Item,
} from './state';

export function getIngredientItem(
  draft: AppState,
  ingredient: { item?: string | null; tag?: string | null },
): Item {
  const key = (ingredient.item ?? ingredient.tag) as string;
  const item = draft.inputs.get(key) ?? draft.products.get(key);
  if (!item)
    throw new Error(`could not find ingredient or product with key ${key}`);
  return item;
}

export function getByproductItem(
  draft: AppState,
  ingredient: { item?: string | null; tag?: string | null },
): Item {
  const key = (ingredient.item ?? ingredient.tag) as string;
  const item = draft.byproducts.get(key) ?? draft.products.get(key);
  if (!item) throw new Error(`could not find byproduct with key ${key}`);
  return item;
}

export function getRecipeOrThrow(
  recipes: CraftingRecipeMap,
  key: string,
): CraftingRecipe {
  const recipe = recipes.get(key);
  if (!recipe) throw new Error(`Recipe ${key} not found`);
  return recipe;
}

export function getCraftingStationName({ recipe }: { recipe: CraftingRecipe }) {
  return `${recipe.table}|${recipe.profession[0].skill}`;
}

export function getCraftingStationForRecipe(
  draft: AppState,
  recipe: CraftingRecipe,
): CraftingStation {
  const station = draft.craftingStations.get(
    getCraftingStationName({ recipe }),
  );
  if (!station)
    throw new Error(
      `Could not find ${recipe.table} for ${recipe.profession[0].skill}.`,
    );
  return station;
}

export function getProfessionOrThrow(draft: AppState, key: string) {
  const profession = draft.professions.get(key);
  if (!profession) throw new Error(`Profession ${key} not found`);
  return profession;
}
