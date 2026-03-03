import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiSearch, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import toast from 'react-hot-toast';

const SearchBar = styled.div`
  position: relative;
  margin: 20px 0;
  
  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }

  input {
    width: 100%;
    height: 56px;
    background-color: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0 20px 0 45px;
    color: var(--text);
    font-size: 16px;

    &:focus {
      border-color: var(--primary);
    }
  }
`;

const ArticleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const ArticleItem = styled(Card)`
  display: flex;
  gap: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .thumb {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h4 {
    margin: 5px 0;
    font-size: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.3;
  }
`;

const ListagemArtigos = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [artigos, setArtigos] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    const { documentos: listaFavs } = useColecao(usuario ? `favoritos/${usuario.uid}/itens` : null);
    const isFavorito = (id) => listaFavs.some(f => f.id === id);

    const toggleFavorito = async (e, artigo) => {
        e.stopPropagation();
        if (!usuario) return;
        const docRef = doc(db, `favoritos/${usuario.uid}/itens`, artigo.id);
        if (isFavorito(artigo.id)) {
            await deleteDoc(docRef);
            toast.success('Removido dos favoritos');
        } else {
            const data = {
                id: artigo.id,
                tipo: 'artigo',
                titulo: artigo.titulo,
                image: artigo.image,
                path: `/artigo/${artigo.id}`,
                subtitulo: artigo.categoria,
                criadoEm: new Date().toISOString()
            };
            await setDoc(docRef, data);
            toast.success('Artigo favoritado! ❤️');
        }
    };

    useEffect(() => {
        const fetchArtigos = async () => {
            try {
                const q = query(collection(db, 'artigos'), orderBy('criadoEm', 'desc'));
                const snap = await getDocs(q);
                setArtigos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (error) {
                console.error("Erro ao carregar artigos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtigos();
    }, []);

    const artigosFiltrados = artigos.filter(art =>
        art.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        art.categoria?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <AppShell>
            <Container>
                <Flex $justify="flex-start" $align="center" $gap="15px" style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/home')} style={{ color: 'var(--text)', display: 'flex' }}>
                        <FiArrowLeft size={24} />
                    </button>
                    <Typography.H1 style={{ margin: 0 }}>Dicas e Artigos</Typography.H1>
                </Flex>

                <SearchBar>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Buscar por título ou categoria..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </SearchBar>

                {loading ? (
                    <Typography.Body>Carregando artigos...</Typography.Body>
                ) : artigosFiltrados.length === 0 ? (
                    <Typography.Body style={{ opacity: 0.6, textAlign: 'center', marginTop: '40px' }}>
                        Nenhum artigo encontrado.
                    </Typography.Body>
                ) : (
                    <ArticleGrid>
                        {artigosFiltrados.map(artigo => (
                            <ArticleItem key={artigo.id} onClick={() => navigate(`/artigo/${artigo.id}`)}>
                                <div className="thumb" style={{ backgroundImage: `url(${artigo.image})` }} />
                                <div className="content">
                                    <Typography.Small style={{ color: 'var(--primary)', fontWeight: '700' }}>{artigo.categoria}</Typography.Small>
                                    <h4>{artigo.titulo}</h4>
                                    <Typography.Small>{artigo.tempoLeitura}</Typography.Small>
                                </div>
                                <button
                                    onClick={(e) => toggleFavorito(e, artigo)}
                                    style={{ background: 'none', border: 'none', color: isFavorito(artigo.id) ? '#FF4B4B' : 'var(--muted)', alignSelf: 'center' }}
                                >
                                    <FiHeart fill={isFavorito(artigo.id) ? '#FF4B4B' : 'none'} size={20} />
                                </button>
                            </ArticleItem>
                        ))}
                    </ArticleGrid>
                )}
            </Container>
        </AppShell>
    );
};

export default ListagemArtigos;
