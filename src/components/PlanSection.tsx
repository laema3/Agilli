import React, { useState } from 'react';
import { PlanSummary } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/parser';
import { ChevronDown, ChevronUp, Printer, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface PlanSectionProps {
  plan: PlanSummary;
  isPrintView?: boolean;
  breakPageBefore?: boolean;
  onPrintThisPlan?: (planCode: string) => void;
  searchTerm?: string;
}

export const PlanSection: React.FC<PlanSectionProps> = ({
  plan,
  isPrintView = false,
  breakPageBefore = false,
  onPrintThisPlan,
  searchTerm = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter transactions if user has entered search term
  const filteredTransactions = plan.transactions.filter((tx) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.comprador.toLowerCase().includes(term) ||
      tx.autorizacao.toLowerCase().includes(term) ||
      tx.descricao.toLowerCase().includes(term) ||
      tx.fatura.toLowerCase().includes(term) ||
      tx.dataLancamento.toLowerCase().includes(term)
    );
  });

  const pageBreakClass = breakPageBefore ? 'print-page-break' : '';

  return (
    <section
      id={`plano-${plan.plano}`}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs mb-6 overflow-hidden ${pageBreakClass}`}
    >
      {/* Plan Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm font-mono shadow-xs">
            {plan.plano}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                Plano {plan.plano}
              </h3>
              <span className="text-xs text-slate-300 font-medium">
                · {formatNumber(plan.totalVendas)} {plan.totalVendas === 1 ? 'venda' : 'vendas'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-slate-300 mt-0.5 font-mono">
              {plan.dataInicioPeriodo && plan.dataFimPeriodo && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Período: {plan.dataInicioPeriodo} a {plan.dataFimPeriodo}
                </span>
              )}
              {plan.vencimento && (
                <span>Vencimento: {plan.vencimento}</span>
              )}
              {plan.fatura && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Fatura: {plan.fatura}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-emerald-400 font-mono tabular-nums">
              Líquido: {formatCurrency(plan.totalLiquido)}
            </div>
            <div className="text-3xs text-slate-400 font-mono">
              Bruto: {formatCurrency(plan.totalBruto)} · MDR: {formatCurrency(plan.totalMdr)}
            </div>
          </div>

          <div className="no-print flex items-center gap-1.5">
            {onPrintThisPlan && (
              <button
                onClick={() => onPrintThisPlan(plan.plano)}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={`Imprimir somente o Plano ${plan.plano}`}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? 'Expandir transações' : 'Recolher transações'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table Body */}
      {(!isCollapsed || isPrintView) && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold text-3xs uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 px-3">Data / Hora</th>
                <th className="py-2 px-3">Autorização</th>
                <th className="py-2 px-3">Descrição da Operação</th>
                <th className="py-2 px-3">Comprador</th>
                <th className="py-2 px-3">Vencimento</th>
                <th className="py-2 px-3">Fatura</th>
                <th className="py-2 px-3 text-right">Valor Bruto</th>
                <th className="py-2 px-3 text-right">MDR (R$)</th>
                <th className="py-2 px-3 text-right">MDR (%)</th>
                <th className="py-2 px-3 text-right font-bold text-emerald-800">Valor Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400">
                    Nenhuma venda encontrada para o filtro informado neste plano.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="py-1.5 px-3 font-mono text-3xs sm:text-xs text-slate-600 whitespace-nowrap">
                      {tx.dataLancamento}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-3xs sm:text-xs text-slate-700 whitespace-nowrap">
                      {tx.autorizacao}
                    </td>
                    <td className="py-1.5 px-3 text-slate-800 text-3xs sm:text-xs max-w-[200px] truncate" title={tx.descricao}>
                      {tx.descricao}
                    </td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium text-3xs sm:text-xs max-w-[220px] truncate" title={tx.comprador}>
                      {tx.comprador || '-'}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-3xs sm:text-xs text-slate-600 whitespace-nowrap">
                      {tx.vencimento || '-'}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-3xs sm:text-xs text-slate-600 whitespace-nowrap">
                      {tx.fatura || '-'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap text-3xs sm:text-xs">
                      {formatCurrency(tx.valorBruto)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-amber-700 whitespace-nowrap text-3xs sm:text-xs">
                      {formatCurrency(tx.mdrValor)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-500 whitespace-nowrap text-3xs sm:text-xs">
                      {formatPercent(tx.mdrPercent)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap text-3xs sm:text-xs">
                      {formatCurrency(tx.valorLiquido)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtotal Footer Bar for this Plan */}
      <div className="bg-slate-100 border-t-2 border-slate-300 px-4 py-3 print-avoid-break">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Subtotal do Plano {plan.plano} (Fechamento)
            </span>
            <span className="text-xs text-slate-500 font-mono">
              · {formatNumber(plan.totalVendas)} vendas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Total Bruto:</span>
              <span className="font-bold text-slate-900 font-mono tabular-nums">
                {formatCurrency(plan.totalBruto)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Total MDR:</span>
              <span className="font-bold text-amber-700 font-mono tabular-nums">
                {formatCurrency(plan.totalMdr)}
              </span>
              <span className="text-2xs text-slate-400 font-mono">
                ({formatPercent(plan.avgMdrPercent)})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="text-emerald-800 font-bold">Total Líquido:</span>
              <span className="font-extrabold text-emerald-800 font-mono tabular-nums text-sm">
                {formatCurrency(plan.totalLiquido)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
