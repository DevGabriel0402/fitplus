import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContexto';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled(motion.h1)`
  font-size: 42px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 2px;
`;

const Splash = () => {
    const navigate = useNavigate();
    const { usuario, perfilCompelto } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (usuario) {
                if (perfilCompelto) {
                    navigate('/home');
                } else {
                    navigate('/setup');
                }
            } else {
                // Se for a primeira vez, Onboarding, senão Login
                // Para o MVP sempre mandamos pro Onboarding se não logado
                navigate('/onboarding');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [usuario, perfilCompelto, navigate]);

    return (
        <Container>
            <LogoText
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                PERSONALPLUS
            </LogoText>
        </Container>
    );
};

export default Splash;
