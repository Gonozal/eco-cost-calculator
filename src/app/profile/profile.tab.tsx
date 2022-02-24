import { Grid, Paper } from '@mui/material';
import { Section } from '../layout/section';
import { Product } from '../products/products.index';

import { SkillSegment } from '../skills/skill-element';

interface ProfileTabProps {
  profile: string;
  activeProfile: string;
}

export const ProfileTab: React.FC<ProfileTabProps> = (props) => {
  const { activeProfile, profile, children, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={activeProfile !== profile}
      id={`profile-tabpanel-${profile}`}
      aria-labelledby={`profile-tab-${profile}`}
      style={{ height: '100%' }}
      {...other}
    >
      {activeProfile === profile && (
        <Grid
          container
          spacing={1}
          justifyContent="stretch"
          sx={{ padding: 2, height: '100%' }}
        >
          <Grid item xs={4}>
            <Section heading="Skills and Crafting Stations">
              <SkillSegment />
            </Section>
          </Grid>
          <Grid item xs={3}>
            <Section heading="Inputs">2</Section>
          </Grid>
          <Grid item xs={5}>
            <Section heading="Products">
              <Product />
            </Section>
          </Grid>
        </Grid>
      )}
    </div>
  );
};
