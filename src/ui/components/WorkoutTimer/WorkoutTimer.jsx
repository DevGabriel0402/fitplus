import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiClock, FiPlay, FiPause, FiRotateCcw, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Flex, Card, BotaoPrimario } from '../BaseUI';

const TimerOverlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const TimerModal = styled(motion.create(Card))`
  width: 100%;
  max-width: 400px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 30px;
  position: relative;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10;
`;

const CircularContainer = styled.div`
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
`;

const SVG = styled.svg`
  position: absolute;
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: var(--surface);
  stroke-width: 8;
`;

const CircleProgress = styled(motion.circle)`
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
`;

const TimeDisplay = styled.div`
  text-align: center;
  z-index: 2;
  
  .time {
    font-size: 48px;
    font-weight: 800;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  
  .label {
    font-size: 14px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: -5px;
  }
`;

const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  margin-top: 20px;
`;

const PresetButton = styled.button`
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: var(--primary);
    color: #000;
  }
  
  ${props => props.$active && `
    background: var(--primary);
    color: #000;
    border-color: var(--primary);
  `}
`;

const Controls = styled(Flex)`
  margin-top: 30px;
  width: 100%;
`;

const ControlAction = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$primary ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.$primary ? '#000' : 'var(--text)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.9);
  }
`;

const WorkoutTimer = ({ isOpen, onClose, defaultSeconds = 60, autoStart = false, isMandatory = false, timerKey = null }) => {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [totalTime, setTotalTime] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Carregar som de término solicitado pelo usuário
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/946/946-preview.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Verificar se há um timer pausado/em andamento para este key
      const savedExpiry = timerKey ? localStorage.getItem(timerKey) : null;
      const savedTotal = timerKey ? localStorage.getItem(timerKey + '_total') : null;

      if (savedExpiry) {
        const expiry = parseInt(savedExpiry);
        const remaining = Math.round((expiry - Date.now()) / 1000);

        if (remaining > 0) {
          setTimeLeft(remaining);
          setTotalTime(Number(savedTotal) || defaultSeconds);
          if (autoStart) setIsRunning(true);
        } else {
          // Já expirou, limpar e usar padrão
          if (timerKey) {
            localStorage.removeItem(timerKey);
            localStorage.removeItem(timerKey + '_total');
          }
          setTimeLeft(defaultSeconds);
          setTotalTime(defaultSeconds);
          if (autoStart) setIsRunning(true);
        }
      } else {
        // Fluxo normal (novo timer)
        setTimeLeft(defaultSeconds);
        setTotalTime(defaultSeconds);
        if (autoStart) {
          setIsRunning(true);
          if (timerKey) {
            localStorage.setItem(timerKey, (Date.now() + defaultSeconds * 1000).toString());
            localStorage.setItem(timerKey + '_total', defaultSeconds.toString());
          }
        }
      }
    } else {
      setIsRunning(false);
    }
  }, [isOpen, autoStart, defaultSeconds, timerKey]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);

      if (timerKey) {
        localStorage.removeItem(timerKey);
        localStorage.removeItem(timerKey + '_total');
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => {
          console.error('Audio play failed', e);
          // Fallback simple beep if audio context is blocked
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        });
      }

      if (typeof window.navigator.vibrate === 'function') {
        window.navigator.vibrate([200, 100, 200]);
      }

      // Se for obrigatório, fecha automaticamente após 1 segundo (tempo do bip terminar)
      if (isMandatory) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
  };

  const handlePreset = (seconds) => {
    setIsRunning(false);
    setTotalTime(seconds);
    setTimeLeft(seconds);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? (timeLeft / totalTime) * circumference : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <TimerOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <TimerModal
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isMandatory && <CloseButton onClick={onClose}><FiX size={24} /></CloseButton>}

          <Typography.H2 style={{ margin: 0 }}>Temporizador</Typography.H2>
          <Typography.Small style={{ color: 'var(--muted)' }}>complete o tempo de descanso da serie</Typography.Small>

          <CircularContainer>
            <SVG viewBox="0 0 200 200">
              <CircleBackground cx="100" cy="100" r={radius} />
              <CircleProgress
                cx="100" cy="100" r={radius}
                initial={{ strokeDasharray: circumference }}
                animate={{ strokeDasharray: circumference, strokeDashoffset: circumference - progress }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </SVG>
            <TimeDisplay>
              <FiClock size={20} color="var(--primary)" style={{ marginBottom: '8px' }} />
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="label">Restante</div>
            </TimeDisplay>
          </CircularContainer>

          {/* Presets removed for students as per mandatory configuration rules */}

          <Controls $justify="center" $gap="30px">
            {!isMandatory && (
              <ControlAction onClick={resetTimer}>
                <FiRotateCcw />
              </ControlAction>
            )}

            {!isMandatory && (
              <ControlAction $primary onClick={toggleTimer} disabled={isMandatory && isRunning}>
                {isRunning ? <FiPause /> : <FiPlay style={{ marginLeft: '4px' }} />}
              </ControlAction>
            )}
          </Controls>

          {!isMandatory && (
            <BotaoPrimario onClick={onClose} style={{ marginTop: '30px', backgroundColor: 'var(--surface)', color: 'var(--text)', boxShadow: 'none' }}>
              Fechar
            </BotaoPrimario>
          )}
        </TimerModal>
      </TimerOverlay>
    </AnimatePresence>
  );
};

export default WorkoutTimer;
