import ClearIcon from '@mui/icons-material/Clear';
import {
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Action,
  CraftingRecipeMap,
  ItemMap,
  ActionType,
} from '../common/state';
import { getRecipeOrThrow } from '../common/state-getters';
import { RecipeAutocomplete } from './recipe.autocomplete';

interface ProductProps {
  dispatch: React.Dispatch<Action>;
  products: ItemMap;
  recipes: CraftingRecipeMap;
}
export const Product: React.FC<ProductProps> = ({
  dispatch,
  products,
  recipes,
}) => {
  return (
    <Grid container>
      <Grid item xs={12} sx={{ paddingBottom: 2 }}>
        <RecipeAutocomplete dispatch={dispatch} />
      </Grid>
      {Array.from(products.values()).map((product) => (
        <Grid item xs={12} key={product.name}>
          <IconButton
            onClick={() => {
              product.productOfRecipes.forEach((recipeName) => {
                const recipe = getRecipeOrThrow(recipes, recipeName);
                dispatch({
                  type: ActionType.REMOVE_RECIPE,
                  removedRecipe: recipe,
                });
              });
            }}
          >
            <ClearIcon />
          </IconButton>
          <Typography component="span">{product.name}</Typography>
          <Typography sx={{ float: 'right', paddingRight: 2 }} component="span">
            {product.price}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};
