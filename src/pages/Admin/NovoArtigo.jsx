import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, BotaoPrimario, Label, InputWrapper, TextAreaField } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const NovoArtigo = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form, setForm] = useState({
        titulo: '',
        categoria: 'GERAL',
        tempoLeitura: '5 min de leitura',
        image: '',
        conteudo: ''
    });
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (id) {
            getDoc(doc(db, 'artigos', id)).then(snap => {
                if (snap.exists()) setForm(snap.data());
            });
        }
    }, [id]);

    const salvar = async () => {
        if (!form.titulo || !form.conteudo) return toast.error("Preencha o título e conteúdo.");
        setSalvando(true);
        try {
            const data = { ...form, criadoEm: serverTimestamp() };
            if (id) {
                await updateDoc(doc(db, 'artigos', id), data);
                toast.success("Atualizado!");
            } else {
                await addDoc(collection(db, 'artigos'), data);
                toast.success("Criado!");
            }
            navigate('/admin/artigos');
        } catch (e) {
            console.error(e);
            toast.error("Erro ao salvar.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/admin/artigos')}><FiArrowLeft size={24} /></button>
                    <Typography.H2 style={{ margin: 0 }}>{id ? 'Editar Artigo' : 'Novo Artigo'}</Typography.H2>
                    <button onClick={salvar} disabled={salvando} style={{ color: 'var(--primary)' }}><FiSave size={24} /></button>
                </Flex>

                <Card>
                    <InputWrapper>
                        <Label>Título do Artigo</Label>
                        <InputField value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: 5 Dicas para emagrecer" />
                    </InputWrapper>

                    <Flex $gap="15px" style={{ marginTop: '15px' }}>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Categoria</Label>
                            <InputField value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: NUTRIÇÃO" />
                        </InputWrapper>
                        <InputWrapper style={{ flex: 1 }}>
                            <Label>Tempo de Leitura</Label>
                            <InputField value={form.tempoLeitura} onChange={e => setForm({ ...form, tempoLeitura: e.target.value })} />
                        </InputWrapper>
                    </Flex>

                    <InputWrapper style={{ marginTop: '15px' }}>
                        <Label>URL da Imagem</Label>
                        <InputField value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                    </InputWrapper>

                    <InputWrapper style={{ marginTop: '15px' }}>
                        <Label>Conteúdo (Markdown opcional)</Label>
                        <TextAreaField
                            value={form.conteudo}
                            onChange={e => setForm({ ...form, conteudo: e.target.value })}
                            placeholder="Escreva o artigo aqui..."
                            style={{ minHeight: '300px' }}
                        />
                    </InputWrapper>
                </Card>

                <BotaoPrimario onClick={salvar} disabled={salvando} style={{ marginTop: '20px', marginBottom: '40px' }}>
                    {salvando ? 'Salvando...' : 'Salvar no Banco'}
                </BotaoPrimario>
            </Container>
        </AppShell>
    );
};

export default NovoArtigo;
