import { useState, useEffect, useRef, useCallback } from 'react';
import { voice } from './audio';

interface UseVoiceConversationProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isSpeaking: boolean;
  activeTopic: string | null;
  autoSendDelayMs?: number;
}

export function useVoiceConversation({
  onSendMessage,
  isLoading,
  isSpeaking,
  activeTopic,
  autoSendDelayMs = 1400,
}: UseVoiceConversationProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(true);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isListeningRef = useRef(isListening);
  const isSpeakingRef = useRef(isSpeaking);
  const isLoadingRef = useRef(isLoading);
  const currentTextRef = useRef(currentText);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    currentTextRef.current = currentText;
  }, [currentText]);

  // Clear silence timers
  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSilenceCountdown(null);
  }, []);

  // Dispatch current accumulated speech
  const dispatchSend = useCallback(() => {
    const textToSend = currentTextRef.current.trim();
    if (!textToSend || isLoadingRef.current) return;

    clearSilenceTimers();
    setCurrentText('');
    setInterimText('');
    onSendMessage(textToSend);
  }, [onSendMessage, clearSilenceTimers]);

  // Reset silence timer on new speech
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimers();
    if (!autoSendEnabled) return;

    const startTime = Date.now();
    const duration = autoSendDelayMs;

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setSilenceCountdown(Math.ceil(remaining / 100) / 10);
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
      }
    }, 100);

    silenceTimerRef.current = setTimeout(() => {
      dispatchSend();
    }, duration);
  }, [autoSendEnabled, autoSendDelayMs, clearSilenceTimers, dispatchSend]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        // If AI is speaking and user starts talking, interrupt AI immediately (barge-in)
        if (isSpeakingRef.current) {
          voice.stop();
        }

        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        if (finalChunk.trim()) {
          setCurrentText((prev) => {
            const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + space + finalChunk.trim();
          });
          setInterimText('');
          startSilenceTimer();
        } else if (interim.trim()) {
          setInterimText(interim);
          // If we have some pending text or active speech, keep timer alive
          clearSilenceTimers();
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is completely normal when user pauses
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Microphone permission not allowed:', event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Automatically keep alive if flagged as listening and not in loading/speaking
        if (isListeningRef.current && !isLoadingRef.current) {
          try {
            recognition.start();
          } catch {
            // Wait slightly before restarting
            setTimeout(() => {
              if (isListeningRef.current && !isLoadingRef.current) {
                try {
                  recognition.start();
                } catch {}
              }
            }, 300);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech recognition init error:', e);
      setIsSupported(false);
    }

    return () => {
      clearSilenceTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [clearSilenceTimers, startSilenceTimer]);

  // Synchronize mic on/off
  useEffect(() => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch {}
    } else {
      clearSilenceTimers();
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [isListening, isSupported, clearSilenceTimers]);

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  const manualSend = useCallback(() => {
    dispatchSend();
  }, [dispatchSend]);

  return {
    isListening,
    setIsListening,
    toggleListening,
    currentText,
    setCurrentText,
    interimText,
    silenceCountdown,
    autoSendEnabled,
    setAutoSendEnabled,
    manualSend,
    isSupported,
  };
}
