import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { resetarSenha } from '../../../firebase/auth';
import {
    BotaoPrimario,
    InputField,
    InputWrapper,
    Label,
    Typography,
    Container
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

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetarSenha(email);
            toast.success('E-mail de recuperação enviado!');
            navigate('/login');
        } catch (error) {
            toast.error('Erro ao enviar e-mail. Verifique se o e-mail está correto.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <BackButton onClick={() => navigate(-1)}>
                <FiArrowLeft />
            </BackButton>

            <Typography.H1>Recuperar Senha</Typography.H1>
            <Typography.Body>Insira seu e-mail para receber um link de redefinição de senha.</Typography.Body>

            <form onSubmit={handleReset} style={{ marginTop: '40px' }}>
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

                <BotaoPrimario type="submit" disabled={loading} style={{ marginTop: '20px' }}>
                    {loading ? 'Enviando...' : 'Enviar Link'}
                </BotaoPrimario>
            </form>
        </AuthContainer>
    );
};

export default EsqueciSenha;
