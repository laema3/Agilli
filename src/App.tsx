import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { ConsolidatedPlanTable } from './components/ConsolidatedPlanTable';
import { PlanSection } from './components/PlanSection';
import { GrandTotalFooter } from './components/GrandTotalFooter';
import { FileUploadModal } from './components/FileUploadModal';
import { ClosureHistoryModal } from './components/ClosureHistoryModal';
import { PrintSettingsBar } from './components/PrintSettingsBar';
import {
  loadSavedClosures,
  addClosureRecord,
  deleteClosureRecord,
  updateClosureTitle,
  getActiveClosureId,
  setActiveClosureId,
  getInitialReport,
} from './utils/storage';
import { exportReportToExcel, exportReportToCSV } from './utils/export';
import { ReportData, ClosureRecord, PrintSettings } from './types';
import { formatCurrency, formatPercent } from './utils/parser';
import {
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Calendar,
  Building,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [closures, setClosures] = useState<ClosureRecord[]>([]);
  const [activeClosureId, setActiveIdState] = useState<string>('');
  const [activeReport, setActiveReport] = useState<ReportData>(getInitialReport());
  const [activeTab, setActiveTab] = useState<'report' | 'consolidated' | 'history' | 'printSettings'>('report');
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    fontSize: 'normal',
    showConsolidatedSummary: true,
    breakPageBetweenPlans: false,
    selectedPlanFilter: 'all',
    showSignatures: true,
    companyName: 'AGILLE TECNOLOGIA & MEIOS DE PAGAMENTO',
    reportSubtitle: 'Relatório Mensal de Fechamento de Vendas por Planos',
  });

  // Load saved closures on initial mount
  useEffect(() => {
    const saved = loadSavedClosures();
    setClosures(saved);
    const lastActiveId = getActiveClosureId();
    const found = saved.find((c) => c.id === lastActiveId) || saved[0];
    if (found) {
      setActiveIdState(found.id);
      setActiveReport(found.reportData);
    }
  }, []);

  // Handle setting a new active report from upload or selection
  const handleSelectClosure = (record: ClosureRecord) => {
    setActiveIdState(record.id);
    setActiveClosureId(record.id);
    setActiveReport(record.reportData);
  };

  const handleReportLoaded = (newReport: ReportData) => {
    const newRecord = addClosureRecord(newReport);
    setClosures(loadSavedClosures());
    setActiveIdState(newRecord.id);
    setActiveReport(newReport);
    setActiveTab('report');
  };

  const handleDeleteClosure = (id: string) => {
    const updated = deleteClosureRecord(id);
    setClosures(updated);
    if (activeClosureId === id && updated.length > 0) {
      handleSelectClosure(updated[0]);
    }
  };

  const handleRenameClosure = (id: string, newTitle: string) => {
    const updated = updateClosureTitle(id, newTitle);
    setClosures(updated);
    if (activeClosureId === id) {
      setActiveReport((prev) => ({ ...prev, title: newTitle }));
    }
  };

  const handleUpdatePrintSettings = (newSettings: Partial<PrintSettings>) => {
    setPrintSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const triggerPrint = (specificPlan?: string) => {
    if (specificPlan) {
      setPrintSettings((prev) => ({ ...prev, selectedPlanFilter: specificPlan }));
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const scrollToPlan = (planCode: string) => {
    setPlanFilter('all');
    setActiveTab('report');
    setTimeout(() => {
      const el = document.getElementById(`plano-${planCode}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Filter plans to display
  const plansToDisplay = useMemo(() => {
    const filter =
      printSettings.selectedPlanFilter !== 'all'
        ? printSettings.selectedPlanFilter
        : planFilter !== 'all'
        ? planFilter
        : 'all';

    if (filter === 'all') {
      return activeReport.plans;
    }
    return activeReport.plans.filter((p) => p.plano === filter);
  }, [activeReport, planFilter, printSettings.selectedPlanFilter]);

  // Dynamic CSS class for print font size
  const printFontSizeClass = useMemo(() => {
    if (printSettings.fontSize === 'compact') return 'print:text-[7pt]';
    if (printSettings.fontSize === 'ultra') return 'print:text-[6.5pt]';
    return 'print:text-[7.5pt]';
  }, [printSettings.fontSize]);

  return (
    <div className={`min-h-screen bg-slate-100/70 text-slate-900 ${printFontSizeClass}`}>
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'history') {
            setIsHistoryModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onPrint={() => triggerPrint()}
        totalVendas={activeReport.totalTransactions}
      />

      {/* Main Content Area */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isPrintPreview ? 'max-w-[1400px]' : ''}`}>
        {/* Print-Only Formal Document Header (Appears on every landscape printed document) */}
        <div className="hidden print:block mb-4 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight uppercase text-slate-900 font-mono">
                  {printSettings.companyName}
                </span>
                <span className="text-3xs text-slate-500 font-mono">
                  · SISTEMA AGILLE DE GESTÃO DE VENDAS
                </span>
              </div>
              <h1 className="text-sm font-bold text-slate-800 mt-0.5">
                {activeReport.title}
              </h1>
              <p className="text-3xs text-slate-600 font-mono">
                Período de Apuração: {activeReport.dateRange.minDate || 'Início'} até{' '}
                {activeReport.dateRange.maxDate || 'Fim'} · Arquivo: {activeReport.fileName}
              </p>
            </div>
            <div className="text-right text-3xs font-mono text-slate-700">
              <p>
                <strong>Data de Emissão:</strong> {new Date().toLocaleString('pt-BR')}
              </p>
              <p>
                <strong>Total de Vendas:</strong> {activeReport.totalTransactions} | <strong>Planos:</strong> {activeReport.distinctPlansCount}
              </p>
              <p className="text-emerald-800 font-bold">
                <strong>Total Líquido Geral:</strong> {formatCurrency(activeReport.grandTotalLiquido)}
              </p>
            </div>
          </div>
        </div>

        {/* Screen Controls & Print Settings Bar */}
        <PrintSettingsBar
          settings={printSettings}
          onUpdateSettings={handleUpdatePrintSettings}
          onPrint={() => triggerPrint()}
          onExportExcel={() => exportReportToExcel(activeReport)}
          onExportCSV={() => exportReportToCSV(activeReport)}
          plans={activeReport.plans}
          isPrintPreview={isPrintPreview}
          onTogglePreview={() => setIsPrintPreview(!isPrintPreview)}
        />

        {/* Informative Report Bar (Active Closure, Period, and Quick Stats) */}
        <div className="no-print bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {activeReport.title}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {activeReport.fileName}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Período: <strong>{activeReport.dateRange.minDate}</strong> até{' '}
                  <strong>{activeReport.dateRange.maxDate}</strong>
                </span>
                <span>·</span>
                <span>{activeReport.distinctPlansCount} planos cadastrados</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Trocar Fechamento ({closures.length})</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enviar Outra Planilha</span>
            </button>
          </div>
        </div>

        {/* High-level KPI Metric Cards */}
        <SummaryCards report={activeReport} />

        {/* Filter and Search Bar */}
        <div className="no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por comprador, autorização, fatura ou descrição..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 hover:text-slate-600 font-bold"
              >
                LIMPAR
              </button>
            )}
          </div>

          {/* Plan Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Filtrar Plano:
            </span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white"
            >
              <option value="all">Todos os Planos ({activeReport.plans.length})</option>
              {activeReport.plans.map((p) => (
                <option key={p.plano} value={p.plano}>
                  Plano {p.plano} ({p.totalVendas} vendas)
                </option>
              ))}
            </select>
          </div>

          {/* View Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'report' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transações & Subtotais
            </button>
            <button
              onClick={() => setActiveTab('consolidated')}
              className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'consolidated'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Apenas Consolidado
            </button>
          </div>
        </div>

        {/* View Mode 1: Consolidated Master Table (always visible in print if enabled in settings, or when on consolidated tab) */}
        {(activeTab === 'consolidated' || (activeTab === 'report' && printSettings.showConsolidatedSummary)) && (
          <ConsolidatedPlanTable
            report={activeReport}
            onSelectPlan={scrollToPlan}
            onPrintPlan={(p) => triggerPrint(p)}
            isPrintView={isPrintPreview}
          />
        )}

        {/* View Mode 2: Detailed Plan Sections with Subtotals */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="no-print flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Detalhamento por Planos com Subtotais Individuais</span>
                </h2>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Cada plano possui sua tabela de lançamentos seguida do respectivo subtotal de encerramento.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Mostrando {plansToDisplay.length} de {activeReport.plans.length} planos
              </span>
            </div>

            {plansToDisplay.map((plan, index) => (
              <PlanSection
                key={plan.plano}
                plan={plan}
                isPrintView={isPrintPreview}
                breakPageBefore={printSettings.breakPageBetweenPlans && index > 0}
                onPrintThisPlan={(p) => triggerPrint(p)}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}

        {/* Grand Total Footer at the very bottom of the document */}
        <GrandTotalFooter
          report={activeReport}
          showSignatures={printSettings.showSignatures}
        />
      </main>

      {/* Upload Spreadsheet Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onReportLoaded={handleReportLoaded}
      />

      {/* Historical Monthly Closures Modal */}
      <ClosureHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        closures={closures}
        activeClosureId={activeClosureId}
        onSelectClosure={handleSelectClosure}
        onDeleteClosure={handleDeleteClosure}
        onRenameClosure={handleRenameClosure}
        onNewClosure={() => setIsUploadModalOpen(true)}
      />
    </div>
  );
}
