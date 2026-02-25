import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2, FiImage } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, BotaoPrimario, Label, InputWrapper } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

const ExerciseItem = styled(Card)`
  padding: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border);
`;
const ExerciseThumb = styled.div`
  width: 50px; height: 50px; border-radius: 8px; background-color: var(--surface); background-size: cover; background-position: center;
`;
const CompactInput = styled.input`
  width: 50px; height: 30px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text); text-align: center; font-size: 12px;
`;

const SortableExerciseItem = ({ ex, index, remover, atualizar }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ex.instanceId || ex.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style}>
            <ExerciseItem>
                <ExerciseThumb style={{ backgroundImage: `url(${ex.gifUrl})` }} />
                <div style={{ flex: 1 }}>
                    <Typography.Small style={{ fontWeight: '700' }}>{ex.nome}</Typography.Small>
                    <Flex $gap="10px" style={{ marginTop: '5px' }}>
                        <CompactInput type="number" value={ex.series} onChange={e => atualizar(index, 'series', e.target.value)} placeholder="Séries" />
                        <CompactInput type="text" value={ex.reps} onChange={e => atualizar(index, 'reps', e.target.value)} placeholder="Reps" style={{ width: '70px' }} />
                    </Flex>
                </div>
                <Flex $gap="5px">
                    <button onClick={() => remover(index)} style={{ color: '#ff5f5f' }}><FiTrash2 size={16} /></button>
                    <div {...attributes} {...listeners} style={{ cursor: 'grab' }}><MdDragIndicator size={20} /></div>
                </Flex>
            </ExerciseItem>
        </div>
    );
};

const NovaSugestao = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        nomeTreino: '', image: '', tag: '', tagColor: '#765df0',
        duracao: '', nivel: 'Iniciante', exercicios: []
    });
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (id) {
            getDoc(doc(db, 'treinos_sugeridos', id)).then(snap => {
                if (snap.exists()) setForm({ ...snap.data(), exercicios: snap.data().exercicios.map((ex, i) => ({ ...ex, instanceId: `${ex.id}-${i}` })) });
            });
        }
    }, [id]);

    const atualizarEx = (idx, field, val) => {
        const newExs = [...form.exercicios];
        newExs[idx] = { ...newExs[idx], [field]: val };
        setForm({ ...form, exercicios: newExs });
    };

    const removerEx = (idx) => {
        const newExs = [...form.exercicios];
        newExs.splice(idx, 1);
        setForm({ ...form, exercicios: newExs });
    };

    const salvar = async () => {
        if (!form.nomeTreino || form.exercicios.length === 0) return toast.error("Preencha o nome e adicione exercícios.");
        setSalvando(true);
        try {
            const data = { ...form, criadoEm: serverTimestamp() };
            if (id) {
                await updateDoc(doc(db, 'treinos_sugeridos', id), data);
                toast.success("Atualizado!");
            } else {
                await addDoc(collection(db, 'treinos_sugeridos'), data);
                toast.success("Criado!");
            }
            navigate('/admin/sugestoes');
        } catch (e) { toast.error("Erro ao salvar."); }
        finally { setSalvando(false); }
    };

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIdx = form.exercicios.findIndex(ex => (ex.instanceId || ex.id) === active.id);
            const newIdx = form.exercicios.findIndex(ex => (ex.instanceId || ex.id) === over.id);
            setForm({ ...form, exercicios: arrayMove(form.exercicios, oldIdx, newIdx) });
        }
    };

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/admin/sugestoes')}><FiArrowLeft size={24} /></button>
                    <Typography.H2 style={{ margin: 0 }}>{id ? 'Editar Sugestão' : 'Nova Sugestão'}</Typography.H2>
                    <button onClick={salvar} disabled={salvando} style={{ color: 'var(--primary)' }}><FiSave size={24} /></button>
                </Flex>

                <Card style={{ marginBottom: '20px' }}>
                    <InputWrapper>
                        <Label>Nome do Treino</Label>
                        <InputField value={form.nomeTreino} onChange={e => setForm({ ...form, nomeTreino: e.target.value })} placeholder="Ex: Hipertrofia Pernas" />
                    </InputWrapper>
                    <InputWrapper style={{ marginTop: '15px' }}>
                        <Label>URL da Imagem de Capa</Label>
                        <InputField value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                    </InputWrapper>
                    <Flex $gap="15px" style={{ marginTop: '15px' }}>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Tag (ex: CARDIO)</Label>
                            <InputField value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
                        </InputWrapper>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Cor da Tag</Label>
                            <InputField type="color" value={form.tagColor} onChange={e => setForm({ ...form, tagColor: e.target.value })} style={{ height: '50px', padding: '5px' }} />
                        </InputWrapper>
                    </Flex>
                    <Flex $gap="15px" style={{ marginTop: '15px' }}>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Duração (ex: 45min)</Label>
                            <InputField value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} />
                        </InputWrapper>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Nível</Label>
                            <select value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })} style={{ width: '100%', height: '50px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 15px', color: 'var(--text)' }}>
                                <option>Iniciante</option>
                                <option>Intermediário</option>
                                <option>Avançado</option>
                                <option>Adaptação</option>
                            </select>
                        </InputWrapper>
                    </Flex>
                </Card>

                <Flex $justify="space-between" style={{ marginBottom: '15px' }}>
                    <Typography.H2 style={{ fontSize: '18px', margin: 0 }}>Exercícios</Typography.H2>
                    <button onClick={() => navigate('/biblioteca', { state: { fromAdmin: true } })} style={{ color: 'var(--primary)', fontWeight: '700' }}><FiPlus /> Adicionar</button>
                </Flex>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={form.exercicios.map(ex => ex.instanceId || ex.id)} strategy={verticalListSortingStrategy}>
                        {form.exercicios.map((ex, i) => <SortableExerciseItem key={ex.instanceId || ex.id} ex={ex} index={i} remover={removerEx} atualizar={atualizarEx} />)}
                    </SortableContext>
                </DndContext>

                <BotaoPrimario onClick={salvar} disabled={salvando} style={{ marginTop: '20px', marginBottom: '40px' }}>{salvando ? 'Salvando...' : 'Salvar no Banco'}</BotaoPrimario>
            </Container>
        </AppShell>
    );
};

export default NovaSugestao;
