import { Profession } from '../../../../data/recipes';
import { CraftingRecipe, ProcessActionProps } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateProfessionLevelProps extends ProcessActionProps {
  updatedProfession: Profession;
}

export const updateProfessionLevelAction = ({
  draft,
  updatedProfession,
}: UpdateProfessionLevelProps) => {
  const profession = draft.professions.get(updatedProfession.name);
  if (!profession) return;

  profession.level = updatedProfession.level;

  draft.recipes.forEach((recipe) => {
    if (!recipeMatchesProfession(recipe, profession)) return;

    markForUpdate({ draft, element: recipe });
  });
  draft.recipes.forEach((recipe) => {
    if (!recipeMatchesProfession(recipe, profession)) return;

    updatePrice({ draft, element: recipe });
  });
  return;
};

function recipeMatchesProfession(
  recipe: CraftingRecipe,
  profession: Profession,
) {
  return recipe.professions.some(
    (recipeProfession) => recipeProfession.name === profession.name,
  );
}
