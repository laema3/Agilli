import React from 'react';
import { ReportData } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/parser';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

interface GrandTotalFooterProps {
  report: ReportData;
  showSignatures?: boolean;
}

export const GrandTotalFooter: React.FC<GrandTotalFooterProps> = ({
  report,
  showSignatures = true,
}) => {
  return (
    <div className="mt-8 mb-12 print-avoid-break">
      {/* Grand Total Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
                Soma Total de Todos os Planos
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Consolidação final de todos os {report.distinctPlansCount} planos encerrados no período ({report.dateRange.minDate} até {report.dateRange.maxDate}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/60 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Fechamento Balanceado (Bruto - MDR = Líquido)</span>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Geral de Vendas */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Qtd Total de Vendas
            </span>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              {formatNumber(report.totalTransactions)}
            </div>
            <span className="text-2xs text-slate-400 font-mono">
              Em {report.distinctPlansCount} planos
            </span>
          </div>

          {/* Total Geral Bruto */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Geral Bruto
            </span>
            <div className="text-2xl font-bold text-blue-300 font-mono tabular-nums">
              {formatCurrency(report.grandTotalBruto)}
            </div>
            <span className="text-2xs text-slate-400 font-mono">
              Ticket Médio: {formatCurrency(report.grandTicketMedio)}
            </span>
          </div>

          {/* Total Geral MDR */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Geral MDR (Taxas)
            </span>
            <div className="text-2xl font-bold text-amber-300 font-mono tabular-nums">
              {formatCurrency(report.grandTotalMdr)}
            </div>
            <span className="text-2xs text-slate-400 font-mono">
              Média Ponderada: {formatPercent(report.grandAvgMdrPercent)}
            </span>
          </div>

          {/* Total Geral Líquido */}
          <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-600/50 shadow-inner">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-1">
              Total Geral Líquido
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono tabular-nums">
              {formatCurrency(report.grandTotalLiquido)}
            </div>
            <span className="text-2xs text-emerald-200/80 font-mono">
              Valor líquido a receber
            </span>
          </div>
        </div>

        {/* Plan Breakdown Mini Ticker */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
          <div className="text-slate-400 font-semibold mb-2 flex items-center justify-between">
            <span>Distribuição por Plano no Fechamento:</span>
            <span className="font-mono text-2xs text-slate-500">{report.plans.length} planos</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.plans.map((p) => (
              <div
                key={p.plano}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-mono text-2xs border border-slate-700/60"
              >
                <span className="font-bold text-white">Plano {p.plano}:</span>
                <span className="text-emerald-400 font-semibold">{formatCurrency(p.totalLiquido)}</span>
                <span className="text-slate-400">({p.totalVendas})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signature block for landscape printing / formal audit */}
      {showSignatures && (
        <div className="print-only mt-10 pt-6 border-t border-slate-300 text-xs text-slate-600">
          <div className="grid grid-cols-3 gap-8 text-center pt-8">
            <div>
              <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Responsável pelo Fechamento</p>
              <p className="text-3xs text-slate-500">Depto. Financeiro / Vendas</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Conferência Agille</p>
              <p className="text-3xs text-slate-500">Validação de Planos & Taxas MDR</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Data de Aprovação</p>
              <p className="text-3xs text-slate-500">___ / ___ / 2026</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
