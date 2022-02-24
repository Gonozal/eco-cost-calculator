import React from 'react';

import { Autocomplete, TextField } from '@mui/material';
import recipes from '../../data/recipes.json';

export const RecipeAutocomplete: React.FC = () => {
  const [key, setKey] = React.useState(Math.random());

  return (
    <Autocomplete
      key={key}
      disablePortal
      options={recipes}
      fullWidth
      sx={{ paddingLeft: 4, paddingRight: 4 }}
      value={null}
      onChange={() => setKey(Math.random())}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField {...params} label="Select a crafting recipe" />
      )}
    />
  );
};
