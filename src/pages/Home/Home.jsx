import React from 'react';
import styled from 'styled-components';
import { FiSearch, FiBell, FiUser, FiPlay, FiChevronRight, FiActivity, FiStar, FiPlus } from 'react-icons/fi';
import * as IconsFa from 'react-icons/fa';
import { FaDumbbell } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import { useAjustes } from '../../contexts/AjustesContexto';






import { AppShell } from '../../ui/AppShell/AppShell';
import { useUsuario } from '../../hooks/useUsuario';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-top: 20px;
`;

const Avatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
`;

const ShortcutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 0 20px;
  margin-bottom: 30px;
`;

const ShortcutItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .icon {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    background-color: var(--card);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    font-size: 24px;
    border: 1px solid var(--border);
  }

  span {
    font-size: 12px;
    color: var(--muted);
    font-weight: 500;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 15px;
  margin-top: 20px;
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 20px 30px;

  @media (max-width: 768px) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    padding-bottom: 20px;
  }
`;

const RecommendedCard = styled(Card)`
  min-width: 200px;
  padding: 0;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  .image {
    height: 160px;
    background-size: cover;
    background-position: center;
    
    @media (max-width: 768px) {
      height: 120px;
    }
  }

  .content {
    padding: 15px;
  }

  .tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: var(--secondary);
    color: #000;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
  }
`;

const ChallengeCard = styled(Card)`
  margin: 0 20px 30px;
  background: linear-gradient(135deg, var(--primary) 0%, #765df0 100%);
  color: #000;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;

  h3 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
  p { font-size: 16px; opacity: 0.9; }
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 0 20px 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled(Card)`
  display: flex;
  gap: 15px;
  padding: 15px;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary);
  }
  
  .thumb {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }
`;

const Home = () => {
  const { dados, carregando } = useUsuario();
  const navigate = useNavigate();
  const { ajustes } = useAjustes();
  const SelectedIcon = IconsFa[ajustes?.iconePainel] || IconsFa.FaDumbbell;


  if (carregando) return <div style={{ color: 'white', padding: '20px' }}>Carregando...</div>;

  return (
    <AppShell>
      <Header>
        <div>
          <Typography.Small>Bem-vindo de volta!</Typography.Small>
          <Typography.H1 style={{ margin: 0, fontSize: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Olá, {dados?.nome?.split(' ')[0] || 'Atleta'} <SelectedIcon style={{ color: 'var(--primary)' }} />
          </Typography.H1>
        </div>


        <Flex $gap="15px">
          <IconBtn className="desktop-only"><FiSearch /></IconBtn>
          <IconBtn><FiBell /></IconBtn>
          <Avatar>
            <FiUser size={24} />
          </Avatar>
        </Flex>

      </Header>

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
        <ShortcutItem onClick={() => window.location.href = 'https://youtube.com'}>
          <div className="icon" style={{ color: '#ff0000' }}><FiPlay /></div>
          <span>Vídeos</span>
        </ShortcutItem>
      </ShortcutGrid>


      <SectionHeader>
        <Typography.H2>Treinos Sugeridos</Typography.H2>
        <Typography.Small style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => navigate('/biblioteca')}>Explorar tudo</Typography.Small>
      </SectionHeader>


      <RecommendationsGrid>
        <RecommendedCard onClick={() => navigate('/workouts/novo')}>
          <div className="image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600)' }} />
          <div className="tag">INICIANTE</div>
          <div className="content">
            <Typography.Small>Adaptação • 45min</Typography.Small>
            <h4 style={{ marginTop: '8px', fontSize: '18px' }}>Plano Full Body Iniciante</h4>
          </div>
        </RecommendedCard>
        <RecommendedCard onClick={() => navigate('/workouts/novo')}>
          <div className="image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600)' }} />
          <div className="tag" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>HIPERTROFIA</div>
          <div className="content">
            <Typography.Small>Intermediário • 55min</Typography.Small>
            <h4 style={{ marginTop: '8px', fontSize: '18px' }}>Foco em Superiores</h4>
          </div>
        </RecommendedCard>
        <RecommendedCard className="desktop-only" onClick={() => navigate('/workouts/novo')}>
          <div className="image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600)' }} />
          <div className="tag">CARDIO</div>
          <div className="content">
            <Typography.Small>Queima • 30min</Typography.Small>
            <h4 style={{ marginTop: '8px', fontSize: '18px' }}>HIIT Queima Intensa</h4>
          </div>
        </RecommendedCard>
      </RecommendationsGrid>


      <ChallengeCard>
        <div>
          <h3>Desafio Semanal</h3>
          <p>Complete 5 treinos esta semana e ganhe um badge exclusivo!</p>
        </div>
        <IconBtn style={{ backgroundColor: '#fff', color: '#000', width: '50px', height: '50px' }}><FiChevronRight size={24} /></IconBtn>
      </ChallengeCard>

      <SectionHeader>
        <Typography.H2>Dicas e Artigos</Typography.H2>
        <Typography.Small style={{ color: 'var(--primary)', cursor: 'pointer' }}>Ver tudo</Typography.Small>
      </SectionHeader>

      <ArticlesGrid>
        <ArticleCard>
          <div className="thumb" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400)' }} />
          <div>
            <Typography.Small style={{ color: 'var(--secondary)' }}>NUTRIÇÃO</Typography.Small>
            <h4 style={{ margin: '8px 0', fontSize: '18px' }}>10 alimentos para ganhar massa</h4>
            <Typography.Small>5 min de leitura</Typography.Small>
          </div>
        </ArticleCard>
        <ArticleCard>
          <div className="thumb" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1512433990210-91745785cc6a?w=400)' }} />
          <div>
            <Typography.Small style={{ color: 'var(--primary)' }}>RECUPERAÇÃO</Typography.Small>
            <h4 style={{ margin: '8px 0', fontSize: '18px' }}>A importância do sono no treino</h4>
            <Typography.Small>8 min de leitura</Typography.Small>
          </div>
        </ArticleCard>
      </ArticlesGrid>
    </AppShell>
  );
};

export default Home;
