import { AppState, CraftingRecipe, ProcessActionProps } from '../state';
import { getCraftingStationName } from '../state-getters';
import { markForUpdate, updatePrice } from '../update-prices';

interface ProcessRemoveRecipeActionProps extends ProcessActionProps {
  removedRecipe: CraftingRecipe;
}
export function processRemoveRecipeAction({
  draft,
  removedRecipe,
}: ProcessRemoveRecipeActionProps) {
  // Recipe already removed, bail
  if (!draft.recipes.has(removedRecipe.name)) return;

  removedRecipe.ingredients.forEach((ingredient) => {
    const key = (ingredient.name ?? ingredient.tag) as string;
    const item = draft.inputs.get(key) ?? draft.products.get(key);
    if (!item) return;

    // Remove recipe from item reference
    item.usedInRecipes.delete(removedRecipe.name);

    // If item isn't used in any more recipes, delete it from inputs
    if (item.usedInRecipes.size === 0) {
      if (draft.inputs.has(key)) draft.inputs.delete(key);
    }
  });

  removeRecipeByproduct({ draft, removedRecipe });
  removeRecipeMainProduct({ draft, removedRecipe });

  draft.recipes.delete(removedRecipe.name);
  removeRecipeFromCraftingStation(draft, removedRecipe);

  const mainProduct = draft.products.get(removedRecipe.mainProduct.name);
  if (mainProduct) {
    markForUpdate({ draft, element: mainProduct });
    updatePrice({ draft, element: mainProduct });
  }
}

interface RemoveRecipeProductProps {
  draft: AppState;
  removedRecipe: CraftingRecipe;
}

// Remove recipe from references.
// Move from products to inputs if it's still used as an ingredient but not outputted by a recipe
// If no references left on input, delete it
function removeRecipeMainProduct({
  draft,
  removedRecipe,
}: RemoveRecipeProductProps) {
  const key = removedRecipe.mainProduct.name;
  if (!key) return;

  const item = draft.products.get(key);
  if (!item) return;

  item.productOfRecipes.delete(removedRecipe.name);

  if (item.productOfRecipes.size > 0) return;

  // Item isn't a product anymore, so remove it
  draft.products.delete(key);

  // Is item still used as an ingredient? If so, add it back to inputs
  if (item.usedInRecipes.size > 0) {
    draft.inputs.set(key, item);
  }
}

// Remove byproduct reference. Remove from byproducts if no references are left
function removeRecipeByproduct({
  draft,
  removedRecipe,
}: RemoveRecipeProductProps) {
  const key = removedRecipe.byproduct?.name;
  if (!key) return;

  const item = draft.byproducts.get(key);

  if (!item) return;

  item.byproductOfRecipes.delete(removedRecipe.name);
  if (item.byproductOfRecipes.size === 0) {
    draft.byproducts.delete(key);
  }
}

function removeRecipeFromCraftingStation(
  draft: AppState,
  recipe: CraftingRecipe,
): void {
  const craftingStationName = getCraftingStationName({ recipe });
  const table = draft.craftingStations.get(craftingStationName);
  if (!table) return;

  table.usedByRecipes.delete(recipe.name);
  if (table.usedByRecipes.size > 0) return;

  draft.craftingStations.delete(craftingStationName);

  const professionName = recipe.professions[0].name;

  const professionStillUsed = Array.from(draft.craftingStations.values()).some(
    (station) => station.profession.name === professionName,
  );
  if (professionStillUsed) return;

  draft.professions.delete(professionName);
}
