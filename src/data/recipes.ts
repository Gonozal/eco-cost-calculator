export interface Recipe {
  ingredients: Ingredient[];
  products: Product[];
  name: string;
  calorie: number;
  xp: number;
  table: string;
  profession: Profession[];
}

export interface Profession {
  skill: string;
  level: number;
}

export interface BaselineItem {
  quantity: number;
  isConstant: boolean;
}

export interface Product extends BaselineItem {
  item: string;
}

export interface TagIngredient extends BaselineItem {
  item: null;
  tag: string;
}

export interface ItemIngredient extends BaselineItem {
  item: string;
  tag: null;
}

export type Ingredient = ItemIngredient | TagIngredient;
