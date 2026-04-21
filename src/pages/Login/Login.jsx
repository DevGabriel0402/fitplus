import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContexto";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/C:/Users/gabri/.gemini/antigravity/brain/a7d2e88c-33eb-4f69-a392-db252bf06734/premium_fitness_app_login_background_1776808695776.png');
  background-size: cover;
  background-position: center;
  padding: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
    z-index: 1;
  }
`;

const Content = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 40px;
  z-index: 2;
  text-align: center;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--primary);
  border-radius: 24px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 900;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
`;

const WelcomeText = styled.div`
  margin-bottom: 40px;
  
  h1 {
    font-size: 32px;
    font-weight: 900;
    color: #fff;
    margin-bottom: 12px;
    letter-spacing: -1px;
  }
  
  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 18px;
  border-radius: 20px;
  background: var(--primary);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default function Login() {
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { entrarAnonimo } = useAuth();

  async function handleEntrar() {
    try {
      setCarregando(true);
      await entrarAnonimo();
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <PageWrapper>
      <Content
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <LogoIcon>FP</LogoIcon>
        
        <WelcomeText>
          <h1>FitPlus AI</h1>
          <p>Seu assistente pessoal de treino de alta performance.</p>
        </WelcomeText>

        <ActionButton onClick={handleEntrar} disabled={carregando}>
          {carregando ? "Iniciando..." : "Começar Agora"}
          <FiArrowRight size={22} />
        </ActionButton>

        <div style={{ marginTop: '30px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          By continuing, you agree to our terms of service.
        </div>
      </Content>
    </PageWrapper>
  );
}
