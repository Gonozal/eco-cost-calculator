import { ProcessActionProps } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateMarginActionProps extends ProcessActionProps {
  newMargin: number;
}

export const updateMarginAction = ({
  draft,
  newMargin,
}: UpdateMarginActionProps) => {
  draft.margin = newMargin;
  draft.recipes.forEach((recipe) => {
    markForUpdate({ draft, element: recipe });
  });
  draft.recipes.forEach((recipe) => {
    updatePrice({ draft, element: recipe });
  });
  return;
};
