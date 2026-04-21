import React from 'react';
import styled from 'styled-components';
import { FiAlertCircle, FiTrash2, FiHelpCircle } from 'react-icons/fi';
import { BotaoPrimario, BotaoSecundario, Typography, Flex } from './BaseUI';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  padding: 20px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: ${({ theme }) => theme.radius?.large || '20px'};
  padding: 30px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${(props) => props.$isDestructive ? 'rgba(255, 95, 95, 0.1)' : 'rgba(108, 71, 255, 0.1)'};
  color: ${(props) => props.$isDestructive ? '#8A2BE2' : 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 20px auto;
`;

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <ModalOverlay onClick={onCancel}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <IconWrapper $isDestructive={isDestructive}>
                    {isDestructive ? <FiTrash2 /> : <FiHelpCircle />}
                </IconWrapper>

                <Typography.H2 style={{ marginBottom: '10px' }}>{title}</Typography.H2>
                <Typography.Body style={{ marginBottom: '25px', opacity: 0.8 }}>
                    {message}
                </Typography.Body>

                <Flex $gap="12px" style={{ marginTop: '10px' }}>
                    <BotaoSecundario onClick={onCancel} style={{ flex: 1, height: '48px', fontSize: '15px' }}>
                        {cancelText}
                    </BotaoSecundario>
                    <BotaoPrimario
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        style={{
                            flex: 1,
                            height: '48px',
                            fontSize: '15px',
                            backgroundColor: isDestructive ? '#8A2BE2' : 'var(--primary)',
                            boxShadow: isDestructive ? '0 8px 16px rgba(255, 95, 95, 0.2)' : '0 8px 16px rgba(108, 71, 255, 0.2)'
                        }}
                    >
                        {confirmText}
                    </BotaoPrimario>
                </Flex>
            </ModalContent>
        </ModalOverlay>
    );
};
