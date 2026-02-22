import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPlay, FiClock, FiZap, FiEdit2 } from 'react-icons/fi';

import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const WorkoutCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  margin-bottom: 15px;
  border-left: 4px solid var(--primary);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--secondary);
    background-color: rgba(255, 255, 255, 0.03);
  }

  @media (min-width: 769px) { margin-bottom: 0; }
`;

const WorkoutIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background-color: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 20px;
  flex-shrink: 0;
`;

const Badge = styled.span`
  background-color: var(--border);
  color: var(--muted);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ShortcutCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px;
  color: var(--muted);
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary);
    color: var(--text);
  }
  
  svg { font-size: 28px; color: var(--primary); }
  span { font-weight: 700; font-size: 16px; }
`;

const Workouts = () => {
  const { usuario } = useAuth();
  const { documentos: treinos, carregando } = useColecao(`treinos/${usuario?.uid}/lista`);
  const navigate = useNavigate();

  return (
    <AppShell>
      <Container>
        <Flex $justify="space-between" style={{ marginBottom: '30px', marginTop: '20px' }}>
          <Typography.H1>Meus Treinos</Typography.H1>
          <button onClick={() => navigate('/workouts/novo')} style={{ color: 'var(--primary)', fontSize: '28px' }}>
            <FiPlus />
          </button>
        </Flex>


        {carregando ? (
          <Typography.Body>Carregando treinos...</Typography.Body>
        ) : !treinos || treinos.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', padding: '40px' }}>
            <div style={{ fontSize: '80px', color: 'var(--muted)', opacity: 0.3, marginBottom: '20px' }}>
              <FiZap />
            </div>
            <Typography.H2>Nenhum treino ainda</Typography.H2>

            <Typography.Body>Crie seu primeiro treino personalizado ou adicione da biblioteca.</Typography.Body>
            <BotaoPrimario
              onClick={() => navigate('/workouts/novo')}
              style={{ marginTop: '30px', maxWidth: '300px', margin: '30px auto 0' }}
            >
              Criar Treino
            </BotaoPrimario>
          </div>
        ) : (
          <WorkoutGrid>
            {treinos.map(treino => (
              <WorkoutCard
                key={treino.id}
                onClick={() => navigate(`/workouts/execucao/${treino.id}`)}
              >
                <WorkoutIcon><FiZap /></WorkoutIcon>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>{treino.nomeTreino}</h4>
                  <Flex $gap="0">
                    <Badge>{treino.exercicios?.length || 0} EXERCÍCIOS</Badge>
                    <Badge>~45 MIN</Badge>
                  </Flex>

                </div>
                <Flex $gap="15px">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/workouts/editar/${treino.id}`); }}
                    style={{ color: 'var(--muted)', fontSize: '20px' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/workouts/execucao/${treino.id}`); }}
                    style={{ color: 'var(--primary)', fontSize: '22px' }}
                  >
                    <FiPlay />
                  </button>
                </Flex>

              </WorkoutCard>
            ))}
          </WorkoutGrid>
        )}

        <Typography.H2 style={{ marginTop: '50px', marginBottom: '20px' }}>Atalhos Rápidos</Typography.H2>
        <Grid>
          <ShortcutCard onClick={() => navigate('/workouts/novo')}>
            <FiPlus />
            <span>Novo Treino</span>
          </ShortcutCard>
          <ShortcutCard onClick={() => navigate('/biblioteca')}>
            <FiZap />
            <span>Ver Biblioteca</span>
          </ShortcutCard>
        </Grid>
      </Container>
    </AppShell>
  );
};

export default Workouts;
