import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { loginComEmail, loginComGoogle } from '../../../firebase/auth';
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 30px 0;
  color: var(--muted);
  font-size: 14px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--border);
  }
`;

const LinkText = styled(Link)`
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
`;

const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginComEmail(email, senha);
            toast.success('Bem-vindo de volta!');
            navigate('/');
        } catch (error) {
            toast.error('Erro ao fazer login. Verifique suas credenciais.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        try {
            await loginComGoogle();
            toast.success('Login realizado com sucesso!');
            navigate('/');
        } catch (error) {
            toast.error('Erro ao entrar com Google.');
        }
    };

    return (
        <AuthContainer>
            <BackButton onClick={() => navigate(-1)}>
                <FiArrowLeft />
            </BackButton>

            <Typography.H1>Entrar</Typography.H1>
            <Typography.Body>Bem-vindo de volta! Por favor, insira seus dados.</Typography.Body>

            <form onSubmit={handleLogin} style={{ marginTop: '40px' }}>
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

                <Flex justify="flex-end" style={{ marginBottom: '30px' }}>
                    <LinkText to="/esqueci-senha">Esqueceu a senha?</LinkText>
                </Flex>

                <BotaoPrimario type="submit" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </BotaoPrimario>
            </form>

            <Divider>ou continue com</Divider>

            <BotaoSecundario onClick={handleGoogle}>
                <FcGoogle size={24} />
                Google
            </BotaoSecundario>

            <Flex justify="center" style={{ marginTop: '40px' }}>
                <Typography.Small>Não tem uma conta?</Typography.Small>
                <LinkText to="/cadastro" style={{ marginLeft: '5px' }}>Cadastre-se</LinkText>
            </Flex>
        </AuthContainer>
    );
};

export default Login;
