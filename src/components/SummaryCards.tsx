import React from 'react';
import { ReportData } from '../types';
import { formatCurrency, formatPercent, formatNumber } from '../utils/parser';
import { DollarSign, Percent, TrendingUp, ShoppingBag, Layers, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  report: ReportData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ report }) => {
  return (
    <div className="no-print grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Bruto */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Bruto
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
            {formatCurrency(report.grandTotalBruto)}
          </div>
          <span className="text-2xs text-slate-400 font-medium">100% das transações</span>
        </div>
      </div>

      {/* 2. Total Taxa MDR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Taxa MDR
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-bold text-amber-700 font-mono tabular-nums leading-tight">
            {formatCurrency(report.grandTotalMdr)}
          </div>
          <span className="text-2xs text-slate-500 font-mono">
            Média: {formatPercent(report.grandAvgMdrPercent)}
          </span>
        </div>
      </div>

      {/* 3. Total Líquido */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Total Líquido
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-extrabold text-emerald-700 font-mono tabular-nums leading-tight">
            {formatCurrency(report.grandTotalLiquido)}
          </div>
          <span className="text-2xs text-emerald-800 font-medium">
            Valor a liquidar
          </span>
        </div>
      </div>

      {/* 4. Total de Vendas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Vendas
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
            {formatNumber(report.totalTransactions)}
          </div>
          <span className="text-2xs text-slate-400">Transações confirmadas</span>
        </div>
      </div>

      {/* 5. Planos Ativos */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Planos
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
            {report.distinctPlansCount}
          </div>
          <span className="text-2xs text-slate-400">Letras & números</span>
        </div>
      </div>

      {/* 6. Ticket Médio */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ticket Médio
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-lg lg:text-xl font-bold text-slate-900 font-mono tabular-nums leading-tight">
            {formatCurrency(report.grandTicketMedio)}
          </div>
          <span className="text-2xs text-slate-400">Por venda realizada</span>
        </div>
      </div>
    </div>
  );
};
