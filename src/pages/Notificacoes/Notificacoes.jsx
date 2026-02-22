import React, { useState } from 'react';
import styled from 'styled-components';
import { FiBell, FiCheckCircle, FiInfo, FiZap } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';

const TabsWrapper = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
`;

const TabChip = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#000' : 'var(--muted)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'var(--border)')};
  font-weight: 600;
  font-size: 14px;
`;


const NotificationItem = styled.div`
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid var(--border);

  &:last-child { border-bottom: none; }
`;

const IconWrapper = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color || 'var(--primary)'};
  font-size: 20px;
  flex-shrink: 0;
`;


const DateHeader = styled.div`
  padding: 20px 0 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Notificacoes = () => {
    const [tabAtiva, setTabAtiva] = useState('Reminders');
    const { usuario } = useAuth();
    const { documentos: notificacoes, carregando } = useColecao(`notificacoes/${usuario?.uid}/itens`);

    // Mock data para o MVP
    const notificacoesExemplo = [
        { id: '1', tipo: 'Reminders', titulo: 'Hora do Treino!', msg: 'Seu treino de pernas está agendado para agora.', data: 'Today', icon: <FiZap />, color: 'var(--secondary)' },
        { id: '2', tipo: 'System', titulo: 'Novo Recorde!', msg: 'Você completou 5 treinos seguidos! Parabéns.', data: 'Today', icon: <FiCheckCircle />, color: 'var(--primary)' },
        { id: '3', tipo: 'System', titulo: 'Atualização de App', msg: 'Nova versão 1.0.4 disponível com correções.', data: 'Yesterday', icon: <FiInfo />, color: '#765df0' },
    ];

    const listaExibicao = notificacoes.length > 0 ? notificacoes : notificacoesExemplo;
    const listaFiltrada = listaExibicao.filter(n => n.tipo === tabAtiva);

    return (
        <AppShell>
            <Container>
                <Typography.H1 style={{ marginTop: '20px' }}>Notificações</Typography.H1>

                <TabsWrapper style={{ marginTop: '20px' }}>
                    <TabChip $active={tabAtiva === 'Reminders'} onClick={() => setTabAtiva('Reminders')}>Lembretes</TabChip>
                    <TabChip $active={tabAtiva === 'System'} onClick={() => setTabAtiva('System')}>Sistema</TabChip>
                </TabsWrapper>


                {carregando && notificacoes.length === 0 ? (
                    <Typography.Body>Carregando notificações...</Typography.Body>
                ) : listaFiltrada.length === 0 ? (
                    <Typography.Body>Nenhuma notificação encontrada.</Typography.Body>
                ) : (
                    <div>
                        <DateHeader>Hoje</DateHeader>
                        {listaFiltrada.filter(n => n.data === 'Today').map(item => (
                            <NotificationItem key={item.id}>
                                <IconWrapper color={item.color}>{item.icon}</IconWrapper>
                                <div>
                                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.titulo}</h4>
                                    <Typography.Small>{item.msg}</Typography.Small>
                                </div>
                            </NotificationItem>
                        ))}

                        <DateHeader>Ontem</DateHeader>
                        {listaFiltrada.filter(n => n.data === 'Yesterday').map(item => (
                            <NotificationItem key={item.id}>
                                <IconWrapper color={item.color}>{item.icon}</IconWrapper>
                                <div>
                                    <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.titulo}</h4>
                                    <Typography.Small>{item.msg}</Typography.Small>
                                </div>
                            </NotificationItem>
                        ))}
                    </div>
                )}
            </Container>
        </AppShell>
    );
};

export default Notificacoes;
