import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Scale, AlertTriangle, ArrowRight } from 'lucide-react';
import { ExamBoard, POPULAR_TOPICS } from '../types';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topic: string, board: ExamBoard) => void;
  initialTopic?: string;
  initialBoard?: ExamBoard;
}

const BOARDS: { id: ExamBoard; label: string; desc: string; focus: string }[] = [
  {
    id: 'Cebraspe',
    label: 'Cebraspe / CESPE',
    desc: 'Método certo/errado, literalidade estrita, súmulas vinculantes e jurisprudência pacificada do STF/STJ.',
    focus: 'Jurisprudência dominante e assertividade técnica',
  },
  {
    id: 'FGV',
    label: 'FGV (Fundação Getulio Vargas)',
    desc: 'Casuística prática densa, pegadinhas terminológicas, raciocínio dogmático profundo e distinções finas.',
    focus: 'Casos práticos e vocabulário dogmático preciso',
  },
  {
    id: 'Vunesp',
    label: 'Vunesp',
    desc: 'Letra seca da lei combinada com doutrina tradicional e majoritária sem invencionismos.',
    focus: 'Dispositivos legais expressos e doutrina clássica',
  },
  {
    id: 'FCC',
    label: 'FCC (Fundação Carlos Chagas)',
    desc: 'Rigor conceitual com posicionamentos sedimentados dos tribunais superiores e enunciados.',
    focus: 'Posicionamentos consolidados e técnica legislativa',
  },
  {
    id: 'FEPESE',
    label: 'FEPESE',
    desc: 'Cobrança analítica de conceitos fundamentais, doutrina direta e classificação estrita.',
    focus: 'Conceitos fundamentais e classificações doutrinárias',
  },
  {
    id: 'Banca Oral (Magistratura/MP)',
    label: 'Banca Oral (Magistratura / MP / Defensoria)',
    desc: 'Rigor cirúrgico de arguição presencial: exige clareza, jargão exato, correntes minoritárias e ausência total de hesitação.',
    focus: 'Postura de prova oral, divergências e profundidade máxima',
  },
];

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTopic = '',
  initialBoard = 'Cebraspe',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [selectedBoard, setSelectedBoard] = useState<ExamBoard>(initialBoard);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor, informe o tema da matéria que você vai explicar.');
      return;
    }
    setError('');
    onSubmit(topic.trim(), selectedBoard);
    onClose();
  };

  const handleSelectQuickTopic = (t: string) => {
    setTopic(t);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 font-serif">
                Abertura de Sessão de Explicação
              </h2>
              <p className="text-xs text-stone-400">
                Defina o tema e a banca examinadora antes de assumir o papel de professor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-md hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Instructions Banner */}
          <div className="p-3.5 rounded-lg bg-stone-950 border border-stone-800/80 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-stone-200">Como funciona a dinâmica:</p>
              <p className="text-stone-400">
                1. A banca registrará o tópico e dirá: <span className="font-mono text-amber-300/90 text-[11px]">"Tópico registrado. Pode começar a explicação."</span>
              </p>
              <p className="text-stone-400">
                2. Você começará a falar ou digitar sua aula. Se acertar, receberá incentivos curtos. Se errar um conceito ou jargão técnico, será interrompido na hora com correção em 2 frases.
              </p>
              <p className="text-stone-400">
                3. Ao dizer <span className="text-amber-400 font-mono">"Encerrei"</span> ou clicar em Finalizar, você receberá a <span className="font-semibold text-stone-200">Avaliação de Retenção</span> completa com pontos cegos e resumo.
              </p>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 font-mono">
              Tema da Matéria a ser Explicada:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError('');
              }}
              placeholder='Ex: "Direito Penal - Teoria do Crime" ou "Direito Constitucional - Ações de Controle Concentrado"'
              className="w-full px-3.5 py-2.5 rounded-lg bg-stone-950 border border-stone-700/80 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="block text-[11px] font-medium text-stone-400 mb-2 flex items-center gap-1 font-mono uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sugestões Rápidas de Alta Incidência em Concursos:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {POPULAR_TOPICS.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectQuickTopic(item.topic)}
                  className={`text-left text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    topic === item.topic
                      ? 'bg-amber-950/70 border-amber-600/70 text-amber-300 font-medium'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <span className="text-amber-500/80 font-mono text-[10px] mr-1">[{item.subject}]</span>
                  {item.topic.split(' - ')[1] || item.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Board Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 font-mono">
              Banca Examinadora de Rigor:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOARDS.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBoard(b.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedBoard === b.id
                      ? 'bg-amber-950/40 border-amber-500/70 ring-1 ring-amber-500/30'
                      : 'bg-stone-950/40 border-stone-800/80 hover:border-stone-700 text-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold text-xs ${selectedBoard === b.id ? 'text-amber-400' : 'text-stone-200'}`}>
                      {b.label}
                    </span>
                    {selectedBoard === b.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed mb-1">
                    {b.desc}
                  </p>
                  <span className="inline-block text-[10px] text-stone-500 font-mono">
                    Foco: {b.focus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Abrir Tópico com a Banca</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
