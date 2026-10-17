import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile,
  SchoolSubject,
  SubjectGrade,
  WeeklyTimetableCell,
  SchoolHomework,
  SchoolExamItem,
  DaySpecificData,
  StudySession,
  Skill,
  Project,
  Competition,
  Goal,
  WeeklyReview,
  CalendarEvent,
  Note,
  ActivityLogItem,
  ReminderNotification,
  DayRating,
  ProjectStatus,
  Priority,
  SectionType,
  Habit,
  DashboardWidgetConfig,
  SpacedReviewItem,
  KnowledgeResource,
  QuickInboxItem,
  TaskItem,
  TaskSubtask,
  ReviewLogEntry,
  AuthUser,
  SyncStatus,
  TrashItem,
  NavTab,
  UserCustomization,
  ThemeMode,
  AccentColor,
  FontSize,
  LayoutDensity,
  UserRPGState,
  Quest,
  Achievement,
  RescueModeType,
  RescuePlan,
  ScheduleSimulation,
  ActiveFocusSession,
} from '../types';
import {
  initialProfile,
  initialSubjects,
  initialGrades,
  initialWeeklyCells,
  initialDayDataMap,
  initialHomeworks,
  initialExams,
  initialStudySessions,
  initialSkills,
  initialProjects,
  initialCompetitions,
  initialGoals,
  initialWeeklyReviews,
  initialCalendarEvents,
  initialNotes,
  initialActivityLogs,
  initialNotifications,
  initialHabits,
  initialWidgetConfig,
  initialReviews,
  initialResources,
  initialInboxItems,
  DEFAULT_SECTION_NAMES,
  DEFAULT_NAV_ORDER,
  DEFAULT_DASHBOARD_CARDS,
  initialCustomization,
  initialRPGState,
} from '../utils/initialData';
import { toPersianDigits } from '../utils/jalali';
import {
  getStoredToken,
  setStoredToken,
  apiGetMe,
  apiLogin,
  apiRegister,
  apiUpdateProfile,
  apiChangePassword,
  apiResetPassword,
  apiCheckAvailability,
  apiForgotPasswordRequest,
  apiResetPasswordToken,
  apiDeleteAccount,
  apiFetchUserData,
  apiSaveUserData,
  apiGetSnapshots,
  apiRestoreSnapshot,
  apiCreateSnapshot,
  apiExportBackup,
  apiImportBackup,
  apiGenerateSmartPlan,
  apiGenerateRescuePlan,
  apiAwardXP,
} from '../utils/api';

const STORAGE_KEY = 'pathly_app_data_v3_clean';

export interface AppContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // School
  subjects: SchoolSubject[];
  grades: SubjectGrade[];
  weeklyCells: WeeklyTimetableCell[];
  dayData: Record<number, DaySpecificData>;
  homeworks: SchoolHomework[];
  exams: SchoolExamItem[];
  addSubject: (subject: Omit<SchoolSubject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<SchoolSubject>) => void;
  deleteSubject: (id: string) => void;
  addGrade: (grade: Omit<SubjectGrade, 'id'>) => void;
  deleteGrade: (id: string) => void;
  updateWeeklyCell: (cell: WeeklyTimetableCell) => void;
  clearWeeklyCell: (dayIndex: number, period: number) => void;
  updateDayData: (dayIndex: number, updates: Partial<DaySpecificData>) => void;
  addPreSchoolTask: (dayIndex: number, title: string, priority?: Priority, dueTime?: string) => void;
  togglePreSchoolTask: (dayIndex: number, taskId: string) => void;
  deletePreSchoolTask: (dayIndex: number, taskId: string) => void;
  addPostSchoolTask: (dayIndex: number, title: string, priority?: Priority, dueTime?: string) => void;
  togglePostSchoolTask: (dayIndex: number, taskId: string) => void;
  deletePostSchoolTask: (dayIndex: number, taskId: string) => void;
  setDayRating: (dayIndex: number, rating: DayRating) => void;
  addHomework: (hw: Omit<SchoolHomework, 'id'>) => void;
  updateHomework: (id: string, updates: Partial<SchoolHomework>) => void;
  toggleHomework: (id: string) => void;
  deleteHomework: (id: string) => void;
  addExam: (exam: Omit<SchoolExamItem, 'id'>) => void;
  updateExam: (id: string, updates: Partial<SchoolExamItem>) => void;
  toggleExam: (id: string) => void;
  deleteExam: (id: string) => void;

  // Study Sessions & Pomodoro
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  deleteStudySession: (id: string) => void;

  // Skills
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'id' | 'streak' | 'activeDates'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  toggleSkillRoadmapStep: (skillId: string, stepId: string) => void;
  addSkillRoadmapStep: (skillId: string, title: string, description?: string) => void;
  logSkillPractice: (skillId: string, minutes: number, notes: string) => void;
  addSkillWeakness: (skillId: string, weakness: string) => void;
  removeSkillWeakness: (skillId: string, index: number) => void;
  addSkillResource: (skillId: string, res: { title: string; type: 'course'|'book'|'article'|'video'; url?: string }) => void;
  toggleSkillResource: (skillId: string, resId: string) => void;
  addSkillExercise: (skillId: string, title: string, dueDate?: string) => void;
  toggleSkillExercise: (skillId: string, exId: string) => void;

  // Projects
  projects: Project[];
  addProject: (proj: Omit<Project, 'id' | 'tasks' | 'knownBugs' | 'activityLogs'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectTask: (projectId: string, task: { title: string; status: ProjectStatus; priority: Priority; dueDate?: string; estimatedHours?: number; notes?: string }) => void;
  updateProjectTaskStatus: (projectId: string, taskId: string, status: ProjectStatus) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  toggleProjectSubtask: (projectId: string, taskId: string, subtaskId: string) => void;
  addProjectSubtask: (projectId: string, taskId: string, title: string) => void;
  addProjectBug: (projectId: string, title: string, severity: Priority) => void;
  toggleProjectBug: (projectId: string, bugId: string) => void;

  // Competitions
  competitions: Competition[];
  addCompetition: (comp: Omit<Competition, 'id'>) => void;
  updateCompetition: (id: string, updates: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
  toggleCompetitionStage: (compId: string, stageId: string) => void;
  toggleCompetitionTopic: (compId: string, topicId: string) => void;
  addCompetitionTopic: (compId: string, title: string) => void;
  addCompetitionMockExam: (compId: string, exam: { title: string; score: number; maxScore: number; date: string; notes?: string }) => void;
  updateSolvedProblems: (compId: string, delta: number) => void;
  addCompetitionWeakness: (compId: string, weakness: string) => void;
  removeCompetitionWeakness: (compId: string, index: number) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  addGoalMilestone: (goalId: string, title: string) => void;

  // Weekly Reviews
  weeklyReviews: WeeklyReview[];
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleCalendarEventCompleted: (id: string) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNotePinned: (id: string) => void;

  // Activity Logs
  activityLogs: ActivityLogItem[];
  addActivityLog: (section: SectionType, description: string) => void;

  // Notifications
  notifications: ReminderNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;

  // Habits & Smart Planning
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => void;
  toggleHabitToday: (habitId: string, dateIso?: string) => void;
  deleteHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;

  // Spaced Repetition & Reviews
  reviews: SpacedReviewItem[];
  addReviewItem: (item: Omit<SpacedReviewItem, 'id' | 'intervalDays' | 'repetitionCount' | 'reviewLogs'>) => void;
  updateReviewItem: (id: string, updates: Partial<SpacedReviewItem>) => void;
  deleteReviewItem: (id: string) => void;
  submitReviewOutcome: (id: string, rating: 'easy' | 'good' | 'hard' | 'forgotten', notes?: string) => void;

  // Knowledge & Resource Library
  resources: KnowledgeResource[];
  addResource: (res: Omit<KnowledgeResource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, updates: Partial<KnowledgeResource>) => void;
  deleteResource: (id: string) => void;
  toggleResourcePinned: (id: string) => void;

  // Quick Notes & Brain Inbox
  inboxItems: QuickInboxItem[];
  addInboxItem: (content: string, title?: string, priority?: Priority, category?: SectionType, dueDate?: string) => void;
  updateInboxItem: (id: string, updates: Partial<QuickInboxItem>) => void;
  deleteInboxItem: (id: string) => void;
  convertInboxToTask: (inboxId: string, targetType: 'task' | 'homework' | 'project_task' | 'goal' | 'note', targetData?: any) => void;

  // Advanced Daily Planning & Subtasks
  addPlannedTask: (task: Omit<TaskItem, 'id'>, dayIndex?: number) => void;
  updatePlannedTask: (taskId: string, dayIndex: number, updates: Partial<TaskItem>) => void;
  deletePlannedTask: (taskId: string, dayIndex: number) => void;
  toggleTaskSubtask: (dayIndex: number, taskId: string, subtaskId: string) => void;
  addTaskSubtask: (dayIndex: number, taskId: string, title: string) => void;
  rescheduleTask: (taskId: string, fromDayIndex: number, toDayIndex: number, newTime?: string) => void;

  // Widget Customization
  widgetConfig: DashboardWidgetConfig;
  updateWidgetConfig: (updates: Partial<DashboardWidgetConfig>) => void;

  // Smart Planning Action
  rolloverOverdueTasks: () => void;

  // UI Toast Feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // System & Export
  exportBackup: () => void;
  importBackup: (jsonData: string) => boolean;
  validateBackupData: (jsonData: string) => { valid: boolean; summary?: Record<string, number>; error?: string };
  exportTasksCSV: () => void;
  exportStudySessionsCSV: () => void;
  exportGradesCSV: () => void;
  exportSkillsCSV: () => void;
  resetToDefault: () => void;
  clearAllData: () => void;

  // Multi-User & Server Sync
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  syncStatus: SyncStatus;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'login' | 'register' | 'recovery';
  openAuthModal: (tab?: 'login' | 'register' | 'recovery') => void;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (email: string, username: string, name: string, pass: string, question?: string, answer?: string) => Promise<void>;
  logout: () => void;
  updateAuthProfile: (payload: { name?: string; avatarUrl?: string; securityQuestion?: string; securityAnswer?: string }) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<void>;
  resetPassword: (identifier: string, answer: string, newPass: string) => Promise<void>;
  requestPasswordResetToken: (identifier: string) => Promise<{
    success: boolean;
    message: string;
    securityQuestion: string;
    maskedEmail: string;
    expiresInMinutes: number;
    mockVerificationToken?: string;
    infrastructureStatus: { smtpConfigured: boolean; mode: string; notice: string };
  }>;
  resetPasswordWithToken: (identifier: string, token: string, newPass: string) => Promise<void>;
  checkAvailability: (params: { email?: string; username?: string }) => Promise<{ emailAvailable?: boolean; usernameAvailable?: boolean }>;
  deleteAccount: (pass: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
  serverSnapshots: Array<{ id: string; createdAt: string; reason: string }>;
  refreshSnapshots: () => Promise<void>;
  restoreServerSnapshot: (snapshotId: string) => Promise<boolean>;
  exportServerBackup: () => Promise<void>;
  importServerBackup: (backupData: any) => Promise<boolean>;
  createManualSnapshot: (reason?: string) => Promise<boolean>;
  trash: TrashItem[];
  restoreFromTrash: (trashId: string) => void;
  emptyTrash: () => void;
  deleteFromTrashPermanently: (trashId: string) => void;

  // Full User Customization & Theme System
  customization: UserCustomization;
  updateCustomization: (updates: Partial<UserCustomization>, notify?: boolean) => void;
  resetCustomization: (part?: 'all' | 'names' | 'appearance' | 'dashboard' | 'nav') => void;
  getSectionTitle: (tab: NavTab) => string;
  themeMode: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setThemeMode: (mode: ThemeMode, notify?: boolean) => void;

  // Life RPG Gamification
  rpg: UserRPGState;
  awardXP: (eventId: string, amount: number, reason: string) => Promise<void>;
  toggleRPG: (enabled: boolean) => void;

  // Rescue Mode
  rescuePlan: RescuePlan | null;
  isRescueModalOpen: boolean;
  setIsRescueModalOpen: (open: boolean) => void;
  generateRescuePlan: (mode: RescueModeType) => Promise<RescuePlan | null>;
  applyRescuePlan: (plan: RescuePlan) => void;
  clearRescuePlan: () => void;

  // Smart Daily Planning & Feasibility Simulation
  smartSchedule: any[];
  simulationResult: ScheduleSimulation | null;
  generateSmartSchedule: (availableMinutes?: number, startTime?: string, focusGoal?: string) => Promise<any>;
  applyProposedSchedule: (schedule: any[]) => void;
  simulateSchedule: (tasks: TaskItem[], availableMinutes: number) => ScheduleSimulation;

  // Active Focus Session (Persistent across reload)
  activeFocus: ActiveFocusSession | null;
  startActiveFocus: (params: { taskId?: string; taskTitle: string; section: SectionType; targetMinutes: number; mode: 'work' | 'short_break' | 'long_break' }) => void;
  pauseActiveFocus: () => void;
  resumeActiveFocus: () => void;
  tickActiveFocus: (elapsedSeconds: number) => void;
  finishActiveFocus: (actualMinutes?: number, focusScore?: number) => void;
  cancelActiveFocus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getDefaultData = () => ({
    profile: initialProfile,
    subjects: initialSubjects,
    grades: initialGrades,
    weeklyCells: initialWeeklyCells,
    dayData: initialDayDataMap,
    homeworks: initialHomeworks,
    exams: initialExams,
    studySessions: initialStudySessions,
    skills: initialSkills,
    projects: initialProjects,
    competitions: initialCompetitions,
    goals: initialGoals,
    weeklyReviews: initialWeeklyReviews,
    calendarEvents: initialCalendarEvents,
    notes: initialNotes,
    activityLogs: initialActivityLogs,
    notifications: initialNotifications,
    habits: initialHabits,
    reviews: initialReviews,
    resources: initialResources,
    inboxItems: initialInboxItems,
    widgetConfig: initialWidgetConfig,
    trash: [] as TrashItem[],
    rpg: initialRPGState,
    activeFocus: null as ActiveFocusSession | null,
    rescuePlan: null as RescuePlan | null,
    smartSchedule: [] as any[],
  });

  const loadInitialData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          profile: {
            ...initialProfile,
            ...(parsed.profile || {}),
            customization: {
              ...initialCustomization,
              ...(parsed.profile?.customization || {}),
              sectionNames: {
                ...DEFAULT_SECTION_NAMES,
                ...(parsed.profile?.customization?.sectionNames || {}),
              },
            },
          },
          subjects: parsed.subjects ?? initialSubjects,
          grades: parsed.grades ?? initialGrades,
          weeklyCells: parsed.weeklyCells ?? initialWeeklyCells,
          dayData: parsed.dayData ?? initialDayDataMap,
          homeworks: parsed.homeworks ?? initialHomeworks,
          exams: parsed.exams ?? initialExams,
          studySessions: parsed.studySessions ?? initialStudySessions,
          skills: parsed.skills ?? initialSkills,
          projects: parsed.projects ?? initialProjects,
          competitions: parsed.competitions ?? initialCompetitions,
          goals: parsed.goals ?? initialGoals,
          weeklyReviews: parsed.weeklyReviews ?? initialWeeklyReviews,
          calendarEvents: parsed.calendarEvents ?? initialCalendarEvents,
          notes: parsed.notes ?? initialNotes,
          activityLogs: parsed.activityLogs ?? initialActivityLogs,
          notifications: parsed.notifications ?? initialNotifications,
          habits: parsed.habits ?? initialHabits,
          reviews: parsed.reviews ?? initialReviews,
          resources: parsed.resources ?? initialResources,
          inboxItems: parsed.inboxItems ?? initialInboxItems,
          widgetConfig: parsed.widgetConfig ? { ...initialWidgetConfig, ...parsed.widgetConfig } : initialWidgetConfig,
          trash: parsed.trash ?? [],
          rpg: parsed.rpg ? { ...initialRPGState, ...parsed.rpg } : initialRPGState,
          activeFocus: parsed.activeFocus ?? null,
          rescuePlan: parsed.rescuePlan ?? null,
          smartSchedule: parsed.smartSchedule ?? [],
        };
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
    return getDefaultData();
  };

  const [state, setState] = useState(loadInitialData);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'register' | 'recovery'>('login');

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'recovery' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  }, []);
  const [serverSnapshots, setServerSnapshots] = useState<Array<{ id: string; createdAt: string; reason: string }>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // Initialize session and pull persistent user records from server
  useEffect(() => {
    let active = true;

    const bootstrapAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        if (active) {
          setAuthLoading(false);
          setSyncStatus('offline');
        }
        return;
      }

      try {
        const meRes = await apiGetMe();
        if (!active) return;
        setCurrentUser(meRes.user);

        // Fetch latest server database state
        const dataRes = await apiFetchUserData();
        if (!active) return;
        if (dataRes.exists && dataRes.data) {
          setState(dataRes.data);
          setSyncStatus('synced');
        } else {
          // First time user data initialization on server
          await apiSaveUserData(state);
          setSyncStatus('synced');
        }

        try {
          const snapRes = await apiGetSnapshots();
          if (active && snapRes.snapshots) {
            setServerSnapshots(snapRes.snapshots);
          }
        } catch {}
      } catch (err) {
        console.warn('Auth token expired or invalid:', err);
        setStoredToken(null);
        if (active) {
          setCurrentUser(null);
          setSyncStatus('offline');
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    bootstrapAuth();

    const handleExpired = () => {
      setCurrentUser(null);
      setSyncStatus('offline');
    };
    window.addEventListener('pathly_auth_expired', handleExpired);

    return () => {
      active = false;
      window.removeEventListener('pathly_auth_expired', handleExpired);
    };
  }, []);

  // Per-user local storage caching
  useEffect(() => {
    try {
      const cacheKey = currentUser ? `pathly_app_data_user_${currentUser.id}` : STORAGE_KEY;
      localStorage.setItem(cacheKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to cache state locally:', e);
    }
  }, [state, currentUser]);

  // Real-time debounced synchronization to permanent server database
  useEffect(() => {
    if (!currentUser || authLoading) return;
    setSyncStatus('syncing');

    const timer = setTimeout(async () => {
      try {
        await apiSaveUserData(state);
        setSyncStatus('synced');
      } catch (err) {
        console.error('Auto-save to server failed:', err);
        setSyncStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [state, currentUser, authLoading]);

  // Customization derived state
  const customization: UserCustomization = {
    ...initialCustomization,
    ...(state.profile?.customization || {}),
    sectionNames: {
      ...DEFAULT_SECTION_NAMES,
      ...(state.profile?.customization?.sectionNames || {}),
    },
    hiddenSections: state.profile?.customization?.hiddenSections || [],
    navOrder: state.profile?.customization?.navOrder?.length
      ? state.profile.customization.navOrder
      : [...initialCustomization.navOrder],
    themeMode: (state.profile?.customization?.themeMode as ThemeMode) || (state.profile?.theme as ThemeMode) || 'dark',
    accentColor: state.profile?.customization?.accentColor || 'amber',
    secondaryAccent: state.profile?.customization?.secondaryAccent || 'emerald',
    borderRadius: state.profile?.customization?.borderRadius || 'medium',
    glowIntensity: state.profile?.customization?.glowIntensity || 'none',
    fontSize: state.profile?.customization?.fontSize || 'normal',
    density: state.profile?.customization?.density || 'comfortable',
    dashboardCardsOrder: state.profile?.customization?.dashboardCardsOrder?.length
      ? state.profile.customization.dashboardCardsOrder
      : [...initialCustomization.dashboardCardsOrder],
    hiddenDashboardCards: state.profile?.customization?.hiddenDashboardCards || [],
    dashboardColumns: state.profile?.customization?.dashboardColumns || 'auto',
  };

  const currentThemeMode: ThemeMode = customization.themeMode;

  // OS Dark mode listener for 'system' theme preference
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const resolvedTheme: 'dark' | 'light' =
    currentThemeMode === 'system'
      ? (systemPrefersDark ? 'dark' : 'light')
      : currentThemeMode === 'light'
      ? 'light'
      : 'dark';

  // Sync theme, accent color, font size, density, border radius, and glow to the HTML element
  useEffect(() => {
    const isDark = resolvedTheme === 'dark';

    // Temporary smooth transition class
    document.documentElement.classList.add('theme-transitioning');
    const transitionTimer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 250);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = 'var(--bg)';
      document.documentElement.style.color = 'var(--text)';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = 'var(--bg)';
      document.documentElement.style.color = 'var(--text)';
    }

    document.documentElement.setAttribute('data-theme', currentThemeMode);
    document.documentElement.setAttribute('data-resolved-theme', resolvedTheme);
    document.documentElement.setAttribute('data-accent', customization.accentColor);
    document.documentElement.setAttribute('data-secondary-accent', customization.secondaryAccent || 'violet');
    document.documentElement.setAttribute('data-border-radius', customization.borderRadius || 'medium');
    document.documentElement.setAttribute('data-glow', customization.glowIntensity || 'subtle');
    document.documentElement.setAttribute('data-font-size', customization.fontSize);
    document.documentElement.setAttribute('data-density', customization.density);

    // Save standalone preference immediately for next load / anti-flash
    try {
      localStorage.setItem('pathly_theme_mode', currentThemeMode);
      localStorage.setItem('pathly_accent_color', customization.accentColor);
    } catch {}

    return () => clearTimeout(transitionTimer);
  }, [
    resolvedTheme,
    currentThemeMode,
    customization.accentColor,
    customization.secondaryAccent,
    customization.borderRadius,
    customization.glowIntensity,
    customization.fontSize,
    customization.density,
  ]);

  const setThemeMode = useCallback((newMode: ThemeMode, notify: boolean = false) => {
    setState((prev: any) => {
      const currentCust = prev.profile?.customization || initialCustomization;
      const updatedCust: UserCustomization = {
        ...currentCust,
        themeMode: newMode,
      };

      const newTheme: 'light' | 'dark' | 'system' =
        newMode === 'system' ? 'system' : newMode === 'light' ? 'light' : 'dark';

      return {
        ...prev,
        profile: {
          ...prev.profile,
          theme: newTheme,
          customization: updatedCust,
        },
      };
    });

    try {
      localStorage.setItem('pathly_theme_mode', newMode);
    } catch {}

    if (notify) {
      const label =
        newMode === 'light'
          ? 'حالت روشن فعال شد (سفید ملایم و کنترل‌شده).'
          : newMode === 'system'
          ? 'حالت هماهنگ با سیستم فعال شد.'
          : 'حالت مشکی واقعی (Pure Black) فعال شد.';
      showToast(label);
    }
  }, [showToast]);

  const getSectionTitle = useCallback(
    (tab: NavTab): string => {
      const custom = state.profile?.customization?.sectionNames?.[tab];
      if (custom && custom.trim()) {
        return custom.trim();
      }
      return DEFAULT_SECTION_NAMES[tab] || tab;
    },
    [state.profile?.customization?.sectionNames]
  );

  const updateCustomization = (updates: Partial<UserCustomization>, notify: boolean = true) => {
    setState((prev: any) => {
      const currentCust = prev.profile?.customization || initialCustomization;
      const updatedCust: UserCustomization = {
        ...currentCust,
        ...updates,
        sectionNames: {
          ...DEFAULT_SECTION_NAMES,
          ...currentCust.sectionNames,
          ...(updates.sectionNames || {}),
        },
      };

      let newTheme = prev.profile?.theme || 'dark';
      if (updates.themeMode) {
        newTheme = updates.themeMode === 'system' ? 'system' : updates.themeMode === 'light' ? 'light' : 'dark';
        try {
          localStorage.setItem('pathly_theme_mode', updates.themeMode);
        } catch {}

        const themeToAccent: Record<string, AccentColor> = {
          'sunset-gold': 'amber',
          'cyber-purple': 'violet',
          'emerald-matrix': 'emerald',
          'ocean-deep': 'blue',
          'rose-quartz': 'rose',
          'cyan-matrix': 'cyan',
        };
        if (themeToAccent[updates.themeMode]) {
          updatedCust.accentColor = themeToAccent[updates.themeMode];
          try {
            localStorage.setItem('pathly_accent_color', updatedCust.accentColor);
          } catch {}
        }
      }

      if (updates.accentColor) {
        try {
          localStorage.setItem('pathly_accent_color', updates.accentColor);
        } catch {}
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          theme: newTheme,
          customization: updatedCust,
        },
      };
    });
    if (notify) {
      showToast('تنظیمات شخصی‌سازی با موفقیت ذخیره شد.');
    }
  };

  const resetCustomization = (part: 'all' | 'names' | 'appearance' | 'dashboard' | 'nav' = 'all') => {
    setState((prev: any) => {
      const currentCust = prev.profile?.customization || initialCustomization;
      let newCust: UserCustomization = { ...currentCust };

      if (part === 'all') {
        newCust = {
          ...initialCustomization,
          sectionNames: { ...DEFAULT_SECTION_NAMES },
          dashboardCardsOrder: [...initialCustomization.dashboardCardsOrder],
          navOrder: [...initialCustomization.navOrder],
        };
      } else if (part === 'names') {
        newCust.sectionNames = { ...DEFAULT_SECTION_NAMES };
      } else if (part === 'appearance') {
        newCust.themeMode = initialCustomization.themeMode;
        newCust.accentColor = initialCustomization.accentColor;
        newCust.secondaryAccent = initialCustomization.secondaryAccent;
        newCust.borderRadius = initialCustomization.borderRadius;
        newCust.glowIntensity = initialCustomization.glowIntensity;
        newCust.fontSize = initialCustomization.fontSize;
        newCust.density = initialCustomization.density;
      } else if (part === 'dashboard') {
        newCust.dashboardCardsOrder = [...initialCustomization.dashboardCardsOrder];
        newCust.hiddenDashboardCards = [];
        newCust.dashboardColumns = initialCustomization.dashboardColumns;
      } else if (part === 'nav') {
        newCust.navOrder = [...initialCustomization.navOrder];
        newCust.hiddenSections = [];
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          theme: newCust.themeMode === 'light' ? 'light' : 'dark',
          customization: newCust,
        },
      };
    });
    showToast('تنظیمات به حالت پیش‌فرض بازگردانده شدند.');
  };

  const addActivityLog = (section: SectionType, description: string) => {
    const newLog: ActivityLogItem = {
      id: `al-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      section,
      description,
    };
    setState((prev: any) => ({
      ...prev,
      activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 50),
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState((prev: any) => {
      const currentCust = prev.profile?.customization || initialCustomization;
      const updatedCust = updates.theme
        ? { ...currentCust, themeMode: updates.theme as ThemeMode }
        : currentCust;

      if (updates.theme) {
        try {
          localStorage.setItem('pathly_theme_mode', updates.theme);
        } catch {}
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          ...updates,
          customization: updatedCust,
        },
      };
    });
    addActivityLog('general', 'تنظیمات کاربری به‌روزرسانی شد');
  };

  const addSubject = (subject: Omit<SchoolSubject, 'id'>) => {
    const newSubject: SchoolSubject = {
      ...subject,
      id: `sub-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    addActivityLog('school', `درس جدید اضافه شد: ${subject.name}`);
  };

  const updateSubject = (id: string, updates: Partial<SchoolSubject>) => {
    setState((prev: any) => ({
      ...prev,
      subjects: prev.subjects.map((s: SchoolSubject) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setState((prev: any) => {
      const subject = (prev.subjects || []).find((s: SchoolSubject) => s.id === id);
      const trashItem: TrashItem | null = subject
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'subject',
            title: subject.name,
            deletedAt: new Date().toISOString(),
            data: subject,
          }
        : null;
      return {
        ...prev,
        subjects: (prev.subjects || []).filter((s: SchoolSubject) => s.id !== id),
        weeklyCells: (prev.weeklyCells || []).map((c: WeeklyTimetableCell) =>
          c.subjectId === id ? { ...c, subjectId: '', color: undefined, notes: undefined } : c
        ),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    addActivityLog('school', 'درس به سطل بازیافت منتقل شد');
    showToast('درس به سطل بازیافت منتقل شد.');
  };

  const addGrade = (grade: Omit<SubjectGrade, 'id'>) => {
    const newGrade: SubjectGrade = {
      ...grade,
      id: `gr-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      grades: [newGrade, ...prev.grades],
    }));
    addActivityLog('school', `نمره ثبت شد: ${grade.title} (${grade.score} از ${grade.maxScore})`);
  };

  const deleteGrade = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      grades: prev.grades.filter((g: SubjectGrade) => g.id !== id),
    }));
  };

  const updateWeeklyCell = (newCell: WeeklyTimetableCell) => {
    setState((prev: any) => {
      const filtered = prev.weeklyCells.filter(
        (c: WeeklyTimetableCell) => !(c.dayIndex === newCell.dayIndex && c.period === newCell.period)
      );
      return {
        ...prev,
        weeklyCells: [...filtered, newCell],
      };
    });
  };

  const clearWeeklyCell = (dayIndex: number, period: number) => {
    setState((prev: any) => ({
      ...prev,
      weeklyCells: prev.weeklyCells.filter(
        (c: WeeklyTimetableCell) => !(c.dayIndex === dayIndex && c.period === period)
      ),
    }));
  };

  const updateDayData = (dayIndex: number, updates: Partial<DaySpecificData>) => {
    setState((prev: any) => {
      const existing = prev.dayData[dayIndex] || {
        dayIndex,
        overallRating: null,
        preSchoolTasks: [],
        postSchoolTasks: [],
        notes: '',
        reflectionReport: '',
      };
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: { ...existing, ...updates },
        },
      };
    });
  };

  const addPreSchoolTask = (dayIndex: number, title: string, priority: Priority = 'medium', dueTime?: string) => {
    const newTask = {
      id: `pre-${Date.now()}`,
      title,
      completed: false,
      priority,
      dueTime,
    };
    setState((prev: any) => {
      const current = prev.dayData[dayIndex] || { dayIndex, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' };
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            preSchoolTasks: [...(current.preSchoolTasks || []), newTask],
          },
        },
      };
    });
  };

  const togglePreSchoolTask = (dayIndex: number, taskId: string) => {
    setState((prev: any) => {
      const current = prev.dayData[dayIndex];
      if (!current) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            preSchoolTasks: current.preSchoolTasks.map((t: any) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            ),
          },
        },
      };
    });
  };

  const deletePreSchoolTask = (dayIndex: number, taskId: string) => {
    setState((prev: any) => {
      const current = prev.dayData[dayIndex];
      if (!current) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            preSchoolTasks: current.preSchoolTasks.filter((t: any) => t.id !== taskId),
          },
        },
      };
    });
  };

  const addPostSchoolTask = (dayIndex: number, title: string, priority: Priority = 'medium', dueTime?: string) => {
    const newTask = {
      id: `post-${Date.now()}`,
      title,
      completed: false,
      priority,
      dueTime,
    };
    setState((prev: any) => {
      const current = prev.dayData[dayIndex] || { dayIndex, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' };
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            postSchoolTasks: [...(current.postSchoolTasks || []), newTask],
          },
        },
      };
    });
  };

  const togglePostSchoolTask = (dayIndex: number, taskId: string) => {
    setState((prev: any) => {
      const current = prev.dayData[dayIndex];
      if (!current) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            postSchoolTasks: current.postSchoolTasks.map((t: any) =>
              t.id === taskId ? { ...t, completed: !t.completed } : t
            ),
          },
        },
      };
    });
  };

  const deletePostSchoolTask = (dayIndex: number, taskId: string) => {
    setState((prev: any) => {
      const current = prev.dayData[dayIndex];
      if (!current) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...current,
            postSchoolTasks: current.postSchoolTasks.filter((t: any) => t.id !== taskId),
          },
        },
      };
    });
  };

  const setDayRating = (dayIndex: number, rating: DayRating) => {
    updateDayData(dayIndex, { overallRating: rating });
  };

  const addHomework = (hw: Omit<SchoolHomework, 'id'>) => {
    const newHw: SchoolHomework = {
      ...hw,
      id: `hw-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      homeworks: [newHw, ...prev.homeworks],
    }));
    addActivityLog('school', `تکلیف جدید ثبت شد: ${hw.title}`);
  };

  const toggleHomework = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      homeworks: prev.homeworks.map((h: SchoolHomework) =>
        h.id === id ? { ...h, completed: !h.completed } : h
      ),
    }));
  };

  const updateHomework = (id: string, updates: Partial<SchoolHomework>) => {
    setState((prev: any) => ({
      ...prev,
      homeworks: prev.homeworks.map((h: SchoolHomework) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    }));
  };

  const deleteHomework = (id: string) => {
    setState((prev: any) => {
      const item = (prev.homeworks || []).find((h: SchoolHomework) => h.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'homework',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        homeworks: (prev.homeworks || []).filter((h: SchoolHomework) => h.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('تکلیف به سطل بازیافت منتقل شد.');
  };

  const addExam = (exam: Omit<SchoolExamItem, 'id'>) => {
    const newExam: SchoolExamItem = {
      ...exam,
      id: `ex-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      exams: [newExam, ...prev.exams],
    }));
    addActivityLog('school', `رویداد ارزیابی ثبت شد: ${exam.title}`);
  };

  const updateExam = (id: string, updates: Partial<SchoolExamItem>) => {
    setState((prev: any) => ({
      ...prev,
      exams: prev.exams.map((e: SchoolExamItem) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  };

  const toggleExam = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      exams: prev.exams.map((e: SchoolExamItem) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      ),
    }));
  };

  const deleteExam = (id: string) => {
    setState((prev: any) => {
      const item = (prev.exams || []).find((e: SchoolExamItem) => e.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'exam',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        exams: (prev.exams || []).filter((e: SchoolExamItem) => e.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('آزمون به سطل بازیافت منتقل شد.');
  };

  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `ss-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      studySessions: [newSession, ...prev.studySessions],
    }));
    addActivityLog('school', `جلسه مطالعه ثبت شد: ${session.subjectName} (${session.actualDurationMin} دقیقه)`);
  };

  const deleteStudySession = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      studySessions: prev.studySessions.filter((s: StudySession) => s.id !== id),
    }));
  };

  const addSkill = (skill: Omit<Skill, 'id' | 'streak' | 'activeDates'>) => {
    const newSkill: Skill = {
      ...skill,
      id: `sk-${Date.now()}`,
      streak: 1,
      activeDates: [new Date().toISOString().slice(0, 10)],
    };
    setState((prev: any) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    addActivityLog('skill', `مهارت جدید افزوده شد: ${skill.name}`);
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSkill = (id: string) => {
    setState((prev: any) => {
      const item = (prev.skills || []).find((s: Skill) => s.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'skill',
            title: item.name,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        skills: (prev.skills || []).filter((s: Skill) => s.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    addActivityLog('skill', 'مهارت به سطل بازیافت منتقل شد');
    showToast('مهارت به سطل بازیافت منتقل شد.');
  };

  const toggleSkillRoadmapStep = (skillId: string, stepId: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          roadmap: s.roadmap.map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          ),
        };
      }),
    }));
  };

  const addSkillRoadmapStep = (skillId: string, title: string, description?: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        const newStep = {
          id: `rm-${Date.now()}`,
          title,
          description,
          completed: false,
          order: s.roadmap.length + 1,
        };
        return {
          ...s,
          roadmap: [...s.roadmap, newStep],
        };
      }),
    }));
  };

  const logSkillPractice = (skillId: string, minutes: number, notes: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        const activeDates = s.activeDates.includes(today) ? s.activeDates : [...s.activeDates, today];
        return {
          ...s,
          streak: s.activeDates.includes(today) ? s.streak : s.streak + 1,
          activeDates,
          practiceLogs: [
            { id: `pl-${Date.now()}`, date: today, minutes, notes },
            ...s.practiceLogs,
          ],
        };
      }),
    }));
    addActivityLog('skill', `تمرین مهارت ثبت شد (${minutes} دقیقه)`);
  };

  const addSkillWeakness = (skillId: string, weakness: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return { ...s, weaknesses: [...s.weaknesses, weakness] };
      }),
    }));
  };

  const removeSkillWeakness = (skillId: string, index: number) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return { ...s, weaknesses: s.weaknesses.filter((_, i) => i !== index) };
      }),
    }));
  };

  const addSkillResource = (skillId: string, res: { title: string; type: 'course'|'book'|'article'|'video'; url?: string }) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          resources: [...s.resources, { id: `res-${Date.now()}`, ...res, completed: false }],
        };
      }),
    }));
  };

  const toggleSkillResource = (skillId: string, resId: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          resources: s.resources.map((r) => (r.id === resId ? { ...r, completed: !r.completed } : r)),
        };
      }),
    }));
  };

  const addSkillExercise = (skillId: string, title: string, dueDate?: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          exercises: [...s.exercises, { id: `ex-${Date.now()}`, title, completed: false, dueDate }],
        };
      }),
    }));
  };

  const toggleSkillExercise = (skillId: string, exId: string) => {
    setState((prev: any) => ({
      ...prev,
      skills: prev.skills.map((s: Skill) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          exercises: s.exercises.map((e) => (e.id === exId ? { ...e, completed: !e.completed } : e)),
        };
      }),
    }));
  };

  const addProject = (proj: Omit<Project, 'id' | 'tasks' | 'knownBugs' | 'activityLogs'>) => {
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      tasks: [],
      knownBugs: [],
      activityLogs: [{ id: `act-${Date.now()}`, timestamp: new Date().toISOString(), action: 'ایجاد پروژه' }],
    };
    setState((prev: any) => ({
      ...prev,
      projects: [...prev.projects, newProj],
    }));
    addActivityLog('project', `پروژه جدید تعریف شد: ${proj.title}`);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    setState((prev: any) => {
      const item = (prev.projects || []).find((p: Project) => p.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'project',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        projects: (prev.projects || []).filter((p: Project) => p.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    addActivityLog('project', 'پروژه به سطل بازیافت منتقل شد');
    showToast('پروژه به سطل بازیافت منتقل شد.');
  };

  const addProjectTask = (
    projectId: string,
    task: { title: string; status: ProjectStatus; priority: Priority; dueDate?: string; estimatedHours?: number; notes?: string }
  ) => {
    const newTask = {
      id: `pt-${Date.now()}`,
      ...task,
      subtasks: [],
    };
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        const tasks = [...p.tasks, newTask];
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const progressPercentage = Math.round((completed / tasks.length) * 100);
        return {
          ...p,
          tasks,
          progressPercentage,
          activityLogs: [
            { id: `act-${Date.now()}`, timestamp: new Date().toISOString(), action: `وظیفه جدید افزوده شد: ${task.title}` },
            ...p.activityLogs,
          ],
        };
      }),
    }));
  };

  const updateProjectTaskStatus = (projectId: string, taskId: string, status: ProjectStatus) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        const tasks = p.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const progressPercentage = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : p.progressPercentage;
        return {
          ...p,
          tasks,
          progressPercentage,
        };
      }),
    }));
  };

  const deleteProjectTask = (projectId: string, taskId: string) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.filter((t) => t.id !== taskId),
        };
      }),
    }));
  };

  const toggleProjectSubtask = (projectId: string, taskId: string, subtaskId: string) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)),
            };
          }),
        };
      }),
    }));
  };

  const addProjectSubtask = (projectId: string, taskId: string, title: string) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: [...t.subtasks, { id: `st-${Date.now()}`, title, done: false }],
            };
          }),
        };
      }),
    }));
  };

  const addProjectBug = (projectId: string, title: string, severity: Priority) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          knownBugs: [...p.knownBugs, { id: `bug-${Date.now()}`, title, severity, resolved: false }],
        };
      }),
    }));
  };

  const toggleProjectBug = (projectId: string, bugId: string) => {
    setState((prev: any) => ({
      ...prev,
      projects: prev.projects.map((p: Project) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          knownBugs: p.knownBugs.map((b) => (b.id === bugId ? { ...b, resolved: !b.resolved } : b)),
        };
      }),
    }));
  };

  const addCompetition = (comp: Omit<Competition, 'id'>) => {
    const newComp: Competition = {
      ...comp,
      id: `comp-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      competitions: [...prev.competitions, newComp],
    }));
    addActivityLog('competition', `مسابقه جدید افزوده شد: ${comp.title}`);
  };

  const updateCompetition = (id: string, updates: Partial<Competition>) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteCompetition = (id: string) => {
    setState((prev: any) => {
      const item = (prev.competitions || []).find((c: Competition) => c.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'competition',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        competitions: (prev.competitions || []).filter((c: Competition) => c.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    addActivityLog('competition', 'مسابقه به سطل بازیافت منتقل شد');
    showToast('مسابقه به سطل بازیافت منتقل شد.');
  };

  const toggleCompetitionStage = (compId: string, stageId: string) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        return {
          ...c,
          stages: c.stages.map((st) => (st.id === stageId ? { ...st, completed: !st.completed } : st)),
        };
      }),
    }));
  };

  const toggleCompetitionTopic = (compId: string, topicId: string) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        const prepTopics = c.prepTopics.map((tp) => (tp.id === topicId ? { ...tp, mastered: !tp.mastered } : tp));
        const masteredCount = prepTopics.filter((tp) => tp.mastered).length;
        const readinessPercentage = prepTopics.length > 0 ? Math.round((masteredCount / prepTopics.length) * 100) : c.readinessPercentage;
        return {
          ...c,
          prepTopics,
          readinessPercentage,
        };
      }),
    }));
  };

  const addCompetitionTopic = (compId: string, title: string) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        return {
          ...c,
          prepTopics: [...c.prepTopics, { id: `ptp-${Date.now()}`, title, mastered: false }],
        };
      }),
    }));
  };

  const addCompetitionMockExam = (compId: string, exam: { title: string; score: number; maxScore: number; date: string; notes?: string }) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        return {
          ...c,
          mockExams: [{ id: `me-${Date.now()}`, ...exam }, ...c.mockExams],
        };
      }),
    }));
    addActivityLog('competition', `نمره آزمون آزمایشی ثبت شد (${exam.score} از ${exam.maxScore})`);
  };

  const updateSolvedProblems = (compId: string, delta: number) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        const count = Math.max(0, c.solvedProblemsCount + delta);
        return { ...c, solvedProblemsCount: count };
      }),
    }));
  };

  const addCompetitionWeakness = (compId: string, weakness: string) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        return { ...c, weaknesses: [...c.weaknesses, weakness] };
      }),
    }));
  };

  const removeCompetitionWeakness = (compId: string, index: number) => {
    setState((prev: any) => ({
      ...prev,
      competitions: prev.competitions.map((c: Competition) => {
        if (c.id !== compId) return c;
        return { ...c, weaknesses: c.weaknesses.filter((_, i) => i !== index) };
      }),
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    addActivityLog('general', `هدف جدید ثبت شد: ${goal.title}`);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setState((prev: any) => ({
      ...prev,
      goals: prev.goals.map((g: Goal) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setState((prev: any) => {
      const item = (prev.goals || []).find((g: Goal) => g.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'goal',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        goals: (prev.goals || []).filter((g: Goal) => g.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    addActivityLog('general', 'هدف به سطل بازیافت منتقل شد');
    showToast('هدف به سطل بازیافت منتقل شد.');
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setState((prev: any) => ({
      ...prev,
      goals: prev.goals.map((g: Goal) => {
        if (g.id !== goalId) return g;
        const milestones = g.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
        const doneCount = milestones.filter((m) => m.done).length;
        const progressPercentage = milestones.length > 0 ? Math.round((doneCount / milestones.length) * 100) : g.progressPercentage;
        const status = progressPercentage === 100 ? 'completed' : progressPercentage > 0 ? 'in_progress' : 'todo';
        return {
          ...g,
          milestones,
          progressPercentage,
          status,
        };
      }),
    }));
  };

  const addGoalMilestone = (goalId: string, title: string) => {
    setState((prev: any) => ({
      ...prev,
      goals: prev.goals.map((g: Goal) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          milestones: [...g.milestones, { id: `gm-${Date.now()}`, title, done: false }],
        };
      }),
    }));
  };

  const addWeeklyReview = (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => {
    const newReview: WeeklyReview = {
      ...review,
      id: `wr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev: any) => ({
      ...prev,
      weeklyReviews: [newReview, ...prev.weeklyReviews],
    }));
    addActivityLog('general', 'مرور هفتگی جدید ثبت شد');
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `cev-${Date.now()}`,
    };
    setState((prev: any) => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, newEvent],
    }));
    addActivityLog(event.section, `رویداد تقویم ثبت شد: ${event.title}`);
  };

  const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setState((prev: any) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map((e: CalendarEvent) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteCalendarEvent = (id: string) => {
    setState((prev: any) => {
      const item = (prev.calendarEvents || []).find((e: CalendarEvent) => e.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'calendarEvent',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        calendarEvents: (prev.calendarEvents || []).filter((e: CalendarEvent) => e.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('رویداد تقویم به سطل بازیافت منتقل شد.');
  };

  const toggleCalendarEventCompleted = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.map((e: CalendarEvent) => (e.id === id ? { ...e, completed: !e.completed } : e)),
    }));
  };

  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev: any) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    addActivityLog('general', `یادداشت جدید ایجاد شد: ${note.title}`);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setState((prev: any) => ({
      ...prev,
      notes: prev.notes.map((n: Note) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setState((prev: any) => {
      const item = (prev.notes || []).find((n: Note) => n.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'note',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        notes: (prev.notes || []).filter((n: Note) => n.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('یادداشت به سطل بازیافت منتقل شد.');
  };

  const toggleNotePinned = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      notes: prev.notes.map((n: Note) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: ReminderNotification) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: ReminderNotification) => ({ ...n, isRead: true })),
    }));
  };

  const clearNotification = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      notifications: prev.notifications.filter((n: ReminderNotification) => n.id !== id),
    }));
  };

  const exportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pathly-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile && parsed.subjects && parsed.weeklyCells) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON backup file', e);
    }
    return false;
  };


  const addHabit = (habitData: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `hab-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      streak: 0,
      completedDates: [],
    };
    setState((prev: any) => ({
      ...prev,
      habits: [...(prev.habits || []), newHabit],
    }));
    addActivityLog(habitData.category || 'general', `عادت جدید «${habitData.title}» تعریف شد.`);
    showToast(`عادت «${habitData.title}» با موفقیت اضافه شد.`);
  };

  const toggleHabitToday = (habitId: string, dateIso?: string) => {
    const targetDate = dateIso || new Date().toISOString().slice(0, 10);
    setState((prev: any) => {
      const updated = (prev.habits || []).map((h: Habit) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(targetDate);
        let newDates: string[];
        let newStreak = h.streak;
        if (exists) {
          newDates = h.completedDates.filter((d) => d !== targetDate);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          newDates = [...h.completedDates, targetDate];
          newStreak = newStreak + 1;
        }
        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
        };
      });
      return { ...prev, habits: updated };
    });
    showToast('وضعیت عادت به‌روزرسانی شد.');
  };

  const deleteHabit = (habitId: string) => {
    setState((prev: any) => {
      const item = (prev.habits || []).find((h: Habit) => h.id === habitId);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: habitId,
            itemType: 'habit',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        habits: (prev.habits || []).filter((h: Habit) => h.id !== habitId),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('عادت به سطل بازیافت منتقل شد.');
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setState((prev: any) => ({
      ...prev,
      habits: (prev.habits || []).map((h: Habit) => (h.id === habitId ? { ...h, ...updates } : h)),
    }));
    showToast('تغییرات عادت ذخیره شد.');
  };

  const updateWidgetConfig = (updates: Partial<DashboardWidgetConfig>) => {
    setState((prev: any) => {
      const updated = { ...(prev.widgetConfig || initialWidgetConfig), ...updates };
      return {
        ...prev,
        widgetConfig: updated,
        profile: { ...prev.profile, widgetConfig: updated },
      };
    });
    showToast('تنظیمات ویجت‌های داشبورد به‌روز شد.');
  };

  const rolloverOverdueTasks = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const overdueHomeworks = (state.homeworks || []).filter((h: SchoolHomework) => !h.completed && h.dueDate < todayIso);
    const count = overdueHomeworks.length;
    if (count > 0) {
      setState((prev: any) => {
        const updatedHw = (prev.homeworks || []).map((h: SchoolHomework) => {
          if (!h.completed && h.dueDate < todayIso) {
            return { ...h, dueDate: todayIso };
          }
          return h;
        });
        return { ...prev, homeworks: updatedHw };
      });
      showToast(`${toPersianDigits(count)} تکلیف عقب‌افتاده به امروز منتقل شدند.`);
      addActivityLog('school', `${count} تکلیف معوقه به تاریخ امروز منتقل شد.`);
    } else {
      showToast('تکلیف عقب‌افتاده‌ای برای انتقال وجود ندارد.');
    }
  };

  // Spaced Repetition & Reviews
  const addReviewItem = (item: Omit<SpacedReviewItem, 'id' | 'intervalDays' | 'repetitionCount' | 'reviewLogs'>) => {
    const newItem: SpacedReviewItem = {
      ...item,
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      intervalDays: 1,
      repetitionCount: 0,
      reviewLogs: [],
    };
    setState((prev: any) => ({
      ...prev,
      reviews: [newItem, ...(prev.reviews || [])],
    }));
    addActivityLog(item.section || 'school', `مبحث «${item.title}» برای مرور دوره‌ای ثبت شد.`);
    showToast(`مبحث «${item.title}» برای مرور هوشمند ثبت شد.`);
  };

  const updateReviewItem = (id: string, updates: Partial<SpacedReviewItem>) => {
    setState((prev: any) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r: SpacedReviewItem) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    showToast('اطلاعات مرور به‌روز شد.');
  };

  const deleteReviewItem = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      reviews: (prev.reviews || []).filter((r: SpacedReviewItem) => r.id !== id),
    }));
    showToast('مبحث از فهرست مرور حذف شد.');
  };

  const submitReviewOutcome = (id: string, rating: 'easy' | 'good' | 'hard' | 'forgotten', notes?: string) => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    setState((prev: any) => {
      const updatedReviews = (prev.reviews || []).map((rev: SpacedReviewItem) => {
        if (rev.id !== id) return rev;
        let nextInterval = rev.intervalDays || 1;
        let newRep = (rev.repetitionCount || 0) + 1;
        let newMastery = rev.masteryLevel || 1;
        let isDiff = rev.isDifficult;

        if (rating === 'forgotten') {
          nextInterval = 1;
          newMastery = Math.max(1, newMastery - 1);
          isDiff = true;
        } else if (rating === 'hard') {
          nextInterval = Math.max(1, Math.round(nextInterval * 1.3));
          isDiff = true;
        } else if (rating === 'good') {
          nextInterval = Math.max(2, Math.round(nextInterval * 2.0));
          newMastery = Math.min(5, newMastery + 1);
        } else if (rating === 'easy') {
          nextInterval = Math.max(3, Math.round(nextInterval * 2.6));
          newMastery = Math.min(5, newMastery + 1);
          if (newMastery >= 4) isDiff = false;
        }

        const nextDateObj = new Date(today.getTime() + nextInterval * 24 * 60 * 60 * 1000);
        const nextReviewDate = nextDateObj.toISOString().slice(0, 10);

        const logEntry: ReviewLogEntry = {
          id: `rl-${Date.now()}`,
          date: todayIso,
          rating,
          notes,
        };

        return {
          ...rev,
          lastReviewedDate: todayIso,
          nextReviewDate,
          intervalDays: nextInterval,
          repetitionCount: newRep,
          masteryLevel: newMastery,
          isDifficult: isDiff,
          reviewLogs: [logEntry, ...(rev.reviewLogs || [])],
        };
      });

      return { ...prev, reviews: updatedReviews };
    });
    addActivityLog('general', 'یک جلسه مرور هوشمند ثبت شد.');
    showToast('نتیجه مرور ثبت و زمان مرور بعدی زمان‌بندی گردید.');
  };

  // Knowledge Resources
  const addResource = (res: Omit<KnowledgeResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRes: KnowledgeResource = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((prev: any) => ({
      ...prev,
      resources: [newRes, ...(prev.resources || [])],
    }));
    addActivityLog(res.section, `منبع جدید «${res.title}» به کتابخانه افزوده شد.`);
    showToast(`منبع «${res.title}» ذخیره شد.`);
  };

  const updateResource = (id: string, updates: Partial<KnowledgeResource>) => {
    setState((prev: any) => ({
      ...prev,
      resources: (prev.resources || []).map((r: KnowledgeResource) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
    showToast('منبع به‌روزرسانی شد.');
  };

  const deleteResource = (id: string) => {
    setState((prev: any) => {
      const item = (prev.resources || []).find((r: KnowledgeResource) => r.id === id);
      const trashItem: TrashItem | null = item
        ? {
            id: `trash-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            originalId: id,
            itemType: 'resource',
            title: item.title,
            deletedAt: new Date().toISOString(),
            data: item,
          }
        : null;
      return {
        ...prev,
        resources: (prev.resources || []).filter((r: KnowledgeResource) => r.id !== id),
        trash: trashItem ? [trashItem, ...(prev.trash || [])].slice(0, 100) : (prev.trash || []),
      };
    });
    showToast('منبع به سطل بازیافت منتقل شد.');
  };

  const toggleResourcePinned = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      resources: (prev.resources || []).map((r: KnowledgeResource) =>
        r.id === id ? { ...r, pinned: !r.pinned, updatedAt: new Date().toISOString() } : r
      ),
    }));
  };

  // Quick Inbox Items
  const addInboxItem = (
    content: string,
    title?: string,
    priority: Priority = 'medium',
    category: SectionType = 'general',
    dueDate?: string
  ) => {
    const newItem: QuickInboxItem = {
      id: `inbox-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      content: content.trim(),
      title: title?.trim(),
      priority,
      createdAt: new Date().toISOString(),
      dueDate,
      category,
      archived: false,
    };
    setState((prev: any) => ({
      ...prev,
      inboxItems: [newItem, ...(prev.inboxItems || [])],
    }));
    showToast('ایده به صندوق ورودی افزوده شد.');
  };

  const updateInboxItem = (id: string, updates: Partial<QuickInboxItem>) => {
    setState((prev: any) => ({
      ...prev,
      inboxItems: (prev.inboxItems || []).map((i: QuickInboxItem) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  };

  const deleteInboxItem = (id: string) => {
    setState((prev: any) => ({
      ...prev,
      inboxItems: (prev.inboxItems || []).filter((i: QuickInboxItem) => i.id !== id),
    }));
    showToast('یادداشت حذف شد.');
  };

  const convertInboxToTask = (
    inboxId: string,
    targetType: 'task' | 'homework' | 'project_task' | 'goal' | 'note',
    targetData?: any
  ) => {
    const item = (state.inboxItems || []).find((i: QuickInboxItem) => i.id === inboxId);
    if (!item) return;

    if (targetType === 'task') {
      const today = new Date();
      const dayIdx = Math.min(4, Math.max(0, (today.getDay() + 1) % 7));
      addPostSchoolTask(dayIdx, item.title || item.content, item.priority, item.dueDate);
    } else if (targetType === 'homework' && targetData?.subjectId) {
      addHomework({
        dayIndex: 0,
        subjectId: targetData.subjectId,
        subjectName: targetData.subjectName || 'درس عمومی',
        title: item.title || item.content,
        completed: false,
        dueDate: item.dueDate || new Date().toISOString().slice(0, 10),
        priority: item.priority,
      });
    } else if (targetType === 'note') {
      addNote({
        title: item.title || item.content.slice(0, 30),
        content: item.content,
        category: item.category || 'general',
        tags: ['صندوق_ورودی'],
        pinned: false,
      });
    }

    updateInboxItem(inboxId, {
      archived: true,
      convertedTo: { type: targetType, targetId: `conv-${Date.now()}` },
    });
    showToast(`مورد صندوق ورودی با موفقیت تبدیل به ${targetType === 'task' ? 'وظیفه' : targetType === 'homework' ? 'تکلیف' : 'یادداشت'} شد.`);
  };

  // Advanced Daily Planning
  const addPlannedTask = (taskData: Omit<TaskItem, 'id'>, targetDayIdx: number = 0) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      subtasks: taskData.subtasks || [],
      date: taskData.date || new Date().toISOString().slice(0, 10),
    };
    setState((prev: any) => {
      const day = prev.dayData[targetDayIdx] || {
        dayIndex: targetDayIdx,
        overallRating: null,
        preSchoolTasks: [],
        postSchoolTasks: [],
        notes: '',
        reflectionReport: '',
      };
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [targetDayIdx]: {
            ...day,
            postSchoolTasks: [...(day.postSchoolTasks || []), newTask],
          },
        },
      };
    });
    showToast(`وظیفه «${taskData.title}» برنامه‌ریزی شد.`);
  };

  const updatePlannedTask = (taskId: string, dayIndex: number, updates: Partial<TaskItem>) => {
    setState((prev: any) => {
      const day = prev.dayData[dayIndex];
      if (!day) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...day,
            postSchoolTasks: (day.postSchoolTasks || []).map((t: TaskItem) =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          },
        },
      };
    });
  };

  const deletePlannedTask = (taskId: string, dayIndex: number) => {
    setState((prev: any) => {
      const day = prev.dayData[dayIndex];
      if (!day) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...day,
            postSchoolTasks: (day.postSchoolTasks || []).filter((t: TaskItem) => t.id !== taskId),
          },
        },
      };
    });
    showToast('وظیفه حذف شد.');
  };

  const toggleTaskSubtask = (dayIndex: number, taskId: string, subtaskId: string) => {
    setState((prev: any) => {
      const day = prev.dayData[dayIndex];
      if (!day) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...day,
            postSchoolTasks: (day.postSchoolTasks || []).map((t: TaskItem) => {
              if (t.id !== taskId) return t;
              const updatedSubtasks = (t.subtasks || []).map((st: TaskSubtask) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              );
              return { ...t, subtasks: updatedSubtasks };
            }),
          },
        },
      };
    });
  };

  const addTaskSubtask = (dayIndex: number, taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: TaskSubtask = {
      id: `st-${Date.now()}`,
      title: title.trim(),
      completed: false,
    };
    setState((prev: any) => {
      const day = prev.dayData[dayIndex];
      if (!day) return prev;
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [dayIndex]: {
            ...day,
            postSchoolTasks: (day.postSchoolTasks || []).map((t: TaskItem) => {
              if (t.id !== taskId) return t;
              return { ...t, subtasks: [...(t.subtasks || []), newSub] };
            }),
          },
        },
      };
    });
  };

  const rescheduleTask = (taskId: string, fromDayIndex: number, toDayIndex: number, newTime?: string) => {
    setState((prev: any) => {
      const fromDay = prev.dayData[fromDayIndex];
      const targetTask = fromDay?.postSchoolTasks?.find((t: TaskItem) => t.id === taskId);
      if (!targetTask) return prev;

      const updatedFromTasks = (fromDay.postSchoolTasks || []).filter((t: TaskItem) => t.id !== taskId);
      const toDay = prev.dayData[toDayIndex] || {
        dayIndex: toDayIndex,
        overallRating: null,
        preSchoolTasks: [],
        postSchoolTasks: [],
        notes: '',
        reflectionReport: '',
      };

      const movedTask: TaskItem = {
        ...targetTask,
        dueTime: newTime || targetTask.dueTime,
        startTime: newTime || targetTask.startTime,
        isRollover: true,
      };

      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [fromDayIndex]: { ...fromDay, postSchoolTasks: updatedFromTasks },
          [toDayIndex]: { ...toDay, postSchoolTasks: [...(toDay.postSchoolTasks || []), movedTask] },
        },
      };
    });
    showToast('وظیفه با موفقیت زمان‌بندی مجدد شد.');
  };

  // CSV Exports
  const exportTasksCSV = () => {
    const rows = [
      ['عنوان وظیفه', 'بخش', 'اولویت', 'وضعیت', 'ساعت / مهلت', 'زمان تخمینی (دقیقه)', 'زمان واقعی (دقیقه)'],
    ];
    Object.values(state.dayData || {}).forEach((d: any) => {
      (d.postSchoolTasks || []).forEach((t: TaskItem) => {
        rows.push([
          `"${(t.title || '').replace(/"/g, '""')}"`,
          t.section || 'مدرسه',
          t.priority || 'medium',
          t.completed ? 'تکمیل‌شده' : 'در انتظار',
          t.dueTime || t.startTime || '-',
          String(t.estimatedMinutes || 0),
          String(t.actualMinutes || 0),
        ]);
      });
    });
    (state.homeworks || []).forEach((h: SchoolHomework) => {
      rows.push([
        `"${(h.title || '').replace(/"/g, '""')}"`,
        'تکلیف مدرسه',
        h.priority || 'medium',
        h.completed ? 'تکمیل‌شده' : 'در انتظار',
        h.dueDate || '-',
        String(h.estimatedMinutes || 0),
        '-',
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathly-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('فایل CSV وظایف دانلود شد.');
  };

  const exportStudySessionsCSV = () => {
    const rows = [
      ['موضوع مطالعه', 'درس / مهارت', 'تاریخ', 'ساعت شروع', 'مدت پیش‌بینی (دقیقه)', 'مدت واقعی (دقیقه)', 'نمره تمرکز (۱ تا ۵)', 'یادداشت پایان جلسه'],
    ];
    (state.studySessions || []).forEach((s: StudySession) => {
      rows.push([
        `"${(s.topic || '').replace(/"/g, '""')}"`,
        `"${(s.subjectName || '').replace(/"/g, '""')}"`,
        s.date,
        s.startTime,
        String(s.expectedDurationMin || 0),
        String(s.actualDurationMin || 0),
        String(s.focusScore || 5),
        `"${(s.outcomeNotes || '').replace(/"/g, '""')}"`,
      ]);
    });
    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathly-study-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('فایل CSV جلسات مطالعه و تمرکز دانلود شد.');
  };

  const exportGradesCSV = () => {
    const rows = [
      ['درس', 'عنوان آزمون / پرسش', 'نمره کسب‌شده', 'نمره کامل', 'تاریخ', 'توضیحات'],
    ];
    (state.grades || []).forEach((g: SubjectGrade) => {
      const sub = (state.subjects || []).find((s: SchoolSubject) => s.id === g.subjectId);
      rows.push([
        `"${(sub?.name || 'نامشخص').replace(/"/g, '""')}"`,
        `"${(g.title || '').replace(/"/g, '""')}"`,
        String(g.score),
        String(g.maxScore),
        g.date,
        `"${(g.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathly-grades-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('فایل CSV نمرات دانلود شد.');
  };

  const exportSkillsCSV = () => {
    const rows = [
      ['نام مهارت', 'دسته‌بندی', 'سطح فعلی', 'سطح هدف', 'هدف روزانه (دقیقه)', 'استریک (روز)', 'تعداد تمرین‌ها'],
    ];
    (state.skills || []).forEach((sk: Skill) => {
      rows.push([
        `"${(sk.name || '').replace(/"/g, '""')}"`,
        sk.category,
        sk.currentLevel,
        sk.targetLevel,
        String(sk.dailyTargetMin || 0),
        String(sk.streak || 0),
        String((sk.practiceLogs || []).length),
      ]);
    });
    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pathly-skills-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('فایل CSV مهارت‌ها دانلود شد.');
  };

  const validateBackupData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'ساختار فایل نامعتبر است.' };
      }
      const summary: Record<string, number> = {
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects.length : 0,
        homeworks: Array.isArray(parsed.homeworks) ? parsed.homeworks.length : 0,
        skills: Array.isArray(parsed.skills) ? parsed.skills.length : 0,
        projects: Array.isArray(parsed.projects) ? parsed.projects.length : 0,
        competitions: Array.isArray(parsed.competitions) ? parsed.competitions.length : 0,
        habits: Array.isArray(parsed.habits) ? parsed.habits.length : 0,
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews.length : 0,
        resources: Array.isArray(parsed.resources) ? parsed.resources.length : 0,
        inboxItems: Array.isArray(parsed.inboxItems) ? parsed.inboxItems.length : 0,
      };
      return { valid: true, summary };
    } catch (err: any) {
      return { valid: false, error: err?.message || 'خطا در خواندن فایل JSON' };
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('pathly_app_data_v1');
    localStorage.removeItem('pathly_app_data_v2_clean');
    setState(getDefaultData());
    showToast('داده‌ها به حالت اولیه پیش‌فرض بازنشانی شدند.');
  };

  const clearAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('pathly_app_data_v1');
    } catch (e) {
      console.error(e);
    }
    setState({
      profile: initialProfile,
      subjects: [],
      grades: [],
      weeklyCells: [],
      dayData: initialDayDataMap,
      homeworks: [],
      exams: [],
      studySessions: [],
      skills: [],
      projects: [],
      competitions: [],
      goals: [],
      weeklyReviews: [],
      calendarEvents: [],
      notes: [],
      activityLogs: [],
      notifications: [],
      habits: [],
      reviews: [],
      resources: [],
      inboxItems: [],
      widgetConfig: initialWidgetConfig,
      trash: [],
      rpg: initialRPGState,
      activeFocus: null,
      rescuePlan: null,
      smartSchedule: [],
    });
    showToast('تمامی اطلاعات با موفقیت پاکسازی شدند.');
  };

  const login = async (identifier: string, pass: string) => {
    setAuthLoading(true);
    try {
      const res = await apiLogin(identifier, pass);
      setCurrentUser(res.user);
      const serverRes = await apiFetchUserData();
      if (serverRes.exists && serverRes.data) {
        setState(serverRes.data);
      } else {
        const fresh = getDefaultData();
        setState(fresh);
        await apiSaveUserData(fresh);
      }
      setSyncStatus('synced');
      try {
        const snapRes = await apiGetSnapshots();
        setServerSnapshots(snapRes.snapshots || []);
      } catch {}
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (email: string, username: string, name: string, pass: string, question?: string, answer?: string) => {
    setAuthLoading(true);
    try {
      const res = await apiRegister({ email, username, name, password: pass, securityQuestion: question, securityAnswer: answer });
      setCurrentUser(res.user);
      const freshData = {
        ...getDefaultData(),
        profile: { ...initialProfile, name },
      };
      setState(freshData);
      await apiSaveUserData(freshData);
      setSyncStatus('synced');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    setState(getDefaultData());
    setSyncStatus('offline');
  };

  const updateAuthProfile = async (payload: { name?: string; avatarUrl?: string; securityQuestion?: string; securityAnswer?: string }) => {
    const res = await apiUpdateProfile(payload);
    setCurrentUser((prev) => (prev ? { ...prev, ...res.user } : res.user));
    if (payload.name) {
      updateProfile({ name: payload.name });
    }
    showToast('اطلاعات حساب با موفقیت بروزرسانی شد.');
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    await apiChangePassword(oldPass, newPass);
    showToast('رمز عبور جدید با موفقیت ذخیره گردید.');
  };

  const resetPassword = async (identifier: string, answer: string, newPass: string) => {
    await apiResetPassword({ identifier, securityAnswer: answer, newPassword: newPass });
  };

  const requestPasswordResetToken = async (identifier: string) => {
    return await apiForgotPasswordRequest(identifier);
  };

  const resetPasswordWithToken = async (identifier: string, token: string, newPass: string) => {
    const res = await apiResetPasswordToken({ identifier, token, newPassword: newPass });
    showToast(res.message || 'رمز عبور با موفقیت بازنشانی شد.');
  };

  const checkAvailability = async (params: { email?: string; username?: string }) => {
    return await apiCheckAvailability(params);
  };

  const deleteAccount = async (pass: string) => {
    await apiDeleteAccount(pass);
    logout();
    showToast('حساب کاربری و کلیه داده‌های آن با موفقیت حذف گردید.');
  };

  const syncWithServer = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSyncStatus('syncing');
    try {
      await apiSaveUserData(state);
      setSyncStatus('synced');
      showToast('تمامی اطلاعات در پایگاه داده سرور ذخیره شد.');
    } catch (err: any) {
      setSyncStatus('error');
      showToast(err.message || 'خطا در ارتباط با سرور پایگاه داده');
    }
  };

  const refreshSnapshots = async () => {
    if (!currentUser) return;
    try {
      const res = await apiGetSnapshots();
      setServerSnapshots(res.snapshots || []);
    } catch {}
  };

  const restoreServerSnapshot = async (snapshotId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      setSyncStatus('syncing');
      await apiRestoreSnapshot(snapshotId);
      const dataRes = await apiFetchUserData();
      if (dataRes.exists && dataRes.data) {
        setState(dataRes.data);
      }
      setSyncStatus('synced');
      await refreshSnapshots();
      showToast('نسخه پشتیبان سرور با موفقیت بازیابی شد.');
      return true;
    } catch (err: any) {
      setSyncStatus('error');
      showToast(err.message || 'خطا در بازگردانی نسخه پشتیبان');
      return false;
    }
  };

  const exportServerBackup = async () => {
    if (!currentUser) {
      exportBackup();
      return;
    }
    try {
      const blob = await apiExportBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pathly_backup_${currentUser.username}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('فایل پشتیبان کامل سرور دانلود شد.');
    } catch (err: any) {
      showToast(err.message || 'خطا در ایجاد پشتیبان');
    }
  };

  const importServerBackup = async (backupData: any): Promise<boolean> => {
    if (!currentUser) {
      return importBackup(typeof backupData === 'string' ? backupData : JSON.stringify(backupData));
    }
    try {
      setSyncStatus('syncing');
      await apiImportBackup(backupData);
      const dataRes = await apiFetchUserData();
      if (dataRes.exists && dataRes.data) {
        setState(dataRes.data);
      }
      setSyncStatus('synced');
      await refreshSnapshots();
      showToast('فایل پشتیبان با موفقیت در پایگاه داده اعمال گردید.');
      return true;
    } catch (err: any) {
      setSyncStatus('error');
      showToast(err.message || 'خطا در بازگردانی فایل پشتیبان');
      return false;
    }
  };

  const createManualSnapshot = async (reason?: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      return false;
    }
    try {
      setSyncStatus('syncing');
      await apiCreateSnapshot(reason || 'پشتیبان دستی کاربر');
      await refreshSnapshots();
      setSyncStatus('synced');
      showToast('نسخه پشتیبان لحظه‌ای (Snapshot) در پایگاه داده سرور ثبت شد.');
      return true;
    } catch (err: any) {
      setSyncStatus('error');
      showToast(err.message || 'خطا در ثبت نسخه پشتیبان');
      return false;
    }
  };

  const restoreFromTrash = (trashId: string) => {
    setState((prev: any) => {
      const item = (prev.trash || []).find((t: TrashItem) => t.id === trashId);
      if (!item) return prev;
      const remainingTrash = (prev.trash || []).filter((t: TrashItem) => t.id !== trashId);
      const updates: any = { trash: remainingTrash };

      switch (item.itemType) {
        case 'subject':
          updates.subjects = [...(prev.subjects || []), item.data];
          break;
        case 'homework':
          updates.homeworks = [...(prev.homeworks || []), item.data];
          break;
        case 'exam':
          updates.exams = [...(prev.exams || []), item.data];
          break;
        case 'skill':
          updates.skills = [...(prev.skills || []), item.data];
          break;
        case 'project':
          updates.projects = [...(prev.projects || []), item.data];
          break;
        case 'competition':
          updates.competitions = [...(prev.competitions || []), item.data];
          break;
        case 'goal':
          updates.goals = [...(prev.goals || []), item.data];
          break;
        case 'note':
          updates.notes = [...(prev.notes || []), item.data];
          break;
        case 'habit':
          updates.habits = [...(prev.habits || []), item.data];
          break;
        case 'calendarEvent':
          updates.calendarEvents = [...(prev.calendarEvents || []), item.data];
          break;
        case 'resource':
          updates.resources = [...(prev.resources || []), item.data];
          break;
      }
      return { ...prev, ...updates };
    });
    showToast('مورد با موفقیت از سطل بازیافت بازیابی شد.');
  };

  const emptyTrash = () => {
    setState((prev: any) => ({ ...prev, trash: [] }));
    showToast('سطل بازیافت کاملاً تخلیه گردید.');
  };

  const deleteFromTrashPermanently = (trashId: string) => {
    setState((prev: any) => ({
      ...prev,
      trash: (prev.trash || []).filter((t: TrashItem) => t.id !== trashId),
    }));
    showToast('مورد برای همیشه حذف شد.');
  };

  // ----------------- Life RPG Gamification -----------------
  const awardXP = async (eventId: string, amount: number, reason: string) => {
    const currentRpg = state.rpg || initialRPGState;
    if (currentRpg.awardedEventIds?.includes(eventId)) {
      return;
    }

    const safeAmount = Math.min(amount, 150);
    const newXp = (currentRpg.xp || 0) + safeAmount;
    const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
    const titles = [
      'نوآموز مسیر',
      'پوینده متمرکز',
      'شاگرد منضبط',
      'پژوهشگر سخت‌کوش',
      'استاد بهره‌وری',
      'قهرمان استمرار',
      'معمار موفقیت',
      'اسطوره پیشرفت',
    ];
    const newTitle = titles[Math.min(newLevel - 1, titles.length - 1)];
    const leveledUp = newLevel > (currentRpg.level || 1);

    setState((prev: any) => {
      const prevRpg = prev.rpg || initialRPGState;
      const awarded = [...(prevRpg.awardedEventIds || []), eventId];
      return {
        ...prev,
        rpg: {
          ...prevRpg,
          xp: newXp,
          level: newLevel,
          title: newTitle,
          awardedEventIds: awarded.slice(-500),
        },
      };
    });

    if (leveledUp) {
      showToast(`🌟 ارتقای سطح! تبریک! شما به سطح ${toPersianDigits(newLevel)} (${newTitle}) رسیدید!`);
    } else {
      showToast(`⚡ +${toPersianDigits(safeAmount)} امتیاز تجربه (${reason})`);
    }

    if (currentUser) {
      try {
        await apiAwardXP(eventId, safeAmount, reason);
      } catch (e) {
        console.warn('Server XP award sync:', e);
      }
    }
  };

  const toggleRPG = (enabled: boolean) => {
    setState((prev: any) => ({
      ...prev,
      rpg: {
        ...(prev.rpg || initialRPGState),
        enabled,
      },
    }));
    showToast(enabled ? 'سیستم بازی‌وارسازی فعال شد.' : 'سیستم بازی‌وارسازی غیرفعال شد.');
  };

  // ----------------- Rescue Mode -----------------
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);

  const generateRescuePlan = async (mode: RescueModeType): Promise<RescuePlan | null> => {
    const todayIndex = new Date().getDay() === 6 ? 0 : (new Date().getDay() + 1) % 7;
    const dayTasks = [
      ...(state.dayData?.[todayIndex]?.preSchoolTasks || []),
      ...(state.dayData?.[todayIndex]?.postSchoolTasks || []),
    ].filter((t: TaskItem) => !t.completed);

    const pendingHw = (state.homeworks || [])
      .filter((h: SchoolHomework) => !h.completed)
      .map((h: SchoolHomework) => ({
        id: h.id,
        title: `تکلیف ${h.subjectName}: ${h.title}`,
        priority: h.priority,
        estimatedMinutes: h.estimatedMinutes || 35,
        importance: 'high',
      }));

    const allIncomplete = [...dayTasks, ...pendingHw];
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    try {
      const res = await apiGenerateRescuePlan({
        mode,
        remainingTasks: allIncomplete,
        currentTime,
      });

      if (res.success && res.plan) {
        setState((prev: any) => ({
          ...prev,
          rescuePlan: res.plan,
        }));
        return res.plan;
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ارتباط با مشاور نجات روز');
    }
    return null;
  };

  const applyRescuePlan = (plan: RescuePlan) => {
    const todayIndex = new Date().getDay() === 6 ? 0 : (new Date().getDay() + 1) % 7;
    const newSteps: TaskItem[] = plan.suggestedSchedule.map((step) => ({
      id: `rescue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: step.title,
      completed: false,
      priority: 'high',
      startTime: step.timeSlot.split('-')[0]?.trim(),
      endTime: step.timeSlot.split('-')[1]?.trim(),
      estimatedMinutes: step.durationMin,
      notes: step.note || 'تولید شده توسط حالت نجات روز',
      section: 'general',
    }));

    setState((prev: any) => {
      const curDay = prev.dayData?.[todayIndex] || { dayIndex: todayIndex, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '', overallRating: null };
      return {
        ...prev,
        rescuePlan: plan,
        dayData: {
          ...prev.dayData,
          [todayIndex]: {
            ...curDay,
            postSchoolTasks: [...curDay.postSchoolTasks, ...newSteps],
          },
        },
      };
    });

    awardXP(`rescue_${Date.now()}`, 30, 'اقدام در حالت نجات روز');
    showToast('برنامه اضطراری با موفقیت در جدول کارهای امروز اعمال شد.');
    setIsRescueModalOpen(false);
  };

  const clearRescuePlan = () => {
    setState((prev: any) => ({
      ...prev,
      rescuePlan: null,
    }));
  };

  // ----------------- Smart Daily Planning & Feasibility Simulation -----------------
  const simulateSchedule = (tasks: TaskItem[], availableMinutes: number): ScheduleSimulation => {
    const totalRequiredMinutes = tasks.reduce((acc, t) => acc + (Number(t.estimatedMinutes) || 30), 0);
    const varianceMinutes = availableMinutes - totalRequiredMinutes;
    let feasibilityStatus: 'comfortable' | 'tight' | 'impossible' = 'comfortable';
    let score = 100;
    const suggestions: string[] = [];

    if (varianceMinutes < 0) {
      feasibilityStatus = 'impossible';
      score = Math.max(10, Math.round((availableMinutes / (totalRequiredMinutes || 1)) * 100));
      suggestions.push(`کمبود زمان: ${toPersianDigits(Math.abs(varianceMinutes))} دقیقه کم دارید. کارهای کم‌اهمیت‌تر را به فردا منتقل کنید.`);
      suggestions.push('مدت‌زمان برخی وظایف را به بازه‌های متمرکز ۲۰ دقیقه‌ای کاهش دهید.');
    } else if (varianceMinutes < 45) {
      feasibilityStatus = 'tight';
      score = 75;
      suggestions.push('برنامه شما فشرده است. زمان‌های استراحت کوتاه‌تری خواهید داشت.');
    } else {
      suggestions.push('تطابق عالی! زمان آزاد کافی برای تمام وظایف و استراحت‌ها وجود دارد.');
    }

    return {
      totalRequiredMinutes,
      availableMinutes,
      varianceMinutes,
      feasibilityStatus,
      score,
      suggestions,
    };
  };

  const [simulationResult, setSimulationResult] = useState<ScheduleSimulation | null>(null);

  const generateSmartSchedule = async (availableMinutes: number = 240, startTime: string = '16:00', focusGoal: string = '') => {
    const todayIndex = new Date().getDay() === 6 ? 0 : (new Date().getDay() + 1) % 7;
    const tasks = [
      ...(state.dayData?.[todayIndex]?.preSchoolTasks || []),
      ...(state.dayData?.[todayIndex]?.postSchoolTasks || []),
    ];

    const sim = simulateSchedule(tasks, availableMinutes);
    setSimulationResult(sim);

    try {
      const res = await apiGenerateSmartPlan({
        tasks,
        availableMinutes,
        startTime,
        focusGoal,
      });

      if (res.success && res.schedule) {
        setState((prev: any) => ({
          ...prev,
          smartSchedule: res.schedule,
        }));
        showToast('برنامه بهینه با موفقیت آماده شد.');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در برنامه‌ریزی هوشمند');
    }
    return null;
  };

  const applyProposedSchedule = (schedule: any[]) => {
    const todayIndex = new Date().getDay() === 6 ? 0 : (new Date().getDay() + 1) % 7;
    setState((prev: any) => {
      const curDay = prev.dayData?.[todayIndex] || { dayIndex: todayIndex, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '', overallRating: null };
      const updatedPost = curDay.postSchoolTasks.map((t: TaskItem) => {
        const match = schedule.find((s) => s.taskId === t.id);
        if (match && match.timeSlot) {
          const parts = match.timeSlot.split('-');
          return {
            ...t,
            startTime: parts[0]?.trim(),
            endTime: parts[1]?.trim(),
          };
        }
        return t;
      });
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          [todayIndex]: {
            ...curDay,
            postSchoolTasks: updatedPost,
          },
        },
      };
    });
    awardXP(`plan_apply_${Date.now()}`, 20, 'برنامه‌ریزی دقیق روز');
    showToast('برنامه پیشنهادی با موفقیت در وظایف امروز اعمال شد.');
  };

  // ----------------- Active Focus Session (Pomodoro) -----------------
  const startActiveFocus = (params: {
    taskId?: string;
    taskTitle: string;
    section: SectionType;
    targetMinutes: number;
    mode: 'work' | 'short_break' | 'long_break';
  }) => {
    const session: ActiveFocusSession = {
      id: `foc-${Date.now()}`,
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      section: params.section,
      mode: params.mode,
      targetMinutes: params.targetMinutes,
      elapsedSeconds: 0,
      isRunning: true,
      lastUpdatedTimestamp: Date.now(),
    };
    setState((prev: any) => ({
      ...prev,
      activeFocus: session,
    }));
    showToast(`جلسه تمرکز روی «${params.taskTitle}» آغاز شد.`);
  };

  const pauseActiveFocus = () => {
    setState((prev: any) => {
      if (!prev.activeFocus) return prev;
      return {
        ...prev,
        activeFocus: { ...prev.activeFocus, isRunning: false },
      };
    });
  };

  const resumeActiveFocus = () => {
    setState((prev: any) => {
      if (!prev.activeFocus) return prev;
      return {
        ...prev,
        activeFocus: { ...prev.activeFocus, isRunning: true, lastUpdatedTimestamp: Date.now() },
      };
    });
  };

  const tickActiveFocus = (elapsedSeconds: number) => {
    setState((prev: any) => {
      if (!prev.activeFocus) return prev;
      return {
        ...prev,
        activeFocus: {
          ...prev.activeFocus,
          elapsedSeconds,
          lastUpdatedTimestamp: Date.now(),
        },
      };
    });
  };

  const finishActiveFocus = (actualMinutes?: number, focusScore: number = 5) => {
    const active = state.activeFocus;
    if (!active) return;
    const finalMinutes = actualMinutes ?? Math.max(1, Math.round(active.elapsedSeconds / 60));

    const studySession: Omit<StudySession, 'id'> = {
      subjectName: active.taskTitle,
      topic: active.mode === 'work' ? 'تمرکز عمیق (پومودورو)' : 'استراحت',
      date: new Date().toISOString().slice(0, 10),
      startTime: new Date(Date.now() - finalMinutes * 60000).toTimeString().slice(0, 5),
      expectedDurationMin: active.targetMinutes,
      actualDurationMin: finalMinutes,
      focusScore,
      outcomeNotes: `جلسه تمرکز ثبت‌شده روی «${active.taskTitle}»`,
      type: active.section,
    };

    addStudySession(studySession);
    awardXP(`focus_${active.id}`, Math.round(finalMinutes * 1.5), `تکمیل ${toPersianDigits(finalMinutes)} دقیقه تمرکز عمیق`);

    setState((prev: any) => ({
      ...prev,
      activeFocus: null,
    }));
    showToast(`🎉 تبریک! جلسه تمرکز ${toPersianDigits(finalMinutes)} دقیقه‌ای ثبت شد.`);
  };

  const cancelActiveFocus = () => {
    setState((prev: any) => ({
      ...prev,
      activeFocus: null,
    }));
    showToast('جلسه تمرکز متوقف گردید.');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        currentUser,
        isAuthenticated: !!currentUser,
        authLoading,
        syncStatus,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialTab,
        openAuthModal,
        login,
        register,
        logout,
        updateAuthProfile,
        changePassword,
        resetPassword,
        requestPasswordResetToken,
        resetPasswordWithToken,
        checkAvailability,
        deleteAccount,
        syncWithServer,
        serverSnapshots,
        refreshSnapshots,
        restoreServerSnapshot,
        exportServerBackup,
        importServerBackup,
        reviews: state.reviews || [],
        resources: state.resources || [],
        inboxItems: state.inboxItems || [],
        addReviewItem,
        updateReviewItem,
        deleteReviewItem,
        submitReviewOutcome,
        addResource,
        updateResource,
        deleteResource,
        toggleResourcePinned,
        addInboxItem,
        updateInboxItem,
        deleteInboxItem,
        convertInboxToTask,
        addPlannedTask,
        updatePlannedTask,
        deletePlannedTask,
        toggleTaskSubtask,
        addTaskSubtask,
        rescheduleTask,
        exportTasksCSV,
        exportStudySessionsCSV,
        exportGradesCSV,
        exportSkillsCSV,
        validateBackupData,
        updateProfile,
        addSubject,
        updateSubject,
        deleteSubject,
        addGrade,
        deleteGrade,
        updateWeeklyCell,
        clearWeeklyCell,
        updateDayData,
        addPreSchoolTask,
        togglePreSchoolTask,
        deletePreSchoolTask,
        addPostSchoolTask,
        togglePostSchoolTask,
        deletePostSchoolTask,
        setDayRating,
        addHomework,
        updateHomework,
        toggleHomework,
        deleteHomework,
        addExam,
        updateExam,
        toggleExam,
        deleteExam,
        addStudySession,
        deleteStudySession,
        addSkill,
        updateSkill,
        deleteSkill,
        toggleSkillRoadmapStep,
        addSkillRoadmapStep,
        logSkillPractice,
        addSkillWeakness,
        removeSkillWeakness,
        addSkillResource,
        toggleSkillResource,
        addSkillExercise,
        toggleSkillExercise,
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
        addCompetition,
        updateCompetition,
        deleteCompetition,
        toggleCompetitionStage,
        toggleCompetitionTopic,
        addCompetitionTopic,
        addCompetitionMockExam,
        updateSolvedProblems,
        addCompetitionWeakness,
        removeCompetitionWeakness,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoalMilestone,
        addGoalMilestone,
        addWeeklyReview,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarEventCompleted,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePinned,
        addActivityLog,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        habits: state.habits || [],
        addHabit,
        toggleHabitToday,
        deleteHabit,
        updateHabit,
        widgetConfig: state.widgetConfig || initialWidgetConfig,
        updateWidgetConfig,
        rolloverOverdueTasks,
        toastMessage,
        showToast,
        exportBackup,
        importBackup,
        resetToDefault,
        clearAllData,
        createManualSnapshot,
        trash: state.trash || [],
        restoreFromTrash,
        emptyTrash,
        deleteFromTrashPermanently,
        customization,
        updateCustomization,
        resetCustomization,
        getSectionTitle,
        themeMode: currentThemeMode,
        resolvedTheme,
        setThemeMode,
        rpg: state.rpg || initialRPGState,
        awardXP,
        toggleRPG,
        rescuePlan: state.rescuePlan || null,
        isRescueModalOpen,
        setIsRescueModalOpen,
        generateRescuePlan,
        applyRescuePlan,
        clearRescuePlan,
        smartSchedule: state.smartSchedule || [],
        simulationResult,
        generateSmartSchedule,
        applyProposedSchedule,
        simulateSchedule,
        activeFocus: state.activeFocus || null,
        startActiveFocus,
        pauseActiveFocus,
        resumeActiveFocus,
        tickActiveFocus,
        finishActiveFocus,
        cancelActiveFocus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
