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
    const mainProduct = getMainProduct(recipe.products, recipe.name);
    const byproduct = getByproduct(recipe.products, mainProduct);

    if (recipe.name === 'Crispy Bacon')
      console.log({ recipeName: recipe.name, mainProduct, byproduct });

    return { ...recipe, mainProduct, byproduct };
  });
}

export function getMainProduct(
  products: Product[],
  recipeName: string,
): Product {
  // Usual case. Only 1 product
  if (products.length === 1) return products[0];

  // https://github.com/Gonozal/eco-cost-calculator/issues/3
  const identicallyNamedProduct = products.find((product) => {
    const concatRecipeName = recipeName.replace(' ', '');
    const match = product.name.match(concatRecipeName);

    return match;
  });

  if (identicallyNamedProduct) return identicallyNamedProduct;

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  const hasScalingProduct = products.some((product) => !product.isConstant);
  if (hasScalingProduct)
    return products.find((product) => product.isConstant) as Product;

  // Return The product with the largest quantity (e.g. ore crushing)
  return [...products].sort((a, b) => b.quantity - a.quantity)[0];

  // Are there other cases?
}

export function getByproduct(
  products: Product[],
  mainProduct: Product,
): Product | undefined {
  // Usual case. Only 1 main product
  if (products.length === 1) return undefined;

  // "Waste" Byproduct that scales with inputs. E.g. smelting (slag) or concentrating (tailings), oil drilling (barrels)
  return products.filter((product) => product.name !== mainProduct.name)[0];
}
