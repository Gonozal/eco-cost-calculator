import ClearIcon from '@mui/icons-material/Clear';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Recipe } from '../../data/recipes';
import {
  Action,
  CraftingRecipeMap,
  ItemMap,
  Item,
  ActionType,
  CraftingRecipe,
} from '../common/state/state';
import { getRecipeOrThrow } from '../common/state/state-getters';
import { PriceDisplay } from './price-display';
import { RecipeAutocomplete } from './recipe.autocomplete';
import SettingsIcon from '@mui/icons-material/Settings';
import React from 'react';
import { FlexItem } from '../common/flex-grid-item';
import { NumberInput } from '../common/number-input';

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
          <RecipeSettings
            dispatch={dispatch}
            product={product}
            recipes={itemRecipes}
          />
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
              <RecipeSettings
                dispatch={dispatch}
                product={product}
                recipes={[recipe]}
              />
            </Typography>
          </Box>
        ))}
    </>
  );
};

interface RecipeSettingsProps {
  dispatch: React.Dispatch<Action>;
  product: Item;
  recipes: CraftingRecipe[];
}
const RecipeSettings: React.FC<RecipeSettingsProps> = ({
  dispatch,
  recipes,
}) => {
  const primaryRecipe: CraftingRecipe | undefined = recipes[0];

  const [batchSize, setBatchSize] = React.useState(
    primaryRecipe?.batchSize || 0,
  );
  const [margin, setMargin] = React.useState(
    (primaryRecipe?.margin || 0) * 100,
  );
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);

  const isOriginal = React.useMemo(
    () => batchSize === 0 && margin === 0,
    [batchSize, margin],
  );
  if (recipes.length > 1) return <IconButton sx={{ width: 34 }} />;

  return (
    <>
      <IconButton size="small" onClick={() => setIsDialogVisible(true)}>
        <SettingsIcon color={isOriginal ? undefined : 'primary'} />
      </IconButton>
      <Dialog open={isDialogVisible} onClose={() => setIsDialogVisible(false)}>
        <DialogTitle>Configure Recipe: {primaryRecipe.name}</DialogTitle>
        <DialogContent>
          <Stack>
            <FlexItem>
              <Typography component="span">Profit Margin</Typography>
              <NumberInput
                value={margin}
                onChange={(event) => {
                  const parsed = parseFloat(event.target.value);
                  setMargin(isNaN(parsed) ? margin : parsed);
                }}
                sx={{ width: 140, paddingLeft: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </FlexItem>
            <FlexItem>
              <Typography component="span">Batch Size</Typography>
              <NumberInput
                value={batchSize}
                onChange={(event) => {
                  const parsed = parseInt(event.target.value, 10);
                  setBatchSize(isNaN(parsed) ? batchSize : parsed);
                }}
                sx={{ width: 140, paddingLeft: 4 }}
              />
            </FlexItem>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDialogVisible(false);
              setBatchSize(primaryRecipe?.batchSize || 0);
              setMargin(primaryRecipe?.margin || 0);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch({
                type: ActionType.UPDATE_RECIPE_SETTINGS,
                updatedRecipe: {
                  name: primaryRecipe.name,
                  batchSize,
                  margin: margin / 100,
                },
              });
              setIsDialogVisible(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
