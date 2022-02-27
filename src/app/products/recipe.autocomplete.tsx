import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import recipes from '../../data/recipes.json';
import { Action, ActionType } from '../common/state';
import { Recipe } from '../../data/recipes';

interface RecipeAutocompleteProps {
  dispatch: React.Dispatch<Action>;
}
export const RecipeAutocomplete: React.FC<RecipeAutocompleteProps> = ({
  dispatch,
}) => {
  const [key, setKey] = React.useState(Math.random());

  return (
    <Autocomplete
      key={key}
      disablePortal
      options={recipes as Recipe[]}
      sx={{ paddingLeft: 4, paddingRight: 4 }}
      value={null}
      onChange={(_, value) => {
        if (!value) return;
        dispatch({
          type: ActionType.ADD_RECIPE,
          addedRecipe: {
            ...value,
            price: 0,
            highlighted: false,
            updateId: Math.random(),
          },
        });
        setKey(Math.random());
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField {...params} label="Select a crafting recipe" />
      )}
    />
  );
};
