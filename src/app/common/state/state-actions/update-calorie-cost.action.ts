import { ProcessActionProps } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateCalorieCostActionProps extends ProcessActionProps {
  newCost: number;
}

export const updateCalorieCostAction = ({
  draft,
  newCost,
}: UpdateCalorieCostActionProps) => {
  draft.calorieCost = newCost;
  draft.recipes.forEach((recipe) => {
    markForUpdate({ draft, element: recipe });
  });
  draft.recipes.forEach((recipe) => {
    updatePrice({ draft, element: recipe });
  });
  return;
};
