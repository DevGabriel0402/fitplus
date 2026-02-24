import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }

  :root {
    --bg: ${({ theme }) => theme.colors.bg};
    --surface: ${({ theme }) => theme.colors.surface};
    --card: ${({ theme }) => theme.colors.card};
    --primary: ${({ theme, $primaryColor }) => $primaryColor || theme.colors.primary};
    --primary-rgb: ${({ theme, $primaryColor }) => {
    const hex = $primaryColor || theme.colors.primary;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }};
    --secondary: ${({ theme }) => theme.colors.secondary};
    --text: ${({ theme }) => theme.colors.text};
    --muted: ${({ theme }) => theme.colors.muted};
    --border: ${({ theme }) => theme.colors.border};
    --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }



  body {
    background-color: var(--bg);
    color: var(--text);
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    background-color: var(--bg);
    position: relative;
  }


  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    transition: all 0.2s ease-in-out;

    &:active {
      transform: scale(0.98);
    }
  }

  input {
    outline: none;
    border: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
  }

  /* Safe Area Padding */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
`;
