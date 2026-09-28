import { useState, useEffect, useRef, useCallback } from 'react';
import { voice, sounds } from './audio';

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
  autoSendDelayMs = 1350,
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
  const isManuallyStoppingRef = useRef<boolean>(false);

  const isListeningRef = useRef(isListening);
  const isSpeakingRef = useRef(isSpeaking);
  const isLoadingRef = useRef(isLoading);
  const currentTextRef = useRef(currentText);
  const activeTopicRef = useRef(activeTopic);

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

  useEffect(() => {
    activeTopicRef.current = activeTopic;
  }, [activeTopic]);

  // Clear silence countdowns
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

  // Safe start wrapper
  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    try {
      isManuallyStoppingRef.current = false;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      // If already started, mark isListening true
      if (e?.name === 'InvalidStateError' || String(e).includes('already started')) {
        setIsListening(true);
      }
    }
  }, [isSupported]);

  // Safe stop wrapper
  const safeStopRecognition = useCallback(() => {
    if (!recognitionRef.current) return;
    clearSilenceTimers();
    isManuallyStoppingRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {}
    setIsListening(false);
  }, [clearSilenceTimers]);

  // Dispatch current accumulated speech
  const dispatchSend = useCallback(() => {
    const textToSend = currentTextRef.current.trim();
    if (!textToSend || isLoadingRef.current) return;

    clearSilenceTimers();
    setCurrentText('');
    setInterimText('');
    sounds.playMessageSentTone();

    // Temporarily pause recognition while AI evaluates
    safeStopRecognition();

    onSendMessage(textToSend);
  }, [onSendMessage, clearSilenceTimers, safeStopRecognition]);

  // Reset silence timer on new speech chunk
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

  // Initialize Web Speech Recognition
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
        // If AI is currently speaking and user begins talking, interrupt AI immediately (barge-in)
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
          clearSilenceTimers();
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal silence, ignore
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Microphone not allowed:', event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If the user did not manually stop and we are supposed to be listening (and topic is open)
        if (
          isListeningRef.current &&
          !isManuallyStoppingRef.current &&
          !isLoadingRef.current &&
          !isSpeakingRef.current &&
          activeTopicRef.current
        ) {
          setTimeout(() => {
            if (
              isListeningRef.current &&
              !isManuallyStoppingRef.current &&
              !isLoadingRef.current &&
              !isSpeakingRef.current
            ) {
              safeStartRecognition();
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech recognition error:', e);
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
  }, [clearSilenceTimers, startSilenceTimer, safeStartRecognition]);

  // When AI finishes speaking and isLoading is false, re-activate microphone for continuous turn-taking!
  const resumeTurnAfterAi = useCallback(() => {
    if (!activeTopicRef.current) return;
    clearSilenceTimers();
    setCurrentText('');
    setInterimText('');
    isManuallyStoppingRef.current = false;

    // Small delay to prevent catching the tail end of speaker audio
    setTimeout(() => {
      sounds.playYourTurnChime();
      safeStartRecognition();
    }, 250);
  }, [clearSilenceTimers, safeStartRecognition]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      safeStopRecognition();
    } else {
      safeStartRecognition();
    }
  }, [safeStopRecognition, safeStartRecognition]);

  const manualSend = useCallback(() => {
    dispatchSend();
  }, [dispatchSend]);

  return {
    isListening,
    setIsListening,
    toggleListening,
    startListening: safeStartRecognition,
    stopListening: safeStopRecognition,
    resumeTurnAfterAi,
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
