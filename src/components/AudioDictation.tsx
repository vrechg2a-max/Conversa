import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

interface AudioDictationProps {
  onTranscriptSegment: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
  buttonLabel?: string;
  className?: string;
}

export const AudioDictation: React.FC<AudioDictationProps> = ({
  onTranscriptSegment,
  isListening,
  setIsListening,
  disabled = false,
  buttonLabel,
  className = '',
}) => {
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          }
        }
        if (finalChunk.trim()) {
          onTranscriptSegment(finalChunk.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition warning:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If still flagged as listening by parent, keep active
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Falha ao inicializar Web Speech Recognition:', e);
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Sync external state changes
  useEffect(() => {
    if (!recognitionRef.current || !supported) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started or busy
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [isListening, supported]);

  const toggleListening = () => {
    if (!supported || disabled) return;
    setIsListening(!isListening);
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Reconhecimento de voz não suportado neste navegador. Digite no campo de texto."
        className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Clique para pausar microfone' : 'Falar explicação por voz (Microfone PT-BR)'}
        className={`relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
          isListening
            ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950/50'
            : 'bg-stone-900 border-stone-700/80 hover:border-emerald-500/60 text-stone-200 hover:text-emerald-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {isListening ? (
          <>
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            {buttonLabel && <span className="text-xs font-semibold text-rose-200">{buttonLabel}</span>}
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            {buttonLabel && <span className="text-xs font-medium">{buttonLabel}</span>}
          </>
        )}
      </button>

      {/* Floating active mic badge */}
      {isListening && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300 shadow-md">
          Microfone Ligado
        </span>
      )}
    </div>
  );
};
