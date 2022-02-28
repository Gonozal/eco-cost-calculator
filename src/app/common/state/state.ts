import { current, original } from 'immer';
import { Profession, Recipe, recipes } from '../../../data/recipes';
import {
  processAddRecipeAction,
  processAddRecipeFromInputAction,
} from './state-actions/add-recipe.action';
import { processRemoveRecipeAction } from './state-actions/remove-recipe.action';
import { updateCalorieCostAction } from './state-actions/update-calorie-cost.action';
import { updateCraftingStationAction } from './state-actions/update-crafting-station.action';
import { updateMarginAction } from './state-actions/update-margin.action';
import { updateProfessionAction } from './state-actions/update-profession-level.action';
import {
  markForUpdate,
  updateByproductPrice,
  updatePrice,
} from './update-prices';

export interface ProfessionState extends Profession {
  hasLavishWorkspace?: boolean;
}

export type ItemMap = Map<string, Item>;
export type CraftingRecipeMap = Map<string, CraftingRecipe>;
export type CraftingStationMap = Map<string, CraftingStation>;
export type ProfessionMap = Map<string, ProfessionState>;
export interface AppState {
  id: number;
  calorieCost: number;
  margin: number;
  recipes: CraftingRecipeMap;
  inputs: ItemMap;
  products: ItemMap;
  byproducts: ItemMap;
  craftingStations: CraftingStationMap;
  professions: ProfessionMap;
  updating: Set<string>;
  updated: Set<string>;
  data: Recipe[];
}

export interface Item {
  canBeProduced: boolean;
  highlighted: boolean;
  name: string;
  displayName: string;
  usedInRecipes: Set<string>;
  productOfRecipes: Set<string>;
  byproductOfRecipes: Set<string>;
  price: number;
}

export interface CraftingRecipe extends Recipe {
  price: number;
  highlighted: boolean;
  margin?: number;
}
export type UpgradeLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface CraftingStation {
  name: string;
  upgradeLevel: UpgradeLevel;
  profession: ProfessionState;
  workflowFactor: number;
  usedByRecipes: Set<string>;
}

export const initialState: AppState = {
  id: Math.random(),
  calorieCost: 0,
  margin: 0,
  inputs: new Map(),
  products: new Map(),
  recipes: new Map(),
  byproducts: new Map(),
  craftingStations: new Map(),
  professions: new Map(),
  updating: new Set(),
  updated: new Set(),
  data: recipes,
};

export enum ActionType {
  ADD_RECIPE,
  ADD_RECIPE_FROM_INPUT,
  REMOVE_RECIPE,
  UPDATE_RECIPE_MARGIN,
  UPDATE_ITEM_PRICE,
  UPDATE_BYPRODUCT_PRICE,
  UPDATE_CRAFTING_STATION_UPGRADE,
  UPDATE_PROFESSION,
  UPDATE_CALORIE_COST,
  UPDATE_MARGIN,
}

interface AddRecipeAction {
  type: ActionType.ADD_RECIPE;
  addedRecipe: CraftingRecipe;
}
interface AddRecipeFromInputAction {
  type: ActionType.ADD_RECIPE_FROM_INPUT;
  input: Item;
}

interface RemoveRecipeAction {
  type: ActionType.REMOVE_RECIPE;
  removedRecipe: CraftingRecipe;
}

interface UpdateRecipeMarginAction {
  type: ActionType.UPDATE_RECIPE_MARGIN;
  recipe: CraftingRecipe;
  newMargin: number;
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

interface UpdateCraftingStationAction {
  type: ActionType.UPDATE_CRAFTING_STATION_UPGRADE;
  updatedCraftingStation: CraftingStation;
}

interface UpdateProfessionLevelAction {
  type: ActionType.UPDATE_PROFESSION;
  updatedProfession: ProfessionState;
}
interface UpdateMarginAction {
  type: ActionType.UPDATE_MARGIN;
  newMargin: number;
}

interface UpdateCalorieCostAction {
  type: ActionType.UPDATE_CALORIE_COST;
  newCost: number;
}

export type Action =
  | AddRecipeAction
  | AddRecipeFromInputAction
  | RemoveRecipeAction
  | UpdateItemPriceAction
  | UpdateByproductPriceAction
  | UpdateRecipeMarginAction
  | UpdateMarginAction
  | UpdateProfessionLevelAction
  | UpdateCraftingStationAction
  | UpdateCalorieCostAction;

export function reducer(draft: AppState, action: Action): void | AppState {
  console.time('state update');
  try {
    processAction(draft, action);
  } catch (error) {
    console.error(error);
    console.warn({
      originalState: original(draft),
      newState: current(draft),
    });
  }

  draft.updating = new Set();
  draft.updated = new Set();
  const newState = serializeState(current(draft));
  localStorage.setItem(`state-${draft.id}`, newState);
  console.timeEnd('state update');
}

function processAction(draft: AppState, action: Action): void {
  switch (action.type) {
    case ActionType.ADD_RECIPE:
      return processAddRecipeAction({ draft, addedRecipe: action.addedRecipe });
    case ActionType.ADD_RECIPE_FROM_INPUT:
      return processAddRecipeFromInputAction({
        draft,
        input: action.input,
      });
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
    case ActionType.UPDATE_PROFESSION:
      return updateProfessionAction({
        draft,
        updatedProfession: action.updatedProfession,
      });
    case ActionType.UPDATE_MARGIN:
      return updateMarginAction({ draft, newMargin: action.newMargin });
    case ActionType.UPDATE_CALORIE_COST:
      return updateCalorieCostAction({ draft, newCost: action.newCost });
    case ActionType.UPDATE_CRAFTING_STATION_UPGRADE:
      return updateCraftingStationAction({
        draft,
        updatedCraftingStation: action.updatedCraftingStation,
      });
    default:
      return;
  }
}
export interface ProcessActionProps {
  draft: AppState;
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

  markForUpdate({ draft, element: properItem });
  return updatePrice({
    draft,
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
    item: properItem,
  });
}

export function replacer(key: string, value: any) {
  if (!value) return value;
  if (value.__proto__ === Map.prototype) {
    return {
      _type: 'map',
      map: [...value],
    };
  }
  if (value.__proto__ === Set.prototype) {
    return {
      _type: 'set',
      set: [...value],
    };
  }

  return value;
}

export function reviver(_: string, value: any) {
  if (!value) return value;
  if (value._type === 'map') return new Map(value.map);
  if (value._type === 'set') return new Set(value.set);
  else return value;
}

export function serializeState(state: AppState): string {
  return JSON.stringify(state, replacer);
}

export function deserializeState(serialized: string): AppState {
  return JSON.parse(serialized, reviver);
}
