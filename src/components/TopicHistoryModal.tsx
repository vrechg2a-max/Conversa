import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  Trash2, 
  Calendar, 
  Award, 
  ChevronRight, 
  RotateCcw, 
  Search,
  BookOpen,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { SavedTopicSession } from '../types';
import { TopicEvaluationCard } from './TopicEvaluationCard';

interface TopicHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedTopicSession[];
  onSelectSession: (session: SavedTopicSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export const TopicHistoryModal: React.FC<TopicHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = sessions.filter((s) =>
    s.topic.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreBadge = (grade?: number) => {
    if (grade === undefined || grade === null) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-stone-800 text-stone-400 border border-stone-700">
          Sem nota
        </span>
      );
    }
    if (grade >= 8.5) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
          Nota {grade.toFixed(1)}
        </span>
      );
    }
    if (grade >= 7.0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-700/60">
          Nota {grade.toFixed(1)}
        </span>
      );
    }
    if (grade >= 5.0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-700/60">
          Nota {grade.toFixed(1)}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950 text-rose-400 border border-rose-700/60">
        Nota {grade.toFixed(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Caderno de Tópicos & Avaliações
              </h2>
              <p className="text-xs text-stone-400">
                Seus tópicos estudados por voz com notas e observações registradas.
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

        {/* Filter bar */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-950/40 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tópico (ex: Abuso de Autoridade)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja apagar todo o histórico de tópicos?')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Todos</span>
            </button>
          )}
        </div>

        {/* Sessions list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-500 text-xs sm:text-sm space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-stone-600 opacity-60" />
              <p className="font-medium text-stone-400">Nenhum tópico registrado ainda.</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Inicie uma conversa por voz explicando qualquer tema (ex: Lei de Abuso de Autoridade). Ao finalizar, sua nota e observações ficarão salvas aqui.
              </p>
            </div>
          ) : (
            filtered.map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className="rounded-xl bg-stone-950 border border-stone-800/80 hover:border-stone-700 transition-all overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getScoreBadge(session.evaluation?.grade)}
                        <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.date}
                        </span>
                        {session.interruptionCount > 0 && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {session.interruptionCount} {session.interruptionCount === 1 ? 'correção' : 'correções'}
                          </span>
                        )}
                        <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {session.messages.length} falas
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white tracking-tight">
                        {session.topic}
                      </h4>
                      {session.evaluation?.summary && (
                        <p className="text-xs text-stone-400 line-clamp-2">
                          {session.evaluation.summary}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          onSelectSession(session);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-stone-950 transition-colors cursor-pointer"
                        title="Abrir este tópico para continuar ou rever"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Abrir Tópico</span>
                      </button>

                      {session.evaluation && (
                        <button
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Ver Avaliação'}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors cursor-pointer"
                        title="Excluir tópico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Evaluation details */}
                  {isExpanded && session.evaluation && (
                    <div className="p-4 pt-0 border-t border-stone-800/80 bg-stone-900/40">
                      <TopicEvaluationCard
                        evaluation={session.evaluation}
                        topic={session.topic}
                        date={session.date}
                        onRetryTopic={() => {
                          onSelectSession(session);
                          onClose();
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
