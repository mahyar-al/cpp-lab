import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

  return (
    <div data-app-canvas="true" className="min-h-[100dvh] w-full bg-[#F5F4F1] dark:bg-[#000000] text-[#23211E] dark:text-[#ECEAE6] flex flex-col md:flex-row transition-colors duration-200 relative overflow-x-hidden selection:bg-amber-200 dark:selection:bg-amber-950/70 font-sans" dir="rtl">

      {/* Background Ambient Depth & Glow Layer for Realistic Frosted Glass Refraction */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Primary Ambient Glow (Soft Accent Refraction Orb) */}
        <div
          className="absolute -top-32 -right-32 w-96 sm:w-[42rem] h-96 sm:h-[42rem] rounded-full blur-[110px] transition-all duration-700 opacity-25 dark:opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          }}
        />
        {/* Secondary Soft Depth Orb (Delicate Violet/Slate Depth) */}
        <div
          className="absolute top-1/4 -left-32 w-80 sm:w-[34rem] h-80 sm:h-[34rem] rounded-full blur-[130px] transition-all duration-700 opacity-20 dark:opacity-[0.09]"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          }}
        />
        {/* Tertiary Ambient Glow (Center Soft Accent) */}
        <div
          className="absolute top-2/3 right-10 w-72 sm:w-[28rem] h-72 sm:h-[28rem] rounded-full blur-[120px] transition-all duration-700 opacity-15 dark:opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
          }}
        />
        {/* Lower Ambient Subtle Glow */}
        <div
          className="absolute -bottom-28 left-1/4 w-88 sm:w-[36rem] h-88 sm:h-[36rem] rounded-full blur-[110px] transition-all duration-700 opacity-20 dark:opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
          }}
        />
        {/* Subtle Frosted Canvas Pattern (Ultra-fine micro texture) */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.025)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
      </div>

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
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/60 dark:border-slate-200 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
