import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import styled from "styled-components";

export default function RotaProtegida({ children }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <Wrap>
        <Card>
          <Bolinha />
          <span>Carregando...</span>
        </Card>
      </Wrap>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px;
`;

const Card = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.raio.lg};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  box-shadow: ${({ theme }) => theme.sombra.card};
  color: ${({ theme }) => theme.cores.textoSuave};
`;

const Bolinha = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.cores.azul};
  box-shadow: 0 0 0 6px ${({ theme }) => theme.cores.azulSuave};
`;
