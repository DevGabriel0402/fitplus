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


const SetupContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  color: ${({ $active }) => ($active ? '#000' : 'var(--text)')};
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
  color: ${({ $active }) => ($active ? '#000' : 'var(--muted)')};
  font-weight: 600;
`;

const SetupWizard = () => {
    const { usuario, setPerfilCompleto } = useAuth();
    const [step, setStep] = useState(1);
    const [dados, setDados] = useState({
        genero: '',
        idade: 25,
        peso: 70,
        unidadePeso: 'KG',
        altura: 175,
        unidadeAltura: 'CM',
        objetivo: '',
        nivelAtividade: '',
        telefone: ''
    });

    const totalSteps = 8;
    const progress = (step / totalSteps) * 100;
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const finalizarSetup = async () => {
        try {
            await setDoc(doc(db, 'usuarios', usuario.uid), {
                ...dados,
                setupCompleto: true,
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
            case 1:
                return (
                    <StepContent>
                        <Typography.H1>Qual o seu gênero?</Typography.H1>
                        <Typography.Body>Isso nos ajuda a calcular suas calorias e treinos.</Typography.Body>
                        <OptionGrid>
                            <SelectableCard
                                $active={dados.genero === 'Masculino'}
                                onClick={() => setDados({ ...dados, genero: 'Masculino' })}
                            >
                                Masculino
                            </SelectableCard>
                            <SelectableCard
                                $active={dados.genero === 'Feminino'}
                                onClick={() => setDados({ ...dados, genero: 'Feminino' })}
                            >
                                Feminino
                            </SelectableCard>
                        </OptionGrid>
                    </StepContent>
                );
            case 2:
                return (
                    <StepContent>
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
                    </StepContent>
                );
            case 3:
                return (
                    <StepContent>
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
                    </StepContent>
                );
            case 4:
                return (
                    <StepContent>
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
                    </StepContent>
                );
            case 5:
                return (
                    <StepContent>
                        <Typography.H1>Qual seu objetivo?</Typography.H1>
                        <div style={{ marginTop: '20px' }}>
                            <CustomSelect
                                value={dados.objetivo}
                                onChange={(val) => setDados({ ...dados, objetivo: val })}
                                options={[
                                    { label: 'Perder Peso', value: 'Perder Peso' },
                                    { label: 'Ganhar Músculo', value: 'Ganhar Músculo' },
                                    { label: 'Manter o Shape', value: 'Manter o Shape' },
                                    { label: 'Saúde e Bem-estar', value: 'Saúde e Bem-estar' },
                                ]}
                            />
                        </div>
                    </StepContent>

                );
            case 6:
                return (
                    <StepContent>
                        <Typography.H1>Nível de Atividade</Typography.H1>
                        <div style={{ marginTop: '20px' }}>
                            <CustomSelect
                                value={dados.nivelAtividade}
                                onChange={(val) => setDados({ ...dados, nivelAtividade: val })}
                                options={[
                                    { label: 'Iniciante (1-2 dias/sem)', value: 'Iniciante (1-2 dias/sem)' },
                                    { label: 'Intermediário (3-4 dias/sem)', value: 'Intermediário (3-4 dias/sem)' },
                                    { label: 'Avançado (5+ dias/sem)', value: 'Avançado (5+ dias/sem)' },
                                ]}
                            />
                        </div>
                    </StepContent>

                );
            case 7:
                return (
                    <StepContent>
                        <Typography.H1>Quase lá!</Typography.H1>
                        <Typography.Body>Complete seu perfil com algumas informações extras.</Typography.Body>
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
                    </StepContent>
                );
            case 8:
                return (
                    <StepContent style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                            <FiCheck size={50} color="#000" />
                        </div>
                        <Typography.H1>Tudo pronto!</Typography.H1>
                        <Typography.Body>Seu plano está sendo preparado para você.</Typography.Body>
                    </StepContent>
                );
            default:
                return null;
        }
    };

    return (
        <SetupContainer>
            <Flex $justify="space-between" style={{ marginTop: '20px' }}>
                <button onClick={handleBack} disabled={step === 1} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>
                    <FiArrowLeft size={24} color="var(--text)" />
                </button>
                <Typography.Small>Passo {step} de {totalSteps}</Typography.Small>
                <div style={{ width: '24px' }}></div>
            </Flex>

            <ProgressBar>
                <ProgressFill $progress={progress} />
            </ProgressBar>

            {renderStep()}

            <Flex style={{ marginTop: 'auto', paddingBottom: '40px' }}>
                {step === totalSteps ? (
                    <BotaoPrimario onClick={finalizarSetup}>Começar Agora</BotaoPrimario>
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
