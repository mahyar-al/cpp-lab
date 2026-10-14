import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Search,
  Trash2,
  Tag,
  Clock,
  Activity,
  X,
  BookOpen,
  Sparkles,
  FolderGit2,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note, SectionType } from '../../types';

export const NotesView: React.FC = () => {
  const {
    notes,
    addNote,
    deleteNote,
    toggleNotePinned,
    activityLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notes' | 'activity_logs'>('notes');
  const [selectedCategory, setSelectedCategory] = useState<SectionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SectionType>('general');
  const [newTags, setNewTags] = useState('');

  const filteredNotes = notes.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      pinned: false,
    });

    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setShowAddModal(false);
  };

  const getCategoryBadge = (cat: SectionType) => {
    switch (cat) {
      case 'school':
        return { label: 'مدرسه', icon: BookOpen, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' };
      case 'skill':
        return { label: 'مهارت', icon: Sparkles, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' };
      case 'project':
        return { label: 'پروژه', icon: FolderGit2, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' };
      case 'competition':
        return { label: 'مسابقه', icon: Trophy, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' };
      default:
        return { label: 'عمومی', icon: FileText, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-cyan-500/25 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            یادداشت‌ها و وقایع سامانه (Activity Log)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ثبت سریع نکات، ایده‌ها، خلاصه فرمول‌ها و مشاهده تایم‌لاین رویدادهای سیستم
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_22px_rgba(6,182,212,0.5)] transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          یادداشت جدید
        </button>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white dark:bg-cyan-500/15 text-cyan-700 dark:text-[#00F5FF] border border-slate-200 dark:border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121829]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          یادداشت‌های من ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('activity_logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'activity_logs'
              ? 'bg-white dark:bg-cyan-500/15 text-cyan-700 dark:text-[#00F5FF] border border-slate-200 dark:border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121829]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          تایم‌لاین رویدادها ({activityLogs.length})
        </button>
      </div>

      {activeTab === 'notes' ? (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0D1222] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'همه' },
                { id: 'school', label: 'مدرسه' },
                { id: 'skill', label: 'مهارت‌ها' },
                { id: 'project', label: 'پروژه‌ها' },
                { id: 'competition', label: 'مسابقات' },
                { id: 'general', label: 'عمومی' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id as typeof selectedCategory)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121829]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در متن یا تگ‌ها..."
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0D1222] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">یادداشتی با این مشخصات یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const badge = getCategoryBadge(note.category);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={note.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      note.pinned
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]'
                        : 'bg-white dark:bg-[#0D1222] border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleNotePinned(note.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              note.pinned
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                            title={note.pinned ? 'برداشتن سنجاق' : 'سنجاق کردن'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`حذف یادداشت «${note.title}»؟`)) deleteNote(note.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {note.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#121829] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center gap-0.5"
                            >
                              <Tag className="w-2.5 h-2.5 text-cyan-400" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{note.updatedAt || note.createdAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Activity Timeline */
        <div className="bg-white dark:bg-[#0D1222] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            رویدادهای اخیر در سیستم
          </h3>

          <div className="space-y-4 relative border-r-2 border-slate-200 dark:border-slate-800 pr-5 mr-3">
            {activityLogs.map((log) => {
              const badge = getCategoryBadge(log.section);
              const BadgeIcon = badge.icon;

              return (
                <div key={log.id} className="relative space-y-1">
                  {/* Timeline dot */}
                  <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-2 border-white dark:border-[#0D1222] shadow-[0_0_8px_#22d3ee]" />

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] flex items-center gap-1 ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">{log.timestamp}</span>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {log.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D1222] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-cyan-500/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                ثبت یادداشت جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان یادداشت:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: فرمول‌های مهم فیزیک حرکت"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  متن و توضیحات:
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="نکات، یادداشت‌ها یا کدهای مرتبط..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="school">مدرسه</option>
                    <option value="skill">مهارت‌ها</option>
                    <option value="project">پروژه‌ها</option>
                    <option value="competition">مسابقات</option>
                    <option value="general">عمومی</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">برچسب‌ها (با کاما):</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="فیزیک, کنکور, فرمول"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#090D18] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  ذخیره یادداشت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
