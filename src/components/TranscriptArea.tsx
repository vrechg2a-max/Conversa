import React, { useRef, useEffect } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Terminal, 
  User, 
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage, ExamBoard } from '../types';
import { ReportView } from './ReportView';

interface TranscriptAreaProps {
  messages: ChatMessage[];
  activeTopic: string | null;
  activeBoard: ExamBoard;
  isLoading: boolean;
  onOpenNewTopic: () => void;
  onFinishTopic: () => void;
  finalReport: string | null;
}

export const TranscriptArea: React.FC<TranscriptAreaProps> = ({
  messages,
  activeTopic,
  activeBoard,
  isLoading,
  onOpenNewTopic,
  onFinishTopic,
  finalReport,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, finalReport]);

  if (!activeTopic && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
          <Scale className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-amber-500 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full mb-3">
          Técnica de Feynman & Rigor de Concursos
        </span>

        <h2 className="text-2xl sm:text-3xl font-semibold text-stone-100 font-serif tracking-tight mb-3">
          Avaliador de Conhecimento e Especialista em Aprendizagem Ativa
        </h2>

        <p className="text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed mb-6 font-serif">
          Você assumirá o <span className="text-stone-200 font-semibold">papel de professor</span> e explicará uma matéria com suas próprias palavras. A inteligência atuará como a <span className="text-amber-400 font-semibold">Banca Examinadora</span>: ouvinte ativa, corrigindo erros conceituais na hora e avaliando sua retenção final.
        </p>

        {/* 3 Steps summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left mb-8">
          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <Terminal className="w-4 h-4" />
              <span>1. Registro Puro</span>
            </div>
            <p className="text-xs text-stone-300 font-serif font-medium">Abertura Imediata</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              O tópico é registrado em texto puro e a banca autoriza: <span className="font-mono text-stone-300">"Pode começar a explicação."</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>2. Intervenção Ativa</span>
            </div>
            <p className="text-xs text-stone-300 font-serif font-medium">Correção Imediata</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Se acertar: frases curtas de incentivo. Se errar um conceito ou jargão: interrupção em até 2 frases para retomar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
              <BookOpen className="w-4 h-4" />
              <span>3. Avaliação Final</span>
            </div>
            <p className="text-xs text-stone-300 font-serif font-medium">Retenção e Pontos Cegos</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Diagnóstico de precisão, correções feitas, pontos cegos que você esqueceu e resumo técnico para copiar e colar.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewTopic}
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Iniciar Explicação de Matéria</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Count interruptions
  const interruptionsCount = messages.filter((m) => m.turnType === 'INTERRUPTION').length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-5 max-w-4xl mx-auto w-full">
      {/* Active Session Status Bar */}
      {activeTopic && (
        <div className="sticky top-0 z-20 bg-stone-950/95 border border-stone-800/90 rounded-lg p-3 backdrop-blur shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-mono text-xs text-amber-400 uppercase font-semibold shrink-0">
              Sessão Aberta:
            </span>
            <span className="text-xs font-serif text-stone-200 truncate font-medium">
              {activeTopic}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-stone-400 font-mono text-[11px]">Banca: {activeBoard}</span>
            <span className="text-stone-600">•</span>
            {interruptionsCount > 0 ? (
              <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {interruptionsCount} {interruptionsCount === 1 ? 'Interrupção' : 'Interrupções'}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sem Erros Graves
              </span>
            )}

            {!finalReport && (
              <button
                onClick={onFinishTopic}
                className="ml-2 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-600/30 text-[11px] font-medium transition-colors cursor-pointer"
                title="Concluir explanação e emitir relatório de retenção"
              >
                Encerrar Explicação
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isOpening = msg.turnType === 'OPENING' || msg.text.includes('[TÓPICO ABERTO:');
          const isInterruption = msg.turnType === 'INTERRUPTION';
          const isEvaluation = msg.turnType === 'EVALUATION' || msg.text.includes('--- AVALIAÇÃO DE RETENÇÃO ---');

          if (isOpening) {
            return (
              <div key={msg.id} className="my-3 p-4 rounded-lg bg-stone-950 border border-stone-800 font-mono text-xs text-stone-300 space-y-2">
                <div className="flex items-center justify-between text-stone-500 border-b border-stone-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <Terminal className="w-3.5 h-3.5" />
                    REGISTRO DE ABERTURA DE TÓPICO
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="text-amber-300 font-bold tracking-wide">
                  {msg.text.split('\n')[0]}
                </div>
                <div className="text-stone-300 italic pt-1">
                  {msg.text.split('\n').slice(1).join('\n') || 'Tópico registrado. Pode começar a explicação.'}
                </div>
              </div>
            );
          }

          if (isEvaluation) {
            return (
              <div key={msg.id}>
                <ReportView
                  rawReport={msg.text}
                  topic={activeTopic || 'Tópico de Estudo'}
                  board={activeBoard}
                  date={msg.timestamp}
                  onNewSession={onOpenNewTopic}
                />
              </div>
            );
          }

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end pl-8">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1 font-mono">
                  <User className="w-3 h-3 text-amber-500" />
                  <span className="font-semibold text-stone-300">Você (Papel de Professor)</span>
                  <span>• {msg.timestamp}</span>
                </div>
                <div className="bg-stone-900 border border-stone-700/80 text-stone-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed max-w-2xl shadow-sm whitespace-pre-wrap font-serif">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Model (Examiner) turn
          return (
            <div key={msg.id} className="flex flex-col items-start pr-8">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1 font-mono">
                <Scale className="w-3 h-3 text-amber-400" />
                <span className="font-semibold text-amber-400">Banca Examinadora [{activeBoard}]</span>
                <span>• {msg.timestamp}</span>
              </div>

              {isInterruption ? (
                <div className="w-full max-w-2xl bg-rose-950/30 border-l-4 border-rose-500 border-t border-r border-b border-rose-900/60 rounded-r-xl p-4 space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold tracking-wide">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>INTERRUPÇÃO DA BANCA: EQUÍVOCO CONCEITUAL / JARGÃO</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-100 font-serif leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-stone-950/80 border border-stone-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs sm:text-sm text-stone-300 leading-relaxed font-serif flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase font-medium">
                      Conforme a Doutrina / Jurisprudência
                    </span>
                    <p className="text-stone-200 mt-0.5">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono p-3 rounded-lg bg-stone-950/60 border border-stone-800 max-w-md animate-pulse">
            <Scale className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Banca Examinadora avaliando precisão e rigor dogmático...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
