import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContexto';
import { db } from '../firebase/firestore';

export const useUsuario = () => {
    const { usuario } = useAuth();
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!usuario) {
            setDados(null);
            setCarregando(false);
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'usuarios', usuario.uid), (doc) => {
            if (doc.exists()) {
                setDados(doc.data());
            }
            setCarregando(false);
        });

        return () => unsubscribe();
    }, [usuario]);

    return { dados, carregando };
};
