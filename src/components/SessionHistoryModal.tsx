import React, { useState } from 'react';
import { X, History, Trash2, ExternalLink, Calendar, Scale, AlertCircle, FileText } from 'lucide-react';
import { SessionData } from '../types';

interface SessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionData[];
  onSelectSession: (session: SessionData) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const q = search.toLowerCase();
    return s.topic.toLowerCase().includes(q) || s.board.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100 font-serif">
                Histórico de Avaliações Salvas
              </h2>
              <p className="text-xs text-stone-400">
                {sessions.length} {sessions.length === 1 ? 'sessão registrada' : 'sessões registradas'} para revisão ativa.
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

        {/* Filter bar */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/30 flex items-center justify-between gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por tema ou banca (ex: Direito Penal, Cebraspe)..."
            className="w-full max-w-sm px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 placeholder:text-stone-600 text-xs focus:outline-none focus:border-amber-500"
          />
          {sessions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Deseja limpar todo o histórico de avaliações?')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Tudo</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs space-y-2">
              <Scale className="w-8 h-8 mx-auto text-stone-600 mb-2 opacity-50" />
              <p>Nenhuma sessão encontrada no histórico.</p>
              <p className="text-[11px] text-stone-600">
                Abra um tópico, explique a matéria para a banca e gere uma Avaliação de Retenção para registrar aqui.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg bg-stone-950 border border-stone-800/80 hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/80 border border-amber-700/50 text-amber-300">
                      {session.board}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {session.date}
                    </span>
                    {session.interruptionCount > 0 && (
                      <span className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-800/50 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {session.interruptionCount} {session.interruptionCount === 1 ? 'interrupção' : 'interrupções'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-stone-200 font-serif">
                    {session.topic}
                  </h4>
                  <p className="text-xs text-stone-400">
                    {session.messages.length} intervenções registradas.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Sessão</span>
                  </button>
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-900 transition-colors cursor-pointer"
                    title="Excluir do histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
