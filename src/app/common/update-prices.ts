import { Product } from '../../data/recipes';
import { AppState, CraftingRecipe, Item } from './state';

import {
  getCraftingStationForRecipe,
  getIngredientItem,
  getProfessionOrThrow,
  getRecipeOrThrow,
} from './state-getters';

const upgradeEffect: [number, number, number, number, number, number] = [
  0, 0.9, 0.75, 0.6, 0.55, 0.5,
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
  if (element.updateId === updateId) return;

  // Set update Id to value of this update process to avoid duplicate processing
  element.updateId = updateId;

  if ('usedInRecipes' in element) {
    return updateItemPrice({ draft, updateId, item: element });
  }
  if ('products' in element) {
    return updateRecipePrice({ draft, updateId, recipe: element });
  }
}

interface UpdateItemPriceProps {
  draft: AppState;
  item: Item;
  updateId: number;
}

function updateItemPrice({ draft, item, updateId }: UpdateItemPriceProps) {
  // calculate own price
  item.price = Array.from(item.productOfRecipes || [])?.reduce(
    (cost, recipeName) => {
      const recipe = getRecipeOrThrow(draft.recipes, recipeName);
      updatePrice({ draft, updateId, element: recipe });
      return Math.min(cost, recipe.price);
    },
    0,
  );

  // update prices of dependent items
  return item.usedInRecipes?.forEach((recipeName) => {
    const recipe = getRecipeOrThrow(draft.recipes, recipeName);

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
  if (recipe.updateId === updateId) return;

  recipe.updateId = updateId;

  // calculate own price
  const craftingStation = getCraftingStationForRecipe(draft, recipe);
  const profession = getProfessionOrThrow(
    draft,
    craftingStation.profession.skill,
  );

  const ingredientsCost = recipe.ingredients.reduce((cost, ingredient) => {
    const item = getIngredientItem(draft, ingredient);
    // Make sure we're working with up-to-date ingredient prices
    updatePrice({ draft, updateId, element: item });

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

  const mainProduct = getMainProduct(recipe.products);

  const byproducts = recipe.products.filter(
    (product) => product.item !== mainProduct.item,
  );

  const byproductsCost = byproducts.reduce((cost, byproduct) => {
    const item = getIngredientItem(draft, byproduct);
    updatePrice({ draft, updateId, element: item });

    const byproductCost = byproduct.quantity * item.price;
    if (byproduct.isConstant) {
      return cost + byproductCost;
    }
    return cost + byproductCost * upgradeEffect[craftingStation.upgradeLevel];
  }, 0);

  const margin = recipe.margin || draft.margin;

  recipe.price = totalCost * margin - byproductsCost;
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
