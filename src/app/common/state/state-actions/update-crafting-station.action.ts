import { CraftingStation, ProcessActionProps } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateCraftingStationActionProps extends ProcessActionProps {
  updatedCraftingStation: CraftingStation;
}

export const updateCraftingStationAction = ({
  draft,
  updatedCraftingStation,
}: UpdateCraftingStationActionProps) => {
  const key = `${updatedCraftingStation.name}|${updatedCraftingStation.profession.name}`;
  const craftingStation = draft.craftingStations.get(key);
  if (!craftingStation) return;

  craftingStation.upgradeLevel = updatedCraftingStation.upgradeLevel;

  draft.recipes.forEach((recipe) => {
    console.log([recipe.table, craftingStation.name]);
    if (recipe.table !== craftingStation.name) return;
    markForUpdate({ draft, element: recipe });
  });

  draft.recipes.forEach((recipe) => {
    if (recipe.table !== craftingStation.name) return;
    updatePrice({ draft, element: recipe });
  });

  return;
};
