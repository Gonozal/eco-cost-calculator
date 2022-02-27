import { current, original } from 'immer';
import { Product, Profession, Recipe } from '../../data/recipes';
import { getCraftingStationName, getRecipeOrThrow } from './state-getters';
import {
  getByproduct,
  getMainProduct,
  updateByproductPrice,
  updatePrice,
} from './update-prices';

export type ItemMap = Map<string, Item>;
export type CraftingRecipeMap = Map<string, CraftingRecipe>;
export type CraftingStationMap = Map<string, CraftingStation>;
export type ProfessionMap = Map<string, Profession>;
export interface AppState {
  calorieCost: number;
  margin: number;
  recipes: CraftingRecipeMap;
  inputs: ItemMap;
  products: ItemMap;
  byproducts: ItemMap;
  craftingStations: CraftingStationMap;
  professions: ProfessionMap;
}

export interface Item {
  highlighted: boolean;
  name: string;
  usedInRecipes: Set<string>;
  productOfRecipes: Set<string>;
  price: number;
  updateId?: number;
}

export interface CraftingRecipe extends Recipe {
  price: number;
  highlighted: boolean;
  margin?: number;
  updateId: number;
}

export interface CraftingStation {
  name: string;
  upgradeLevel: 0 | 1 | 2 | 3 | 4 | 5;
  profession: Profession;
  costPerItem: number;
  costPerMinute: number;
  workflowFactor: number;
  usedByRecipes: Set<string>;
}

export const initialState: AppState = {
  calorieCost: 0,
  margin: 0,
  inputs: new Map(),
  products: new Map(),
  recipes: new Map(),
  byproducts: new Map(),
  craftingStations: new Map(),
  professions: new Map(),
};

export enum ActionType {
  ADD_RECIPE,
  REMOVE_RECIPE,
  UPDATE_RECIPE_MARGIN,
  UPDATE_ITEM_PRICE,
  UPDATE_BYPRODUCT_PRICE,
  UPDATE_CRAFTING_STATION_UPGRADE,
  UPDATE_PROFESSION_LEVEL,
  UPDATE_CALORIE_COST,
  UPDATE_MARGIN,
}

interface AddRecipeAction {
  type: ActionType.ADD_RECIPE;
  addedRecipe: CraftingRecipe;
}

interface RemoveRecipeAction {
  type: ActionType.REMOVE_RECIPE;
  removedRecipe: CraftingRecipe;
}

interface UpdateRecipeMarginAction {
  type: ActionType.UPDATE_RECIPE_MARGIN;
  removedRecipe: CraftingRecipe;
}

interface UpdateItemPriceAction {
  type: ActionType.UPDATE_ITEM_PRICE;
  updatedItem: {
    name: string;
    price: number;
  };
}

interface UpdateByproductPriceAction {
  type: ActionType.UPDATE_BYPRODUCT_PRICE;
  updatedItem: {
    name: string;
    price: number;
  };
}

export type Action =
  | AddRecipeAction
  | RemoveRecipeAction
  | UpdateItemPriceAction
  | UpdateByproductPriceAction
  | UpdateRecipeMarginAction;

export function reducer(draft: AppState, action: Action): void | AppState {
  try {
    processAction(draft, action);
  } catch (error) {
    console.error(error);
    console.warn({
      originalState: original(draft),
      newState: current(draft),
    });
  }
  console.log({ newDraft: current(draft), action });
}

// TODO: Implement change actions
function processAction(draft: AppState, action: Action): void {
  switch (action.type) {
    case ActionType.ADD_RECIPE:
      return processAddRecipeAction({ draft, addedRecipe: action.addedRecipe });
    case ActionType.REMOVE_RECIPE:
      return processRemoveRecipeAction({
        draft,
        removedRecipe: action.removedRecipe,
      });
    case ActionType.UPDATE_ITEM_PRICE:
      return processItemPriceUpdate({ draft, updatedItem: action.updatedItem });
    case ActionType.UPDATE_BYPRODUCT_PRICE:
      return processByproductPriceUpdate({
        draft,
        updatedItem: action.updatedItem,
      });

    default:
      return;
  }
}
interface ProcessActionProps {
  draft: AppState;
}
interface ProcessAddRecipeActionProps extends ProcessActionProps {
  addedRecipe: CraftingRecipe;
}
function processAddRecipeAction({
  draft,
  addedRecipe,
}: ProcessAddRecipeActionProps) {
  if (draft.recipes.has(addedRecipe.name)) return;

  draft.recipes.set(addedRecipe.name, addedRecipe);

  // handle ingredients. Fairly simple:
  // If ingredient already exists, add link to recipe
  addedRecipe.ingredients.forEach((ingredient) => {
    const key = (ingredient.item ?? ingredient.tag) as string;
    if (draft.products.get(key)) {
      draft.products.get(key)!.usedInRecipes.add(addedRecipe.name);
      return;
    }

    if (draft.inputs.get(key)) {
      draft.inputs.get(key)!.usedInRecipes.add(addedRecipe.name);
    } else {
      draft.inputs.set(key, {
        highlighted: false,
        name: key,
        price: 0,
        usedInRecipes: new Set([addedRecipe.name]),
        productOfRecipes: new Set(),
      });
    }

    if (draft.byproducts.get(key)) {
      draft.byproducts.get(key)!.usedInRecipes.add(addedRecipe.name);
      return;
    }
  });

  // Handle Products. Slightly more complex. See comments near segments
  const mainProduct = getMainProduct(addedRecipe.products);

  addedRecipe.products.forEach((product) => {
    handleAddedRecipeProducts({ product, mainProduct, draft, addedRecipe });
  });

  const craftingStationName = getCraftingStationName({ recipe: addedRecipe });
  // Add crafting station if not already present
  if (draft.craftingStations.has(craftingStationName)) {
    const station = draft.craftingStations.get(
      craftingStationName,
    ) as CraftingStation;
    station.usedByRecipes.add(addedRecipe.name);
  } else {
    draft.craftingStations.set(craftingStationName, {
      costPerItem: 0,
      costPerMinute: 0,
      name: addedRecipe.table,
      profession: addedRecipe.profession[0],
      upgradeLevel: 0,
      workflowFactor: 1,
      usedByRecipes: new Set([addedRecipe.name]),
    });
  }

  // Add profession if not already present
  if (!draft.professions.has(addedRecipe.profession[0].skill)) {
    draft.professions.set(addedRecipe.profession[0].skill, {
      level: 0,
      skill: addedRecipe.profession[0].skill,
    });
  }

  updatePrice({
    draft,
    updateId: Math.random(),
    element: addedRecipe,
  });
}

interface HandleAddedRecipeProductsProps {
  product: Product;
  mainProduct: Product;
  draft: AppState;
  addedRecipe: CraftingRecipe;
}
function handleAddedRecipeProducts({
  product,
  mainProduct,
  draft,
  addedRecipe,
}: HandleAddedRecipeProductsProps) {
  const isMainProduct = product.item === mainProduct.item;
  const addTo = isMainProduct ? draft.products : draft.byproducts;
  const key = product.item;

  // item already added as input. Move to products or duplicate it to byproducts
  if (draft.inputs.has(key)) {
    const item = draft.inputs.get(key) as Item;
    item.productOfRecipes.add(addedRecipe.name);
    // Only delete from inputs if item is main product.
    if (isMainProduct) draft.inputs.delete(key);
    addTo.set(key, item);
  }

  // item currently byproduct. Move to products/byproducts
  if (draft.byproducts.has(key)) {
    const item = draft.byproducts.get(key) as Item;
    item.productOfRecipes.add(addedRecipe.name);
    if (isMainProduct) {
      draft.byproducts.delete(key);
      addTo.set(key, item);
    }
  }

  // item already a product. Leave there, but update
  if (draft.products.has(key)) {
    const item = draft.products.get(key) as Item;
    item.productOfRecipes.add(addedRecipe.name);
    return;
  }

  // item not yet added. Add to products/byproducts
  addTo.set(key, {
    highlighted: false,
    name: key,
    price: 0,
    productOfRecipes: new Set([addedRecipe.name]),
    usedInRecipes: new Set(),
  });
}

interface ProcessRemoveRecipeActionProps extends ProcessActionProps {
  removedRecipe: CraftingRecipe;
}
function processRemoveRecipeAction({
  draft,
  removedRecipe,
}: ProcessRemoveRecipeActionProps) {
  // Recipe already removed, bail
  if (!draft.recipes.has(removedRecipe.name)) return;

  removedRecipe.ingredients.forEach((ingredient) => {
    const key = (ingredient.item ?? ingredient.tag) as string;
    const item = draft.inputs.get(key) ?? draft.products.get(key);
    if (!item) return;

    // Remove recipe from item reference
    item.usedInRecipes.delete(removedRecipe.name);

    // If item isn't used in any more recipes, delete it from inputs
    // ignore if it's a product
    if (item.usedInRecipes.size === 0) {
      draft.inputs.delete(key);
    }
  });

  const changedProducts: Item[] = [];

  removedRecipe.products.forEach((product) => {
    const key = product.item;

    // Remove recipe from reference of byproduct.
    // If it's not a product anymore, delete it from byproducts.
    // Since byproducts are duplicated if also an input,
    // no need to handle that case here
    if (draft.byproducts.has(key)) {
      const item = draft.byproducts.get(key) as Item;
      item.productOfRecipes.delete(removedRecipe.name);

      if (item.productOfRecipes.size === 0) {
        draft.byproducts.delete(key);
      }
    }

    // Remove recipe from reference of product.
    // Here we need to handle a few different cases:
    // If there are no recipes outputting this item:
    // - If it's still used in a recipe, add it to items
    // - If it's a byproduct in any recipe, add it to byproducts as well
    // - Otherwise delete it
    // Else, Check all recipes referencing this item.
    //  - If any of them has it as a main product, keep it
    //  - If none of them has it as a main product, move it to byproducts
    if (draft.products.has(key)) {
      const item = draft.products.get(key) as Item;
      item.productOfRecipes.delete(removedRecipe.name);

      const isMainProduct = Array.from(item.productOfRecipes).some(
        (recipeName) => {
          const recipe = getRecipeOrThrow(draft.recipes, recipeName);
          const mainProduct = getMainProduct(recipe.products);
          return mainProduct.item === item.name;
        },
      );

      const isByproduct = Array.from(item.productOfRecipes).some((key) => {
        const recipe = getRecipeOrThrow(draft.recipes, key);
        const byproduct = getByproduct(recipe.products);
        return byproduct?.item === item.name;
      });

      const isIngredient = item.usedInRecipes.size > 0;

      if (isMainProduct) {
        changedProducts.push(item);
      } else {
        draft.products.delete(key);
        if (isByproduct) {
          draft.byproducts.set(key, { ...current(item) });
        }
        if (isIngredient) {
          draft.inputs.set(key, item);
        }
      }
    }

    draft.recipes.delete(removedRecipe.name);
    removeRecipeFromCraftingStation(draft, removedRecipe);
    const updateId = Math.random();
    changedProducts.forEach((element) => {
      updatePrice({ draft, element, updateId });
    });
  });
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

  const professionName = recipe.profession[0].skill;

  const professionStillUsed = Array.from(draft.craftingStations.values()).some(
    (station) => station.profession.skill === professionName,
  );
  if (professionStillUsed) return;

  draft.professions.delete(professionName);
}

interface ProcessItemPriceUpdateProps {
  draft: AppState;
  updatedItem: { name: string; price: number };
}
function processItemPriceUpdate({
  draft,
  updatedItem,
}: ProcessItemPriceUpdateProps) {
  const properItem = draft.inputs.get(updatedItem.name);
  if (!properItem) return;
  properItem.price = updatedItem.price;

  return updatePrice({
    draft,
    updateId: Math.random(),
    element: properItem,
  });
}

function processByproductPriceUpdate({
  draft,
  updatedItem,
}: ProcessItemPriceUpdateProps) {
  const properItem = draft.byproducts.get(updatedItem.name);
  if (!properItem) return;
  properItem.price = updatedItem.price;

  return updateByproductPrice({
    draft,
    updateId: Math.random(),
    item: properItem,
  });
}
