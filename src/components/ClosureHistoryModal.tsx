import React, { useState } from 'react';
import { ClosureRecord } from '../types';
import { History, X, Check, Trash2, Edit2, FileSpreadsheet, Plus, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/parser';

interface ClosureHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  closures: ClosureRecord[];
  activeClosureId: string;
  onSelectClosure: (closure: ClosureRecord) => void;
  onDeleteClosure: (id: string) => void;
  onRenameClosure: (id: string, newTitle: string) => void;
  onNewClosure: () => void;
}

export const ClosureHistoryModal: React.FC<ClosureHistoryModalProps> = ({
  isOpen,
  onClose,
  closures,
  activeClosureId,
  onSelectClosure,
  onDeleteClosure,
  onRenameClosure,
  onNewClosure,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const startEdit = (c: ClosureRecord) => {
    setEditingId(c.id);
    setEditingTitle(c.title);
  };

  const saveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onRenameClosure(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold leading-tight">Fechamentos Mensais Salvos</h2>
              <p className="text-2xs text-slate-300">
                Histórico de fechamentos para consulta rápida, reimpressão e auditoria
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

        {/* List of Closures */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {closures.length} {closures.length === 1 ? 'Fechamento Armazenado' : 'Fechamentos Armazenados'}
            </span>
            <button
              onClick={() => {
                onClose();
                onNewClosure();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Fechamento
            </button>
          </div>

          {closures.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhum fechamento registrado ainda. Envie uma planilha para começar.
            </div>
          ) : (
            closures.map((c) => {
              const isActive = c.id === activeClosureId;
              const isEditing = editingId === c.id;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-[200px]">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="text-xs px-2.5 py-1 rounded border border-emerald-500 bg-white font-semibold text-slate-900 w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(c.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {c.title}
                          </span>
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                            title="Renomear fechamento"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {c.periodLabel || 'Período não informado'}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">
                          Arquivo: {c.fileName}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-2xs font-bold">
                          <Check className="w-3 h-3" />
                          Visualizando
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectClosure(c);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                        >
                          Abrir Fechamento
                        </button>
                      )}

                      {closures.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir "${c.title}"?`)) {
                              onDeleteClosure(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir fechamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Bar inside card */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-2xs font-mono">
                    <div>
                      <span className="text-slate-400 block">Vendas / Planos:</span>
                      <span className="font-semibold text-slate-700">
                        {formatNumber(c.totalVendas)} vendas ({c.plansCount} planos)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Bruto:</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(c.totalBruto)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Total Líquido:</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(c.totalLiquido)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
