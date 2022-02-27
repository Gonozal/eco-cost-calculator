import { Product } from '../../data/recipes';
import { AppState, CraftingRecipe, Item } from './state';

import {
  getByproductItem,
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
  updateId: number;
}

export function updatePrice({
  draft,
  element,
  updateId,
}: UpdatePricesProps): void {
  // If the element cost was already recalculated, return now
  if (element.updateId === updateId) {
    console.log(`${element.name} already calcualted. Skipping`);
    return;
  }
  console.log(`Calculating price for ${element.name} `);

  // Set update Id to value of this update process to avoid duplicate processing
  element.updateId = updateId;

  if ('usedInRecipes' in element) {
    return updateItemPrice({ draft, updateId, item: element });
  }
  if ('products' in element) {
    return updateRecipePrice({ draft, updateId, recipe: element });
  }
}

interface UpdateByproductPriceProps {
  draft: AppState;
  item: Item;
  updateId: number;
}
export function updateByproductPrice({
  draft,
  item,
  updateId,
}: UpdateByproductPriceProps) {
  // If the element cost was already recalculated, return now
  if (item.updateId === updateId) return;

  // Set update Id to value of this update process to avoid duplicate processing
  item.updateId = updateId;

  item.productOfRecipes.forEach((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    updateRecipePrice({ draft, updateId, recipe });
  });
}

interface UpdateItemPriceProps {
  draft: AppState;
  item: Item;
  updateId: number;
}

function updateItemPrice({ draft, item, updateId }: UpdateItemPriceProps) {
  // calculate own price
  const mainProductOf = Array.from(item.productOfRecipes).filter(
    (recipeName) => {
      const recipe = getRecipeOrThrow(draft.recipes, recipeName);
      const mainProduct = getMainProduct(recipe.products);
      return mainProduct.item === item.name;
    },
  );

  const byproductOf = Array.from(item.productOfRecipes).filter((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    const byproduct = getByproduct(recipe.products);
    return byproduct?.item === item.name;
  });

  console.log({ item: item.name, mainProductOf });
  if (mainProductOf.length > 0) {
    item.price = mainProductOf.reduce((cost, recipeName) => {
      const recipe = getRecipeOrThrow(draft.recipes, recipeName);
      updatePrice({ draft, updateId, element: recipe });
      return Math.min(cost, recipe.price);
    }, Number.MAX_SAFE_INTEGER);
  }

  // update prices of dependent items
  item.usedInRecipes?.forEach((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);
    updatePrice({ draft, updateId, element: recipe });
  });

  // update prices of items that have this as a byproduct
  byproductOf.forEach((name) => {
    const recipe = getRecipeOrThrow(draft.recipes, name);
    updatePrice({ draft, updateId, element: recipe });
  });
}

interface UpdateRecipePriceProps {
  draft: AppState;
  recipe: CraftingRecipe;
  updateId: number;
}
function updateRecipePrice({
  draft,
  recipe,
  updateId,
}: UpdateRecipePriceProps) {
  // calculate own price
  const craftingStation = getCraftingStationForRecipe(draft, recipe);
  const profession = getProfessionOrThrow(
    draft,
    craftingStation.profession.skill,
  );

  const ingredientsCost = recipe.ingredients.reduce((cost, ingredient) => {
    const item = getIngredientItem(draft, ingredient);
    // Make sure we're working with up-to-date ingredient prices
    console.log(`ingredient ${item.name} unit cost: ${item.price}`);
    const ingredientCost = ingredient.quantity * item.price;
    if (ingredient.isConstant) {
      return cost + ingredientCost;
    }

    return cost + ingredientCost * upgradeEffect[craftingStation.upgradeLevel];
  }, 0);

  const calorieCost =
    draft.calorieCost *
    skillCalorieEffect[profession.level] *
    (recipe.calorie || 0);

  const craftingCost = craftingStation.costPerItem;

  const totalCost = ingredientsCost + calorieCost + craftingCost;

  const mainOutput = getMainProduct(recipe.products);
  const mainProduct = getIngredientItem(draft, mainOutput);

  const byproducts = recipe.products.filter(
    (product) => product.item !== mainProduct.name,
  );

  const byproductsCost = byproducts.reduce((cost, byproduct) => {
    const item = getByproductItem(draft, byproduct);
    updatePrice({ draft, updateId, element: item });

    const byproductCost = byproduct.quantity * item.price;
    if (byproduct.isConstant) {
      return cost + byproductCost;
    }
    return cost + byproductCost * upgradeEffect[craftingStation.upgradeLevel];
  }, 0);

  const margin = Math.max(1 + (recipe.margin || draft.margin), 1);

  recipe.price = (totalCost * margin - byproductsCost) / mainOutput.quantity;
  console.log(`Calculated ${recipe.name} recipe price to: ${recipe.price}`);

  // propagate to main products
  updatePrice({
    draft,
    updateId,
    element: mainProduct,
  });
}

export function getMainProduct(products: Product[]): Product {
  // Usual case. Only 1 product
  if (products.length === 1) return products[0];

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const hasScalingProduct = products.some((product) => !product.isConstant);
  if (hasScalingProduct)
    return products.find((product) => product.isConstant) as Product;

  // Return The product with the largest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => b.quantity - a.quantity)[0];

  // Are there other cases?
}

export function getByproduct(products: Product[]): Product | undefined {
  // Usual case. Only 1 main product
  if (products.length === 1) return undefined;

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const scalingProduct = products.find((product) => !product.isConstant);
  if (scalingProduct) return scalingProduct;

  // Return The product with the smallest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => a.quantity - b.quantity)[0];
}
