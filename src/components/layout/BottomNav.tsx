import React from 'react';
import {
  LayoutDashboard,
  Clock,
  GraduationCap,
  Sparkles,
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

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const { homeworks, dayData } = useApp();

  const todayIso = new Date().toISOString().slice(0, 10);
  const pendingHw = homeworks.filter((h) => !h.completed && h.dueDate <= todayIso).length;

  const currentIranianDay = (new Date().getDay() + 1) % 7;
  const todayTasks = (dayData[currentIranianDay]?.postSchoolTasks || []).filter((t) => !t.completed).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'داشبورد',
      icon: LayoutDashboard,
    },
    {
      id: 'daily_planner' as NavTab,
      label: 'برنامه‌ریز',
      icon: Clock,
      badge: todayTasks > 0 ? todayTasks : undefined,
    },
    {
      id: 'school' as NavTab,
      label: 'مدرسه',
      icon: GraduationCap,
      badge: pendingHw > 0 ? pendingHw : undefined,
    },
    {
      id: 'skills' as NavTab,
      label: 'مهارت‌ها',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0D1220]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#263247] lg:hidden transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="ناوبری سریع موبایل"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-cyan-600 dark:text-[#00F5FF]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Neon Ambient Glow Indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#00F5FF]" />
              )}

              <div className="relative mt-1">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 text-[9px] font-mono font-bold rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    {toPersianDigits(item.badge)}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 font-medium transition-colors ${
                isActive ? 'font-bold text-cyan-600 dark:text-[#00F5FF]' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 5th button: Full Menu (Toggles complete 15-view sidebar drawer) */}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all cursor-pointer select-none active:scale-95"
          aria-label="تمام بخش‌ها و امکانات"
        >
          <div className="relative mt-1">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-medium">
            منو کامل
          </span>
        </button>
      </div>
    </nav>
  );
};
