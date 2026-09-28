import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface AudioDictationProps {
  onTranscriptSegment: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
}

export const AudioDictation: React.FC<AudioDictationProps> = ({
  onTranscriptSegment,
  isListening,
  setIsListening,
  disabled = false,
}) => {
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

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
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If still flagged as listening, restart (some browsers auto-stop after silence)
        if (isListening) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Falha ao inicializar reconhecimento de fala:', e);
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

  const toggleListening = () => {
    if (!supported || disabled) return;

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error('Error starting recognition:', e);
          setIsListening(false);
        }
      }
    }
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Reconhecimento de voz não suportado neste navegador. Digite sua explicação no campo de texto."
        className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed"
      >
        <MicOff className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? 'Parar microfone (ouvindo fala...)' : 'Falar explicação em voz alta (Ditado PT-BR)'}
        className={`relative p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
          isListening
            ? 'bg-rose-950/80 border-rose-600 text-rose-300 ring-2 ring-rose-500/50 animate-pulse'
            : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300 hover:text-stone-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 text-rose-400" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating active mic badge */}
      {isListening && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-700 text-rose-300 shadow-md">
          Ouvindo microfone...
        </span>
      )}
    </div>
  );
};
