import React from 'react';
import { 
  Mic, 
  MicOff, 
  Award, 
  HelpCircle, 
  Sparkles, 
  AlertTriangle, 
  Send,
  StopCircle,
  MessageSquare,
  Zap,
  Clock
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
  interimTranscript?: string;
  silenceCountdown?: number | null;
  autoSendEnabled: boolean;
  onToggleAutoSend: () => void;
  onManualSend: () => void;
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
  interimTranscript = '',
  silenceCountdown = null,
  autoSendEnabled,
  onToggleAutoSend,
  onManualSend,
  onRetryTopic,
  onSwitchToChat,
}) => {
  const lastAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');

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

  // Active combined speech
  const speechPreview = (currentTranscript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();

  return (
    <div className="flex-1 flex flex-col justify-between items-center p-4 sm:p-6 max-w-3xl mx-auto w-full relative">
      {/* Top Session & Mode Bar */}
      <div className="w-full flex items-center justify-between gap-3 bg-stone-900/80 border border-stone-800 rounded-2xl px-4 py-2.5 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold shrink-0">
            Explicando:
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white truncate">
            {topic}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Auto-Send / Hands-Free mode */}
          <button
            onClick={onToggleAutoSend}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              autoSendEnabled
                ? 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Envio automático quando você faz uma pausa na fala"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Conversa Automática</span>
          </button>

          <button
            onClick={onSwitchToChat}
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Ver transcrição completa da conversa"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transcrição</span>
          </button>
        </div>
      </div>

      {/* Center: Glowing Visualizer Orb */}
      <div className="my-auto flex flex-col items-center justify-center py-4 sm:py-6 w-full">
        <VoiceVisualizer
          isListening={isListening}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          onClick={onToggleListening}
          size="lg"
        />

        {/* Live Subtitle Area */}
        <div className="w-full max-w-xl mt-5 space-y-3">
          {/* Active User Speech Box with countdown */}
          {speechPreview ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/95 border border-emerald-500/50 text-stone-100 shadow-2xl space-y-2 animate-in fade-in backdrop-blur">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Você falando:
                </span>

                {silenceCountdown !== null && (
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Enviando em {silenceCountdown}s...
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-white font-medium">
                "{speechPreview}"
              </p>

              {/* Immediate send or cancel bar */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  onClick={onManualSend}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar Agora</span>
                </button>
              </div>
            </div>
          ) : lastAiMessage ? (
            /* AI Last Spoken Response Bubble */
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 text-stone-200 shadow-xl space-y-2.5 backdrop-blur">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Tutor IA Respondendo
                </span>

                {isSpeaking && (
                  <button
                    onClick={onStopSpeaking}
                    className="text-[11px] text-stone-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-stone-950 border border-stone-800"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Silenciar fala</span>
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

              <p className="text-sm sm:text-base leading-relaxed text-stone-100 font-sans">
                {lastAiMessage.text}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/60 text-center text-stone-400 text-xs sm:text-sm">
              Comece a falar explicando a matéria. A IA te ouve, responde por voz e faz perguntas.
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

        {/* Main Action Bar */}
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
