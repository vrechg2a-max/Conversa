import React from 'react';
import { 
  Scale, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  History, 
  PlusCircle, 
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { ExamBoard } from '../types';

interface HeaderProps {
  currentBoard: ExamBoard;
  activeTopic: string | null;
  ttsEnabled: boolean;
  onToggleTts: () => void;
  soundAlertsEnabled: boolean;
  onToggleSoundAlerts: () => void;
  onOpenNewTopic: () => void;
  onOpenHistory: () => void;
  savedSessionsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentBoard,
  activeTopic,
  ttsEnabled,
  onToggleTts,
  soundAlertsEnabled,
  onToggleSoundAlerts,
  onOpenNewTopic,
  onOpenHistory,
  savedSessionsCount,
}) => {
  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-stone-100 flex items-center gap-2 font-serif">
                BancaExaminadora<span className="text-amber-500 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/30">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-full">
                <GraduationCap className="w-3 h-3 text-amber-400" />
                Aprendizagem Ativa & Rigor Técnico
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Você explica como <span className="text-stone-200 font-medium">Professor</span>. A IA avalia com o rigor implacável da banca.
            </p>
          </div>
        </div>

        {/* Right: Board Indicator & Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Active Board Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300">
            <span className="text-stone-500 text-[10px] uppercase font-mono">Banca:</span>
            <span className="font-semibold text-amber-400">{currentBoard}</span>
          </div>

          {/* Toggle Voice Reading (TTS) */}
          <button
            onClick={onToggleTts}
            title={ttsEnabled ? 'Voz da banca ativada (clique para silenciar)' : 'Ativar leitura em voz alta da banca'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              ttsEnabled 
                ? 'bg-amber-950/50 border-amber-700/60 text-amber-300' 
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Voz da Banca</span>
          </button>

          {/* Toggle Interruption Sound Alert */}
          <button
            onClick={onToggleSoundAlerts}
            title={soundAlertsEnabled ? 'Alerta sonoro de interrupção ativado' : 'Alerta sonoro desativado'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              soundAlertsEnabled 
                ? 'bg-stone-900 border-amber-800/60 text-amber-400' 
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {soundAlertsEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Bip Alerta</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-stone-400" />
            <span>Histórico</span>
            {savedSessionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-stone-800 text-[10px] text-amber-400 font-mono">
                {savedSessionsCount}
              </span>
            )}
          </button>

          {/* New Topic Button */}
          <button
            onClick={onOpenNewTopic}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium transition-colors shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Tópico</span>
          </button>
        </div>
      </div>
    </header>
  );
};
