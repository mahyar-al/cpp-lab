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
  Habit,
  DashboardWidgetConfig,
  SpacedReviewItem,
  KnowledgeResource,
  QuickInboxItem,
  FocusTimerSettings,
  NavTab,
  UserCustomization,
} from '../types';

export const DEFAULT_SECTION_NAMES: Record<NavTab, string> = {
  home: 'صفحه اصلی (معرفی الف)',
  dashboard: 'داشبورد',
  daily_planner: 'برنامه‌ریز روزانه',
  school: 'مدرسه و درس‌ها',
  skills: 'مهارت‌ها',
  projects: 'پروژه‌ها',
  competitions: 'مسابقات و المپیاد',
  habits: 'عادت‌ها',
  reviews: 'مرور فاصله‌دار',
  focus_timer: 'تایمر تمرکز',
  resources: 'کتابخانه منابع',
  calendar: 'تقویم رویدادها',
  goals: 'اهداف',
  notes: 'یادداشت‌ها',
  analytics: 'آمار و عملکرد',
  settings: 'تنظیمات',
};

export const DEFAULT_NAV_ORDER: NavTab[] = [
  'home',
  'dashboard',
  'daily_planner',
  'school',
  'skills',
  'projects',
  'competitions',
  'habits',
  'reviews',
  'focus_timer',
  'resources',
  'calendar',
  'goals',
  'notes',
  'analytics',
  'settings',
];

export const DEFAULT_DASHBOARD_CARDS = [
  { id: 'quick_stats', label: 'خلاصه ساعات مطالعه و آمار', category: 'آمار' },
  { id: 'today_priority', label: 'اولویت‌های امروز', category: 'وظایف' },
  { id: 'school_schedule', label: 'برنامه مدرسه امروز', category: 'مدرسه' },
  { id: 'habits', label: 'عادت‌ها و استمرار', category: 'عادت‌ها' },
  { id: 'active_projects', label: 'پروژه‌های جاری', category: 'پروژه‌ها' },
  { id: 'reviews_due', label: 'مرورهای امروز', category: 'یادگیری' },
  { id: 'study_chart', label: 'نمودار مطالعه هفتگی', category: 'آمار' },
  { id: 'mini_calendar', label: 'تقویم ماه جاری', category: 'تقویم' },
  { id: 'section_progress', label: 'پیشرفت مهارت‌ها و اهداف', category: 'پیشرفت' },
  { id: 'recent_activity', label: 'فعالیت‌های اخیر', category: 'سیستم' },
];

export const initialCustomization: UserCustomization = {
  sectionNames: { ...DEFAULT_SECTION_NAMES },
  hiddenSections: [],
  navOrder: [...DEFAULT_NAV_ORDER],
  themeMode: 'dark',
  accentColor: 'amber',
  secondaryAccent: 'emerald',
  borderRadius: 'medium',
  glowIntensity: 'none',
  fontSize: 'normal',
  density: 'comfortable',
  dashboardCardsOrder: DEFAULT_DASHBOARD_CARDS.map((c) => c.id),
  hiddenDashboardCards: [],
  dashboardColumns: 'auto',
};

export const initialWidgetConfig: DashboardWidgetConfig = {
  showTodaySchedule: true,
  showTodayPriority: true,
  showMiniCalendar: true,
  showStudyHoursChart: true,
  showSectionProgress: true,
  showHabits: true,
  showRecentActivity: true,
  showTomorrowSchedule: true,
  showFocusWidget: true,
  showReviewsDue: true,
  showFreeTimeMetric: true,
};

export const initialFocusSettings: FocusTimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  autoLogSessions: true,
};

export const initialProfile: UserProfile = {
  name: 'کاربر',
  gradeOrField: 'دانش‌آموز / یادگیرنده',
  avatarSeed: 'cyber-neon',
  theme: 'dark',
  enableBrowserNotifications: true,
  studyTargetDailyHours: 4,
  widgetConfig: initialWidgetConfig,
  focusSettings: initialFocusSettings,
  customization: initialCustomization,
  bellTimes: [
    { period: 1, title: 'زنگ اول', startTime: '07:30', endTime: '09:00' },
    { period: 2, title: 'زنگ دوم', startTime: '09:15', endTime: '10:45' },
    { period: 3, title: 'زنگ سوم', startTime: '11:00', endTime: '12:30' },
    { period: 4, title: 'زنگ چهارم', startTime: '13:00', endTime: '14:15' },
    { period: 5, title: 'زنگ پنجم', startTime: '14:30', endTime: '15:30' },
  ],
};

// All collections start completely empty as requested
export const initialSubjects: SchoolSubject[] = [];

export const initialGrades: SubjectGrade[] = [];

export const initialWeeklyCells: WeeklyTimetableCell[] = [];

export const initialTimetable: WeeklyTimetableCell[] = initialWeeklyCells;

export const initialDaySpecificData: DaySpecificData[] = [];

export const initialDayDataMap: Record<number, DaySpecificData> = {
  0: { dayIndex: 0, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  1: { dayIndex: 1, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  2: { dayIndex: 2, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  3: { dayIndex: 3, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  4: { dayIndex: 4, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
};

export const initialHomeworks: SchoolHomework[] = [];

export const initialHomework: SchoolHomework[] = initialHomeworks;

export const initialExams: SchoolExamItem[] = [];

export const initialStudySessions: StudySession[] = [];

export const initialSkills: Skill[] = [];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'پلتفرم برنامه‌ریزی هوشمند الف',
    description: 'سامانه یکپارچه مدیریت یادگیری، تقویم شمسی، پیگیری اهداف و بایگانی هفتگی با ری‌اکت و تایپ‌اسکریپت',
    category: 'وب و فول‌استک',
    startDate: '2026-10-01',
    deadline: '2026-11-25',
    status: 'in_progress',
    priority: 'high',
    targetsAndDeliverables: 'استقرار نسخه تولیدی، اتصال پایگاه داده چندکاربره و تکمیل پوشه‌های شیشه‌ای سه‌بعدی',
    progressPercentage: 65,
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Vite', 'Express'],
    githubUrl: 'https://github.com/mahyar-al/cpp-lab',
    demoUrl: 'https://alefplans.local',
    techNotes: 'معماری بر پایه کامپوننت‌های مدرن، افکت‌های شیشه‌ای و پایگاه داده چندکاربره طراحی شده است.',
    knownBugs: [
      { id: 'b-1', title: 'بهینه‌سازی رندر در صفحات با داده زیاد', resolved: false, severity: 'medium' },
    ],
    tasks: [
      {
        id: 'pt-1',
        title: 'طراحی پوشه‌های شیشه‌ای سه‌بعدی برای پروژه‌ها',
        status: 'completed',
        priority: 'high',
        estimatedHours: 4,
        actualHours: 3.5,
        subtasks: [
          { id: 'st-1', title: 'پیاده‌سازی نویز procedural و پرسپکتیو', done: true },
          { id: 'st-2', title: 'اتصال رویدادهای فیزیک و باز شدن برگه‌ها', done: true },
        ],
      },
      {
        id: 'pt-2',
        title: 'یکپارچه‌سازی با برد کانبان و مدیریت تسک‌ها',
        status: 'in_progress',
        priority: 'high',
        estimatedHours: 5,
        actualHours: 2,
        subtasks: [
          { id: 'st-3', title: 'نمایش پوشه به عنوان کارت پروژه', done: true },
          { id: 'st-4', title: 'جابجایی بین نمای شیشه‌ای و کانبان', done: false },
        ],
      },
      {
        id: 'pt-3',
        title: 'تست ریسپانسیو روی تبلت و موبایل',
        status: 'todo',
        priority: 'medium',
        estimatedHours: 3,
        subtasks: [],
      },
    ],
    activityLogs: [
      { id: 'pal-1', timestamp: '2026-10-20T10:00:00Z', action: 'پروژه ایجاد شد' },
      { id: 'pal-2', timestamp: '2026-10-25T14:30:00Z', action: 'تسک‌های فاز دوم تعریف شدند' },
    ],
  },
  {
    id: 'proj-2',
    title: 'موتور شبیه‌سازی الگوریتم‌های المپیاد',
    description: 'کتابخانه محاسباتی و بصری‌سازی ساختارهای داده و الگوریتم‌های گراف در ++C و وب‌اسمبلی',
    category: 'هوش مصنوعی و الگوریتم',
    startDate: '2026-10-10',
    deadline: '2026-12-15',
    status: 'in_progress',
    priority: 'medium',
    targetsAndDeliverables: 'حل ۵۰ مسئله تستی مرحله دوم و شبیه‌سازی گراف‌های سنگین',
    progressPercentage: 40,
    techStack: ['C++ 20', 'WebAssembly', 'HTML5 Canvas'],
    githubUrl: 'https://github.com/mahyar-al/cpp-lab',
    techNotes: 'کامپایل کدهای ++C از طریق Emscripten به ماژول WebAssembly در مرورگر.',
    knownBugs: [],
    tasks: [
      {
        id: 'pt-201',
        title: 'پیاده‌سازی دایکسترا و سگمنت‌تری',
        status: 'completed',
        priority: 'high',
        estimatedHours: 6,
        actualHours: 5.5,
        subtasks: [],
      },
      {
        id: 'pt-202',
        title: 'رابط تعاملی بصری‌سازی نودها و یال‌ها',
        status: 'in_progress',
        priority: 'medium',
        estimatedHours: 8,
        actualHours: 4,
        subtasks: [],
      },
    ],
    activityLogs: [
      { id: 'pal-201', timestamp: '2026-10-12T12:00:00Z', action: 'راه‌اندازی ساختار مخزن' },
    ],
  },
];

export const initialCompetitions: Competition[] = [];

export const initialGoals: Goal[] = [];

export const initialWeeklyReviews: WeeklyReview[] = [
  {
    id: 'wr-1',
    weekStartDate: '2026-10-18',
    weekEndDate: '2026-10-24',
    totalStudyHours: 24.5,
    completedTasksSummary: 'تحویل پروژه، مطالعه فصل ۲ هندسه، حل ۱۲۰ تست شیمی',
    unfinishedTasksSummary: 'مرور بخش الکتریسیته ساکن فیزیک',
    biggestWin: 'ثبت رکورد ۲۴.۵ ساعت مطالعه با تمرکز بالا و کسب نمره کامل کوئیز گسسته',
    nextWeekPriorities: 'آمادگی برای آزمون آزمایشی المپیاد و مبحث ترکیبیات',
    createdAt: '2026-10-24T18:30:00.000Z',
  },
  {
    id: 'wr-2',
    weekStartDate: '2026-10-11',
    weekEndDate: '2026-10-17',
    totalStudyHours: 19,
    completedTasksSummary: 'تکمیل تمرین‌های حسابان، ۲ جلسه تمرین کدنویسی C++',
    unfinishedTasksSummary: 'خلاصه‌نویسی لایتنر درس عربی',
    biggestWin: 'حفظ زنجیره مطالعه ۷ روز متوالی بدون وقفه',
    nextWeekPriorities: 'تمرکز بر نقاط ضعف درس زیست و اتمام ساختار دیتابیس',
    createdAt: '2026-10-17T19:00:00.000Z',
  },
];

export const initialCalendarEvents: CalendarEvent[] = [];

export const initialNotes: Note[] = [];

export const initialActivityLogs: ActivityLogItem[] = [];

export const initialNotifications: ReminderNotification[] = [];

export const initialHabits: Habit[] = [];

export const initialReviews: SpacedReviewItem[] = [];

export const initialResources: KnowledgeResource[] = [];

export const initialInboxItems: QuickInboxItem[] = [];

export const initialRPGState = {
  enabled: true,
  xp: 0,
  level: 1,
  title: 'نوآموز مسیر',
  awardedEventIds: [] as string[],
  dailyQuests: [
    {
      id: 'dq_1',
      title: 'شروع پرانرژی',
      description: 'انجام حداقل ۲ وظیفه مهم یا تکلیف روزانه',
      type: 'daily' as const,
      xpReward: 35,
      targetValue: 2,
      currentValue: 0,
      completed: false,
      category: 'general' as const,
      icon: 'CheckCircle2',
    },
    {
      id: 'dq_2',
      title: 'راهب تمرکز',
      description: 'ثبت حداقل ۳۰ دقیقه جلسه تمرکز عمیق (پومودورو)',
      type: 'daily' as const,
      xpReward: 40,
      targetValue: 30,
      currentValue: 0,
      completed: false,
      category: 'school' as const,
      icon: 'Timer',
    },
    {
      id: 'dq_3',
      title: 'مرور هوشمندانه',
      description: 'مرور حداقل ۱ موضوع فاصله‌دار در موعد مقرر',
      type: 'daily' as const,
      xpReward: 30,
      targetValue: 1,
      currentValue: 0,
      completed: false,
      category: 'general' as const,
      icon: 'Sparkles',
    },
  ],
  weeklyQuests: [
    {
      id: 'wq_1',
      title: 'استمرار قهرمانانه',
      description: 'ثبت عادت‌ها در حداقل ۵ روز در طول این هفته',
      type: 'weekly' as const,
      xpReward: 120,
      targetValue: 5,
      currentValue: 0,
      completed: false,
      category: 'general' as const,
      icon: 'Flame',
    },
    {
      id: 'wq_2',
      title: 'پیشرفت در پروژه یا مهارت',
      description: 'تکمیل یک نقطه عطف، تسک پروژه یا مرحله مهارت',
      type: 'weekly' as const,
      xpReward: 100,
      targetValue: 1,
      currentValue: 0,
      completed: false,
      category: 'project' as const,
      icon: 'Rocket',
    },
    {
      id: 'wq_3',
      title: 'فتح اهداف هفتگی',
      description: 'کسب مجموع ۲۰۰ امتیاز تجربه در طول هفته',
      type: 'weekly' as const,
      xpReward: 80,
      targetValue: 200,
      currentValue: 0,
      completed: false,
      category: 'general' as const,
      icon: 'Trophy',
    },
  ],
  achievements: [
    {
      id: 'ach_first_task',
      title: 'گام نخستین',
      description: 'اولین وظیفه روزانه را با موفقیت تکمیل کنید',
      icon: 'Zap',
      category: 'general' as const,
      tier: 'bronze' as const,
    },
    {
      id: 'ach_focus_100',
      title: 'استاد تمرکز',
      description: 'مجموعاً ۱۰۰ دقیقه تمرکز عمیق ثبت کنید',
      icon: 'Timer',
      category: 'study' as const,
      tier: 'silver' as const,
    },
    {
      id: 'ach_streak_7',
      title: 'توالی آتشین',
      description: 'زنجیره انجام یک عادت را به ۷ روز متوالی برسانید',
      icon: 'Flame',
      category: 'habit' as const,
      tier: 'gold' as const,
    },
    {
      id: 'ach_skill_master',
      title: 'معمار دانش',
      description: 'یک مهارت یا نقشه راه را به سطح پیشرفته برسانید',
      icon: 'Award',
      category: 'general' as const,
      tier: 'master' as const,
    },
  ],
};

