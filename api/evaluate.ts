import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `
Você é o Tutor de Voz e Parceiro de Estudos Interativo do aplicativo "Conversa AI".
O usuário é um estudante praticando a Técnica de Feynman: ele assume o papel de professor e explica uma matéria para você em tempo real por voz.

COMO VOCÊ SE COMPORTA DURANTE A EXPLICAÇÃO:
1. Respostas Curtas, Dinâmicas e Naturais para Voz (PT-BR):
   - Fale como um parceiro de estudos atento, amigável, inteligente e tecnicamente preciso.
   - Mantenha cada turno com 2 a 3 frases curtas e fluidas, ideais para serem lidas em voz alta pelo sintetizador de voz (TTS).
   - NUNCA envie listas gigantescas ou formatação pesada durante o bate-papo de voz.
2. Intervenção Dinâmica e Interativa:
   - Se o usuário explicar algo CORRETO: valide brevemente e faça UMA pergunta de aprofundamento instigante sobre o tema para testar se ele realmente domina as nuances (ex: "Muito bom! E sobre os sujeitos do crime, um particular em concurso pode responder por abuso de autoridade?").
   - Se o usuário cometer um ERRO CONCEITUAL ou usar termos errados: CORRIJA IMEDIATAMENTE de forma clara, educada e direta, citando a regra correta e incentivando-o a continuar (ex: "Atenção a um ponto importante: a divergência na interpretação da lei NÃO configura abuso de autoridade, lembra do art. 1º, § 2º? Continue, como ficam as penas?").
3. ENCERRAMENTO E AVALIAÇÃO FINAL (ação 'finish' ou quando o usuário disser que terminou/encerrou):
   - Avalie com rigor e honestidade técnica todo o conteúdo explicado.
   - Atribua uma nota de 0.0 a 10.0.
   - Identifique claramente:
     * whatWentWrong: o que o usuário falou de errado (equívocos conceituais específicos e as devidas correções).
     * whatToImprove: o que ele precisa melhorar (aspectos importantes do tema que foram omitidos ou merecem aprofundamento).
     * strengths: pontos fortes demonstrados na explicação.
     * summary: resumo prático de fixação do tópico.
     * spokenFeedback: fala curta de 2 a 3 frases para a IA ler em voz alta parabenizando pelo encerramento e anunciando a nota.

FORMATO OBRIGATÓRIO DE RESPOSTA (JSON PURO):
Para turnos normais de conversa:
{
  "type": "CHAT",
  "interlocutionType": "question" | "correction" | "encouragement",
  "spokenFeedback": "Texto natural em português para ser falado em voz alta pela IA.",
  "detectedCorrection": "Breve frase do erro corrigido, ou null se não houve erro"
}

Para turno de finalização/avaliação:
{
  "type": "EVALUATION",
  "spokenFeedback": "Parabéns por concluir sua explicação sobre [Tópico]! Sua nota foi [Nota]. Deixei registrado no seu relatório os pontos fortes e as correções necessárias.",
  "evaluation": {
    "grade": 8.5,
    "gradeLevel": "Excelente" | "Domínio Avançado" | "Intermediário" | "Superficial / Precisa Revisar",
    "whatWentWrong": ["Equívoco 1 cometido e explicação correta..."],
    "whatToImprove": ["Aspecto importante que foi omitido..."],
    "strengths": ["Conceito explicado com precisão..."],
    "summary": "Resumo denso dos conceitos-chave para fixação do tópico."
  }
}
`;

// Priority: gemini-3.1-flash-lite (high capacity, ultra-fast latency, dedicated quota) -> gemini-flash-latest -> gemini-3.8-flash
const MODELS_TO_TRY = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

async function generateWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  systemPrompt: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          responseMimeType: 'application/json',
        };

        if (model.startsWith('gemini-3')) {
          config.thinkingConfig = {
            thinkingLevel: 'MINIMAL',
          };
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const text = response.text?.trim() || '';
        if (text) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const is404 = msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('no longer available');
        const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand');

        console.warn(`[Conversa AI] Modelo ${model} tentativa ${attempt} falhou: ${msg.slice(0, 120)}`);

        if (is404) {
          // Model deprecated or not found on this account, skip immediately
          break;
        }

        if (is503 && attempt === 1) {
          // Brief backoff before retry to overcome momentary load spikes
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
      }
    }
  }

  throw lastError || new Error('Não foi possível obter resposta de nenhum modelo disponível.');
}

function extractJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(sub);
      } catch {}
    }
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const key = process.env.GEMINI_API_KEY || apiKey;
    if (!key) {
      return res.status(500).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor Vercel. Configure nas variáveis de ambiente.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'conversa-ai',
        },
      },
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      topic = 'Matéria de Estudo',
      action = 'message', // 'open' | 'message' | 'finish'
      history = [],
      userMessage = '',
    } = body;

    let promptContents: string[] = [];

    if (action === 'open') {
      promptContents = [
        `O usuário está iniciando o tópico: "${topic}".
Responda dando as boas-vindas de forma calorosa e encorajadora em exatamente 2 frases curtas, convidando-o a começar a explicar a matéria com as próprias palavras.
Retorne no formato JSON CHAT:
{
  "type": "CHAT",
  "interlocutionType": "encouragement",
  "spokenFeedback": "Excelente tema! Pode começar a me explicar ${topic} quando quiser. Estou ouvindo com atenção.",
  "detectedCorrection": null
}`,
      ];
    } else if (action === 'finish') {
      promptContents = [
        `O usuário declarou o encerramento da explicação sobre o tópico: "${topic}".
Histórico da conversa até o momento:
${JSON.stringify(history, null, 2)}

Mensagem final do usuário: "${userMessage || 'Encerrei minha explicação.'}"

Gere agora a avaliação final rigorosa e completa no formato JSON puro EVALUATION com nota de 0 a 10, whatWentWrong, whatToImprove, strengths, summary e spokenFeedback.`,
      ];
    } else {
      const normalizedMsg = (userMessage || '').trim().toLowerCase();
      const finishKeywords = ['encerrei', 'é isso', 'terminei', 'fim', 'concluí', 'conclui', 'finalizei', 'acabei', 'terminei a explicação', 'pode avaliar'];
      const isFinishing = finishKeywords.some(
        (k) => normalizedMsg === k || normalizedMsg.startsWith(k + '.') || normalizedMsg.startsWith(k + '!')
      );

      if (isFinishing) {
        promptContents = [
          `O usuário sinalizou encerramento com a mensagem: "${userMessage}".
Tópico explicado: "${topic}".
Histórico completo:
${JSON.stringify(history, null, 2)}

Gere agora o relatório de avaliação final em JSON puro EVALUATION.`,
        ];
      } else {
        promptContents = [
          `Tópico sendo explicado pelo usuário: "${topic}".
Histórico recente da conversa:
${JSON.stringify(history.slice(-8), null, 2)}

Nova fala do usuário (explicação da matéria):
"${userMessage}"

Sua tarefa:
- Ouça atentamente.
- Se houver algum erro conceitual grave ou jargão equivocado: corrija imediatamente em 2 frases amigáveis e precisas ("interlocutionType": "correction").
- Se estiver correto: valide brevemente e faça UMA pergunta estimulante para aprofundar o tema ("interlocutionType": "question").
- Lembre-se: fala concisa (2 a 3 frases curtas), natural para ser dita por voz em português.
Retorne estritamente em JSON CHAT.`,
        ];
      }
    }

    const { text: responseText, modelUsed } = await generateWithFallback(
      ai,
      promptContents.join('\n\n'),
      SYSTEM_PROMPT
    );

    const parsedJson = extractJson(responseText);

    if (parsedJson) {
      parsedJson._model = modelUsed;
      return res.status(200).json(parsedJson);
    }

    return res.status(200).json({
      type: 'CHAT',
      interlocutionType: 'question',
      spokenFeedback: responseText || 'Muito interessante. Continue sua explicação!',
      detectedCorrection: null,
      _model: modelUsed,
    });
  } catch (error: any) {
    console.error('Erro no handler Vercel evaluate:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar avaliação com a IA.',
    });
  }
}
