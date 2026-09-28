import React, { useRef, useEffect } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, TopicEvaluation } from '../types';
import { TopicEvaluationCard } from './TopicEvaluationCard';

interface TranscriptAreaProps {
  messages: ChatMessage[];
  activeTopic: string | null;
  isLoading: boolean;
  onOpenNewTopic: () => void;
  onFinishTopic: () => void;
  evaluation: TopicEvaluation | null;
  onPlayMessageAudio?: (text: string) => void;
  onRetryTopic?: () => void;
}

export const TranscriptArea: React.FC<TranscriptAreaProps> = ({
  messages,
  activeTopic,
  isLoading,
  onOpenNewTopic,
  onFinishTopic,
  evaluation,
  onPlayMessageAudio,
  onRetryTopic,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, evaluation]);

  // When no topic is selected
  if (!activeTopic && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto my-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-stone-950 mb-5 shadow-xl shadow-emerald-950/40">
          <Radio className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full mb-3">
          Tutor de Voz & Técnica de Feynman
        </span>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 font-sans">
          Explique a Matéria para a IA por Voz
        </h2>

        <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed mb-8">
          Você assume o papel de <span className="text-emerald-400 font-semibold">professor</span> e explica um tema livremente (ex: <span className="text-white underline decoration-emerald-500">Lei de Abuso de Autoridade</span>). A IA te ouve em tempo real, faz perguntas para aprofundar, te corrige caso erre, e ao final te dá uma <span className="text-amber-400 font-semibold">nota completa com observações</span>.
        </p>

        {/* 3 Step dynamic cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left mb-8">
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-[11px]">1</span>
              <span>Explicação Livre</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Fale pelo microfone como se estivesse ensinando alguém. A IA escuta cada detalhe técnico da sua fala.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-[11px]">2</span>
              <span>Perguntas & Correções</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              A IA responde por voz, te faz perguntas de aprofundamento e corrige equívocos na hora para você não errar na prova.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700/60 flex items-center justify-center text-[11px]">3</span>
              <span>Nota & Observações</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Receba uma nota de 0 a 10, o que você falou errado, o que precisa melhorar e um resumo para fixação. Tudo fica salvo!
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewTopic}
          className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Escolher Matéria para Explicar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Count corrections
  const correctionsCount = messages.filter((m) => m.interlocutionType === 'correction').length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-5 max-w-4xl mx-auto w-full">
      {/* Active Topic Header Bar */}
      {activeTopic && (
        <div className="sticky top-0 z-20 bg-stone-950/95 border border-stone-800 rounded-xl p-3 backdrop-blur shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-mono text-xs text-emerald-400 uppercase font-bold shrink-0">
              Tópico em Estudo:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate">
              {activeTopic}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            {correctionsCount > 0 ? (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {correctionsCount} {correctionsCount === 1 ? 'Correção' : 'Correções'}
              </span>
            ) : (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Sem Erros Graves
              </span>
            )}

            {!evaluation && (
              <button
                onClick={onFinishTopic}
                className="ml-2 px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                title="Concluir explicação e emitir nota final"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Finalizar e Ver Nota</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCorrection = msg.interlocutionType === 'correction';
          const isQuestion = msg.interlocutionType === 'question';
          const isEvaluation = msg.interlocutionType === 'evaluation' || !!msg.evaluation;

          if (isEvaluation && msg.evaluation) {
            return (
              <div key={msg.id}>
                <TopicEvaluationCard
                  evaluation={msg.evaluation}
                  topic={activeTopic || 'Tópico de Estudo'}
                  date={msg.timestamp}
                  onRetryTopic={onRetryTopic}
                />
              </div>
            );
          }

          if (isUser) {
            return (
              <div key={msg.id} className="flex flex-col items-end pl-8">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1 font-mono">
                  <User className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-stone-300">Você (Explicando)</span>
                  <span>• {msg.timestamp}</span>
                </div>
                <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed max-w-2xl shadow-sm whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
              </div>
            );
          }

          // AI assistant turn
          return (
            <div key={msg.id} className="flex flex-col items-start pr-8">
              <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1 font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="font-semibold text-cyan-400">IA Tutor</span>
                <span>• {msg.timestamp}</span>

                {onPlayMessageAudio && (
                  <button
                    onClick={() => onPlayMessageAudio(msg.text)}
                    className="p-1 rounded text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                    title="Ouvir esta fala em voz alta"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Message bubble depending on interlocution type */}
              {isCorrection ? (
                <div className="w-full max-w-2xl bg-rose-950/25 border-l-4 border-rose-500 border-t border-r border-b border-rose-900/50 rounded-r-2xl p-4 space-y-2 shadow-md">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Atenção: Correção Conceitual</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                    {msg.text}
                  </p>
                </div>
              ) : isQuestion ? (
                <div className="w-full max-w-2xl bg-purple-950/25 border-l-4 border-purple-500 border-t border-r border-b border-purple-900/50 rounded-r-2xl p-4 space-y-2 shadow-md">
                  <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                    <HelpCircle className="w-4 h-4 shrink-0 text-purple-400" />
                    <span>Pergunta de Aprofundamento</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-stone-900/90 border border-stone-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs sm:text-sm text-stone-200 leading-relaxed font-sans flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-stone-200">{msg.text}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-stone-400 font-mono p-3 rounded-xl bg-stone-900/80 border border-stone-800 max-w-md animate-pulse">
            <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>IA ouvindo e formulando resposta por voz...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
