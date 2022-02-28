import ClearIcon from '@mui/icons-material/Clear';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Recipe } from '../../data/recipes';
import {
  Action,
  CraftingRecipeMap,
  ItemMap,
  Item,
  ActionType,
} from '../common/state/state';
import { getRecipeOrThrow } from '../common/state/state-getters';
import { PriceDisplay } from './price-display';
import { RecipeAutocomplete } from './recipe.autocomplete';

interface ProductProps {
  dispatch: React.Dispatch<Action>;
  products: ItemMap;
  recipes: CraftingRecipeMap;
  data: Recipe[];
}
export const Product: React.FC<ProductProps> = ({
  dispatch,
  products,
  recipes,
  data,
}) => {
  return (
    <Stack>
      <RecipeAutocomplete
        dispatch={dispatch}
        selectedRecipes={recipes}
        data={data}
      />
      {Array.from(products.values()).map((product) => (
        <ProductRow
          key={product.name}
          dispatch={dispatch}
          recipes={recipes}
          product={product}
        />
      ))}
    </Stack>
  );
};
interface ProductRowProps {
  dispatch: React.Dispatch<Action>;
  product: Item;
  recipes: CraftingRecipeMap;
}

const ProductRow: React.FC<ProductRowProps> = ({
  dispatch,
  recipes,
  product,
}) => {
  const itemRecipes = Array.from(product.productOfRecipes)
    .map((recipeName) => getRecipeOrThrow(recipes, recipeName))
    .filter((recipe) => {
      return recipe.mainProduct.name === product.name;
    });

  return (
    <>
      <div>
        <IconButton
          onClick={() => {
            itemRecipes.forEach((recipe) => {
              dispatch({
                type: ActionType.REMOVE_RECIPE,
                removedRecipe: recipe,
              });
            });
          }}
        >
          <ClearIcon />
        </IconButton>
        <Typography component="span">{product.displayName}</Typography>
        <Typography sx={{ float: 'right', paddingRight: 2 }} component="span">
          <PriceDisplay price={product.price} />
        </Typography>
      </div>
      {itemRecipes.length > 1 &&
        itemRecipes.map((recipe) => (
          <Box key={recipe.name} sx={{ paddingLeft: 3 }}>
            <IconButton
              size="small"
              onClick={() => {
                dispatch({
                  type: ActionType.REMOVE_RECIPE,
                  removedRecipe: recipe,
                });
              }}
            >
              <ClearIcon />
            </IconButton>
            <Typography component="span">{recipe.name}</Typography>
            <Typography
              sx={{ float: 'right', paddingRight: 2 }}
              component="span"
            >
              <PriceDisplay price={recipe.price} />
            </Typography>
          </Box>
        ))}
    </>
  );
};
