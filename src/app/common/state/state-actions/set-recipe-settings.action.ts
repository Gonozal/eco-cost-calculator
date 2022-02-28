import { ProcessActionProps } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateRecipeSettingsActionProps extends ProcessActionProps {
  updatedRecipe: {
    name: string;
    margin: number;
    batchSize: number;
  };
}

export const updateRecipeSettingsAction = ({
  draft,
  updatedRecipe,
}: UpdateRecipeSettingsActionProps) => {
  const recipe = draft.recipes.get(updatedRecipe.name);

  if (!recipe) return;

  recipe.batchSize = updatedRecipe.batchSize;
  recipe.margin = updatedRecipe.margin;

  markForUpdate({ draft, element: recipe });
  updatePrice({ draft, element: recipe });
};
