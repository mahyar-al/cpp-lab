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
} from '../types';

export const initialWidgetConfig: DashboardWidgetConfig = {
  showTodaySchedule: true,
  showTodayPriority: true,
  showMiniCalendar: true,
  showStudyHoursChart: true,
  showSectionProgress: true,
  showHabits: true,
  showRecentActivity: true,
};

export const initialProfile: UserProfile = {
  name: 'مهیار',
  gradeOrField: 'پایه یازدهم ریاضی / المپیاد کامپیوتر',
  avatarSeed: 'mahyar',
  theme: 'light',
  enableBrowserNotifications: true,
  studyTargetDailyHours: 4.5,
  widgetConfig: initialWidgetConfig,
  bellTimes: [
    { period: 1, title: 'زنگ اول', startTime: '07:30', endTime: '09:00' },
    { period: 2, title: 'زنگ دوم', startTime: '09:15', endTime: '10:45' },
    { period: 3, title: 'زنگ سوم', startTime: '11:00', endTime: '12:30' },
    { period: 4, title: 'زنگ چهارم', startTime: '13:00', endTime: '14:15' },
    { period: 5, title: 'زنگ پنجم', startTime: '14:30', endTime: '15:30' },
  ],
};

export const initialSubjects: SchoolSubject[] = [
  {
    id: 'sub-1',
    name: 'حسابان و دیفرانسیل',
    teacher: 'دکتر علوی',
    room: 'کلاس ۲۰۱',
    color: '#3b82f6',
    notes: 'تمرکز بر مشتق و کاربرد آن، حل تمرینات آخر فصل ۲',
    studyRange: 'فصل ۲ (مشتق توابع مقدماتی)',
    reviewSchedule: 'شنبه‌ها و سه‌شنبه‌ها',
  },
  {
    id: 'sub-2',
    name: 'فیزیک',
    teacher: 'استاد حسینی',
    room: 'آزمایشگاه فیزیک',
    color: '#8b5cf6',
    notes: 'مبحث الکتریسیته ساکن و خازن‌ها، فرمول‌های انرژی پتانسیل الکتریکی',
    studyRange: 'صفحه ۳۵ تا ۵۸',
    reviewSchedule: 'یکشنبه‌ها و چهارشنبه‌ها',
  },
  {
    id: 'sub-3',
    name: 'شیمی',
    teacher: 'مهندس رضایی',
    room: 'کلاس ۲۰۳',
    color: '#10b981',
    notes: 'استوکیومتری و واکنش‌های آلی',
    studyRange: 'فصل ۱ کامل',
    reviewSchedule: 'دوشنبه‌ها',
  },
  {
    id: 'sub-4',
    name: 'هندسه و گسسته',
    teacher: 'استاد مرادی',
    room: 'کلاس ۲۰۵',
    color: '#f59e0b',
    notes: 'ماتریس‌ها و نظریه گراف مقدماتی',
    studyRange: 'فصل نظریه گراف',
    reviewSchedule: 'شنبه‌ها و دوشنبه‌ها',
  },
];

export const initialGrades: SubjectGrade[] = [
  {
    id: 'gr-1',
    subjectId: 'sub-1',
    title: 'مستمر مهرماه حسابان',
    score: 19.5,
    maxScore: 20,
    date: '2026-10-10',
    weight: 1,
    notes: 'عملکرد عالی در مشتق زنجیره‌ای',
  },
  {
    id: 'gr-2',
    subjectId: 'sub-2',
    title: 'کوییز فیزیک الکتریسیته',
    score: 18,
    maxScore: 20,
    date: '2026-10-12',
    weight: 0.5,
    notes: 'نیاز به تمرین بیشتر در مسائل مدار ترکیبی',
  },
  {
    id: 'gr-3',
    subjectId: 'sub-3',
    title: 'پرسش کلاسی شیمی',
    score: 20,
    maxScore: 20,
    date: '2026-10-14',
    weight: 1,
    notes: 'پاسخ کامل به تمام سوالات ساختار لوییس',
  },
];

export const initialWeeklyCells: WeeklyTimetableCell[] = [
  // 0: شنبه
  { dayIndex: 0, period: 1, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 0, period: 2, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 0, period: 3, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  { dayIndex: 0, period: 4, subjectId: 'sub-2', room: 'آزمایشگاه', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 0, period: 5, subjectId: 'sub-3', room: '۲۰۳', teacher: 'مهندس رضایی', color: '#10b981' },
  // 1: یکشنبه
  { dayIndex: 1, period: 1, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 1, period: 2, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 1, period: 3, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 1, period: 4, subjectId: 'sub-3', room: '۲۰۳', teacher: 'مهندس رضایی', color: '#10b981' },
  { dayIndex: 1, period: 5, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  // 2: دوشنبه
  { dayIndex: 2, period: 1, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  { dayIndex: 2, period: 2, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  { dayIndex: 2, period: 3, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 2, period: 4, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 2, period: 5, subjectId: 'sub-3', room: '۲۰۳', teacher: 'مهندس رضایی', color: '#10b981' },
  // 3: سه‌شنبه
  { dayIndex: 3, period: 1, subjectId: 'sub-3', room: '۲۰۳', teacher: 'مهندس رضایی', color: '#10b981' },
  { dayIndex: 3, period: 2, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 3, period: 3, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 3, period: 4, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  { dayIndex: 3, period: 5, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  // 4: چهارشنبه
  { dayIndex: 4, period: 1, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
  { dayIndex: 4, period: 2, subjectId: 'sub-3', room: '۲۰۳', teacher: 'مهندس رضایی', color: '#10b981' },
  { dayIndex: 4, period: 3, subjectId: 'sub-1', room: '۲۰۱', teacher: 'دکتر علوی', color: '#3b82f6' },
  { dayIndex: 4, period: 4, subjectId: 'sub-4', room: '۲۰۵', teacher: 'استاد مرادی', color: '#f59e0b' },
  { dayIndex: 4, period: 5, subjectId: 'sub-2', room: '۲۰۲', teacher: 'استاد حسینی', color: '#8b5cf6' },
];

export const initialTimetable = initialWeeklyCells;

const todayIso = new Date().toISOString().slice(0, 10);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowIso = tomorrow.toISOString().slice(0, 10);

const twoDaysLater = new Date();
twoDaysLater.setDate(twoDaysLater.getDate() + 2);
const twoDaysLaterIso = twoDaysLater.toISOString().slice(0, 10);

export const initialHomeworks: SchoolHomework[] = [
  {
    id: 'hw-1',
    dayIndex: 0,
    subjectId: 'sub-1',
    subjectName: 'حسابان و دیفرانسیل',
    title: 'حل تمرین‌های صفحه ۴۲ تا ۴۵ کتاب درسی (مسائل بهینه‌سازی)',
    description: 'تمام مسائل مربوط به بیشترین مساحت مستطیل محاط در نیم‌دایره حل شود.',
    completed: false,
    dueDate: tomorrowIso,
    priority: 'high',
    estimatedMinutes: 60,
  },
  {
    id: 'hw-2',
    dayIndex: 1,
    subjectId: 'sub-2',
    subjectName: 'فیزیک',
    title: 'محاسبه ظرفیت خازن‌های مدار موازی و سری در کتاب کار',
    description: '۱۰ تست تشریحی همراه با رسم دیاگرام مدار',
    completed: false,
    dueDate: twoDaysLaterIso,
    priority: 'medium',
    estimatedMinutes: 45,
  },
  {
    id: 'hw-3',
    dayIndex: 2,
    subjectId: 'sub-3',
    subjectName: 'شیمی',
    title: 'موازنه واکنش‌های اکسایش-کاهش به روش یون-الکترون',
    description: 'برگه تمرین کلاسی تحویل داده شود.',
    completed: true,
    dueDate: todayIso,
    priority: 'low',
    estimatedMinutes: 30,
  },
];

export const initialHomework = initialHomeworks;

export const initialExams: SchoolExamItem[] = [
  {
    id: 'ex-1',
    subjectId: 'sub-1',
    subjectName: 'حسابان و دیفرانسیل',
    title: 'آزمون میان‌ترم نیم‌سال اول',
    type: 'exam',
    date: twoDaysLaterIso,
    time: '08:00',
    chapters: 'فصل ۱ و ۲ تا ابتدای مشتق مراتب بالاتر',
    completed: false,
    priority: 'high',
    notes: 'نیاز به مرور فرمول‌های مثلثاتی پیشرفته',
  },
  {
    id: 'ex-2',
    subjectId: 'sub-2',
    subjectName: 'فیزیک',
    title: 'کوییز مبحث میدان و پتانسیل الکتریکی',
    type: 'quiz',
    date: tomorrowIso,
    time: '09:15',
    chapters: 'فصل اول مبحث خطوط میدان',
    completed: false,
    priority: 'medium',
    notes: 'آزمون تستی ۱۰ سوالی در ابتدای زنگ دوم',
  },
];

export const initialDaySpecificData: DaySpecificData[] = [
  {
    dayIndex: 0,
    overallRating: 'excellent',
    preSchoolTasks: [
      { id: 'pre-0-1', title: 'مرور خلاصه فرمول‌های حسابان قبل زنگ', completed: true, priority: 'high', dueTime: '07:15' },
    ],
    postSchoolTasks: [
      { id: 'post-0-1', title: 'حل ۲ سری تمرین مشتق', completed: false, priority: 'high', dueTime: '16:30' },
      { id: 'post-0-2', title: 'استراحت و پیاده‌روی نیم‌ساعته', completed: true, priority: 'low', dueTime: '18:00' },
    ],
    notes: 'امروز زنگ اول و دوم تدریس عمیق بود و یادداشت‌برداری کامل انجام شد.',
    reflectionReport: 'تمرکز بالا بود و تکالیف تا قبل از ساعت ۲۰ تحویل شدند.',
  },
  {
    dayIndex: 1,
    overallRating: null,
    preSchoolTasks: [
      { id: 'pre-1-1', title: 'آماده‌سازی دفتر آزمایشگاه فیزیک', completed: false, priority: 'medium', dueTime: '07:15' },
    ],
    postSchoolTasks: [
      { id: 'post-1-1', title: 'مرور مبحث مدارهای خازنی', completed: false, priority: 'medium', dueTime: '17:00' },
    ],
    notes: '',
    reflectionReport: '',
  },
  { dayIndex: 2, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  { dayIndex: 3, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
  { dayIndex: 4, overallRating: null, preSchoolTasks: [], postSchoolTasks: [], notes: '', reflectionReport: '' },
];

export const initialDayDataMap: Record<number, DaySpecificData> = {
  0: initialDaySpecificData[0],
  1: initialDaySpecificData[1],
  2: initialDaySpecificData[2],
  3: initialDaySpecificData[3],
  4: initialDaySpecificData[4],
};

export const initialStudySessions: StudySession[] = [
  {
    id: 'ss-1',
    subjectName: 'حسابان و دیفرانسیل',
    subjectId: 'sub-1',
    topic: 'مسائل بهینه‌سازی و مشتق توابع کسری',
    date: todayIso,
    startTime: '16:00',
    expectedDurationMin: 60,
    actualDurationMin: 55,
    focusScore: 5,
    outcomeNotes: 'حل کامل ۵ تست از کتاب نشر الگو، بدون چک کردن پاسخنامه',
    type: 'school',
  },
  {
    id: 'ss-2',
    subjectName: 'الگوریتم C++',
    topic: 'پیاده‌سازی درخت سگمنت (Segment Tree) با Lazy Propagation',
    date: todayIso,
    startTime: '17:30',
    expectedDurationMin: 90,
    actualDurationMin: 85,
    focusScore: 4,
    outcomeNotes: 'حل یک سوال Codeforces ریتینگ ۱۸۰۰ با موفقیت',
    type: 'skill',
  },
];

export const initialSkills: Skill[] = [
  {
    id: 'skill-1',
    name: 'الگوریتم و ساختار داده با C++',
    category: 'programming',
    currentLevel: 'متوسط',
    targetLevel: 'تسلط کامل',
    dailyTargetMin: 60,
    weeklyTargetMin: 420,
    roadmap: [
      { id: 'sk1-step-1', title: 'تسلط بر STL و پیچیدگی زمانی (Big-O)', completed: true, order: 1 },
      { id: 'sk1-step-2', title: 'الگوریتم‌های گراف (BFS, DFS, Dijkstra, Floyd)', completed: true, order: 2 },
      { id: 'sk1-step-3', title: 'برنامه‌ریزی پویا (Dynamic Programming)', completed: true, order: 3 },
      { id: 'sk1-step-4', title: 'ساختارهای پیشرفته: درخت سگمنت و Fenwick', completed: false, order: 4 },
      { id: 'sk1-step-5', title: 'الگوریتم‌های جریان بیشینه (Max-Flow)', completed: false, order: 5 },
    ],
    resources: [
      { id: 'sk1-res-1', title: 'کتاب Competitive Programmer Handbook (Antti Laaksonen)', type: 'book', completed: true },
      { id: 'sk1-res-2', title: 'مجموعه مسائل USACO Guide Silver & Gold', type: 'article', url: 'https://usaco.guide', completed: false },
      { id: 'sk1-res-3', title: 'دوره الگوریتم دانشگاه MIT OpenCourseWare', type: 'video', completed: false },
    ],
    exercises: [
      { id: 'sk1-ex-1', title: 'حل ۵ سوال گراف در کوئرا و Codeforces', completed: true, notes: 'سوالات کوتاه و بهینه' },
      { id: 'sk1-ex-2', title: 'پیاده‌سازی جدول DP برای مسئله کوله‌پشتی بدون بازگشت', completed: false, dueDate: twoDaysLaterIso },
    ],
    practiceLogs: [
      { id: 'sk1-log-1', date: todayIso, minutes: 85, notes: 'پیاده‌سازی درخت بازه‌ها و ارسال موفق به سامانه داوری' },
    ],
    notes: 'در بخش مسائل بازه‌ای سرعت پیاده‌سازی افزایش یافته؛ نیاز به دقت بیشتر در اندیس‌بندی ۰ یا ۱',
    weaknesses: ['مسائل ترکیبیاتی شمارش و وارون ضربی پیمانه‌ای', 'الگوریتم Dinic برای تطابق دوقسمتی'],
    relatedProjectIds: ['proj-1'],
    targetDate: '2026-12-30',
    status: 'active',
    streak: 6,
    activeDates: [todayIso],
  },
  {
    id: 'skill-2',
    name: 'توسعه فرانت‌اند با React و TypeScript',
    category: 'programming',
    currentLevel: 'متوسط',
    targetLevel: 'پیشرفته',
    dailyTargetMin: 45,
    weeklyTargetMin: 300,
    roadmap: [
      { id: 'sk2-step-1', title: 'مفاهیم هسته React و هوک‌های پایه (State, Effect)', completed: true, order: 1 },
      { id: 'sk2-step-2', title: 'تایپ‌اسکریپت پیشرفته: جنریک‌ها و اینترفیس‌های ترکیبی', completed: true, order: 2 },
      { id: 'sk2-step-3', title: 'مدیریت وضعیت با Context API و الگوهای سفارشی', completed: true, order: 3 },
      { id: 'sk2-step-4', title: 'بهینه‌سازی رندر و استراتژی‌های کش در کلاینت', completed: false, order: 4 },
    ],
    resources: [
      { id: 'sk2-res-1', title: 'مستندات رسمی React 19', type: 'article', url: 'https://react.dev', completed: true },
      { id: 'sk2-res-2', title: 'دوره ویدیویی Total TypeScript', type: 'course', completed: false },
    ],
    exercises: [
      { id: 'sk2-ex-1', title: 'پیاده‌سازی کامپوننت تقویم شمسی واکنش‌گرا', completed: true },
      { id: 'sk2-ex-2', title: 'طراحی سیستم مدیریت وضعیت آفلاین با localStorage', completed: true },
    ],
    practiceLogs: [
      { id: 'sk2-log-1', date: todayIso, minutes: 45, notes: 'اتصال رویدادهای تقویم به ویجت‌های داشبورد' },
    ],
    notes: 'آشنایی کامل با Tailwind CSS v4 و تایپ‌های جنریک',
    weaknesses: ['انیمیشن‌های پیچیده CSS در موبایل'],
    relatedProjectIds: ['proj-1'],
    targetDate: '2026-11-30',
    status: 'active',
    streak: 8,
    activeDates: [todayIso],
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'Pathly — سامانه برنامه‌ریزی و رشد فردی',
    description: 'وب‌اپلیکیشن جامع برای مدیریت ۴ رکن تحصیلی، مهارتی، پروژه‌ای و مسابقاتی با تقویم شمسی و رابط کاربری اختصاصی',
    category: 'وب و ابزار بهره‌وری',
    startDate: '2026-09-15',
    deadline: '2026-12-15',
    status: 'in_progress',
    priority: 'high',
    targetsAndDeliverables: 'طراحی سیستم پایدار محلی، تقویم جامع سه حالته، مرکز یادآوری و داشبورد متمرکز',
    progressPercentage: 68,
    techStack: ['React 19', 'TypeScript', 'Tailwind CSS v4', 'Vite'],
    githubUrl: 'https://github.com/mahyar-al/cpp-lab',
    demoUrl: 'https://ais-dev-vl7c7sbvrl22ugigsqbaby-602976294238.asia-southeast1.run.app',
    techNotes: 'معماری کامپوننت‌محور، ذخیره‌سازی داده بدون نیاز به بک‌اند خارجی، رابط کاربری تماماً فارسی با فونت Vazirmatn',
    knownBugs: [
      { id: 'bug-1', title: 'بهینه‌سازی اسکرول در حالت نمایش کانبان در نمایشگرهای کوچک', resolved: true, severity: 'medium' },
      { id: 'bug-2', title: 'بررسی محاسبه صحیح روزهای باقی‌مانده مسابقات در پایان ماه', resolved: false, severity: 'low' },
    ],
    tasks: [
      {
        id: 'pt-1',
        title: 'طراحی سیستم نمایش اولویت روز در داشبورد',
        description: 'مرتب‌سازی هوشمند بر اساس موعد، اهمیت و تخمین زمان',
        status: 'completed',
        priority: 'high',
        dueDate: todayIso,
        estimatedHours: 3,
        actualHours: 2.5,
        subtasks: [
          { id: 'pst-1', title: 'محاسبه مجموع زمان موردنیاز', done: true },
          { id: 'pst-2', title: 'چک‌باکس انجام سریع در داشبورد', done: true },
        ],
      },
      {
        id: 'pt-2',
        title: 'پیاده‌سازی نمای روزانه و هفتگی در تقویم شمسی',
        description: 'امکان جابجایی بین ماهانه، هفتگی و روزانه همراه با نمایش مهلت‌ها',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrowIso,
        estimatedHours: 4,
        actualHours: 2,
        subtasks: [
          { id: 'pst-3', title: 'محاسبه ستون‌های ۷ روز هفته تقویم جلالی', done: true },
          { id: 'pst-4', title: 'اتصال رویدادهای مدرسه و پروژه‌ها به روزها', done: true },
        ],
      },
      {
        id: 'pt-3',
        title: 'پیگیری عادت‌ها و استریک‌های روزانه',
        description: 'امکان ثبت عادت‌های مطالعه، کدنویسی و ورزش با گزارش پیشرفت',
        status: 'in_progress',
        priority: 'medium',
        dueDate: twoDaysLaterIso,
        estimatedHours: 3,
        actualHours: 1,
        subtasks: [
          { id: 'pst-5', title: 'طراحی ویجت استریک و تقویمچه عادت‌ها', done: true },
        ],
      },
    ],
    activityLogs: [
      { id: 'pal-1', timestamp: new Date().toISOString(), action: 'تکمیل ماژول اولویت‌های روز و بهبود تقویم شمسی' },
    ],
  },
];

export const initialCompetitions: Competition[] = [
  {
    id: 'comp-1',
    title: 'المپیاد علمی دانش‌آموزی کامپیوتر (مرحله اول)',
    organizer: 'باشگاه دانش‌پژوهان جوان',
    domain: 'الگوریتم، ترکیبیات و برنامه‌نویسی',
    description: 'مرحله اول آزمون تستی شامل مسائل شمارشی، گراف و تفکر الگوریتمی',
    officialUrl: 'https://ysc.sampad.gov.ir',
    currentStage: 'ثبت‌نام و آمادگی مقدماتی',
    registrationDate: '2026-10-01',
    registrationDeadline: '2026-11-25',
    stages: [
      { id: 'cs-1', name: 'ثبت‌نام رسمی در سامانه my.medu.ir', date: '2026-11-20', completed: true, notes: 'تایید مدارک تحصیلی' },
      { id: 'cs-2', name: 'آزمون تستی مرحله اول کشوری', date: '2026-12-15', completed: false, notes: '۳۰ سوال تستی چهارگزینه‌ای' },
      { id: 'cs-3', name: 'آزمون تشریحی مرحله دوم', date: '2027-02-18', completed: false, notes: '۴ مسئله اثباتی و تحلیلی' },
    ],
    syllabusAndResources: 'کتاب ترکیبیات علیپور، گراف دکتر غربالی، مسائل دوره‌های ۲۵ تا ۳۴ مرحله اول',
    readinessStatus: 'preparing',
    readinessPercentage: 65,
    notes: 'تمرکز روی سوالات ترکیبیات شمارشی و بازی‌های دوتایی (Game Theory)',
    prepTopics: [
      { id: 'cpt-1', title: 'اصل شمول و عدم شمول و تجرید دیریکله', mastered: true },
      { id: 'cpt-2', title: 'درخت‌ها و خصوصیات همبندی در گراف', mastered: true },
      { id: 'cpt-3', title: 'الگوریتم‌های حریصانه و اثبات درستی آن‌ها', mastered: false },
      { id: 'cpt-4', title: 'شمارش مضاعف و روابط بازگشتی خطی', mastered: false },
    ],
    mockExams: [
      { id: 'cme-1', title: 'شبیه‌ساز مرحله اول دوره ۳۳', score: 76, maxScore: 100, date: '2026-10-05', notes: 'سرعت در نیم ساعت آخر کاهش یافت.' },
      { id: 'cme-2', title: 'آزمون جامع ترکیبیات شاززز', score: 84, maxScore: 100, date: '2026-10-12', notes: 'پیشرفت محسوس در حل مسائل اکسترمال' },
    ],
    solvedProblemsCount: 142,
    weaknesses: [
      'مسائل رنگ‌آمیزی نقشه و صفحات با اصل استقراء',
      'مدیریت زمان در تست‌های طولانی هندسه ترکیبیاتی',
    ],
  },
];

export const initialHabits: Habit[] = [
  {
    id: 'hab-1',
    title: 'مطالعه و حل تمرین دروس روزانه مدرسه',
    category: 'school',
    targetDaysPerWeek: 6,
    streak: 12,
    completedDates: [todayIso],
    icon: 'book',
    color: '#3b82f6',
    notes: 'حداقل ۹۰ دقیقه مطالعه عمیق بعد از مدرسه',
  },
  {
    id: 'hab-2',
    title: 'حل حداقل ۲ مسئله الگوریتمی یا کدنویسی',
    category: 'skill',
    targetDaysPerWeek: 5,
    streak: 7,
    completedDates: [todayIso],
    icon: 'code',
    color: '#8b5cf6',
    notes: 'سوالات پلتفرم Codeforces یا Quera',
  },
  {
    id: 'hab-3',
    title: 'مرور ۱۵ دقیقه لغات زبان تخصصی و انگلیسی',
    category: 'general',
    targetDaysPerWeek: 6,
    streak: 19,
    completedDates: [todayIso],
    icon: 'languages',
    color: '#10b981',
    notes: 'استفاده از جعبه لایتنر دیجیتال',
  },
  {
    id: 'hab-4',
    title: 'ورزش و تحرک روزانه ۳۰ دقیقه‌ای',
    category: 'general',
    targetDaysPerWeek: 4,
    streak: 3,
    completedDates: [],
    icon: 'activity',
    color: '#f59e0b',
    notes: 'طناب‌زدن یا پیاده‌روی سریع برای شادابی ذهن',
  },
];

export const initialGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'کسب معدل بالای ۱۹.۸ در نیم‌سال اول',
    description: 'تسلط مستمر بر حسابان، فیزیک و شیمی و عدم انباشته‌شدن تکالیف در ایام امتحانات',
    level: 'monthly',
    category: 'school',
    startDate: '2026-10-01',
    deadline: '2026-12-30',
    priority: 'high',
    measurementMetric: 'معدل کارنامه ترم اول',
    status: 'in_progress',
    progressPercentage: 70,
    milestones: [
      { id: 'gm-1', title: 'کسب نمره کامل در امتحانات میان‌ترم آبان', done: true },
      { id: 'gm-2', title: 'حل تمامی نمونه سوالات دی‌ماه ۳ سال اخیر', done: false },
      { id: 'gm-3', title: 'مرور نهایی فرمول‌ها پیش از آزمون پایانی', done: false },
    ],
  },
  {
    id: 'goal-2',
    title: 'قبولی قطعی در مرحله اول المپیاد کامپیوتر با نمره عالی',
    description: 'حل بیش از ۲۵۰ سوال تستی دوره‌های گذشته و کسب نمره بالای ۷۵ در شبیه‌سازها',
    level: 'long_term',
    category: 'competition',
    startDate: '2026-09-01',
    deadline: '2026-12-15',
    priority: 'high',
    measurementMetric: 'نمره آزمون و قبولی مرحله اول',
    status: 'in_progress',
    progressPercentage: 60,
    milestones: [
      { id: 'gm-4', title: 'اتمام کتاب آنتی لکسونن', done: true },
      { id: 'gm-5', title: 'شرکت در ۳ آزمون جامع شبیه‌ساز', done: true },
      { id: 'gm-6', title: 'مرور مباحث گراف و روابط بازگشتی', done: false },
    ],
  },
];

export const initialWeeklyReviews: WeeklyReview[] = [
  {
    id: 'wr-1',
    weekStartDate: '2026-10-05',
    weekEndDate: '2026-10-11',
    completedTasksSummary: 'تکالیف حسابان و فیزیک سر وقت انجام شد، ۱۵ مسئله الگوریتم حل شد.',
    unfinishedTasksSummary: 'تمرین شیمی به دلیل خستگی به دوشنبه موکول شد.',
    totalStudyHours: 26.5,
    biggestWin: 'یادگیری کامل الگوریتم دایکسترا و پیاده‌سازی سریع آن',
    nextWeekPriorities: 'مرور مباحث امتحانات میان‌ترم و افزایش تمرکز روی زبان',
    createdAt: new Date().toISOString(),
  },
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'ce-1',
    title: 'امتحان میان‌ترم حسابان',
    description: 'سرفصل مشتق توابع کسری و مثلثاتی، کلاس ۲۰۱',
    date: twoDaysLaterIso,
    startTime: '08:00',
    endTime: '09:30',
    section: 'school',
    priority: 'high',
    reminderMinutesBefore: 60,
    completed: false,
    recurrence: 'none',
  },
  {
    id: 'ce-2',
    title: 'شبیه‌ساز مسابقه الگوریتم Codeforces',
    description: 'مسابقه دوره‌ای آنلاین برای حفظ سرعت کدنویسی',
    date: tomorrowIso,
    startTime: '17:00',
    endTime: '19:00',
    section: 'skill',
    priority: 'medium',
    reminderMinutesBefore: 30,
    completed: false,
    recurrence: 'weekly',
  },
  {
    id: 'ce-3',
    title: 'پایان مهلت ثبت‌نام المپیاد مرحله اول',
    description: 'بررسی تاییدیه سامانه آموزش و پرورش و دریافت کد رهگیری',
    date: '2026-11-20',
    startTime: '23:59',
    section: 'competition',
    priority: 'high',
    reminderMinutesBefore: 1440,
    completed: false,
    recurrence: 'none',
  },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'نکات کلیدی مشتق زنجیره‌ای و بهینه‌سازی هندسی',
    content: 'در مسائل بیشترین مساحت، همیشه متغیر را تابعی از یک زاویه یا طول مشخص در نظر بگیر. نقاط بحرانی تنها در صورت وجود در دامنه مسئله بررسی شوند.',
    category: 'school',
    tags: ['حسابان', 'مشتق', 'کنکور'],
    pinned: true,
    createdAt: '2026-10-10',
    updatedAt: '2026-10-12',
  },
  {
    id: 'note-2',
    title: 'چک‌لیست شرکت در مسابقات کدنویسی زنده',
    content: '۱. تست کردن ورودی‌های مرزی (Corner Cases: n=0, n=1, اعداد منفی)\n۲. توجه به سرریز اعداد در C++ (استفاده از long long)\n۳. استفاده از fast I/O: cin.tie(NULL)',
    category: 'competition',
    tags: ['الگوریتم', 'مسابقه', 'C++'],
    pinned: true,
    createdAt: '2026-10-11',
    updatedAt: '2026-10-14',
  },
];

export const initialActivityLogs: ActivityLogItem[] = [
  { id: 'al-1', timestamp: new Date(Date.now() - 3600000).toISOString(), section: 'school', description: 'تکلیف حسابان تحویل داده شد.' },
  { id: 'al-2', timestamp: new Date(Date.now() - 7200000).toISOString(), section: 'skill', description: 'ثبت ۵۵ دقیقه تمرین درخت بازه‌ها در مهارت الگوریتم' },
  { id: 'al-3', timestamp: new Date(Date.now() - 14400000).toISOString(), section: 'project', description: 'به‌روزرسانی وظایف پروژه Pathly' },
];

export const initialNotifications: ReminderNotification[] = [
  {
    id: 'notif-1',
    title: 'موعد تحویل تکلیف حسابان',
    message: 'حل تمرین‌های صفحه ۴۲ تا ۴۵ فردا موعد دارد. پیگیری کنید.',
    targetTime: tomorrowIso,
    isRead: false,
    section: 'school',
    linkedTab: 'school',
  },
  {
    id: 'notif-2',
    title: 'آزمون میان‌ترم فیزیک نزدیک است',
    message: 'کوییز مبحث میدان و پتانسیل الکتریکی در برنامه دو روز آینده قرار دارد.',
    targetTime: twoDaysLaterIso,
    isRead: false,
    section: 'school',
    linkedTab: 'school',
  },
  {
    id: 'notif-3',
    title: 'مهلت ثبت‌نام مسابقه المپیاد',
    message: 'ثبت‌نام رسمی مرحله اول تا کمتر از یک ماه آینده فعال است.',
    targetTime: '2026-11-20',
    isRead: false,
    section: 'competition',
    linkedTab: 'competitions',
  },
];
