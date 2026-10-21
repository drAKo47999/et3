import type React from 'react';
import { useEffect } from 'react';
import { useExpense, formatDate } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { isNative, setBarStyle, updateHomeWidget } from '../native';

const fmt = (currency: string, n: number) =>
  `${currency}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

/** Android-only: keeps the home-screen widget and system bar icons in sync with the app. */
export const NativeSync: React.FC = () => {
  const { dailyTotal, monthlyTotal, currency } = useExpense();
  const { colors, themeConfig } = useTheme();

  useEffect(() => {
    if (isNative) setBarStyle(themeConfig.isDark);
  }, [themeConfig.isDark]);

  useEffect(() => {
    if (!isNative) return;
    updateHomeWidget({
      date: formatDate(new Date()),
      todayText: fmt(currency, dailyTotal),
      zeroText: fmt(currency, 0),
      monthText: fmt(currency, monthlyTotal),
      surface: colors.surfaceContainer,
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      onSurface: colors.onSurface,
      onSurfaceVariant: colors.onSurfaceVariant,
    });
  }, [dailyTotal, monthlyTotal, currency, colors]);

  return null;
};
