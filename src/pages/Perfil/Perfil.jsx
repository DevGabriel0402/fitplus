import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiHeart, FiShield, FiSettings, FiHelpCircle, FiLogOut, FiChevronRight, FiEdit2 } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { useUsuario } from '../../hooks/useUsuario';
import { deslogar } from '../../firebase/auth';

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 20px;
`;

const AvatarContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--surface);
  border: 4px solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 15px;

  svg::nth-child(1) { font-size: 40px; color: var(--muted); }
  svg::nth-child(2) { font-size: 15px; color: var(--muted); }
`;

const EditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 3px solid var(--bg);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  width: 100%;
  margin: 20px 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);

  .value { font-weight: 800; font-size: 18px; color: var(--primary); }
  .label { font-size: 12px; color: var(--muted); margin-top: 4px; }
`;

const MenuList = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--card);
  border-radius: 12px;
  margin-bottom: 10px;
  border: 1px solid var(--border);
  cursor: pointer;

  .main { display: flex; align-items: center; gap: 12px; font-weight: 500; }
  svg { font-size: 20px; }
`;

const Perfil = () => {
    const { dados, carregando } = useUsuario();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await deslogar();
        navigate('/login');
    };

    if (carregando) return <div style={{ color: 'white', padding: '20px' }}>Carregando...</div>;

    return (
        <AppShell>
            <Container>
                <ProfileHeader>
                    <AvatarContainer>
                        <FiUser size={40} />
                        <EditButton size={15} onClick={() => navigate('/perfil/editar')}><FiEdit2 /></EditButton>
                    </AvatarContainer>
                    <Typography.H2>{dados?.nome || 'Atleta'}</Typography.H2>
                    <Typography.Small>{dados?.email}</Typography.Small>

                    <StatsGrid>
                        <StatItem>
                            <span className="value">{dados?.peso || '--'}</span>
                            <span className="label">{dados?.unidadePeso || 'kg'}</span>
                        </StatItem>
                        <StatItem>
                            <span className="value">{dados?.idade || '--'}</span>
                            <span className="label">Anos</span>
                        </StatItem>
                        <StatItem>
                            <span className="value">{dados?.altura || '--'}</span>
                            <span className="label">{dados?.unidadeAltura || 'cm'}</span>
                        </StatItem>
                    </StatsGrid>
                </ProfileHeader>

                <MenuList>
                    <MenuItem onClick={() => navigate('/perfil/editar')}>
                        <div className="main"><FiUser /> Meu Perfil</div>
                        <FiChevronRight color="var(--muted)" />
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/favoritos')}>
                        <div className="main"><FiHeart /> Favoritos</div>
                        <FiChevronRight color="var(--muted)" />
                    </MenuItem>
                    <MenuItem>
                        <div className="main"><FiShield /> Privacidade</div>
                        <FiChevronRight color="var(--muted)" />
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/perfil/ajustes')}>
                        <div className="main"><FiSettings /> Ajustes</div>
                        <FiChevronRight color="var(--muted)" />
                    </MenuItem>

                    <MenuItem>
                        <div className="main"><FiHelpCircle /> Ajuda</div>
                        <FiChevronRight color="var(--muted)" />
                    </MenuItem>
                    <MenuItem onClick={handleLogout} style={{ border: '1px solid rgba(255, 95, 95, 0.2)' }}>
                        <div className="main" style={{ color: '#ff5f5f' }}><FiLogOut /> Sair da Conta</div>
                    </MenuItem>
                </MenuList>
            </Container>
        </AppShell>
    );
};

export default Perfil;
