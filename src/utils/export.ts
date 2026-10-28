import * as XLSX from 'xlsx';
import { ReportData } from '../types';
import { formatCurrency, formatPercent } from './parser';

export function exportReportToExcel(report: ReportData): void {
  const wb = XLSX.utils.book_new();

  // 1. Resumo Consolidado por Planos
  const summaryRows = [
    ['RELATÓRIO CONSOLIDADO DE VENDAS POR PLANOS - AGILLE'],
    ['Título:', report.title],
    ['Período:', `${report.dateRange.minDate} até ${report.dateRange.maxDate}`],
    ['Data de Emissão:', new Date().toLocaleString('pt-BR')],
    [],
    [
      'Plano',
      'Início Período',
      'Fim Período',
      'Vencimento',
      'Fatura',
      'Qtd Vendas',
      'Total Bruto (R$)',
      'Total MDR (R$)',
      'Taxa Média MDR (%)',
      'Total Líquido (R$)',
      'Ticket Médio (R$)',
      '% do Total Bruto',
    ],
  ];

  for (const p of report.plans) {
    summaryRows.push([
      p.plano,
      p.dataInicioPeriodo || '-',
      p.dataFimPeriodo || '-',
      p.vencimento || '-',
      p.fatura || '-',
      p.totalVendas as unknown as string,
      p.totalBruto as unknown as string,
      p.totalMdr as unknown as string,
      p.avgMdrPercent as unknown as string,
      p.totalLiquido as unknown as string,
      p.ticketMedio as unknown as string,
      p.percentualDoTotalBruto as unknown as string,
    ]);
  }

  // Summary total row
  summaryRows.push([]);
  summaryRows.push([
    'SOMA TOTAL GERAL',
    '-',
    '-',
    '-',
    '-',
    report.totalTransactions as unknown as string,
    report.grandTotalBruto as unknown as string,
    report.grandTotalMdr as unknown as string,
    report.grandAvgMdrPercent as unknown as string,
    report.grandTotalLiquido as unknown as string,
    report.grandTicketMedio as unknown as string,
    '100.00%',
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo por Planos');

  // 2. Relatório Completo com Subtotais por Plano
  const fullRows = [
    ['RELATÓRIO DETALHADO DE TRANSAÇÕES SEPARADAS POR PLANO - AGILLE'],
    ['Título:', report.title],
    ['Arquivo Original:', report.fileName],
    ['Data:', new Date().toLocaleString('pt-BR')],
    [],
    [
      'Plano',
      'Data Lançamento',
      'Autorização',
      'Descrição',
      'Comprador',
      'Vencimento',
      'Fatura',
      'Valor Transação (R$)',
      'MDR (R$)',
      'MDR (%)',
      'Valor Líquido (R$)',
    ],
  ];

  for (const p of report.plans) {
    // Plan title indicator
    fullRows.push([
      `=== INÍCIO DO PLANO: ${p.plano} (Fatura: ${p.fatura || 'N/A'} | Vencimento: ${p.vencimento || 'N/A'}) ===`,
    ]);

    for (const t of p.transactions) {
      fullRows.push([
        t.plano,
        t.dataLancamento,
        t.autorizacao,
        t.descricao,
        t.comprador,
        t.vencimento,
        t.fatura,
        t.valorBruto as unknown as string,
        t.mdrValor as unknown as string,
        t.mdrPercent as unknown as string,
        t.valorLiquido as unknown as string,
      ]);
    }

    // Subtotal Row for this plan
    fullRows.push([
      `SUBTOTAL DO PLANO ${p.plano}`,
      `Total Vendas: ${p.totalVendas}`,
      '',
      '',
      '',
      '',
      '',
      p.totalBruto as unknown as string,
      p.totalMdr as unknown as string,
      p.avgMdrPercent as unknown as string,
      p.totalLiquido as unknown as string,
    ]);
    fullRows.push([]); // blank separator
  }

  // Grand Total row at the very end
  fullRows.push([
    '*** SOMA TOTAL DE TODOS OS PLANOS ***',
    `Total Geral: ${report.totalTransactions} vendas`,
    '',
    '',
    '',
    '',
    '',
    report.grandTotalBruto as unknown as string,
    report.grandTotalMdr as unknown as string,
    report.grandAvgMdrPercent as unknown as string,
    report.grandTotalLiquido as unknown as string,
  ]);

  const wsFull = XLSX.utils.aoa_to_sheet(fullRows);
  XLSX.utils.book_append_sheet(wb, wsFull, 'Transações com Subtotais');

  // Trigger download
  const safeTitle = report.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  XLSX.writeFile(wb, `${safeTitle || 'relatorio_agille'}.xlsx`);
}

export function exportReportToCSV(report: ReportData): void {
  const lines: string[] = [];
  lines.push('Plano;Data Lancamento;Autorizacao;Descricao;Comprador;Vencimento;Fatura;Valor Bruto;MDR Valor;MDR %;Valor Liquido');

  for (const p of report.plans) {
    for (const t of p.transactions) {
      lines.push(
        [
          t.plano,
          t.dataLancamento,
          t.autorizacao,
          `"${t.descricao.replace(/"/g, '""')}"`,
          `"${t.comprador.replace(/"/g, '""')}"`,
          t.vencimento,
          t.fatura,
          t.valorBruto.toFixed(2).replace('.', ','),
          t.mdrValor.toFixed(2).replace('.', ','),
          t.mdrPercent.toFixed(3).replace('.', ','),
          t.valorLiquido.toFixed(2).replace('.', ','),
        ].join(';')
      );
    }
    // Subtotal line
    lines.push(
      [
        `SUBTOTAL PLANO ${p.plano}`,
        `Qtd: ${p.totalVendas}`,
        '',
        '',
        '',
        '',
        '',
        p.totalBruto.toFixed(2).replace('.', ','),
        p.totalMdr.toFixed(2).replace('.', ','),
        p.avgMdrPercent.toFixed(3).replace('.', ','),
        p.totalLiquido.toFixed(2).replace('.', ','),
      ].join(';')
    );
  }

  // Total Geral
  lines.push(
    [
      'TOTAL GERAL TODOS OS PLANOS',
      `Qtd Total: ${report.totalTransactions}`,
      '',
      '',
      '',
      '',
      '',
      report.grandTotalBruto.toFixed(2).replace('.', ','),
      report.grandTotalMdr.toFixed(2).replace('.', ','),
      report.grandAvgMdrPercent.toFixed(3).replace('.', ','),
      report.grandTotalLiquido.toFixed(2).replace('.', ','),
    ].join(';')
  );

  const csvContent = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title.replace(/[^a-z0-9_-]/gi, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
