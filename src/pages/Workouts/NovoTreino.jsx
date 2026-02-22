import React, { useState, useEffect } from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2, FiChevronRight, FiMinus, FiMenu } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, BotaoPrimario, Label, InputWrapper } from '../../ui/components/BaseUI';
import CustomSelect from '../../ui/components/CustomSelect';
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
  padding: 15px;
  margin-bottom: 15px;
  border-left: 4px solid var(--primary);
`;

const SetRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr 40px;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
`;

const SmallInput = styled.input`
  width: 100%;
  height: 40px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 10px;
  color: var(--text);
  text-align: center;
  font-size: 14px;

  &:focus {
    border-color: var(--primary);
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

const NovoTreino = () => {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [nomeTreino, setNomeTreino] = useState('');
    const [exercicios, setExercicios] = useState([]);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(false);

    // Carregar dados se estiver editando
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
            // Se não houver ID, tenta carregar o rascunho (apenas para treinos NOVOS)
            const draft = JSON.parse(localStorage.getItem('workout_draft_data') || '{}');
            if (draft.nomeTreino) setNomeTreino(draft.nomeTreino);
            if (draft.exercicios) setExercicios(draft.exercicios);
        }
    }, [id, usuario.uid]);

    // Salvar rascunho apenas se NÃO estiver editando um treino existente
    useEffect(() => {
        if (!id && (nomeTreino || exercicios.length > 0)) {
            localStorage.setItem('workout_draft_data', JSON.stringify({ nomeTreino, exercicios }));
        }
    }, [nomeTreino, exercicios, id]);


    const handleAddExercise = () => {
        navigate('/biblioteca', { state: { fromCreate: true } });
    };

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


    const handleBack = () => {
        if (nomeTreino || exercicios.length > 0) {
            if (window.confirm('Deseja descartar as alterações?')) {
                localStorage.removeItem('workout_draft_data');
                navigate('/workouts');
            }
        } else {
            navigate('/workouts');
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
        if (active.id !== over.id) {
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
                    <Flex $justify="space-between">
                        <Flex $gap="10px">
                            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                                <FiMenu size={20} color="var(--primary)" />
                            </div>
                            <Typography.H2 style={{ fontSize: '16px', margin: 0 }}>{ex.nome}</Typography.H2>
                        </Flex>
                        <IconButton color="#ff5f5f" onClick={() => removerExercicio(index)}>
                            <FiTrash2 size={18} />
                        </IconButton>
                    </Flex>

                    <div style={{ marginTop: '15px' }}>
                        <CustomSelect
                            label="SÉRIES"
                            value={ex.series || 3}
                            onChange={(val) => atualizarExercicio(index, 'series', val)}
                            options={[
                                { label: '1 Série', value: 1 },
                                { label: '2 Séries', value: 2 },
                                { label: '3 Séries', value: 3 },
                                { label: '4 Séries', value: 4 },
                                { label: '5 Séries', value: 5 },
                                { label: '6 Séries', value: 6 },
                            ]}
                        />
                        <CustomSelect
                            label="REPS"
                            value={ex.reps || '10-12'}
                            onChange={(val) => atualizarExercicio(index, 'reps', val)}
                            options={[
                                { label: '6-8 Reps', value: '6-8' },
                                { label: '8-10 Reps', value: '8-10' },
                                { label: '10-12 Reps', value: '10-12' },
                                { label: '12-15 Reps', value: '12-15' },
                                { label: 'Falha', value: 'Falha' },
                            ]}
                        />
                        <InputWrapper style={{ marginBottom: 0 }}>
                            <Label>PESO (KG)</Label>
                            <InputField
                                type="number"
                                placeholder="0"
                                value={ex.peso || ''}
                                onChange={(e) => atualizarExercicio(index, 'peso', e.target.value)}
                                style={{ height: '48px' }}
                            />
                        </InputWrapper>
                    </div>
                </ExerciseItem>
            </div>
        );
    };

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={handleBack}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>{id ? 'Editar Ficha' : 'Criar Ficha'}</Typography.H2>
                    <button onClick={salvarTreino} disabled={salvando} style={{ color: 'var(--primary)' }}>
                        <FiSave size={24} />
                    </button>
                </Flex>

                {carregando && <Typography.Body style={{ textAlign: 'center', marginBottom: '20px' }}>Carregando dados do treino...</Typography.Body>}


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

