import { ClosureRecord, ReportData } from '../types';
import { DEFAULT_RAW_ROWS } from '../data/defaultData';
import { normalizeRow, buildReportFromTransactions } from './parser';

const STORAGE_KEY = 'agille_sales_closures_v1';
const ACTIVE_CLOSURE_KEY = 'agille_sales_active_id_v1';

export function getInitialReport(): ReportData {
  const transactions = DEFAULT_RAW_ROWS.map((row, idx) => normalizeRow(row as Record<string, unknown>, idx));
  return buildReportFromTransactions(
    transactions,
    'Fechamento Agille - Setembro/Outubro 2026',
    'RelatorioVendas.xls'
  );
}

export function loadSavedClosures(): ClosureRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialReport();
      const defaultRecord: ClosureRecord = {
        id: 'fechamento-inicial-amostra',
        title: 'Fechamento Set/Out 2026 (Planilha Anexada)',
        fileName: 'RelatorioVendas.xls',
        createdAt: new Date().toISOString(),
        periodLabel: `${initial.dateRange.minDate} até ${initial.dateRange.maxDate}`,
        totalVendas: initial.totalTransactions,
        totalBruto: initial.grandTotalBruto,
        totalLiquido: initial.grandTotalLiquido,
        plansCount: initial.distinctPlansCount,
        reportData: initial,
      };
      saveClosures([defaultRecord]);
      return [defaultRecord];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading closures from localStorage', err);
    return [];
  }
}

export function saveClosures(closures: ClosureRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(closures));
  } catch (err) {
    console.error('Error saving closures to localStorage', err);
  }
}

export function addClosureRecord(report: ReportData): ClosureRecord {
  const closures = loadSavedClosures();
  const newRecord: ClosureRecord = {
    id: report.id,
    title: report.title,
    fileName: report.fileName,
    createdAt: report.createdAt,
    periodLabel: `${report.dateRange.minDate} até ${report.dateRange.maxDate}`,
    totalVendas: report.totalTransactions,
    totalBruto: report.grandTotalBruto,
    totalLiquido: report.grandTotalLiquido,
    plansCount: report.distinctPlansCount,
    reportData: report,
  };

  const updated = [newRecord, ...closures.filter((c) => c.id !== newRecord.id)];
  saveClosures(updated);
  setActiveClosureId(newRecord.id);
  return newRecord;
}

export function deleteClosureRecord(id: string): ClosureRecord[] {
  const closures = loadSavedClosures();
  const updated = closures.filter((c) => c.id !== id);
  saveClosures(updated);
  return updated;
}

export function updateClosureTitle(id: string, newTitle: string): ClosureRecord[] {
  const closures = loadSavedClosures();
  const updated = closures.map((c) => {
    if (c.id === id) {
      return {
        ...c,
        title: newTitle,
        reportData: {
          ...c.reportData,
          title: newTitle,
        },
      };
    }
    return c;
  });
  saveClosures(updated);
  return updated;
}

export function getActiveClosureId(): string | null {
  return localStorage.getItem(ACTIVE_CLOSURE_KEY);
}

export function setActiveClosureId(id: string): void {
  localStorage.setItem(ACTIVE_CLOSURE_KEY, id);
}
