const admin = require('firebase-admin');

// Para usar este script, você deve baixar o arquivo JSON de chave privada 
// do console do Firebase (Configurações do Projeto > Contas de Serviço)
// e salvar como 'serviceAccountKey.json' na raiz do projeto.

if (require.main === module) {
    try {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized Successfully");

        // Use admin.auth() ou admin.firestore() para tarefas administrativas

    } catch (error) {
        console.error("Erro ao carregar serviceAccountKey.json. Certifique-se de que o arquivo existe na raiz do projeto.");
    }
}

module.exports = admin;
