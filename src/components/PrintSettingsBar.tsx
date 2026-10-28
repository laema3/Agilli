import React from 'react';
import { PrintSettings, PlanSummary } from '../types';
import { Printer, Eye, Sliders, FileSpreadsheet, Check, Download } from 'lucide-react';

interface PrintSettingsBarProps {
  settings: PrintSettings;
  onUpdateSettings: (newSettings: Partial<PrintSettings>) => void;
  onPrint: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  plans: PlanSummary[];
  isPrintPreview: boolean;
  onTogglePreview: () => void;
}

export const PrintSettingsBar: React.FC<PrintSettingsBarProps> = ({
  settings,
  onUpdateSettings,
  onPrint,
  onExportExcel,
  onExportCSV,
  plans,
  isPrintPreview,
  onTogglePreview,
}) => {
  return (
    <div className="no-print bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Print Info & Quick Buttons */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Controle de Impressão (Modo Paisagem A4)
            </h3>
            <p className="text-2xs text-slate-500">
              Otimizado para formulários contínuos, tabelas largas e subtotais por plano.
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onTogglePreview}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isPrintPreview
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPrintPreview ? 'Voltar para Modo Tela' : 'Prévia de Impressão'}</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            title="Exportar planilha formatada em Excel com subtotais"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-2xs"
            title="Exportar dados em CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Paisagem (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* Filter Plan */}
        <div>
          <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
            Plano a Imprimir:
          </label>
          <select
            value={settings.selectedPlanFilter}
            onChange={(e) => onUpdateSettings({ selectedPlanFilter: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:border-emerald-500"
          >
            <option value="all">Todos os Planos ({plans.length} planos)</option>
            {plans.map((p) => (
              <option key={p.plano} value={p.plano}>
                Plano {p.plano} ({p.totalVendas} vendas · {p.fatura ? `Fat: ${p.fatura}` : 'S/ Fat'})
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
            Densidade da Fonte:
          </label>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
            <button
              onClick={() => onUpdateSettings({ fontSize: 'normal' })}
              className={`flex-1 py-1 text-2xs font-medium rounded-md transition-colors ${
                settings.fontSize === 'normal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => onUpdateSettings({ fontSize: 'compact' })}
              className={`flex-1 py-1 text-2xs font-medium rounded-md transition-colors ${
                settings.fontSize === 'compact' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Compacto
            </button>
            <button
              onClick={() => onUpdateSettings({ fontSize: 'ultra' })}
              className={`flex-1 py-1 text-2xs font-medium rounded-md transition-colors ${
                settings.fontSize === 'ultra' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Ultra
            </button>
          </div>
        </div>

        {/* Page Break Toggle */}
        <div>
          <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
            Paginação entre Planos:
          </label>
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.breakPageBetweenPlans}
              onChange={(e) => onUpdateSettings({ breakPageBetweenPlans: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              1 página por plano
            </span>
          </label>
        </div>

        {/* Show Consolidated Summary */}
        <div>
          <label className="block text-2xs font-bold text-slate-600 uppercase mb-1">
            Resumo Inicial:
          </label>
          <label className="flex items-center gap-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showConsolidatedSummary}
              onChange={(e) => onUpdateSettings({ showConsolidatedSummary: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              Imprimir tabela consolidada
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
