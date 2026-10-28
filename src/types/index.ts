export interface Transaction {
  id: string;
  dataLancamento: string;
  autorizacao: string;
  valorBruto: number;
  descricao: string;
  plano: string;
  dataInicioPeriodo: string;
  dataFimPeriodo: string;
  mdrValor: number;
  mdrPercent: number;
  valorLiquido: number;
  comprador: string;
  vencimento: string;
  fatura: string;
  dataLiquidacao?: string;
  valorAntecipado?: number;
  valorLiquidoAntecipado?: number;
}

export interface PlanSummary {
  plano: string;
  dataInicioPeriodo: string;
  dataFimPeriodo: string;
  vencimento: string;
  fatura: string;
  totalVendas: number;
  totalBruto: number;
  totalMdr: number;
  avgMdrPercent: number;
  totalLiquido: number;
  ticketMedio: number;
  percentualDoTotalBruto: number;
  transactions: Transaction[];
}

export interface ReportData {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  plans: PlanSummary[];
  totalTransactions: number;
  grandTotalBruto: number;
  grandTotalMdr: number;
  grandTotalLiquido: number;
  grandAvgMdrPercent: number;
  grandTicketMedio: number;
  dateRange: {
    minDate: string;
    maxDate: string;
  };
  distinctPlansCount: number;
}

export interface ClosureRecord {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  periodLabel: string;
  totalVendas: number;
  totalBruto: number;
  totalLiquido: number;
  plansCount: number;
  reportData: ReportData;
}

export interface PrintSettings {
  fontSize: 'normal' | 'compact' | 'ultra';
  showConsolidatedSummary: boolean;
  breakPageBetweenPlans: boolean;
  selectedPlanFilter: string; // 'all' or specific plan
  showSignatures: boolean;
  companyName: string;
  reportSubtitle: string;
}
