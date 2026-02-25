import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, InputWrapper, Label, InputField, BotaoPrimario, Flex } from '../../ui/components/BaseUI';
import { useUsuario } from '../../hooks/useUsuario';
import { db } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContexto';
import { maskTelefone } from '../../utils/masks';

const EditPerfil = () => {
    const { usuario } = useAuth();
    const { dados, carregando } = useUsuario();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        peso: '',
        altura: '',
        idade: ''
    });
    const [salvando, setSalvando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (dados) {
            setFormData({
                nome: dados.nome || '',
                email: dados.email || '',
                telefone: dados.telefone || '',
                peso: dados.peso || '',
                altura: dados.altura || '',
                idade: dados.idade || ''
            });
        }
    }, [dados]);

    const handleSalvar = async (e) => {
        e.preventDefault();
        setSalvando(true);
        try {
            await setDoc(doc(db, 'usuarios', usuario.uid), {
                ...formData,
                atualizadoEm: new Date()
            }, { merge: true });
            toast.success('Perfil atualizado!');
            navigate('/perfil');
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error('Erro ao salvar alterações.');
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) return <div style={{ color: 'white', padding: '20px' }}>Carregando...</div>;

    return (
        <AppShell hideTabbar>
            <Container>
                <Flex $gap="15px" style={{ marginTop: '20px', marginBottom: '30px' }}>
                    <button onClick={() => navigate(-1)}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Editar Perfil</Typography.H2>
                </Flex>

                <form onSubmit={handleSalvar}>
                    <InputWrapper>
                        <Label>Nome Completo</Label>
                        <InputField
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Seu nome"
                        />
                    </InputWrapper>

                    <InputWrapper>
                        <Label>E-mail</Label>
                        <InputField
                            value={formData.email}
                            disabled
                            style={{ opacity: 0.5 }}
                        />
                    </InputWrapper>

                    <InputWrapper>
                        <Label>Telefone</Label>
                        <InputField
                            value={formData.telefone}
                            onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                            placeholder="(00) 00000-0000"
                        />
                    </InputWrapper>

                    <Flex gap="15px">
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Peso ({dados?.unidadePeso || 'kg'})</Label>
                            <InputField
                                type="number"
                                value={formData.peso}
                                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                            />
                        </InputWrapper>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Altura ({dados?.unidadeAltura || 'cm'})</Label>
                            <InputField
                                type="number"
                                value={formData.altura}
                                onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                            />
                        </InputWrapper>
                    </Flex>

                    <InputWrapper>
                        <Label>Idade</Label>
                        <InputField
                            type="number"
                            value={formData.idade}
                            onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                        />
                    </InputWrapper>

                    <BotaoPrimario type="submit" disabled={salvando} style={{ marginTop: '20px' }}>
                        {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </BotaoPrimario>
                </form>
            </Container>
        </AppShell>
    );
};

export default EditPerfil;
