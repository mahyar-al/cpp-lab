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
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { BottomNav } from './components/layout/BottomNav';

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'داشبورد اصلی و مرکز کنترل',
  daily_planner: 'برنامه‌ریز هوشمند روزانه',
  school: 'مدرسه و برنامه هفتگی',
  skills: 'توسعه مهارت‌ها و نقشه‌راه',
  projects: 'مدیریت پروژه‌ها و کانبان',
  competitions: 'آمادگی برای مسابقات و المپیاد',
  habits: 'سیستم عادت‌ها و استمرار روزانه',
  reviews: 'مرور و تکرار فاصله‌دار (Spaced Repetition)',
  focus_timer: 'تایمر تمرکز و پومودورو',
  resources: 'کتابخانه منابع و یادگیری',
  calendar: 'تقویم جامع رویدادها',
  goals: 'اهداف و مرور هفتگی',
  notes: 'یادداشت‌ها و وقایع',
  analytics: 'آمار و گزارش عملکرد تحلیلی',
  settings: 'تنظیمات، نمایه و پشتیبان‌گیری',
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
  } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Sync dark theme class on document.documentElement
  useEffect(() => {
    const isDark = customization.themeMode ? customization.themeMode !== 'light' : profile.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme, customization.themeMode]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B14] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200 relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans" dir="rtl">
      {/* Background Ambient Lighting Orbs & Tech Grid */}
      <div className="pointer-events-none fixed inset-0 cyber-grid opacity-30 dark:opacity-20 z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/8 rounded-full blur-[140px] z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-600/7 rounded-full blur-[160px] z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/4 dark:bg-blue-600/5 rounded-full blur-[130px] z-0" aria-hidden="true" />

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
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out relative z-10 ${
        isCollapsed ? 'lg:mr-20' : 'lg:mr-64'
      }`}>
        <Header
          activeSectionTitle={getSectionTitle(currentTab)}
          onToggleSidebar={() => setIsOpenMobile((prev) => !prev)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10 pb-24 lg:pb-8">
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
      <AIAssistantModal />

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
