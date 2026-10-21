export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex color
  budget?: number; // Monthly budget
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  title: string;
  categoryId: string;
  date: string; // ISO string YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface DateRangeFilter {
  type: 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month' | 'last_month' | 'custom_single' | 'custom_range' | 'all';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

export type ThemeStyle = 'monet_dynamic' | 'sage' | 'ocean' | 'lavender' | 'sunset' | 'rose' | 'amber' | 'slate' | 'custom';

export interface ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  surfaceVariant: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  tertiary: string;
  tertiaryContainer: string;
}

export interface AppThemeConfig {
  style: ThemeStyle;
  seedColor: string;
  isDark: boolean;
  wallpaperUrl?: string;
  wallpaperName?: string;
}

export interface DriveSyncMetadata {
  lastSyncedAt: number | null;
  fileId: string | null;
  fileName: string;
  status: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

export interface BackupData {
  version: number;
  timestamp: string;
  appName: string;
  expenses: Expense[];
  categories: Category[];
  settings: {
    currency: string;
    themeConfig: AppThemeConfig;
  };
}
