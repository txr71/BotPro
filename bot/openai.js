const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config({ path: "../.env" }); // ajuste se necessário

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("⚠️ OPENAI_API_KEY não definida. Usando fallback automático.");
}

/**
 * Avaliação local de potencial (fallback)
 */
function calcularPotencial(lead) {
  let score = 0;

  if (lead.renda >= 5000) score += 2;
  else if (lead.renda >= 2500) score += 1;

  if (!lead.restricao || lead.restricao === "nao") score += 2;

  if (lead.valorDesejado && lead.valorDesejado <= lead.renda * 10) score += 1;

  if (lead.telefone) score += 1;
  if (lead.email) score += 1;

  let classificacao = "FRIO";
  if (score >= 6) classificacao = "QUENTE";
  else if (score >= 3) classificacao = "MORNO";

  const probabilidade = Math.min(100, Math.round((score / 7) * 100));

  return { classificacao, probabilidade };
}

/**
 * Análise principal
 */
async function analyzeLead(lead) {
  // 🔹 Se OpenAI não estiver disponível
  if (!openai) {
    const resultado = calcularPotencial(lead);
    return {
      ...resultado,
      justificativa: "Classificação baseada em regras de potencial",
      fonte: "fallback",
    };
  }

  const prompt = `
Analise este lead financeiro e responda APENAS em JSON válido.

Nome: ${lead.nome}
Renda: ${lead.renda}
Restrição: ${lead.restricao}
Valor desejado: ${lead.valorDesejado}
Telefone: ${lead.telefone}
Email: ${lead.email}

Formato esperado:
{
  "classificacao": "QUENTE | MORNO | FRIO",
  "justificativa": "texto curto"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);

    return {
      classificacao: parsed.classificacao,
      justificativa: parsed.justificativa,
      fonte: "openai",
    };

  } catch (err) {
    console.warn("⚠️ OpenAI falhou. Aplicando fallback.", err.message);

    const resultado = calcularPotencial(lead);

    return {
      ...resultado,
      justificativa: "Fallback automático por indisponibilidade da IA",
      fonte: "fallback",
    };
  }
}

module.exports = { analyzeLead };
