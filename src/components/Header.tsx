import React from 'react';
import { Printer, UploadCloud, FileSpreadsheet, History, Layers, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'report' | 'consolidated' | 'history' | 'printSettings';
  setActiveTab: (tab: 'report' | 'consolidated' | 'history' | 'printSettings') => void;
  onOpenUpload: () => void;
  onPrint: () => void;
  totalVendas: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onPrint,
  totalVendas,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                Agille Relatórios
              </span>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                Fechamento por Planos & Subtotais
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'report'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Relatório Completo por Planos
            </button>

            <button
              onClick={() => setActiveTab('consolidated')}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'consolidated'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Resumo Consolidado
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              Fechamentos Mensais
            </button>

            <button
              onClick={() => setActiveTab('printSettings')}
              className={`flex items-center gap-1.5 py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'printSettings'
                  ? 'border-emerald-600 text-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Opções de Impressão
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Anexar nova planilha de fechamento (.xls, .xlsx, .csv, .txt)"
            >
              <UploadCloud className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Nova Planilha</span>
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Imprimir relatório em modo paisagem (A4)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Paisagem</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
