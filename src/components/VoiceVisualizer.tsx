import React from 'react';
import { Mic, Volume2, Sparkles, Radio } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isLoading: boolean;
  onClick?: () => void;
  statusLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  isSpeaking,
  isLoading,
  onClick,
  statusLabel,
  size = 'md',
}) => {
  const getOrbState = () => {
    if (isLoading) {
      return {
        bg: 'bg-gradient-to-tr from-amber-600 via-indigo-600 to-purple-600 animate-spin',
        glow: 'shadow-[0_0_50px_rgba(139,92,246,0.5)]',
        pulseRing: 'border-purple-500/50 animate-ping',
        icon: <Sparkles className="w-8 h-8 text-white animate-pulse" />,
        text: 'Analisando sua explicação...',
      };
    }
    if (isListening) {
      return {
        bg: 'bg-gradient-to-tr from-rose-600 via-emerald-500 to-teal-500 animate-pulse',
        glow: 'shadow-[0_0_60px_rgba(16,185,129,0.6)]',
        pulseRing: 'border-emerald-400/60 animate-ping',
        icon: <Mic className="w-9 h-9 text-white animate-bounce" />,
        text: 'Ouvindo você... Fale à vontade!',
      };
    }
    if (isSpeaking) {
      return {
        bg: 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 animate-pulse',
        glow: 'shadow-[0_0_60px_rgba(6,182,212,0.6)]',
        pulseRing: 'border-cyan-400/60 animate-ping',
        icon: <Volume2 className="w-9 h-9 text-white animate-pulse" />,
        text: 'IA respondendo por voz...',
      };
    }
    return {
      bg: 'bg-gradient-to-tr from-stone-800 via-stone-700 to-emerald-900/60',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]',
      pulseRing: 'border-stone-700/50',
      icon: <Mic className="w-8 h-8 text-stone-300 group-hover:text-emerald-400 transition-colors" />,
      text: 'Toque para falar por voz',
    };
  };

  const state = getOrbState();
  const label = statusLabel || state.text;

  const orbDimensions =
    size === 'lg'
      ? 'w-44 h-44 sm:w-52 sm:h-52'
      : size === 'sm'
      ? 'w-24 h-24'
      : 'w-36 h-36 sm:w-40 sm:h-40';

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      {/* Outer interactive Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated Pulse Rings when Active */}
        {(isListening || isSpeaking || isLoading) && (
          <>
            <div className={`absolute -inset-4 rounded-full border ${state.pulseRing} opacity-40 duration-1000`} />
            <div className={`absolute -inset-8 rounded-full border ${state.pulseRing} opacity-20 duration-1000 delay-300`} />
          </>
        )}

        {/* Ambient Glow Backdrop */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
            isListening
              ? 'bg-emerald-500/30'
              : isSpeaking
              ? 'bg-cyan-500/30'
              : isLoading
              ? 'bg-purple-500/30'
              : 'bg-stone-800/10'
          }`}
        />

        {/* Central Orb Button */}
        <button
          type="button"
          onClick={onClick}
          className={`relative group ${orbDimensions} rounded-full flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 focus:outline-none ${state.bg} ${state.glow} border border-white/20`}
          title={isListening ? 'Clique para pausar microfone' : 'Clique para começar a falar'}
        >
          {/* Inner glass layer */}
          <div className="absolute inset-1 rounded-full bg-black/25 backdrop-blur-[2px] flex items-center justify-center">
            {state.icon}
          </div>

          {/* Sound wave bars when active */}
          {(isListening || isSpeaking) && (
            <div className="absolute bottom-4 flex items-center gap-1 z-10">
              <span className="w-1 h-3 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
              <span className="w-1 h-5 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
              <span className="w-1 h-7 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
              <span className="w-1 h-4 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_400ms]" />
              <span className="w-1 h-2 bg-white/90 rounded-full animate-[bounce_0.8s_infinite_500ms]" />
            </div>
          )}
        </button>
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-5 text-center flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
          {isSpeaking && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          )}
          <span className="text-xs sm:text-sm font-medium text-stone-200 tracking-wide font-sans">
            {label}
          </span>
        </div>
        <p className="text-[11px] text-stone-400 font-sans">
          {isListening
            ? 'Fale naturalmente como se estivesse dando uma aula.'
            : isSpeaking
            ? 'Ouça os comentários e perguntas da IA.'
            : 'Explique o tema com suas palavras para ser avaliado.'}
        </p>
      </div>
    </div>
  );
};
