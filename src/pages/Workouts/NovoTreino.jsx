import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, BotaoPrimario, Label, InputWrapper } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { useAuth } from '../../contexts/AuthContexto';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../ui/components/ConfirmModal';

const ExerciseItem = styled(Card)`
  padding: 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border);
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary);
  }
`;

const ExerciseThumb = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-color: var(--surface);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const ExerciseInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CompactControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const CompactInput = styled.input`
  width: 45px;
  height: 32px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  text-align: center;
  font-weight: 600;

  &:focus {
    border-color: var(--primary);
    outline: none;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  
  span {
    font-size: 9px;
    color: var(--muted);
    font-weight: 700;
    text-transform: uppercase;
  }
`;

const DragHandle = styled.div`
  color: var(--muted);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 5px;
  
  &:active {
    cursor: grabbing;
  }
`;

const IconButton = styled.button`
  color: ${({ color }) => color || 'var(--muted)'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    color: var(--primary);
  }
`;

const SortableExerciseItem = ({ ex, index, removerExercicio, atualizarExercicio }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ex.instanceId || ex.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style}>
            <ExerciseItem>
                <ExerciseThumb style={{ backgroundImage: `url(${ex.gifUrl})` }} />

                <ExerciseInfo>
                    <h4 style={{ fontSize: '14px', margin: 0 }}>{ex.nome}</h4>
                    <CompactControls>
                        {ex.categoria?.toLowerCase() !== 'cardio' && ex.muscle?.toLowerCase() !== 'cardio' ? (
                            <InputGroup>
                                <span>Séries</span>
                                <CompactInput
                                    type="number"
                                    value={ex.series || 3}
                                    onChange={(e) => atualizarExercicio(index, 'series', e.target.value)}
                                />
                            </InputGroup>
                        ) : null}
                        <InputGroup>
                            <span>{ex.categoria?.toLowerCase() === 'cardio' || ex.muscle?.toLowerCase() === 'cardio' ? 'Duração' : 'Reps'}</span>
                            <CompactInput
                                type="text"
                                value={ex.reps || '10'}
                                onChange={(e) => atualizarExercicio(index, 'reps', e.target.value)}
                                style={{ width: '80px' }}
                                placeholder={ex.categoria?.toLowerCase() === 'cardio' || ex.muscle?.toLowerCase() === 'cardio' ? 'Ex: 15 min' : '10'}
                            />
                        </InputGroup>
                        <InputGroup>
                            <span>KG/SEG</span>
                            <CompactInput
                                type="text"
                                value={ex.peso || ''}
                                onChange={(e) => atualizarExercicio(index, 'peso', e.target.value)}
                                style={{ width: '60px' }}
                            />
                        </InputGroup>
                        <InputGroup>
                            <span>Descanso</span>
                            <select
                                value={ex.descanso || 60}
                                onChange={(e) => atualizarExercicio(index, 'descanso', Number(e.target.value))}
                                style={{
                                    width: '70px',
                                    height: '32px',
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    color: 'var(--text)',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={15}>15s</option>
                                <option value={30}>30s</option>
                                <option value={45}>45s</option>
                                <option value={60}>1 min</option>
                                <option value={90}>1.5 min</option>
                                <option value={120}>2 min</option>
                                <option value={180}>3 min</option>
                            </select>
                        </InputGroup>
                    </CompactControls>
                </ExerciseInfo>

                <Flex $gap="5px">
                    <IconButton color="#8A2BE2" onClick={() => removerExercicio(index)}>
                        <FiTrash2 size={18} />
                    </IconButton>
                    <DragHandle {...attributes} {...listeners}>
                        <MdDragIndicator size={24} />
                    </DragHandle>
                </Flex>
            </ExerciseItem>
        </div>
    );
};

const NovoTreino = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const { id, alunoId } = params;
    const [nomeTreino, setNomeTreino] = useState('');
    const [exercicios, setExercicios] = useState([]);
    const [dias, setDias] = useState([]);
    const [local, setLocal] = useState('Academia');
    const [diasPreferidos, setDiasPreferidos] = useState([]);
    const [localPreferencia, setLocalPreferencia] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false });

    const targetUid = alunoId || usuario.uid;

    useEffect(() => {
        if (id) {
            const fetchTreino = async () => {
                setCarregando(true);
                try {
                    const docRef = doc(db, `treinos/${targetUid}/lista`, id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setNomeTreino(data.nomeTreino);
                        setDias(data.dias || []);
                        setLocal(data.local || 'Academia');
                        setExercicios(data.exercicios.map((ex, i) => ({
                            ...ex,
                            instanceId: ex.instanceId || `${ex.id}-${Date.now()}-${i}`
                        })));
                    } else {
                        toast.error('Treino não encontrado.');
                        navigate('/workouts');
                    }
                } catch (error) {
                    console.error("Erro ao carregar treino:", error);
                    toast.error('Erro ao carregar treino.');
                } finally {
                    setCarregando(false);
                }
            };
            fetchTreino();
        }

        // Fetch student preferred days
        const fetchAlunoInfo = async () => {
            try {
                const alunoSnap = await getDoc(doc(db, 'usuarios', targetUid));
                if (alunoSnap.exists()) {
                    const data = alunoSnap.data();
                    setDiasPreferidos(data.diasTreino || []);
                    setLocalPreferencia(data.localTreino || '');
                    if (!id && data.localTreino) setLocal(data.localTreino);
                }
            } catch (error) {
                console.error("Erro ao carregar info do aluno:", error);
            }
        };
        fetchAlunoInfo();

        if (!id) {
            const draft = JSON.parse(localStorage.getItem('workout_draft_data') || '{}');
            if (draft.nomeTreino) setNomeTreino(draft.nomeTreino);
            if (draft.exercicios) setExercicios(draft.exercicios);
            if (draft.dias) setDias(draft.dias);
            if (draft.local) setLocal(draft.local);
        }
    }, [id, targetUid, navigate]);

    useEffect(() => {
        if (!id && (nomeTreino || exercicios.length > 0 || dias.length > 0 || local !== 'Academia')) {
            localStorage.setItem('workout_draft_data', JSON.stringify({ nomeTreino, exercicios, dias, local }));
        }
    }, [nomeTreino, exercicios, dias, local, id]);

    const removerExercicio = useCallback((index) => {
        setExercicios(prev => {
            const novaLista = [...prev];
            novaLista.splice(index, 1);
            return novaLista;
        });
    }, []);

    const atualizarExercicio = useCallback((index, campo, valor) => {
        setExercicios(prev => {
            const novaLista = [...prev];
            novaLista[index] = { ...novaLista[index], [campo]: valor };
            return novaLista;
        });
    }, []);

    const salvarTreino = async () => {
        if (!nomeTreino) return toast.error('Dê um nome ao seu treino');
        if (exercicios.length === 0) return toast.error('Adicione pelo menos um exercício');

        setSalvando(true);
        try {
            const treinoData = {
                nomeTreino,
                exercicios,
                dias,
                local,
                atualizadoEm: serverTimestamp()
            };

            if (id) {
                const docRef = doc(db, `treinos/${targetUid}/lista`, id);
                await updateDoc(docRef, treinoData);
                toast.success('Treino atualizado com sucesso!');
            } else {
                treinoData.criadoEm = serverTimestamp();
                treinoData.usuarioId = targetUid;
                await addDoc(collection(db, `treinos/${targetUid}/lista`), treinoData);
                localStorage.removeItem('workout_draft_data');
                toast.success('Treino criado com sucesso!');
            }
            navigate(alunoId ? '/admin/usuarios' : '/workouts');
        } catch (error) {
            console.error("Erro ao salvar treino:", error);
            toast.error('Erro ao salvar treino.');
        } finally {
            setSalvando(false);
        }
    };

    const deletarTreino = async () => {
        if (!id) return;

        setModalConfig({
            isOpen: true,
            title: 'Excluir Treino',
            message: 'Tem certeza que deseja apagar este treino permanentemente?',
            isDestructive: true,
            confirmText: 'Excluir',
            onConfirm: async () => {
                setCarregando(true);
                try {
                    await deleteDoc(doc(db, `treinos/${targetUid}/lista`, id));

                    const activeWorkout = JSON.parse(localStorage.getItem(`active_workout_${targetUid}`) || 'null');
                    if (activeWorkout && activeWorkout.id === id) {
                        localStorage.removeItem(`active_workout_${targetUid}`);
                        localStorage.removeItem(`workout_session_${id}_${targetUid}`);
                    }

                    toast.success('Treino excluído!');
                    navigate(alunoId ? '/admin/usuarios' : '/workouts');
                } catch (error) {
                    console.error("Erro ao excluir treino:", error);
                    toast.error('Erro ao excluir treino.');
                } finally {
                    setCarregando(false);
                }
            }
        });
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setExercicios((items) => {
                const oldIndex = items.findIndex(ex => (ex.instanceId || ex.id) === active.id);
                const newIndex = items.findIndex(ex => (ex.instanceId || ex.id) === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate(alunoId ? '/admin/usuarios' : '/workouts')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>{id ? 'Editar Ficha' : (alunoId ? 'Ficha do Aluno' : 'Criar Ficha')}</Typography.H2>
                    <button onClick={salvarTreino} disabled={salvando} style={{ color: 'var(--primary)' }}>
                        <FiSave size={24} />
                    </button>
                </Flex>

                <InputWrapper>
                    <Label>Nome do Treino</Label>
                    <InputField
                        placeholder="Ex: Treino A - Superior"
                        value={nomeTreino}
                        onChange={(e) => setNomeTreino(e.target.value)}
                    />
                </InputWrapper>

                <div style={{ marginTop: '20px' }}>
                    <Label style={{ display: 'block', marginBottom: '10px' }}>Dias da Semana</Label>
                    {diasPreferidos.length > 0 && (
                        <Typography.Small style={{ display: 'block', marginBottom: '10px', opacity: 0.7 }}>
                            Preferência do Aluno: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{diasPreferidos.join(', ')}</span>
                        </Typography.Small>
                    )}
                    <Flex $gap="8px" style={{ flexWrap: 'wrap' }}>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(dia => {
                            const isSelected = dias.includes(dia);
                            return (
                                <button
                                    key={dia}
                                    onClick={() => {
                                        setDias(prev => isSelected ? prev.filter(d => d !== dia) : [...prev, dia]);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                                        color: isSelected ? '#fff' : 'var(--text)',
                                        border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)'),
                                        fontWeight: '700',
                                        fontSize: '13px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {dia}
                                </button>
                            );
                        })}
                    </Flex>
                </div>

                <div style={{ marginTop: '25px' }}>
                    <Label style={{ display: 'block', marginBottom: '10px' }}>Onde será o treino?</Label>
                    {localPreferencia && (
                        <Typography.Small style={{ display: 'block', marginBottom: '10px', opacity: 0.7 }}>
                            Preferência do Aluno: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{localPreferencia}</span>
                        </Typography.Small>
                    )}
                    <Flex $gap="10px">
                        {['Academia', 'Casa', 'Rua/Parque'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLocal(l)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: local === l ? 'var(--primary)' : 'var(--card)',
                                    color: local === l ? '#fff' : 'var(--text)',
                                    border: '1px solid ' + (local === l ? 'var(--primary)' : 'var(--border)'),
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {l}
                            </button>
                        ))}
                    </Flex>
                </div>

                <Flex $justify="space-between" style={{ marginTop: '30px', marginBottom: '15px' }}>
                    <Typography.H2 style={{ fontSize: '18px', margin: 0 }}>Exercícios</Typography.H2>
                    <button
                        onClick={() => navigate('/biblioteca', { state: { fromCreate: true } })}
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '14px' }}
                    >
                        <FiPlus /> Adicionar
                    </button>
                </Flex>

                {exercicios.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px', borderStyle: 'dashed' }}>
                        <Typography.Body>Nenhum exercício selecionado.</Typography.Body>
                        <Typography.Small>Escolha na biblioteca para começar.</Typography.Small>
                    </Card>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={exercicios.map(ex => ex.instanceId || ex.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {exercicios.map((ex, index) => (
                                <SortableExerciseItem
                                    key={ex.instanceId || ex.id}
                                    ex={ex}
                                    index={index}
                                    removerExercicio={removerExercicio}
                                    atualizarExercicio={atualizarExercicio}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}

                <Flex $gap="15px" style={{ marginTop: '40px', marginBottom: '40px' }}>
                    {id && (
                        <BotaoPrimario
                            onClick={deletarTreino}
                            disabled={salvando || carregando}
                            style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #8A2BE2', color: '#8A2BE2' }}
                        >
                            Excluir Treino
                        </BotaoPrimario>
                    )}
                    <BotaoPrimario
                        onClick={salvarTreino}
                        disabled={salvando}
                        style={{ flex: 2 }}
                    >
                        {salvando ? 'Salvando...' : 'Salvar Treino'}
                    </BotaoPrimario>
                </Flex>

                <ConfirmModal
                    {...modalConfig}
                    onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
                />
            </Container>
        </AppShell>
    );
};

export default NovoTreino;
