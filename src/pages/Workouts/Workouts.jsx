import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPlay, FiClock, FiZap, FiEdit2, FiTrash2 } from 'react-icons/fi';

import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, BotaoPrimario } from '../../ui/components/BaseUI';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const ShortcutCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 30px;
  color: var(--muted);
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary);
    color: var(--text);
  }
  
  svg { font-size: 28px; color: var(--primary); }
  span { font-weight: 700; font-size: 16px; }
`;

const Workouts = () => {
  const { usuario, dadosUsuario } = useAuth();
  const { documentos: treinos, carregando } = useColecao(`treinos/${usuario?.uid}/lista`);
  const navigate = useNavigate();

  const [solicitando, setSolicitando] = React.useState(false);
  const [modalConfig, setModalConfig] = React.useState({ isOpen: false });

  const deletarTreino = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Excluir Treino',
      message: 'Deseja excluir este treino permanentemente?',
      isDestructive: true,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, `treinos/${usuario.uid}/lista`, id));

          const activeWorkout = JSON.parse(localStorage.getItem(`active_workout_${usuario.uid}`) || 'null');
          if (activeWorkout && activeWorkout.id === id) {
            localStorage.removeItem(`active_workout_${usuario.uid}`);
            localStorage.removeItem(`workout_session_${id}_${usuario.uid}`);
          }

          toast.success("Treino excluído com sucesso.");
        } catch (error) {
          console.error(error);
          toast.error("Erro ao excluir o treino.");
        }
      }
    });
  };

  const handleSolicitarFicha = async () => {
    if (!usuario) return;

    setSolicitando(true);
    try {
      const q = query(
        collection(db, 'solicitacoes'),
        where('userId', '==', usuario.uid),
        where('status', '==', 'pendente')
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        toast.error("Você já tem uma solicitação em andamento.");
        setSolicitando(false);
        return;
      }

      setSolicitando(false);
      setModalConfig({
        isOpen: true,
        title: 'Solicitar Nova Ficha',
        message: 'Deseja enviar um pedido para o seu treinador criar uma nova ficha personalizada?',
        confirmText: 'Enviar Pedido',
        onConfirm: async () => {
          try {
            setSolicitando(true);
            await addDoc(collection(db, 'solicitacoes'), {
              userId: usuario.uid,
              nome: dadosUsuario?.nome || 'Aluno',
              email: dadosUsuario?.email || '',
              status: 'pendente',
              criadoEm: serverTimestamp()
            });
            toast.success("Solicitação enviada com sucesso!");
          } catch (e) {
            toast.error("Erro ao solicitar ficha.");
          } finally {
            setSolicitando(false);
          }
        }
      });
    } catch (error) {
      console.error("Erro ao checar solicitação:", error);
      toast.error("Erro na comunicação.");
      setSolicitando(false);
    }
  };

  return (
    <AppShell>
      <Container>
        <Flex $justify="space-between" style={{ marginBottom: '30px', marginTop: '20px' }}>
          <Typography.H1>Meus Treinos</Typography.H1>
          {dadosUsuario?.role?.toLowerCase() === 'admin' ? (
            <button onClick={() => navigate('/workouts/novo')} style={{ color: 'var(--primary)', fontSize: '28px' }}>
              <FiPlus />
            </button>
          ) : null}
        </Flex>


        {carregando ? (
          <Typography.Body>Carregando treinos...</Typography.Body>
        ) : !treinos || treinos.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', padding: '40px' }}>
            <div style={{ fontSize: '80px', color: 'var(--muted)', opacity: 0.3, marginBottom: '20px' }}>
              <FiZap />
            </div>
            <Typography.H2>Nenhum treino ainda</Typography.H2>

            <Typography.Body>Solicite seu primeiro treino personalizado para o treinador.</Typography.Body>
            <BotaoPrimario
              onClick={dadosUsuario?.role?.toLowerCase() === 'admin' ? () => navigate('/workouts/novo') : handleSolicitarFicha}
              disabled={solicitando}
              style={{ marginTop: '30px', maxWidth: '300px', margin: '30px auto 0' }}
            >
              {dadosUsuario?.role?.toLowerCase() === 'admin' ? 'Criar Treino' : (solicitando ? 'Aguarde...' : 'Solicitar Ficha')}
            </BotaoPrimario>
          </div>
        ) : (
          <WorkoutGrid>
            {treinos.map(treino => (
              <WorkoutCard
                key={treino.id}
                onClick={() => navigate(`/workouts/execucao/${treino.id}`)}
              >
                <WorkoutIcon><FiZap /></WorkoutIcon>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '18px', marginBottom: '6px' }}>{treino.nomeTreino}</h4>
                  <Flex $gap="0">
                    <Badge>{treino.exercicios?.length || 0} EXERCÍCIOS</Badge>
                    <Badge>~45 MIN</Badge>
                  </Flex>

                </div>
                <Flex $gap="15px">
                  {dadosUsuario?.role?.toLowerCase() === 'admin' && (
                    <>
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
                    </>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/workouts/execucao/${treino.id}`); }}
                    style={{ color: 'var(--primary)', fontSize: '22px' }}
                  >
                    <FiPlay />
                  </button>
                </Flex>

              </WorkoutCard>
            ))}
          </WorkoutGrid>
        )}

        <Typography.H2 style={{ marginTop: '50px', marginBottom: '20px' }}>Atalhos Rápidos</Typography.H2>
        <Grid>
          {dadosUsuario?.role?.toLowerCase() === 'admin' ? (
            <ShortcutCard onClick={() => navigate('/workouts/novo')}>
              <FiPlus />
              <span>Novo Treino</span>
            </ShortcutCard>
          ) : (
            <ShortcutCard onClick={handleSolicitarFicha} style={{ opacity: solicitando ? 0.5 : 1 }}>
              <FiClock />
              <span>{solicitando ? 'Aguarde...' : 'Solicitar Ficha'}</span>
            </ShortcutCard>
          )}
          {dadosUsuario?.role?.toLowerCase() === 'admin' && (
            <ShortcutCard onClick={() => navigate('/biblioteca')}>
              <FiZap />
              <span>Ver Biblioteca</span>
            </ShortcutCard>
          )}
        </Grid>

        <ConfirmModal
          {...modalConfig}
          onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
        />
      </Container>
    </AppShell>
  );
};

export default Workouts;
