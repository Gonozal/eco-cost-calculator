import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import { recipes } from '../../data/recipes';
import { Action, ActionType, CraftingRecipeMap } from '../common/state/state';
import { Recipe } from '../../data/recipes';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import styled from 'styled-components';

const StyledListItem = styled.li`
  background-color: rgba(255, 255, 255, 0.05);
`;

interface RecipeAutocompleteProps {
  dispatch: React.Dispatch<Action>;
  selectedRecipes: CraftingRecipeMap;
}
export const RecipeAutocomplete: React.FC<RecipeAutocompleteProps> = ({
  dispatch,
  selectedRecipes,
}) => {
  return (
    <Autocomplete
      multiple
      options={recipes as Recipe[]}
      sx={{ paddingLeft: 4, paddingRight: 4, paddingBottom: 2 }}
      value={Array.from(selectedRecipes.values())}
      onChange={(_, values) => {
        if (!values) return;
        values.forEach((value) => {
          if (selectedRecipes.has(value.name)) return;
          dispatch({
            type: ActionType.ADD_RECIPE,
            addedRecipe: {
              ...value,
              price: 0,
              highlighted: false,
            },
          });
        });
      }}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField {...params} label="Select a crafting recipe" />
      )}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      renderTags={() => null}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

        return (
          <StyledListItem {...props}>
            <div>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{
                    fontWeight: part.highlight ? 900 : 400,
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          </StyledListItem>
        );
      }}
    />
  );
};
