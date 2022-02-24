import { Recipe } from '../../data/recipes';

interface AppState {
  items: Item[];
  inputs: Item[];
  products: Item[];
  byproducts: Item[];
}

interface Item {
  name: string;
  usedIn?: Recipe[];
  productOf?: Recipe[];
  price: number;
  margin?: number;
  markedForUpdated?: boolean;
}

export const initialState: AppState = {
  items: [],
  inputs: [],
  products: [],
  byproducts: [],
};
