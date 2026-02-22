import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { BotaoPrimario } from '../../ui/components/BaseUI';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: var(--bg);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SkipButton = styled.button`
  position: absolute;
  top: 50px;
  right: 20px;
  color: var(--muted);
  font-size: 16px;
  z-index: 10;
`;

const ImageContainer = styled.div`
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    background: linear-gradient(0deg, var(--bg) 0%, transparent 100%);
  }
`;

const Content = styled.div`
  padding: 0 30px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 15px;
  color: var(--text);
`;

const Description = styled.p`
  font-size: 16px;
  color: var(--muted);
  line-height: 1.5;
  margin-bottom: 40px;
`;

const IndicatorGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
`;

const Dot = styled.div`
  width: ${({ active }) => (active ? '24px' : '8px')};
  height: 8px;
  background-color: ${({ active }) => (active ? 'var(--primary)' : 'var(--border)')};
  border-radius: 4px;
  transition: all 0.3s ease;
`;

const slides = [
    {
        title: "Encontre seu Treino",
        description: "Milhares de exercícios e rotinas personalizadas para o seu objetivo.",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
    },
    {
        title: "Acompanhe seu Progresso",
        description: "Veja seus ganhos e estatísticas em tempo real com gráficos detalhados.",
        image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80"
    },
    {
        title: "Comunidade FITBODY",
        description: "Compartilhe suas conquistas e motive-se com outros atletas.",
        image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80"
    },
    {
        title: "Pronto para Começar?",
        description: "Sua jornada fitness começa agora. Vamos transformar suor em resultados!",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    }
];

const Onboarding = () => {
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (current === slides.length - 1) {
            navigate('/login');
        } else {
            setCurrent(current + 1);
        }
    };

    const handleSkip = () => navigate('/login');

    return (
        <Container>
            <SkipButton onClick={handleSkip}>Skip</SkipButton>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                >
                    <ImageContainer style={{ backgroundImage: `url(${slides[current].image})` }} />

                    <Content>
                        <Title>{slides[current].title}</Title>
                        <Description>{slides[current].description}</Description>

                        <IndicatorGroup>
                            {slides.map((_, i) => (
                                <Dot key={i} active={i === current} />
                            ))}
                        </IndicatorGroup>

                        <BotaoPrimario onClick={handleNext}>
                            {current === slides.length - 1 ? "Get Started" : "Next"}
                            <FiChevronRight size={20} />
                        </BotaoPrimario>
                    </Content>
                </motion.div>
            </AnimatePresence>
        </Container>
    );
};

export default Onboarding;
