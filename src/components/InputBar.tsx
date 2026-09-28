import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckSquare, Sparkles, CornerDownLeft, Volume2 } from 'lucide-react';
import { AudioDictation } from './AudioDictation';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  onFinishTopic: () => void;
  isLoading: boolean;
  activeTopic: string | null;
  onOpenNewTopic: () => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  onFinishTopic,
  isLoading,
  activeTopic,
  onOpenNewTopic,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTranscript = (transcriptText: string) => {
    setInputText((prev) => {
      const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
      return prev + space + transcriptText;
    });
  };

  if (!activeTopic) {
    return (
      <div className="border-t border-stone-800 bg-stone-950 p-4 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-stone-400 text-center sm:text-left">
            Nenhum tópico em andamento. Defina o tema da matéria para abrir a sessão de avaliação.
          </p>
          <button
            onClick={onOpenNewTopic}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold cursor-pointer transition-all shadow-md shrink-0"
          >
            Abrir Novo Tópico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-stone-800 bg-stone-950/95 backdrop-blur p-3 sm:p-4 sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick action bar */}
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-stone-400 font-mono text-[11px] overflow-hidden">
            <span className="text-amber-500">▶</span>
            <span className="truncate">Explique a matéria como professor. Use jargão exato.</span>
          </div>

          {/* Quick finish button */}
          <button
            type="button"
            onClick={onFinishTopic}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700/80 text-[11px] font-medium transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Sinalizar que terminou para a banca gerar o relatório final de retenção"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
            <span>"Encerrei a Explicação"</span>
          </button>
        </div>

        {/* Text Input Row */}
        <div className="flex items-end gap-2 bg-stone-900 border border-stone-700/80 rounded-xl p-2 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all shadow-inner">
          {/* Audio dictation toggle */}
          <AudioDictation
            onTranscriptSegment={handleTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
            disabled={isLoading}
          />

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder='Ex: "O crime, segundo a teoria analítica adotada no Brasil pelo conceito tripartido, é composto por fato típico, ilícito e culpável..."'
            className="flex-1 bg-transparent border-0 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-0 resize-none text-xs sm:text-sm leading-relaxed max-h-40 py-1.5"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Enviar fala (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono px-1">
          <span>Enter para enviar • Shift+Enter para nova linha</span>
          <span>Banca: Rigor implacável de prova discursiva</span>
        </div>
      </div>
    </div>
  );
};
