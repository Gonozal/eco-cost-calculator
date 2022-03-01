import { AppState, ProcessActionProps, reviver } from '../state';

interface ImportProfileActionProps extends ProcessActionProps {
  profileString: string;
}

export const importProfileAction = ({
  draft,
  profileString,
}: ImportProfileActionProps) => {
  try {
    const json: AppState = JSON.parse(profileString, reviver);

    draft.data = json.data;
    draft.craftingStations = json.craftingStations;
    draft.professions = json.professions;
    draft.recipes = json.recipes;
    draft.inputs = json.inputs;
    draft.products = json.products;
    draft.byproducts = json.byproducts;
    draft.calorieCost = json.calorieCost;
    draft.margin = json.margin;

    console.log(draft);
  } catch (error) {
    console.error(error);
  }
};
