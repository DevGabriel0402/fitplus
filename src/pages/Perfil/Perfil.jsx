import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { LuUser, LuInfo, LuActivity, LuScale, LuSettings, LuShield, LuHeart, LuLogOut, LuChevronRight } from 'react-icons/lu';
import { AppShell } from '../../ui/AppShell/AppShell';
import { useAuth } from '../../contexts/AuthContexto';
import { useUsuario } from '../../hooks/useUsuario';
import { deslogar } from '../../firebase/auth';
import { PageContainer, SectionTitle, SectionSubtitle } from '../Workouts/Workouts.styles';

const MenuList = styled.div`
  width: 100%;
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background-color: #fff;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderDark};
  }

  .main { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: ${({ theme }) => theme.colors.textMain}; }
  svg { font-size: 1.25rem; color: ${({ theme }) => theme.colors.textLight}; }
`;

const Perfil = () => {
    const { dados, carregando } = useUsuario();
    const { usuario, dadosUsuario } = useAuth();
    const navigate = useNavigate();

    const imcData = useMemo(() => {
        const w = parseFloat(dados?.peso);
        const h = parseFloat(dados?.altura);
        if (!w || !h) return { value: 0, text: 'N/A', bg: '#e2e8f0', color: '#64748b' };
        
        let heightMeters = h > 3 ? h / 100 : h;
        const imcValue = (w / (heightMeters * heightMeters)).toFixed(1);
        
        if (imcValue < 18.5) return { value: imcValue, text: 'Abaixo do peso', color: '#3b82f6', bg: '#dbeafe' };
        if (imcValue < 25) return { value: imcValue, text: 'Peso Normal', color: '#10b981', bg: '#d1fae5' };
        if (imcValue < 30) return { value: imcValue, text: 'Sobrepeso', color: '#f59e0b', bg: '#fef3c7' };
        return { value: imcValue, text: 'Obesidade', color: '#f43f5e', bg: '#ffe4e6' };
    }, [dados?.peso, dados?.altura]);

    const handleLogout = async () => {
        await deslogar();
        navigate('/login');
    };

    if (carregando) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;

    return (
        <AppShell>
            <PageContainer>
                <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
                    <div style={{ width: '6rem', height: '6rem', background: 'linear-gradient(to top right, #7c3aed, #f43f5e)', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', transform: 'rotate(3deg)', boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)' }}>
                    <LuUser size={40} color="#fff" style={{ transform: 'rotate(-3deg)' }} />
                    </div>
                    <SectionTitle style={{ justifyContent: 'center' }}>{dados?.nome?.split(' ')[0] || 'Atleta'}</SectionTitle>
                    <SectionSubtitle>{dados?.email}</SectionSubtitle>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '1.5rem', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                    <LuInfo color="#7c3aed" /> Ficha Pessoal
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '1rem', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Peso</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 900 }}>{dados?.peso || '--'} kg</span>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '1rem', textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Altura</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 900 }}>{dados?.altura || '--'} cm</span>
                        </div>
                        <button onClick={() => navigate('/perfil/editar')} style={{ gridColumn: 'span 2', padding: '0.75rem', backgroundColor: '#ede9fe', color: '#6d28d9', borderRadius: '1rem', fontWeight: 700, fontSize: '0.875rem' }}>
                            Atualizar Medidas
                        </button>
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                    <h2 style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                        <LuActivity color="#94a3b8" /> Seu IMC
                    </h2>
                    <div style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.05em' }}>{imcData.value}</div>
                    <div style={{ marginTop: '0.5rem', display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: imcData.bg, color: imcData.color }}>
                        {imcData.text}
                    </div>
                    </div>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: imcData.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LuScale size={40} color={imcData.color} />
                    </div>
                </div>

                <MenuList>
                    <MenuItem onClick={() => navigate('/perfil/ajustes')}>
                        <div className="main"><LuSettings /> Ajustes da Conta</div>
                        <LuChevronRight />
                    </MenuItem>
                    {dadosUsuario?.role?.toLowerCase() === 'admin' && (
                        <MenuItem onClick={() => navigate('/admin')}>
                            <div className="main"><LuShield /> Painel Administrativo</div>
                            <LuChevronRight />
                        </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout} style={{ border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        <div className="main" style={{ color: '#f43f5e' }}><LuLogOut /> Sair da Conta</div>
                    </MenuItem>
                </MenuList>

            </PageContainer>
        </AppShell>
    );
};

export default Perfil;
