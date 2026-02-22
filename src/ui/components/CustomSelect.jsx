import React, { useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Container = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 20px;
`;

const Header = styled.div`
  width: 100%;
  height: 56px;
  background-color: var(--card);
  border: 1px solid ${({ $isOpen }) => ($isOpen ? 'var(--primary)' : 'var(--border)')};
  border-left: 4px solid ${({ $isOpen }) => ($isOpen ? 'var(--primary)' : 'var(--border)')};
  border-radius: 12px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Value = styled.span`
  color: var(--text);
  font-size: 16px;
  font-weight: 500;
`;

const Dropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-top: 8px;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
`;

const Option = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--text)')};
  background-color: ${({ $active }) => ($active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent')};

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;


const CustomSelect = ({ label, value, options, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options?.find(opt => opt.value === value);


  return (
    <Container>
      {label && <Label>{label}</Label>}
      <Header $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <Value>{selectedOption ? selectedOption.label : placeholder}</Value>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <FiChevronDown color="var(--muted)" />
        </motion.div>
      </Header>

      <AnimatePresence>
        {isOpen && (
          <Dropdown
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((opt) => (
              <Option
                key={opt.value}
                $active={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
                {opt.value === value && <FiCheck size={18} />}
              </Option>
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default CustomSelect;
