import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { parseSpreadsheetBuffer } from '../utils/parser';
import { ReportData } from '../types';
import { getInitialReport } from '../utils/storage';
import { formatCurrency, formatNumber } from '../utils/parser';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportLoaded: (report: ReportData) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onReportLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setPreviewReport(null);

    try {
      const buffer = await file.arrayBuffer();
      const report = parseSpreadsheetBuffer(buffer, file.name);

      if (report.totalTransactions === 0) {
        setErrorMsg('Nenhuma transação foi detectada na planilha. Verifique se o arquivo contém as colunas necessárias.');
        setIsProcessing(false);
        return;
      }

      setCustomTitle(report.title);
      setPreviewReport(report);
    } catch (err: unknown) {
      console.error('File parsing error', err);
      setErrorMsg(
        'Erro ao ler a planilha. Certifique-se de que é um arquivo válido da Agille (.xls, .xlsx, .csv ou .txt exportado).'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!previewReport) return;
    const finalReport: ReportData = {
      ...previewReport,
      title: customTitle.trim() || previewReport.title,
    };
    onReportLoaded(finalReport);
    onClose();
  };

  const handleLoadSample = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const initial = getInitialReport();
      onReportLoaded(initial);
      setIsProcessing(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold leading-tight">Enviar Nova Planilha Agille</h2>
              <p className="text-2xs text-slate-300">
                Suporta arquivos .xls, .xlsx, .csv e arquivos renomeados como .txt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv,.tsv,.txt"
              className="hidden"
              onChange={onFileChange}
            />

            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800 mb-1">
              Arraste a planilha aqui ou clique para selecionar
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Formatos aceitos: <strong>.xls</strong> (Excel Agille), <strong>.xlsx</strong>, <strong>.csv</strong> ou <strong>.txt</strong>
            </p>
          </div>

          {/* Quick sample restoration button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-slate-700">
                Deseja recarregar a planilha anexada de vendas?
              </span>
            </div>
            <button
              onClick={handleLoadSample}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              Carregar Amostra
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro no arquivo</p>
                <p className="text-2xs text-red-600 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {previewReport && (
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Planilha processada com sucesso!</span>
                </div>
                <span className="text-2xs font-mono text-emerald-700 font-semibold">
                  {previewReport.fileName}
                </span>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 uppercase mb-1">
                  Nome / Título deste Fechamento:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Fechamento Outubro 2026"
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-3xs text-slate-500 block">Vendas</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatNumber(previewReport.totalTransactions)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-3xs text-slate-500 block">Planos</span>
                  <span className="text-xs font-bold text-slate-900">
                    {previewReport.distinctPlansCount}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-emerald-100">
                  <span className="text-3xs text-slate-500 block">Total Líquido</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {formatCurrency(previewReport.grandTotalLiquido)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {previewReport && (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Aplicar Fechamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
