import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexto';

import Splash from '../pages/Splash/Splash';
import Onboarding from '../pages/Onboarding/Onboarding';
import Login from '../pages/Auth/Login/Login';
import Cadastro from '../pages/Auth/Cadastro/Cadastro';
import EsqueciSenha from '../pages/Auth/EsqueciSenha/EsqueciSenha';
import SetupWizard from '../pages/Setup/SetupWizard';
import Home from '../pages/Home/Home';
import Workouts from '../pages/Workouts/Workouts';
import Biblioteca from '../pages/biblioteca/Biblioteca';
import Favoritos from '../pages/Favoritos/Favoritos';
import Notificacoes from '../pages/Notificacoes/Notificacoes';
import Perfil from '../pages/Perfil/Perfil';
import EditPerfil from '../pages/Perfil/EditPerfil';
import Ajustes from '../pages/Perfil/Ajustes';
import Progresso from '../pages/Progresso/Progresso';

import NovoTreino from '../pages/Workouts/NovoTreino';
import ExecucaoTreino from '../pages/Workouts/ExecucaoTreino';
import DetalhesTreino from '../pages/Workouts/DetalhesTreino';
import DetalhesExercicio from '../pages/biblioteca/DetalhesExercicio';

// Admin / Gerenciamento
import GerenciarSugestoes from '../pages/Admin/GerenciarSugestoes';
import NovaSugestao from '../pages/Admin/NovaSugestao';
import GerenciarArtigos from '../pages/Admin/GerenciarArtigos';
import NovoArtigo from '../pages/Admin/NovoArtigo';
import DashboardAdmin from '../pages/Admin/DashboardAdmin';
import GerenciarUsuarios from '../pages/Admin/GerenciarUsuarios';
import GerenciarFeedbacks from '../pages/Admin/GerenciarFeedbacks';










const RotaPrivada = ({ children, precisaSetup = true, apenasAdmin = false }) => {
    const { usuario, perfilCompleto, dadosUsuario } = useAuth();

    if (!usuario) return <Navigate to="/login" />;

    // Verificação de Conta Ativa
    if (dadosUsuario?.ativo === false) {
        return <Navigate to="/login" />;
    }

    if (precisaSetup && !perfilCompleto) return <Navigate to="/setup" />;

    // Verificação de Admin
    if (apenasAdmin && dadosUsuario?.role?.toLowerCase() !== 'admin') {
        return <Navigate to="/home" />;
    }


    return children;
};

export const Rotas = () => {
    return (
        <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />

            {/* Rotas Protegidas */}
            <Route path="/setup" element={
                <RotaPrivada precisaSetup={false}>
                    <SetupWizard />
                </RotaPrivada>
            } />

            <Route path="/home" element={
                <RotaPrivada>
                    <Home />
                </RotaPrivada>
            } />

            <Route path="/workouts" element={
                <RotaPrivada>
                    <Workouts />
                </RotaPrivada>
            } />

            <Route path="/workouts/novo" element={
                <RotaPrivada>
                    <NovoTreino />
                </RotaPrivada>
            } />

            <Route path="/workouts/editar/:id" element={
                <RotaPrivada>
                    <NovoTreino />
                </RotaPrivada>
            } />


            <Route path="/workouts/execucao/:id" element={
                <RotaPrivada>
                    <ExecucaoTreino />
                </RotaPrivada>
            } />

            <Route path="/biblioteca" element={
                <RotaPrivada>
                    <Biblioteca />
                </RotaPrivada>
            } />

            <Route path="/detalhes-treino/:id" element={
                <RotaPrivada>
                    <DetalhesTreino />
                </RotaPrivada>
            } />

            <Route path="/exercicio/:id" element={
                <RotaPrivada>
                    <DetalhesExercicio />
                </RotaPrivada>
            } />


            <Route path="/favoritos" element={
                <RotaPrivada>
                    <Favoritos />
                </RotaPrivada>
            } />

            <Route path="/notificacoes" element={
                <RotaPrivada>
                    <Notificacoes />
                </RotaPrivada>
            } />

            <Route path="/perfil" element={
                <RotaPrivada>
                    <Perfil />
                </RotaPrivada>
            } />

            <Route path="/perfil/editar" element={
                <RotaPrivada>
                    <EditPerfil />
                </RotaPrivada>
            } />

            <Route path="/perfil/ajustes" element={
                <RotaPrivada>
                    <Ajustes />
                </RotaPrivada>
            } />


            <Route path="/progresso" element={
                <RotaPrivada>
                    <Progresso />
                </RotaPrivada>
            } />

            <Route path="/admin" element={
                <RotaPrivada apenasAdmin={true}>
                    <DashboardAdmin />
                </RotaPrivada>
            } />

            <Route path="/admin/usuarios" element={
                <RotaPrivada apenasAdmin={true}>
                    <GerenciarUsuarios />
                </RotaPrivada>
            } />

            <Route path="/admin/feedbacks" element={
                <RotaPrivada apenasAdmin={true}>
                    <GerenciarFeedbacks />
                </RotaPrivada>
            } />


            <Route path="/admin/sugestoes" element={
                <RotaPrivada apenasAdmin={true}>
                    <GerenciarSugestoes />
                </RotaPrivada>
            } />



            <Route path="/admin/sugestoes/nova" element={
                <RotaPrivada apenasAdmin={true}>
                    <NovaSugestao />
                </RotaPrivada>
            } />


            <Route path="/admin/sugestoes/editar/:id" element={
                <RotaPrivada apenasAdmin={true}>
                    <NovaSugestao />
                </RotaPrivada>
            } />


            <Route path="/admin/artigos" element={
                <RotaPrivada apenasAdmin={true}>
                    <GerenciarArtigos />
                </RotaPrivada>
            } />


            <Route path="/admin/artigos/novo" element={
                <RotaPrivada apenasAdmin={true}>
                    <NovoArtigo />
                </RotaPrivada>
            } />


            <Route path="/admin/artigos/editar/:id" element={
                <RotaPrivada apenasAdmin={true}>
                    <NovoArtigo />
                </RotaPrivada>
            } />


            {/* 404 / Default */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
