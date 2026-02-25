import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as IconsFa from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContexto';
import { useAjustes } from '../../contexts/AjustesContexto';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const IconWrapper = styled(motion.div)`
  font-size: 80px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(var(--primary-rgb), 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-top: 20px;
`;

const LogoText = styled(motion.h1)`
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 4px;
  text-transform: uppercase;
`;

const Splash = () => {
    const navigate = useNavigate();
    const { usuario, perfilCompleto } = useAuth();
    const { ajustes } = useAjustes();

    const SelectedIcon = (ajustes?.iconePainel && IconsFa[ajustes.iconePainel]) || IconsFa.FaDumbbell;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (usuario) {
                if (perfilCompleto) {
                    navigate('/home');
                } else {
                    navigate('/setup');
                }
            } else {
                navigate('/onboarding');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [usuario, perfilCompleto, navigate]);

    return (
        <Container>
            <IconWrapper
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <SelectedIcon />
            </IconWrapper>

            <LogoText
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                {ajustes?.nomePainel || 'PERSONALPLUS'}
            </LogoText>

            <Spinner />
        </Container>
    );
};

export default Splash;
