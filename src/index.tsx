import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app/app';
import reportWebVitals from './reportWebVitals';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme';
import { enableMapSet } from 'immer';

enableMapSet();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
