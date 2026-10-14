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
} from '../types';

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
  name: 'مهیار',
  gradeOrField: 'پایه یازدهم ریاضی',
  avatarSeed: 'cyber-neon',
  theme: 'dark',
  enableBrowserNotifications: true,
  studyTargetDailyHours: 4,
  widgetConfig: initialWidgetConfig,
  focusSettings: initialFocusSettings,
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

export const initialProjects: Project[] = [];

export const initialCompetitions: Competition[] = [];

export const initialGoals: Goal[] = [];

export const initialWeeklyReviews: WeeklyReview[] = [];

export const initialCalendarEvents: CalendarEvent[] = [];

export const initialNotes: Note[] = [];

export const initialActivityLogs: ActivityLogItem[] = [];

export const initialNotifications: ReminderNotification[] = [];

export const initialHabits: Habit[] = [];

export const initialReviews: SpacedReviewItem[] = [];

export const initialResources: KnowledgeResource[] = [];

export const initialInboxItems: QuickInboxItem[] = [];
