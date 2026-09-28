import React from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  FolderOpen, 
  PlusCircle, 
  Sparkles,
  PhoneCall,
  MessageSquare,
  Settings
} from 'lucide-react';

interface HeaderProps {
  activeTopic: string | null;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  voiceRate: number;
  onChangeVoiceRate: (rate: number) => void;
  onOpenNewTopic: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  savedSessionsCount: number;
  viewMode: 'call' | 'chat';
  onToggleViewMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTopic,
  ttsEnabled,
  onToggleTts,
  voiceRate,
  onChangeVoiceRate,
  onOpenNewTopic,
  onOpenHistory,
  onOpenSettings,
  savedSessionsCount,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-stone-950 shadow-lg shadow-emerald-950/40">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                Conversa<span className="text-emerald-400 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/30">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Tutor de Voz em Tempo Real
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Explique a matéria, receba perguntas e correções por voz, e veja sua nota final.
            </p>
          </div>
        </div>

        {/* Right: Controls & Navigation */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Switch View Mode: Voice Call vs Chat Feed */}
          {activeTopic && (
            <button
              onClick={onToggleViewMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title={viewMode === 'call' ? 'Mudar para visualização em Chat e Transcrição' : 'Mudar para Modo Chamada de Voz'}
            >
              {viewMode === 'call' ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium">Modo Chat</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="font-medium">Modo Chamada</span>
                </>
              )}
            </button>
          )}

          {/* Voice Output (TTS) Toggle */}
          <button
            onClick={onToggleTts}
            title={ttsEnabled ? 'Voz da IA ativada (clique para silenciar)' : 'Ativar voz falada da IA'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              ttsEnabled
                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{ttsEnabled ? 'Voz Ativa' : 'Voz Mudo'}</span>
          </button>

          {/* Voice Rate selector button */}
          <button
            onClick={() => {
              const rates = [1.0, 1.05, 1.15, 1.25, 0.9];
              const nextIdx = (rates.indexOf(voiceRate) + 1) % rates.length;
              onChangeVoiceRate(rates[nextIdx]);
            }}
            title="Ajustar velocidade da fala da IA"
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white font-mono text-[11px] cursor-pointer"
          >
            {voiceRate}x
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Configurações e Chave API Gemini"
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Caderno de Tópicos */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-200 hover:text-white transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-stone-400" />
            <span>Caderno de Tópicos</span>
            {savedSessionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-700/60 text-[10px] text-emerald-300 font-mono font-bold">
                {savedSessionsCount}
              </span>
            )}
          </button>

          {/* New Topic Action */}
          <button
            onClick={onOpenNewTopic}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Tópico</span>
          </button>
        </div>
      </div>
    </header>
  );
};
