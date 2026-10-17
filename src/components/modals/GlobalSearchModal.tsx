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
      colorClass: 'text-fg',
      snippet: s.teacher ? `معلم: ${s.teacher}` : undefined,
    })),
    ...homeworks.map((h) => ({
      id: `hw-${h.id}`,
      title: h.title,
      type: 'تکلیف مدرسه',
      targetTab: 'school' as NavTab,
      icon: GraduationCap,
      colorClass: 'text-fg',
      snippet: `درس: ${h.subjectName} · موعد: ${h.dueDate}`,
    })),
    ...skills.map((s) => ({
      id: `sk-${s.id}`,
      title: s.name,
      type: 'مهارت',
      targetTab: 'skills' as NavTab,
      icon: Sparkles,
      colorClass: 'text-fg',
      snippet: `سطح: ${s.currentLevel} ← هدف: ${s.targetLevel}`,
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.title,
      type: 'پروژه',
      targetTab: 'projects' as NavTab,
      icon: FolderGit2,
      colorClass: 'text-fg',
      snippet: p.description,
    })),
    ...competitions.map((c) => ({
      id: `comp-${c.id}`,
      title: c.title,
      type: 'مسابقه / المپیاد',
      targetTab: 'competitions' as NavTab,
      icon: Trophy,
      colorClass: 'text-fg',
      snippet: `برگزارکننده: ${c.organizer}`,
    })),
    ...habits.map((h) => ({
      id: `habit-${h.id}`,
      title: h.title,
      type: 'عادت روزانه',
      targetTab: 'habits' as NavTab,
      icon: Flame,
      colorClass: 'text-fg',
      snippet: `استمرار: ${h.streak} روز`,
    })),
    ...reviews.map((r) => ({
      id: `rev-${r.id}`,
      title: r.title,
      type: 'مرور فاصله‌دار',
      targetTab: 'reviews' as NavTab,
      icon: RotateCcw,
      colorClass: 'text-fg',
      snippet: `مبحث: ${r.topic} · مرحله: ${r.intervalDays} روزه`,
    })),
    ...resources.map((res) => ({
      id: `res-${res.id}`,
      title: res.title,
      type: 'منبع یادگیری',
      targetTab: 'resources' as NavTab,
      icon: BookOpen,
      colorClass: 'text-fg',
      snippet: res.authorOrInstructor ? `مؤلف: ${res.authorOrInstructor}` : res.section,
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: g.title,
      type: 'هدف',
      targetTab: 'goals' as NavTab,
      icon: Target,
      colorClass: 'text-fg',
      snippet: g.description,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      type: 'یادداشت',
      targetTab: 'notes' as NavTab,
      icon: FileText,
      colorClass: 'text-fg',
      snippet: n.content,
    })),
    ...calendarEvents.map((ev) => ({
      id: `cal-${ev.id}`,
      title: ev.title,
      type: 'رویداد تقویم',
      targetTab: 'calendar' as NavTab,
      icon: Calendar,
      colorClass: 'text-fg',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/45 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-150" dir="rtl">
      <div
        className="w-full max-w-xl rounded-[24px] glass-strong shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line bg-chip/40">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در درس‌ها، تکالیف، مهارت‌ها، پروژه‌ها، مسابقات، عادت‌ها و منابع..."
            className="flex-1 bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-muted hover:text-fg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-muted hover:text-fg px-2 py-1 rounded-lg border border-line cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-line">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-muted font-medium">
              عنوان درس، پروژه، مهارت، مسابقه، عادت، منبع یا یادداشت موردنظر را تایپ کنید.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted font-medium">
              هیچ موردی با عبارت «{query}» یافت نشد.
            </div>
          ) : (
            searchResults.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.targetTab)}
                  className="p-3 flex items-center justify-between rounded-xl hover:bg-chip cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-chip border border-line flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${item.colorClass || 'text-fg'}`} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-fg truncate group-hover:text-fg">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-muted flex items-center gap-2 truncate mt-0.5 font-medium">
                        <span className="font-bold text-fg">{item.type}</span>
                        {item.snippet && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{item.snippet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-muted group-hover:text-fg transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
