import React from 'react';
import { LauncherWidget } from './LauncherWidget';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpRight, Palette, Sun, Moon } from 'lucide-react';

export const StandaloneWidget: React.FC<{ onOpenFullApp: () => void }> = ({ onOpenFullApp }) => {
  const { colors, themeConfig, toggleDarkMode, setThemeStyle } = useTheme();

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative overflow-hidden select-none"
      style={{
        backgroundImage: themeConfig.wallpaperUrl ? `url(${themeConfig.wallpaperUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: colors.surface,
      }}
    >
      {/* Background Dimmer */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: themeConfig.isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.18)',
        }}
      />

      {/* Mini Controls Top Bar */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
            style={{ backgroundColor: colors.primary }}
          >
            M
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">Monet Widget</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/50 transition-colors"
            title="Toggle theme"
          >
            {themeConfig.isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button
            onClick={onOpenFullApp}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 text-xs font-medium transition-all shadow"
            title="Open Full Expense Tracker App"
          >
            <span>Full App</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Widget */}
      <div className="relative z-10 w-full max-w-md">
        <LauncherWidget onOpenFullApp={onOpenFullApp} showWallpaperBackdrop={false} />
      </div>

      {/* Bottom hint */}
      <div className="relative z-10 mt-3 text-center">
        <span className="text-[10px] text-white/70 drop-shadow">
          Tap + to log expense directly • Real-time Material You sync
        </span>
      </div>
    </div>
  );
};
