import React, { useState, useRef, useEffect } from 'react';
import { Send, Award, CornerDownLeft, Sparkles, HelpCircle } from 'lucide-react';
import { AudioDictation } from './AudioDictation';

interface InputBarProps {
  onSendMessage: (text: string) => void;
  onFinishTopic: () => void;
  isLoading: boolean;
  activeTopic: string | null;
  onOpenNewTopic: () => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  onFinishTopic,
  isLoading,
  activeTopic,
  onOpenNewTopic,
  isListening,
  setIsListening,
}) => {
  const [inputText, setInputText] = useState('');
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
            Nenhuma matéria em andamento. Defina o tema para começar sua conversa por voz com a IA.
          </p>
          <button
            onClick={onOpenNewTopic}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold cursor-pointer transition-all shadow-md shrink-0"
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
          <div className="flex items-center gap-1.5 text-stone-400 font-sans text-xs overflow-hidden">
            <span className="text-emerald-400 font-bold">🎙️</span>
            <span className="truncate">Explique com suas palavras. A IA te responderá por voz e fará perguntas.</span>
          </div>

          {/* Finish & Grade button */}
          <button
            type="button"
            onClick={onFinishTopic}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Finalizar explicação e receber nota e observações"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Finalizar e Ver Nota</span>
          </button>
        </div>

        {/* Input Controls Row */}
        <div className="flex items-end gap-2 bg-stone-900 border border-stone-800 rounded-2xl p-2 focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all shadow-inner">
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
            placeholder='Fale no microfone ou digite sua explicação aqui... (Ex: "Na lei de abuso de autoridade, o sujeito ativo é qualquer agente público...")'
            className="flex-1 bg-transparent border-0 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-0 resize-none text-xs sm:text-sm leading-relaxed max-h-40 py-2 font-sans"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Enviar fala (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick action chips & hint */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 font-sans px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendMessage('O que você achou dessa parte? Pode me fazer uma pergunta?')}
              className="text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              💡 Me faça uma pergunta
            </button>
            <span>•</span>
            <button
              onClick={() => onSendMessage('Cometi algum erro conceital no que acabei de explicar?')}
              className="text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              ❓ Cometi algum erro?
            </button>
          </div>
          <span className="hidden sm:inline">Pressione Enter para enviar</span>
        </div>
      </div>
    </div>
  );
};
