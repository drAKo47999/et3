import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryIcon } from '../utils/categoryIcons';
import { Plus, Check, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { PaymentMethod } from '../types';

interface LauncherWidgetProps {
  size?: 'standard' | 'compact' | 'expanded';
  onOpenFullApp?: () => void;
  showWallpaperBackdrop?: boolean;
}

export const LauncherWidget: React.FC<LauncherWidgetProps> = ({
  size = 'standard',
  onOpenFullApp,
  showWallpaperBackdrop = false,
}) => {
  const { dailyTotal, weeklyTotal, monthlyTotal, currency, categories, addExpense } = useExpense();
  const { colors, themeConfig } = useTheme();

  // Quick Add Bottom Sheet / Overlay within Widget
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleQuickAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const cat = categories.find((c) => c.id === selectedCategoryId) || categories[0];
    if (!cat) return;
    const finalTitle = title.trim() || cat?.name || 'Quick Expense';

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    addExpense({
      amount: parsedAmount,
      title: finalTitle,
      categoryId: cat.id,
      date: dateStr,
      time: timeStr,
      paymentMethod,
    });

    // Reset & provide feedback
    setAmount('');
    setTitle('');
    setIsQuickAddOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2400);
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Widget Container - Material You M3 Squircle */}
      <div
        className="relative overflow-hidden rounded-[28px] p-5 shadow-xl transition-all duration-300 border border-white/20 backdrop-blur-xl"
        style={{
          backgroundColor: `${colors.surfaceContainer}ee`,
          color: colors.onSurface,
          boxShadow: `0 12px 32px -4px ${colors.primary}20, 0 4px 12px -2px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Dynamic Material You Accent Glow */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-35 blur-2xl pointer-events-none"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full opacity-20 blur-xl pointer-events-none"
          style={{ backgroundColor: colors.tertiary }}
        />

        {/* Header Row */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              M
            </div>
            <div>
              <div className="text-xs font-semibold tracking-wide flex items-center gap-1.5 opacity-90">
                <span>EXPENSE WIDGET</span>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: colors.primary }}
                />
              </div>
              <div className="text-[10px] opacity-60">Material You Glance</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenFullApp && (
              <button
                onClick={onOpenFullApp}
                title="Open full app"
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                style={{ color: colors.onSurfaceVariant }}
              >
                <ArrowUpRight size={16} />
              </button>
            )}
            {/* Quick Add Button */}
            <button
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-transform active:scale-95 shadow-sm"
              style={{
                backgroundColor: colors.primary,
                color: colors.onPrimary,
              }}
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Daily, Weekly, Monthly Summary Pills */}
        <div className="grid grid-cols-3 gap-2 relative">
          {/* Daily Card */}
          <div
            className="p-3 rounded-[20px] transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: colors.surfaceContainerHigh,
            }}
          >
            <div className="text-[11px] font-medium opacity-65 mb-0.5">Today</div>
            <div className="text-base font-bold tracking-tight truncate">
              {currency}
              {dailyTotal.toFixed(2)}
            </div>
            <div className="text-[9px] opacity-50 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
              <span>Daily</span>
            </div>
          </div>

          {/* Weekly Card */}
          <div
            className="p-3 rounded-[20px] transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: colors.primaryContainer,
              color: colors.onPrimaryContainer,
            }}
          >
            <div className="text-[11px] font-medium opacity-75 mb-0.5">This Week</div>
            <div className="text-base font-bold tracking-tight truncate">
              {currency}
              {weeklyTotal.toFixed(2)}
            </div>
            <div className="text-[9px] opacity-65 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
              <span>7 Days</span>
            </div>
          </div>

          {/* Monthly Card */}
          <div
            className="p-3 rounded-[20px] transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: colors.surfaceContainerHigh,
            }}
          >
            <div className="text-[11px] font-medium opacity-65 mb-0.5">This Month</div>
            <div className="text-base font-bold tracking-tight truncate">
              {currency}
              {monthlyTotal.toFixed(2)}
            </div>
            <div className="text-[9px] opacity-50 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.tertiary }} />
              <span>Current</span>
            </div>
          </div>
        </div>

        {/* Success toast feedback */}
        {showSuccessToast && (
          <div
            className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-medium animate-fade-in"
            style={{
              backgroundColor: colors.secondaryContainer,
              color: colors.onSecondaryContainer,
            }}
          >
            <Check size={14} className="stroke-[3]" />
            <span>Expense recorded to tracker!</span>
          </div>
        )}

        {/* Faster Input / Inline Quick Add Drawer */}
        {isQuickAddOpen && (
          <form
            onSubmit={handleQuickAdd}
            className="mt-3 pt-3 border-t relative animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ borderColor: `${colors.outline}25` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1">
                <Sparkles size={12} style={{ color: colors.primary }} />
                <span>Fast Input</span>
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 opacity-60"
              >
                <X size={14} />
              </button>
            </div>

            {/* Input Row: Amount and Optional Title */}
            <div className="grid grid-cols-5 gap-2 mb-2.5">
              <div className="col-span-2 relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-60"
                  style={{ color: colors.onSurface }}
                >
                  {currency}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  className="w-full pl-7 pr-2 py-2 rounded-xl text-sm font-bold outline-none border focus:ring-2 transition-all"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}40`,
                    color: colors.onSurface,
                  }}
                />
              </div>

              <div className="col-span-3">
                <input
                  type="text"
                  placeholder="Note (e.g. Latte)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none border focus:ring-2 transition-all"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}40`,
                    color: colors.onSurface,
                  }}
                />
              </div>
            </div>

            {/* Category Pills (Faster Categorization without opening full app) */}
            <div className="mb-3">
              <div className="text-[10px] font-medium opacity-65 mb-1.5">Choose Category:</div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.slice(0, 8).map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all flex-shrink-0 border"
                      style={{
                        backgroundColor: isSelected ? colors.primaryContainer : colors.surface,
                        borderColor: isSelected ? colors.primary : `${colors.outline}30`,
                        color: isSelected ? colors.onPrimaryContainer : colors.onSurface,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <CategoryIcon name={cat.icon} size={12} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] opacity-50 truncate">
                In: {selectedCategory?.name ?? 'Add a category first'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hover:bg-black/5 opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                  }}
                >
                  Save to Tracker
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
