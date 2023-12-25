import protoRecipe from './recipes.json';

type ProtoRecipe = typeof protoRecipe;

export interface Recipe {
  ingredients: Ingredient[];
  mainProduct: Product;
  byproduct?: Product;
  name: string;
  calories?: number;
  experience: number;
  table: string;
  professions: Profession[];
}

export interface Profession {
  name: string;
  displayName: string;
  level: number;
}

export interface BaselineItem {
  quantity: number;
  isConstant: boolean;
  displayName: string;
}

export interface Product extends BaselineItem {
  name: string;
}

export interface TagIngredient extends BaselineItem {
  name: null;
  tag: string;
}

export interface ItemIngredient extends BaselineItem {
  name: string;
  tag: null;
}

export type Ingredient = ItemIngredient | TagIngredient;

export const recipes: Recipe[] = recipesFromJson(protoRecipe);

export function recipesFromJson(json: ProtoRecipe) {
  return json.map((recipe) => {
    const mainProduct = getMainProduct(recipe.products);
    const byproduct = getByproduct(recipe.products);

    return { ...recipe, mainProduct, byproduct };
  });
}

export function getMainProduct(products: Product[]): Product {
  // Usual case. Only 1 product
  if (products.length === 1) return products[0];

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const hasScalingProduct = products.some((product) => !product.isConstant);
  if (hasScalingProduct)
    return products.find((product) => product.isConstant) as Product;

  // Return The product with the largest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => b.quantity - a.quantity)[0];

  // Are there other cases?
}

export function getByproduct(products: Product[]): Product | undefined {
  // Usual case. Only 1 main product
  if (products.length === 1) return undefined;

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const scalingProduct = products.find((product) => !product.isConstant);
  if (scalingProduct) return scalingProduct;

  // Return The product with the smallest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => a.quantity - b.quantity)[0];
}
