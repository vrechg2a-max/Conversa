import React, { useState } from 'react';
import { 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  BookMarked, 
  Copy, 
  Check, 
  Download, 
  RotateCcw,
  Sparkles,
  Share2
} from 'lucide-react';
import { TopicEvaluation } from '../types';

interface TopicEvaluationCardProps {
  evaluation: TopicEvaluation;
  topic: string;
  date: string;
  onRetryTopic?: () => void;
}

export const TopicEvaluationCard: React.FC<TopicEvaluationCardProps> = ({
  evaluation,
  topic,
  date,
  onRetryTopic,
}) => {
  const [copied, setCopied] = useState(false);

  const getScoreColor = (grade: number) => {
    if (grade >= 8.5) {
      return {
        bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
        ring: 'text-emerald-400',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
        title: 'Excelente Desempenho!',
      };
    }
    if (grade >= 7.0) {
      return {
        bg: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300',
        ring: 'text-blue-400',
        badge: 'bg-blue-950/80 text-blue-300 border-blue-600/40',
        title: 'Bom Domínio do Tema',
      };
    }
    if (grade >= 5.0) {
      return {
        bg: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
        ring: 'text-amber-400',
        badge: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
        title: 'Conhecimento Mediano / Pontos de Atenção',
      };
    }
    return {
      bg: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300',
      ring: 'text-rose-400',
      badge: 'bg-rose-950/80 text-rose-300 border-rose-600/40',
      title: 'Superficial / Necessita Revisão Urgente',
    };
  };

  const style = getScoreColor(evaluation.grade);

  const generateFullText = () => {
    return `AVALIAÇÃO DE DESEMPENHO - CONVERSA AI
Tópico: ${topic}
Data: ${date}
Nota Final: ${evaluation.grade.toFixed(1)} / 10 (${evaluation.gradeLevel})

--- O QUE VOCÊ FALOU DE ERRADO / CORREÇÕES ---
${evaluation.whatWentWrong.length > 0 ? evaluation.whatWentWrong.map((item) => `• ${item}`).join('\n') : '• Nenhum erro grave identificado durante a explanação.'}

--- O QUE VOCÊ PRECISA MELHORAR ---
${evaluation.whatToImprove.length > 0 ? evaluation.whatToImprove.map((item) => `• ${item}`).join('\n') : '• Mantenha a clareza e avance para tópicos conexos.'}

--- PONTOS FORTES DA EXPLICAÇÃO ---
${evaluation.strengths.length > 0 ? evaluation.strengths.map((item) => `• ${item}`).join('\n') : '• Boa iniciativa e coragem para explicar o tema.'}

--- RESUMO RÁPIDO PARA FIXAÇÃO ---
${evaluation.summary}
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateFullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleDownload = () => {
    const safeTopic = topic.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35);
    const blob = new Blob([generateFullText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Avaliacao_${safeTopic}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full my-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 shadow-2xl overflow-hidden transition-all">
      {/* Header Banner with Grade */}
      <div className={`p-6 sm:p-7 border-b border-stone-800/80 bg-gradient-to-r ${style.bg} relative`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                {evaluation.gradeLevel}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {date}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              {topic}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              {style.title} — Avaliação baseada na sua explicação por voz.
            </p>
          </div>

          {/* Grade Display Circle */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end shrink-0">
            <div className="flex items-baseline gap-1 bg-stone-950/80 px-4 py-2.5 rounded-2xl border border-stone-700/60 shadow-lg">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {evaluation.grade.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-stone-400 font-mono">/ 10</span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">Nota da Explicação</span>
          </div>
        </div>

        {/* Action buttons bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          {onRetryTopic && (
            <button
              onClick={onRetryTopic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-stone-950 transition-all shadow cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Explicar Novamente (Subir Nota)</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                copied
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Registro'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 cursor-pointer"
              title="Baixar em arquivo TXT"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar TXT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Feedback Sections */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Section 1: O que você falou de errado / Correções */}
        <div className="rounded-xl p-5 bg-rose-950/20 border border-rose-900/40 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <h4>O que você falou de errado (Equívocos & Correções)</h4>
          </div>
          {evaluation.whatWentWrong && evaluation.whatWentWrong.length > 0 ? (
            <ul className="space-y-2 text-xs sm:text-sm text-stone-200 leading-relaxed">
              {evaluation.whatWentWrong.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-stone-400 italic">
              Nenhum erro grave detectado! Seus conceitos foram precisos.
            </p>
          )}
        </div>

        {/* Section 2: O que você precisa melhorar */}
        <div className="rounded-xl p-5 bg-amber-950/20 border border-amber-900/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <TrendingUp className="w-4 h-4 shrink-0 text-amber-500" />
            <h4>O que você precisa melhorar (Pontos de Atenção & Lacunas)</h4>
          </div>
          {evaluation.whatToImprove && evaluation.whatToImprove.length > 0 ? (
            <ul className="space-y-2 text-xs sm:text-sm text-stone-200 leading-relaxed">
              {evaluation.whatToImprove.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-stone-400 italic">
              Sua cobertura do tema foi bastante abrangente.
            </p>
          )}
        </div>

        {/* Section 3: Pontos Fortes */}
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="rounded-xl p-5 bg-emerald-950/20 border border-emerald-900/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <h4>Pontos Fortes da Sua Explicação</h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-200 leading-relaxed">
              {evaluation.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 4: Resumo Rápido de Fixação */}
        {evaluation.summary && (
          <div className="rounded-xl p-5 bg-stone-900/90 border border-stone-800 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <BookMarked className="w-4 h-4 shrink-0 text-indigo-400" />
              <h4>Resumo de Ouro para Memorização Rápida</h4>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed italic border-l-2 border-indigo-500/60 pl-3">
              "{evaluation.summary}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
