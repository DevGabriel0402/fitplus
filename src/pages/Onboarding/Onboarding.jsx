import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { BotaoPrimario } from '../../ui/components/BaseUI';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.bg};
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const SkipButton = styled.button`
  position: absolute;
  top: 50px;
  right: 20px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  z-index: 100;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  padding: 8px 16px;
  background: rgba(0,0,0,0.2);
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

const SlideContent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ImageContainer = styled.div`
  flex: 1.2;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, ${({ theme }) => theme.colors.bg} 100%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 30%;
    background: linear-gradient(0deg, ${({ theme }) => theme.colors.bg} 10%, transparent 100%);
  }
`;

const Information = styled.div`
  flex: 1;
  padding: 0 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.bg};
  z-index: 5;
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.1;
  
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 300px;
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;

  .swiper-pagination-bullet {
    background: ${({ theme }) => theme.colors.border};
    opacity: 1;
    width: 8px;
    height: 8px;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background: ${({ theme }) => theme.colors.primary};
    width: 28px;
    border-radius: 4px;
  }
`;

const Controls = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const slides = [
  {
    title: "Encontre seu <span>Treino</span>",
    description: "Milhares de exercícios e rotinas personalizadas para o seu objetivo.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
  },
  {
    title: "Acompanhe seu <span>Progresso</span>",
    description: "Veja seus ganhos e estatísticas em tempo real com gráficos detalhados.",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80"
  },
  {
    title: "Comunidade <span>FITBODY</span>",
    description: "Compartilhe suas conquistas e motive-se com outros atletas.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80"
  },
  {
    title: "Pronto para <span>Começar?</span>",
    description: "Sua jornada fitness começa agora. Vamos transformar suor em resultados!",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
  }
];

const Onboarding = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (activeIndex === slides.length - 1) {
      navigate('/login');
    } else {
      swiperRef.current?.swiper.slideNext();
    }
  };

  const handleSkip = () => navigate('/login');

  return (
    <Container>
      <SkipButton onClick={handleSkip}>Pular</SkipButton>

      <StyledSwiper
        ref={swiperRef}
        modules={[Pagination, Autoplay, EffectFade]}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <SlideContent>
              <ImageContainer style={{ backgroundImage: `url(${slide.image})` }} />
              <Information>
                <Title dangerouslySetInnerHTML={{ __html: slide.title }} />
                <Description>{slide.description}</Description>

                <Controls>
                  <BotaoPrimario onClick={handleNext}>
                    {activeIndex === slides.length - 1 ? "Começar Agora" : "Próximo"}
                    <FiChevronRight size={22} />
                  </BotaoPrimario>
                </Controls>
              </Information>
            </SlideContent>
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </Container>
  );
};

export default Onboarding;
