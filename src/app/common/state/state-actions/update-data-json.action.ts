import { recipesFromJson } from '../../../../data/recipes';
import { ProcessActionProps } from '../state';

interface UpdateDataJsonActionProps extends ProcessActionProps {
  data: string;
}

export const updateDataJsonAction = ({
  draft,
  data,
}: UpdateDataJsonActionProps) => {
  try {
    const json = JSON.parse(data);

    const recipes = recipesFromJson(json);

    draft.data = recipes;
    // Reset all products
    draft.craftingStations = new Map();
    draft.professions = new Map();
    draft.recipes = new Map();
    draft.inputs = new Map();
    draft.products = new Map();
    draft.byproducts = new Map();
  } catch (error) {
    console.error(error);
  }
};
