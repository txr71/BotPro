const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    whatsapp: String,
    nome: String,
    telefone: String,
    cep: String,
    renda: String,
    restricao: String, // Ex: SIM / NÃO
    valorDesejado: String,
    cpf: String,
    email: String,
    classificacao: String, // QUENTE / MORNO / FRIO
    justificativa: String, // explicação do OpenAI
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
