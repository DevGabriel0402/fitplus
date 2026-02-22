import React from 'react';
import { Toaster } from 'react-hot-toast';
import { tema } from './styles/tema';
import { Rotas } from './app/Rotas';

function App() {
  return (
    <>
      <Rotas />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: tema.colors.surface,
            color: tema.colors.text,
            borderRadius: tema.radius.medium,
            border: `1px solid ${tema.colors.border}`,
          },
        }}
      />
    </>
  );
}

export default App;
