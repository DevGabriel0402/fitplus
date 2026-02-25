import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiTrash2, FiStar, FiUser, FiClock } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FeedbackCard = styled(Card)`
  padding: 20px;
  margin-bottom: 15px;
  position: relative;
`;

const RatingStars = styled.div`
  color: #FFD700;
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
`;

const GerenciarFeedbacks = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const q = query(collection(db, 'feedbacks'), orderBy('data', 'desc'));
            const snap = await getDocs(q);
            setFeedbacks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Erro ao carregar feedbacks:", error);
            toast.error("Erro ao carregar feedbacks.");
        } finally {
            setCarregando(false);
        }
    };

    const deletarFeedback = async (id) => {
        if (!window.confirm("Deseja deletar este feedback?")) return;
        try {
            await deleteDoc(doc(db, 'feedbacks', id));
            setFeedbacks(feedbacks.filter(f => f.id !== id));
            toast.success("Feedback removido.");
        } catch (error) {
            toast.error("Erro ao deletar.");
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/admin')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Feedbacks dos Alunos</Typography.H2>
                    <div style={{ width: 24 }} />
                </Flex>

                {carregando ? (
                    <Typography.Body>Carregando avaliações...</Typography.Body>
                ) : feedbacks.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.Body>Nenhuma avaliação recebida ainda.</Typography.Body>
                    </Card>
                ) : (
                    feedbacks.map(fb => (
                        <FeedbackCard key={fb.id}>
                            <Flex $justify="space-between" $align="flex-start">
                                <div>
                                    <RatingStars>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < fb.nota ? '★' : '☆'}</span>
                                        ))}
                                    </RatingStars>
                                    <Typography.Body style={{ fontWeight: '700', marginBottom: '5px' }}>
                                        {fb.treinoNome}
                                    </Typography.Body>
                                    <Typography.Small style={{ display: 'block', marginBottom: '10px', opacity: 0.8 }}>
                                        "{fb.comentario || 'Sem comentário.'}"
                                    </Typography.Small>

                                    <Flex $gap="15px">
                                        <Typography.Small style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FiUser size={12} /> {fb.usuarioNome}
                                        </Typography.Small>
                                        <Typography.Small style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <FiClock size={12} /> {new Date(fb.data).toLocaleDateString('pt-BR')}
                                        </Typography.Small>
                                    </Flex>
                                </div>
                                <button onClick={() => deletarFeedback(fb.id)} style={{ color: '#ff5f5f', opacity: 0.6 }}>
                                    <FiTrash2 size={18} />
                                </button>
                            </Flex>
                        </FeedbackCard>
                    ))
                )}
            </Container>
        </AppShell>
    );
};

export default GerenciarFeedbacks;
