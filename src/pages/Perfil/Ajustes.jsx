import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import * as IconsFa from 'react-icons/fa';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, Label, InputWrapper, BotaoPrimario } from '../../ui/components/BaseUI';
import { useAjustes } from '../../contexts/AjustesContexto';
import toast from 'react-hot-toast';

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 15px;
  margin-top: 10px;
`;

const ColorOption = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  cursor: pointer;
  border: 4px solid ${props => props.$active ? 'white' : 'transparent'};
  box-shadow: 0 0 0 2px ${props => props.$active ? 'var(--primary)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 15px;
  margin-top: 10px;
`;

const IconOption = styled.div`
  width: 60px;
  height: 60px;
  background-color: var(--card);
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--muted)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
  }
`;

const Ajustes = () => {
    const { ajustes, atualizarAjustes, carregando } = useAjustes();
    const [config, setConfig] = useState({
        corPrincipal: '#9b8cff',
        nomePainel: 'FITBODY',
        iconePainel: 'FaDumbbell'
    });
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (ajustes) {
            setConfig(ajustes);
        }
    }, [ajustes]);

    const cores = [
        '#9b8cff', '#50fa7b', '#ff79c6', '#8be9fd', '#ffb86c',
        '#ff5555', '#f1fa8c', '#bd93f9', '#ffcc00', '#00ffcc'
    ];

    const iconesFitness = [
        { id: 'FaDumbbell', component: IconsFa.FaDumbbell },
        { id: 'FaRunning', component: IconsFa.FaRunning },
        { id: 'FaHeartbeat', component: IconsFa.FaHeartbeat },
        { id: 'FaAppleAlt', component: IconsFa.FaAppleAlt },
        { id: 'FaBiking', component: IconsFa.FaBiking },
        { id: 'FaWeight', component: IconsFa.FaWeight },
        { id: 'FaFire', component: IconsFa.FaFire },
        { id: 'FaUniversalAccess', component: IconsFa.FaUniversalAccess }
    ];

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            await atualizarAjustes(config);
            toast.success('Ajustes salvos!');
        } catch (error) {
            toast.error('Erro ao salvar ajustes.');
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) return <div style={{ color: 'white', padding: '20px' }}>Carregando ajustes...</div>;

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate(-1)}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Ajustes do Sistema</Typography.H2>
                    <button onClick={handleSalvar} disabled={salvando} style={{ color: 'var(--primary)' }}>
                        <FiSave size={24} />
                    </button>
                </Flex>

                <Card style={{ marginBottom: '20px' }}>
                    <Typography.H2 style={{ fontSize: '18px', marginBottom: '20px' }}>Visual do Painel</Typography.H2>

                    <InputWrapper>
                        <Label>Nome do Painel</Label>
                        <InputField
                            value={config.nomePainel}
                            onChange={(e) => setConfig({ ...config, nomePainel: e.target.value })}
                            placeholder="Ex: Minha Academia"
                        />
                    </InputWrapper>

                    <Label>Cor Principal</Label>
                    <ColorGrid>
                        {cores.map(cor => (
                            <ColorOption
                                key={cor}
                                $color={cor}
                                $active={config.corPrincipal === cor}
                                onClick={() => setConfig({ ...config, corPrincipal: cor })}
                            />
                        ))}
                    </ColorGrid>

                    <Label style={{ marginTop: '30px', display: 'block' }}>Ícone do Painel</Label>
                    <IconGrid>
                        {iconesFitness.map(icon => {
                            const IconComp = icon.component;
                            return (
                                <IconOption
                                    key={icon.id}
                                    $active={config.iconePainel === icon.id}
                                    onClick={() => setConfig({ ...config, iconePainel: icon.id })}
                                >
                                    <IconComp />
                                </IconOption>
                            );
                        })}
                    </IconGrid>
                </Card>

                <BotaoPrimario onClick={handleSalvar} disabled={salvando} style={{ marginTop: '20px' }}>
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </BotaoPrimario>
            </Container>
        </AppShell>
    );
};

export default Ajustes;
