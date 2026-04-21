import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import { db } from '../../firebase/firestore';
import {
    BotaoPrimario,
    BotaoSecundario,
    InputField,
    InputWrapper,
    Label,
    Typography,
    Container,
    Flex
} from '../../ui/components/BaseUI';
import CustomSelect from '../../ui/components/CustomSelect';
import { maskTelefone } from '../../utils/masks';
import { motion, AnimatePresence } from 'framer-motion';


const SetupContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: var(--border);
  margin: 20px 0 40px;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--primary);
  width: ${({ $progress }) => $progress}%;
  transition: width 0.3s ease;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`;

const SelectableCard = styled.div`
  background-color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--card)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--primary)' : 'var(--border)')};
  padding: 20px;
  border-radius: var(--radius-medium);
  text-align: center;
  color: ${({ $active }) => ($active ? '#fff' : 'var(--text)')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
  }
`;

const PickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const BigNumber = styled.div`
  font-size: 84px;
  font-weight: 800;
  color: var(--primary);
`;

const UnitSwitch = styled.div`
  display: flex;
  background-color: var(--card);
  padding: 4px;
  border-radius: 30px;
  margin-top: 20px;
`;

const UnitButton = styled.button`
  padding: 8px 16px;
  border-radius: 26px;
  background-color: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--muted)')};
  font-weight: 600;
`;

const SetupWizard = () => {
    const { usuario, setPerfilCompleto } = useAuth();
    const [step, setStep] = useState(0); 
    const [dados, setDados] = useState({
        genero: '',
        idade: 25,
        peso: 70,
        unidadePeso: 'KG',
        altura: 175,
        unidadeAltura: 'CM',
        objetivo: '',
        nivelAtividade: '',
        telefone: '',
        diasTreino: [],
        localTreino: ''
    });

    const totalSteps = 10;
    const progress = (step / totalSteps) * 100;
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const finalizarSetup = async () => {
        try {
            let dadosCalculados = {};
            if (dados.peso && dados.altura) {
                const altMetros = parseFloat(dados.altura) > 3 ? parseFloat(dados.altura) / 100 : parseFloat(dados.altura);
                const imcValue = (parseFloat(dados.peso) / (altMetros * altMetros)).toFixed(1);
                let statusImc = 'Peso normal';
                if (imcValue < 18.5) statusImc = 'Abaixo do peso';
                else if (imcValue < 25) statusImc = 'Peso normal';
                else if (imcValue < 30) statusImc = 'Sobrepeso';
                else statusImc = 'Obesidade';

                let mult = { min: 1.6, max: 1.8, label: 'Manter' };
                if (dados.objetivo === 'Ganhar Musculo') mult = { min: 1.8, max: 2.2, label: 'Ganhar Massa' };
                else if (dados.objetivo === 'Perder Peso') mult = { min: 1.6, max: 2.0, label: 'Emagrecimento' };
                else if (dados.nivelAtividade === 'Iniciante (1-2 dias/sem)') mult = { min: 1.4, max: 1.6, label: 'Atividade Leve' };

                const p = parseFloat(dados.peso);
                const idealProt = (p * ((mult.min + mult.max) / 2)).toFixed(0);

                dadosCalculados = {
                    imc: imcValue,
                    statusImc: statusImc,
                    proteinaDiaria: idealProt,
                    proteinaRange: `${(p * mult.min).toFixed(0)}-${(p * mult.max).toFixed(0)}`,
                    objetivoProteina: mult.label
                };
            }

            await setDoc(doc(db, 'usuarios', usuario.uid), {
                ...dados,
                ...dadosCalculados,
                setupCompleto: true,
                ativo: true,
                atualizadoEm: new Date()
            }, { merge: true });
            setPerfilCompleto(true);
            toast.success('Perfil configurado!');
            navigate('/home');
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error('Erro ao salvar perfil.');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center', marginTop: '40px' }}
                    >
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>👋</div>
                        <Typography.H1 style={{ fontSize: '32px', marginBottom: '15px' }}>Ola! Vamos comecar?</Typography.H1>
                        <Typography.Body style={{ fontSize: '18px', maxWidth: '300px', margin: '0 auto' }}>
                            Precisamos de algumas informacoes para criar seu plano personalizado de alta performance.
                        </Typography.Body>
                    </motion.div>
                );
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Qual o seu genero?</Typography.H1>
                        <Typography.Body>Isso nos ajuda a calcular suas calorias e treinos.</Typography.Body>
                        <OptionGrid>
                            <SelectableCard
                                $active={dados.genero === 'Masculino'}
                                onClick={() => { setDados({ ...dados, genero: 'Masculino' }); handleNext(); }}
                            >
                                Masculino
                            </SelectableCard>
                            <SelectableCard
                                $active={dados.genero === 'Feminino'}
                                onClick={() => { setDados({ ...dados, genero: 'Feminino' }); handleNext(); }}
                            >
                                Feminino
                            </SelectableCard>
                        </OptionGrid>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Qual a sua idade?</Typography.H1>
                        <PickerContainer>
                            <BigNumber>{dados.idade}</BigNumber>
                            <input
                                type="range"
                                min="12" max="100"
                                value={dados.idade}
                                onChange={(e) => setDados({ ...dados, idade: e.target.value })}
                                style={{ width: '80%', accentColor: 'var(--primary)' }}
                            />
                        </PickerContainer>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Qual o seu peso?</Typography.H1>
                        <PickerContainer>
                            <BigNumber>{dados.peso}</BigNumber>
                            <UnitSwitch>
                                <UnitButton $active={dados.unidadePeso === 'KG'} onClick={() => setDados({ ...dados, unidadePeso: 'KG' })}>KG</UnitButton>
                                <UnitButton $active={dados.unidadePeso === 'LB'} onClick={() => setDados({ ...dados, unidadePeso: 'LB' })}>LB</UnitButton>
                            </UnitSwitch>
                            <input
                                type="range"
                                min="30" max="250"
                                value={dados.peso}
                                onChange={(e) => setDados({ ...dados, peso: e.target.value })}
                                style={{ width: '80%', accentColor: 'var(--primary)', marginTop: '40px' }}
                            />
                        </PickerContainer>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Qual a sua altura?</Typography.H1>
                        <PickerContainer>
                            <BigNumber>{dados.altura}<span style={{ fontSize: '24px' }}>{dados.unidadeAltura}</span></BigNumber>
                            <UnitSwitch>
                                <UnitButton $active={dados.unidadeAltura === 'CM'} onClick={() => setDados({ ...dados, unidadeAltura: 'CM' })}>CM</UnitButton>
                                <UnitButton $active={dados.unidadeAltura === 'FT'} onClick={() => setDados({ ...dados, unidadeAltura: 'FT' })}>FT</UnitButton>
                            </UnitSwitch>
                            <input
                                type="range"
                                min="100" max="250"
                                value={dados.altura}
                                onChange={(e) => setDados({ ...dados, altura: e.target.value })}
                                style={{ width: '80%', accentColor: 'var(--primary)', marginTop: '40px' }}
                            />
                        </PickerContainer>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Qual seu objetivo?</Typography.H1>
                        <div style={{ marginTop: '20px' }}>
                            <CustomSelect
                                value={dados.objetivo}
                                onChange={(val) => { setDados({ ...dados, objetivo: val }); handleNext(); }}
                                options={[
                                    { label: 'Perder Peso', value: 'Perder Peso' },
                                    { label: 'Ganhar Musculo', value: 'Ganhar Musculo' },
                                    { label: 'Manter o Shape', value: 'Manter o Shape' },
                                    { label: 'Saude e Bem-estar', value: 'Saude e Bem-estar' },
                                ]}
                            />
                        </div>
                    </motion.div>
                );
            case 6:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Nivel de Atividade</Typography.H1>
                        <div style={{ marginTop: '20px' }}>
                            <CustomSelect
                                value={dados.nivelAtividade}
                                onChange={(val) => { setDados({ ...dados, nivelAtividade: val }); handleNext(); }}
                                options={[
                                    { label: 'Iniciante (1-2 dias/sem)', value: 'Iniciante (1-2 dias/sem)' },
                                    { label: 'Intermediario (3-4 dias/sem)', value: 'Intermediario (3-4 dias/sem)' },
                                    { label: 'Avancado (5+ dias/sem)', value: 'Avancado (5+ dias/sem)' },
                                ]}
                            />
                        </div>
                    </motion.div>
                );
            case 7:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Em quais dias voce pretende treinar?</Typography.H1>
                        <Typography.Body>Selecione os dias da semana que voce tem disponibilidade.</Typography.Body>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '30px' }}>
                            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(dia => {
                                const isSelected = dados.diasTreino.includes(dia);
                                return (
                                    <SelectableCard
                                        key={dia}
                                        $active={isSelected}
                                        onClick={() => {
                                            const novosDias = isSelected
                                                ? dados.diasTreino.filter(d => d !== dia)
                                                : [...dados.diasTreino, dia];
                                            setDados({ ...dados, diasTreino: novosDias });
                                        }}
                                        style={{ padding: '15px', minWidth: '80px' }}
                                    >
                                        {dia}
                                    </SelectableCard>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            case 8:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Onde voce prefere treinar?</Typography.H1>
                        <Typography.Body>Isso nos ajuda a sugerir exercicios adequados ao seu espaco.</Typography.Body>
                        <OptionGrid>
                            <SelectableCard
                                $active={dados.localTreino === 'Academia'}
                                onClick={() => { setDados({ ...dados, localTreino: 'Academia' }); handleNext(); }}
                            >
                                Academia
                            </SelectableCard>
                            <SelectableCard
                                $active={dados.localTreino === 'Casa'}
                                onClick={() => { setDados({ ...dados, localTreino: 'Casa' }); handleNext(); }}
                            >
                                Em Casa
                            </SelectableCard>
                            <SelectableCard
                                $active={dados.localTreino === 'Parque/Rua'}
                                onClick={() => { setDados({ ...dados, localTreino: 'Parque/Rua' }); handleNext(); }}
                            >
                                Parque / Rua
                            </SelectableCard>
                            <SelectableCard
                                $active={dados.localTreino === 'Outro'}
                                onClick={() => { setDados({ ...dados, localTreino: 'Outro' }); handleNext(); }}
                            >
                                Outro
                            </SelectableCard>
                        </OptionGrid>
                    </motion.div>
                );
            case 9:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Typography.H1>Quase la!</Typography.H1>
                        <Typography.Body>Complete seu perfil com algumas informacoes extras.</Typography.Body>
                        <div style={{ marginTop: '40px' }}>
                            <InputWrapper>
                                <Label>Telefone (Opcional)</Label>
                                <InputField
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    value={dados.telefone}
                                    onChange={(e) => setDados({ ...dados, telefone: maskTelefone(e.target.value) })}
                                />
                            </InputWrapper>
                        </div>
                    </motion.div>
                );
            case 10:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ textAlign: 'center' }}
                    >
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                            <FiCheck size={50} color="#fff" />
                        </div>
                        <Typography.H1>Tudo pronto!</Typography.H1>
                        <Typography.Body>Seu plano esta sendo preparado para voce.</Typography.Body>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <SetupContainer>
            <Flex $justify="space-between" style={{ marginTop: '20px' }}>
                <button onClick={handleBack} disabled={step === 0} style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
                    <FiArrowLeft size={24} color="var(--text)" />
                </button>
                <Typography.Small>Passo {step} de {totalSteps}</Typography.Small>
                <div style={{ width: '24px' }}></div>
            </Flex>

            <ProgressBar>
                <ProgressFill $progress={progress} />
            </ProgressBar>

            <AnimatePresence mode="wait">
                <StepContent key={step}>
                    {renderStep()}
                </StepContent>
            </AnimatePresence>

            <Flex style={{ marginTop: 'auto', paddingBottom: '40px' }}>
                {step === totalSteps ? (
                    <BotaoPrimario onClick={finalizarSetup}>Comecar Agora</BotaoPrimario>
                ) : (
                    <BotaoPrimario onClick={handleNext}>
                        Continuar <FiChevronRight />
                    </BotaoPrimario>
                )}
            </Flex>
        </SetupContainer>
    );
};


export default SetupWizard;
