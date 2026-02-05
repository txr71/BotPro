const Lead = require('../server/models/Lead');
const openai = require('./openai');

const conversations = {}; // estado por WhatsApp

async function handleMessage(sock, from, text) {
    if (!conversations[from]) {
        conversations[from] = { step: 2, whatsapp: from };
        await sock.sendMessage(from, { 
            text: 'Olá! Seja bem-vindo ao nosso atendimento.\n\nPara iniciarmos, poderia informar seu nome completo?' 
        });
        return;
    }

    const convo = conversations[from];

    switch (convo.step) {

        case 2:
            convo.nome = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: `Obrigado, ${convo.nome}.\n\nAgora, informe por favor um telefone para contato.` 
            });
            break;

        case 3:
            convo.telefone = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Perfeito. Poderia informar o seu CEP?' 
            });
            break;

        case 4:
            convo.cep = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Qual é a sua renda mensal aproximada?' 
            });
            break;

        case 5:
            convo.renda = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Atualmente, você possui alguma restrição financeira? (Sim ou Não)' 
            });
            break;

        case 6:
            convo.restricao = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Qual o valor aproximado que você deseja para o financiamento ou empréstimo?' 
            });
            break;

        case 7:
            convo.valorDesejado = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Por gentileza, informe o seu CPF.' 
            });
            break;

        case 8:
            convo.cpf = text;
            convo.step++;
            await sock.sendMessage(from, { 
                text: 'Para finalizar, informe seu e-mail para contato.' 
            });
            break;

        case 9:
            convo.email = text;

            let resultado;
            try {
                resultado = await openai.analyzeLead(convo);
            } catch (err) {
                console.error('[analyzeLead] erro, usando fallback:', err.message);
                resultado = {
                    classificacao: 'MORNO',
                    justificativa: 'Análise realizada por critério padrão'
                };
            }

            const lead = new Lead({
                ...convo,
                classificacao: resultado.classificacao,
                justificativa: resultado.justificativa
            });

            await lead.save();

            // Aguarda antes de responder
            await new Promise(resolve => setTimeout(resolve, 15000));

            await sock.sendMessage(from, {
                text:
`Agradecemos pelo envio das informações, ${convo.nome}.

Sua solicitação foi registrada com sucesso e passará por uma análise interna.
Em breve, um de nossos especialistas entrará em contato para dar continuidade ao atendimento.

Desejamos um excelente dia.`
            });

            delete conversations[from];
            break;
    }
}

module.exports = handleMessage;
