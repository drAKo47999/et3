import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { THEME_PRESETS } from '../utils/materialColors';
import { ThemeStyle } from '../types';
import {
  Settings,
  DollarSign,
  Palette,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenGoogleDriveModal: () => void;
  onOpenExportImportModal: () => void;
  onOpenCategoryTab: () => void;
  onOpenWidgetTab: () => void;
}

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc (CHF)' },
  { symbol: 'R$', code: 'BRL', name: 'Brazilian Real (R$)' },
  { symbol: 'kr', code: 'SEK', name: 'Swedish Krona (kr)' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenGoogleDriveModal,
  onOpenExportImportModal,
  onOpenCategoryTab,
  onOpenWidgetTab,
}) => {
  const { currency, setCurrency, expenses, categories, resetToDefaults } = useExpense();
  const { themeConfig, colors, setThemeStyle, setSeedColor, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-2xl"
            style={{
              backgroundColor: colors.primaryContainer,
              color: colors.onPrimaryContainer,
            }}
          >
            <Settings size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: colors.onSurface }}>
              Settings & Preferences
            </h2>
            <p className="text-xs opacity-65">
              Customize currency, Material You color themes, cloud sync, and backup options
            </p>
          </div>
        </div>
      </div>

      {/* Currency & Financial Preferences */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all space-y-4"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <DollarSign size={18} style={{ color: colors.primary }} />
          <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>
            Currency Symbol
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CURRENCIES.map((curr) => {
            const isSelected = currency === curr.symbol;
            return (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.symbol)}
                className="p-3 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                  borderColor: isSelected ? colors.primary : `${colors.outline}20`,
                  color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <div>
                  <div className="text-sm font-black">{curr.symbol}</div>
                  <div className="text-[10px] opacity-70">{curr.code}</div>
                </div>
                {isSelected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material You Dynamic Appearance */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all space-y-4"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: colors.primary }} />
            <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>
              Material You Appearance
            </h3>
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            style={{
              borderColor: `${colors.outline}30`,
              color: colors.onSurface,
            }}
          >
            {themeConfig.isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span>{themeConfig.isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        <p className="text-xs opacity-65">
          Select an Android 14/15 tonal palette.
        </p>

        {/* Preset Palettes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(THEME_PRESETS) as ThemeStyle[])
            .filter((k) => k !== 'custom')
            .map((k) => {
              const preset = THEME_PRESETS[k];
              const isSelected = themeConfig.style === k;
              return (
                <button
                  key={k}
                  onClick={() => setThemeStyle(k)}
                  className="p-3 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                    borderColor: isSelected ? colors.primary : `${colors.outline}20`,
                    color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: preset.seed }}
                    />
                    <span className="text-xs font-semibold truncate">{preset.name}</span>
                  </div>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
        </div>

        {/* Custom Hex Seed */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-xs opacity-70">Custom Seed Hex:</span>
          <input
            type="color"
            value={themeConfig.seedColor}
            onChange={(e) => setSeedColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
          />
          <span className="text-xs font-mono font-bold">{themeConfig.seedColor.toUpperCase()}</span>
        </div>
      </div>

      {/* Cloud & Data Synchronization */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all space-y-4"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex items-center gap-2">
          <Cloud size={18} style={{ color: colors.primary }} />
          <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>
            Cloud Sync & Data Migration
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Google Drive */}
          <div
            className="p-4 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}20`,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold" style={{ color: colors.onSurface }}>
                  Google Drive Cloud Sync
                </span>
                {user ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600">
                    Not Signed In
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-60">
                Sync expenses between your phone and laptop using your Google account.
              </p>
            </div>

            <button
              onClick={onOpenGoogleDriveModal}
              className="mt-3 py-2 px-3.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              <Cloud size={14} />
              <span>Manage Google Drive</span>
            </button>
          </div>

          {/* Local File Export / Import */}
          <div
            className="p-4 rounded-2xl border flex flex-col justify-between"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}20`,
            }}
          >
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: colors.onSurface }}>
                Local Export / Import
              </div>
              <p className="text-[11px] opacity-60">
                Backup to a <code className="font-mono">.json</code> or CSV file to transfer directly to another phone.
              </p>
            </div>

            <button
              onClick={onOpenExportImportModal}
              className="mt-3 py-2 px-3.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                borderColor: `${colors.outline}40`,
                color: colors.onSurface,
              }}
            >
              <Download size={14} />
              <span>Export or Restore JSON / CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Defaults */}
      <div
        className="rounded-[28px] p-6 border space-y-3"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-red-500">Reset Tracker</div>
            <div className="text-xs opacity-60">
              Delete all expenses and categories and start from a blank slate.
            </div>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to delete all expenses and categories?'
                )
              ) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
};
