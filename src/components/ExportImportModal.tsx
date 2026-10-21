import React, { useRef, useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BackupData } from '../types';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const { exportData, importData, expenses, categories, currency } = useExpense();
  const { colors } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stagedBackup, setStagedBackup] = useState<BackupData | null>(null);

  if (!isOpen) return null;

  // Export JSON file
  const handleExportJSON = () => {
    const backup = exportData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `monet_expense_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export CSV file
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Title', 'Amount', 'Currency', 'Category', 'PaymentMethod', 'Notes'];
    const rows = expenses.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      return [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.time || ''}"`,
        `"${(e.title || '').replace(/"/g, '""')}"`,
        e.amount.toFixed(2),
        `"${currency}"`,
        `"${cat?.name || 'Uncategorized'}"`,
        `"${e.paymentMethod || 'card'}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `monet_expenses_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file select for JSON import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !Array.isArray(parsed.expenses)) {
          throw new Error('File does not appear to be a valid Monet Expense Tracker backup.');
        }
        setStagedBackup(parsed);
        setImportStatus(null);
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          text: err?.message || 'Failed to read file. Please provide a valid JSON backup.',
        });
        setStagedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const applyImport = (mode: 'merge' | 'replace') => {
    if (!stagedBackup) return;

    try {
      importData(stagedBackup, mode);
      setImportStatus({
        type: 'success',
        text: `Successfully ${
          mode === 'replace' ? 'restored' : 'merged'
        } ${stagedBackup.expenses.length} expenses into your tracker!`,
      });
      setStagedBackup(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        text: err?.message || 'Failed to import backup.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="w-full max-w-lg rounded-[32px] p-6 sm:p-7 border shadow-2xl relative animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}30`,
          color: colors.onSurface,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Local Backup & Migration</h3>
              <p className="text-xs opacity-65">Export and import data locally for other phones or devices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Export */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">
            1. Export Local Data
          </div>
          <p className="text-xs opacity-65">
            Download your data to migrate to another device, phone, or backup storage.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJSON}
              className="p-4 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}25`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <FileJson size={22} style={{ color: colors.primary }} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: colors.primaryContainer,
                    color: colors.onPrimaryContainer,
                  }}
                >
                  Full Backup
                </span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: colors.onSurface }}>
                  Export JSON
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  Compatible with all Monet instances
                </div>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-4 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.outline}25`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet size={22} style={{ color: colors.secondary }} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: colors.secondaryContainer,
                    color: colors.onSecondaryContainer,
                  }}
                >
                  Spreadsheet
                </span>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: colors.onSurface }}>
                  Export CSV
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  Open in Excel or Google Sheets
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Import */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: `${colors.outline}20` }}>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">
            2. Restore / Import Backup File
          </div>
          <p className="text-xs opacity-65">
            Select a <code className="text-xs font-mono font-bold">.json</code> backup from your phone or computer.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!stagedBackup ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              <Upload size={22} />
              <span className="text-xs font-bold">Choose JSON Backup File</span>
              <span className="text-[10px] opacity-60">Tap to browse files</span>
            </button>
          ) : (
            <div
              className="p-4 rounded-2xl border space-y-3 animate-fade-in"
              style={{
                backgroundColor: colors.surface,
                borderColor: `${colors.primary}50`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson size={20} style={{ color: colors.primary }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: colors.onSurface }}>
                      Backup File Loaded
                    </div>
                    <div className="text-[11px] opacity-60">
                      Contains {stagedBackup.expenses.length} expenses &{' '}
                      {stagedBackup.categories?.length || 0} categories
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStagedBackup(null)}
                  className="text-xs opacity-60 hover:opacity-100 hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => applyImport('merge')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border transition-transform active:scale-95"
                  style={{
                    backgroundColor: colors.surfaceContainer,
                    borderColor: `${colors.outline}30`,
                    color: colors.onSurface,
                  }}
                >
                  Merge with Current
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        `Replace all current data with ${stagedBackup.expenses.length} expenses from this backup?`
                      )
                    ) {
                      applyImport('replace');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold shadow transition-transform active:scale-95"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                  }}
                >
                  Replace All Data
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-500/15 text-red-700 dark:text-red-300'
              }`}
            >
              {importStatus.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{importStatus.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
