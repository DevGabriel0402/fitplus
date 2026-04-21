import React from 'react';
import { useAuth } from '../../contexts/AuthContexto';
import { LuActivity, LuBookmark, LuUser, LuMenu, LuShieldAlert } from 'react-icons/lu';
import { 
  SidebarContainer, 
  SidebarHeader, 
  SidebarLogo, 
  SidebarTitle, 
  SidebarNav, 
  SidebarItem, 
  SidebarFooter 
} from './AppShell.styles';

export const Sidebar = ({ activeTab }) => {
  const { dadosUsuario, deslogar } = useAuth();

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarLogo>F+</SidebarLogo>
        <SidebarTitle>FitPlus</SidebarTitle>
      </SidebarHeader>

      <SidebarNav>
        <SidebarItem to="/workouts" className={activeTab === 'treinos' ? 'active' : ''}>
          <LuActivity />
          Treino
        </SidebarItem>
        
        <SidebarItem to="/favoritos" className={activeTab === 'salvos' ? 'active' : ''}>
          <LuBookmark />
          Salvos
        </SidebarItem>
        
        <SidebarItem to="/perfil" className={activeTab === 'perfil' ? 'active' : ''}>
          <LuUser />
          Perfil
        </SidebarItem>

        <SidebarItem to="/home" className={activeTab === 'menu' ? 'active' : ''}>
          <LuMenu />
          Menu
        </SidebarItem>

        {dadosUsuario?.role?.toLowerCase() === 'admin' && (
          <SidebarItem to="/admin" className={activeTab === 'admin' ? 'active' : ''}>
            <LuShieldAlert />
            Admin
          </SidebarItem>
        )}
      </SidebarNav>

      <SidebarFooter>
        <SidebarItem as="button" onClick={deslogar} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          Sair da Conta
        </SidebarItem>
      </SidebarFooter>
    </SidebarContainer>
  );
};
