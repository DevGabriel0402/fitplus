import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiShield } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { maskTelefone } from '../../utils/masks';

const UserCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid ${props => props.$isAdmin ? 'var(--primary)' : 'transparent'};
  opacity: ${props => props.$isInactive ? 0.6 : 1};
  filter: ${props => props.$isInactive ? 'grayscale(0.5)' : 'none'};
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  background-color: ${props => props.$bg || 'var(--surface)'};
  color: ${props => props.$color || 'var(--text)'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusBtn = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? 'rgba(255, 95, 95, 0.1)' : 'rgba(76, 175, 80, 0.1)'};
  color: ${props => props.$active ? '#ff5f5f' : '#4caf50'};
  border: 1px solid ${props => props.$active ? '#ff5f5f33' : '#4caf5033'};

  &:hover {
    background: ${props => props.$active ? '#ff5f5f' : '#4caf50'};
    color: #000;
  }
`;

const GerenciarUsuarios = () => {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const fetchUsuarios = async () => {
        try {
            const q = query(collection(db, 'usuarios'), orderBy('nome', 'asc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsuarios(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Erro ao carregar lista de usuários.");
        } finally {
            setCarregando(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        const text = currentStatus === false ? "ativar" : "desativar";
        if (!window.confirm(`Deseja realmente ${text} este aluno?`)) return;

        try {
            const userRef = doc(db, 'usuarios', userId);
            await updateDoc(userRef, {
                ativo: currentStatus === false
            });

            setUsuarios(usuarios.map(u =>
                u.id === userId ? { ...u, ativo: currentStatus === false } : u
            ));
            toast.success(`Usuário ${text}ado!`);
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            toast.error("Erro ao alterar status do usuário.");
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/admin')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Gerenciar Alunos</Typography.H2>
                    <div style={{ width: 24 }} />
                </Flex>

                {carregando ? (
                    <Typography.Body>Carregando alunos...</Typography.Body>
                ) : usuarios.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.Body>Nenhum aluno cadastrado ainda.</Typography.Body>
                    </Card>
                ) : (
                    usuarios.map(user => (
                        <UserCard key={user.id} $isAdmin={user.role === 'admin'} $isInactive={user.ativo === false}>
                            <Flex $justify="space-between" $align="flex-start">
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px' }}>
                                        {user.nome || 'Sem Nome'}
                                        {user.ativo === false && <span style={{ color: '#ff5f5f', fontSize: '12px', marginLeft: '8px' }}>(INATIVO)</span>}
                                    </h4>
                                    <Typography.Small style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                        <FiMail size={12} /> {user.email}
                                    </Typography.Small>
                                </div>
                                <Flex $gap="5px">
                                    {user.role === 'admin' && (
                                        <Badge $bg="var(--primary)" $color="#000">
                                            <FiShield size={10} /> ADMIN
                                        </Badge>
                                    )}
                                    <Badge $bg={user.setupCompleto ? '#4caf5022' : '#ff980022'} $color={user.setupCompleto ? '#4caf50' : '#ff9800'}>
                                        {user.setupCompleto ? 'Ativo' : 'Pendente'}
                                    </Badge>
                                </Flex>
                            </Flex>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '5px 0' }} />

                            <Flex $justify="space-between" $align="center" style={{ flexWrap: 'wrap', gap: '15px' }}>
                                <Flex $gap="20px">
                                    <Typography.Small style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FiPhone size={14} /> {maskTelefone(user.telefone) || '--'}
                                    </Typography.Small>
                                    <Typography.Small>
                                        <strong>Peso:</strong> {user.peso}{user.unidadePeso}
                                    </Typography.Small>
                                </Flex>

                                {user.role !== 'admin' && (
                                    <StatusBtn
                                        $active={user.ativo !== false}
                                        onClick={() => toggleStatus(user.id, user.ativo ?? true)}
                                    >
                                        {user.ativo === false ? 'Reativar Aluno' : 'Desativar Aluno'}
                                    </StatusBtn>
                                )}
                            </Flex>
                        </UserCard>
                    ))
                )}
            </Container>
        </AppShell>
    );
};

export default GerenciarUsuarios;
