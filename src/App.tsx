/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TranscriptArea } from './components/TranscriptArea';
import { InputBar } from './components/InputBar';
import { TopicModal } from './components/TopicModal';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { ChatMessage, ExamBoard, SessionData } from './types';
import { playInterruptionBeep, speakExaminer, stopSpeaking } from './utils/audio';

const STORAGE_KEY_SESSIONS = 'banca_examinadora_sessions_v1';
const STORAGE_KEY_TTS = 'banca_examinadora_tts_enabled';
const STORAGE_KEY_SOUND = 'banca_examinadora_sound_enabled';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<ExamBoard>('Cebraspe');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Modals
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Settings
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_TTS) === 'true';
  });
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SOUND) !== 'false';
  });

  // Saved sessions
  const [savedSessions, setSavedSessions] = useState<SessionData[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TTS, String(ttsEnabled));
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOUND, String(soundAlertsEnabled));
  }, [soundAlertsEnabled]);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(savedSessions));
  }, [savedSessions]);

  // Format date helper
  const getFormattedDate = () => {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Open topic action
  const handleOpenTopic = async (topic: string, board: ExamBoard) => {
    stopSpeaking();
    setIsLoading(true);
    setActiveTopic(topic);
    setActiveBoard(board);
    setFinalReport(null);
    setMessages([]);

    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    const dateStr = getFormattedDate();

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          board,
          action: 'open',
          currentDate: dateStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar tópico na banca');
      }

      const openingMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'model',
        text: data.text || `[TÓPICO ABERTO: ${topic} | DATA: ${dateStr} | BANCA: ${board}]\nTópico registrado. Pode começar a explicação.`,
        timestamp: dateStr,
        turnType: 'OPENING',
        topic,
        board,
      };

      setMessages([openingMsg]);

      if (ttsEnabled) {
        speakExaminer("Tópico registrado. Pode começar a explicação.");
      }
    } catch (err: any) {
      console.error('Erro na abertura:', err);
      // Fallback local opening adhering to exact rule
      const fallbackMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'model',
        text: `[TÓPICO ABERTO: ${topic} | DATA: ${dateStr} | BANCA: ${board}]\nTópico registrado. Pode começar a explicação.`,
        timestamp: dateStr,
        turnType: 'OPENING',
        topic,
        board,
      };
      setMessages([fallbackMsg]);
      if (ttsEnabled) {
        speakExaminer("Tópico registrado. Pode começar a explicação.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send explanation message
  const handleSendMessage = async (text: string) => {
    if (!activeTopic) {
      // If user typed "Vou falar sobre X", extract and open topic
      const lower = text.toLowerCase();
      if (lower.startsWith('vou falar sobre') || lower.startsWith('tema:')) {
        const extracted = text.replace(/^(vou falar sobre|tema:)/i, '').trim();
        if (extracted) {
          handleOpenTopic(extracted, activeBoard);
          return;
        }
      }
      setIsTopicModalOpen(true);
      return;
    }

    const timestamp = getFormattedDate();
    const userMsg: ChatMessage = {
      id: 'msg-u-' + Date.now(),
      role: 'user',
      text,
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
          board: activeBoard,
          action: 'message',
          userMessage: text,
          history: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
            turnType: m.turnType,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro no retorno da banca');
      }

      const modelMsg: ChatMessage = {
        id: 'msg-m-' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: getFormattedDate(),
        turnType: data.turnType,
      };

      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);

      // Handle Interruption / Alert
      if (data.turnType === 'INTERRUPTION') {
        if (soundAlertsEnabled) {
          playInterruptionBeep();
        }
        if (ttsEnabled) {
          speakExaminer(data.text);
        }
      } else if (data.turnType === 'CORRECT_PROCEED') {
        if (ttsEnabled) {
          speakExaminer(data.text);
        }
      } else if (data.turnType === 'EVALUATION') {
        setFinalReport(data.text);
        saveSessionToStorage(finalMessages, data.text);
        if (ttsEnabled) {
          speakExaminer("Avaliação de retenção concluída. Relatório estruturado emitido.");
        }
      }
    } catch (err: any) {
      console.error('Erro na avaliação:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'model',
        text: 'Interrupção de comunicação com o servidor de avaliação: ' + (err.message || 'Erro inesperado.'),
        timestamp: getFormattedDate(),
        turnType: 'INTERRUPTION',
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly finish topic and trigger final report
  const handleFinishTopic = async () => {
    if (!activeTopic || isLoading) return;

    const timestamp = getFormattedDate();
    const finishPrompt = "Encerrei minha explicação sobre o tema.";
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
          board: activeBoard,
          action: 'finish',
          userMessage: finishPrompt,
          history: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
            turnType: m.turnType,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao gerar relatório final');
      }

      const reportMsg: ChatMessage = {
        id: 'msg-m-' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: getFormattedDate(),
        turnType: 'EVALUATION',
      };

      const finalMessages = [...updatedMessages, reportMsg];
      setMessages(finalMessages);
      setFinalReport(data.text);
      saveSessionToStorage(finalMessages, data.text);

      if (ttsEnabled) {
        speakExaminer("Avaliação de retenção concluída. Relatório emitido.");
      }
    } catch (err: any) {
      console.error('Erro ao finalizar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to save session into state and localStorage
  const saveSessionToStorage = (allMessages: ChatMessage[], reportText: string) => {
    if (!activeTopic) return;

    let diagnostic: 'Superficial' | 'Mediana' | 'Aprofundada' | 'Pendente' = 'Pendente';
    const lower = reportText.toLowerCase();
    if (lower.includes('superficial')) diagnostic = 'Superficial';
    else if (lower.includes('mediana')) diagnostic = 'Mediana';
    else if (lower.includes('aprofundada')) diagnostic = 'Aprofundada';

    const interruptionsCount = allMessages.filter((m) => m.turnType === 'INTERRUPTION').length;

    const newSession: SessionData = {
      id: currentSessionId || Date.now().toString(),
      topic: activeTopic,
      board: activeBoard,
      date: getFormattedDate(),
      messages: allMessages,
      finalReport: reportText,
      diagnostic,
      interruptionCount: interruptionsCount,
    };

    setSavedSessions((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === newSession.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newSession;
        return copy;
      }
      return [newSession, ...prev];
    });
  };

  // Select session from history
  const handleSelectSession = (session: SessionData) => {
    setActiveTopic(session.topic);
    setActiveBoard(session.board);
    setMessages(session.messages);
    setFinalReport(session.finalReport || null);
    setCurrentSessionId(session.id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    setSavedSessions([]);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Top Header */}
      <Header
        currentBoard={activeBoard}
        activeTopic={activeTopic}
        ttsEnabled={ttsEnabled}
        onToggleTts={() => {
          if (ttsEnabled) stopSpeaking();
          setTtsEnabled(!ttsEnabled);
        }}
        soundAlertsEnabled={soundAlertsEnabled}
        onToggleSoundAlerts={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
        onOpenNewTopic={() => setIsTopicModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        savedSessionsCount={savedSessions.length}
      />

      {/* Main Conversation & Evaluation Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TranscriptArea
          messages={messages}
          activeTopic={activeTopic}
          activeBoard={activeBoard}
          isLoading={isLoading}
          onOpenNewTopic={() => setIsTopicModalOpen(true)}
          onFinishTopic={handleFinishTopic}
          finalReport={finalReport}
        />

        {/* Input & Dictation Area */}
        <InputBar
          onSendMessage={handleSendMessage}
          onFinishTopic={handleFinishTopic}
          isLoading={isLoading}
          activeTopic={activeTopic}
          onOpenNewTopic={() => setIsTopicModalOpen(true)}
        />
      </main>

      {/* New Topic Opening Modal */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSubmit={handleOpenTopic}
        initialTopic={activeTopic || ''}
        initialBoard={activeBoard}
      />

      {/* Sessions History Modal */}
      <SessionHistoryModal
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
