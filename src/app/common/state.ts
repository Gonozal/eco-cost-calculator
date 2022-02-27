import { current } from 'immer';
import { Profession, Recipe } from '../../data/recipes';
import { getRecipeOrThrow } from './state-getters';
import { getMainProduct, updatePrice } from './update-prices';

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

export type Action =
  | AddRecipeAction
  | RemoveRecipeAction
  | UpdateRecipeMarginAction;

export function reducer(draft: AppState, action: Action): void | AppState {
  console.log({ before: current(draft) });
  processAction(draft, action);
  console.log({ after: current(draft) });
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
    const item = draft.inputs.get(key) ?? draft.products.get(key);
    if (item) {
      item.usedInRecipes.add(addedRecipe.name);
      return;
    }
    draft.inputs.set(key, {
      highlighted: false,
      name: key,
      price: 0,
      usedInRecipes: new Set([addedRecipe.name]),
      productOfRecipes: new Set(),
    });
  });

  // Handle Products. Slightly more complex. See comments near segments
  const mainProduct = getMainProduct(addedRecipe.products);

  addedRecipe.products.forEach((product) => {
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
    }

    // item not yet added. Add to products/byproducts
    addTo.set(key, {
      highlighted: false,
      name: key,
      price: 0,
      productOfRecipes: new Set([addedRecipe.name]),
      usedInRecipes: new Set(),
    });
  });

  // Add crafting station if not already present
  if (draft.craftingStations.has(addedRecipe.table)) {
    const station = draft.craftingStations.get(
      addedRecipe.table,
    ) as CraftingStation;
    station.usedByRecipes.add(addedRecipe.name);
  } else {
    draft.craftingStations.set(addedRecipe.table, {
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
    console.log({ key, ingredient, item: current(item) });
    if (!item) return;

    // Remove recipe from item reference
    item.usedInRecipes.delete(removedRecipe.name);

    // If item isn't used in any more recipes, delete it from inputs
    // ignore if it's a product
    if (item.usedInRecipes.size === 0) {
      draft.inputs.delete(key);
    }
    console.log({ ingredient, item: current(item) });
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
    // - Otherwise delete it
    // Else, Check all recipes referencing this item.
    //  - If any of them has it as a main product, keep it
    //  - If none of them has it as a main product, move it to byproducts
    if (draft.products.has(key)) {
      const item = draft.products.get(key) as Item;
      item.productOfRecipes.delete(removedRecipe.name);

      if (item.productOfRecipes.size === 0) {
        draft.products.delete(key);
        if (item.usedInRecipes.size > 0) {
          draft.inputs.set(key, item);
        }
        return;
      }
      // Check if item is still main product anywhere. If not, move item to byproducts
      const stillMainProduct = Array.from(item.productOfRecipes).some(
        (recipeName) => {
          const recipe = getRecipeOrThrow(draft.recipes, recipeName);
          const mainProduct = getMainProduct(recipe.products);
          return mainProduct.item === item.name;
        },
      );
      if (!stillMainProduct) {
        draft.products.delete(key);
        draft.byproducts.set(key, item);
        if (item.usedInRecipes.size > 0) {
          draft.inputs.set(key, item);
        }
      } else {
        changedProducts.push(item);
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
  const table = draft.craftingStations.get(recipe.table);
  if (!table) return;

  table.usedByRecipes.delete(recipe.name);
  if (table.usedByRecipes.size > 0) return;

  draft.craftingStations.delete(recipe.table);

  const professionName = recipe.profession[0].skill;

  const professionStillUsed = Array.from(draft.craftingStations.values()).some(
    (station) => station.profession.skill === professionName,
  );
  if (professionStillUsed) return;

  draft.professions.delete(professionName);
}
