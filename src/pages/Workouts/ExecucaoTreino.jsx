import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import { treinosSugeridos } from '../../data/sugestoes';
import toast from 'react-hot-toast';

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
    const { usuario, dadosUsuario } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [treino, setTreino] = useState(null);
    const [loading, setLoading] = useState(true);
    const [indexExercicio, setIndexExercicio] = useState(0);
    const [setsCompletos, setSetsCompletos] = useState([]);
    const [segundos, setSegundos] = useState(0);
    const [inicioTimestamp, setInicioTimestamp] = useState(null);
    const { documentos: biblioteca } = useColecao('exercicios');

    // Carregar treino
    useEffect(() => {
        const fetchTreino = async () => {
            // Tenta buscar no Firestore de sugestões primeiro
            let foundTreino = null;
            try {
                const sugRef = doc(db, 'treinos_sugeridos', id);
                const sugSnap = await getDoc(sugRef);
                if (sugSnap.exists()) {
                    foundTreino = { ...sugSnap.data(), id: sugSnap.id };
                }
            } catch (e) { }

            // Se não encontrou, tenta na lista estática
            if (!foundTreino) {
                foundTreino = treinosSugeridos.find(t => t.id === id);
            }

            if (foundTreino) {
                const exerciciosMapeados = (foundTreino.exercicios || []).map(exSugerido => {
                    const exReal = biblioteca.find(e =>
                        e.nome?.toLowerCase().trim() === exSugerido.nome?.toLowerCase().trim()
                    );
                    return {
                        ...exSugerido,
                        gifUrl: exReal?.gifUrl || exSugerido.gifUrl || '',
                        alvo: exReal?.alvo || exSugerido.alvo || ''
                    };
                });
                setTreino({ ...foundTreino, exercicios: exerciciosMapeados });
                setLoading(false);
                return;
            }

            // Se ainda não encontrou, busca nos treinos do usuário
            try {
                const docRef = doc(db, `treinos/${usuario.uid}/lista`, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTreino({ ...docSnap.data(), id: docSnap.id });
                }
            } catch (error) {
                console.error("Erro ao carregar treino:", error);
            } finally {
                setLoading(false);
            }
        };

        if (usuario && (biblioteca.length > 0 || !id?.startsWith('sug-'))) {
            fetchTreino();
        }
    }, [id, usuario, biblioteca]);

    // Persistência & Timer
    useEffect(() => {
        if (!loading && treino && !inicioTimestamp) {
            const key = `workout_session_${id}_${usuario.uid}`;
            const saved = localStorage.getItem(key);
            let startTime = Date.now();

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setIndexExercicio(parsed.index || 0);
                    setSetsCompletos(parsed.sets || []);
                    startTime = parsed.startTime || Date.now();
                } catch (e) { }
            }

            setInicioTimestamp(startTime);
            setSegundos(Math.floor((Date.now() - startTime) / 1000));
        }
    }, [loading, treino, id, usuario, inicioTimestamp]);

    useEffect(() => {
        let interval;
        if (inicioTimestamp) {
            interval = setInterval(() => {
                setSegundos(Math.floor((Date.now() - inicioTimestamp) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [inicioTimestamp]);

    useEffect(() => {
        if (treino && !loading && inicioTimestamp) {
            const session = { index: indexExercicio, sets: setsCompletos, startTime: inicioTimestamp };
            localStorage.setItem(`workout_session_${id}_${usuario.uid}`, JSON.stringify(session));

            // Chave global para detecção de retomada
            localStorage.setItem(`active_workout_${usuario.uid}`, JSON.stringify({
                id,
                nome: treino.nomeTreino
            }));
        }
    }, [indexExercicio, setsCompletos, inicioTimestamp, id, usuario, treino, loading]);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleSet = (setIdx) => {
        const key = `${indexExercicio}-${setIdx}`;
        setSetsCompletos(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(5);
    const [comentario, setComentario] = useState('');
    const [enviandoFeedback, setEnviandoFeedback] = useState(false);

    const finalizarTreino = async () => {
        if (!treino || !treino.exercicios) return;

        // Se for admin, finaliza sem feedback (opcional)
        if (dadosUsuario?.role?.toLowerCase() === 'admin') {
            await salvarTreinoNoHistorico();
            return;
        }

        setShowFeedback(true);
    };

    const salvarTreinoNoHistorico = async (feedbackData = null) => {
        try {
            // 1. Salvar no histórico
            await addDoc(collection(db, `treinos_historico/${usuario.uid}/lista`), {
                treinoId: id,
                nomeTreino: treino.nomeTreino,
                data: new Date().toISOString(),
                duracaoSegundos: segundos,
                setsCompletosTotal: setsCompletos.length,
                totalSetsPrevistos: treino.exercicios.reduce((acc, ex) => acc + Number(ex.series || 0), 0),
                resumo: treino.exercicios.map((ex, idx) => ({
                    nome: ex.nome,
                    setsTotais: Number(ex.series || 0),
                    setsFeitos: setsCompletos.filter(s => s.startsWith(`${idx}-`)).length
                }))
            });

            // 2. Salvar feedback se houver
            if (feedbackData) {
                await addDoc(collection(db, 'feedbacks'), {
                    ...feedbackData,
                    usuarioId: usuario.uid,
                    usuarioNome: dadosUsuario?.nome || 'Aluno',
                    treinoId: id,
                    treinoNome: treino.nomeTreino,
                    data: new Date().toISOString()
                });
            }

            localStorage.removeItem(`workout_session_${id}_${usuario.uid}`);
            localStorage.removeItem(`active_workout_${usuario.uid}`);
            toast.success('Treino finalizado!');
            navigate('/progresso');
        } catch (error) {
            console.error("Erro ao finalizar:", error);
            toast.error("Erro ao salvar treino.");
        }
    };

    const handleEnviarFeedback = async () => {
        setEnviandoFeedback(true);
        await salvarTreinoNoHistorico({ nota: rating, comentario });
        setEnviandoFeedback(false);
        setShowFeedback(false);
    };

    if (loading) return <Container><Typography.Body>Carregando...</Typography.Body></Container>;
    if (!treino || !treino.exercicios || treino.exercicios.length === 0) return <Container><Typography.Body>Treino inválido ou vazio.</Typography.Body></Container>;

    const exAtual = treino.exercicios[indexExercicio];
    if (!exAtual) {
        // Fallback if index is out of bounds
        if (indexExercicio >= treino.exercicios.length) setIndexExercicio(0);
        return <Container><Typography.Body>Exercício não encontrado.</Typography.Body></Container>;
    }

    const totalSetsTreino = treino.exercicios.reduce((acc, ex) => acc + Number(ex.series || 0), 0);
    const progressoGeral = totalSetsTreino > 0 ? Math.round((setsCompletos.length / totalSetsTreino) * 100) : 0;

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
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressoGeral}%` }} style={{ height: '100%', backgroundColor: 'var(--primary)' }} />
                    </div>
                    <Typography.Small style={{ fontWeight: '700', color: 'var(--primary)' }}>PROGRESSO: {progressoGeral}%</Typography.Small>
                </div>

                <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', border: '2px solid var(--surface)' }}>
                    <img src={exAtual.gifUrl || 'https://via.placeholder.com/400x400/1e1e1e/white?text=GIF+Indisponível'} alt={exAtual.nome} style={{ width: '100%', display: 'block' }} />
                </div>

                <ExerciseStage>
                    <Typography.Small style={{ color: 'var(--primary)', letterSpacing: '2px', fontWeight: '800' }}>EXERCÍCIO {indexExercicio + 1} DE {treino.exercicios.length}</Typography.Small>
                    <Typography.H1 style={{ marginTop: '10px', fontSize: '28px' }}>{exAtual.nome}</Typography.H1>
                    <Typography.Body>{exAtual.reps} Repetições • {exAtual.peso || '0'} kg</Typography.Body>
                    <SetCounter>
                        {[...Array(Number(exAtual.series || 3))].map((_, i) => (
                            <SetBadge key={i} $completed={setsCompletos.includes(`${indexExercicio}-${i}`)} onClick={() => toggleSet(i)}>{i + 1}</SetBadge>
                        ))}
                    </SetCounter>
                </ExerciseStage>

                <Flex $justify="space-between" style={{ marginTop: '40px' }}>
                    <BotaoPrimario style={{ width: '45%', backgroundColor: 'var(--surface)', color: 'var(--text)' }} disabled={indexExercicio === 0} onClick={() => setIndexExercicio(i => i - 1)}>Anterior</BotaoPrimario>
                    <BotaoPrimario style={{ width: '45%' }} onClick={() => indexExercicio < treino.exercicios.length - 1 ? setIndexExercicio(i => i + 1) : finalizarTreino()}>
                        {indexExercicio === treino.exercicios.length - 1 ? 'Finalizar' : 'Próximo'}
                    </BotaoPrimario>
                </Flex>

                <AnimatePresence>
                    {showFeedback && (
                        <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ModalContent initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }}>
                                <Typography.H2>Treino Concluído! 🎉</Typography.H2>
                                <Typography.Body style={{ marginBottom: '20px' }}>Como foi o treino de hoje?</Typography.Body>

                                <Flex $justify="center" $gap="10px" style={{ marginBottom: '20px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <Star key={num} $active={num <= rating} onClick={() => setRating(num)}>★</Star>
                                    ))}
                                </Flex>

                                <textarea
                                    placeholder="Deixe um comentário para o instrutor..."
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    style={{
                                        width: '100%', height: '100px', borderRadius: '12px',
                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                        color: 'var(--text)', padding: '12px', marginBottom: '20px',
                                        fontFamily: 'inherit', resize: 'none'
                                    }}
                                />

                                <BotaoPrimario onClick={handleEnviarFeedback} disabled={enviandoFeedback} style={{ width: '100%' }}>
                                    {enviandoFeedback ? 'Enviando...' : 'Enviar Feedback'}
                                </BotaoPrimario>
                            </ModalContent>
                        </ModalOverlay>
                    )}
                </AnimatePresence>
            </Container>
        </AppShell>
    );
};

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); z-index: 3000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
`;

const ModalContent = styled(motion.create(Card))`
  width: 100%; max-width: 400px; padding: 30px; text-align: center;
`;

const Star = styled.span`
  font-size: 32px; cursor: pointer;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  transition: transform 0.1s;
  &:hover { transform: scale(1.2); }
`;

export default ExecucaoTreino;
