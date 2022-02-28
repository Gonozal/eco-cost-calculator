import Grid from '@mui/material/Grid';
import React from 'react';
import { Content } from './layout/content';
import { Footer } from './layout/footer';
import { Header } from './layout/header';

export const App: React.FC = () => {
  return (
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
  );
};

export default App;
