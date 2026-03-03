import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiSearch, FiStar } from 'react-icons/fi';
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

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const WorkoutCard = styled(Card)`
  padding: 0;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-5px);
  }

  .image {
    height: 180px;
    background-size: cover;
    background-position: center;
  }

  .content {
    padding: 15px;
  }

  .tag {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
  }

  h4 {
    margin-top: 8px;
    font-size: 18px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.3;
  }
`;

const ListagemTreinos = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [treinos, setTreinos] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);

    const { documentos: listaFavs } = useColecao(usuario ? `favoritos/${usuario.uid}/itens` : null);
    const isFavorito = (id) => listaFavs.some(f => f.id === id);

    const toggleFavorito = async (e, treino) => {
        e.stopPropagation();
        if (!usuario) return;
        const docRef = doc(db, `favoritos/${usuario.uid}/itens`, treino.id);
        if (isFavorito(treino.id)) {
            await deleteDoc(docRef);
            toast.success('Removido dos favoritos');
        } else {
            const data = {
                id: treino.id,
                tipo: 'treino',
                titulo: treino.nomeTreino,
                image: treino.image,
                path: `/detalhes-treino/${treino.id}`,
                subtitulo: `${treino.nivel} • ${treino.duracao}`,
                criadoEm: new Date().toISOString()
            };
            await setDoc(docRef, data);
            toast.success('Treino favoritado! ⭐');
        }
    };

    useEffect(() => {
        const fetchTreinos = async () => {
            try {
                const q = query(collection(db, 'treinos_sugeridos'), orderBy('criadoEm', 'desc'));
                const snap = await getDocs(q);
                setTreinos(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (error) {
                console.error("Erro ao carregar treinos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTreinos();
    }, []);

    const treinosFiltrados = treinos.filter(t =>
        t.nomeTreino?.toLowerCase().includes(busca.toLowerCase()) ||
        t.nivel?.toLowerCase().includes(busca.toLowerCase()) ||
        t.tag?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <AppShell>
            <Container>
                <Flex $justify="flex-start" $align="center" $gap="15px" style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate('/home')} style={{ color: 'var(--text)', display: 'flex' }}>
                        <FiArrowLeft size={24} />
                    </button>
                    <Typography.H1 style={{ margin: 0 }}>Treinos Sugeridos</Typography.H1>
                </Flex>

                <SearchBar>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nome, nível ou tag..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </SearchBar>

                {loading ? (
                    <Typography.Body>Carregando treinos...</Typography.Body>
                ) : treinosFiltrados.length === 0 ? (
                    <Typography.Body style={{ opacity: 0.6, textAlign: 'center', marginTop: '40px' }}>
                        Nenhum treino sugerido encontrado.
                    </Typography.Body>
                ) : (
                    <WorkoutGrid>
                        {treinosFiltrados.map(treino => (
                            <WorkoutCard key={treino.id} onClick={() => navigate(`/detalhes-treino/${treino.id}`)}>
                                <div className="image" style={{ backgroundImage: `url(${treino.image})` }}>
                                    <button
                                        onClick={(e) => toggleFavorito(e, treino)}
                                        style={{
                                            position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.4)',
                                            border: 'none', borderRadius: '50%', width: 32, height: 32,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFavorito(treino.id) ? '#FFD700' : 'white'
                                        }}
                                    >
                                        <FiStar fill={isFavorito(treino.id) ? '#FFD700' : 'none'} size={18} />
                                    </button>
                                </div>
                                <div className="tag" style={{ backgroundColor: treino.tagColor || 'var(--secondary)', color: '#000' }}>{treino.tag}</div>
                                <div className="content">
                                    <Typography.Small>{treino.nivel} • {treino.duracao}</Typography.Small>
                                    <h4>{treino.nomeTreino}</h4>
                                </div>
                            </WorkoutCard>
                        ))}
                    </WorkoutGrid>
                )}
            </Container>
        </AppShell>
    );
};

export default ListagemTreinos;
