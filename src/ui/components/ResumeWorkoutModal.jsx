import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContexto';
import { Card, Typography, Flex, BotaoPrimario } from './BaseUI';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.create(Card))`
  width: 100%;
  max-width: 400px;
  padding: 30px;
  text-align: center;
  border: 1px solid var(--primary);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
`;

const IconCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
`;

const ResumeWorkoutModal = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [activeWorkout, setActiveWorkout] = useState(null);

    useEffect(() => {
        if (usuario) {
            const saved = localStorage.getItem(`active_workout_${usuario.uid}`);
            if (saved) {
                try {
                    setActiveWorkout(JSON.parse(saved));
                } catch (e) {
                    console.error("Erro ao ler treino ativo:", e);
                }
            }
        }
    }, [usuario]);

    const handleResume = () => {
        if (activeWorkout) {
            navigate(`/workouts/execucao/${activeWorkout.id}`);
            setActiveWorkout(null);
        }
    };

    const handleDiscard = () => {
        if (usuario && activeWorkout) {
            localStorage.removeItem(`active_workout_${usuario.uid}`);
            localStorage.removeItem(`workout_session_${activeWorkout.id}_${usuario.uid}`);
            setActiveWorkout(null);
        }
    };

    return (
        <AnimatePresence>
            {activeWorkout && (
                <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <ModalContent
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <IconCircle>
                            <FiPlay />
                        </IconCircle>
                        <Typography.H2 style={{ marginBottom: '10px' }}>Retomar Treino?</Typography.H2>
                        <Typography.Body style={{ marginBottom: '25px', opacity: 0.8 }}>
                            Você possui um treino em andamento:<br />
                            <strong>{activeWorkout.nome}</strong>
                        </Typography.Body>

                        <Flex $flexDir="column" $gap="12px">
                            <BotaoPrimario onClick={handleResume} style={{ width: '100%' }}>
                                Continuar Treino
                            </BotaoPrimario>
                            <button
                                onClick={handleDiscard}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--muted)',
                                    fontSize: '14px',
                                    padding: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <FiX size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                Não, finalizar sem salvar
                            </button>
                        </Flex>
                    </ModalContent>
                </ModalOverlay>
            )}
        </AnimatePresence>
    );
};

export default ResumeWorkoutModal;
