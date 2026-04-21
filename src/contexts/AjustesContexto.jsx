import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from './AuthContexto';

const AjustesContexto = createContext({});

export const useAjustes = () => useContext(AjustesContexto);

export const AjustesProvider = ({ children }) => {
    const { usuario } = useAuth();
    const [ajustes, setAjustes] = useState({
        corPrincipal: '#8A2BE2',
        nomePainel: 'FITBODY',
        iconePainel: 'FaDumbbell'
    });
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (ajustes.nomePainel) {
            document.title = `${ajustes.nomePainel} Fitness | Treinos e Nutrição`;
        }
    }, [ajustes.nomePainel]);

    useEffect(() => {
        if (!usuario) {
            setCarregando(false);
            return;
        }

        const docRef = doc(db, 'usuarios', usuario.uid);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.configuracoes) {
                    setAjustes(prev => ({
                        ...prev,
                        ...data.configuracoes
                    }));
                }
            }
            setCarregando(false);
        });

        return () => unsubscribe();
    }, [usuario]);

    const atualizarAjustes = async (novosAjustes) => {
        if (!usuario) return;
        try {
            await setDoc(doc(db, 'usuarios', usuario.uid), {
                configuracoes: novosAjustes
            }, { merge: true });
        } catch (error) {
            console.error("Erro ao atualizar ajustes:", error);
            throw error;
        }
    };

    const value = {
        ajustes,
        atualizarAjustes,
        carregando
    };

    return (
        <AjustesContexto.Provider value={value}>
            {children}
        </AjustesContexto.Provider>
    );
};
