import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { CategoryIcon, ICON_OPTIONS } from '../utils/categoryIcons';
import { Category } from '../types';
import { Plus, Edit2, Trash2, PieChart, ShieldAlert, CheckCircle2, X } from 'lucide-react';

export const CategoryBreakdown: React.FC = () => {
  const {
    filteredCategorySpends,
    categories,
    currency,
    filteredTotal,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useExpense();
  const { colors } = useTheme();

  // Category Modal state (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#386A20');
  const [budget, setBudget] = useState('');

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setIcon('ShoppingBag');
    setColor('#0284C7');
    setBudget('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setColor(cat.color);
    setBudget(cat.budget ? String(cat.budget) : '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedBudget = budget ? parseFloat(budget) : undefined;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        icon,
        color,
        budget: parsedBudget,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon,
        color,
        budget: parsedBudget,
      });
    }
    setIsModalOpen(false);
  };

  // Preset vibrant palette colors for categories
  const PRESET_COLORS = [
    '#D97706',
    '#15803D',
    '#0284C7',
    '#4338CA',
    '#7E22CE',
    '#BE123C',
    '#BE185D',
    '#0F766E',
    '#B45309',
    '#475569',
    '#E11D48',
    '#059669',
    '#2563EB',
    '#9333EA',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header with Add Custom Category button */}
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
              <PieChart size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: colors.onSurface }}>
                Category Breakdown & Budgets
              </h2>
              <p className="text-xs opacity-65">
                Analyze total expenses per category and track your monthly budget targets
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
            style={{
              backgroundColor: colors.primary,
              color: colors.onPrimary,
            }}
          >
            <Plus size={16} />
            <span>New Custom Category</span>
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategorySpends.map(({ category, total, count, percentage, budget, budgetProgress }) => {
          const isOverBudget = budgetProgress !== undefined && budgetProgress > 100;
          const isNearBudget = budgetProgress !== undefined && budgetProgress >= 80 && budgetProgress <= 100;

          return (
            <div
              key={category.id}
              className="rounded-[24px] p-5 border transition-all hover:shadow-md relative overflow-hidden group"
              style={{
                backgroundColor: colors.surfaceContainer,
                borderColor: `${colors.outline}20`,
              }}
            >
              {/* Header: Icon, Name, Share pill */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: `${category.color}25`,
                      color: category.color,
                    }}
                  >
                    <CategoryIcon name={category.icon} size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: colors.onSurface }}>
                      {category.name}
                    </h3>
                    <div className="text-xs opacity-60">
                      {count} {count === 1 ? 'transaction' : 'transactions'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1.5 rounded-lg opacity-40 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
                    title="Edit Category"
                  >
                    <Edit2 size={14} />
                  </button>
                  {!category.isDefault && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete category "${category.name}"?`)) {
                          deleteCategory(category.id);
                        }
                      }}
                      className="p-1.5 rounded-lg opacity-40 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-opacity"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Total Expense for this category */}
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs opacity-60">Total Spent</span>
                <span className="text-xl font-extrabold tracking-tight" style={{ color: colors.onSurface }}>
                  {currency}
                  {total.toFixed(2)}
                </span>
              </div>

              {/* Budget Progress (if set) */}
              {budget && budget > 0 ? (
                <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: `${colors.outline}15` }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-60 flex items-center gap-1">
                      {isOverBudget ? (
                        <ShieldAlert size={13} className="text-red-500" />
                      ) : isNearBudget ? (
                        <ShieldAlert size={13} className="text-amber-500" />
                      ) : (
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      )}
                      <span>Monthly Budget: {currency}{budget}</span>
                    </span>
                    <span
                      className={`font-bold ${
                        isOverBudget
                          ? 'text-red-500'
                          : isNearBudget
                          ? 'text-amber-500'
                          : 'opacity-70'
                      }`}
                    >
                      {budgetProgress?.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(budgetProgress || 0, 100)}%`,
                        backgroundColor: isOverBudget
                          ? '#EF4444'
                          : isNearBudget
                          ? '#F59E0B'
                          : category.color,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t text-[11px] opacity-45 flex items-center justify-between"
                  style={{ borderColor: `${colors.outline}15` }}
                >
                  <span>No budget set</span>
                  <button
                    onClick={() => openEditModal(category)}
                    className="hover:underline text-xs"
                    style={{ color: colors.primary }}
                  >
                    + Set budget
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Creating or Editing Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-[28px] p-6 border shadow-2xl relative animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: colors.surfaceContainer,
              borderColor: `${colors.outline}30`,
              color: colors.onSurface,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                {editingCategory ? 'Edit Category' : 'Create Custom Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-60"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subscriptions, Coffee, Pets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}40`,
                    color: colors.onSurface,
                  }}
                />
              </div>

              {/* Monthly Budget (Optional) */}
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-70">
                  Monthly Budget (Optional, {currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 250"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}40`,
                    color: colors.onSurface,
                  }}
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-70">Color Accent</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        color === c ? 'scale-110 shadow-md' : 'opacity-85'
                      }`}
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? '#ffffff' : 'transparent',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-70">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: `${colors.outline}20`,
                  }}
                >
                  {ICON_OPTIONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIcon(item.name)}
                      className="p-2 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                      style={{
                        backgroundColor: icon === item.name ? colors.primaryContainer : 'transparent',
                        color: icon === item.name ? colors.onPrimaryContainer : colors.onSurface,
                      }}
                    >
                      <item.component size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold hover:bg-black/5 opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                  }}
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
