import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiActivity, FiUser, FiPlus, FiBookOpen, FiHeart, FiStar, FiX } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAjustes } from '../../contexts/AjustesContexto';
import { AppShell } from '../../ui/AppShell/AppShell';
import { useUsuario } from '../../hooks/useUsuario';
import { useAuth } from '../../contexts/AuthContexto';
import { Container, Typography, Card, Flex, InputField, Label, InputWrapper, BotaoPrimario } from '../../ui/components/BaseUI';
import ResumeWorkoutModal from '../../ui/components/ResumeWorkoutModal';
import { collection, query, getDocs, orderBy, limit, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../../firebase/firestore';
import { useColecao } from '../../hooks/useColecao';

const ShortcutGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 0 20px; margin-bottom: 30px; margin-top: 20px;   
`;
const ShortcutItem = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
  .icon { width: 60px; height: 60px; border-radius: 18px; background-color: var(--card); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 24px; border: 1px solid var(--border); transition: all 0.2s; }
  span { font-size: 11px; color: var(--muted); font-weight: 500; text-align: center; }
  &:hover .icon { border-color: var(--primary); transform: translateY(-2px); }
`;
const SectionHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 15px; margin-top: 20px;
`;
const ScrollGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; padding: 0 20px 30px;
  @media (max-width: 768px) { display: flex; overflow-x: auto; scrollbar-width: none; &::-webkit-scrollbar { display: none; } padding-bottom: 20px; }
`;
const ActionCard = styled(Card)`
  min-width: 200px; padding: 0; overflow: hidden; position: relative; transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
  .image { height: 160px; background-size: cover; background-position: center; @media (max-width: 768px) { height: 120px; } }
  .content { padding: 15px; }
  .tag { position: absolute; top: 10px; left: 10px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; }
`;

const ArticleItem = styled(Card)`
  min-width: 300px; display: flex; gap: 15px; padding: 15px; cursor: pointer;
  &:hover { border-color: var(--primary); }
  .thumb { width: 80px; height: 80px; border-radius: 12px; background-size: cover; background-position: center; flex-shrink: 0; }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center;
  justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background-color: var(--bg); width: 100%; max-width: 450px;
  border-radius: 24px; padding: 30px; position: relative; border: 1px solid var(--border);
`;

const IMCModal = ({ isOpen, onClose, userId, initialPeso, initialAltura }) => {
  const [peso, setPeso] = useState(initialPeso || '');
  const [altura, setAltura] = useState(initialAltura || '');
  const [resultado, setResultado] = useState(null);
  const [status, setStatus] = useState('');
  const [salvando, setSalvando] = useState(false);

  const calcularIMC = async () => {
    if (!peso || !altura) return toast.error('Preencha peso e altura');

    const altMetros = parseFloat(altura) > 3 ? parseFloat(altura) / 100 : parseFloat(altura);
    const imcValue = (parseFloat(peso) / (altMetros * altMetros)).toFixed(1);
    setResultado(imcValue);

    let textoStatus = '';
    if (imcValue < 18.5) textoStatus = 'Abaixo do peso';
    else if (imcValue < 25) textoStatus = 'Peso normal';
    else if (imcValue < 30) textoStatus = 'Sobrepeso';
    else textoStatus = 'Obesidade';
    setStatus(textoStatus);

    setSalvando(true);
    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        imc: imcValue,
        statusImc: textoStatus,
        peso: peso,
        altura: altura,
        ultimoCalculoImc: new Date().toISOString()
      });
      toast.success('IMC salvo no seu perfil!');
    } catch (error) {
      console.error("Erro ao salvar IMC:", error);
      toast.error('Calculado, mas erro ao salvar no perfil.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--muted)' }}>
            <FiX size={24} />
          </button>

          <Typography.H2 style={{ marginBottom: '20px' }}>Calculadora de IMC</Typography.H2>
          <Typography.Body style={{ fontSize: '14px', marginBottom: '25px' }}>
            Descubra seu Índice de Massa Corporal e mantenha seu perfil atualizado.
          </Typography.Body>

          <Flex $gap="15px">
            <InputWrapper>
              <Label>Peso (kg)</Label>
              <InputField type="number" placeholder="Ex: 80" value={peso} onChange={(e) => setPeso(e.target.value)} />
            </InputWrapper>
            <InputWrapper>
              <Label>Altura (cm ou m)</Label>
              <InputField type="number" placeholder="Ex: 175" value={altura} onChange={(e) => setAltura(e.target.value)} />
            </InputWrapper>
          </Flex>

          {resultado && (
            <Card style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--primary)', marginBottom: '25px', textAlign: 'center' }}>
              <Typography.Small>Seu IMC é</Typography.Small>
              <Typography.H1 style={{ color: 'var(--primary)', margin: '5px 0' }}>{resultado}</Typography.H1>
              <Typography.Body style={{ fontWeight: '700', color: 'var(--text)' }}>{status}</Typography.Body>
            </Card>
          )}

          <BotaoPrimario onClick={calcularIMC} disabled={salvando}>
            {salvando ? 'Salvando...' : (resultado ? 'Recalcular e Salvar' : 'Calcular e Salvar')}
          </BotaoPrimario>

          <button
            onClick={onClose}
            style={{ width: '100%', marginTop: '15px', padding: '10px', color: 'var(--muted)', fontSize: '14px', fontWeight: '600' }}
          >
            Fechar
          </button>
        </ModalContent>
      </ModalOverlay>
    </AnimatePresence>
  );
};

const Home = () => {
  const { dados, carregando: userLoading } = useUsuario();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const [sugeridos, setSugeridos] = useState([]);
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImcAberto, setModalImcAberto] = useState(false);

  const { documentos: listaFavs } = useColecao(usuario ? `favoritos/${usuario.uid}/itens` : null);
  const isFavorito = (id) => listaFavs.some(f => f.id === id);

  const toggleFavorito = async (e, item, tipo) => {
    e.stopPropagation();
    if (!usuario) return;
    const docRef = doc(db, `favoritos/${usuario.uid}/itens`, item.id);
    if (isFavorito(item.id)) {
      await deleteDoc(docRef);
      toast.success('Removido dos favoritos');
    } else {
      const data = {
        id: item.id, tipo, titulo: item.nomeTreino || item.titulo, image: item.image,
        path: tipo === 'treino' ? `/detalhes-treino/${item.id}` : `/artigo/${item.id}`,
        subtitulo: tipo === 'treino' ? `${item.nivel} • ${item.duracao}` : item.categoria,
        criadoEm: new Date().toISOString()
      };
      await setDoc(docRef, data);
      toast.success(tipo === 'treino' ? 'Treino favoritado! ⭐' : 'Artigo favoritado! ❤️');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const qSug = query(collection(db, 'treinos_sugeridos'), orderBy('criadoEm', 'desc'), limit(10));
        const snapSug = await getDocs(qSug);
        setSugeridos(snapSug.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        const qArt = query(collection(db, 'artigos'), orderBy('criadoEm', 'desc'), limit(10));
        const snapArt = await getDocs(qArt);
        setArtigos(snapArt.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (userLoading) return <div style={{ color: 'var(--text)', padding: '20px' }}>Carregando...</div>;

  return (
    <AppShell>
      <ResumeWorkoutModal />
      <IMCModal
        isOpen={modalImcAberto}
        onClose={() => setModalImcAberto(false)}
        userId={usuario?.uid}
        initialPeso={dados?.peso}
        initialAltura={dados?.altura}
      />

      <ShortcutGrid>
        <ShortcutItem onClick={() => navigate('/workouts/novo')}>
          <div className="icon"><FiPlus /></div>
          <span>Criar Treino</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => setModalImcAberto(true)}>
          <div className="icon" style={{ color: '#00c2ff' }}><FaCalculator /></div>
          <span>Calc. IMC</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => navigate('/progresso')}>
          <div className="icon" style={{ color: '#ff8c00' }}><FiActivity /></div>
          <span>Histórico</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => navigate('/perfil')}>
          <div className="icon" style={{ color: 'var(--primary)' }}><FiUser /></div>
          <span>Meu Perfil</span>
        </ShortcutItem>
      </ShortcutGrid>

      <SectionHeader>
        <Typography.H2>Treinos Sugeridos</Typography.H2>
        <Typography.Small style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/biblioteca')}>Explorar tudo</Typography.Small>
      </SectionHeader>

      <ScrollGrid>
        {sugeridos.map(treino => (
          <ActionCard key={treino.id} onClick={() => navigate(`/detalhes-treino/${treino.id}`)}>
            <div className="image" style={{ backgroundImage: `url(${treino.image})` }}>
              <button
                onClick={(e) => toggleFavorito(e, treino, 'treino')}
                style={{
                  position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.4)',
                  border: 'none', borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFavorito(treino.id) ? '#FFD700' : 'white'
                }}
              >
                <FiStar fill={isFavorito(treino.id) ? '#FFD700' : 'none'} size={18} />
              </button>
            </div>
            <div className="tag" style={{ backgroundColor: treino.tagColor || 'var(--secondary)', color: '#000' }}>{treino.tag}</div>
            <div className="content">
              <Typography.Small>{treino.nivel} • {treino.duracao}</Typography.Small>
              <h4 style={{ marginTop: '8px', fontSize: '18px' }}>{treino.nomeTreino}</h4>
            </div>
          </ActionCard>
        ))}
      </ScrollGrid>

      <SectionHeader>
        <Typography.H2>Dicas e Artigos</Typography.H2>
        <Typography.Small style={{ color: 'var(--primary)', cursor: 'pointer' }}>Ver tudo</Typography.Small>
      </SectionHeader>

      <ScrollGrid>
        {artigos.length === 0 && !loading ? (
          <Typography.Body style={{ padding: '0 20px', opacity: 0.6 }}>Nenhuma dica postada ainda.</Typography.Body>
        ) : (
          artigos.map(artigo => (
            <ArticleItem key={artigo.id} onClick={() => navigate(`/artigo/${artigo.id}`)}>
              <div className="thumb" style={{ backgroundImage: `url(${artigo.image})` }} />
              <div style={{ flex: 1 }}>
                <Typography.Small style={{ color: 'var(--primary)', fontWeight: '700' }}>{artigo.categoria}</Typography.Small>
                <h4 style={{ margin: '5px 0', fontSize: '16px' }}>{artigo.titulo}</h4>
                <Typography.Small>{artigo.tempoLeitura}</Typography.Small>
              </div>
              <button
                onClick={(e) => toggleFavorito(e, artigo, 'artigo')}
                style={{ background: 'none', border: 'none', color: isFavorito(artigo.id) ? '#FF4B4B' : 'var(--muted)', alignSelf: 'center' }}
              >
                <FiHeart fill={isFavorito(artigo.id) ? '#FF4B4B' : 'none'} size={20} />
              </button>
            </ArticleItem>
          ))
        )}
      </ScrollGrid>
    </AppShell>
  );
};

export default Home;
