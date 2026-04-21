import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { Rotas } from './app/Rotas';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Rotas />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: theme.colors.surface,
            color: theme.colors.textMain,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border}`,
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
