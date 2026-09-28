import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Download, 
  FileText, 
  Target, 
  AlertCircle, 
  EyeOff, 
  BookMarked,
  Share2
} from 'lucide-react';

interface ReportViewProps {
  rawReport: string;
  topic: string;
  board: string;
  date?: string;
  onNewSession?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  rawReport,
  topic,
  board,
  date,
  onNewSession,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = rawReport;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const safeTopic = topic.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const filename = `Avaliacao_Retencao_${safeTopic}.txt`;
    const blob = new Blob([rawReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper parser to render visual structured sections if standard format is present
  const parseSections = () => {
    const diagMatch = rawReport.match(/Diagnóstico de Precisão:\s*([\s\S]*?)(?=Correções Realizadas:|$)/i);
    const corrMatch = rawReport.match(/Correções Realizadas:\s*([\s\S]*?)(?=Pontos Cegos:|$)/i);
    const blindMatch = rawReport.match(/Pontos Cegos:\s*([\s\S]*?)(?=Resumo Consolidado:|$)/i);
    const summaryMatch = rawReport.match(/Resumo Consolidado:\s*([\s\S]*?)$/i);

    return {
      diagnostico: diagMatch ? diagMatch[1].trim() : '',
      correcoes: corrMatch ? corrMatch[1].trim() : '',
      pontosCegos: blindMatch ? blindMatch[1].trim() : '',
      resumo: summaryMatch ? summaryMatch[1].trim() : '',
    };
  };

  const sections = parseSections();

  const getDiagnosticColor = (diagText: string) => {
    const lower = diagText.toLowerCase();
    if (lower.includes('aprofundada') || lower.includes('avançada') || lower.includes('excelente')) {
      return {
        badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
        title: 'Nível Aprofundado (Apto para Discursiva / Oral)',
      };
    }
    if (lower.includes('mediana') || lower.includes('intermediária') || lower.includes('regular')) {
      return {
        badge: 'bg-amber-950/80 text-amber-400 border-amber-700/60',
        title: 'Nível Mediano (Necessita aprofundamento técnico)',
      };
    }
    return {
      badge: 'bg-rose-950/80 text-rose-400 border-rose-700/60',
      title: 'Nível Superficial (Insuficiente para Banca)',
    };
  };

  const diagStyle = getDiagnosticColor(sections.diagnostico);

  return (
    <div className="w-full my-6 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl text-stone-200">
      {/* Top Banner */}
      <div className="px-5 py-4 bg-stone-950 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-600/40 uppercase tracking-wider">
              Relatório Conclusivo da Banca
            </span>
            <span className="text-xs text-stone-400 font-mono">Banca: {board}</span>
          </div>
          <h3 className="text-base font-semibold text-stone-100 font-serif mt-1">
            {topic}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Relatório'}</span>
          </button>

          <button
            onClick={handleDownload}
            title="Baixar como arquivo TXT"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar TXT</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Parsed Cards + Plain Text Toggle */}
      <div className="p-5 space-y-5">
        {/* 1. Diagnóstico */}
        {sections.diagnostico && (
          <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Diagnóstico de Precisão
              </span>
              <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${diagStyle.badge}`}>
                {diagStyle.title}
              </span>
            </div>
            <p className="text-sm text-stone-200 leading-relaxed font-serif">
              {sections.diagnostico}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2. Correções Realizadas */}
          {sections.correcoes && (
            <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/90 space-y-2">
              <span className="text-xs font-semibold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Correções Realizadas
              </span>
              <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap font-sans space-y-1">
                {sections.correcoes}
              </div>
            </div>
          )}

          {/* 3. Pontos Cegos */}
          {sections.pontosCegos && (
            <div className="p-4 rounded-lg bg-stone-950 border border-stone-800/90 space-y-2">
              <span className="text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                Pontos Cegos (Cobrança da Banca)
              </span>
              <div className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap font-sans space-y-1">
                {sections.pontosCegos}
              </div>
            </div>
          )}
        </div>

        {/* 4. Resumo Consolidado */}
        {sections.resumo && (
          <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-700/40 space-y-2">
            <span className="text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" />
              Resumo Consolidado (Material de Revisão Ativa)
            </span>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif italic border-l-2 border-amber-600/70 pl-3">
              "{sections.resumo}"
            </p>
          </div>
        )}

        {/* Plain Text Monospace Container (Exact formatted version specified by user) */}
        <div className="mt-4 pt-4 border-t border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-500" />
              Texto Puro para Salvar / Copiar (Formato Oficial da Banca):
            </span>
            <button
              onClick={handleCopy}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              {copied ? 'Copiado!' : 'Copiar bloco de texto'}
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-[11px] sm:text-xs text-stone-300 font-mono whitespace-pre-wrap select-all overflow-x-auto leading-relaxed">
            {rawReport}
          </pre>
        </div>
      </div>
    </div>
  );
};
