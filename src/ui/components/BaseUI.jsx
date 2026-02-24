import styled from 'styled-components';

export const BotaoPrimario = styled.button`
  width: 100%;
  height: 56px;
  background-color: var(--primary);
  color: #fff;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 16px rgba(108, 71, 255, 0.2);

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const BotaoSecundario = styled.button`
  width: 100%;
  height: 56px;
  background-color: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const InputWrapper = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
`;

export const InputField = styled.input`
  width: 100%;
  height: 56px;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: 0 20px;
  color: var(--text);
  font-size: 16px;

  &:focus {
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--muted);
  }
`;

export const TextAreaField = styled.textarea`
  width: 100%;
  padding: 15px 20px;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: ${({ theme }) => theme.radius.medium};
  color: var(--text);
  font-size: 16px;
  min-height: 120px;
  resize: vertical;

  &:focus {
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--muted);
  }
`;


export const Card = styled.div`
  background-color: var(--card);
  border-radius: ${({ theme }) => theme.radius.medium};
  padding: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;



export const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

export const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $justify }) => $justify || 'flex-start'};
  gap: ${({ $gap }) => $gap || '10px'};
  flex-direction: ${({ $direction }) => $direction || 'row'};
`;


export const Typography = {
  H1: styled.h1`
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 10px;
  `,
  H2: styled.h2`
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  `,
  Body: styled.p`
    font-size: 16px;
    color: var(--muted);
    line-height: 1.5;
  `,
  Small: styled.span`
    font-size: 12px;
    color: var(--muted);
  `
};
