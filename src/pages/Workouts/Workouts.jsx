import React, { useState, useEffect } from 'react';
import { useTheme } from 'styled-components';
import { LuActivity, LuTarget, LuBrain, LuCalendar, LuLayoutList, LuChevronDown, LuPlay, LuRotateCcw, LuCheck, LuCircleCheck, LuBookmark } from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContexto';
import { useColecao } from '../../hooks/useColecao';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

import { AppShell } from '../../ui/AppShell/AppShell';
import { 
  PageContainer, SectionTitle, SectionSubtitle, PrimaryButton, SelectWrapper, CardSelect,
  RadioCircle, CardTitle, CardDesc, PillButton, HeaderBoard, ExerciseCard, SetRow, DayButton,
  GifImage, CardHeader
} from './Workouts.styles';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiRefreshCw, FiChevronRight } from 'react-icons/fi';
import styled from 'styled-components';

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center;
  justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background-color: #fff; width: 100%; max-width: 450px;
  border-radius: 24px; padding: 30px; position: relative;
  max-height: 80vh; overflow-y: auto;
`;

import { EXERCISES_DB, DIAS_SEMANA, OBJECTIVES, LEVELS } from '../../data/mockDb';

const mapDaysToInt = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
const getCurrentDayStr = () => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[new Date().getDay()];
};
const getFormattedDayDate = (dayStr) => {
  const today = new Date();
  const currentDayIndex = today.getDay();
  const targetDayIndex = mapDaysToInt[dayStr];
  if (targetDayIndex === undefined) return { day: dayStr, date: '' };
  
  let diff = targetDayIndex - currentDayIndex;
  // If the day already passed this week, show next week, or keep current week? 
  // Let's just do a simple mapping for the current week context.
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return { day: dayStr, date: targetDate.getDate().toString() };
};

const Workouts = () => {
  const theme = useTheme();
  const { usuario, dadosUsuario } = useAuth();
  const { documentos: treinos, carregando } = useColecao(`treinos/${usuario?.uid}/lista`);
  
  const [activeWorkout, setActiveWorkout] = useState(null);
  
  const [workoutConfig, setWorkoutConfig] = useState({
    objective: OBJECTIVES[0],
    level: 'Iniciante',
    split: 'ABC',
    days: ['Seg', 'Qua', 'Sex'],
    sets: 3
  });

  const [activeDay, setActiveDay] = useState(getCurrentDayStr());
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const { documentos: biblioteca } = useColecao('exercicios');

  useEffect(() => {
    if (treinos && treinos.length > 0) {
      setActiveWorkout(treinos[0]);
      if (treinos[0].dias && treinos[0].dias.length > 0) {
        const todayStr = getCurrentDayStr();
        // If today is a training day, select it. Otherwise select the first training day.
        if (treinos[0].dias.includes(todayStr)) {
          setActiveDay(todayStr);
        } else if (!treinos[0].dias.includes(activeDay)) {
          setActiveDay(treinos[0].dias[0]);
        }
      }
      if (treinos[0].progresso) {
        setProgress(treinos[0].progresso);
      }
    } else {
      setActiveWorkout(null);
    }
  }, [treinos]);

  const toggleDay = (dia) => {
    setWorkoutConfig(prev => ({
      ...prev,
      days: prev.days.includes(dia) ? prev.days.filter(d => d !== dia) : [...prev.days, dia]
    }));
  };

  const getLevelWeight = (levelName) => {
    const weights = { 'Sedentário': 0.5, 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3, 'Atleta': 4 };
    return weights[levelName] || 1;
  };

  const generateAndSaveWorkout = async () => {
    if (workoutConfig.days.length === 0) return toast.error("Selecione pelo menos um dia de treino!");

    setIsGenerating(true);
    const plan = {};
    const userLevelWeight = getLevelWeight(workoutConfig.level);
    
    const getExercises = (muscles, count) => {
        let pool = [];
        muscles.forEach(m => {
            const groupEx = (EXERCISES_DB[m] || []).filter(ex => getLevelWeight(ex.level) <= Math.ceil(userLevelWeight));
            pool = [...pool, ...(groupEx.length > 0 ? groupEx : (EXERCISES_DB[m] || [])).map(e => ({...e, muscle: m}))];
        });
        return pool.sort(() => 0.5 - Math.random()).slice(0, count);
    };

    const formatSetsReps = (ex, muscleGroup) => {
        let idealReps = '10-15';
        if (workoutConfig.objective.includes('Força')) idealReps = '4-6';
        else if (workoutConfig.objective.includes('Hipertrofia')) idealReps = '8-12';
        else if (workoutConfig.objective.includes('Emagrecimento')) idealReps = '15-20';

        if (muscleGroup === 'Cardio' || muscleGroup === 'Funcional') idealReps = '15-30 min';
        if (muscleGroup === 'Funcional') idealReps = '10-15 min';
        
        let idealSets = Number(workoutConfig.sets) || 3;
        if (muscleGroup === 'Cardio' || muscleGroup === 'Funcional') idealSets = 1;

        return { ...ex, sets: idealSets, reps: idealReps };
    };

    workoutConfig.days.forEach((day, index) => {
        let dayMuscles = [];
        if (workoutConfig.split === 'FullBody') {
            dayMuscles = ['Peito', 'Costas', 'Perna', 'Ombro', 'Biceps', 'Triceps'];
        } else if (workoutConfig.split === 'AB') {
            dayMuscles = index % 2 === 0 ? ['Peito', 'Costas', 'Ombro', 'Biceps', 'Triceps'] : ['Perna', 'Abdomen']; 
        } else if (workoutConfig.split === 'ABC') {
            const cycle = index % 3;
            if (cycle === 0) dayMuscles = ['Peito', 'Ombro', 'Triceps']; 
            else if (cycle === 1) dayMuscles = ['Costas', 'Trapezio', 'Biceps']; 
            else dayMuscles = ['Perna', 'Abdomen']; 
        }

        const exercisesToPick = 8;
        const dailyExercises = getExercises(dayMuscles, exercisesToPick).map(ex => formatSetsReps(ex, ex.muscle));
        
        const finisher = getExercises(['Cardio'], 1).map(ex => formatSetsReps(ex, 'Cardio'))[0];
        if (finisher) dailyExercises.push(finisher);
        plan[day] = dailyExercises;
    });

    try {
      await addDoc(collection(db, `treinos/${usuario.uid}/lista`), {
        nomeTreino: workoutConfig.objective,
        nivel: workoutConfig.level,
        split: workoutConfig.split,
        dias: workoutConfig.days,
        plan: plan,
        progresso: {},
        criadoEm: serverTimestamp()
      });
      toast.success("Treino gerado e salvo com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar o treino.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSwapExercise = async (novoEx) => {
    if (!activeWorkout || !activeWorkout.plan) return;
    
    const newPlan = { ...activeWorkout.plan };
    const dayExercises = [...(newPlan[activeDay] || [])];
    const currentEx = dayExercises[activeExerciseIndex];
    
    dayExercises[activeExerciseIndex] = {
      ...currentEx,
      name: novoEx.nome,
      id: novoEx.id || Date.now().toString(),
      gifUrl: novoEx.gifUrl,
      muscle: novoEx.muscle || currentEx.muscle
    };
    
    newPlan[activeDay] = dayExercises;
    
    try {
      await updateDoc(doc(db, `treinos/${usuario.uid}/lista`, activeWorkout.id), {
        plan: newPlan
      });
      toast.success(`Trocado por ${novoEx.nome}`);
      setShowSwapModal(false);
    } catch(e) {
      console.error(e);
      toast.error("Erro ao trocar exercício.");
    }
  };

  const syncProgress = async (newProgress) => {
    if (!activeWorkout) return;
    try {
        await updateDoc(doc(db, `treinos/${usuario.uid}/lista`, activeWorkout.id), {
           progresso: newProgress
        });
    } catch(e) {
        console.error("Error syncing progress", e);
    }
  };

  const toggleSet = (day, exerciseId, setNum) => {
    const key = `${day}-${exerciseId}-${setNum}`;
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    syncProgress(newProgress);
  };

  const getDayProgress = (day) => {
    if (!activeWorkout || !activeWorkout.plan || !activeWorkout.plan[day]) return 0;
    const totalSets = activeWorkout.plan[day].reduce((acc, ex) => acc + ((ex.muscle === 'Cardio' || ex.muscle === 'Funcional') ? 1 : ex.sets), 0);
    if (totalSets === 0) return 0;
    const completedSets = Object.keys(progress).filter(key => key.startsWith(`${day}-`) && progress[key]).length;
    return Math.round((completedSets / totalSets) * 100);
  };

  const handleDeleteWorkout = async () => {
    if (!activeWorkout) return;
    if(window.confirm("Deseja realmente apagar este treino e gerar um novo?")) {
       try {
           await deleteDoc(doc(db, `treinos/${usuario.uid}/lista`, activeWorkout.id));
           toast.success("Treino removido.");
       } catch(e) {
           toast.error("Falha ao remover.");
       }
    }
  };

  const renderOnboarding = () => (
    <PageContainer>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
        <div style={{ width: '4rem', height: '4rem', backgroundColor: theme.colors.primaryHover, borderRadius: theme.borderRadius['2xl'], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: theme.shadows.primary }}>
          <LuActivity size={32} color="#fff" />
        </div>
        <SectionTitle style={{ justifyContent: 'center' }}>Novo Treino</SectionTitle>
        <SectionSubtitle>Configure os parâmetros da sua nova rotina.</SectionSubtitle>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <LuTarget color={theme.colors.primaryHover} size={20} /> Qual seu Objetivo?
          </label>
          <SelectWrapper>
            <select value={workoutConfig.objective} onChange={(e) => setWorkoutConfig({...workoutConfig, objective: e.target.value})}>
              {OBJECTIVES.map(obj => <option key={obj} value={obj}>{obj}</option>)}
            </select>
            <LuChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </SelectWrapper>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <LuBrain color={theme.colors.primaryHover} size={20} /> Seu Nível de Experiência
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {LEVELS.map(lvl => (
              <CardSelect key={lvl.id} $active={workoutConfig.level === lvl.id} onClick={() => setWorkoutConfig({...workoutConfig, level: lvl.id})}>
                <CardHeader>
                  <RadioCircle $active={workoutConfig.level === lvl.id} />
                  <CardTitle $active={workoutConfig.level === lvl.id}>{lvl.id}</CardTitle>
                </CardHeader>
                <CardDesc>{lvl.desc}</CardDesc>
              </CardSelect>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <LuCalendar color={theme.colors.primaryHover} size={20} /> Dias da Semana
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {DIAS_SEMANA.map(dia => (
              <PillButton key={dia} $active={workoutConfig.days.includes(dia)} onClick={() => toggleDay(dia)}>
                {dia}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <LuLayoutList color={theme.colors.primaryHover} size={20} /> Metodologia
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { id: 'FullBody', title: 'Full Body (Corpo Inteiro)', desc: 'Recomendado p/ Iniciantes (2-3x/semana)' },
              { id: 'AB', title: 'AB (Superior / Inferior)', desc: 'Ideal para 4x na semana' },
              { id: 'ABC', title: 'ABC (Push / Pull / Legs)', desc: 'Intermediário/Avançados (5-6x/semana)' }
            ].map(split => (
              <CardSelect key={split.id} $active={workoutConfig.split === split.id} onClick={() => setWorkoutConfig({...workoutConfig, split: split.id})}>
                <CardHeader><CardTitle $active={workoutConfig.split === split.id}>{split.title}</CardTitle></CardHeader>
                <CardDesc style={{ marginLeft: 0 }}>{split.desc}</CardDesc>
              </CardSelect>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <LuTarget color={theme.colors.primaryHover} size={20} /> Séries por Exercício
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {[2, 3, 4].map(num => (
              <PillButton 
                key={num} 
                $active={workoutConfig.sets === num} 
                onClick={() => setWorkoutConfig({...workoutConfig, sets: num})}
                style={{ flex: 1, textAlign: 'center' }}
              >
                {num} Séries
              </PillButton>
            ))}
          </div>
        </div>

        <PrimaryButton onClick={generateAndSaveWorkout} disabled={isGenerating}>
          <LuPlay size={20} /> {isGenerating ? 'Gerando...' : 'Gerar Meu Treino'}
        </PrimaryButton>
      </div>
    </PageContainer>
  );

  const plan = activeWorkout?.plan || {};
  const currentWorkout = plan[activeDay] || [];

  const renderDashboard = () => {
    const progressoDia = getDayProgress(activeDay);

    return (
      <div style={{ animation: 'fadeIn 0.3s' }}>
        <HeaderBoard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.1em', color: theme.colors.primaryHover, textTransform: 'uppercase' }}>Rotina Atual</span>
              <SectionTitle style={{ marginTop: '0.25rem', marginBottom: 0 }}>{activeWorkout.nomeTreino}</SectionTitle>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDeleteWorkout} style={{ padding: '0.75rem', borderRadius: theme.borderRadius['2xl'], backgroundColor: theme.colors.errorBg, color: theme.colors.error }} title="Excluir Treino">
                <LuRotateCcw size={20} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', backgroundColor: theme.colors.background, padding: '0.5rem', borderRadius: theme.borderRadius['2xl'], gap: '0.5rem' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', backgroundColor: '#fff', borderRadius: theme.borderRadius.xl }}>
              <span style={{ display: 'block', fontSize: '0.56rem', fontWeight: 700, color: theme.colors.textLight, textTransform: 'uppercase' }}>Divisão</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 900 }}>{activeWorkout.split}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', backgroundColor: '#fff', borderRadius: theme.borderRadius.xl }}>
              <span style={{ display: 'block', fontSize: '0.56rem', fontWeight: 700, color: theme.colors.textLight, textTransform: 'uppercase' }}>Nível</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 900 }}>{activeWorkout.nivel}</span>
            </div>
          </div>
        </HeaderBoard>

        <div style={{ padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Dias de Treino</h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', backgroundColor: progressoDia === 100 ? theme.colors.successBg : theme.colors.primaryLight, color: progressoDia === 100 ? theme.colors.success : theme.colors.primaryHover, borderRadius: theme.borderRadius.lg }}>
                {progressoDia === 100 ? 'OK' : `${progressoDia}% concluído`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {[...(activeWorkout.dias || [])].sort((a, b) => mapDaysToInt[a] - mapDaysToInt[b]).map(dia => {
                const dateInfo = getFormattedDayDate(dia);
                const isDayDone = getDayProgress(dia) === 100;
                return (
                <DayButton key={dia} $active={activeDay === dia} onClick={() => { setActiveDay(dia); setActiveExerciseIndex(0); }}>
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {isDayDone && <LuCircleCheck size={16} color={theme.colors.success} style={{ position: 'absolute', top: -15, right: -15 }} />}
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{dateInfo.day}</span>
                    {dateInfo.date && <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>{dateInfo.date}</span>}
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: activeDay === dia ? 'rgba(255,255,255,0.3)' : theme.colors.primaryLight, borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: activeDay === dia ? '#fff' : theme.colors.primaryHover, width: `${getDayProgress(dia)}%`, transition: 'width 0.3s' }} />
                  </div>
                </DayButton>
              ); })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {currentWorkout.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: '#fff', borderRadius: theme.borderRadius['3xl'], border: `1px dashed ${theme.colors.borderDark}` }}>
                Dia de descanso! 🎉
              </div>
            ) : (() => {
              if (activeExerciseIndex >= currentWorkout.length) {
                return (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#fff', borderRadius: theme.borderRadius['3xl'], boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', color: theme.colors.primaryHover }}>Parabéns!</h2>
                    <p style={{ color: theme.colors.textMuted, fontWeight: 500, lineHeight: 1.5, marginBottom: '1.5rem' }}>Você finalizou o treino de hoje com sucesso. Descanse e recarregue as energias!</p>
                    <PrimaryButton style={{ width: '100%' }} onClick={() => setActiveExerciseIndex(0)}>Ver exercícios novamente</PrimaryButton>
                  </div>
                );
              }
              const ex = currentWorkout[activeExerciseIndex];
              if (!ex) return null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: theme.colors.textMuted }}>Exercício {activeExerciseIndex + 1} de {currentWorkout.length}</span>
                  </div>
                  <ExerciseCard key={ex.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '3rem', height: '3rem', borderRadius: theme.borderRadius['2xl'], backgroundColor: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                          {activeExerciseIndex + 1}
                        </div>
                        <div>
                          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.2 }}>{ex.name}</h3>
                          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: theme.colors.primaryHover, backgroundColor: theme.colors.primaryLight, padding: '0.125rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>{ex.muscle}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowSwapModal(true)}
                        style={{ padding: '0.5rem', borderRadius: '10px', backgroundColor: theme.colors.background, color: theme.colors.primaryHover, border: 'none', cursor: 'pointer' }}
                        title="Trocar Exercício"
                      >
                        <FiRefreshCw size={18} />
                      </button>
                    </div>
                    
                    {ex.gifUrl && (
                      <GifImage src={ex.gifUrl} alt={ex.name} loading="lazy" />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: theme.colors.background, padding: '0.75rem', borderRadius: theme.borderRadius['2xl'] }}>
                      {Array.from({ length: (ex.muscle === 'Cardio' || ex.muscle === 'Funcional') ? 1 : ex.sets }).map((_, i) => {
                        const setNum = i + 1;
                        const isChecked = progress[`${activeDay}-${ex.id}-${setNum}`];
                        return (
                          <SetRow key={setNum} $checked={isChecked} onClick={() => toggleSet(activeDay, ex.id, setNum)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isChecked ? theme.colors.primaryHover : theme.colors.borderDark, color: '#fff' }}>
                                {isChecked && <LuCheck size={14} strokeWidth={4} />}
                              </div>
                              <span style={{ fontWeight: 700, fontSize: '0.875rem', opacity: isChecked ? 0.6 : 1, textDecoration: isChecked ? 'line-through' : 'none' }}>
                                {(ex.muscle === 'Cardio' || ex.muscle === 'Funcional') ? 'Duração' : `Série ${setNum}`}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: isChecked ? 'rgba(124, 58, 237, 0.1)' : theme.colors.border, color: isChecked ? theme.colors.primaryHover : theme.colors.textMuted }}>
                              {(ex.muscle === 'Cardio' || ex.muscle === 'Funcional') ? ex.reps : `${ex.reps} reps`}
                            </span>
                          </SetRow>
                        );
                      })}
                    </div>
                  </ExerciseCard>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <PrimaryButton 
                      style={{ flex: 1, backgroundColor: activeExerciseIndex === 0 ? theme.colors.border : theme.colors.primaryHover, color: activeExerciseIndex === 0 ? theme.colors.textMuted : '#fff' }} 
                      disabled={activeExerciseIndex === 0} 
                      onClick={() => setActiveExerciseIndex(prev => prev - 1)}
                    >
                      Anterior
                    </PrimaryButton>
                    <PrimaryButton 
                      style={{ flex: 1 }} 
                      onClick={() => setActiveExerciseIndex(prev => prev + 1)}
                    >
                      {activeExerciseIndex < currentWorkout.length - 1 ? 'Próximo' : 'Finalizar'}
                    </PrimaryButton>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  if (carregando) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;

  return (
    <AppShell>
      {activeWorkout ? renderDashboard() : renderOnboarding()}

      <AnimatePresence>
        {showSwapModal && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.25rem' }}>Trocar Exercício</h3>
                <button onClick={() => setShowSwapModal(false)} style={{ color: theme.colors.textMuted }}><FiX size={24} /></button>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: theme.colors.textMuted, marginBottom: '20px' }}>
                Selecione uma alternativa para o <strong>{currentWorkout[activeExerciseIndex]?.name}</strong>.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(() => {
                  const currentEx = currentWorkout[activeExerciseIndex];
                  const normalize = (text) => text?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
                  const targetMuscle = normalize(currentEx?.muscle || currentEx?.categoria);
                  
                  const filtered = biblioteca
                    .filter(e => {
                      const eMuscle = normalize(e.muscle || e.categoria);
                      return (eMuscle.includes(targetMuscle) || targetMuscle.includes(eMuscle)) && e.nome !== currentEx?.name;
                    })
                    .slice(0, 4);

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '20px', opacity: 0.6 }}>
                        Nenhum exercício similar encontrado na biblioteca.
                      </div>
                    );
                  }

                  return filtered.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => handleSwapExercise(e)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'row', // Force row
                        alignItems: 'center', 
                        gap: '15px', 
                        padding: '12px 16px', 
                        borderRadius: '16px', 
                        border: `1px solid ${theme.colors.border}`, 
                        cursor: 'pointer', 
                        backgroundColor: '#fff', 
                        transition: 'all 0.2s',
                        width: '100%',
                        marginBottom: '4px'
                      }}
                    >
                      <img 
                        src={e.gifUrl} 
                        alt={e.nome} 
                        style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', backgroundColor: 'var(--background)' }} 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>{e.nome}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{e.muscle || e.categoria}</span>
                      </div>
                      <FiChevronRight color="var(--border)" />
                    </div>
                  ));
                })()}
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

export default Workouts;
