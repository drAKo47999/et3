import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Cloud,
  Smartphone,
  Plus,
  Sun,
  Moon,
  CheckCircle,
  Database,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenGoogleDriveModal: () => void;
  onOpenWidgetTab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenGoogleDriveModal,
  onOpenWidgetTab,
}) => {
  const { colors, themeConfig, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors select-none"
      style={{
        backgroundColor: `${colors.surface}cc`,
        borderColor: `${colors.outline}20`,
        paddingTop: 'var(--safe-top)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            M
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight" style={{ color: colors.onSurface }}>
              Monet Expense
            </h1>
            <div className="text-[10px] font-medium opacity-60 flex items-center gap-1">
              <span>Material You Tracker</span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.primary }} />
              <span className="capitalize">{themeConfig.style.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Google Drive Status Pill */}
          <button
            onClick={onOpenGoogleDriveModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: user ? colors.primaryContainer : colors.surface,
              borderColor: user ? colors.primary : `${colors.outline}30`,
              color: user ? colors.onPrimaryContainer : colors.onSurface,
            }}
            title="Google Drive Cloud Sync"
          >
            <Cloud size={14} className={user ? 'text-emerald-500' : ''} />
            <span className="hidden sm:inline">
              {user ? (user.displayName ? user.displayName.split(' ')[0] : 'Drive Synced') : 'Drive Sync'}
            </span>
            {user && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          {/* Widget Quick Launch */}
          <button
            onClick={onOpenWidgetTab}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold hover:opacity-90 transition-all"
            style={{
              backgroundColor: colors.surface,
              borderColor: `${colors.outline}30`,
              color: colors.onSurface,
            }}
            title="View Launcher Widget"
          >
            <Smartphone size={14} />
            <span>Widget</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color: colors.onSurface }}
            title="Toggle Light/Dark Theme"
          >
            {themeConfig.isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Add Expense Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-transform active:scale-95"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
