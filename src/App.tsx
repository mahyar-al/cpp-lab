import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { DailyPlannerView } from './components/views/DailyPlannerView';
import { SchoolView } from './components/views/SchoolView';
import { SkillsView } from './components/views/SkillsView';
import { ProjectsView } from './components/views/ProjectsView';
import { CompetitionsView } from './components/views/CompetitionsView';
import { HabitsView } from './components/views/HabitsView';
import { ReviewsView } from './components/views/ReviewsView';
import { FocusTimerView } from './components/views/FocusTimerView';
import { ResourceLibraryView } from './components/views/ResourceLibraryView';
import { CalendarView } from './components/views/CalendarView';
import { GoalsView } from './components/views/GoalsView';
import { NotesView } from './components/views/NotesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { AuthModal } from './components/modals/AuthModal';
import { RescueModeModal } from './components/modals/RescueModeModal';
import { BottomNav } from './components/layout/BottomNav';
import { FloatingBackground } from './components/FloatingBackground';

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'داشبورد',
  daily_planner: 'برنامه‌ریز روزانه',
  school: 'مدرسه و درس‌ها',
  skills: 'توسعه مهارت‌ها',
  projects: 'مدیریت پروژه‌ها',
  competitions: 'مسابقات و المپیاد',
  habits: 'عادت‌ها و استمرار',
  reviews: 'مرور فاصله‌دار',
  focus_timer: 'تایمر تمرکز',
  resources: 'کتابخانه منابع',
  calendar: 'تقویم رویدادها',
  goals: 'اهداف و مرور',
  notes: 'یادداشت‌ها و وقایع',
  analytics: 'آمار و عملکرد',
  settings: 'تنظیمات و حساب',
};

const MainContent: React.FC = () => {
  const {
    profile,
    toastMessage,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialTab,
    openAuthModal,
    getSectionTitle,
    customization,
    resolvedTheme,
  } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Handle URL hash for quick auth routing (#login, #register, #forgot-password)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        openAuthModal('login');
      } else if (hash === '#register') {
        openAuthModal('register');
      } else if (hash === '#recovery' || hash === '#forgot-password' || hash === '#forgot_password') {
        openAuthModal('recovery');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [openAuthModal]);

  // Global event listener for opening auth modal from any deep component
  useEffect(() => {
    const handleOpenAuth = (e: any) => {
      const tab = e.detail?.tab || 'login';
      openAuthModal(tab);
    };
    window.addEventListener('pathly_open_auth', handleOpenAuth);
    return () => window.removeEventListener('pathly_open_auth', handleOpenAuth);
  }, [openAuthModal]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for search, Alt+N for quick add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Delegated Liquid Glass specular highlight tracking
  useEffect(() => {
    const isCoarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarse || prefersReducedMotion) return;

    let rafId: number | null = null;
    let lastTarget: HTMLElement | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const target = (e.target as HTMLElement | null)?.closest?.(
          '.glass, .glass-strong, .glass-subtle, .glass-card, .glass-panel, .glass-modal, .glass-dropdown'
        ) as HTMLElement | null;

        if (lastTarget && lastTarget !== target) {
          lastTarget.style.removeProperty('--gx');
          lastTarget.style.removeProperty('--gy');
        }

        if (target) {
          const rect = target.getBoundingClientRect();
          const gx = `${(e.clientX - rect.left).toFixed(1)}px`;
          const gy = `${(e.clientY - rect.top).toFixed(1)}px`;
          target.style.setProperty('--gx', gx);
          target.style.setProperty('--gy', gy);
          lastTarget = target;
        } else {
          lastTarget = null;
        }
      });
    };

    const handlePointerLeave = () => {
      if (lastTarget) {
        lastTarget.style.removeProperty('--gx');
        lastTarget.style.removeProperty('--gy');
        lastTarget = null;
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      if (lastTarget) {
        lastTarget.style.removeProperty('--gx');
        lastTarget.style.removeProperty('--gy');
      }
    };
  }, []);

  return (
    <div data-app-canvas="true" className="min-h-[100dvh] w-full bg-transparent text-fg flex flex-col md:flex-row transition-colors duration-200 relative isolate overflow-x-hidden selection:bg-fg selection:text-bg font-sans" dir="rtl">

      {/* Floating Animated Decorative Background */}
      <FloatingBackground />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsOpenMobile(false);
        }}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main App Container */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-[100dvh] transition-all duration-300 ease-in-out relative z-10 ${
        isCollapsed ? 'lg:mr-20' : 'lg:mr-64'
      }`}>
        <Header
          activeSectionTitle={getSectionTitle(currentTab)}
          onToggleSidebar={() => setIsOpenMobile((prev) => !prev)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="flex-1 w-full min-w-0 p-3.5 sm:p-5 md:p-6 lg:p-8 xl:px-10 2xl:px-12 relative z-10 pb-24 lg:pb-10">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}
          {currentTab === 'daily_planner' && <DailyPlannerView />}
          {currentTab === 'school' && <SchoolView />}
          {currentTab === 'skills' && <SkillsView />}
          {currentTab === 'projects' && <ProjectsView />}
          {currentTab === 'competitions' && <CompetitionsView />}
          {currentTab === 'habits' && <HabitsView />}
          {currentTab === 'reviews' && <ReviewsView />}
          {currentTab === 'focus_timer' && <FocusTimerView />}
          {currentTab === 'resources' && <ResourceLibraryView />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'goals' && <GoalsView />}
          {currentTab === 'notes' && <NotesView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile/Tablet Ergonomic Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsOpenMobile(false);
        }}
        onOpenMenu={() => setIsOpenMobile(true)}
      />

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          setIsSearchOpen(false);
        }}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalInitialTab}
      />

      <RescueModeModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 flex items-center gap-2.5 px-4.5 py-3 glass-strong text-fg text-xs font-semibold rounded-[14px] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-fg shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ThemeProvider>
  );
}
