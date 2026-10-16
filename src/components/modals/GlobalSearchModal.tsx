import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Trophy,
  Target,
  FileText,
  Calendar,
  Flame,
  RotateCcw,
  BookOpen,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../layout/Sidebar';
import { SectionType } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: NavTab) => void;
  onNavigate?: (tab: NavTab) => void;
}

interface SearchItem {
  id: string;
  title: string;
  type: string;
  targetTab: NavTab;
  icon: React.ElementType;
  snippet?: string;
  colorClass?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onNavigate,
}) => {
  const {
    subjects,
    homeworks,
    skills,
    projects,
    competitions,
    goals,
    notes,
    calendarEvents,
    habits,
    reviews,
    resources,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateFn = onNavigateToTab || onNavigate;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build aggregate searchable list
  const allSearchableItems: SearchItem[] = [
    ...subjects.map((s) => ({
      id: `subj-${s.id}`,
      title: s.name,
      type: 'درس مدرسه',
      targetTab: 'school' as NavTab,
      icon: GraduationCap,
      colorClass: 'text-blue-500',
      snippet: s.teacher ? `معلم: ${s.teacher}` : undefined,
    })),
    ...homeworks.map((h) => ({
      id: `hw-${h.id}`,
      title: h.title,
      type: 'تکلیف مدرسه',
      targetTab: 'school' as NavTab,
      icon: GraduationCap,
      colorClass: 'text-blue-500',
      snippet: `درس: ${h.subjectName} · موعد: ${h.dueDate}`,
    })),
    ...skills.map((s) => ({
      id: `sk-${s.id}`,
      title: s.name,
      type: 'مهارت',
      targetTab: 'skills' as NavTab,
      icon: Sparkles,
      colorClass: 'text-[#39FF88]',
      snippet: `سطح: ${s.currentLevel} ← هدف: ${s.targetLevel}`,
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.title,
      type: 'پروژه',
      targetTab: 'projects' as NavTab,
      icon: FolderGit2,
      colorClass: 'text-[#C084FC]',
      snippet: p.description,
    })),
    ...competitions.map((c) => ({
      id: `comp-${c.id}`,
      title: c.title,
      type: 'مسابقه / المپیاد',
      targetTab: 'competitions' as NavTab,
      icon: Trophy,
      colorClass: 'text-[#FF4FD8]',
      snippet: `برگزارکننده: ${c.organizer}`,
    })),
    ...habits.map((h) => ({
      id: `habit-${h.id}`,
      title: h.title,
      type: 'عادت روزانه',
      targetTab: 'habits' as NavTab,
      icon: Flame,
      colorClass: 'text-amber-500',
      snippet: `استمرار: ${h.streak} روز`,
    })),
    ...reviews.map((r) => ({
      id: `rev-${r.id}`,
      title: r.title,
      type: 'مرور فاصله‌دار',
      targetTab: 'reviews' as NavTab,
      icon: RotateCcw,
      colorClass: 'text-indigo-400',
      snippet: `مبحث: ${r.topic} · مرحله: ${r.intervalDays} روزه`,
    })),
    ...resources.map((res) => ({
      id: `res-${res.id}`,
      title: res.title,
      type: 'منبع یادگیری',
      targetTab: 'resources' as NavTab,
      icon: BookOpen,
      colorClass: 'text-teal-400',
      snippet: res.authorOrInstructor ? `مؤلف: ${res.authorOrInstructor}` : res.section,
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: g.title,
      type: 'هدف',
      targetTab: 'goals' as NavTab,
      icon: Target,
      colorClass: 'text-emerald-400',
      snippet: g.description,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      type: 'یادداشت',
      targetTab: 'notes' as NavTab,
      icon: FileText,
      colorClass: 'text-cyan-400',
      snippet: n.content,
    })),
    ...calendarEvents.map((ev) => ({
      id: `cal-${ev.id}`,
      title: ev.title,
      type: 'رویداد تقویم',
      targetTab: 'calendar' as NavTab,
      icon: Calendar,
      colorClass: 'text-cyan-400',
      snippet: `${ev.date}${ev.startTime ? ` ساعت ${ev.startTime}` : ''}`,
    })),
  ];

  const searchResults = query.trim()
    ? allSearchableItems.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          (item.snippet && item.snippet.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectResult = (targetTab: NavTab) => {
    if (navigateFn) {
      navigateFn(targetTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[80vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در درس‌ها، تکالیف، مهارت‌ها، پروژه‌ها، مسابقات، عادت‌ها و منابع..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-[#263247]/60 cyber-scrollbar">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
              عنوان درس، پروژه، مهارت، مسابقه، عادت، منبع یا یادداشت موردنظر را تایپ کنید.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
              هیچ موردی با عبارت «{query}» یافت نشد.
            </div>
          ) : (
            searchResults.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.targetTab)}
                  className="p-3 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${item.colorClass || 'text-cyan-500'}`} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] truncate group-hover:text-cyan-500 dark:group-hover:text-[#00F5FF]">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate mt-0.5">
                        <span className="font-medium text-cyan-600 dark:text-cyan-400">{item.type}</span>
                        {item.snippet && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{item.snippet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-cyan-500 dark:group-hover:text-[#00F5FF] transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
