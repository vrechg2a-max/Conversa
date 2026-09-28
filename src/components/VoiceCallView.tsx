import React from 'react';
import { 
  Mic, 
  MicOff, 
  Award, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Volume2,
  StopCircle,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, TopicEvaluation } from '../types';
import { VoiceVisualizer } from './VoiceVisualizer';
import { TopicEvaluationCard } from './TopicEvaluationCard';

interface VoiceCallViewProps {
  topic: string;
  messages: ChatMessage[];
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onFinishTopic: () => void;
  evaluation: TopicEvaluation | null;
  currentTranscript: string;
  onRetryTopic?: () => void;
  onSwitchToChat: () => void;
}

export const VoiceCallView: React.FC<VoiceCallViewProps> = ({
  topic,
  messages,
  isListening,
  onToggleListening,
  isSpeaking,
  onStopSpeaking,
  isLoading,
  onSendMessage,
  onFinishTopic,
  evaluation,
  currentTranscript,
  onRetryTopic,
  onSwitchToChat,
}) => {
  // Last AI message
  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  // Last user message
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

  if (evaluation) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        <TopicEvaluationCard
          evaluation={evaluation}
          topic={topic}
          date={new Date().toLocaleDateString('pt-BR')}
          onRetryTopic={onRetryTopic}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between items-center p-4 sm:p-6 max-w-3xl mx-auto w-full relative">
      {/* Top Session Pill */}
      <div className="w-full flex items-center justify-between gap-3 bg-stone-900/80 border border-stone-800 rounded-2xl px-4 py-2.5 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold shrink-0">
            Tópico Ativo:
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white truncate">
            {topic}
          </span>
        </div>

        <button
          onClick={onSwitchToChat}
          className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
          title="Ver transcrição completa da conversa"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ver Transcrição</span>
        </button>
      </div>

      {/* Center: Glowing Visualizer Orb */}
      <div className="my-auto flex flex-col items-center justify-center py-6 sm:py-8 w-full">
        <VoiceVisualizer
          isListening={isListening}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          onClick={onToggleListening}
          size="lg"
        />

        {/* Live Audio Transcription / Speech Bubble */}
        <div className="w-full max-w-xl mt-6 space-y-3">
          {/* If user is actively speaking or typed interim */}
          {currentTranscript ? (
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-500/40 text-stone-100 shadow-xl space-y-1 animate-in fade-in">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block">
                Você falando agora:
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-white font-medium">
                "{currentTranscript}"
              </p>
            </div>
          ) : lastAiMessage ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-200 shadow-xl space-y-2 backdrop-blur">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1 text-cyan-400">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  IA Respondendo
                </span>

                {isSpeaking && (
                  <button
                    onClick={onStopSpeaking}
                    className="text-[11px] text-stone-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Silenciar voz</span>
                  </button>
                )}
              </div>

              {lastAiMessage.interlocutionType === 'correction' && (
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Correção Conceitual</span>
                </div>
              )}

              {lastAiMessage.interlocutionType === 'question' && (
                <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Pergunta de Aprofundamento</span>
                </div>
              )}

              <p className="text-sm sm:text-base leading-relaxed text-stone-100">
                {lastAiMessage.text}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/60 text-center text-stone-400 text-xs sm:text-sm">
              Comece a falar explicando a matéria. A IA vai te ouvir, interagir e avaliar.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-xl space-y-3">
        {/* Quick Helper Prompts */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => onSendMessage('O que você achou até agora? Pode me fazer uma pergunta sobre esse tema?')}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            💡 Me faça uma pergunta
          </button>
          <button
            onClick={() => onSendMessage('O que eu falei está correto ou cometi algum erro técnico?')}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            ❓ Falei algo errado?
          </button>
        </div>

        {/* Main Mic & Finalize Action Bar */}
        <div className="flex items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-2.5 sm:p-3 rounded-2xl shadow-xl backdrop-blur">
          {/* Mic Toggle Button */}
          <button
            onClick={onToggleListening}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-950/40'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Pausar Microfone</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Falar Agora</span>
              </>
            )}
          </button>

          {/* Send Pending Speech Button (if speech is waiting) */}
          {currentTranscript && (
            <button
              onClick={() => onSendMessage(currentTranscript)}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              title="Enviar fala para a IA responder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Fala</span>
            </button>
          )}

          {/* Finish & Get Grade Button */}
          <button
            onClick={onFinishTopic}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ml-auto disabled:opacity-50"
            title="Finalizar explicação e receber a nota com observações"
          >
            <Award className="w-4 h-4 text-stone-950" />
            <span>Finalizar e Ver Nota</span>
          </button>
        </div>
      </div>
    </div>
  );
};
