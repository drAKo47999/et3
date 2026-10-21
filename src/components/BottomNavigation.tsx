import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Calendar, PieChart, Smartphone, Settings } from 'lucide-react';

export type NavTab = 'dashboard' | 'calendar' | 'categories' | 'widget' | 'settings';

interface BottomNavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { colors } = useTheme();

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'categories', label: 'Categories', icon: PieChart },
    { id: 'widget', label: 'Widget', icon: Smartphone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t transition-colors select-none"
      style={{
        backgroundColor: `${colors.surfaceContainer}fa`,
        borderColor: `${colors.outline}20`,
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all group"
            >
              {/* MD3 Tonal Active Pill */}
              <div
                className="px-4 py-1 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? colors.primaryContainer : 'transparent',
                  color: isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                }}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              </div>
              <span
                className="text-[10px] tracking-tight mt-0.5 transition-all"
                style={{
                  color: isActive ? colors.onSurface : colors.onSurfaceVariant,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
