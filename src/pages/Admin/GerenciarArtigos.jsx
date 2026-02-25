import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

const ArticleCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 12px;
`;

const ArticleThumb = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--surface);
`;

const CategoryTag = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  background-color: var(--primary);
  color: #000;
`;

const GerenciarArtigos = () => {
    const navigate = useNavigate();
    const [artigos, setArtigos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const fetchArtigos = async () => {
        try {
            const q = query(collection(db, 'artigos'), orderBy('criadoEm', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setArtigos(data);
        } catch (error) {
            console.error("Erro ao carregar artigos:", error);
            toast.error("Erro ao carregar artigos.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        fetchArtigos();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Excluir este artigo?")) return;
        try {
            await deleteDoc(doc(db, 'artigos', id));
            setArtigos(artigos.filter(a => a.id !== id));
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
                    <Typography.H2 style={{ margin: 0 }}>Gerenciar Artigos</Typography.H2>
                    <button onClick={() => navigate('/admin/artigos/novo')} style={{ color: 'var(--primary)' }}>
                        <FiPlus size={24} />
                    </button>
                </Flex>

                {carregando ? (
                    <Typography.Body>Carregando...</Typography.Body>
                ) : artigos.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.Body>Nenhum artigo cadastrado.</Typography.Body>
                        <BotaoPrimario onClick={() => navigate('/admin/artigos/novo')} style={{ marginTop: '20px' }}>
                            Criar Primeiro Artigo
                        </BotaoPrimario>
                    </Card>
                ) : (
                    artigos.map(artigo => (
                        <ArticleCard key={artigo.id}>
                            <ArticleThumb style={{ backgroundImage: `url(${artigo.image})` }} />
                            <div style={{ flex: 1 }}>
                                <Flex $gap="8px" style={{ marginBottom: '4px' }}>
                                    <CategoryTag>
                                        {artigo.categoria}
                                    </CategoryTag>
                                    <Typography.Small>{artigo.tempoLeitura}</Typography.Small>
                                </Flex>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>{artigo.titulo}</h4>
                            </div>
                            <Flex $gap="10px">
                                <button onClick={() => navigate(`/admin/artigos/editar/${artigo.id}`)} style={{ color: 'var(--muted)' }}>
                                    <FiEdit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(artigo.id)} style={{ color: '#ff5f5f' }}>
                                    <FiTrash2 size={18} />
                                </button>
                            </Flex>
                        </ArticleCard>
                    ))
                )}
            </Container>
        </AppShell>
    );
};

export default GerenciarArtigos;
