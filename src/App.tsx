/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { TranscriptArea } from './components/TranscriptArea';
import { InputBar } from './components/InputBar';
import { VoiceCallView } from './components/VoiceCallView';
import { NewTopicModal } from './components/NewTopicModal';
import { TopicHistoryModal } from './components/TopicHistoryModal';
import { ChatMessage, SavedTopicSession, TopicEvaluation } from './types';
import { voice, sounds } from './utils/audio';

const STORAGE_KEY_SESSIONS = 'conversa_ai_topics_v2';
const STORAGE_KEY_TTS = 'conversa_ai_tts_enabled';
const STORAGE_KEY_VOICE_RATE = 'conversa_ai_voice_rate';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [evaluation, setEvaluation] = useState<TopicEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // View mode: 'call' (interactive glowing orb) or 'chat' (full transcript feed)
  const [viewMode, setViewMode] = useState<'call' | 'chat'>('call');

  // Voice Interaction state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  // Modals
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Settings
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TTS);
    return saved !== null ? saved === 'true' : true; // Default ON for voice app
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
      // Legacy migration check
      const oldData = localStorage.getItem('banca_examinadora_sessions_v1');
      if (oldData) {
        const parsedOld = JSON.parse(oldData);
        return parsedOld.map((o: any) => ({
          id: o.id || Date.now().toString(),
          topic: o.topic || 'Tópico de Estudo',
          date: o.date || new Date().toLocaleDateString('pt-BR'),
          updatedAt: new Date().toISOString(),
          messages: o.messages || [],
          interruptionCount: o.interruptionCount || 0,
          attemptsCount: 1,
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TTS, String(ttsEnabled));
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOICE_RATE, String(voiceRate));
  }, [voiceRate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(savedSessions));
  }, [savedSessions]);

  // Date formatter
  const getFormattedDate = () => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to speak with TTS
  const speakText = (text: string) => {
    if (!ttsEnabled) return;
    setIsSpeaking(true);
    voice.speak(text, {
      rate: voiceRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Stop speaking
  const handleStopSpeaking = () => {
    voice.stop();
    setIsSpeaking(false);
  };

  // Open Topic
  const handleOpenTopic = async (topic: string) => {
    handleStopSpeaking();
    sounds.playStartChime();

    setIsLoading(true);
    setActiveTopic(topic);
    setEvaluation(null);
    setMessages([]);
    setCurrentTranscript('');
    setViewMode('call'); // Start in immersive voice call mode

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    const dateStr = getFormattedDate();

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          action: 'open',
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
      speakText(welcomeText);
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
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
      // Automatically prompt mic so user can talk
      setIsListening(true);
    }
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    handleStopSpeaking();
    setCurrentTranscript('');

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

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          action: 'message',
          userMessage: text.trim(),
          history: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na resposta do tutor');
      }

      if (data.type === 'EVALUATION' && data.evaluation) {
        // Final evaluation triggered by words like "encerrei"
        const reportMsg: ChatMessage = {
          id: 'msg-eval-' + Date.now(),
          role: 'assistant',
          text: data.spokenFeedback || 'Avaliação final gerada com sucesso!',
          timestamp: getFormattedDate(),
          interlocutionType: 'evaluation',
          evaluation: data.evaluation,
        };

        const finalMessages = [...updatedMessages, reportMsg];
        setMessages(finalMessages);
        setEvaluation(data.evaluation);
        saveSessionToStorage(finalMessages, data.evaluation);
        sounds.playGradeFanfare();
        speakText(data.spokenFeedback || 'Parabéns por concluir sua explicação!');
        setIsListening(false);
      } else {
        // Normal conversation turn
        const aiReply = data.spokenFeedback || data.text || 'Entendido. Prossiga com sua explicação!';
        const interlocutionType = data.interlocutionType || 'question';

        const aiMsg: ChatMessage = {
          id: 'msg-ai-' + Date.now(),
          role: 'assistant',
          text: aiReply,
          timestamp: getFormattedDate(),
          interlocutionType,
          detectedCorrection: data.detectedCorrection,
        };

        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);

        if (interlocutionType === 'correction') {
          sounds.playCorrectionPing();
        }

        speakText(aiReply);
      }
    } catch (err: any) {
      console.error('Erro na resposta:', err);
      const errMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: 'Não consegui processar essa fala agora: ' + (err?.message || 'Tente novamente.'),
        timestamp: getFormattedDate(),
        interlocutionType: 'correction',
      };
      setMessages([...updatedMessages, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly finish topic and trigger final grade
  const handleFinishTopic = async () => {
    if (!activeTopic || isLoading) return;

    handleStopSpeaking();
    setIsListening(false);
    setCurrentTranscript('');

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          action: 'finish',
          userMessage: finishPrompt,
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

  // Save session in storage organized by topic
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

  // Re-try / Re-explain the same topic to improve grade
  const handleRetryTopic = () => {
    if (activeTopic) {
      handleOpenTopic(activeTopic);
    }
  };

  // Select session from history
  const handleSelectSession = (session: SavedTopicSession) => {
    setActiveTopic(session.topic);
    setMessages(session.messages);
    setEvaluation(session.evaluation || null);
    setCurrentSessionId(session.id);
    setViewMode(session.evaluation ? 'chat' : 'call');
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Clear all
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
        savedSessionsCount={savedSessions.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'call' ? 'chat' : 'call')}
      />

      {/* Main Conversation & Evaluation Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTopic && viewMode === 'call' && !evaluation ? (
          /* Voice Call Mode (Glowing Visualizer Orb & Real-time Live Interaction) */
          <VoiceCallView
            topic={activeTopic}
            messages={messages}
            isListening={isListening}
            onToggleListening={() => setIsListening(!isListening)}
            isSpeaking={isSpeaking}
            onStopSpeaking={handleStopSpeaking}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onFinishTopic={handleFinishTopic}
            evaluation={evaluation}
            currentTranscript={currentTranscript}
            onRetryTopic={handleRetryTopic}
            onSwitchToChat={() => setViewMode('chat')}
          />
        ) : (
          /* Chat & Transcript Mode */
          <>
            <TranscriptArea
              messages={messages}
              activeTopic={activeTopic}
              isLoading={isLoading}
              onOpenNewTopic={() => setIsNewTopicModalOpen(true)}
              onFinishTopic={handleFinishTopic}
              evaluation={evaluation}
              onPlayMessageAudio={speakText}
              onRetryTopic={handleRetryTopic}
            />

            {/* Input Bar (with Dictation and typing) */}
            <InputBar
              onSendMessage={handleSendMessage}
              onFinishTopic={handleFinishTopic}
              isLoading={isLoading}
              activeTopic={activeTopic}
              onOpenNewTopic={() => setIsNewTopicModalOpen(true)}
              isListening={isListening}
              setIsListening={setIsListening}
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
    </div>
  );
}
