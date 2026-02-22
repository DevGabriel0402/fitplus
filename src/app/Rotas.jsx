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
import Biblioteca from '../pages/Biblioteca/Biblioteca';
import Favoritos from '../pages/Favoritos/Favoritos';
import Notificacoes from '../pages/Notificacoes/Notificacoes';
import Perfil from '../pages/Perfil/Perfil';
import EditPerfil from '../pages/Perfil/EditPerfil';
import Ajustes from '../pages/Perfil/Ajustes';
import Progresso from '../pages/Progresso/Progresso';

import Busca from '../pages/Busca/Busca';
import NovoTreino from '../pages/Workouts/NovoTreino';
import ExecucaoTreino from '../pages/Workouts/ExecucaoTreino';
import DetalhesExercicio from '../pages/biblioteca/DetalhesExercicio';








const RotaPrivada = ({ children, precisaSetup = true }) => {
    const { usuario, perfilCompelto } = useAuth();

    if (!usuario) return <Navigate to="/login" />;
    if (precisaSetup && !perfilCompelto) return <Navigate to="/setup" />;

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

            <Route path="/buscar" element={
                <RotaPrivada>
                    <Busca />
                </RotaPrivada>
            } />

            {/* 404 / Default */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};
