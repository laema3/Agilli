import React from 'react';
import { ReportData, PlanSummary } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/parser';
import { ExternalLink, Printer } from 'lucide-react';

interface ConsolidatedPlanTableProps {
  report: ReportData;
  onSelectPlan?: (planCode: string) => void;
  onPrintPlan?: (planCode: string) => void;
  isPrintView?: boolean;
}

export const ConsolidatedPlanTable: React.FC<ConsolidatedPlanTableProps> = ({
  report,
  onSelectPlan,
  onPrintPlan,
  isPrintView = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs mb-8 print-avoid-break">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Resumo Consolidado por Planos</span>
            <span className="text-xs font-normal text-slate-500">
              ({report.plans.length} planos identificados)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visão gerencial consolidada com fechamento de valores brutos, taxas MDR e valores líquidos de cada plano.
          </p>
        </div>
        {!isPrintView && (
          <div className="no-print text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Clique em um plano para navegar diretamente às suas transações</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold uppercase text-3xs tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3">Plano</th>
              <th className="py-2.5 px-3">Início Período</th>
              <th className="py-2.5 px-3">Fim Período</th>
              <th className="py-2.5 px-3">Vencimento</th>
              <th className="py-2.5 px-3">Fatura</th>
              <th className="py-2.5 px-3 text-right">Qtd Vendas</th>
              <th className="py-2.5 px-3 text-right">Total Bruto</th>
              <th className="py-2.5 px-3 text-right">Taxa MDR</th>
              <th className="py-2.5 px-3 text-right">% MDR Médio</th>
              <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Total Líquido</th>
              <th className="py-2.5 px-3 text-right">% do Total</th>
              {!isPrintView && <th className="no-print py-2.5 px-3 text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {report.plans.map((p, idx) => (
              <tr
                key={p.plano}
                onClick={() => onSelectPlan && onSelectPlan(p.plano)}
                className={`transition-colors cursor-pointer hover:bg-emerald-50/40 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                }`}
              >
                <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 rounded-md bg-slate-800 text-white font-mono text-xs font-semibold shadow-2xs">
                    {p.plano}
                  </span>
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-mono text-3xs sm:text-xs">
                  {p.dataInicioPeriodo || '-'}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-mono text-3xs sm:text-xs">
                  {p.dataFimPeriodo || '-'}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-mono text-3xs sm:text-xs">
                  {p.vencimento || '-'}
                </td>
                <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-mono text-3xs sm:text-xs">
                  {p.fatura || '-'}
                </td>
                <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                  {formatNumber(p.totalVendas)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-900 whitespace-nowrap font-medium">
                  {formatCurrency(p.totalBruto)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-amber-700 whitespace-nowrap">
                  {formatCurrency(p.totalMdr)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                  {formatPercent(p.avgMdrPercent)}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                  {formatCurrency(p.totalLiquido)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                  {formatPercent(p.percentualDoTotalBruto)}
                </td>
                {!isPrintView && (
                  <td className="no-print py-2 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectPlan && onSelectPlan(p.plano)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                        title="Ver transações deste plano"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      {onPrintPlan && (
                        <button
                          onClick={() => onPrintPlan(p.plano)}
                          className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="Imprimir somente este plano"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-800 text-white font-bold border-t-2 border-slate-900">
              <td className="py-3 px-3 uppercase tracking-wider text-xs" colSpan={5}>
                Soma Total de Todos os Planos
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap">
                {formatNumber(report.totalTransactions)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap text-blue-200">
                {formatCurrency(report.grandTotalBruto)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap text-amber-300">
                {formatCurrency(report.grandTotalMdr)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap text-slate-300">
                {formatPercent(report.grandAvgMdrPercent)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap text-emerald-300 font-extrabold">
                {formatCurrency(report.grandTotalLiquido)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-xs whitespace-nowrap text-slate-300">
                100.00%
              </td>
              {!isPrintView && <td className="no-print py-3 px-3"></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
