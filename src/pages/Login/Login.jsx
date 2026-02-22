import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/useAuth";

export default function Login() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const { entrarAnonimo } = useAuth();

  async function handleEntrar() {
    try {
      setCarregando(true);
      setErro("");
      await entrarAnonimo();
      navigate("/");
    } catch (err) {
      setErro(err?.message || "Erro ao autenticar");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Tela>
      <Cartao>
        <Topo>
          <Logo>FT</Logo>
          <div>
            <Titulo>Ficha de Treino</Titulo>
            <Subtitulo>Login rápido e pronto. Depois você decide se quer Google/Email.</Subtitulo>
          </div>
        </Topo>

        <BotaoPrimario onClick={handleEntrar} disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar anonimamente"}
        </BotaoPrimario>

        {erro && <Erro>{erro}</Erro>}

        <Rodape>
          <span>UI clean • azul • PWA ready</span>
        </Rodape>
      </Cartao>
    </Tela>
  );
}

const Tela = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 18px;
`;

const Cartao = styled.section`
  width: 100%;
  max-width: 460px;
  background: ${({ theme }) => theme.cores.superficie};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raio.lg};
  padding: 18px;
  box-shadow: ${({ theme }) => theme.sombra.card};
`;

const Topo = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: white;
  background: ${({ theme }) => theme.cores.azul};
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25);
`;

const Titulo = styled.h1`
  margin: 0;
  letter-spacing: -0.03em;
  font-size: 22px;
`;

const Subtitulo = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.cores.textoSuave};
  font-size: 13px;
`;

const BotaoPrimario = styled.button`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.raio.md};
  border: 1px solid ${({ theme }) => theme.cores.azul};
  background: ${({ theme }) => theme.cores.azul};
  color: white;
  font-weight: 900;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.cores.azulHover}; }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Erro = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.raio.md};
  background: rgba(239, 68, 68, 0.10);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: ${({ theme }) => theme.cores.perigo};
  font-size: 13px;
`;

const Rodape = styled.div`
  margin-top: 14px;
  font-size: 12px;
  color: ${({ theme }) => theme.cores.textoSuave};
  opacity: 0.9;
`;
