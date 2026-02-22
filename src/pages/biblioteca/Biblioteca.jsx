import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiChevronRight, FiPlus, FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, Label, InputWrapper, BotaoPrimario, TextAreaField } from '../../ui/components/BaseUI';

import CustomSelect from '../../ui/components/CustomSelect';
import { useColecao } from '../../hooks/useColecao';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const Biblioteca = () => {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [novoEx, setNovoEx] = useState({
    nome: '',
    categoria: 'Peito',
    alvo: '',
    gifUrl: ''
  });
  const [salvando, setSalvando] = useState(false);

  const { documentos: exercicios, carregando } = useColecao('exercicios');
  const navigate = useNavigate();
  const location = useLocation();
  const isSelectionMode = location.state?.fromCreate || location.state?.pickingForWorkout;

  const categorias = ['Todos', 'Bíceps', 'Tríceps', 'Peito', 'Costas', 'Ombros', 'Quadríceps', 'Panturrilha', 'Abdômen', 'Sem Equipamento'];
  const categoriasSimplificadas = categorias.filter(c => c !== 'Todos').map(c => ({ label: c, value: c }));

  const handleSalvarExercicio = async () => {
    if (!novoEx.nome || !novoEx.alvo) return toast.error('Preencha os campos obrigatórios');
    setSalvando(true);
    try {
      await addDoc(collection(db, 'exercicios'), {
        ...novoEx,
        criadoEm: serverTimestamp()
      });
      toast.success('Exercício cadastrado!');
      setModalAberto(false);
      setNovoEx({ nome: '', categoria: 'Peito', alvo: '', gifUrl: '' });
    } catch (error) {
      toast.error('Erro ao cadastrar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleAddExercise = (ex) => {
    const draft = JSON.parse(localStorage.getItem('workout_draft_data') || '{}');
    const existingExercises = draft.exercicios || [];
    const instanceId = `${ex.id || Date.now()}-${Date.now()}`;
    localStorage.setItem('workout_draft_data', JSON.stringify({
      ...draft,
      exercicios: [...existingExercises, { ...ex, instanceId, series: 3, reps: '10-12', peso: '' }]
    }));
    toast.success(`${ex.nome} adicionado ao treino!`);

    if (location.state?.fromCreate) {
      navigate('/workouts/novo');
    }
  };

  const exerciciosExemplo = [
    { id: '1', nome: 'Supino Reto', categoria: 'Peito', alvo: 'Peitoral Maior', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
    { id: '2', nome: 'Agachamento', categoria: 'Quadríceps', alvo: 'Quadríceps', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3RwZ3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0Z3B0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMG7X3f9yJvHVe/giphy.gif' },
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
      <Container>
        <Flex $justify="space-between" style={{ marginTop: '20px' }}>
          <Typography.H1 style={{ margin: 0 }}>Biblioteca</Typography.H1>
          <button
            onClick={() => setModalAberto(true)}
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

        {carregando && exercicios.length === 0 ? (
          <Typography.Body>Carregando exercícios...</Typography.Body>
        ) : (
          <ExerciseGrid>
            {exerciciosFiltrados.map(ex => (
              <ExerciseCard key={ex.id || Math.random()} onClick={() => !isSelectionMode && navigate(`/exercicio/${ex.id}`)}>
                <ExerciseImage style={{ backgroundImage: `url(${ex.gifUrl})` }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px' }}>{ex.nome}</h4>
                  <Typography.Small>{ex.alvo} • {ex.categoria}</Typography.Small>
                </div>
                {isSelectionMode ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddExercise(ex); }}
                    style={{ backgroundColor: 'var(--primary)', color: '#000', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}
                  >
                    ADICIONAR
                  </button>
                ) : (
                  <FiChevronRight color="var(--muted)" />
                )}
              </ExerciseCard>
            ))}
          </ExerciseGrid>
        )}

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

                <Typography.H2 style={{ marginBottom: '25px' }}>Novo Exercício</Typography.H2>

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

                  {salvando ? 'Cadastrando...' : 'Salvar Exercício'}
                </BotaoPrimario>
              </ModalContent>
            </ModalOverlay>
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