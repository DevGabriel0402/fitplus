import React, { useState, useEffect } from 'react';
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

import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

import { useAuth } from '../../contexts/AuthContexto';
import toast from 'react-hot-toast';

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

const NovoTreino = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [nomeTreino, setNomeTreino] = useState('');
    const [exercicios, setExercicios] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchTreino = async () => {
                setCarregando(true);
                try {
                    const docRef = doc(db, `treinos/${usuario.uid}/lista`, id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setNomeTreino(data.nomeTreino);
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
        } else {
            const draft = JSON.parse(localStorage.getItem('workout_draft_data') || '{}');
            if (draft.nomeTreino) setNomeTreino(draft.nomeTreino);
            if (draft.exercicios) setExercicios(draft.exercicios);
        }
    }, [id, usuario.uid, navigate]);

    useEffect(() => {
        if (!id && (nomeTreino || exercicios.length > 0)) {
            localStorage.setItem('workout_draft_data', JSON.stringify({ nomeTreino, exercicios }));
        }
    }, [nomeTreino, exercicios, id]);

    const removerExercicio = (index) => {
        const novaLista = [...exercicios];
        novaLista.splice(index, 1);
        setExercicios(novaLista);
    };

    const atualizarExercicio = (index, campo, valor) => {
        const novaLista = [...exercicios];
        novaLista[index][campo] = valor;
        setExercicios(novaLista);
    };

    const salvarTreino = async () => {
        if (!nomeTreino) return toast.error('Dê um nome ao seu treino');
        if (exercicios.length === 0) return toast.error('Adicione pelo menos um exercício');

        setSalvando(true);
        try {
            const treinoData = {
                nomeTreino,
                exercicios,
                atualizadoEm: serverTimestamp()
            };

            if (id) {
                const docRef = doc(db, `treinos/${usuario.uid}/lista`, id);
                await updateDoc(docRef, treinoData);
                toast.success('Treino atualizado com sucesso!');
            } else {
                treinoData.criadoEm = serverTimestamp();
                treinoData.usuarioId = usuario.uid;
                await addDoc(collection(db, `treinos/${usuario.uid}/lista`), treinoData);
                localStorage.removeItem('workout_draft_data');
                toast.success('Treino criado com sucesso!');
            }
            navigate('/workouts');
        } catch (error) {
            console.error("Erro ao salvar treino:", error);
            toast.error('Erro ao salvar treino.');
        } finally {
            setSalvando(false);
        }
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

    const SortableExerciseItem = ({ ex, index }) => {
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
                            <InputGroup>
                                <span>Séries</span>
                                <CompactInput
                                    type="number"
                                    value={ex.series || 3}
                                    onChange={(e) => atualizarExercicio(index, 'series', e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup>
                                <span>Reps</span>
                                <CompactInput
                                    type="text"
                                    value={ex.reps || '10'}
                                    onChange={(e) => atualizarExercicio(index, 'reps', e.target.value)}
                                    style={{ width: '60px' }}
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
                        </CompactControls>
                    </ExerciseInfo>

                    <Flex $gap="5px">
                        <IconButton color="#ff5f5f" onClick={() => removerExercicio(index)}>
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

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate('/workouts')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>{id ? 'Editar Ficha' : 'Criar Ficha'}</Typography.H2>
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
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}

                <BotaoPrimario
                    onClick={salvarTreino}
                    disabled={salvando}
                    style={{ marginTop: '40px', marginBottom: '40px' }}
                >
                    {salvando ? 'Salvando...' : 'Salvar Treino'}
                </BotaoPrimario>
            </Container>
        </AppShell>
    );
};

export default NovoTreino;
