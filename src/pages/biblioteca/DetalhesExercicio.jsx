import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';

const DetailCard = styled(Card)`
  padding: 25px;
  margin-top: 20px;
`;

const GifContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  
  img {
    width: 100%;
    display: block;
  }
`;

const InfoRow = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 12px;
    color: var(--primary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 18px;
    color: var(--text);
  }
`;

const DetalhesExercicio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercicio, setExercicio] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const fetchExercicio = async () => {
            try {
                const docRef = doc(db, 'exercicios', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setExercicio({ id: docSnap.id, ...docSnap.data() });
                } else {
                    // Fallback para os exercícios de exemplo se o banco estiver vazio
                    const exemplos = [
                        { id: '1', nome: 'Supino Reto', categoria: 'Peito', alvo: 'Peitoral Maior', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
                        { id: '2', nome: 'Agachamento', categoria: 'Quadríceps', alvo: 'Quadríceps', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
                    ];
                    const ex = exemplos.find(e => e.id === id);
                    if (ex) setExercicio(ex);
                }
            } catch (error) {
                console.error("Erro ao buscar exercício:", error);
            } finally {
                setCarregando(false);
            }
        };

        fetchExercicio();
    }, [id]);

    if (carregando) return <div style={{ color: 'white', padding: '20px' }}>Carregando detalhes...</div>;
    if (!exercicio) return <div style={{ color: 'white', padding: '20px' }}>Exercício não encontrado.</div>;

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="flex-start" $gap="15px" style={{ marginTop: '20px' }}>
                    <button onClick={() => navigate(-1)}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Detalhes do Exercício</Typography.H2>
                </Flex>

                <DetailCard>
                    <Typography.H1 style={{ fontSize: '32px', marginBottom: '10px' }}>{exercicio.nome}</Typography.H1>

                    <GifContainer>
                        <img src={exercicio.gifUrl || 'https://via.placeholder.com/400x400/1e1e1e/white?text=Sem+GIF'} alt={exercicio.nome} />
                    </GifContainer>

                    <Flex $gap="40px" style={{ marginTop: '20px' }}>
                        <InfoRow>
                            <label>Categoria</label>
                            <p>{exercicio.categoria}</p>
                        </InfoRow>

                        <InfoRow>
                            <label>Músculo Alvo</label>
                            <p>{exercicio.alvo || 'N/A'}</p>
                        </InfoRow>
                    </Flex>

                    {exercicio.dicas && (
                        <InfoRow>
                            <label>Dicas de Execução</label>
                            <p style={{ fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{exercicio.dicas}</p>
                        </InfoRow>
                    )}
                </DetailCard>
            </Container>
        </AppShell>
    );
};

export default DetalhesExercicio;
