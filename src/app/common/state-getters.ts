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

export function getRecipeOrThrow(
  recipes: CraftingRecipeMap,
  key: string,
): CraftingRecipe {
  const recipe = recipes.get(key);
  if (!recipe) throw new Error(`Recipe ${key} not found`);
  return recipe;
}

export function getCraftingStationForRecipe(
  draft: AppState,
  recipe: CraftingRecipe,
): CraftingStation {
  const station = draft.craftingStations.get(
    `${recipe.table}|${recipe.profession[0].skill}`,
  );
  if (!station)
    throw new Error(
      `Could not find ${recipe.table} for ${recipe.profession[0].skill}`,
    );
  return station;
}

export function getProfessionOrThrow(draft: AppState, key: string) {
  const profession = draft.professions.get(key);
  if (!profession) throw new Error(`Profession ${key} not found`);
  return profession;
}
