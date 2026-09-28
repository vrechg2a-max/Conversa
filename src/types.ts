export interface TopicEvaluation {
  grade: number; // 0.0 to 10.0
  gradeLevel: 'Excelente' | 'Domínio Avançado' | 'Intermediário' | 'Superficial / Precisa Revisar';
  whatWentWrong: string[]; // o que falou de errado / correções conceituais
  whatToImprove: string[]; // o que precisa melhorar / lacunas
  strengths: string[]; // o que falou certo / pontos fortes
  summary: string; // resumo denso para fixação
}

export type InterlocutionType = 'question' | 'correction' | 'encouragement' | 'evaluation' | 'general';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  interlocutionType?: InterlocutionType;
  detectedCorrection?: string;
  evaluation?: TopicEvaluation;
}

export interface SavedTopicSession {
  id: string;
  topic: string;
  date: string;
  updatedAt: string;
  messages: ChatMessage[];
  evaluation?: TopicEvaluation;
  interruptionCount: number;
  attemptsCount: number;
}

export interface CuratedTopic {
  title: string;
  category: string;
  description: string;
  promptExample: string;
}

export const POPULAR_TOPICS: CuratedTopic[] = [
  {
    title: 'Lei de Abuso de Autoridade (Lei 13.869/19)',
    category: 'Direito Penal & Legislação',
    description: 'Sujeitos ativos, dolo específico, perda do cargo e divergência hermenêutica.',
    promptExample: 'Vou explicar os principais pontos da Lei de Abuso de Autoridade, os sujeitos ativo e passivo e as penas.'
  },
  {
    title: 'Teoria do Crime - Fato Típico, Ilicitude e Culpabilidade',
    category: 'Direito Penal',
    description: 'Conceito analítico tripartido, conduta, tipicidade e excludentes.',
    promptExample: 'O crime é um fato típico, antijurídico e culpável segundo a teoria tripartida...'
  },
  {
    title: 'Controle de Constitucionalidade (Difuso vs Concentrado)',
    category: 'Direito Constitucional',
    description: 'Ações diretas (ADI, ADC, ADO, ADPF), cláusula de reserva de plenário e efeitos.',
    promptExample: 'Vou explicar a diferença entre o controle difuso incidental e o controle concentrado abstrato no STF.'
  },
  {
    title: 'Atos Administrativos - Elementos, Atributos e Extinção',
    category: 'Direito Administrativo',
    description: 'Competência, finalidade, forma, motivo, objeto; autoexecutoriedade e revogação.',
    promptExample: 'Os atos administrativos possuem requisitos essenciais e atributos como presunção de legitimidade...'
  },
  {
    title: 'Responsabilidade Civil do Estado (Art. 37, § 6º da CF)',
    category: 'Direito Administrativo',
    description: 'Teoria do risco administrativo, condutas comissivas e omissivas do Estado.',
    promptExample: 'A responsabilidade civil do Estado no Brasil é objetiva baseada no risco administrativo...'
  },
  {
    title: 'Segurança da Informação - Princípios CID',
    category: 'Tecnologia & Governança',
    description: 'Confidencialidade, Integridade, Disponibilidade e não-repúdio.',
    promptExample: 'Os pilares essenciais da segurança da informação são Confidencialidade, Integridade e Disponibilidade...'
  }
];
