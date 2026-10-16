import React from 'react';
import {
  LayoutDashboard,
  Clock,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Trophy,
  Flame,
  RotateCcw,
  Zap,
  BookOpen,
  CalendarDays,
  Target,
  FileText,
  BarChart3,
  Settings,
  Menu,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

const TAB_ICONS: Record<NavTab, React.ElementType> = {
  dashboard: LayoutDashboard,
  daily_planner: Clock,
  school: GraduationCap,
  skills: Sparkles,
  projects: FolderGit2,
  competitions: Trophy,
  habits: Flame,
  reviews: RotateCcw,
  focus_timer: Zap,
  resources: BookOpen,
  calendar: CalendarDays,
  goals: Target,
  notes: FileText,
  analytics: BarChart3,
  settings: Settings,
};

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const { homeworks, dayData, getSectionTitle, customization } = useApp();

  const todayIso = new Date().toISOString().slice(0, 10);
  const pendingHw = homeworks.filter((h) => !h.completed && h.dueDate <= todayIso).length;

  const currentIranianDay = (new Date().getDay() + 1) % 7;
  const todayTasks = (dayData[currentIranianDay]?.postSchoolTasks || []).filter((t) => !t.completed).length;

  const getBadge = (tab: NavTab) => {
    if (tab === 'school' && pendingHw > 0) return pendingHw;
    if (tab === 'daily_planner' && todayTasks > 0) return todayTasks;
    return undefined;
  };

  // Derive top 4 visible tabs from user customization navOrder & hiddenSections
  const visibleOrder = (customization.navOrder || []).filter(
    (tab) => !(customization.hiddenSections || []).includes(tab) && tab !== 'settings'
  );

  // If currentTab is not in visible top 4, ensure it's visible by replacing 4th item if needed
  let topTabs = visibleOrder.slice(0, 4);
  if (topTabs.length === 0) {
    topTabs = ['dashboard', 'daily_planner', 'school', 'skills'];
  }
  if (currentTab !== 'settings' && !topTabs.includes(currentTab) && !customization.hiddenSections?.includes(currentTab)) {
    topTabs = [...topTabs.slice(0, 3), currentTab];
  }

  const navItems = topTabs.map((tab) => ({
    id: tab,
    label: getSectionTitle(tab),
    icon: TAB_ICONS[tab] || LayoutDashboard,
    badge: getBadge(tab),
  }));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#242424] lg:hidden transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="ناوبری سریع موبایل"
    >
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 rounded-full bg-amber-600 dark:bg-amber-400" />
              )}

              <div className="relative mt-0.5">
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 text-[8px] font-mono tabular-nums font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                    {toPersianDigits(item.badge)}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 truncate">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th button: Full Menu (Toggles complete 15-view sidebar drawer) */}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer select-none"
          aria-label="تمام بخش‌ها و امکانات"
        >
          <div className="relative mt-0.5">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1">
            منو
          </span>
        </button>
      </div>
    </nav>
  );
};
