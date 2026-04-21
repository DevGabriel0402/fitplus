import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { LuBookmark, LuActivity, LuHeart } from 'react-icons/lu';
import { AppShell } from '../../ui/AppShell/AppShell';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import { PageContainer, SectionTitle, SectionSubtitle, PrimaryButton } from '../Workouts/Workouts.styles';

const TabsWrapper = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: 25px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryLight : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primaryHover : theme.colors.textMuted)};
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
`;

const ContentCard = styled.div`
  background-color: #fff;
  padding: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius['3xl']};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1rem;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const Favoritos = () => {
    const [tabAtiva, setTabAtiva] = useState('Treinos');
    const { usuario } = useAuth();
    
    // Puxando Treinos Gerados
    const { documentos: treinos, carregando: carregandoTreinos } = useColecao(`treinos/${usuario?.uid}/lista`);
    // Puxando Favoritos do App original (artigos, treinos avulsos)
    const { documentos: favoritos, carregando: carregandoFavs } = useColecao(`favoritos/${usuario?.uid}/itens`);
    
    const navigate = useNavigate();

    const tabs = ['Treinos', 'Artigos Favoritos'];

    const renderTreinosGerados = () => {
        if (carregandoTreinos) return <div>Carregando...</div>;
        if (!treinos || treinos.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#fff', borderRadius: '1.5rem', border: `1px dashed #e2e8f0` }}>
                   <LuBookmark size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                   <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum treino salvo</h3>
                   <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Gere treinos na aba Treino para vê-los aqui.</p>
                </div>
            )
        }

        return treinos.map(w => (
            <ContentCard key={w.id} onClick={() => navigate('/workouts')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Treino Ativo</span>
                        <h3 style={{ fontWeight: 900, fontSize: '1.125rem' }}>{w.nomeTreino}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6d28d9', marginTop: '0.25rem' }}>Divisão {w.split} • Nível {w.nivel}</p>
                    </div>
                    <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        Ativo
                    </div>
                </div>
                <PrimaryButton style={{ padding: '0.75rem', fontSize: '0.875rem' }} onClick={(e) => { e.stopPropagation(); navigate('/workouts'); }}>
                    Acessar Rotina
                </PrimaryButton>
            </ContentCard>
        ));
    };

    const renderArtigosFavs = () => {
        if (carregandoFavs) return <div>Carregando...</div>;
        const apenasArtigos = favoritos.filter(f => f.tipo === 'artigo');

        if (apenasArtigos.length === 0) {
             return (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#fff', borderRadius: '1.5rem', border: `1px dashed #e2e8f0` }}>
                   <LuHeart size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                   <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Nenhum artigo</h3>
                   <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Favorite dicas e artigos para ler depois.</p>
                </div>
            )
        }

        return apenasArtigos.map(fav => (
             <ContentCard key={fav.id} onClick={() => navigate(fav.path)} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', backgroundColor: '#f1f5f9', backgroundImage: `url(${fav.image || fav.thumb})`, backgroundSize: 'cover' }}></div>
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>Artigo</span>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem', marginTop: '0.25rem' }}>{fav.titulo}</h3>
                </div>
             </ContentCard>
        ));
    };

    return (
        <AppShell>
            <PageContainer>
                <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                    <SectionTitle><LuBookmark color="#7c3aed" /> Meus Treinos</SectionTitle>
                    <SectionSubtitle>Sua biblioteca de rotinas e conteúdos salvos.</SectionSubtitle>
                </div>

                <TabsWrapper>
                    {tabs.map(tab => (
                        <Tab
                            key={tab}
                            $active={tabAtiva === tab}
                            onClick={() => setTabAtiva(tab)}
                        >
                            {tab}
                        </Tab>
                    ))}
                </TabsWrapper>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {tabAtiva === 'Treinos' ? renderTreinosGerados() : renderArtigosFavs()}
                </div>
            </PageContainer>
        </AppShell>
    );
};

export default Favoritos;
