import { AppState, CraftingRecipe, Item } from './state';

import {
  getCraftingStationForRecipe,
  getIngredientItem,
  getProfessionOrThrow,
  getRecipeOrThrow,
} from './state-getters';

const upgradeEffect: [number, number, number, number, number, number] = [
  1, 0.9, 0.75, 0.6, 0.55, 0.5,
];

const skillCalorieEffect: [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
] = [1, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2];

// We need a custom entrypoint here. Byproduct relations to recipe price is reversed over normal products.

interface UpdatePricesProps {
  draft: AppState;
  element: Item | CraftingRecipe;
}

// Marks a whole "dependency tree" of items and recipes for update.
// This is done to avoid cases where stale item prices are used in recipes
export function markForUpdate({ draft, element }: UpdatePricesProps) {
  if (draft.updating.has(element.name)) return;

  draft.updating.add(element.name);

  if ('usedInRecipes' in element) {
    element.usedInRecipes.forEach((recipeName) => {
      const recipe = draft.recipes.get(recipeName);
      recipe && markForUpdate({ draft, element: recipe });
    });
  }
  if ('mainProduct' in element) {
    const mainProduct = draft.products.get(element.mainProduct.name);
    mainProduct && markForUpdate({ draft, element: mainProduct });
  }
}

export function updatePrice({ draft, element }: UpdatePricesProps): void {
  // If the element cost was already recalculated, return now
  if (draft.updated.has(element.name)) {
    return;
  }
  try {
    if ('usedInRecipes' in element) {
      updateItemPrice({ draft, item: element });
    }
    if ('mainProduct' in element) {
      updateRecipePrice({ draft, recipe: element });
    }
  } catch (error) {
    // We expect to catch errors here.
    console.debug(error);
  } finally {
    // We use errors to bail out of calculations that have missing prereq updates.
    // We still need to continue with the recursion though
    if ('usedInRecipes' in element) {
      element.usedInRecipes.forEach((recipeName) => {
        const recipe = draft.recipes.get(recipeName);
        recipe && updatePrice({ draft, element: recipe });
      });
    }
    if ('mainProduct' in element) {
      const mainProduct = draft.products.get(element.mainProduct.name);
      mainProduct && updatePrice({ draft, element: mainProduct });
    }
  }
}

interface UpdateByproductPriceProps {
  draft: AppState;
  item: Item;
}
export function updateByproductPrice({
  draft,
  item,
}: UpdateByproductPriceProps) {
  item.byproductOfRecipes.forEach((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    markForUpdate({ draft, element: recipe });
  });

  item.byproductOfRecipes.forEach((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    updatePrice({ draft, element: recipe });
  });
}

interface UpdateItemPriceProps {
  draft: AppState;
  item: Item;
}

export function updateItemPrice({ draft, item }: UpdateItemPriceProps) {
  if (item.productOfRecipes.size === 0) {
    // This item isn't a product of anything, so it must be an item or byproduct.
    // Their prices are fixed through user-inputs and don't need to be updated.
    draft.updated.add(item.name);
    return;
  }
  let newPrice = Number.MAX_SAFE_INTEGER;

  item.productOfRecipes.forEach((recipeName) => {
    assertItemHasUpdated(draft, recipeName);
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    newPrice = Math.min(newPrice, recipe.price);
  });

  item.price = newPrice;
  draft.updated.add(item.name);
}

function assertItemHasUpdated(draft: AppState, name: string): void {
  if (!draft.updating.has(name)) return;
  if (draft.updated.has(name)) return;

  throw new Error(`${name} is marked for update but not updated yet!`);
}

interface UpdateRecipePriceProps {
  draft: AppState;
  recipe: CraftingRecipe;
}
function updateRecipePrice({ draft, recipe }: UpdateRecipePriceProps) {
  // calculate own price
  const craftingStation = getCraftingStationForRecipe(draft, recipe);
  const profession = getProfessionOrThrow(
    draft,
    craftingStation.profession.name,
  );

  const ingredientsCost = recipe.ingredients.reduce((cost, ingredient) => {
    assertItemHasUpdated(draft, (ingredient.name || ingredient.tag) as string);

    const item = getIngredientItem(draft, ingredient);
    const ingredientCost = ingredient.quantity * item.price;
    if (ingredient.isConstant) {
      return cost + ingredientCost;
    }

    const lavishFactor = profession.hasLavishWorkspace ? 0.95 : 1;

    const itemQuantity =
      ingredient.quantity *
      upgradeEffect[craftingStation.upgradeLevel] *
      lavishFactor;

    const batchedQuantity = recipe.batchSize
      ? Math.ceil(itemQuantity * recipe.batchSize) / recipe.batchSize
      : itemQuantity;

    return cost + batchedQuantity * item.price;
  }, 0);

  const calorieCost =
    (draft.calorieCost *
      skillCalorieEffect[profession.level] *
      (recipe.calories || 0)) /
    1000;

  const totalCost = ingredientsCost + calorieCost + (recipe.fixedCost ?? 0);

  const byproduct = draft.byproducts.get(recipe.byproduct?.name || '');

  const byproductCost =
    (byproduct?.price || 0) * (recipe.byproduct?.quantity || 0);

  const margin = Math.max(1 + (recipe.margin || draft.margin), 1);

  recipe.price =
    ((totalCost - byproductCost) / recipe.mainProduct.quantity) * margin;

  draft.updated.add(recipe.name);
}
