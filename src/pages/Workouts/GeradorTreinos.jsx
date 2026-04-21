import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiChevronLeft, FiCheck, FiLoader } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Typography, Container, BotaoPrimario, Flex } from '../../ui/components/BaseUI';
import { motion, AnimatePresence } from 'framer-motion';
import { useAjustes } from '../../contexts/AjustesContexto';
import toast from 'react-hot-toast';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 0 20px;
`;

const BackButton = styled.button`
  background: var(--surface);
  border: 1px solid var(--border);
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-size: 24px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const WizardContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px 40px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: var(--surface);
  border-radius: 4px;
  margin-bottom: 30px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--primary);
  width: ${(props) => props.$percentage}%;
  transition: width 0.3s ease;
`;

const StepIndicator = styled.div`
  font-size: 12px;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const OptionCard = styled(motion.button)`
  background-color: ${(props) => (props.$selected ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)')};
  border: 2px solid ${(props) => (props.$selected ? 'var(--primary)' : 'var(--border)')};
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  h4 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
    color: ${(props) => (props.$selected ? 'var(--primary)' : 'var(--text)')};
  }

  p {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.4;
  }

  .emoji {
    font-size: 28px;
    background: var(--card);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    flex-shrink: 0;
  }
  
  .check-icon {
     position: absolute;
     top: 20px;
     right: 20px;
     color: var(--primary);
     font-size: 20px;
     opacity: ${(props) => (props.$selected ? 1 : 0)};
     transform: ${(props) => (props.$selected ? 'scale(1)' : 'scale(0.5)')};
     transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

const GeneratingView = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  
  .loader-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
  }
  
  .loader-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05));
    animation: pulse 2s infinite ease-in-out;
  }
  
  .loader-icon {
    font-size: 48px;
    color: var(--primary);
    z-index: 10;
  }
  
  h2 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 15px;
    background: linear-gradient(135deg, var(--text), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--muted);
    line-height: 1.6;
    max-width: 80%;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

const GeradorTreinos = () => {
    const navigate = useNavigate();
    const { alunoId } = useParams();
    const { ajustes } = useAjustes();
    const { usuario } = useAuth();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selections, setSelections] = useState({
        objetivo: null,
        nivel: null,
        local: null,
        foco: null,
        descanso: 60,
        dias: [],
        series: 3
    });

    const totalSteps = 7;

    const stepsData = [
        {
            id: 1,
            name: 'Local e Equipamentos',
            key: 'local',
            title: 'Onde você costuma treinar?',
            subtitle: 'Definiremos os exercícios com base no que você tem disponível.',
            options: [
                { id: 'academia', emoji: '🏋️‍♀️', title: 'Academia Completa', desc: 'Acesso a máquinas, polias e pesos livres.' },
                { id: 'casa_pesos', emoji: '🏠', title: 'Em Casa (Com Pesos)', desc: 'Tenho alguns halteres e elásticos em casa.' },
                { id: 'casa_corpo', emoji: '🤸‍♂️', title: 'Em Casa (Peso do Corpo)', desc: 'Não possuo equipamentos, usarei apenas o peso corporal.' },
            ]
        },
        {
            id: 2,
            name: 'Quantidade de Séries',
            key: 'series',
            title: 'Quantas séries por exercício?',
            subtitle: 'Isso define o volume total do seu treino.',
            options: [
                { id: 2, emoji: '⚡', title: '2 Séries', desc: 'Treino rápido e focado.' },
                { id: 3, emoji: '💪', title: '3 Séries', desc: 'Volume padrão recomendado.' },
                { id: 4, emoji: '🔥', title: '4 Séries', desc: 'Foco em maior volume e exaustão.' },
            ]
        },
        {
            id: 3,
            name: 'Objetivo Principal',
            key: 'objetivo',
            title: 'Qual o seu objetivo atual?',
            subtitle: 'Isso nos ajuda a definir volume, intensidade e os melhores exercícios para você.',
            options: [
                { id: 'hipertrofia', emoji: '💪', title: 'Ganho de Massa', desc: 'Foco em hipertrofia muscular e volume.' },
                { id: 'emagrecimento', emoji: '🔥', title: 'Emagrecimento', desc: 'Circuitos aeróbicos e alta queima de calorias.' },
                { id: 'condicionamento', emoji: '🏃‍♂️', title: 'Condicionamento', desc: 'Melhorar a resistência cardiovascular e o fôlego.' },
                { id: 'manutencao', emoji: '⚖️', title: 'Manutenção', desc: 'Manter a forma atual e a saúde em dia.' },
            ]
        },
        {
            id: 4,
            name: 'Nível de Experiência',
            key: 'nivel',
            title: 'Qual seu nível atual de treino?',
            subtitle: 'Garante que os exercícios serão desafiadores, mas seguros.',
            options: [
                { id: 'iniciante', emoji: '🌱', title: 'Iniciante', desc: 'Nunca treinei ou estou voltando após muito tempo parado.' },
                { id: 'intermediario', emoji: '⚡', title: 'Intermediário', desc: 'Treino regularmente há alguns meses.' },
                { id: 'avancado', emoji: '🔥', title: 'Avançado', desc: 'Treino pesado há anos e tenho boa técnica.' },
            ]
        },
        {
            id: 5,
            name: 'Foco do Treino',
            key: 'foco',
            title: 'O que vamos treinar hoje?',
            subtitle: 'Escolha a ênfase principal do seu treino para selecionarmos os exercícios corretos.',
            options: [
                { id: 'corpo_todo', emoji: '🦍', title: 'Corpo Todo', desc: 'Um treino global que recruta o corpo inteiro.' },
                { id: 'superior', emoji: '💪', title: 'Membros Superiores', desc: 'Peito, Costas, Ombros e Braços.' },
                { id: 'inferior', emoji: '🦵', title: 'Membros Inferiores', desc: 'Pernas, Glúteos e Panturrilhas.' },
                { id: 'cardio', emoji: '🫀', title: 'Cardio / Abdômen', desc: 'Foco em suar a camisa e fortalecer o core.' },
                { id: 'peito', emoji: '🦅', title: 'Peito', desc: 'Foco isolado na musculatura peitoral.' },
                { id: 'costas', emoji: '🦇', title: 'Costas', desc: 'Dorsais, trapézio e lombar.' },
                { id: 'ombros', emoji: '🥥', title: 'Ombros', desc: 'Deltóides completos.' },
                { id: 'bíceps', emoji: '🦾', title: 'Bíceps', desc: 'Foco na parte frontal do braço.' },
                { id: 'tríceps', emoji: '🐎', title: 'Tríceps', desc: 'Foco na parte de trás do braço.' },
                { id: 'quadríceps', emoji: '🦵', title: 'Quadríceps', desc: 'Foco na parte anterior da coxa.' },
                { id: 'gluteos', emoji: '🍑', title: 'Glúteos e Posterior', desc: 'Cadeia posterior e glúteos.' },
                { id: 'pernas', emoji: '🦵', title: 'Pernas Completas', desc: 'Treino de perna inteiro.' },
            ]
        },
        {
            id: 6,
            name: 'Pausa de Descanso',
            key: 'descanso',
            title: 'Quanto tempo de descanso entre as séries?',
            subtitle: 'O temporizador será configurado automaticamente com este valor.',
            options: [
                { id: 30, emoji: '⏱️', title: '30 Segundos', desc: 'Foco em densidade e queima.' },
                { id: 45, emoji: '⏲️', title: '45 Segundos', desc: 'Equilíbrio clássico para hipertrofia.' },
                { id: 60, emoji: '🕕', title: '1 Minuto', desc: 'Recuperação padrão para força e volume.' },
                { id: 90, emoji: '⌛', title: '1.5 Minutos', desc: 'Foco em cargas mais pesadas.' },
            ]
        },
        {
            id: 7,
            name: 'Dias de Treino',
            key: 'dias',
            title: 'Para quais dias é este treino?',
            subtitle: 'O aluno verá este treino nos dias selecionados.',
            options: [
                { id: 'Seg', title: 'Segunda', desc: 'Treinar na Segunda' },
                { id: 'Ter', title: 'Terça', desc: 'Treinar na Terça' },
                { id: 'Qua', title: 'Quarta', desc: 'Treinar na Quarta' },
                { id: 'Qui', title: 'Quinta', desc: 'Treinar na Quinta' },
                { id: 'Sex', title: 'Sexta', desc: 'Treinar na Sexta' },
                { id: 'Sáb', title: 'Sábado', desc: 'Treinar no Sábado' },
                { id: 'Dom', title: 'Domingo', desc: 'Treinar no Domingo' },
            ]
        }
    ];

    const currentStepData = stepsData[step - 1];

    const handleSelect = (optionId) => {
        if (currentStepData.key === 'dias') {
            const currentDias = selections.dias || [];
            const novosDias = currentDias.includes(optionId)
                ? currentDias.filter(d => d !== optionId)
                : [...currentDias, optionId];
            setSelections({ ...selections, dias: novosDias });
        } else {
            setSelections({ ...selections, [currentStepData.key]: optionId });
        }
    };

    const nextStep = () => {
        if (currentStepData.key === 'dias' && (!selections.dias || selections.dias.length === 0)) {
            toast.error('Escolha pelo menos um dia');
            return;
        }
        if (currentStepData.key !== 'dias' && !selections[currentStepData.key]) {
            toast.error('Escolha uma opção para continuar');
            return;
        }

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            generateWorkout();
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigate(alunoId ? '/admin/usuarios' : '/workouts');
        }
    };

    const generateWorkout = async () => {
        setIsGenerating(true);

        try {
            if (!usuario) {
                toast.error('Usuário não autenticado.');
                setIsGenerating(false);
                return;
            }

            const targetUid = alunoId || usuario.uid;

            // Fetch exercises
            const exercisesSnapshot = await getDocs(collection(db, 'exercicios'));
            const allExercises = exercisesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (allExercises.length === 0) {
                toast.error('Nenhum exercício encontrado na biblioteca.');
                setIsGenerating(false);
                return;
            }

            // Filter by "local" (Equipment constraints)
            let availableExercises = allExercises;
            if (selections.local === 'casa_corpo') {
                availableExercises = availableExercises.filter(ex => ex.categoria?.toLowerCase().includes('sem equipamento') || ex.nome?.toLowerCase().includes('corporal') || ex.alvo?.toLowerCase().includes('corporal'));
            }

            // Filter by "foco" (Target muscle group)
            if (selections.foco === 'superior') {
                const superCats = ['peito', 'costas', 'ombros', 'bíceps', 'tríceps'];
                availableExercises = availableExercises.filter(ex => superCats.includes(ex.categoria?.toLowerCase()));
            } else if (selections.foco === 'inferior' || selections.foco === 'pernas') {
                const inferCats = ['pernas', 'quadríceps', 'panturrilha', 'glúteos'];
                availableExercises = availableExercises.filter(ex => inferCats.includes(ex.categoria?.toLowerCase()) || ex.alvo?.toLowerCase().includes('glúteo') || ex.alvo?.toLowerCase().includes('perna'));
            } else if (selections.foco === 'cardio') {
                const cardioCats = ['abdômen', 'outros', 'cardio'];
                availableExercises = availableExercises.filter(ex => cardioCats.includes(ex.categoria?.toLowerCase()) || ex.nome?.toLowerCase().includes('corrida') || ex.nome?.toLowerCase().includes('polichinelo'));
            } else if (selections.foco === 'gluteos') {
                availableExercises = availableExercises.filter(ex => ex.categoria?.toLowerCase() === 'glúteos' || ex.alvo?.toLowerCase().includes('glúteo') || ex.alvo?.toLowerCase().includes('posterior'));
            } else if (selections.foco !== 'corpo_todo') {
                // For specific single muscles: peito, costas, ombros, quadríceps, bíceps, tríceps
                availableExercises = availableExercises.filter(ex => ex.categoria?.toLowerCase().includes(selections.foco));
            }

            // Fallback if filters are way too strict
            if (availableExercises.length < 3) {
                availableExercises = allExercises;
                toast.error('Filtros muito restritos. Usando biblioteca geral.', { icon: '⚠️' });
            }

            // Define workout volume depending on level (e.g. at least 3 per muscle group for a standard workout)
            let numExercises = 10;
            if (selections.nivel === 'intermediario') numExercises = 12;
            if (selections.nivel === 'avancado') numExercises = 14;

            // Define series/reps depending on goal
            let seriesConfig = 3;
            let repsConfig = '10-15';

            switch (selections.objetivo) {
                case 'hipertrofia':
                    seriesConfig = 4;
                    repsConfig = '8-12';
                    break;
                case 'emagrecimento':
                    seriesConfig = 3;
                    repsConfig = '15-20';
                    break;
                case 'condicionamento':
                    seriesConfig = 3;
                    repsConfig = '12-15';
                    break;
                case 'manutencao':
                    seriesConfig = 3;
                    repsConfig = '10-12';
                    break;
                default:
                    break;
            }

            // Group exercises to guarantee variety
            const byCategory = {};
            availableExercises.forEach(ex => {
                const cat = ex.categoria || 'Outros';
                if (!byCategory[cat]) byCategory[cat] = [];
                byCategory[cat].push(ex);
            });

            const categories = Object.keys(byCategory);
            const selectedExercises = [];
            const usedExerciseIds = new Set();

            // Loop until we reach numExercises or run out of unique exercises
            let attempts = 0;
            while (selectedExercises.length < numExercises && attempts < 100) {
                // Shuffle categories to pick one from each sequentially
                const shuffledCats = [...categories].sort(() => Math.random() - 0.5);

                for (const cat of shuffledCats) {
                    if (selectedExercises.length >= numExercises) break;

                    // Only consider exercises from this category that we haven't picked yet
                    const catExs = byCategory[cat].filter(ex => !usedExerciseIds.has(ex.id));

                    if (catExs.length > 0) {
                        const randomEx = catExs[Math.floor(Math.random() * catExs.length)];
                        usedExerciseIds.add(randomEx.id);

                        selectedExercises.push({
                            ...randomEx,
                            instanceId: `${randomEx.id || Date.now()}-${Math.random()}-${selectedExercises.length}`,
                            series: (randomEx.categoria?.toLowerCase() === 'cardio' || randomEx.muscle?.toLowerCase() === 'cardio') ? 1 : (Number(selections.series) || 3),
                            reps: repsConfig,
                            peso: '',
                            descanso: Number(selections.descanso) || 60
                        });
                    }
                }
                attempts++;
            }

            // Workout Name based on Inputs
            const objLabel = stepsData[0].options.find(o => o.id === selections.objetivo)?.title || 'Gerado';
            const focoLabel = stepsData[3].options.find(o => o.id === selections.foco)?.title || 'Mix';
            const localFinal = selections.local === 'academia' ? 'Academia' : 'Casa';
            
            const novoTreinoConfig = {
                nomeTreino: `Treino IA - ${focoLabel} (${objLabel})`,
                exercicios: selectedExercises,
                dias: selections.dias || [],
                local: localFinal,
                criadoEm: serverTimestamp(),
                atualizadoEm: serverTimestamp(),
                usuarioId: targetUid,
                geradoPorIA: true
            };

            // Simulate the IA "thinking" delay for aesthetics
            await new Promise(resolve => setTimeout(resolve, 2000));

            await addDoc(collection(db, `treinos/${targetUid}/lista`), novoTreinoConfig);

            toast.success('Treino Mágico gerado e salvo!');
            navigate(alunoId ? '/admin/usuarios' : '/workouts');
        } catch (error) {
            console.error('Erro ao gerar treino:', error);
            toast.error('Ocorreu um erro ao gerar o treino.');
            setIsGenerating(false);
        }
    };

    return (
        <AppShell hideTabbar={true}>
            <Container style={{ paddingTop: '20px' }}>
                <Header>
                    <BackButton onClick={isGenerating ? null : prevStep}>
                        <FiChevronLeft />
                    </BackButton>
                    <Typography.H2 style={{ marginBottom: 0 }}>Gerador Inteligente</Typography.H2>
                </Header>

                <WizardContainer>
                    {isGenerating ? (
                        <GeneratingView
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="loader-wrapper">
                                <div className="loader-bg"></div>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                    <FiLoader className="loader-icon" />
                                </motion.div>
                            </div>
                            <h2>Montando o seu treino...</h2>
                            <p>Nossa IA está analisando suas respostas e separando os melhores exercícios para você arrasar.</p>
                        </GeneratingView>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StepIndicator>Etapa {step} de {totalSteps} — {currentStepData.name}</StepIndicator>
                                <ProgressBar>
                                    <ProgressFill $percentage={(step / totalSteps) * 100} />
                                </ProgressBar>

                                <Typography.H1 style={{ fontSize: '24px' }}>{currentStepData.title}</Typography.H1>
                                <Typography.Body style={{ marginBottom: '20px' }}>{currentStepData.subtitle}</Typography.Body>

                                <OptionGrid>
                                    {currentStepData.options.map((option) => (
                                        <OptionCard
                                            key={option.id}
                                            $selected={currentStepData.key === 'dias' ? (selections.dias || []).includes(option.id) : selections[currentStepData.key] === option.id}
                                            onClick={() => handleSelect(option.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="emoji">{option.emoji}</div>
                                            <div>
                                                <h4>{option.title}</h4>
                                                <p>{option.desc}</p>
                                            </div>
                                            <FiCheck className="check-icon" />
                                        </OptionCard>
                                    ))}
                                </OptionGrid>

                                <BotaoPrimario
                                    style={{ marginTop: '40px' }}
                                    onClick={nextStep}
                                >
                                    {step === totalSteps ? 'Gerar Treino Mágico 🪄' : 'Continuar'}
                                </BotaoPrimario>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </WizardContainer>
            </Container>
        </AppShell>
    );
};

export default GeradorTreinos;
