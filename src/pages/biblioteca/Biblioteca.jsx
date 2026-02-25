import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiChevronRight, FiPlus, FiX, FiCheck } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, Label, InputWrapper, BotaoPrimario, TextAreaField } from '../../ui/components/BaseUI';

import CustomSelect from '../../ui/components/CustomSelect';
import { useColecao } from '../../hooks/useColecao';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2 } from 'react-icons/fi';

const SearchBar = styled.div`
  position: relative;
  margin: 20px 0;
  
  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }

  input {
    padding-left: 45px;
  }
`;

const CategoryScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-bottom: 25px;
  padding-bottom: 5px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled.div`
  padding: 8px 16px;
  background-color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--card)')};
  color: ${({ $active }) => ($active ? '#000' : 'var(--text)')};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'var(--border)')};
  cursor: pointer;
`;

const ExerciseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 10px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

const ExerciseCard = styled(Card)`
  display: flex;
  gap: 15px;
  padding: 12px;
  margin-bottom: 15px;
  align-items: center;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid ${({ $selected }) => ($selected ? 'var(--primary)' : 'var(--border)')};
  background-color: ${({ $selected }) => ($selected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card)')};
  position: relative;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  @media (min-width: 769px) {
    margin-bottom: 0;
  }
`;

const ExerciseImage = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 12px;
  background-color: var(--surface);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const SelectionBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--surface);
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 30px;
  border: 1px solid var(--border);
  position: relative;
`;

const FloatingActionContainer = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  padding: 0 20px;
  pointer-events: none; /* Container itself doesn't block clicks */

  @media (min-width: 769px) {
    /* Adjust for sidebar on desktop */
    padding-left: 280px; 
  }
  
  & > * {
    pointer-events: auto; /* Re-enable for the button */
  }
`;


// [REMOVE IMPORT] import { bibliotecaPadrao } from '../../data/bibliotecaPadrao';

const Biblioteca = () => {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionados, setSelecionados] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [exercicioIdEmEdicao, setExercicioIdEmEdicao] = useState(null);
  const [novoEx, setNovoEx] = useState({
    nome: '',
    categoria: 'Peito',
    alvo: '',
    gifUrl: '',
    dicas: ''
  });
  const [salvando, setSalvando] = useState(false);

  const { documentos: exercicios, carregando } = useColecao('exercicios');
  const navigate = useNavigate();
  const location = useLocation();
  const isSelectionMode = location.state?.fromCreate || location.state?.pickingForWorkout || location.state?.fromAdmin;

  const categorias = ['Todos', 'Bíceps', 'Tríceps', 'Peito', 'Costas', 'Ombros', 'Quadríceps', 'Panturrilha', 'Abdômen', 'Alongamento', 'Sem Equipamento'];
  const categoriasSimplificadas = categorias.filter(c => c !== 'Todos').map(c => ({ label: c, value: c }));

  const toggleSelecao = (ex) => {
    if (selecionados.find(s => s.id === ex.id)) {
      setSelecionados(selecionados.filter(s => s.id !== ex.id));
    } else {
      setSelecionados([...selecionados, ex]);
    }
  };

  const abrirModalCadastro = () => {
    setEditMode(false);
    setExercicioIdEmEdicao(null);
    setNovoEx({ nome: '', categoria: 'Peito', alvo: '', gifUrl: '', dicas: '' });
    setModalAberto(true);
  };

  const abrirModalEdicao = (ex, e) => {
    e.stopPropagation();
    setEditMode(true);
    setExercicioIdEmEdicao(ex.id);
    setNovoEx({
      nome: ex.nome || '',
      categoria: ex.categoria || 'Peito',
      alvo: ex.alvo || '',
      gifUrl: ex.gifUrl || '',
      dicas: ex.dicas || ''
    });
    setModalAberto(true);
  };

  const handleSalvarExercicio = async () => {
    if (!novoEx.nome || !novoEx.alvo) return toast.error('Preencha os campos obrigatórios');
    setSalvando(true);
    try {
      if (editMode && exercicioIdEmEdicao) {
        const docRef = doc(db, 'exercicios', exercicioIdEmEdicao);
        await updateDoc(docRef, {
          ...novoEx,
          atualizadoEm: serverTimestamp()
        });
        toast.success('Exercício atualizado!');
      } else {
        await addDoc(collection(db, 'exercicios'), {
          ...novoEx,
          criadoEm: serverTimestamp()
        });
        toast.success('Exercício cadastrado!');
      }
      setModalAberto(false);
      setNovoEx({ nome: '', categoria: 'Peito', alvo: '', gifUrl: '', dicas: '' });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error('Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleConfirmSelection = () => {
    if (selecionados.length === 0) return;

    const draftKey = location.state?.fromAdmin ? 'suggestion_draft_data' : 'workout_draft_data';
    const draft = JSON.parse(localStorage.getItem(draftKey) || '{}');
    const existingExercises = draft.exercicios || [];

    const newExercises = selecionados.map(ex => ({
      ...ex,
      instanceId: `${ex.id || Date.now()}-${Math.random()}`,
      series: 3,
      reps: '10-12',
      peso: ''
    }));

    localStorage.setItem(draftKey, JSON.stringify({
      ...draft,
      exercicios: [...existingExercises, ...newExercises]
    }));

    toast.success(`${selecionados.length} exercícios adicionados!`);

    if (location.state?.fromAdmin) {
      navigate(draft.id ? `/admin/sugestoes/editar/${draft.id}` : '/admin/sugestoes/nova');
    } else {
      navigate(draft.id ? `/workouts/editar/${draft.id}` : '/workouts/novo');
    }
  };

  const exerciciosExemplo = [
    { id: '1', nome: 'Supino Reto', categoria: 'Peito', alvo: 'Peitoral Maior', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
    { id: '2', nome: 'Agachamento', categoria: 'Quadríceps', alvo: 'Quadríceps', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
  ];

  const listaExibicao = exercicios.length > 0 ? exercicios : exerciciosExemplo;

  const normalizeStr = (str) =>
    str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") || '';

  const exerciciosFiltrados = listaExibicao.filter(ex => {
    const nome = normalizeStr(ex.nome);
    const alvo = normalizeStr(ex.alvo);
    const cat = normalizeStr(ex.categoria);
    const buscaNorm = normalizeStr(busca);
    const catAtivaNorm = normalizeStr(categoriaAtiva);

    const matchesBusca = nome.includes(buscaNorm) || alvo.includes(buscaNorm);
    const matchesCategoria = categoriaAtiva === 'Todos' || cat === catAtivaNorm;

    return matchesBusca && matchesCategoria;
  });

  return (
    <AppShell>
      <Container style={{ paddingBottom: isSelectionMode ? '100px' : '20px' }}>
        <Flex $justify="space-between" style={{ marginTop: '20px' }}>
          <Typography.H1 style={{ margin: 0 }}>Biblioteca</Typography.H1>
          <button
            onClick={abrirModalCadastro}
            style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
          >
            <FiPlus /> CADASTRAR
          </button>
        </Flex>

        <SearchBar>
          <FiSearch />
          <InputField
            placeholder="Buscar exercício..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </SearchBar>

        <CategoryScroll>
          {categorias.map(cat => (
            <Chip
              key={cat}
              $active={categoriaAtiva === cat}
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat}
            </Chip>
          ))}
        </CategoryScroll>

        {carregando && exercicios.length === 0 && (
          <Typography.Body style={{ marginBottom: '20px', opacity: 0.7 }}>Sincronizando biblioteca...</Typography.Body>
        )}

        <ExerciseGrid>
          {exerciciosFiltrados.map(ex => {
            const isSelected = !!selecionados.find(s => s.id === (ex.id || ex.instanceId));
            return (
              <ExerciseCard
                key={ex.id || Math.random()}
                $selected={isSelected}
                onClick={() => isSelectionMode ? toggleSelecao(ex) : navigate(`/exercicio/${ex.id}`)}
              >
                <ExerciseImage style={{ backgroundImage: `url("${ex.gifUrl || 'https://via.placeholder.com/150'}")` }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px' }}>{ex.nome}</h4>
                  <Typography.Small>{ex.alvo} • {ex.categoria}</Typography.Small>
                </div>
                {isSelectionMode ? (
                  isSelected ? (
                    <SelectionBadge>
                      <FiCheck size={16} />
                    </SelectionBadge>
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border)' }} />
                  )
                ) : (
                  <Flex $gap="15px">
                    <button onClick={(e) => abrirModalEdicao(ex, e)} style={{ padding: '8px', color: 'var(--primary)' }}>
                      <FiEdit2 size={18} />
                    </button>
                    <FiChevronRight color="var(--muted)" />
                  </Flex>
                )}
              </ExerciseCard>
            );
          })}
        </ExerciseGrid>

        <AnimatePresence>
          {modalAberto && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModalContent
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <button
                  onClick={() => setModalAberto(false)}
                  style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--muted)' }}
                >
                  <FiX size={24} />
                </button>

                <Typography.H2 style={{ marginBottom: '25px' }}>{editMode ? 'Editar Exercício' : 'Novo Exercício'}</Typography.H2>

                <InputWrapper>
                  <Label>Nome</Label>
                  <InputField
                    placeholder="Ex: Supino Inclinado"
                    value={novoEx.nome}
                    onChange={(e) => setNovoEx({ ...novoEx, nome: e.target.value })}
                  />
                </InputWrapper>

                <CustomSelect
                  label="Categoria"
                  value={novoEx.categoria}
                  options={categoriasSimplificadas}
                  onChange={(val) => setNovoEx({ ...novoEx, categoria: val })}
                />

                <InputWrapper>
                  <Label>Músculo Alvo</Label>
                  <InputField
                    placeholder="Ex: Peitoral Superior"
                    value={novoEx.alvo}
                    onChange={(e) => setNovoEx({ ...novoEx, alvo: e.target.value })}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>URL do GIF (Opcional)</Label>
                  <InputField
                    placeholder="Link da imagem/gif"
                    value={novoEx.gifUrl}
                    onChange={(e) => setNovoEx({ ...novoEx, gifUrl: e.target.value })}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Dicas de Execução (Opcional)</Label>
                  <TextAreaField
                    placeholder="Ex: Mantenha as costas retas e o abdômen contraído..."
                    value={novoEx.dicas || ''}
                    onChange={(e) => setNovoEx({ ...novoEx, dicas: e.target.value })}
                  />
                </InputWrapper>

                <BotaoPrimario onClick={handleSalvarExercicio} disabled={salvando}>
                  {salvando ? 'Salvando...' : (editMode ? 'Atualizar Exercício' : 'Salvar Exercício')}
                </BotaoPrimario>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSelectionMode && selecionados.length > 0 && (
            <FloatingActionContainer
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              <BotaoPrimario
                style={{
                  maxWidth: '400px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  height: '64px',
                  fontSize: '18px'
                }}
                onClick={handleConfirmSelection}
              >
                Confirmar {selecionados.length} {selecionados.length === 1 ? 'exercício' : 'exercícios'}
              </BotaoPrimario>
            </FloatingActionContainer>
          )}
        </AnimatePresence>


        {!carregando && exerciciosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Typography.Body>Nenhum exercício encontrado.</Typography.Body>
          </div>
        )}
      </Container>
    </AppShell>
  );
};

export default Biblioteca;