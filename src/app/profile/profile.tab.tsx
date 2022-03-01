import { Grid } from '@mui/material';
import React from 'react';
import { useActiveProfile, useProfiles } from '../common/state/state-provider';
import { Ingredients } from '../ingredients/ingredients.index';
import { Section } from '../layout/section';
import { Product } from '../products/products.index';
import { SkillSegment } from '../skills/skill-element';
import { Settings } from './settings';

export const ProfileTab: React.FC = () => {
  const { dispatch } = useProfiles();
  const activeProfile = useActiveProfile();
  const [showProfile, setShowProfile] = React.useState(false);

  if (!activeProfile) return null;
  return (
    <Grid
      container
      spacing={1}
      columns={16}
      sx={{ padding: 2, height: '100%' }}
    >
      <Grid item xs={showProfile ? 3 : 1}>
        <Settings isVisible={showProfile} setIsVisible={setShowProfile} />
      </Grid>
      <Grid item xs={showProfile ? 4 : 5}>
        <Section heading="Skills and Crafting Stations">
          <SkillSegment
            dispatch={dispatch}
            craftingStations={activeProfile.craftingStations}
            professions={activeProfile.professions}
          />
        </Section>
      </Grid>
      <Grid item xs={showProfile ? 4 : 5}>
        <Section heading="Inputs">
          <Ingredients
            dispatch={dispatch}
            byproducts={activeProfile.byproducts}
            inputs={activeProfile.inputs}
          />
        </Section>
      </Grid>
      <Grid item xs={5}>
        <Section heading="Products">
          <Product
            dispatch={dispatch}
            data={activeProfile.data}
            products={activeProfile.products}
            recipes={activeProfile.recipes}
          />
        </Section>
      </Grid>
    </Grid>
  );
};
