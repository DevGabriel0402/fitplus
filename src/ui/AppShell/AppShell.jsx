import React from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { FiHome, FiActivity, FiStar, FiBell, FiUser, FiSearch, FiLogOut, FiBookOpen, FiShield } from 'react-icons/fi';

import * as IconsFa from 'react-icons/fa';
const { FaDumbbell } = IconsFa;
import { deslogar } from '../../firebase/auth';
import { useAuth } from '../../contexts/AuthContexto';

import { useAjustes } from '../../contexts/AjustesContexto';

const ShellContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TopBar = styled.header`
  width: 100%;
  height: 60px;
  background-color: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px;
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    height: 100px;
    padding: 15px;
  }
`;

const TopBarLogo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TopBarBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.1);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 40px;
  padding-left: 10px;
`;

const SidebarNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--muted);
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background-color: var(--card);
    color: var(--primary);
  }

  &:hover:not(.active) {
    background-color: rgba(0, 0, 0, 0.03);
  }

  svg { font-size: 20px; }
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  min-height: 100%;
  position: relative;
  
  /* Mantém o estilo "app" centralizado se for muito largo, mas mais generoso que 420px */
  @media (min-width: 768px) {
    padding: 20px;
  }
`;

const TabBarContainer = styled.nav`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: calc(70px + env(safe-area-inset-bottom));
    background-color: var(--surface);
    border-top: 1px solid var(--border);
    justify-content: space-around;
    align-items: center;
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 100;
  }
`;

const TabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted);
  font-size: 10px;
  gap: 4px;
  transition: all 0.2s;

  &.active {
    color: var(--primary);
  }

  svg {
    font-size: 24px;
  }
`;

export const AppShell = ({ children, hideTabbar = false }) => {
  const { ajustes } = useAjustes();
  const { usuario, dadosUsuario } = useAuth();
  const navigate = useNavigate();
  const SelectedIcon = (ajustes?.iconePainel && IconsFa[ajustes.iconePainel]) || IconsFa.FaDumbbell;

  const handleLogout = async () => {
    try {
      await deslogar();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const menuItems = [
    { to: "/home", icon: <FiHome />, label: "Home" },
    { to: "/workouts", icon: <FiActivity />, label: "Treinos" },
    { to: "/perfil", icon: <FiUser />, label: "Perfil" },
  ];

  if (dadosUsuario?.role?.toLowerCase() === 'admin') {
    menuItems.push({ to: "/admin", icon: <FiShield />, label: "Admin" });
  }




  return (
    <ShellContainer>
      <Sidebar>
        <Logo style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SelectedIcon /> {ajustes?.nomePainel || 'PERSONALPLUS'}
        </Logo>

        <SidebarNav>
          {menuItems.map(item => (
            <SidebarItem key={item.to} to={item.to}>
              {item.icon}
              <span>{item.label}</span>
            </SidebarItem>
          ))}
          <SidebarItem as="button" onClick={handleLogout} style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <FiLogOut />
            <span>Sair</span>
          </SidebarItem>
        </SidebarNav>
      </Sidebar>

      <ContentArea>
        <TopBar>
          <TopBarLogo to="/home">
            <SelectedIcon /> {ajustes?.nomePainel || 'FITBODY'}
          </TopBarLogo>


          <TopBarActions>
            <TopBarBtn onClick={() => navigate('/perfil')}><FiUser /></TopBarBtn>
            <TopBarBtn onClick={handleLogout} style={{ color: '#ff5f5f' }} title="Sair"><FiLogOut /></TopBarBtn>
          </TopBarActions>
        </TopBar>

        <ContentWrapper>
          {children}
        </ContentWrapper>
      </ContentArea>

      {!hideTabbar && (
        <TabBarContainer>
          {menuItems.map(item => (
            <TabItem key={item.to} to={item.to}>
              {item.icon}
              <span>{item.label}</span>
            </TabItem>
          ))}
        </TabBarContainer>
      )}
    </ShellContainer>
  );
};
