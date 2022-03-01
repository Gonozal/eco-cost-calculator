import { current, original } from 'immer';
import { Profession, Recipe, recipes } from '../../../data/recipes';
import { Profile } from '../../layout/content';
import {
  processAddRecipeAction,
  processAddRecipeFromInputAction,
} from './state-actions/add-recipe.action';
import { importProfileAction } from './state-actions/import-profile.action';
import { processRemoveRecipeAction } from './state-actions/remove-recipe.action';
import { updateRecipeSettingsAction } from './state-actions/set-recipe-settings.action';
import { updateCalorieCostAction } from './state-actions/update-calorie-cost.action';
import { updateCraftingStationAction } from './state-actions/update-crafting-station.action';
import { updateDataJsonAction } from './state-actions/update-data-json.action';
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
  name: string;
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
  batchSize?: number;
  margin?: number;
  fixedCost?: number;
}
export type UpgradeLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface CraftingStation {
  name: string;
  upgradeLevel: UpgradeLevel;
  profession: ProfessionState;
  workflowFactor: number;
  usedByRecipes: Set<string>;
}
export const LOCAL_STORAGE_KEY = 'appState';

export type ProfileMap = Map<number, AppState>;

export interface Profiles {
  activeProfile: number;
  profiles: ProfileMap;
  dispatch: React.Dispatch<Action>;
}

export const initialState: AppState = {
  id: Math.random(),
  name: 'Default',
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

export const standardProfiles: Profiles = {
  activeProfile: 0,
  profiles: new Map([[0, { ...initialState, id: 0 }]]),
  dispatch: (action: Action) => undefined,
};

export enum ActionType {
  ADD_RECIPE,
  ADD_RECIPE_FROM_INPUT,
  UPLOAD_DATA_JSON,
  REMOVE_RECIPE,
  UPDATE_RECIPE_SETTINGS,
  UPDATE_ITEM_PRICE,
  UPDATE_BYPRODUCT_PRICE,
  UPDATE_CRAFTING_STATION_UPGRADE,
  UPDATE_PROFESSION,
  UPDATE_CALORIE_COST,
  IMPORT_PROFILE,
  UPDATE_MARGIN,
  UPDATE_PROFILE_NAME,
  ADD_PROFILE,
  DELETE_ACTIVE_PROFILE,
  SET_ACTIVE_PROFILE,
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
  type: ActionType.UPDATE_RECIPE_SETTINGS;
  updatedRecipe: {
    name: string;
    margin: number;
    batchSize: number;
    fixedCost?: number;
  };
}

interface UpdateItemPriceAction {
  type: ActionType.UPDATE_ITEM_PRICE;
  updatedItem: {
    name: string;
    price: number;
  };
}

interface ImportProfileAction {
  type: ActionType.IMPORT_PROFILE;
  profileString: string;
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

interface UpdateDataJsonAction {
  type: ActionType.UPLOAD_DATA_JSON;
  data: string;
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

interface SetActiveProfileAction {
  type: ActionType.SET_ACTIVE_PROFILE;
  activeProfileId: number;
}

interface AddProfileAction {
  type: ActionType.ADD_PROFILE;
  newProfile: Profile;
}

interface UpdateProfileNameAction {
  type: ActionType.UPDATE_PROFILE_NAME;
  newName: string;
}

interface DeleteActiveProfileAction {
  type: ActionType.DELETE_ACTIVE_PROFILE;
}

export type Action =
  | AddRecipeAction
  | AddRecipeFromInputAction
  | RemoveRecipeAction
  | UpdateItemPriceAction
  | UpdateByproductPriceAction
  | UpdateRecipeMarginAction
  | ImportProfileAction
  | UpdateMarginAction
  | UpdateDataJsonAction
  | UpdateProfessionLevelAction
  | UpdateCraftingStationAction
  | UpdateCalorieCostAction
  | AddProfileAction
  | DeleteActiveProfileAction
  | UpdateProfileNameAction
  | SetActiveProfileAction;

export function reducer(draft: Profiles, action: Action): void | Profiles {
  console.time('state update');

  // global state altering actions
  processGlobalAction(draft, action);

  // actions regarding a single profile
  const activeProfile = draft.profiles.get(draft.activeProfile);
  if (!activeProfile) return;
  try {
    processProfileAction(activeProfile, action);
  } catch (error) {
    console.error(error);
    console.warn({
      originalState: original(activeProfile),
      newState: current(activeProfile),
    });
  }

  activeProfile.updating = new Set();
  activeProfile.updated = new Set();

  const newState = serializeState(current(draft));
  localStorage.setItem(LOCAL_STORAGE_KEY, newState);
  console.timeEnd('state update');
}

function processGlobalAction(draft: Profiles, action: Action): void {
  switch (action.type) {
    case ActionType.SET_ACTIVE_PROFILE:
      draft.activeProfile = action.activeProfileId;
      return;
    case ActionType.ADD_PROFILE:
      const id = Math.random();
      draft.profiles.set(id, {
        ...initialState,
        ...action.newProfile,
        id,
      });
      return;
    case ActionType.DELETE_ACTIVE_PROFILE:
      draft.profiles.delete(draft.activeProfile);
      draft.activeProfile = Array.from(draft.profiles.keys())[0];
      return;
  }
}

function processProfileAction(draft: AppState, action: Action): void {
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
    case ActionType.UPLOAD_DATA_JSON:
      return updateDataJsonAction({ draft, data: action.data });
    case ActionType.IMPORT_PROFILE:
      console.log(action.profileString);
      return importProfileAction({
        draft,
        profileString: action.profileString,
      });
    case ActionType.UPDATE_RECIPE_SETTINGS:
      return updateRecipeSettingsAction({
        draft,
        updatedRecipe: action.updatedRecipe,
      });
    case ActionType.UPDATE_PROFILE_NAME:
      draft.name = action.newName;
      return;
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

export function serializeState(state: Profiles): string {
  return JSON.stringify(state, replacer);
}

export function deserializeState(serialized: string): Profiles {
  return JSON.parse(serialized, reviver);
}
