import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppThemeConfig, ColorScheme, ThemeStyle } from '../types';
import { generateM3Scheme, THEME_PRESETS, extractSeedColorFromImage } from '../utils/materialColors';

interface ThemeContextType {
  themeConfig: AppThemeConfig;
  colors: ColorScheme;
  setThemeStyle: (style: ThemeStyle) => void;
  setSeedColor: (hex: string) => void;
  toggleDarkMode: () => void;
  setCustomWallpaper: (url: string, name?: string) => Promise<void>;
  resetTheme: () => void;
}

const STORAGE_KEY = 'monet_expense_theme_v1';

const defaultTheme: AppThemeConfig = {
  style: 'monet_dynamic',
  seedColor: THEME_PRESETS.monet_dynamic.seed,
  isDark: false,
  wallpaperUrl: THEME_PRESETS.monet_dynamic.wallpaper,
  wallpaperName: 'Pixel Sage Botanic',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<AppThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved theme', e);
    }
    // Check system prefers-color-scheme
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return { ...defaultTheme, isDark: prefersDark };
  });

  const colors = generateM3Scheme(themeConfig.seedColor, themeConfig.isDark);

  // Apply CSS custom properties and dark mode class to root document
  useEffect(() => {
    const root = document.documentElement;
    if (themeConfig.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS custom properties
    root.style.setProperty('--md-sys-color-primary', colors.primary);
    root.style.setProperty('--md-sys-color-on-primary', colors.onPrimary);
    root.style.setProperty('--md-sys-color-primary-container', colors.primaryContainer);
    root.style.setProperty('--md-sys-color-on-primary-container', colors.onPrimaryContainer);
    root.style.setProperty('--md-sys-color-secondary', colors.secondary);
    root.style.setProperty('--md-sys-color-secondary-container', colors.secondaryContainer);
    root.style.setProperty('--md-sys-color-on-secondary-container', colors.onSecondaryContainer);
    root.style.setProperty('--md-sys-color-surface', colors.surface);
    root.style.setProperty('--md-sys-color-surface-variant', colors.surfaceVariant);
    root.style.setProperty('--md-sys-color-surface-container', colors.surfaceContainer);
    root.style.setProperty('--md-sys-color-surface-container-high', colors.surfaceContainerHigh);
    root.style.setProperty('--md-sys-color-on-surface', colors.onSurface);
    root.style.setProperty('--md-sys-color-on-surface-variant', colors.onSurfaceVariant);
    root.style.setProperty('--md-sys-color-outline', colors.outline);
    root.style.setProperty('--md-sys-color-outline-variant', colors.outlineVariant);
    root.style.setProperty('--md-sys-color-tertiary', colors.tertiary);
    root.style.setProperty('--md-sys-color-tertiary-container', colors.tertiaryContainer);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeConfig));
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [themeConfig, colors]);

  const setThemeStyle = async (style: ThemeStyle) => {
    if (style === 'custom') {
      setThemeConfig((prev) => ({ ...prev, style: 'custom' }));
      return;
    }

    const preset = THEME_PRESETS[style];
    if (preset) {
      let seed = preset.seed;
      if (preset.wallpaper) {
        try {
          const extracted = await extractSeedColorFromImage(preset.wallpaper);
          if (extracted) seed = extracted;
        } catch {
          seed = preset.seed;
        }
      }
      setThemeConfig((prev) => ({
        ...prev,
        style,
        seedColor: seed,
        wallpaperUrl: preset.wallpaper,
        wallpaperName: preset.name,
      }));
    }
  };

  const setSeedColor = (hex: string) => {
    setThemeConfig((prev) => ({
      ...prev,
      style: 'custom',
      seedColor: hex,
    }));
  };

  const toggleDarkMode = () => {
    setThemeConfig((prev) => ({
      ...prev,
      isDark: !prev.isDark,
    }));
  };

  const setCustomWallpaper = async (url: string, name = 'Custom Wallpaper') => {
    try {
      const extractedSeed = await extractSeedColorFromImage(url);
      setThemeConfig((prev) => ({
        ...prev,
        style: 'custom',
        seedColor: extractedSeed,
        wallpaperUrl: url,
        wallpaperName: name,
      }));
    } catch {
      setThemeConfig((prev) => ({
        ...prev,
        style: 'custom',
        wallpaperUrl: url,
        wallpaperName: name,
      }));
    }
  };

  const resetTheme = () => {
    setThemeConfig(defaultTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeConfig,
        colors,
        setThemeStyle,
        setSeedColor,
        toggleDarkMode,
        setCustomWallpaper,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
