import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LuActivity, LuBookmark, LuUser, LuMenu, LuShieldAlert } from 'react-icons/lu';

import { useAuth } from '../../contexts/AuthContexto';
import { Sidebar } from './Sidebar';
import { Container, MobileWrapper, ContentArea, TabBarContainer, TabItem, TabIconWrapper, TabLabel } from './AppShell.styles';
import { motion, AnimatePresence } from 'framer-motion';

export const AppShell = ({ children, hideTabbar = false }) => {
  const { dadosUsuario } = useAuth();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = React.useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 600); // Curto loading para sensação de app nativo
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Mapping paths to simulate the Gym App UI tabs
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/workouts') || path.includes('/execucao')) return 'treinos';
    if (path.includes('/favoritos') || path.includes('/treinos-salvos')) return 'salvos';
    if (path.includes('/perfil')) return 'perfil';
    if (path.includes('/home') || path.includes('/nutricao') || path.includes('/progresso')) return 'menu';
    if (path.includes('/admin')) return 'admin';
    return 'treinos';
  };

  const activeTab = getActiveTab();

  return (
    <Container>
      <Sidebar activeTab={activeTab} />
      
      <MobileWrapper>
        <ContentArea>
          <AnimatePresence mode="wait">
            {isPageLoading && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '3px',
                  backgroundColor: 'var(--primary)',
                  zIndex: 9999,
                  boxShadow: '0 0 10px var(--primary)'
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '100%' }}
          >
            {children}
          </motion.div>
        </ContentArea>

        {!hideTabbar && (
          <TabBarContainer>
            <TabItem to="/workouts" className={activeTab === 'treinos' ? 'active' : ''}>
              <TabIconWrapper><LuActivity /></TabIconWrapper>
              <TabLabel>Treino</TabLabel>
            </TabItem>
            
            <TabItem to="/favoritos" className={activeTab === 'salvos' ? 'active' : ''}>
              <TabIconWrapper><LuBookmark /></TabIconWrapper>
              <TabLabel>Salvos</TabLabel>
            </TabItem>
            
            <TabItem to="/perfil" className={activeTab === 'perfil' ? 'active' : ''}>
              <TabIconWrapper><LuUser /></TabIconWrapper>
              <TabLabel>Perfil</TabLabel>
            </TabItem>

            <TabItem to="/home" className={activeTab === 'menu' ? 'active' : ''}>
              <TabIconWrapper><LuMenu /></TabIconWrapper>
              <TabLabel>Menu</TabLabel>
            </TabItem>

            {dadosUsuario?.role?.toLowerCase() === 'admin' && (
              <TabItem to="/admin" className={activeTab === 'admin' ? 'active' : ''}>
                <TabIconWrapper><LuShieldAlert /></TabIconWrapper>
                <TabLabel>Admin</TabLabel>
              </TabItem>
            )}
          </TabBarContainer>
        )}
      </MobileWrapper>
    </Container>
  );
};
