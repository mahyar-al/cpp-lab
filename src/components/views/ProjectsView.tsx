import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Calendar,
  Layers,
  List,
  Bug,
  FileCode,
  X,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatJalaliShort, toPersianDigits } from '../../utils/jalali';
import { Priority, Project, ProjectStatus } from '../../types';

const STATUS_COLUMNS: { id: ProjectStatus; label: string; color: string }[] = [
  { id: 'ideas', label: 'ایده‌ها', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'todo', label: 'برای انجام', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'in_progress', label: 'در حال انجام', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'waiting', label: 'در انتظار / تست', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'completed', label: 'تکمیل‌شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
];

export const ProjectsView: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addProjectTask,
    updateProjectTaskStatus,
    deleteProjectTask,
    toggleProjectSubtask,
    addProjectSubtask,
    addProjectBug,
    toggleProjectBug,
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'bugs' | 'tech_notes'>('kanban');

  // Modals & form state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('وب و فول‌استک');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('in_progress');
  const [newTechStack, setNewTechStack] = useState('React, TypeScript, Tailwind');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDeadline, setNewDeadline] = useState('2026-12-01');
  const [newGithub, setNewGithub] = useState('');
  const [newDemo, setNewDemo] = useState('');
  const [newTargets, setNewTargets] = useState('');

  // Quick Task add in active project
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<ProjectStatus>('todo');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskEstHours, setNewTaskEstHours] = useState(3);

  // Quick Bug add
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<Priority>('high');

  // New subtask
  const [selectedTaskIdForSubtask, setSelectedTaskIdForSubtask] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProject({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      startDate: newStartDate,
      deadline: newDeadline,
      status: newStatus,
      priority: newPriority,
      targetsAndDeliverables: newTargets || 'تحویل نسخه آلفا و استقرار روی سرور',
      progressPercentage: 15,
      techStack: newTechStack.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl: newGithub || undefined,
      demoUrl: newDemo || undefined,
      techNotes: 'معماری بر پایه کامپوننت‌های ماژولار طراحی شده است.',
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddProjectModal(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newTaskTitle.trim()) return;

    addProjectTask(activeProject.id, {
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      priority: newTaskPriority,
      estimatedHours: Number(newTaskEstHours) || 2,
    });

    setNewTaskTitle('');
  };

  const handleAddBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newBugTitle.trim()) return;

    addProjectBug(activeProject.id, newBugTitle.trim(), newBugSeverity);
    setNewBugTitle('');
  };

  const handleAddSubtask = (taskId: string) => {
    if (!activeProject || !newSubtaskTitle.trim()) return;
    addProjectSubtask(activeProject.id, taskId, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setSelectedTaskIdForSubtask(null);
  };

  const calculateRealProjectProgress = (proj: Project): number => {
    if (!proj.tasks || proj.tasks.length === 0) return proj.progressPercentage || 0;
    const totalUnits = proj.tasks.reduce((acc, t) => acc + 1 + (t.subtasks?.length || 0), 0);
    if (totalUnits === 0) return proj.progressPercentage || 0;
    const completedUnits = proj.tasks.reduce((acc, t) => {
      const taskDone = t.status === 'completed' ? 1 : 0;
      const subDone = (t.subtasks || []).filter((st) => st.done).length;
      return acc + taskDone + subDone;
    }, 0);
    return Math.round((completedUnits / totalUnits) * 100);
  };

  const calculateProjectHours = (proj: Project) => {
    const est = proj.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const actual = proj.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    return { est, actual };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <FolderGit2 className="w-5 h-5" />
            </span>
            مدیریت پروژه‌ها
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            برد کانبان، پیگیری وظایف، ددلاین‌ها و مستندات فنی
          </p>
        </div>
        <button
          onClick={() => setShowAddProjectModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>پروژه جدید</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FolderGit2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">هنوز پروژه‌ای ثبت نشده است</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">اولین پروژه خود را برای سازماندهی وظایف و مراحل کار ایجاد کنید.</p>
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
          >
            افزودن اولین پروژه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start w-full">
          {/* Project Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3 2xl:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              پروژه‌ها ({toPersianDigits(projects.length)})
            </h2>
            <div className="space-y-3 max-h-72 lg:max-h-none overflow-y-auto cyber-scrollbar pr-0.5">
            {projects.map((proj) => {
              const isSelected = activeProject && activeProject.id === proj.id;
              const { est, actual } = calculateProjectHours(proj);
              const openBugs = proj.knownBugs.filter((b) => !b.resolved).length;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800 border-slate-400 dark:border-slate-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {proj.category}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {proj.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      STATUS_COLUMNS.find((s) => s.id === proj.status)?.color
                    }`}>
                      {STATUS_COLUMNS.find((s) => s.id === proj.status)?.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
                    {proj.description}
                  </p>

                  <div className="mt-3">
                    {(() => {
                      const realProg = calculateRealProjectProgress(proj);
                      return (
                        <>
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span>پیشرفت واقعی (بر مبنای تسک‌ها)</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">{toPersianDigits(realProg)}٪</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${realProg}%` }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{toPersianDigits(proj.tasks.length)} وظیفه</span>
                    {openBugs > 0 ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <Bug className="w-3 h-3" />
                        {toPersianDigits(openBugs)} باگ باز
                      </span>
                    ) : (
                      <span>ددلاین: {formatJalaliShort(proj.deadline)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Active Project Workspace */}
          {activeProject && (
            <div className="lg:col-span-8 xl:col-span-9 2xl:col-span-9 space-y-6 min-w-0">
              {/* Project Card Info */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {activeProject.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        شروع: {formatJalaliShort(activeProject.startDate)} | مهلت: {formatJalaliShort(activeProject.deadline)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {activeProject.title}
                    </h2>
                  </div>

                  {/* Actions & Links */}
                  <div className="flex items-center gap-2">
                    {activeProject.githubUrl && (
                      <a
                        href={activeProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        title="گیت‌هاب"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {activeProject.demoUrl && (
                      <a
                        href={activeProject.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600"
                        title="دموی آنلاین"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف پروژه «${activeProject.title}» اطمینان دارید؟`)) {
                          deleteProject(activeProject.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="حذف پروژه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeProject.description}
                </p>

                {/* Tech Stack tags */}
                {activeProject.techStack.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-slate-400 font-semibold pl-1">پشته فناوری:</span>
                    {activeProject.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress bar controller */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>درصد پیشرفت</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {toPersianDigits(activeProject.progressPercentage)}٪
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeProject.progressPercentage}
                      onChange={(e) => updateProject(activeProject.id, { progressPercentage: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="text-left text-xs text-slate-500">
                    <span>خروجی مورد انتظار:</span>
                    <span className="block font-medium text-slate-700 dark:text-slate-300">
                      {activeProject.targetsAndDeliverables}
                    </span>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 pt-2">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    برد کانبان
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    فهرست وظایف ({toPersianDigits(activeProject.tasks.length)})
                  </button>
                  <button
                    onClick={() => setViewMode('bugs')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      viewMode === 'bugs'
                        ? 'bg-red-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    باگ‌ها و مسائل ({toPersianDigits(activeProject.knownBugs.length)})
                  </button>
                  <button
                    onClick={() => setViewMode('tech_notes')}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      viewMode === 'tech_notes'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    یادداشت‌های فنی
                  </button>
                </div>

                {/* View 1: Kanban Board */}
                {viewMode === 'kanban' && (
                  <div className="space-y-4">
                    {/* Quick Add Task */}
                    <form onSubmit={handleAddTask} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="عنوان وظیفه جدید برای این پروژه..."
                        className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <select
                        value={newTaskStatus}
                        onChange={(e) => setNewTaskStatus(e.target.value as ProjectStatus)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="ideas">ایده</option>
                        <option value="todo">برای انجام</option>
                        <option value="in_progress">در حال انجام</option>
                        <option value="waiting">در انتظار</option>
                        <option value="completed">تکمیل‌شده</option>
                      </select>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="low">اولویت پایین</option>
                        <option value="medium">اولویت متوسط</option>
                        <option value="high">اولویت بالا</option>
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        افزودن
                      </button>
                    </form>

                    {/* Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pb-2 w-full">
                      {STATUS_COLUMNS.map((col) => {
                        const colTasks = activeProject.tasks.filter((t) => t.status === col.id);

                        return (
                          <div
                            key={col.id}
                            className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col min-w-[170px]"
                          >
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {col.label}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {toPersianDigits(colTasks.length)}
                              </span>
                            </div>

                            <div className="space-y-2 flex-1">
                              {colTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 text-xs"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                      {task.title}
                                    </span>
                                    <button
                                      onClick={() => deleteProjectTask(activeProject.id, task.id)}
                                      className="text-slate-400 hover:text-red-500"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Subtasks summary */}
                                  {task.subtasks.length > 0 && (
                                    <div className="space-y-1">
                                      {task.subtasks.map((st) => (
                                        <div
                                          key={st.id}
                                          onClick={() => toggleProjectSubtask(activeProject.id, task.id, st.id)}
                                          className="flex items-center gap-1.5 cursor-pointer text-[11px]"
                                        >
                                          <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                                            st.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                                          }`}>
                                            {st.done && <CheckCircle2 className="w-2.5 h-2.5" />}
                                          </div>
                                          <span className={st.done ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}>
                                            {st.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Move task dropdown */}
                                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <select
                                      value={task.status}
                                      onChange={(e) => updateProjectTaskStatus(activeProject.id, task.id, e.target.value as ProjectStatus)}
                                      className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-400"
                                    >
                                      <option value="ideas">ایده</option>
                                      <option value="todo">برای انجام</option>
                                      <option value="in_progress">در حال انجام</option>
                                      <option value="waiting">در انتظار</option>
                                      <option value="completed">تکمیل</option>
                                    </select>
                                    <span className="text-[10px] text-slate-400">
                                      {toPersianDigits(task.estimatedHours || 1)} ساعت
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View 2: Task List */}
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {activeProject.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                              {task.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              STATUS_COLUMNS.find((s) => s.id === task.status)?.color
                            }`}>
                              {STATUS_COLUMNS.find((s) => s.id === task.status)?.label}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-slate-500">{task.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => updateProjectTaskStatus(activeProject.id, task.id, e.target.value as ProjectStatus)}
                            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                          >
                            <option value="ideas">ایده</option>
                            <option value="todo">برای انجام</option>
                            <option value="in_progress">در حال انجام</option>
                            <option value="waiting">در انتظار بررسی</option>
                            <option value="completed">تکمیل‌شده</option>
                          </select>
                          <button
                            onClick={() => deleteProjectTask(activeProject.id, task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View 3: Bug Tracker */}
                {viewMode === 'bugs' && (
                  <div className="space-y-4">
                    <form onSubmit={handleAddBug} className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex gap-2">
                      <input
                        type="text"
                        value={newBugTitle}
                        onChange={(e) => setNewBugTitle(e.target.value)}
                        placeholder="گزارش باگ یا اشکال فنی در پروژه..."
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <select
                        value={newBugSeverity}
                        onChange={(e) => setNewBugSeverity(e.target.value as Priority)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <option value="high">شدت بالا (بحرانی)</option>
                        <option value="medium">شدت متوسط</option>
                        <option value="low">شدت پایین</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        ثبت باگ
                      </button>
                    </form>

                    <div className="space-y-2">
                      {activeProject.knownBugs.length === 0 ? (
                        <p className="text-xs text-slate-400">هیچ باگی گزارش نشده است.</p>
                      ) : (
                        activeProject.knownBugs.map((bug) => (
                          <div
                            key={bug.id}
                            onClick={() => toggleProjectBug(activeProject.id, bug.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs ${
                              bug.resolved
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 line-through text-slate-400'
                                : 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                bug.resolved ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-red-400'
                              }`}>
                                {bug.resolved && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className="font-semibold">{bug.title}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              bug.resolved
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/40'
                            }`}>
                              {bug.resolved ? 'برطرف‌شده' : 'در انتظار رفع'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* View 4: Tech Notes */}
                {viewMode === 'tech_notes' && (
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500 font-semibold block">
                      یادداشت‌های فنی، تصمیمات معماری و مستندات API:
                    </label>
                    <textarea
                      rows={6}
                      value={activeProject.techNotes}
                      onChange={(e) => updateProject(activeProject.id, { techNotes: e.target.value })}
                      placeholder="تصمیم‌های کلیدی، قراردادهای دیتابیس یا آدرس‌های API را اینجا بنویسید..."
                      className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-400">تغییرات به صورت خودکار در حافظه مرورگر ذخیره می‌شوند.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                تعریف پروژه نرم‌افزاری جدید
              </h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  نام پروژه:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: ربات تلگرام یا وب‌سایت شخصی"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیح مختصر:
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="هدف و کارکرد این پروژه..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">دسته‌بندی:</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">پشته فناوری (با کاما):</label>
                  <input
                    type="text"
                    value={newTechStack}
                    onChange={(e) => setNewTechStack(e.target.value)}
                    placeholder="React, Node.js, SQL"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">تاریخ ددلاین:</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">لینک گیت‌هاب (اختیاری):</label>
                  <input
                    type="text"
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  ایجاد پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
