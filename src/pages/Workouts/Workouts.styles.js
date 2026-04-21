import styled, { css } from 'styled-components';

export const PageContainer = styled.div`
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-in-out;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const SectionTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textMain};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const SectionSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.875rem;
  font-weight: 500;
`;

// Formulários
export const PrimaryButton = styled.button`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.textMain};
  color: #fff;
  padding: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  font-weight: 900;
  font-size: 1.125rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: #1e293b; // slate-800
  }
  &:active {
    transform: scale(0.98);
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  select {
    width: 100%;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.borderDark};
    border-radius: ${({ theme }) => theme.borderRadius['2xl']};
    background-color: #fff;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textMuted};
    appearance: none;
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    &:focus {
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

export const CardSelect = styled.label`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ $active, theme }) => $active ? theme.colors.primaryLight : '#fff'};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ $active, theme }) => !$active && theme.colors.borderDark};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const RadioCircle = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primaryHover : theme.colors.textLight};
  background-color: ${({ $active, theme }) => $active ? theme.colors.primaryHover : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;

  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    background-color: #fff;
    border-radius: 50%;
    display: ${({ $active }) => $active ? 'block' : 'none'};
  }
`;

export const CardTitle = styled.span`
  font-weight: 700;
  color: ${({ $active, theme }) => $active ? '#4c1d95' : theme.colors.textMain}; 
`;

export const CardDesc = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 0.25rem;
  margin-left: 2rem;
`;

export const PillButton = styled.button`
  flex: 1;
  min-width: calc(33.33% - 0.5rem);
  padding: 0.75rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  border: 1px solid ${({ $active, theme }) => $active ? 'transparent' : theme.colors.borderDark};
  
  ${({ $active, theme }) => $active ? css`
    background-color: ${theme.colors.primaryHover};
    color: #fff;
    box-shadow: ${theme.shadows.md};
    transform: scale(1.02);
  ` : css`
    background-color: #fff;
    color: ${theme.colors.textMuted};
    &:hover { background-color: ${theme.colors.background}; }
  `}

  @media (max-width: 380px) {
    min-width: calc(50% - 0.5rem);
    font-size: 0.7rem;
  }
`;

export const HeaderBoard = styled.header`
  background-color: #fff;
  padding: 2.5rem 1.5rem 2rem;
  border-radius: 0 0 2.5rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.03);
  margin-bottom: 1.5rem;
`;

export const ExerciseCard = styled.div`
  background-color: #fff;
  border-radius: 2rem;
  padding: 1.25rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SetRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ $checked, theme }) => $checked ? '#ddd6fe' : theme.colors.border};
  background-color: ${({ $checked }) => $checked ? 'rgba(237, 233, 254, 0.5)' : '#fff'};
  
  &:hover {
    border-color: ${({ $checked, theme }) => !$checked && theme.colors.borderDark};
  }
`;

export const DayButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 68px;
  padding: 0.6rem;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all 0.2s;
  border: 2px solid ${({ $active, theme }) => $active ? theme.colors.primaryHover : 'transparent'};
  background-color: ${({ $active, theme }) => $active ? theme.colors.primaryHover : '#fff'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textMuted};
  box-shadow: ${({ $active, theme }) => $active ? theme.shadows.primary : 'none'};
  
  &:hover {
    background-color: ${({ $active, theme }) => !$active && theme.colors.border};
  }

  @media (max-width: 480px) {
    min-width: 60px;
    padding: 0.5rem;
  }
`;

export const GifImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
`;
