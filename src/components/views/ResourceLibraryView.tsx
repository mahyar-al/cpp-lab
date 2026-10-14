import React, { useState } from 'react';
import {
  Library,
  Plus,
  Search,
  BookMarked,
  Pin,
  ExternalLink,
  Trash2,
  Edit2,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  X,
  Check,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import { KnowledgeResource, SectionType } from '../../types';

export const ResourceLibraryView: React.FC = () => {
  const {
    resources,
    addResource,
    updateResource,
    deleteResource,
    toggleResourcePinned,
    subjects,
    skills,
    projects,
    competitions,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState<'all' | SectionType>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<KnowledgeResource['type']>('book');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [section, setSection] = useState<SectionType>('school');
  const [linkedEntityId, setLinkedEntityId] = useState('');
  const [status, setStatus] = useState<KnowledgeResource['status']>('not_started');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [takeawaysStr, setTakeawaysStr] = useState('');

  const filteredResources = resources.filter((res) => {
    if (filterSection !== 'all' && res.section !== filterSection) return false;
    if (filterType !== 'all' && res.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchAuthor = res.authorOrInstructor?.toLowerCase().includes(q);
      const matchTags = (res.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchTags) return false;
    }
    return true;
  });

  // Sort pinned first
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let linkedName = '';
    if (section === 'school') {
      linkedName = subjects.find((s) => s.id === linkedEntityId)?.name || 'درس مدرسه';
    } else if (section === 'skill') {
      linkedName = skills.find((s) => s.id === linkedEntityId)?.name || 'مهارت فنی';
    } else if (section === 'project') {
      linkedName = projects.find((p) => p.id === linkedEntityId)?.title || 'پروژه';
    } else if (section === 'competition') {
      linkedName = competitions.find((c) => c.id === linkedEntityId)?.title || 'مسابقه';
    }

    const tags = tagsStr
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const keyTakeaways = takeawaysStr
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    addResource({
      title: title.trim(),
      type,
      authorOrInstructor: author.trim() || undefined,
      url: url.trim() || undefined,
      section,
      linkedEntityId: linkedEntityId || undefined,
      linkedEntityName: linkedName || undefined,
      status,
      progressPercentage: Number(progressPercentage) || 0,
      pinned: false,
      tags,
      notes: notes.trim(),
      keyTakeaways,
    });

    setTitle('');
    setAuthor('');
    setUrl('');
    setNotes('');
    setTagsStr('');
    setTakeawaysStr('');
    setIsAddModalOpen(false);
  };

  const getTypeLabel = (t: KnowledgeResource['type']) => {
    switch (t) {
      case 'book': return 'کتاب';
      case 'course': return 'دوره آموزشی';
      case 'video': return 'ویدیو';
      case 'article': return 'مقاله';
      case 'documentation': return 'مستندات فنی';
      case 'cheatsheet': return 'برگه تقلب / جزوه';
      default: return 'منبع';
    }
  };

  const getStatusLabel = (s: KnowledgeResource['status']) => {
    switch (s) {
      case 'completed': return 'مطالعه شده';
      case 'in_progress': return 'در حال مطالعه';
      case 'archived': return 'بایگانی';
      default: return 'شروع نشده';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,245,255,0.2)]">
                <Library className="w-5 h-5 text-cyan-400" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                کتابخانه و مدیریت دانش شخصی (Knowledge Hub)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              یکپارچه‌سازی کتب درسی، دوره‌های آموزشی، جزوات، مقالات علمی و مستندات فنی
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت منبع جدید</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[#263247]">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام منبع، مؤلف، برچسب‌ها..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
            />
          </div>

          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
          >
            <option value="all">همه بخش‌ها (مدرسه، مهارت، پروژه، مسابقه)</option>
            <option value="school">مدرسه و درس‌ها</option>
            <option value="skill">توسعه مهارت‌ها</option>
            <option value="project">پروژه‌ها</option>
            <option value="competition">مسابقات</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
          >
            <option value="all">همه فرمت‌ها</option>
            <option value="book">کتاب</option>
            <option value="course">دوره آموزشی</option>
            <option value="article">مقاله</option>
            <option value="documentation">مستندات فنی</option>
            <option value="video">ویدیو</option>
            <option value="cheatsheet">جزوه / برگه خلاصه</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#263247] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-cyan-400" />
            منابع ثبت‌شده در کتابخانه
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {toPersianDigits(sortedResources.length)} منبع
          </span>
        </div>

        {sortedResources.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <p>منبعی مطابق با جستجو یا فیلترهای فعلی یافت نشد.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold"
            >
              + ثبت اولین منبع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedResources.map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-xl border transition-all text-right flex flex-col justify-between ${
                  res.pinned
                    ? 'bg-cyan-500/5 dark:bg-[#0D1220] border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.12)]'
                    : 'bg-white dark:bg-[#0D1220] border-slate-200 dark:border-[#263247] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {getTypeLabel(res.type)}
                      </span>
                      {res.linkedEntityName && (
                        <span className="text-[10px] text-slate-400">
                          {res.linkedEntityName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleResourcePinned(res.id)}
                        className={`p-1 rounded cursor-pointer ${
                          res.pinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                        }`}
                        title={res.pinned ? 'برداشتن سنجاق' : 'سنجاق به بالای کتابخانه'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteResource(res.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="حذف منبع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
                    {res.title}
                  </h3>

                  {res.authorOrInstructor && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      مؤلف / مدرس: {res.authorOrInstructor}
                    </p>
                  )}

                  {res.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {res.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {(res.tags || []).length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                      {res.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] text-slate-400 bg-slate-100 dark:bg-[#172033] px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress bar and link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#263247]/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{getStatusLabel(res.status)}</span>
                    <span className="font-mono text-cyan-400">{toPersianDigits(res.progressPercentage || 0)}٪</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#172033] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      style={{ width: `${res.progressPercentage || 0}%` }}
                    />
                  </div>

                  {res.url && (
                    <div className="mt-2.5 flex justify-end">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>مشاهده منبع آنلاین</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#263247] p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263247] mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                ثبت منبع آموزشی در کتابخانه
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان کتاب یا منبع:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: کتاب حسابان پیشرفته مبتکران"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    قالب منبع:
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="book">کتاب / کتاب الکترونیک</option>
                    <option value="course">دوره آموزشی</option>
                    <option value="article">مقاله علمی</option>
                    <option value="documentation">مستندات فنی</option>
                    <option value="video">ویدیو و لکچر</option>
                    <option value="cheatsheet">جزوه و فرمول‌نامه</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    مؤلف یا مدرس:
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="نام نویسنده..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    بخش مرتبط:
                  </label>
                  <select
                    value={section}
                    onChange={(e) => {
                      setSection(e.target.value as SectionType);
                      setLinkedEntityId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="school">مدرسه و درس‌ها</option>
                    <option value="skill">توسعه مهارت‌ها</option>
                    <option value="project">پروژه</option>
                    <option value="competition">مسابقات</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    انتخاب درس یا مهارت:
                  </label>
                  <select
                    value={linkedEntityId}
                    onChange={(e) => setLinkedEntityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="">بدون وابستگی خاص</option>
                    {section === 'school' &&
                      subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    {section === 'skill' &&
                      skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    {section === 'project' &&
                      projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    {section === 'competition' &&
                      competitions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    وضعیت مطالعه:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                  >
                    <option value="not_started">شروع نشده</option>
                    <option value="in_progress">در حال مطالعه</option>
                    <option value="completed">تکمیل و مطالعه شده</option>
                    <option value="archived">بایگانی</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    درصد پیشرفت (۰ تا ۱۰۰):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  آدرس اینترنتی یا لینک دسترسی:
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  برچسب‌ها (با کاما جدا کنید):
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="هندسه, کنکور, فصل۲..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نکات و خلاصه‌ها:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مهم‌ترین ویژگی‌های این منبع و سرفصل‌ها..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-[#263247] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263247]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_12px_rgba(0,245,255,0.25)]"
                >
                  ثبت منبع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
