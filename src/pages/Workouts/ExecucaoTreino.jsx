import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiCheckCircle, FiClock, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import toast from 'react-hot-toast';


const ProgressCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 8px solid var(--surface);
  border-top-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  margin: 20px auto;
`;

const ExerciseStage = styled(Card)`
  margin-top: 30px;
  padding: 30px;
  text-align: center;
`;

const SetCounter = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
`;

const SetBadge = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ $completed }) => ($completed ? 'var(--primary)' : 'var(--surface)')};
  color: ${({ $completed }) => ($completed ? '#000' : 'var(--text)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 1px solid var(--border);
`;

const ExecucaoTreino = () => {
    const { usuario } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [treino, setTreino] = useState(null);
    const [loading, setLoading] = useState(true);
    const [indexExercicio, setIndexExercicio] = useState(0);
    const [setsCompletos, setSetsCompletos] = useState([]);
    const [segundos, setSegundos] = useState(0);

    useEffect(() => {
        const fetchTreino = async () => {
            try {
                const docRef = doc(db, `treinos/${usuario.uid}/lista`, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTreino(docSnap.data());
                }
            } catch (error) {
                console.error("Erro ao carregar treino:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTreino();
    }, [id, usuario.uid]);

    useEffect(() => {
        const timer = setInterval(() => setSegundos(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleSet = (setIdx) => {
        const key = `${indexExercicio}-${setIdx}`;
        if (setsCompletos.includes(key)) {
            setSetsCompletos(setsCompletos.filter(k => k !== key));
        } else {
            setSetsCompletos([...setsCompletos, key]);
        }
    };

    if (loading) return <Container><Typography.Body>Carregando treino...</Typography.Body></Container>;
    if (!treino) return <Container><Typography.Body>Treino não encontrado.</Typography.Body></Container>;

    const exAtual = treino.exercicios[indexExercicio];
    const totalExercicios = treino.exercicios.length;

    // Calcula o total de séries no treino todo para o progresso geral
    const totalSetsTreino = treino.exercicios.reduce((acc, ex) => acc + Number(ex.series || 0), 0);
    const setsRealizados = setsCompletos.length;
    const progressoGeral = totalSetsTreino > 0 ? Math.round((setsRealizados / totalSetsTreino) * 100) : 0;

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/workouts')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0, fontSize: '18px' }}>{treino.nomeTreino}</Typography.H2>
                    <Flex $gap="5px">
                        <FiClock size={16} color="var(--primary)" />
                        <span style={{ fontWeight: '700' }}>{formatTime(segundos)}</span>
                    </Flex>
                </Flex>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--surface)', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressoGeral}%` }}
                            style={{ height: '100%', backgroundColor: 'var(--primary)' }}
                        />
                    </div>
                    <Typography.Small style={{ fontWeight: '700', color: 'var(--primary)' }}>
                        PROGRESSO: {progressoGeral}%
                    </Typography.Small>
                </div>

                <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--surface)' }}>
                    <img
                        src={exAtual.gifUrl || 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif'}
                        alt={exAtual.nome}
                        style={{ width: '100%', display: 'block' }}
                    />
                </div>

                <ExerciseStage style={{ marginTop: '20px' }}>
                    <Typography.Small style={{ color: 'var(--primary)', letterSpacing: '2px', fontWeight: '800' }}>
                        EXERCÍCIO {indexExercicio + 1} DE {totalExercicios}
                    </Typography.Small>
                    <Typography.H1 style={{ marginTop: '10px', fontSize: '28px' }}>{exAtual.nome}</Typography.H1>
                    <Typography.Body>{exAtual.reps} Repetições • {exAtual.peso || '0'} kg</Typography.Body>

                    <SetCounter>
                        {[...Array(Number(exAtual.series || 3))].map((_, i) => (
                            <SetBadge
                                key={i}
                                $completed={setsCompletos.includes(`${indexExercicio}-${i}`)}
                                onClick={() => toggleSet(i)}
                            >
                                {i + 1}
                            </SetBadge>
                        ))}
                    </SetCounter>
                </ExerciseStage>


                <Flex $justify="space-between" style={{ marginTop: '40px' }}>
                    <BotaoPrimario
                        style={{ width: '45%', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
                        disabled={indexExercicio === 0}
                        onClick={() => setIndexExercicio(i => i - 1)}
                    >
                        Anterior
                    </BotaoPrimario>
                    <BotaoPrimario
                        style={{ width: '45%' }}
                        onClick={() => {
                            if (indexExercicio < totalExercicios - 1) {
                                setIndexExercicio(i => i + 1);
                            } else {
                                toast.success('Treino finalizado! Ótimo trabalho.');
                                navigate('/home');
                            }
                        }}
                    >
                        {indexExercicio === totalExercicios - 1 ? 'Finalizar' : 'Próximo'}
                    </BotaoPrimario>
                </Flex>
            </Container>
        </AppShell>
    );
};

export default ExecucaoTreino;

