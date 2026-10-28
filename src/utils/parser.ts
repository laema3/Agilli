import * as XLSX from 'xlsx';
import { ReportData, Transaction, PlanSummary } from '../types';

/**
 * Parses numeric currency strings like "R$ 1.234,56", "10,78", "880.29", numbers, or nulls.
 */
export function parseCurrency(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  const str = String(val).trim().replace(/^R\$\s*/i, '');
  if (!str) return 0;
  
  // If string contains comma, it's typically Brazilian format: 1.234,56 or 10,78
  if (str.includes(',')) {
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses percentage strings like "6.957", "2", "2,5%", or numbers.
 */
export function parsePercent(val: unknown): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  const str = String(val).trim().replace('%', '');
  if (str.includes(',')) {
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalizes header string to match known patterns.
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ''); // alphanumeric only
}

/**
 * Maps raw object keys to standardized Transaction fields.
 */
export function normalizeRow(raw: Record<string, unknown>, index: number): Transaction {
  const normMap: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    normMap[normalizeHeader(key)] = val;
  }

  const getVal = (keys: string[]): unknown => {
    for (const k of keys) {
      if (normMap[k] !== undefined && normMap[k] !== null && normMap[k] !== '') {
        return normMap[k];
      }
    }
    return '';
  };

  const dataLancamento = String(getVal(['datalancamento', 'datalanc', 'datatransacao', 'datavenda', 'data']) || '').trim();
  const autorizacao = String(getVal(['autorizacao', 'aut', 'nsu', 'autoriz']) || '').trim();
  const valorBrutoRaw = getVal(['valortransacao', 'valorbruto', 'transacao', 'bruto', 'valor']);
  const descricao = String(getVal(['descricao', 'produto', 'tipocartao', 'tipo', 'operacao']) || 'VENDA').trim();
  const plano = String(getVal(['plano', 'codplano', 'codigoplano', 'plan']) || 'Outros').trim();
  const dataInicioPeriodo = String(getVal(['datainicioperiodo', 'datainicio', 'inicioperiodo', 'periodoinicio']) || '').trim();
  const dataFimPeriodo = String(getVal(['datafimperiodo', 'datafim', 'fimperiodo', 'periodofim']) || '').trim();
  const mdrValorRaw = getVal(['mdrr', 'mdrvalor', 'taxamdr', 'mdr', 'taxar', 'valormdr']);
  const mdrPercentRaw = getVal(['mdr', 'taxa', 'taxapercent', 'percentmdr']);
  const valorLiquidoRaw = getVal(['valorliquido', 'liquido', 'valorliq', 'liq']);
  const comprador = String(getVal(['comprador', 'cliente', 'portador', 'titular', 'nome']) || '').trim();
  const vencimento = String(getVal(['vencimento', 'datavencimento', 'venc']) || '').trim();
  const fatura = String(getVal(['fatura', 'numerofatura', 'numfatura', 'lote']) || '').trim();
  const dataLiquidacao = String(getVal(['dataliquidacao', 'liquidacao']) || '').trim();
  const valorAntecipadoRaw = getVal(['valorantecipado', 'antecipado']);
  const valorLiquidoAntecipadoRaw = getVal(['valorliquidoantecipado', 'liquidoantecipado']);

  const valorBruto = parseCurrency(valorBrutoRaw);
  let mdrValor = parseCurrency(mdrValorRaw);
  let valorLiquido = parseCurrency(valorLiquidoRaw);
  let mdrPercent = parsePercent(mdrPercentRaw);

  // If liquid value or MDR is missing, deduce it
  if (valorLiquido === 0 && valorBruto > 0 && mdrValor > 0) {
    valorLiquido = Number((valorBruto - mdrValor).toFixed(2));
  } else if (mdrValor === 0 && valorBruto > 0 && valorLiquido > 0) {
    mdrValor = Number((valorBruto - valorLiquido).toFixed(2));
  }

  // Calculate percentage if 0 but values exist
  if (mdrPercent === 0 && valorBruto > 0 && mdrValor > 0) {
    mdrPercent = Number(((mdrValor / valorBruto) * 100).toFixed(3));
  }

  return {
    id: `tx-${index}-${autorizacao || Math.random().toString(36).substring(2, 7)}`,
    dataLancamento,
    autorizacao,
    valorBruto,
    descricao,
    plano: plano || 'Indefinido',
    dataInicioPeriodo,
    dataFimPeriodo,
    mdrValor,
    mdrPercent,
    valorLiquido,
    comprador,
    vencimento,
    fatura,
    dataLiquidacao: dataLiquidacao || undefined,
    valorAntecipado: valorAntecipadoRaw ? parseCurrency(valorAntecipadoRaw) : undefined,
    valorLiquidoAntecipado: valorLiquidoAntecipadoRaw ? parseCurrency(valorLiquidoAntecipadoRaw) : undefined,
  };
}

/**
 * Builds ReportData from normalized transactions, grouping them by plan order.
 */
export function buildReportFromTransactions(
  transactions: Transaction[],
  title: string = 'Relatório de Fechamento de Vendas',
  fileName: string = 'RelatorioVendas.xls'
): ReportData {
  // Preserve plan occurrence order as in file
  const planMap = new Map<string, Transaction[]>();
  const planOrder: string[] = [];

  for (const tx of transactions) {
    const p = tx.plano;
    if (!planMap.has(p)) {
      planMap.set(p, []);
      planOrder.push(p);
    }
    planMap.get(p)!.push(tx);
  }

  let grandTotalBruto = 0;
  let grandTotalMdr = 0;
  let grandTotalLiquido = 0;

  // Compute grand totals first to calculate percentage of each plan
  for (const tx of transactions) {
    grandTotalBruto += tx.valorBruto;
    grandTotalMdr += tx.mdrValor;
    grandTotalLiquido += tx.valorLiquido;
  }

  grandTotalBruto = Number(grandTotalBruto.toFixed(2));
  grandTotalMdr = Number(grandTotalMdr.toFixed(2));
  grandTotalLiquido = Number(grandTotalLiquido.toFixed(2));

  const plans: PlanSummary[] = [];

  for (const planCode of planOrder) {
    const txs = planMap.get(planCode)!;
    let planBruto = 0;
    let planMdr = 0;
    let planLiquido = 0;

    let inicioPeriodo = '';
    let fimPeriodo = '';
    let vencimento = '';
    let fatura = '';

    for (const t of txs) {
      planBruto += t.valorBruto;
      planMdr += t.mdrValor;
      planLiquido += t.valorLiquido;
      if (!inicioPeriodo && t.dataInicioPeriodo) inicioPeriodo = t.dataInicioPeriodo;
      if (!fimPeriodo && t.dataFimPeriodo) fimPeriodo = t.dataFimPeriodo;
      if (!vencimento && t.vencimento) vencimento = t.vencimento;
      if (!fatura && t.fatura) fatura = t.fatura;
    }

    planBruto = Number(planBruto.toFixed(2));
    planMdr = Number(planMdr.toFixed(2));
    planLiquido = Number(planLiquido.toFixed(2));

    const totalVendas = txs.length;
    const avgMdrPercent = planBruto > 0 ? Number(((planMdr / planBruto) * 100).toFixed(3)) : 0;
    const ticketMedio = totalVendas > 0 ? Number((planBruto / totalVendas).toFixed(2)) : 0;
    const percentualDoTotalBruto = grandTotalBruto > 0 ? Number(((planBruto / grandTotalBruto) * 100).toFixed(2)) : 0;

    plans.push({
      plano: planCode,
      dataInicioPeriodo: inicioPeriodo,
      dataFimPeriodo: fimPeriodo,
      vencimento,
      fatura,
      totalVendas,
      totalBruto: planBruto,
      totalMdr: planMdr,
      avgMdrPercent,
      totalLiquido: planLiquido,
      ticketMedio,
      percentualDoTotalBruto,
      transactions: txs,
    });
  }

  const grandAvgMdrPercent = grandTotalBruto > 0 ? Number(((grandTotalMdr / grandTotalBruto) * 100).toFixed(3)) : 0;
  const grandTicketMedio = transactions.length > 0 ? Number((grandTotalBruto / transactions.length).toFixed(2)) : 0;

  // Determine min & max dates
  const dates = transactions
    .map((t) => t.dataLancamento)
    .filter(Boolean);

  const minDate = dates[0]?.split(' ')[0] || '';
  const maxDate = dates[dates.length - 1]?.split(' ')[0] || '';

  return {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title,
    fileName,
    createdAt: new Date().toISOString(),
    plans,
    totalTransactions: transactions.length,
    grandTotalBruto,
    grandTotalMdr,
    grandTotalLiquido,
    grandAvgMdrPercent,
    grandTicketMedio,
    dateRange: {
      minDate,
      maxDate,
    },
    distinctPlansCount: plans.length,
  };
}

/**
 * Parses raw ArrayBuffer or binary string into ReportData using SheetJS.
 */
export function parseSpreadsheetBuffer(
  buffer: ArrayBuffer,
  fileName: string
): ReportData {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = wb.SheetNames[0];
  const worksheet = wb.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  const transactions = rawRows.map((row, idx) => normalizeRow(row, idx));

  // Determine suggested title from filename or date range
  let cleanTitle = fileName.replace(/\.[^/.]+$/, '');
  cleanTitle = cleanTitle.replace(/[_-]+/g, ' ').trim();
  if (!cleanTitle || cleanTitle.toLowerCase() === 'relatoriovendas') {
    cleanTitle = 'Fechamento de Vendas Agille';
  }

  return buildReportFromTransactions(transactions, cleanTitle, fileName);
}

/**
 * Currency formatter (BRL)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Percentage formatter
 */
export function formatPercent(pct: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct) + '%';
}

/**
 * Formats a number with thousands separator
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('pt-BR').format(num);
}
