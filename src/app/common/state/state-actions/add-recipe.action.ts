import {
  AppState,
  CraftingRecipe,
  CraftingStation,
  Item,
  ProcessActionProps,
} from '../state';
import { getCraftingStationName } from '../state-getters';
import { markForUpdate, updatePrice } from '../update-prices';

interface processAddRecipeFromInputActionProps extends ProcessActionProps {
  input: Item;
}

export function processAddRecipeFromInputAction({
  draft,
  input,
}: processAddRecipeFromInputActionProps) {
  const recipe = draft.data.find(
    (recipe) => recipe.mainProduct.name === input.name,
  );
  if (!recipe) return;
  return processAddRecipeAction({
    draft,
    addedRecipe: { ...recipe, price: 0, highlighted: false },
  });
}

interface ProcessAddRecipeActionProps extends ProcessActionProps {
  addedRecipe: CraftingRecipe;
}
export function processAddRecipeAction({
  draft,
  addedRecipe,
}: ProcessAddRecipeActionProps) {
  if (draft.recipes.has(addedRecipe.name)) return;

  draft.recipes.set(addedRecipe.name, addedRecipe);

  // handle ingredients. Fairly simple:
  // If ingredient already exists, add link to recipe
  addedRecipe.ingredients.forEach((ingredient) => {
    const key = (ingredient.name ?? ingredient.tag) as string;

    // add recipe reference to existing items
    draft.products.get(key)?.usedInRecipes.add(addedRecipe.name);
    draft.inputs.get(key)?.usedInRecipes.add(addedRecipe.name);
    draft.byproducts.get(key)?.usedInRecipes.add(addedRecipe.name);

    // If item is neither a product nor an input, add it to inputs now

    if (!draft.products.has(key) && !draft.inputs.has(key)) {
      draft.inputs.set(key, {
        highlighted: false,
        displayName: ingredient.displayName,
        name: key,
        price: 0,
        usedInRecipes: new Set([addedRecipe.name]),
        productOfRecipes: new Set(),
        byproductOfRecipes: new Set(),
        canBeProduced: Boolean(
          draft.data.find(
            (recipe) => recipe.mainProduct.name === ingredient.name,
          ),
        ),
      });
    }
  });

  // Handle Products. Slightly more complex. See comments near segments

  // Add recipe reference to existing items

  handleAddedRecipeMainProduct({ draft, addedRecipe });
  handleAddedRecipeByproduct({ draft, addedRecipe });

  const craftingStationName = getCraftingStationName({ recipe: addedRecipe });
  // Add crafting station if not already present
  if (draft.craftingStations.has(craftingStationName)) {
    const station = draft.craftingStations.get(
      craftingStationName,
    ) as CraftingStation;
    station.usedByRecipes.add(addedRecipe.name);
  } else {
    draft.craftingStations.set(craftingStationName, {
      name: addedRecipe.table,
      profession: addedRecipe.professions[0],
      upgradeLevel: 0,
      workflowFactor: 1,
      usedByRecipes: new Set([addedRecipe.name]),
    });
  }

  // Add profession if not already present
  if (!draft.professions.has(addedRecipe.professions[0].name)) {
    draft.professions.set(addedRecipe.professions[0].name, {
      level: 0,
      displayName: addedRecipe.professions[0].displayName,
      name: addedRecipe.professions[0].name,
    });
  }
  const mainProduct = draft.products.get(addedRecipe.mainProduct.name);
  if (mainProduct) {
    markForUpdate({ draft, element: addedRecipe });
    updatePrice({ draft, element: addedRecipe });
  }
}

interface HandleAddedRecipeProductsProps {
  draft: AppState;
  addedRecipe: CraftingRecipe;
}

// If added as a product, an item is moved from inputs to products.
// Unless there is no input item of that type, then a new item is added to products
function handleAddedRecipeMainProduct({
  draft,
  addedRecipe,
}: HandleAddedRecipeProductsProps) {
  const key = addedRecipe.mainProduct.name;
  // item already added as input. Move to products
  if (draft.inputs.has(key)) {
    const item = draft.inputs.get(key) as Item;
    item.productOfRecipes.add(addedRecipe.name);
    // Only delete from inputs if item is main product.
    draft.inputs.delete(key);
    draft.products.set(key, { ...item });
  }

  // item already a product. Leave there, but update
  if (draft.products.has(key)) {
    const item = draft.products.get(key) as Item;
    item.productOfRecipes.add(addedRecipe.name);
    return;
  }

  // item not yet added. Add to products
  draft.products.set(key, {
    displayName: addedRecipe.mainProduct.displayName,
    highlighted: false,
    name: key,
    price: 0,
    productOfRecipes: new Set([addedRecipe.name]),
    usedInRecipes: new Set(),
    byproductOfRecipes: new Set(),
    canBeProduced: Boolean(
      draft.data.find(
        (recipe) => recipe.mainProduct.name === addedRecipe.mainProduct.name,
      ),
    ),
  });
}

// Byproducts are handled solely through the byproduct set.
// As such, we only need to update it there or add it
function handleAddedRecipeByproduct({
  draft,
  addedRecipe,
}: HandleAddedRecipeProductsProps) {
  if (!addedRecipe.byproduct) return;

  const key = addedRecipe.byproduct?.name;
  if (draft.byproducts.has(key)) {
    const item = draft.byproducts.get(key) as Item;
    item.byproductOfRecipes.add(addedRecipe.name);
    return;
  }

  draft.byproducts.set(key, {
    displayName: addedRecipe.byproduct.displayName,
    highlighted: false,
    name: key,
    price: 0,
    productOfRecipes: new Set(),
    usedInRecipes: new Set(),
    byproductOfRecipes: new Set([addedRecipe.name]),
    canBeProduced: Boolean(
      draft.data.find(
        (recipe) => recipe.mainProduct.name === addedRecipe.byproduct?.name,
      ),
    ),
  });
}
