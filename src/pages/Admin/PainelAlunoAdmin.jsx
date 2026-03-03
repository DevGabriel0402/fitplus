import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiZap, FiEdit2, FiPlay, FiTrash2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, query, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../ui/components/ConfirmModal';

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

const PainelAlunoAdmin = () => {
    const navigate = useNavigate();
    const { alunoId } = useParams();
    const [aluno, setAluno] = useState(null);
    const [treinos, setTreinos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    useEffect(() => {
        const fetchDados = async () => {
            try {
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
                const q = query(collection(db, `treinos/${alunoId}/lista`));
                const treinosSnap = await getDocs(q);
                const items = treinosSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setTreinos(items);
            } catch (error) {
                console.error("Erro ao carregar dados do aluno:", error);
                toast.error("Erro ao carregar fichas.");
            } finally {
                setCarregando(false);
            }
        };

        if (alunoId) {
            fetchDados();
        }
    }, [alunoId, navigate]);

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
                        <Typography.Small style={{ display: 'block', textAlign: 'center' }}>Fichas de Treino</Typography.Small>
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
                </Flex>

                {treinos.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <Typography.H2>Nenhum treino cadastrado</Typography.H2>
                        <Typography.Body>Este aluno ainda não possui fichas. Clique nos botões acima para criar a primeira.</Typography.Body>
                    </Card>
                ) : (
                    <WorkoutGrid>
                        {treinos.map(treino => (
                            <WorkoutCard key={treino.id} onClick={() => navigate(`/workouts/editar/${treino.id}`)}>
                                <WorkoutIcon><FiZap /></WorkoutIcon>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>{treino.nomeTreino}</h4>
                                    <Flex $gap="0">
                                        <Badge>{treino.exercicios?.length || 0} EXERCÍCOS</Badge>
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
                                        onClick={(e) => { e.stopPropagation(); deletarTreino(treino.id); }}
                                        style={{ color: '#ff5f5f', fontSize: '20px' }}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </Flex>
                            </WorkoutCard>
                        ))}
                    </WorkoutGrid>
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
