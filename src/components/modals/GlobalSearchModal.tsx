import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  ArrowLeft,
  BookOpen,
  CheckSquare,
  Sparkles,
  FolderGit2,
  Trophy,
  Target,
  FileText,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavItemKey } from '../layout/Sidebar';
import { SectionType } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: NavItemKey) => void;
  onNavigate?: (tab: NavItemKey) => void;
}

interface SearchItem {
  id: string;
  title: string;
  type: string;
  section: SectionType;
  snippet?: string;
}

const SECTION_ICON_MAP: Record<SectionType, React.ElementType> = {
  school: BookOpen,
  skill: Sparkles,
  project: FolderGit2,
  competition: Trophy,
  general: FileText,
};

const SECTION_TAB_MAP: Record<SectionType, NavItemKey> = {
  school: 'school',
  skill: 'skills',
  project: 'projects',
  competition: 'competitions',
  general: 'notes',
};

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
      section: 'school' as SectionType,
      snippet: s.teacher ? `معلم: ${s.teacher}` : undefined,
    })),
    ...homeworks.map((h) => ({
      id: `hw-${h.id}`,
      title: h.title,
      type: 'تکلیف مدرسه',
      section: 'school' as SectionType,
      snippet: `درس: ${h.subjectName}`,
    })),
    ...skills.map((s) => ({
      id: `sk-${s.id}`,
      title: s.name,
      type: 'مهارت',
      section: 'skill' as SectionType,
      snippet: `سطح: ${s.currentLevel} ← ${s.targetLevel}`,
    })),
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.title,
      type: 'پروژه',
      section: 'project' as SectionType,
      snippet: p.description,
    })),
    ...competitions.map((c) => ({
      id: `comp-${c.id}`,
      title: c.title,
      type: 'مسابقه / المپیاد',
      section: 'competition' as SectionType,
      snippet: `برگزارکننده: ${c.organizer}`,
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: g.title,
      type: 'هدف',
      section: g.category,
      snippet: g.description,
    })),
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      title: n.title,
      type: 'یادداشت',
      section: n.category,
      snippet: n.content,
    })),
    ...calendarEvents.map((ev) => ({
      id: `cal-${ev.id}`,
      title: ev.title,
      type: 'رویداد تقویم',
      section: ev.section,
      snippet: ev.date,
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

  const handleSelectResult = (section: SectionType) => {
    const targetTab = SECTION_TAB_MAP[section] || 'dashboard';
    if (navigateFn) {
      navigateFn(targetTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در درس‌ها، تکالیف، مهارت‌ها، پروژه‌ها، مسابقات و یادداشت‌ها..."
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-slate-400">
              عنوان درس، پروژه، مهارت، مسابقه یا یادداشت موردنظر را تایپ کنید.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              هیچ موردی با عبارت «{query}» یافت نشد.
            </div>
          ) : (
            searchResults.map((item) => {
              const Icon = SECTION_ICON_MAP[item.section] || CheckSquare;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item.section)}
                  className="p-3 flex items-center justify-between rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate mt-0.5">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.type}</span>
                        {item.snippet && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{item.snippet}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
