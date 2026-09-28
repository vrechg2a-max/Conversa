import React, { useState } from 'react';
import { X, Key, ExternalLink, Sliders, Check, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  voiceRate: number;
  onChangeVoiceRate: (rate: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  voiceRate,
  onChangeVoiceRate,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Configurações da Conversa AI
              </h2>
              <p className="text-xs text-stone-400">
                Ajuste sua chave do Gemini e preferências de áudio.
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Custom API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
                Sua Chave Gemini API (Opcional):
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans underline"
              >
                <span>Obter chave gratuita</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy... (Deixe em branco para usar a chave padrão da Vercel)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700/80 text-white placeholder:text-stone-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              💡 Se você estiver enfrentando limite de cota gratuito da Google (erro 429), insira sua própria chave do Google AI Studio para conversar sem interrupções.
            </p>
          </div>

          {/* Voice Speech Rate */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider font-mono">
              Velocidade da Voz da IA ({voiceRate}x):
            </label>
            <div className="flex items-center gap-2">
              {[0.9, 1.0, 1.05, 1.15, 1.25].map((rate) => (
                <button
                  type="button"
                  key={rate}
                  onClick={() => onChangeVoiceRate(rate)}
                  className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    voiceRate === rate
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
