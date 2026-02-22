import styled from "styled-components";

export const Container = styled.div`
  h2 {
    margin: 0 0 12px;
    letter-spacing: -0.02em;
  }
`;

export const Filtro = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 0 16px;

  label {
    font-size: 13px;
    color: ${({ theme }) => theme.cores.textoSuave};
  }

  select {
    border: 1px solid ${({ theme }) => theme.cores.borda};
    background: ${({ theme }) => theme.cores.superficie};
    color: ${({ theme }) => theme.cores.texto};
    padding: 10px 12px;
    border-radius: ${({ theme }) => theme.raio.md};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.cores.azul};
      box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.azulSuave};
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio.lg};
  padding: 12px;
  background: ${({ theme }) => theme.cores.superficie};
  box-shadow: ${({ theme }) => theme.sombra.card};

  .topo {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;

    strong {
      letter-spacing: -0.01em;
    }

    span {
      color: ${({ theme }) => theme.cores.textoSuave};
      font-size: 12px;
      background: ${({ theme }) => theme.cores.azulSuave};
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid ${({ theme }) => theme.cores.azulSuave};
    }
  }

  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.raio.lg};
    border: 1px solid ${({ theme }) => theme.cores.borda};
    background: ${({ theme }) => theme.cores.fundo};
  }

  .semGif {
    width: 100%;
    padding: 24px;
    border-radius: ${({ theme }) => theme.raio.lg};
    border: 1px dashed ${({ theme }) => theme.cores.borda};
    color: ${({ theme }) => theme.cores.textoSuave};
    text-align: center;
  }

  .info {
    margin-top: 10px;
    p {
      margin: 6px 0;
      font-size: 14px;
      color: ${({ theme }) => theme.cores.textoSuave};
    }
    b { color: ${({ theme }) => theme.cores.texto}; }
  }
`;

// Reaproveita pro cadastro:
export const Linha = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 10px 0;

  @media (max-width: 680px) { grid-template-columns: 1fr; }
`;

export const Label = styled.label`
  display: block;
  margin: 10px 0 6px;
  color: ${({ theme }) => theme.cores.textoSuave};
  font-size: 13px;
`;

export const Input = styled.input`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  color: ${({ theme }) => theme.cores.texto};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.raio.md};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.cores.azul};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.azulSuave};
  }
`;

export const Select = styled.select`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  color: ${({ theme }) => theme.cores.texto};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.raio.md};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.cores.azul};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.azulSuave};
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  color: ${({ theme }) => theme.cores.texto};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.raio.md};
  outline: none;
  resize: vertical;

  &:focus {
    border-color: ${({ theme }) => theme.cores.azul};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.azulSuave};
  }
`;

export const Botao = styled.button`
  margin-top: 14px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.cores.azul};
  background: ${({ theme }) => theme.cores.azul};
  color: white;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.raio.md};
  cursor: pointer;
  font-weight: 900;

  &:hover { background: ${({ theme }) => theme.cores.azulHover}; }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;