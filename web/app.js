// server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Carrega variáveis do .env
dotenv.config();

// Inicializa o Express
const app = express();

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Variáveis de ambiente
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/botpro";

// Conecta ao MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado ao MongoDB"))
.catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// Rotas de teste
app.get("/", (req, res) => {
    res.send("Servidor rodando! Tudo OK ✅");
});

// Importa rotas de leads
const leadRoutes = require("./routes/routeLead");
app.use("/leads", leadRoutes); // todas as rotas começarão com /leads

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
