import Grid from '@mui/material/Grid';
import React from 'react';
import { deserializeState, standardProfiles } from './common/state/state';
import { ProfilesProvider } from './common/state/state-provider';
import { Content } from './layout/content';
import { Footer } from './layout/footer';
import { Header } from './layout/header';

export const App: React.FC = () => {
  const loadedState = React.useMemo(() => {
    const loaded = localStorage.getItem(`appState`);
    if (!loaded) {
      return standardProfiles;
    }
    return deserializeState(loaded);
  }, []);

  return (
    <ProfilesProvider initialState={loadedState}>
      <Grid container justifyContent="stretch" direction="column">
        <Grid item>
          <Header />
        </Grid>
        <Grid item flexGrow={1}>
          <Content />
        </Grid>
        <Grid item>
          <Footer />
        </Grid>
      </Grid>
    </ProfilesProvider>
  );
};

export default App;
