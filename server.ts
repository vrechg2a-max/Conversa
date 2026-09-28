import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System instruction enforcing the user's exact specification
const SYSTEM_PROMPT = `
Você é o Avaliador de Conhecimento e Especialista em Aprendizagem Ativa (Técnica de Feynman / Papel de Professor).
O usuário assumirá o papel de professor e explicará uma matéria para você.
Sua missão é:
1. Ouvir com extrema atenção técnica.
2. Registrar a conversa em tempo real.
3. Corrigir imediatamente erros conceituais graves ou uso incorreto de jargões técnicos.
4. Avaliar a precisão da explicação com o rigor implacável das principais bancas examinadoras de concursos e carreiras jurídicas/públicas (Cebraspe/CESPE, Vunesp, FGV, FEPESE, FCC, etc.).

POSTURA DO AVALIADOR:
- Seja seco, acadêmico, cirúrgico e implacável.
- NUNCA faça elogios genéricos ("ótimo", "parabéns", "muito bom", "excelente explicação").
- Não use linguagem motivacional.
- Se a explicação for rasa, aponte com frieza técnica que seria insuficiente para uma questão discursiva ou prova oral.
- Se a explicação estiver correta, responda apenas com frases secas e curtas de incentivo para ele continuar (ex: "Correto. Prossiga.", "Conforme a doutrina dominante. Continue.", "Certo. Prossiga com os elementos.").

REGRAS DE OPERAÇÃO:

1. ABERTURA E ESTRUTURAÇÃO:
Quando o usuário informar o tema (ex: "Vou falar sobre Direito Penal - Teoria do Crime"), crie imediatamente o cabeçalho em texto puro:
[TÓPICO ABERTO: {Nome do Tema} | DATA: {Data no formato DD/MM/AAAA HH:mm} | BANCA: {Banca Selecionada}]
E diga estritamente: "Tópico registrado. Pode começar a explicação."
Não adicione mais nenhuma palavra de saudação nem introdução.

2. INTERVENÇÃO EM TEMPO REAL:
Enquanto o usuário explica a matéria:
- Se a afirmação estiver CORRETA ou razoavelmente sólida: dê apenas uma resposta curta de incentivo para continuar (ex: "Correto. Prossiga.", "Exato. Continue.", "De acordo. Prossiga para o próximo aspecto.").
- Se ele cometer um ERRO CONCEITUAL GRAVE ou usar o jargão jurídico/técnico errado: INTERROMPA-O IMEDIATAMENTE.
  A correção DEVE ter no máximo duas frases: aponte o erro e indique a correção técnica, e mande-o retomar o raciocínio.
  Exemplo de interrupção:
  "Interrupção da Banca: Dolo eventual não se confunde com culpa consciente; na culpa consciente o agente antevê o resultado mas confia sinceramente que ele não ocorrerá. Retome o raciocínio."

3. AVALIAÇÃO E ENCERRAMENTO DO TÓPICO:
Quando o usuário indicar que terminou (ex: "Encerrei", "É isso", "Terminei", "Fim da explicação", "Concluí"), gere OBRIGATORIAMENTE o seguinte relatório estruturado em texto puro:

--- AVALIAÇÃO DE RETENÇÃO ---

Diagnóstico de Precisão: (Diga claramente se a explicação foi superficial, mediana ou aprofundada, com justificativa técnica se passaria numa prova discursiva/oral da banca).

Correções Realizadas: (Liste em bullet points '-' os erros cometidos e a informação técnica correta correspondente).

Pontos Cegos: (Liste em bullet points '-' os aspectos que são amplamente cobrados em provas sobre esse tema e que o usuário ESQUECEU ou omitiu na explicação).

Resumo Consolidado: (Gere um parágrafo denso e direto sintetizando o que foi explicado + os pontos cegos, com o vocabulário e rigor técnico da banca, para servir de material de revisão ativa).

FORMATO DA RESPOSTA DA API:
Além do texto, para cada turno, identifique se o seu retorno é:
- "OPENING" (registro do tópico)
- "CORRECT_PROCEED" (incentivo curto a continuar)
- "INTERRUPTION" (interrupção e correção técnica de erro)
- "EVALUATION" (relatório final de encerramento)
`;

// Helper endpoint for evaluating/chatting
app.post('/api/evaluate', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor. Configure a variável no ambiente.',
      });
    }

    const {
      topic,
      board = 'Cebraspe',
      action = 'message', // 'open' | 'message' | 'finish'
      history = [],
      userMessage = '',
      currentDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    } = req.body;

    let promptContents: string[] = [];

    if (action === 'open') {
      promptContents = [
        `O usuário está abrindo o tópico agora.
Tema: "${topic}"
Banca Examinadora de Referência: "${board}"
Data atual: ${currentDate}

Aja de acordo com a Regra 1 (Abertura e Estruturação):
Gere o cabeçalho em texto puro exatamente no formato:
[TÓPICO ABERTO: ${topic} | DATA: ${currentDate} | BANCA: ${board}]
E adicione apenas:
"Tópico registrado. Pode começar a explicação."
Não adicione mais nada.`,
      ];
    } else if (action === 'finish') {
      promptContents = [
        `O usuário declarou o encerramento da explicação sobre o tópico: "${topic}".
Banca de rigor: "${board}".
Histórico da explicação do usuário e intervenções anteriores:
${JSON.stringify(history, null, 2)}

Mensagem de encerramento do usuário: "${userMessage || 'Encerrei minha explicação.'}"

Agora gere rigorosamente o relatório final de acordo com a Regra 3 (Avaliação e Encerramento do Tópico):
--- AVALIAÇÃO DE RETENÇÃO ---

Diagnóstico de Precisão: [superficial, mediana ou aprofundada, com justificativa técnica implacável para a banca ${board}]

Correções Realizadas:
- [Liste os erros corrigidos ou indique 'Nenhum erro conceitual grave identificado durante a explanação.']

Pontos Cegos:
- [Aspectos amplamente cobrados em provas pela banca ${board} sobre ${topic} que foram omitidos pelo candidato]

Resumo Consolidado:
[Parágrafo denso e direto sintetizando a matéria com rigor técnico da banca ${board}]`,
      ];
    } else {
      // Normal explanation turn
      // Detect if user message signals finish
      const normalizedMsg = userMessage.trim().toLowerCase();
      const finishKeywords = ['encerrei', 'é isso', 'terminei', 'fim', 'concluí', 'conclui', 'finalizei', 'acabei'];
      const isFinishing = finishKeywords.some((k) => normalizedMsg === k || normalizedMsg.startsWith(k + '.') || normalizedMsg.startsWith(k + '!'));

      if (isFinishing) {
        promptContents = [
          `O usuário sinalizou encerramento com a mensagem: "${userMessage}".
Tópico: "${topic}"
Banca: "${board}"
Histórico completo:
${JSON.stringify(history, null, 2)}

Gere agora a AVALIAÇÃO DE RETENÇÃO completa conforme a Regra 3.`,
        ];
      } else {
        promptContents = [
          `Tópico sendo explicado pelo usuário (no papel de professor): "${topic}".
Banca avaliadora de rigor: "${board}".
Histórico recente da conversa:
${JSON.stringify(history.slice(-8), null, 2)}

Nova fala do usuário (explicação da matéria):
"${userMessage}"

Sua tarefa de Avaliador de Conhecimento e Especialista em Aprendizagem Ativa:
- Avalie a exatidão conceitual, o jargão técnico, a precisão jurídica/técnica e a adequação ao padrão da banca ${board}.
- Se estiver CORRETO: responda APENAS com um incentivo curto para ele continuar (ex: "Correto. Prossiga.", "Conforme a doutrina dominante. Continue.", "Certo. Prossiga.").
- Se houver ERRO CONCEITUAL GRAVE ou jargão equivocado: INTERROMPA-O IMEDIATAMENTE. Corrija em NO MÁXIMO DUAS FRASES e ordene que retome o raciocínio.
- Mantenha a postura fria, acadêmica, seca e implacável. Jamais elogie.`,
        ];
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContents.join('\n\n'),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2, // low temperature for rigorous, factual exam board behavior
      },
    });

    const replyText = response.text?.trim() || '';

    // Classify turn type
    let turnType: 'OPENING' | 'CORRECT_PROCEED' | 'INTERRUPTION' | 'EVALUATION' = 'CORRECT_PROCEED';
    if (replyText.includes('[TÓPICO ABERTO:')) {
      turnType = 'OPENING';
    } else if (replyText.includes('--- AVALIAÇÃO DE RETENÇÃO ---')) {
      turnType = 'EVALUATION';
    } else if (
      replyText.toLowerCase().includes('interrupção') ||
      replyText.toLowerCase().includes('incorreto') ||
      replyText.toLowerCase().includes('retome o raciocínio') ||
      replyText.toLowerCase().includes('atenção') ||
      replyText.toLowerCase().includes('equívoco') ||
      replyText.toLowerCase().includes('retome')
    ) {
      turnType = 'INTERRUPTION';
    }

    return res.json({
      text: replyText,
      turnType,
      topic,
      board,
    });
  } catch (error: any) {
    console.error('Erro na avaliação Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar avaliação com a banca.',
    });
  }
});

// Configure Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BancaExaminadoraAI servidor rodando na porta ${PORT}`);
  });
}

startServer();
