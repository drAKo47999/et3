import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { LauncherWidget } from './LauncherWidget';
import { THEME_PRESETS } from '../utils/materialColors';
import { ThemeStyle } from '../types';
import { isNative, pinHomeWidget } from '../native';
import {
  Smartphone,
  Palette,
  ExternalLink,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';

export const WidgetView: React.FC<{ onOpenFullApp?: () => void }> = ({ onOpenFullApp }) => {
  const { themeConfig, colors, setThemeStyle, setSeedColor, toggleDarkMode } =
    useTheme();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [pinMsg, setPinMsg] = useState('');

  const addToHomeScreen = async () => {
    const ok = await pinHomeWidget();
    setPinMsg(
      ok
        ? 'Confirm the prompt to place the widget.'
        : 'Long-press your home screen > Widgets > Monet Expense.'
    );
    setTimeout(() => setPinMsg(''), 5000);
  };

  const openPopoutWidget = () => {
    const url = `${window.location.origin}${window.location.pathname}?widget=true`;
    window.open(
      url,
      'MonetWidget',
      'width=420,height=360,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
  };

  const copyWidgetUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?widget=true`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Intro Header */}
      <div
        className="rounded-[28px] p-6 border shadow-sm transition-all"
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: `${colors.outline}20`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{
                backgroundColor: colors.primaryContainer,
                color: colors.onPrimaryContainer,
              }}
            >
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: colors.onSurface }}>
                Launcher Widget & Material You Accents
              </h2>
              <p className="text-xs opacity-65">
                Dynamic home screen widget that reacts to your wallpaper with quick categorized input
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isNative && (
              <button
                onClick={addToHomeScreen}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
              >
                <Smartphone size={14} />
                <span>{pinMsg || 'Add to Home Screen'}</span>
              </button>
            )}
            {!isNative && (<>
            <button
              onClick={openPopoutWidget}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              <ExternalLink size={14} />
              <span>Launch Popout Widget</span>
            </button>
            <button
              onClick={copyWidgetUrl}
              className="px-3.5 py-2 rounded-full text-xs font-medium border hover:opacity-90 transition-all"
              style={{
                borderColor: `${colors.outline}40`,
                color: colors.onSurface,
                backgroundColor: colors.surface,
              }}
              title="Copy URL for PWA Widget launcher"
            >
              {copiedUrl ? 'Copied URL!' : 'Copy Widget Link'}
            </button>
            </>)}
          </div>
        </div>
      </div>

      {/* Android Launcher Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Phone Launcher Screen (Left/Top) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className="w-full max-w-[360px] sm:max-w-[380px] h-[640px] rounded-[44px] p-4 relative overflow-hidden shadow-2xl border-4 flex flex-col justify-between select-none"
            style={{
              borderColor: themeConfig.isDark ? '#27272a' : '#e4e4e7',
              backgroundImage: themeConfig.wallpaperUrl
                ? `url(${themeConfig.wallpaperUrl})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: colors.surface,
            }}
          >
            {/* Dark/Light overlay for wallpaper contrast */}
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-500"
              style={{
                backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.12)',
              }}
            />

            {/* Android Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-white text-xs font-semibold px-3 pt-1 opacity-90 drop-shadow">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black/60 rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>94%</span>
              </div>
            </div>

            {/* Launcher Clock & Weather */}
            <div className="relative z-10 text-center my-auto py-2 text-white drop-shadow-md">
              <div className="text-5xl font-light tracking-tight font-sans">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs font-medium opacity-85 mt-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} • 72°F Sunny
              </div>
            </div>

            {/* The Live Interactive Launcher Widget */}
            <div className="relative z-20 my-auto">
              <LauncherWidget onOpenFullApp={onOpenFullApp} />
            </div>

            {/* Home Screen App Dock */}
            <div className="relative z-10 pb-2">
              <div className="flex items-center justify-around px-2 py-3 rounded-[26px] bg-white/20 backdrop-blur-md border border-white/20">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  Phone
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  Messages
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shadow border border-white/40"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                  }}
                  title="Monet Expense Tracker"
                >
                  Monet
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  Camera
                </div>
              </div>
              {/* Home navigation pill */}
              <div className="w-32 h-1 bg-white/80 rounded-full mx-auto mt-3 shadow" />
            </div>
          </div>
        </div>

        {/* Dynamic Theme & Wallpaper Settings (Right/Bottom) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Wallpaper Presets (Material You dynamic extraction) */}
          <div
            className="rounded-[28px] p-5 border shadow-sm"
            style={{
              backgroundColor: colors.surfaceContainer,
              borderColor: `${colors.outline}20`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: colors.primary }} />
                <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>
                  Material You Wallpapers
                </h3>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{
                  borderColor: `${colors.outline}30`,
                  color: colors.onSurface,
                }}
                title="Toggle Dark / Light Mode"
              >
                {themeConfig.isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
            <p className="text-xs opacity-65 mb-3">
              Selecting a wallpaper automatically extracts dominant tones and generates matching Material You color schemes.
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEME_PRESETS) as ThemeStyle[])
                .filter((key) => key !== 'custom')
                .map((key) => {
                  const preset = THEME_PRESETS[key];
                  const isSelected = themeConfig.style === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setThemeStyle(key)}
                      className="group relative rounded-2xl overflow-hidden border p-2 text-left transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: isSelected ? colors.primary : `${colors.outline}25`,
                        borderWidth: isSelected ? '2px' : '1px',
                        backgroundColor: colors.surface,
                      }}
                    >
                      {preset.wallpaper && (
                        <div
                          className="w-full h-14 rounded-xl mb-1.5 bg-cover bg-center"
                          style={{ backgroundImage: `url(${preset.wallpaper})` }}
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold truncate" style={{ color: colors.onSurface }}>
                          {preset.name}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: preset.seed }}
                        />
                      </div>
                    </button>
                  );
                })}
            </div>

          </div>

          {/* Manual Color Theme Options */}
          <div
            className="rounded-[28px] p-5 border shadow-sm"
            style={{
              backgroundColor: colors.surfaceContainer,
              borderColor: `${colors.outline}20`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Palette size={16} style={{ color: colors.primary }} />
              <h3 className="text-sm font-bold" style={{ color: colors.onSurface }}>
                Manual Color Settings
              </h3>
            </div>
            <p className="text-xs opacity-65 mb-3">
              Prefer manual colors? Pick any custom seed hex color to derive custom tonal palettes.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeConfig.seedColor}
                onChange={(e) => setSeedColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
              />
              <input
                type="text"
                value={themeConfig.seedColor.toUpperCase()}
                onChange={(e) => setSeedColor(e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs font-mono uppercase tracking-wider outline-none w-28"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: `${colors.outline}30`,
                  color: colors.onSurface,
                }}
              />
              <div className="flex items-center gap-1.5 flex-1">
                <span
                  className="w-6 h-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                  title="Primary"
                />
                <span
                  className="w-6 h-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: colors.secondary }}
                  title="Secondary"
                />
                <span
                  className="w-6 h-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: colors.primaryContainer }}
                  title="Container"
                />
                <span
                  className="w-6 h-6 rounded-lg shadow-sm"
                  style={{ backgroundColor: colors.surfaceContainer }}
                  title="Surface"
                />
              </div>
            </div>
          </div>

          {/* How to add to home screen instructions */}
          <div
            className="rounded-[28px] p-5 border text-xs space-y-2 opacity-85"
            style={{
              backgroundColor: colors.surfaceContainerHigh,
              borderColor: `${colors.outline}20`,
            }}
          >
            <div className="font-bold flex items-center gap-1.5" style={{ color: colors.onSurface }}>
              <Info size={14} style={{ color: colors.primary }} />
              <span>How to use the Widget on Mobile or Desktop:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 opacity-75 leading-relaxed">
              <li>
                <strong>Popout Window:</strong> Tap "Launch Popout Widget" above to open a compact floating mini-window on your desktop or tablet.
              </li>
              <li>
                <strong>Android / iOS Home Screen:</strong> In Chrome or Safari, tap menu (⋮ / Share) &gt; <em>"Add to Home Screen"</em>. The shortcut opens directly with widget view support.
              </li>
              <li>
                <strong>Fast Input:</strong> Tap the <strong>+ Add</strong> button on the widget to record expenses instantly without opening the full tracker.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
