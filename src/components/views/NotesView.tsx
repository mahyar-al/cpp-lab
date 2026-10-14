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
        return { label: 'مدرسه', icon: BookOpen, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
      case 'skill':
        return { label: 'مهارت', icon: Sparkles, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' };
      case 'project':
        return { label: 'پروژه', icon: FolderGit2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
      case 'competition':
        return { label: 'مسابقه', icon: Trophy, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
      default:
        return { label: 'عمومی', icon: FileText, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-6 h-6" />
            </span>
            یادداشت‌ها و صندوق وقایع (Activity Log)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ثبت سریع نکات، ایده‌ها، خلاصه فرمول‌ها و مشاهده تایم‌لاین رویدادهای سامانه
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          یادداشت جدید
        </button>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          یادداشت‌های من ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('activity_logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'activity_logs'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          تایم‌لاین رویدادها و فعالیت‌ها ({activityLogs.length})
        </button>
      </div>

      {activeTab === 'notes' ? (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const badge = getCategoryBadge(note.category);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    note.pinned
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
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
                          className={`p-1.5 rounded-lg transition-colors ${
                            note.pinned
                              ? 'text-amber-600 bg-amber-100 dark:bg-amber-900/40'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={note.pinned ? 'برداشتن سنجاق' : 'سنجاق کردن'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`حذف یادداشت «${note.title}»؟`)) deleteNote(note.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
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
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{note.updatedAt || note.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Activity Timeline */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
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
                  <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1 ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-slate-400 text-[11px]">{log.timestamp}</span>
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                ثبت یادداشت جدید
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SectionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
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
