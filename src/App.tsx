/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TranscriptArea } from './components/TranscriptArea';
import { InputBar } from './components/InputBar';
import { VoiceCallView } from './components/VoiceCallView';
import { NewTopicModal } from './components/NewTopicModal';
import { TopicHistoryModal } from './components/TopicHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage, SavedTopicSession, TopicEvaluation } from './types';
import { voice, sounds } from './utils/audio';
import { useVoiceConversation } from './utils/useVoiceConversation';

const STORAGE_KEY_SESSIONS = 'conversa_ai_topics_v2';
const STORAGE_KEY_TTS = 'conversa_ai_tts_enabled';
const STORAGE_KEY_VOICE_RATE = 'conversa_ai_voice_rate';
const STORAGE_KEY_API_KEY = 'conversa_gemini_api_key';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluation, setEvaluation] = useState<TopicEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // View mode: 'call' (interactive glowing orb) or 'chat' (full transcript feed)
  const [viewMode, setViewMode] = useState<'call' | 'chat'>('call');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Modals
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Custom API key
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
  });

  // Settings
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TTS);
    return saved !== null ? saved === 'true' : true;
  });

  const [voiceRate, setVoiceRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VOICE_RATE);
    return saved ? parseFloat(saved) : 1.05;
  });

  // Saved topics history
  const [savedSessions, setSavedSessions] = useState<SavedTopicSession[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (data) return JSON.parse(data);
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TTS, String(ttsEnabled));
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOICE_RATE, String(voiceRate));
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_API_KEY, customApiKey);
  }, [customApiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(savedSessions));
  }, [savedSessions]);

  const getFormattedDate = () => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to speak with TTS and resume mic when speech finishes
  const speakText = useCallback(
    (text: string, onDone?: () => void) => {
      if (!ttsEnabled) {
        setIsSpeaking(false);
        onDone?.();
        return;
      }
      setIsSpeaking(true);
      voice.speak(text, {
        rate: voiceRate,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          onDone?.();
        },
        onError: () => {
          setIsSpeaking(false);
          onDone?.();
        },
      });
    },
    [ttsEnabled, voiceRate]
  );

  const handleStopSpeaking = useCallback(() => {
    voice.stop();
    setIsSpeaking(false);
  }, []);

  // Send message implementation
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      handleStopSpeaking();

      if (!activeTopic) {
        handleOpenTopic(text.trim());
        return;
      }

      const timestamp = getFormattedDate();
      const userMsg: ChatMessage = {
        id: 'msg-u-' + Date.now(),
        role: 'user',
        text: text.trim(),
        timestamp,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const historyForApi = [...messages, userMsg].map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}),
          },
          body: JSON.stringify({
            topic: activeTopic,
            action: 'message',
            userMessage: text.trim(),
            customApiKey: customApiKey || undefined,
            history: historyForApi,
          }),
        });

        const data = await res.json();

        if (data.isQuotaExceeded) {
          const warnMsg: ChatMessage = {
            id: 'msg-quota-' + Date.now(),
            role: 'assistant',
            text: 'A cota gratuita dos modelos de IA atingiu o limite temporário da Google. Aguarde alguns instantes ou adicione sua chave própria nas configurações.',
            timestamp: getFormattedDate(),
            interlocutionType: 'correction',
          };
          setMessages((prev) => [...prev, warnMsg]);
          speakText(data.spokenFeedback, () => {
            voiceHook.resumeTurnAfterAi();
          });
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || 'Erro na resposta do tutor');
        }

        if (data.type === 'EVALUATION' && data.evaluation) {
          const reportMsg: ChatMessage = {
            id: 'msg-eval-' + Date.now(),
            role: 'assistant',
            text: data.spokenFeedback || 'Avaliação final concluída!',
            timestamp: getFormattedDate(),
            interlocutionType: 'evaluation',
            evaluation: data.evaluation,
          };

          setMessages((prev) => {
            const final = [...prev, reportMsg];
            saveSessionToStorage(final, data.evaluation);
            return final;
          });

          setEvaluation(data.evaluation);
          sounds.playGradeFanfare();
          speakText(data.spokenFeedback || 'Parabéns por concluir sua explicação!');
          voiceHook.stopListening();
        } else {
          const aiReply = data.spokenFeedback || data.text || 'Entendido. Continue sua explicação!';
          const interlocutionType = data.interlocutionType || 'question';

          const aiMsg: ChatMessage = {
            id: 'msg-ai-' + Date.now(),
            role: 'assistant',
            text: aiReply,
            timestamp: getFormattedDate(),
            interlocutionType,
            detectedCorrection: data.detectedCorrection,
          };

          setMessages((prev) => [...prev, aiMsg]);

          if (interlocutionType === 'correction') {
            sounds.playCorrectionPing();
          }

          // Read aloud and immediately resume listening for the next conversational turn!
          speakText(aiReply, () => {
            voiceHook.resumeTurnAfterAi();
          });
        }
      } catch (err: any) {
        console.error('Erro na resposta:', err);
        const errMsg: ChatMessage = {
          id: 'msg-err-' + Date.now(),
          role: 'assistant',
          text: 'Tive uma instabilidade rápida de conexão: ' + (err?.message || 'Pode continuar falando.'),
          timestamp: getFormattedDate(),
          interlocutionType: 'correction',
        };
        setMessages((prev) => [...prev, errMsg]);
        // Resume mic so user can keep going
        voiceHook.resumeTurnAfterAi();
      } finally {
        setIsLoading(false);
      }
    },
    [activeTopic, isLoading, messages, speakText, handleStopSpeaking, customApiKey]
  );

  // Hook for voice conversation with automatic silence detection (VAD) and auto turn-taking
  const voiceHook = useVoiceConversation({
    onSendMessage: handleSendMessage,
    isLoading,
    isSpeaking,
    activeTopic,
    autoSendDelayMs: 1350,
  });

  // Open Topic action
  const handleOpenTopic = async (topic: string) => {
    handleStopSpeaking();
    sounds.playStartChime();

    setIsLoading(true);
    setActiveTopic(topic);
    setEvaluation(null);
    setMessages([]);
    voiceHook.setCurrentText('');
    setViewMode('call');

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    const dateStr = getFormattedDate();

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}),
        },
        body: JSON.stringify({
          topic,
          action: 'open',
          customApiKey: customApiKey || undefined,
        }),
      });

      const data = await res.json();
      const welcomeText =
        data.spokenFeedback ||
        `Excelente escolha! Pode começar a me explicar ${topic} quando quiser. Estou ouvindo com atenção.`;

      const openingMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: welcomeText,
        timestamp: dateStr,
        interlocutionType: 'encouragement',
      };

      setMessages([openingMsg]);

      // Speak welcome and then activate microphone for conversation
      speakText(welcomeText, () => {
        voiceHook.resumeTurnAfterAi();
      });
    } catch (err: any) {
      console.warn('Fallback abertura local:', err);
      const fallbackText = `Excelente escolha! Pode começar a me explicar ${topic} quando quiser. Estou ouvindo com atenção.`;
      const fallbackMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: fallbackText,
        timestamp: dateStr,
        interlocutionType: 'encouragement',
      };
      setMessages([fallbackMsg]);
      speakText(fallbackText, () => {
        voiceHook.resumeTurnAfterAi();
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly finish topic and trigger final grade
  const handleFinishTopic = async () => {
    if (!activeTopic || isLoading) return;

    handleStopSpeaking();
    voiceHook.stopListening();
    voiceHook.setCurrentText('');

    const timestamp = getFormattedDate();
    const finishPrompt = 'Encerrei minha explicação sobre o tema. Pode avaliar meu desempenho e dar a nota com observações.';
    const userMsg: ChatMessage = {
      id: 'msg-finish-u-' + Date.now(),
      role: 'user',
      text: finishPrompt,
      timestamp,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey ? { 'x-gemini-key': customApiKey } : {}),
        },
        body: JSON.stringify({
          topic: activeTopic,
          action: 'finish',
          userMessage: finishPrompt,
          customApiKey: customApiKey || undefined,
          history: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar avaliação final');
      }

      const evalData: TopicEvaluation = data.evaluation || {
        grade: 8.0,
        gradeLevel: 'Domínio Avançado',
        whatWentWrong: ['Nenhum equívoco grave identificado.'],
        whatToImprove: ['Aprofundar os desdobramentos práticos da matéria.'],
        strengths: ['Boa estrutura geral e clareza na exposição oral.'],
        summary: `Resumo do tópico ${activeTopic}: conceitos explicados com clareza oral.`,
      };

      const spoken =
        data.spokenFeedback ||
        `Parabéns por concluir sua explicação sobre ${activeTopic}! Sua nota foi ${evalData.grade.toFixed(1)}. Veja suas observações no relatório.`;

      const reportMsg: ChatMessage = {
        id: 'msg-eval-' + Date.now(),
        role: 'assistant',
        text: spoken,
        timestamp: getFormattedDate(),
        interlocutionType: 'evaluation',
        evaluation: evalData,
      };

      const finalMessages = [...updatedMessages, reportMsg];
      setMessages(finalMessages);
      setEvaluation(evalData);
      saveSessionToStorage(finalMessages, evalData);
      sounds.playGradeFanfare();
      speakText(spoken);
    } catch (err: any) {
      console.error('Erro ao finalizar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSessionToStorage = (allMessages: ChatMessage[], evalData: TopicEvaluation) => {
    if (!activeTopic) return;

    const interruptionsCount = allMessages.filter((m) => m.interlocutionType === 'correction').length;

    const newSession: SavedTopicSession = {
      id: currentSessionId || Date.now().toString(),
      topic: activeTopic,
      date: getFormattedDate(),
      updatedAt: new Date().toISOString(),
      messages: allMessages,
      evaluation: evalData,
      interruptionCount: interruptionsCount,
      attemptsCount: 1,
    };

    setSavedSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === newSession.id || s.topic.toLowerCase() === activeTopic.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...newSession,
          attemptsCount: (copy[idx].attemptsCount || 1) + 1,
        };
        return copy;
      }
      return [newSession, ...prev];
    });
  };

  const handleRetryTopic = () => {
    if (activeTopic) {
      handleOpenTopic(activeTopic);
    }
  };

  const handleSelectSession = (session: SavedTopicSession) => {
    setActiveTopic(session.topic);
    setMessages(session.messages);
    setEvaluation(session.evaluation || null);
    setCurrentSessionId(session.id);
    setViewMode(session.evaluation ? 'chat' : 'call');
  };

  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllSessions = () => {
    setSavedSessions([]);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        activeTopic={activeTopic}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => {
          if (ttsEnabled) handleStopSpeaking();
          setTtsEnabled(!ttsEnabled);
        }}
        voiceRate={voiceRate}
        onChangeVoiceRate={setVoiceRate}
        onOpenNewTopic={() => setIsNewTopicModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        savedSessionsCount={savedSessions.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'call' ? 'chat' : 'call')}
      />

      {/* Main Conversation & Evaluation Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTopic && viewMode === 'call' && !evaluation ? (
          /* Voice Call Mode (Fluid Voice-to-Voice Loop) */
          <VoiceCallView
            topic={activeTopic}
            messages={messages}
            isListening={voiceHook.isListening}
            onToggleListening={voiceHook.toggleListening}
            isSpeaking={isSpeaking}
            onStopSpeaking={handleStopSpeaking}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onFinishTopic={handleFinishTopic}
            evaluation={evaluation}
            currentTranscript={voiceHook.currentText}
            interimTranscript={voiceHook.interimText}
            silenceCountdown={voiceHook.silenceCountdown}
            autoSendEnabled={voiceHook.autoSendEnabled}
            onToggleAutoSend={() => voiceHook.setAutoSendEnabled(!voiceHook.autoSendEnabled)}
            onManualSend={voiceHook.manualSend}
            onRetryTopic={handleRetryTopic}
            onSwitchToChat={() => setViewMode('chat')}
          />
        ) : (
          /* Chat & Transcript Feed Mode */
          <>
            <TranscriptArea
              messages={messages}
              activeTopic={activeTopic}
              isLoading={isLoading}
              onOpenNewTopic={() => setIsNewTopicModalOpen(true)}
              onFinishTopic={handleFinishTopic}
              evaluation={evaluation}
              onPlayMessageAudio={(txt) => speakText(txt)}
              onRetryTopic={handleRetryTopic}
            />

            {/* Input Bar */}
            <InputBar
              onSendMessage={handleSendMessage}
              onFinishTopic={handleFinishTopic}
              isLoading={isLoading}
              activeTopic={activeTopic}
              onOpenNewTopic={() => setIsNewTopicModalOpen(true)}
              isListening={voiceHook.isListening}
              setIsListening={voiceHook.setIsListening}
            />
          </>
        )}
      </main>

      {/* New Topic Opening Modal */}
      <NewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={() => setIsNewTopicModalOpen(false)}
        onSubmit={handleOpenTopic}
        initialTopic={activeTopic || ''}
      />

      {/* Topic History & Saved Grades Modal */}
      <TopicHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sessions={savedSessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAllSessions}
      />

      {/* Settings Modal (API Key & Audio) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={customApiKey}
        onSaveApiKey={setCustomApiKey}
        voiceRate={voiceRate}
        onChangeVoiceRate={setVoiceRate}
      />
    </div>
  );
}
