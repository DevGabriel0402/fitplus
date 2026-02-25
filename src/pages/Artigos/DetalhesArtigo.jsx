import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiHeart, FiShare2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import toast from 'react-hot-toast';

const ArticleHeader = styled.div`
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
  border-radius: 0 0 30px 30px;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, var(--bg) 10%, transparent 100%);
  }
`;

const ContentBody = styled.div`
  line-height: 1.7;
  font-size: 16px;
  color: var(--text);
  white-space: pre-wrap;
  
  p { margin-bottom: 20px; }
  h2 { margin-top: 30px; margin-bottom: 15px; font-size: 22px; color: var(--primary); }
  h3 { margin-top: 25px; margin-bottom: 15px; font-size: 18px; color: var(--text); }
  ul, ol { margin-left: 20px; margin-bottom: 20px; }
  li { margin-bottom: 10px; }
`;

const Tag = styled.span`
  background-color: var(--primary);
  color: #000;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
`;

const DetalhesArtigo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [artigo, setArtigo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { documentos: listaFavs } = useColecao(`favoritos/${usuario?.uid}/itens`);

    useEffect(() => {
        const fetchArtigo = async () => {
            try {
                const docRef = doc(db, 'artigos', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setArtigo({ ...docSnap.data(), id: docSnap.id });
                }
            } catch (error) {
                console.error("Erro ao buscar artigo:", error);
                toast.error("Erro ao carregar o artigo.");
            } finally {
                setLoading(false);
            }
        };

        if (usuario && id) {
            fetchArtigo();
        }
    }, [id, usuario]);

    const isFavorito = listaFavs.some(f => f.id === id);

    const toggleFavorito = async () => {
        if (!usuario || !artigo) return;
        const docRef = doc(db, `favoritos/${usuario.uid}/itens`, id);

        if (isFavorito) {
            await deleteDoc(docRef);
            toast.success('Removido dos favoritos');
        } else {
            const data = {
                id,
                tipo: 'artigo',
                titulo: artigo.titulo,
                image: artigo.image,
                path: `/artigo/${id}`,
                categoria: artigo.categoria,
                subtitulo: artigo.categoria,
                criadoEm: new Date().toISOString()
            };
            await setDoc(docRef, data);
            toast.success('Adicionado aos favoritos!');
        }
    };

    if (loading) return <Container><Typography.Body>Carregando artigo...</Typography.Body></Container>;
    if (!artigo) return <Container><Typography.Body>Artigo não encontrado.</Typography.Body></Container>;

    return (
        <AppShell hideTabbar>
            <ArticleHeader style={{ backgroundImage: `url("${artigo.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'}")` }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ position: 'absolute', top: '30px', left: '20px', zIndex: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <FiArrowLeft size={24} />
                </button>

                <Flex $gap="10px" style={{ position: 'absolute', top: '30px', right: '20px', zIndex: 10 }}>
                    <button
                        onClick={toggleFavorito}
                        style={{
                            color: isFavorito ? '#FF4B4B' : 'white',
                            backgroundColor: 'rgba(0,0,0,0.3)', width: '40px', height: '40px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <FiHeart size={24} fill={isFavorito ? '#FF4B4B' : 'none'} />
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: artigo.titulo,
                                    text: 'Confira este artigo no FitPlus!',
                                    url: window.location.href
                                });
                            } else {
                                toast.error('Compartilhamento não suportado neste navegador.');
                            }
                        }}
                        style={{
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.3)', width: '40px', height: '40px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <FiShare2 size={22} />
                    </button>
                </Flex>
            </ArticleHeader>

            <Container style={{ marginTop: '-40px', position: 'relative', zIndex: 5, paddingBottom: '50px' }}>
                <Tag>{artigo.categoria || 'DICA'}</Tag>
                <Typography.H1 style={{ marginTop: '15px', lineHeight: '1.2' }}>{artigo.titulo}</Typography.H1>

                <Flex $gap="20px" style={{ margin: '15px 0 30px', opacity: 0.7 }}>
                    <Flex $gap="6px">
                        <FiClock color="var(--primary)" size={16} />
                        <Typography.Small style={{ fontWeight: '700' }}>{artigo.tempoLeitura || '5 min de leitura'}</Typography.Small>
                    </Flex>
                </Flex>

                <ContentBody>
                    {artigo.conteudo}
                </ContentBody>
            </Container>
        </AppShell>
    );
};

export default DetalhesArtigo;
