import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, Mic, BookOpen, Scale } from 'lucide-react';
import { POPULAR_TOPICS, CuratedTopic } from '../types';

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topic: string) => void;
  initialTopic?: string;
}

export const NewTopicModal: React.FC<NewTopicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTopic = '',
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor, informe a matéria ou tema que você vai explicar.');
      return;
    }
    setError('');
    onSubmit(topic.trim());
    onClose();
  };

  const handleSelectQuick = (curated: CuratedTopic) => {
    setTopic(curated.title);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Iniciar Novo Tópico de Estudo
              </h2>
              <p className="text-xs text-stone-400">
                Escolha a matéria para você explicar por voz à IA.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Helper hint */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-white">Como funciona:</p>
              <p className="text-stone-400">
                Você assumirá o papel de professor e explicará a matéria por voz. A IA vai te ouvindo, fazendo perguntas para testar seu domínio e te corrigindo se falar algo errado. No fim, você recebe a <span className="text-emerald-400 font-semibold">nota final e as observações</span>!
              </p>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 font-mono">
              Qual tema você vai explicar?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError('');
              }}
              placeholder='Ex: Lei de Abuso de Autoridade (Lei 13.869/19)...'
              className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700/80 text-white placeholder:text-stone-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-rose-400">
                {error}
              </p>
            )}
          </div>

          {/* Curated suggestions */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-stone-400 font-mono uppercase tracking-wider">
              Sugestões Rápidas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {POPULAR_TOPICS.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectQuick(item)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    topic === item.title
                      ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <span className="text-[10px] font-mono text-emerald-400 block uppercase mb-0.5">
                    {item.category}
                  </span>
                  <p className="text-xs font-medium line-clamp-1 text-white">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <span>Começar a Explicar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
