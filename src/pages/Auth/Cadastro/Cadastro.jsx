import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { doc, setDoc } from 'firebase/firestore';
import { cadastroComEmail, loginComGoogle } from '../../../firebase/auth';
import { db } from '../../../firebase/firestore';
import {
    BotaoPrimario,
    BotaoSecundario,
    InputField,
    InputWrapper,
    Label,
    Typography,
    Container,
    Flex
} from '../../../ui/components/BaseUI';

const AuthContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
`;

const BackButton = styled.button`
  position: absolute;
  top: 50px;
  left: 20px;
  color: var(--text);
  font-size: 24px;
`;

const LinkText = styled(Link)`
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
`;

const Cadastro = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCadastro = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { user } = await cadastroComEmail(email, senha);

            // Criar documento do usuário
            await setDoc(doc(db, 'usuarios', user.uid), {
                nome,
                email,
                setupCompleto: false,
                criadoEm: new Date()
            });

            toast.success('Conta criada com sucesso!');
            navigate('/setup');
        } catch (error) {
            toast.error('Erro ao criar conta. Tente outro e-mail.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <BackButton onClick={() => navigate(-1)}>
                <FiArrowLeft />
            </BackButton>

            <Typography.H1>Criar Conta</Typography.H1>
            <Typography.Body>Junte-se ao FITBODY e comece sua transformação hoje!</Typography.Body>

            <form onSubmit={handleCadastro} style={{ marginTop: '40px' }}>
                <InputWrapper>
                    <Label>Nome Completo</Label>
                    <InputField
                        type="text"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </InputWrapper>

                <InputWrapper>
                    <Label>E-mail</Label>
                    <InputField
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </InputWrapper>

                <InputWrapper>
                    <Label>Senha</Label>
                    <InputField
                        type="password"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </InputWrapper>

                <BotaoPrimario type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? 'Criando...' : 'Criar Conta'}
                </BotaoPrimario>
            </form>

            <Flex justify="center" style={{ marginTop: '40px' }}>
                <Typography.Small>Já tem uma conta?</Typography.Small>
                <LinkText to="/login" style={{ marginLeft: '5px' }}>Entrar</LinkText>
            </Flex>
        </AuthContainer>
    );
};

export default Cadastro;
