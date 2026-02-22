import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContexto.jsx";
import { AjustesProvider, useAjustes } from "./contexts/AjustesContexto.jsx";

import { ThemeProvider } from "styled-components";

import { GlobalStyle } from "./styles/GlobalStyle.js";
import { tema } from "./styles/tema.js";



const Main = () => {
  const { ajustes } = useAjustes();
  return (
    <>
      <GlobalStyle $primaryColor={ajustes?.corPrincipal} />
      <App />
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={tema}>
        <AuthProvider>
          <AjustesProvider>
            <Main />
          </AjustesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);

