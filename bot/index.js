// bot/index.js
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const handleMessage = require('./conversation');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config(); // Carrega o .env

// -----------------------------
// Variáveis de ambiente críticas
// -----------------------------
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

// Valida variáveis essenciais
if (!MONGO_URI) {
    console.error('❌ MONGO_URI não definida! Verifique seu arquivo .env');
    process.exit(1);
}

// Conecta ao MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB'))
    .catch(err => {
        console.error('❌ Erro MongoDB:', err);
        process.exit(1);
    });

// -----------------------------
// Função principal do Bot
// -----------------------------
async function startBot() {
    try {
        // Inicializa autenticação multi-arquivo
        const { state, saveCreds } = await useMultiFileAuthState('bot/auth_info');
        const sock = makeWASocket({ auth: state });

        // Atualiza credenciais
        sock.ev.on('creds.update', saveCreds);

        // QR Code e status da conexão
        sock.ev.on('connection.update', ({ connection, qr }) => {
            if (qr) {
                console.clear();
                console.log('📌 Escaneie o QR Code:');
                qrcode.generate(qr, { small: true });
            }
            if (connection === 'open') console.log('✅ Bot conectado!');
            if (connection === 'close') console.log('❌ Conexão fechada, reinicie o bot se necessário');
        });

        // Recebe mensagens
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return; // Ignora mensagens próprias
            const from = msg.key.remoteJid;
            if (from.endsWith('@g.us')) return; // Ignora grupos

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            if (!text) return;

            try {
                await handleMessage(sock, from, text, OPENAI_API_KEY); // Passa API Key para handler
            } catch (err) {
                console.error('❌ Erro ao processar mensagem:', err);
            }
        });

    } catch (err) {
        console.error('❌ Erro ao iniciar bot:', err);
        process.exit(1);
    }
}

// Inicia o bot
startBot();
