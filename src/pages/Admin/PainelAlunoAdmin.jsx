import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiZap, FiEdit2, FiPlay, FiTrash2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, doc, getDoc, deleteDoc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../ui/components/ConfirmModal';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const TabsWrapper = styled.div`
  display: flex;
  background-color: rgba(0,0,0,0.2);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 25px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? 'var(--surface)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--muted)')};
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--card);
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
`;

const PainelAlunoAdmin = () => {
    const navigate = useNavigate();
    const { alunoId } = useParams();
    const [aluno, setAluno] = useState(null);
    const [treinos, setTreinos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [tabAtiva, setTabAtiva] = useState('fichas');
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    useEffect(() => {
        const fetchDados = async () => {
            try {
                setCarregando(true);
                // Fetch student info
                const alunoSnap = await getDoc(doc(db, 'usuarios', alunoId));
                if (alunoSnap.exists()) {
                    setAluno(alunoSnap.data());
                } else {
                    toast.error("Aluno não encontrado.");
                    navigate('/admin/usuarios');
                    return;
                }

                // Fetch student workouts
                const treinosSnap = await getDocs(query(collection(db, `treinos/${alunoId}/lista`)));
                setTreinos(treinosSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

                // Fetch student history
                const historicoSnap = await getDocs(query(collection(db, `treinos_historico/${alunoId}/lista`), orderBy('data', 'desc')));
                setHistorico(historicoSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            } catch (error) {
                console.error("Erro ao carregar dados do aluno:", error);
                toast.error("Erro ao carregar dados.");
            } finally {
                setCarregando(false);
            }
        };

        if (alunoId) {
            fetchDados();
        }
    }, [alunoId, navigate]);

    const formatarData = (dateString) => {
        try {
            const data = new Date(dateString);
            return format(data, "dd 'de' MMM, HH:mm", { locale: ptBR });
        } catch (e) {
            return dateString;
        }
    };

    const deletarTreino = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Excluir Treino',
            message: 'Deseja excluir este treino permanentemente do perfil do aluno?',
            isDestructive: true,
            confirmText: 'Excluir',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, `treinos/${alunoId}/lista`, id));
                    setTreinos(treinos.filter(t => t.id !== id));

                    const activeWorkout = JSON.parse(localStorage.getItem(`active_workout_${alunoId}`) || 'null');
                    if (activeWorkout && activeWorkout.id === id) {
                        localStorage.removeItem(`active_workout_${alunoId}`);
                        localStorage.removeItem(`workout_session_${id}_${alunoId}`);
                    }

                    toast.success("Treino excluído com sucesso.");
                } catch (error) {
                    console.error(error);
                    toast.error("Erro ao excluir o treino.");
                }
            }
        });
    };

    if (carregando) return <AppShell><Container><Typography.Body>Carregando...</Typography.Body></Container></AppShell>;

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/admin/usuarios')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <div>
                        <Typography.H2 style={{ margin: 0, textAlign: 'center' }}>{aluno?.nome || 'Aluno'}</Typography.H2>
                        <div style={{ textAlign: 'center', marginTop: '4px' }}>
                            <Typography.Small style={{ opacity: 0.6 }}>Dias: </Typography.Small>
                            <Typography.Small style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                {aluno?.diasTreino?.length > 0 ? aluno.diasTreino.join(', ') : 'Não informado'}
                            </Typography.Small>
                            <Typography.Small style={{ opacity: 0.6, marginLeft: '10px' }}>Local: </Typography.Small>
                            <Typography.Small style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                {aluno?.localTreino || 'Não informado'}
                            </Typography.Small>
                        </div>
                    </div>
                    <div style={{ width: 24 }} />
                </Flex>

                <Flex $gap="15px" style={{ marginBottom: '30px' }}>
                    <BotaoPrimario
                        onClick={() => navigate(`/admin/usuarios/${alunoId}/novo-treino`)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <FiPlus /> Ficha Manual
                    </BotaoPrimario>
                    <BotaoPrimario
                        onClick={() => navigate(`/admin/usuarios/${alunoId}/gerador-treinos`)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                    >
                        <FiZap /> Gerador IA
                    </BotaoPrimario>
                </Flex>

                <TabsWrapper>
                    <Tab $active={tabAtiva === 'fichas'} onClick={() => setTabAtiva('fichas')}>Fichas Ativas</Tab>
                    <Tab $active={tabAtiva === 'historico'} onClick={() => setTabAtiva('historico')}>Histórico de Treinos</Tab>
                </TabsWrapper>

                {tabAtiva === 'fichas' ? (
                    treinos.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '40px' }}>
                            <Typography.H2>Nenhum treino cadastrado</Typography.H2>
                            <Typography.Body>Este aluno ainda não possui fichas. Clique nos botões acima para criar a primeira.</Typography.Body>
                        </Card>
                    ) : (
                        <WorkoutGrid>
                            {treinos.map(treino => (
                                <WorkoutCard key={treino.id} onClick={() => navigate(`/admin/usuarios/${alunoId}/editar-treino/${treino.id}`)}>
                                    <WorkoutIcon><FiZap /></WorkoutIcon>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>{treino.nomeTreino}</h4>
                                        <Flex $gap="0" style={{ flexWrap: 'wrap' }}>
                                            <Badge>{treino.exercicios?.length || 0} EXERCÍCOS</Badge>
                                            {treino.local && <Badge>{treino.local.toUpperCase()}</Badge>}
                                            {treino.dias?.length > 0 && <Badge>{treino.dias.join(', ')}</Badge>}
                                        </Flex>
                                    </div>
                                    <Flex $gap="15px">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/usuarios/${alunoId}/editar-treino/${treino.id}`); }}
                                            style={{ color: 'var(--muted)', fontSize: '20px' }}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deletarTreino(treino.id); }}
                                            style={{ color: '#8A2BE2', fontSize: '20px' }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </Flex>
                                </WorkoutCard>
                            ))}
                        </WorkoutGrid>
                    )
                ) : (
                    historico.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '40px' }}>
                            <Typography.H2>Sem histórico</Typography.H2>
                            <Typography.Body>Este aluno ainda não concluiu nenhum treino.</Typography.Body>
                        </Card>
                    ) : (
                        <div>
                            {historico.map((act) => (
                                <ActivityItem key={act.id}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>{act.nomeTreino}</h4>
                                        <Typography.Small style={{ fontSize: '12px', opacity: 0.7 }}>
                                            {formatarData(act.data)} • {Math.floor(act.duracaoSegundos / 60)} min
                                        </Typography.Small>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>
                                            {act.setsCompletosTotal}/{act.totalSetsPrevistos}
                                        </div>
                                        <Typography.Small style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', opacity: 0.5 }}>Séries</Typography.Small>
                                    </div>
                                </ActivityItem>
                            ))}
                        </div>
                    )
                )}
                <ConfirmModal
                    {...modalConfig}
                    onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
                />
            </Container>
        </AppShell>
    );
};

export default PainelAlunoAdmin;
