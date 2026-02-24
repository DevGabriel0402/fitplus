import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiHome, FiActivity, FiStar, FiBell, FiUser } from 'react-icons/fi';
import * as IconsFa from 'react-icons/fa';
import { FaDumbbell } from 'react-icons/fa';

import { useAjustes } from '../../contexts/AjustesContexto';

const ShellContainer = styled.div`

  display: flex;
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  const SelectedIcon = (ajustes?.iconePainel && IconsFa[ajustes.iconePainel]) || IconsFa.FaDumbbell;


  const menuItems = [
    { to: "/home", icon: <FiHome />, label: "Home" },
    { to: "/workouts", icon: <FiActivity />, label: "Treinos" },
    { to: "/perfil", icon: <FiUser />, label: "Perfil" },
  ];


  return (
    <ShellContainer>
      <Sidebar>
        <Logo style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SelectedIcon /> {ajustes?.nomePainel || 'FITBODY'}
        </Logo>


        <SidebarNav>
          {menuItems.map(item => (
            <SidebarItem key={item.to} to={item.to}>
              {item.icon}
              <span>{item.label}</span>
            </SidebarItem>
          ))}
        </SidebarNav>
      </Sidebar>

      <ContentArea>
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
