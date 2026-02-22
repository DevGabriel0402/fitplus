import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/useAuth";

export default function AppShell() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) {
      return;
    }
  }, [usuario]);

  async function handleSair() {
    await sair();
    navigate("/login");
  }

  return (
    <Shell>
      <Topo>
        <Marca to="/">Ficha de Treino</Marca>

        <Nav>
          <Item to="/" end>
            Biblioteca
          </Item>
          <Item to="/cadastro">Cadastrar</Item>
        </Nav>

        <Acoes>
          <Chip title={usuario?.uid}>{usuario ? "Conectado" : "—"}</Chip>
          <BotaoGhost type="button" onClick={handleSair}>
            Sair
          </BotaoGhost>
        </Acoes>
      </Topo>

      <Conteudo>
        <Outlet />
      </Conteudo>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
`;

const Topo = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(246, 248, 255, 0.75);
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Marca = styled(Link)`
  font-weight: 900;
  letter-spacing: -0.02em;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.raio.md};
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
`;

const Nav = styled.nav`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
`;

const Item = styled(NavLink)`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.raio.md};
  border: 1px solid transparent;
  color: ${({ theme }) => theme.cores.textoSuave};

  &.active {
    color: ${({ theme }) => theme.cores.azul};
    border-color: ${({ theme }) => theme.cores.azulSuave};
    background: ${({ theme }) => theme.cores.azulSuave};
    font-weight: 700;
  }

  &:hover {
    border-color: ${({ theme }) => theme.cores.borda};
    background: ${({ theme }) => theme.cores.superficie};
  }
`;

const Acoes = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Chip = styled.div`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  color: ${({ theme }) => theme.cores.textoSuave};
`;

const BotaoGhost = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.raio.md};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.superficie};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.cores.azulSuave};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.cores.azulSuave};
  }
`;

const Conteudo = styled.main`
  padding: 18px 16px;
  max-width: 1040px;
  margin: 0 auto;
`;
