import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiActivity, FiUser, FiPlus, FiBookOpen, FiHeart, FiStar } from 'react-icons/fi';
import * as IconsFa from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAjustes } from '../../contexts/AjustesContexto';
import { AppShell } from '../../ui/AppShell/AppShell';
import { useUsuario } from '../../hooks/useUsuario';
import { useAuth } from '../../contexts/AuthContexto';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import ResumeWorkoutModal from '../../ui/components/ResumeWorkoutModal';
import { collection, query, getDocs, orderBy, limit, doc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

import { db } from '../../firebase/firestore';
import { useColecao } from '../../hooks/useColecao';
import { treinosSugeridos as estaticos } from '../../data/sugestoes';

const ShortcutGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 0 20px; margin-bottom: 30px; margin-top: 20px;   
`;
const ShortcutItem = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  .icon { width: 60px; height: 60px; border-radius: 18px; background-color: var(--card); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 24px; border: 1px solid var(--border); }
  span { font-size: 12px; color: var(--muted); font-weight: 500; }
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

const Home = () => {
  const { dados, carregando: userLoading } = useUsuario();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const [sugeridos, setSugeridos] = useState([]);
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sincroniza favoritos para saber o que já está marcado
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
        id: item.id,
        tipo: tipo,
        titulo: item.nomeTreino || item.titulo,
        image: item.image,
        path: tipo === 'treino' ? `/detalhes-treino/${item.id}` : `/home`, // Artigo ainda não tem rota de detalhes
        subtitulo: tipo === 'treino' ? `${item.nivel} • ${item.duracao}` : item.categoria,
        favoritadoEm: new Date().toISOString()
      };
      await setDoc(docRef, data);
      toast.success('Adicionado aos favoritos!');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sugestões
        const qSug = query(collection(db, 'treinos_sugeridos'), orderBy('criadoEm', 'desc'), limit(10));
        const snapSug = await getDocs(qSug);
        const dynamicSug = snapSug.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSugeridos(dynamicSug.length > 0 ? dynamicSug : estaticos);

        // Artigos
        const qArt = query(collection(db, 'artigos'), orderBy('criadoEm', 'desc'), limit(10));
        const snapArt = await getDocs(qArt);
        const dynamicArt = snapArt.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArtigos(dynamicArt);
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
        setSugeridos(estaticos);
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
      <ShortcutGrid>

        <ShortcutItem onClick={() => navigate('/workouts/novo')}>
          <div className="icon"><FiPlus /></div>
          <span>Criar</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => navigate('/workouts')}>
          <div className="icon" style={{ color: 'var(--secondary)' }}><FiActivity /></div>
          <span>Treinos</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => navigate('/perfil')}>
          <div className="icon" style={{ color: '#ff8c00' }}><FiUser /></div>
          <span>Perfil</span>
        </ShortcutItem>
        <ShortcutItem onClick={() => navigate('/progresso')}>
          <div className="icon" style={{ color: '#ff8c00' }}><FiActivity /></div>
          <span>Histórico</span>
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFavorito(treino.id) ? 'var(--primary)' : 'white'
                }}
              >
                <FiStar fill={isFavorito(treino.id) ? 'var(--primary)' : 'none'} size={18} />
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
            <ArticleItem key={artigo.id}>
              <div className="thumb" style={{ backgroundImage: `url(${artigo.image})` }} />
              <div style={{ flex: 1 }}>
                <Typography.Small style={{ color: 'var(--primary)', fontWeight: '700' }}>{artigo.categoria}</Typography.Small>
                <h4 style={{ margin: '5px 0', fontSize: '16px' }}>{artigo.titulo}</h4>
                <Typography.Small>{artigo.tempoLeitura}</Typography.Small>
              </div>
              <button
                onClick={(e) => toggleFavorito(e, artigo, 'artigo')}
                style={{ background: 'none', border: 'none', color: isFavorito(artigo.id) ? 'var(--primary)' : 'var(--muted)', alignSelf: 'center' }}
              >
                <FiHeart fill={isFavorito(artigo.id) ? 'var(--primary)' : 'none'} size={20} />
              </button>
            </ArticleItem>
          ))
        )}
      </ScrollGrid>
    </AppShell>
  );
};

export default Home;
