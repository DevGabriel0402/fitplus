import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export const useColecao = (nomeColecao, filtros = []) => {
    const [documentos, setDocumentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let q = collection(db, nomeColecao);

        // Simplificação para o MVP: aplica filtros básicos se fornecidos
        // Filtros devem ser um array de objetos { campo, op, valor }
        if (filtros.length > 0) {
            const constraints = filtros.map(f => where(f.campo, f.op, f.valor));
            q = query(q, ...constraints);
        } else {
            q = query(q, orderBy('criadoEm', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDocumentos(docs);
            setCarregando(false);
        }, (error) => {
            console.error(`Erro na coleção ${nomeColecao}:`, error);
            setCarregando(false);
        });

        return () => unsubscribe();
    }, [nomeColecao, JSON.stringify(filtros)]);

    return { documentos, carregando };
};
