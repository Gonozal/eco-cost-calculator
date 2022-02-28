import { CraftingRecipe, ProcessActionProps, ProfessionState } from '../state';
import { markForUpdate, updatePrice } from '../update-prices';

interface UpdateProfessionLevelProps extends ProcessActionProps {
  updatedProfession: ProfessionState;
}

export const updateProfessionAction = ({
  draft,
  updatedProfession,
}: UpdateProfessionLevelProps) => {
  const profession = draft.professions.get(updatedProfession.name);
  if (!profession) return;

  profession.level = updatedProfession.level;
  profession.hasLavishWorkspace =
    updatedProfession.level >= 6 && updatedProfession.hasLavishWorkspace;

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
  profession: ProfessionState,
) {
  return recipe.professions.some(
    (recipeProfession) => recipeProfession.name === profession.name,
  );
}
