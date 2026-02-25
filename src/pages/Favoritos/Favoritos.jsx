import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card } from '../../ui/components/BaseUI';
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
    const [tabAtiva, setTabAtiva] = useState('Todos');
    const { usuario } = useAuth();
    const { documentos: favoritos, carregando } = useColecao(`favoritos/${usuario?.uid}/itens`);
    const navigate = useNavigate();

    const tabs = ['Todos', 'Treinos', 'Artigos'];

    const listaFiltrada = favoritos.filter(f => {
        if (tabAtiva === 'Todos') return true;
        if (tabAtiva === 'Treinos') return f.tipo === 'treino';
        if (tabAtiva === 'Artigos') return f.tipo === 'artigo';
        return true;
    });

    return (
        <AppShell style={{ paddingBottom: '80px' }}>
            <Container>
                <Typography.H1 style={{ marginTop: '20px' }}>Meus Favoritos</Typography.H1>
                <Typography.Body style={{ opacity: 0.7, marginBottom: '20px' }}>Sua coleção pessoal de conteúdos</Typography.Body>

                <TabsWrapper>
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


                {carregando ? (
                    <Typography.Body>Carregando favoritos...</Typography.Body>
                ) : listaFiltrada.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                        <FiStar size={40} color="var(--border)" style={{ marginBottom: '15px' }} />
                        <Typography.Body style={{ opacity: 0.6 }}>Nenhum favorito encontrado em <b>{tabAtiva}</b>.</Typography.Body>
                    </div>
                ) : (
                    listaFiltrada.map(fav => (
                        <FavoriteCard key={fav.id} onClick={() => navigate(fav.path)}>
                            <Thumbnail style={{ backgroundImage: `url(${fav.image || fav.thumb})` }} />
                            <div style={{ flex: 1, paddingTop: '5px' }}>
                                <Typography.Small style={{ color: fav.tipo === 'artigo' ? 'var(--primary)' : 'var(--secondary)', fontWeight: '800' }}>
                                    {fav.tipo.toUpperCase()}
                                </Typography.Small>
                                <h4 style={{ fontSize: '16px', margin: '4px 0' }}>{fav.titulo}</h4>
                                <Typography.Small style={{ opacity: 0.7 }}>
                                    {fav.subtitulo || fav.categoria} {fav.duracao && `• ${fav.duracao}`}
                                </Typography.Small>
                            </div>
                            <StarIcon><FiStar fill="var(--primary)" /></StarIcon>
                        </FavoriteCard>
                    ))
                )}
            </Container>
        </AppShell>
    );
};

export default Favoritos;
