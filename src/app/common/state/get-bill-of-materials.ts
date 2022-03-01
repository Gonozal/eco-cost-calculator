import { AppState, CraftingRecipe, Item } from './state';

interface BOMIngredient {
  name: string;
  amount: number;
  cost: number;
}

interface DetailedStatistics {
  calories: number;
  fixedCosts: number;
  billOfMaterials: Map<string, BOMIngredient>;
  tableCraftingTimes: Map<string, number>;
}
interface GetDetailedStatisticsProps {
  state: AppState;
  element: Item | CraftingRecipe;
}

export function getDetailedStatistics({
  state,
  element,
}: GetDetailedStatisticsProps) {
  return;
}

interface GetCraftingRecipeStatisticsProps {
  state: AppState;
  recipe: CraftingRecipe;
}
export function getBillOfMaterialsForRecipe({
  state,
  recipe,
}: GetCraftingRecipeStatisticsProps) {
  return;
}
