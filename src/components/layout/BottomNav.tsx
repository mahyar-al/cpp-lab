import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Trophy,
  Flame,
  CalendarDays,
  Target,
  Menu,
  Clock,
  LayoutDashboard,
  Zap,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { LiquidNavbar, LiquidNavItem, NimbusIcons, NimbusFx } from '../ui/liquid-glass-navbar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

const TAB_ICON_ELEMENTS: Record<string, { icon: React.ReactNode; fx: NimbusFx }> = {
  home: { icon: <Sparkles className="w-4 h-4" />, fx: 'glow' },
  dashboard: { icon: NimbusIcons.home, fx: 'glow' },
  daily_planner: { icon: NimbusIcons.drop, fx: 'drop' },
  school: { icon: <GraduationCap className="w-4 h-4" />, fx: 'pop' },
  skills: { icon: NimbusIcons.plane, fx: 'plane' },
  competitions: { icon: NimbusIcons.globe, fx: 'spin' },
  habits: { icon: <Flame className="w-4 h-4" />, fx: 'pop' },
  focus_timer: { icon: <Zap className="w-4 h-4" />, fx: 'spin' },
  goals: { icon: <Target className="w-4 h-4" />, fx: 'wave' },
  calendar: { icon: <CalendarDays className="w-4 h-4" />, fx: 'pop' },
};

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const { homeworks, dayData, getSectionTitle, customization, resolvedTheme } = useApp();

  const todayIso = new Date().toISOString().slice(0, 10);
  const pendingHw = homeworks.filter((h) => !h.completed && h.dueDate <= todayIso).length;

  const currentIranianDay = (new Date().getDay() + 1) % 7;
  const todayTasks = (dayData[currentIranianDay]?.postSchoolTasks || []).filter((t) => !t.completed).length;

  const getBadge = (tab: NavTab) => {
    if (tab === 'school' && pendingHw > 0) return toPersianDigits(pendingHw);
    if (tab === 'daily_planner' && todayTasks > 0) return toPersianDigits(todayTasks);
    return undefined;
  };

  // Derive top 4 visible tabs from user customization navOrder & hiddenSections
  const visibleOrder = (customization.navOrder || []).filter(
    (tab) => !(customization.hiddenSections || []).includes(tab) && tab !== 'settings'
  );

  let topTabs = visibleOrder.slice(0, 4);
  if (topTabs.length === 0) {
    topTabs = ['dashboard', 'daily_planner', 'school', 'skills'];
  }
  if (
    currentTab !== 'settings' &&
    !topTabs.includes(currentTab) &&
    !customization.hiddenSections?.includes(currentTab)
  ) {
    topTabs = [...topTabs.slice(0, 3), currentTab];
  }

  // Build items for the Liquid Navbar
  const navItems: LiquidNavItem[] = [
    ...topTabs.map((tab) => {
      const iconConfig = TAB_ICON_ELEMENTS[tab] || {
        icon: NimbusIcons.home,
        fx: 'pop' as NimbusFx,
      };
      return {
        id: tab,
        label: getSectionTitle(tab),
        icon: iconConfig.icon,
        fx: iconConfig.fx,
        badge: getBadge(tab),
      };
    }),
    {
      id: 'menu',
      label: 'منو',
      icon: <Menu className="w-4 h-4" />,
      fx: 'wave',
    },
  ];

  // Determine active index
  let activeIndex = navItems.findIndex((item) => item.id === currentTab);
  if (activeIndex === -1) {
    activeIndex = 0;
  }

  return (
    <div
      className="fixed bottom-3 inset-x-0 z-40 flex justify-center items-center pointer-events-none lg:hidden px-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="منوی ناوبری مایع شیشه‌ای"
    >
      <div className="pointer-events-auto filter drop-shadow-2xl">
        <LiquidNavbar
          items={navItems}
          active={activeIndex}
          onChange={(index, item) => {
            if (item.id === 'menu') {
              onOpenMenu();
            } else if (item.id) {
              onSelectTab(item.id as NavTab);
            }
          }}
          tone={resolvedTheme === 'dark' ? 'dark' : 'light'}
          sound={true}
          compact={false}
          className="shadow-2xl border border-white/20 dark:border-white/10"
        />
      </div>
    </div>
  );
};
