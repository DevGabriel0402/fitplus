import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiClock, FiActivity, FiStar } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { treinosSugeridos } from '../../data/sugestoes';
import { db } from '../../firebase/firestore';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import toast from 'react-hot-toast';

const DetailsHeader = styled.div`
  width: 100%;
  height: 250px;
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

const Tag = styled.span`
  background-color: ${({ $color }) => $color || 'var(--primary)'};
  color: #000;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
`;

const ExerciseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: var(--card);
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
`;

const ExerciseThumb = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-image: url("${({ $url }) => $url}");
`;

import { useColecao } from '../../hooks/useColecao';

const DetalhesTreino = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const [treino, setTreino] = useState(null);
    const [loading, setLoading] = useState(true);
    const { documentos: biblioteca } = useColecao('exercicios');
    const { documentos: listaFavs } = useColecao(`favoritos/${usuario?.uid}/itens`);

    useEffect(() => {
        const fetchTreino = async () => {
            // Primeiro busca nas sugestões estáticas
            const sugerido = treinosSugeridos.find(t => t.id === id);
            if (sugerido) {
                // Tenta mapear os exercícios sugeridos com a biblioteca real
                const exerciciosMapeados = sugerido.exercicios.map(exSugerido => {
                    const exReal = biblioteca.find(e =>
                        e.nome?.toLowerCase().trim() === exSugerido.nome?.toLowerCase().trim()
                    );
                    return {
                        ...exSugerido,
                        gifUrl: exReal?.gifUrl || exSugerido.gifUrl || '',
                        alvo: exReal?.alvo || exSugerido.alvo || ''
                    };
                });

                setTreino({ ...sugerido, exercicios: exerciciosMapeados });
                setLoading(false);
                return;
            }

            // Se não for sugestão, busca no Firestore
            try {
                const docRef = doc(db, `treinos/${usuario.uid}/lista`, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTreino(docSnap.data());
                }
            } catch (error) {
                console.error("Erro ao buscar treino:", error);
            } finally {
                setLoading(false);
            }
        };

        if (usuario && (biblioteca.length > 0 || !id.startsWith('sug-'))) {
            fetchTreino();
        }
    }, [id, usuario, biblioteca]);

    if (loading && id.startsWith('sug-') && biblioteca.length === 0) {
        return <Container><Typography.Body>Sincronizando biblioteca...</Typography.Body></Container>;
    }

    if (loading) return <Container><Typography.Body>Carregando...</Typography.Body></Container>;
    if (!treino) return <Container><Typography.Body>Treino não encontrado.</Typography.Body></Container>;

    return (
        <AppShell hideTabbar>
            {/* ... (rest of the component) */}
            <DetailsHeader style={{ backgroundImage: `url("${treino.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'}")` }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ position: 'absolute', top: '30px', left: '20px', zIndex: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <FiArrowLeft size={24} />
                </button>

                <button
                    onClick={async () => {
                        const docRef = doc(db, `favoritos/${usuario.uid}/itens`, id);
                        if (listaFavs.some(f => f.id === id)) {
                            await deleteDoc(docRef);
                            toast.success('Removido dos favoritos');
                        } else {
                            await setDoc(docRef, {
                                id, tipo: 'treino', titulo: treino.nomeTreino, image: treino.image,
                                path: `/detalhes-treino/${id}`, subtitulo: `${treino.nivel} • ${treino.duracao}`,
                                favoritadoEm: new Date().toISOString()
                            });
                            toast.success('Favoritado!');
                        }
                    }}
                    style={{
                        position: 'absolute', top: '30px', right: '20px', zIndex: 10,
                        color: listaFavs.some(f => f.id === id) ? 'var(--primary)' : 'white',
                        backgroundColor: 'rgba(0,0,0,0.3)', width: '40px', height: '40px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <FiStar size={24} fill={listaFavs.some(f => f.id === id) ? 'var(--primary)' : 'none'} />
                </button>
            </DetailsHeader>

            <Container style={{ marginTop: '-40px', position: 'relative', zIndex: 5 }}>
                <Tag $color={treino.tagColor}>{treino.tag || 'TREINO'}</Tag>
                <Typography.H1 style={{ marginTop: '15px' }}>{treino.nomeTreino}</Typography.H1>

                <Flex $gap="20px" style={{ margin: '15px 0 30px' }}>
                    <Flex $gap="6px">
                        <FiClock color="var(--primary)" />
                        <Typography.Small style={{ fontWeight: '700' }}>{treino.duracao || '45 min'}</Typography.Small>
                    </Flex>
                    <Flex $gap="6px">
                        <FiActivity color="var(--primary)" />
                        <Typography.Small style={{ fontWeight: '700' }}>{treino.exercicios?.length || 0} Exercícios</Typography.Small>
                    </Flex>
                </Flex>

                <Typography.H2 style={{ marginBottom: '15px' }}>Exercícios</Typography.H2>

                {treino.exercicios?.map((ex, idx) => (
                    <ExerciseItem key={idx}>
                        <ExerciseThumb $url={ex.gifUrl || 'https://via.placeholder.com/150'} />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{ex.nome}</h4>
                            <Typography.Small>{ex.series} séries • {ex.reps} repetições</Typography.Small>
                        </div>
                    </ExerciseItem>
                ))}

                <BotaoPrimario
                    style={{ marginTop: '30px', position: 'sticky', bottom: '20px' }}
                    onClick={() => navigate(`/workouts/execucao/${id}`)}
                >
                    Começar Treino <FiPlay />
                </BotaoPrimario>
            </Container>
        </AppShell>
    );
};

export default DetalhesTreino;
