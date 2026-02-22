import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiStar, FiFilter } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField } from '../../ui/components/BaseUI';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';

const TabsWrapper = styled.div`
  display: flex;
  background-color: var(--surface);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 25px;
  border: 1px solid var(--border);
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? 'var(--card)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--muted)')};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
`;


const FavoriteCard = styled(Card)`
  display: flex;
  gap: 15px;
  padding: 10px;
  margin-bottom: 15px;
  position: relative;
`;

const Thumbnail = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-color: var(--surface);
`;

const StarIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--primary);
  font-size: 20px;
`;

const Favoritos = () => {
    const [tabAtiva, setTabAtiva] = useState('All');
    const { usuario } = useAuth();
    const { documentos: favoritos, carregando } = useColecao(`favoritos/${usuario?.uid}/itens`);

    const tabs = ['All', 'Video', 'Article'];

    // Mock data para o MVP
    const favoritosExemplo = [
        { id: '1', tipo: 'Video', titulo: 'Full Body HIIT', duration: '20 min', kcal: '300 kcal', thumb: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' },
        { id: '2', tipo: 'Article', titulo: 'Dieta Flexível: O Guia', duration: '5 min read', kcal: '', thumb: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300' },
    ];

    const listaExibicao = favoritos.length > 0 ? favoritos : favoritosExemplo;
    const listaFiltrada = listaExibicao.filter(f => tabAtiva === 'All' || f.tipo === tabAtiva);

    return (
        <AppShell>
            <Container>
                <Typography.H1 style={{ marginTop: '20px' }}>Meus Favoritos</Typography.H1>

                <TabsWrapper style={{ marginTop: '20px' }}>
                    {tabs.map(tab => (
                        <Tab
                            key={tab}
                            $active={tabAtiva === tab}
                            onClick={() => setTabAtiva(tab)}
                        >
                            {tab}
                        </Tab>
                    ))}
                </TabsWrapper>


                {carregando && favoritos.length === 0 ? (
                    <Typography.Body>Carregando favoritos...</Typography.Body>
                ) : (
                    listaFiltrada.map(fav => (
                        <FavoriteCard key={fav.id}>
                            <Thumbnail style={{ backgroundImage: `url(${fav.thumb || fav.thumbnailUrl})` }} />
                            <div style={{ flex: 1, paddingTop: '5px' }}>
                                <Typography.Small style={{ color: 'var(--primary)' }}>{fav.tipo.toUpperCase()}</Typography.Small>
                                <h4 style={{ fontSize: '16px', margin: '4px 0' }}>{fav.titulo}</h4>
                                <Typography.Small>{fav.duration} {fav.kcal && `• ${fav.kcal}`}</Typography.Small>
                            </div>
                            <StarIcon><FiStar fill="var(--primary)" /></StarIcon>
                        </FavoriteCard>
                    ))
                )}

                {listaFiltrada.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <Typography.Body>Nenhum favorito nesta categoria.</Typography.Body>
                    </div>
                )}
            </Container>
        </AppShell>
    );
};

export default Favoritos;
