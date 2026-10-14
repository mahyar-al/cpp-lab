import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { SchoolView } from './components/views/SchoolView';
import { SkillsView } from './components/views/SkillsView';
import { ProjectsView } from './components/views/ProjectsView';
import { CompetitionsView } from './components/views/CompetitionsView';
import { CalendarView } from './components/views/CalendarView';
import { GoalsView } from './components/views/GoalsView';
import { NotesView } from './components/views/NotesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QuickAddModal } from './components/modals/QuickAddModal';

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'داشبورد اصلی',
  school: 'مدرسه و برنامه هفتگی',
  skills: 'توسعه مهارت‌ها',
  projects: 'مدیریت پروژه‌ها',
  competitions: 'آمادگی برای مسابقات',
  calendar: 'تقویم و رویدادها',
  goals: 'اهداف و مرور هفتگی',
  notes: 'یادداشت‌ها و وقایع',
  analytics: 'آمار و گزارش عملکرد',
  settings: 'تنظیمات و پشتیبان‌گیری',
};

const MainContent: React.FC = () => {
  const { profile, toastMessage } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Sync dark theme class on document.documentElement
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200" dir="rtl">
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
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          activeSectionTitle={TAB_TITLES[currentTab]}
          onToggleSidebar={() => setIsOpenMobile((prev) => !prev)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}
          {currentTab === 'school' && <SchoolView />}
          {currentTab === 'skills' && <SkillsView />}
          {currentTab === 'projects' && <ProjectsView />}
          {currentTab === 'competitions' && <CompetitionsView />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'goals' && <GoalsView />}
          {currentTab === 'notes' && <NotesView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

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
