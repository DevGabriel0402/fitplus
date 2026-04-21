import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export const createMockStudent = async () => {
    const mockId = "mock_aluno_001";
    const mockData = {
        nome: "João Exemplo",
        email: "joao@exemplo.com",
        genero: "Masculino",
        idade: "28",
        peso: "80",
        altura: "180",
        objetivo: "Ganhar Músculo",
        nivelAtividade: "Intermediário (3-4 dias/sem)",
        diasTreino: ["Seg", "Qua", "Sex"],
        setupCompleto: true,
        ativo: true,
        role: "user",
        criadoEm: new Date()
    };

    try {
        await setDoc(doc(db, 'usuarios', mockId), mockData);
        console.log("Aluno de exemplo criado com sucesso!");
    } catch (error) {
        console.error("Erro ao criar aluno de exemplo:", error);
    }
};
