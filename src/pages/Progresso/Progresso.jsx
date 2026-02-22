import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { useUsuario } from '../../hooks/useUsuario';

const StatsCard = styled(Card)`
  background: linear-gradient(135deg, var(--surface) 0%, var(--card) 100%);
  margin-bottom: 25px;
`;

const TabsWrapper = styled.div`
  display: flex;
  background-color: var(--surface);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 25px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? 'var(--card)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--muted)')};
  font-weight: 600;
  font-size: 14px;
`;


const ChartContainer = styled(Card)`
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 20px;
`;

const Bar = styled.div`
  width: 30px;
  height: ${({ $height }) => $height}%;
  background-color: var(--primary);
  border-radius: 6px 6px 0 0;
  position: relative;

  &::after {
    content: '${({ $label }) => $label}';
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--muted);
  }
`;


const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--card);
  border-radius: 12px;
  margin-bottom: 10px;
`;

const Progresso = () => {
    const [tabAtiva, setTabAtiva] = useState('Log');
    const { dados } = useUsuario();

    const atividades = [
        { title: 'Treino de Pernas', kcal: '450 kcal', time: '55 min', date: 'Hoje' },
        { title: 'Corrida Matinal', kcal: '320 kcal', time: '30 min', date: 'Ontem' },
        { title: 'Yoga Recreativa', kcal: '120 kcal', time: '40 min', date: '20 Fev' },
    ];

    return (
        <AppShell>
            <Container>
                <Typography.H1 style={{ marginTop: '20px' }}>Meu Progresso</Typography.H1>

                <StatsCard style={{ marginTop: '20px' }}>
                    <Flex $justify="space-around">
                        <div style={{ textAlign: 'center' }}>
                            <Typography.Small>Peso Atual</Typography.Small>
                            <h3 style={{ fontSize: '24px', color: 'var(--primary)' }}>{dados?.peso || '--'} {dados?.unidadePeso || 'kg'}</h3>
                        </div>
                        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <Typography.Small>Meta</Typography.Small>
                            <h3 style={{ fontSize: '24px', color: 'var(--secondary)' }}>{dados?.objetivo === 'Perder Peso' ? '70' : '85'} {dados?.unidadePeso || 'kg'}</h3>
                        </div>
                    </Flex>
                </StatsCard>

                <TabsWrapper>
                    <Tab $active={tabAtiva === 'Log'} onClick={() => setTabAtiva('Log')}>Atividades</Tab>
                    <Tab $active={tabAtiva === 'Charts'} onClick={() => setTabAtiva('Charts')}>Gráficos</Tab>
                </TabsWrapper>


                {tabAtiva === 'Charts' ? (
                    <div>
                        <Typography.H2>Frequência Semanal</Typography.H2>
                        <ChartContainer>
                            <Bar $height={40} $label="S" />
                            <Bar $height={70} $label="T" />
                            <Bar $height={20} $label="Q" />
                            <Bar $height={90} $label="Q" />
                            <Bar $height={60} $label="S" />
                            <Bar $height={30} $label="S" />
                            <Bar $height={10} $label="D" />
                        </ChartContainer>
                        <Typography.Body style={{ marginTop: '30px' }}>Você treinou 4 vezes esta semana. Continue assim!</Typography.Body>
                    </div>
                ) : (
                    <div>
                        <Flex $justify="space-between" style={{ marginBottom: '15px' }}>
                            <Typography.H2>Recentes</Typography.H2>
                            <FiCalendar color="var(--primary)" />
                        </Flex>

                        {atividades.map((act, i) => (
                            <ActivityItem key={i}>
                                <div>
                                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{act.title}</h4>
                                    <Typography.Small>{act.date} • {act.time}</Typography.Small>
                                </div>
                                <div style={{ color: 'var(--secondary)', fontWeight: '700' }}>{act.kcal}</div>
                            </ActivityItem>
                        ))}
                    </div>
                )}
            </Container>
        </AppShell>
    );
};

export default Progresso;
