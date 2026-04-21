import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.main};
  color: ${({ theme }) => theme.colors.textMain};
  display: flex;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-start;
    align-items: stretch;
  }
`;

export const MobileWrapper = styled.div`
  width: 100%;
  max-width: 480px; /* Slightly wider than gym-app 448px */
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.surface};
  min-height: 100vh;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  position: relative;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    max-width: 100%;
    margin: 0;
    flex-direction: row;
    box-shadow: none;
    background-color: transparent;
  }
`;

export const ContentArea = styled.main`
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 6rem;
  background-color: ${({ theme }) => theme.colors.surface};

  @media (min-width: 768px) {
    padding-bottom: 0;
    padding: 2rem;
    border-radius: 2rem 0 0 2rem;
    box-shadow: ${({ theme }) => theme.shadows.xl};
    margin: 1rem 1rem 1rem 0;
    height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
  }
`;

export const TabBarContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-around;
  padding: 0.5rem;
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.03);
  z-index: 50;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const TabItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  transition: all 0.3s;
  width: 5rem;
  
  color: ${({ theme }) => theme.colors.textLight};

  &.active {
    color: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-4px);
    
    div {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  }

  &:hover:not(.active) {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const TabIconWrapper = styled.div`
  padding: 0.375rem;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: 0.25rem;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 24px;
  }
`;

export const TabLabel = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
`;

// --- SIDEBAR STYLES ---

export const SidebarContainer = styled.aside`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    flex-direction: column;
    width: 280px;
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 2rem;
    position: sticky;
    top: 0;
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 0 1rem;
`;

export const SidebarLogo = styled.div`
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.primaryHover};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 900;
  font-size: 20px;
`;

export const SidebarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  letter-spacing: -0.5px;
`;

export const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s;
  text-decoration: none;

  svg {
    font-size: 24px;
    transition: transform 0.2s;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primaryHover};
    
    svg {
      transform: scale(1.1);
    }
  }

  &:hover:not(.active) {
    background-color: rgba(0, 0, 0, 0.03);
    color: ${({ theme }) => theme.colors.textMain};
  }
`;

export const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
