import { Grid } from '@mui/material';
import React from 'react';
import { Updater, useImmerReducer } from 'use-immer';
import { AppState, reducer } from '../common/state/state';
import { Ingredients } from '../ingredients/ingredients.index';
import { ProfileMap } from '../layout/content';
import { Section } from '../layout/section';
import { Product } from '../products/products.index';
import { SkillSegment } from '../skills/skill-element';
import { Settings } from './settings';

interface ProfileWrapperProps {
  loadedState: AppState;
  profiles: ProfileMap;
  setProfiles: Updater<ProfileMap | null>;
}
export const ProfileWrapper: React.FC<ProfileWrapperProps> = ({
  loadedState,
  profiles,
  setProfiles,
}) => {
  const [state, dispatch] = useImmerReducer(reducer, { ...loadedState });
  const [showProfile, setShowProfile] = React.useState(false);

  const key = Math.random();
  return (
    <Grid
      container
      spacing={1}
      columns={16}
      sx={{ padding: 2, height: '100%' }}
    >
      <Grid item xs={showProfile ? 3 : 1}>
        <Settings
          isVisible={showProfile}
          setIsVisible={setShowProfile}
          profiles={profiles}
          setProfiles={setProfiles}
          state={state}
          dispatch={dispatch}
        />
      </Grid>
      <Grid item xs={showProfile ? 4 : 5}>
        <Section heading="Skills and Crafting Stations">
          <SkillSegment
            dispatch={dispatch}
            craftingStations={state.craftingStations}
            professions={state.professions}
          />
        </Section>
      </Grid>
      <Grid item xs={showProfile ? 4 : 5}>
        <Section heading="Inputs">
          <Ingredients
            dispatch={dispatch}
            byproducts={state.byproducts}
            inputs={state.inputs}
          />
        </Section>
      </Grid>
      <Grid item xs={5}>
        <Section heading="Products">
          <Product
            key={key}
            dispatch={dispatch}
            products={state.products}
            recipes={state.recipes}
          />
        </Section>
      </Grid>
    </Grid>
  );
};
