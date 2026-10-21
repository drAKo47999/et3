import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { BottomNavigation, NavTab } from './components/BottomNavigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { WidgetView } from './components/WidgetView';
import { SettingsView } from './components/SettingsView';
import { StandaloneWidget } from './components/StandaloneWidget';
import { ExpenseModal } from './components/ExpenseModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { ExportImportModal } from './components/ExportImportModal';
import { Expense } from './types';
import { Plus } from 'lucide-react';
import { NativeSync } from './components/NativeSync';
import { initNative } from './native';

function MainApp() {
  const { colors } = useTheme();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Check URL parameters for standalone widget mode or quick add
  const [isStandaloneWidget, setIsStandaloneWidget] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('widget') === 'true';
  });

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('quickadd') === 'true';
  });
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | undefined>(undefined);

  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);

  // Android: handle home-screen widget "Add expense" taps and safe-area insets
  useEffect(
    () =>
      initNative(() => {
        setExpenseToEdit(null);
        setCalendarSelectedDate(undefined);
        setIsExpenseModalOpen(true);
      }),
    []
  );

  // If in standalone widget mode, render compact launcher widget
  if (isStandaloneWidget) {
    return (
      <StandaloneWidget
        onOpenFullApp={() => {
          setIsStandaloneWidget(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('widget');
          window.history.replaceState({}, '', url.toString());
        }}
      />
    );
  }

  const handleOpenAddModal = (dateStr?: string) => {
    setExpenseToEdit(null);
    setCalendarSelectedDate(dateStr);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setCalendarSelectedDate(expense.date);
    setIsExpenseModalOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors selection:bg-black/10 dark:selection:bg-white/10"
      style={{
        backgroundColor: colors.surface,
        color: colors.onSurface,
      }}
    >
      {/* Top App Bar */}
      <Navbar
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
        onOpenWidgetTab={() => setCurrentTab('widget')}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={() => handleOpenAddModal()}
            onOpenCalendar={() => setCurrentTab('calendar')}
            onOpenWidgetTab={() => setCurrentTab('widget')}
            onOpenCategoryTab={() => setCurrentTab('categories')}
            onEditExpense={handleEditExpense}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            onAddExpenseForDate={(dateStr) => handleOpenAddModal(dateStr)}
            onEditExpense={handleEditExpense}
          />
        )}

        {currentTab === 'categories' && <CategoryBreakdown />}

        {currentTab === 'widget' && (
          <WidgetView onOpenFullApp={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
            onOpenExportImportModal={() => setIsExportImportModalOpen(true)}
            onOpenCategoryTab={() => setCurrentTab('categories')}
            onOpenWidgetTab={() => setCurrentTab('widget')}
          />
        )}
      </main>

      {/* Material You Floating Action Button (FAB) */}
      <button
        onClick={() => handleOpenAddModal()}
        className="fixed right-6 z-30 w-14 h-14 rounded-[20px] flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 group"
        style={{
          backgroundColor: colors.primaryContainer,
          color: colors.onPrimaryContainer,
          boxShadow: `0 8px 24px -4px ${colors.primary}40`,
          bottom: 'calc(5rem + var(--safe-bottom))',
        }}
        title="Add Expense"
      >
        <Plus size={28} className="stroke-[2.5] transition-transform group-hover:rotate-90" />
      </button>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        initialDate={calendarSelectedDate}
        expenseToEdit={expenseToEdit}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
      />

      <ExportImportModal
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <NativeSync />
          <MainApp />
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
