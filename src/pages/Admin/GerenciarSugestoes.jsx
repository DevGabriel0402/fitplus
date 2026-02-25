import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

const SuggestionCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 12px;
`;

const SuggestionThumb = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--surface);
`;

const Tag = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const GerenciarSugestoes = () => {
    const navigate = useNavigate();
    const [sugestoes, setSugestoes] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const fetchSugestoes = async () => {
        try {
            const q = query(collection(db, 'treinos_sugeridos'), orderBy('criadoEm', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSugestoes(data);
        } catch (error) {
            console.error("Erro ao carregar sugestões:", error);
            toast.error("Erro ao carregar sugestões.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        fetchSugestoes();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Excluir este treino sugerido?")) return;
        try {
            await deleteDoc(doc(db, 'treinos_sugeridos', id));
            setSugestoes(sugestoes.filter(s => s.id !== id));
            toast.success("Excluído com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir.");
        }
    };

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/perfil')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Gerenciar Sugestões</Typography.H2>
                    <button onClick={() => navigate('/admin/sugestoes/nova')} style={{ color: 'var(--primary)' }}>
                        <FiPlus size={24} />
                    </button>
                </Flex>

                {carregando ? (
                    <Typography.Body>Carregando...</Typography.Body>
                ) : sugestoes.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.Body>Nenhuma sugestão cadastrada no banco.</Typography.Body>
                        <BotaoPrimario onClick={() => navigate('/admin/sugestoes/nova')} style={{ marginTop: '20px' }}>
                            Criar Primeira Sugestão
                        </BotaoPrimario>
                    </Card>
                ) : (
                    sugestoes.map(treino => (
                        <SuggestionCard key={treino.id}>
                            <SuggestionThumb style={{ backgroundImage: `url(${treino.image})` }} />
                            <div style={{ flex: 1 }}>
                                <Flex $gap="8px" style={{ marginBottom: '4px' }}>
                                    <Tag style={{ backgroundColor: treino.tagColor || 'var(--secondary)', color: '#000' }}>
                                        {treino.tag || 'GERAL'}
                                    </Tag>
                                    <Typography.Small>{treino.nivel} • {treino.duracao}</Typography.Small>
                                </Flex>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{treino.nomeTreino}</h4>
                            </div>
                            <Flex $gap="10px">
                                <button onClick={() => navigate(`/admin/sugestoes/editar/${treino.id}`)} style={{ color: 'var(--muted)' }}>
                                    <FiEdit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(treino.id)} style={{ color: '#ff5f5f' }}>
                                    <FiTrash2 size={18} />
                                </button>
                            </Flex>
                        </SuggestionCard>
                    ))
                )}
            </Container>
        </AppShell>
    );
};

export default GerenciarSugestoes;
