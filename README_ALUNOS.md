# 🚀 Guia do Aluno: FitPlus (Firebase & Admin)

Este projeto utiliza o Firebase para autenticação e banco de dados. Siga os passos abaixo para configurar seu ambiente.

---

## 1. Configuração do Firebase Console

1.  **Criar Projeto**: [Firebase Console](https://console.firebase.google.com/) > Adicionar projeto.
2.  **Authentication**: Ative o provedor **E-mail/Senha**.
3.  **Firestore Database**: Crie o banco em "Test Mode" na região `southamerica-east1` (ou similar).
4.  **Storage**: Ative com as configurações padrão.
5.  **Web App**: Registre um app web e copie o `firebaseConfig`.

---

## 2. Variáveis de Ambiente

Crie um arquivo chamado **`.env`** na raiz do projeto e use o conteúdo do `.env.example` como base, preenchendo com suas chaves.

---

## 3. Regras de Segurança (Firestore)

No Console do Firebase, vá em Firestore > Rules e cole as regras contidas no arquivo `firestore.rules` deste repositório.

---

## 4. Painel de Administrador

O projeto possui uma interface completa para gerenciar o conteúdo:

- **Acesso**: Vá em **Perfil** > **Painel Administrativo**.
- **Funções**:
    - **Artigos & Dicas**: Gerencie o conteúdo educativo da Home.
    - **Sugestões**: Crie treinos oficiais para todos os usuários.
    - **Biblioteca**: Cadastre novos exercícios globais.

> [!IMPORTANT]
> Lembre-se de rodar `npm install` e `npm run dev` após configurar o `.env`.
