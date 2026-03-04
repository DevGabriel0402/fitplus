import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiCheck, FiTrash2, FiUser, FiFileText } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../ui/components/ConfirmModal';

const SolicitacaoCard = styled(Card)`
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid var(--primary);
  opacity: ${props => props.$status === 'resolvido' ? 0.6 : 1};
  filter: ${props => props.$status === 'resolvido' ? 'grayscale(0.8)' : 'none'};
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  background-color: ${props => props.$bg || 'var(--surface)'};
  color: ${props => props.$color || 'var(--text)'};
`;

const IconButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.2s;
    background-color: ${props => props.$bg};
    color: ${props => props.$color};
    border: 1px solid ${props => props.$borderColor || 'transparent'};

    &:hover {
        opacity: 0.8;
    }
`;

const GerenciarSolicitacoes = () => {
    const navigate = useNavigate();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    const fetchSolicitacoes = async () => {
        try {
            const q = query(collection(db, 'solicitacoes'), orderBy('criadoEm', 'desc'));
            const snap = await getDocs(q);
            const items = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setSolicitacoes(items);
        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
            toast.error("Erro ao carregar pedidos.");
        } finally {
            setCarregando(false);
        }
    };

    const deletarItem = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Excluir Pedido',
            message: 'Tem certeza que deseja apagar este pedido de ficha do histórico?',
            isDestructive: true,
            confirmText: 'Excluir',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'solicitacoes', id));
                    setSolicitacoes(solicitacoes.filter(s => s.id !== id));
                    toast.success("Pedido removido.");
                } catch (error) {
                    toast.error("Erro ao remover.");
                }
            }
        });
    };

    const marcarResolvido = async (id) => {
        try {
            await updateDoc(doc(db, 'solicitacoes', id), {
                status: 'resolvido'
            });
            setSolicitacoes(solicitacoes.map(s => s.id === id ? { ...s, status: 'resolvido' } : s));
            toast.success("Marcado como resolvido.");
        } catch (error) {
            toast.error("Erro ao atualizar status.");
        }
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/admin')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Pedidos de Ficha</Typography.H2>
                    <div style={{ width: 24 }} />
                </Flex>

                {carregando ? (
                    <Typography.Body>Verificando pedidos...</Typography.Body>
                ) : solicitacoes.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.Body>Nenhuma solicitação de ficha pendente.</Typography.Body>
                    </Card>
                ) : (
                    solicitacoes.map(solic => {
                        const isResolvido = solic.status === 'resolvido';
                        return (
                            <SolicitacaoCard key={solic.id} $status={solic.status}>
                                <Flex $justify="space-between" $align="flex-start" style={{ marginBottom: '15px' }}>
                                    <div>
                                        <Typography.Body style={{ fontWeight: '700', fontSize: '16px', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiUser size={14} color="var(--primary)" /> {solic.nome}
                                        </Typography.Body>
                                        <Typography.Small style={{ opacity: 0.7 }}>
                                            {solic.email}
                                        </Typography.Small>
                                    </div>
                                    <Badge
                                        $bg={isResolvido ? '#4caf5022' : '#ff980022'}
                                        $color={isResolvido ? '#4caf50' : '#ff9800'}
                                    >
                                        <FiClock size={10} style={{ marginRight: '4px' }} />
                                        {isResolvido ? 'Resolvido' : 'Pendente'}
                                    </Badge>
                                </Flex>

                                <Flex $gap="10px" style={{ flexWrap: 'wrap' }}>
                                    {!isResolvido && (
                                        <>
                                            <IconButton
                                                $bg="var(--primary)" $color="#fff"
                                                onClick={() => navigate(`/admin/usuarios/${solic.userId}`)}
                                                style={{ flex: 1 }}
                                            >
                                                <FiFileText size={16} /> Atender Pedido
                                            </IconButton>
                                            <IconButton
                                                $bg="rgba(76, 175, 80, 0.1)" $color="#4caf50" $borderColor="#4caf5033"
                                                onClick={() => marcarResolvido(solic.id)}
                                            >
                                                <FiCheck size={16} /> Fechar
                                            </IconButton>
                                        </>
                                    )}
                                    <IconButton
                                        $bg="transparent" $color="#ff5f5f"
                                        onClick={() => deletarItem(solic.id)}
                                        style={{ marginLeft: isResolvido ? 'auto' : '0' }}
                                    >
                                        <FiTrash2 size={16} /> {isResolvido ? 'Excluir Histórico' : ''}
                                    </IconButton>
                                </Flex>
                            </SolicitacaoCard>
                        )
                    })
                )}

                <ConfirmModal
                    {...modalConfig}
                    onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
                />
            </Container>
        </AppShell>
    );
};

export default GerenciarSolicitacoes;
