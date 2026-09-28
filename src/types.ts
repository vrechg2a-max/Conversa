export type ExamBoard = 
  | 'Cebraspe' 
  | 'FGV' 
  | 'Vunesp' 
  | 'FCC' 
  | 'FEPESE' 
  | 'Banca Oral (Magistratura/MP)';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  turnType?: 'OPENING' | 'CORRECT_PROCEED' | 'INTERRUPTION' | 'EVALUATION';
  topic?: string;
  board?: string;
}

export interface SessionData {
  id: string;
  topic: string;
  board: ExamBoard;
  date: string;
  messages: ChatMessage[];
  finalReport?: string;
  diagnostic?: 'Superficial' | 'Mediana' | 'Aprofundada' | 'Pendente';
  interruptionCount: number;
}

export const POPULAR_TOPICS: { subject: string; topic: string }[] = [
  { subject: 'Direito Penal', topic: 'Direito Penal - Teoria do Crime (Fato Típico, Ilicitude e Culpabilidade)' },
  { subject: 'Direito Penal', topic: 'Direito Penal - Dolo Eventual versus Culpa Consciente' },
  { subject: 'Direito Penal', topic: 'Direito Penal - Erro de Tipo e Erro de Proibição' },
  { subject: 'Direito Constitucional', topic: 'Direito Constitucional - Controle Difuso e Concentrado de Constitucionalidade' },
  { subject: 'Direito Constitucional', topic: 'Direito Constitucional - Remédios Constitucionais e Direitos Fundamentais' },
  { subject: 'Direito Administrativo', topic: 'Direito Administrativo - Atos Administrativos: Elementos, Atributos e Extinção' },
  { subject: 'Direito Administrativo', topic: 'Direito Administrativo - Responsabilidade Civil do Estado' },
  { subject: 'Processo Penal', topic: 'Processo Penal - Cadeia de Custódia e Teoria das Provas Ilícitas' },
  { subject: 'Direito Civil', topic: 'Direito Civil - Prescrição, Decadência e Teoria das Nulidades' },
  { subject: 'Direito Tributário', topic: 'Direito Tributário - Imunidades e Isenções Tributárias' },
  { subject: 'TI & Governança', topic: 'Segurança da Informação - Princípios CID (Confidencialidade, Integridade e Disponibilidade)' },
];
