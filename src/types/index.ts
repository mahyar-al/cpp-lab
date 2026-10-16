export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type SectionType = 'school' | 'skill' | 'project' | 'competition' | 'general';
export type DayRating = 'excellent' | 'normal' | 'needs_makeup' | null;

export interface SchoolBellTime {
  period: number; // 1 to 5
  title: string; // e.g. "زنگ اول"
  startTime: string; // "07:30"
  endTime: string; // "09:00"
}

export interface SchoolSubject {
  id: string;
  name: string;
  teacher?: string;
  room?: string;
  color: string; // hex or tailwind identifier
  notes?: string;
  studyRange?: string; // e.g. "فصل ۱ تا ۳ (صفحه ۱۰ تا ۴۵)"
  reviewSchedule?: string; // e.g. "شنبه‌ها و سه‌شنبه‌ها"
}

export interface SubjectGrade {
  id: string;
  subjectId: string;
  title: string; // e.g. "میان‌ترم اول"
  score: number; // e.g. 19.5
  maxScore: number; // e.g. 20
  date: string; // YYYY-MM-DD
  weight?: number; // e.g. 1
  notes?: string;
}

export interface WeeklyTimetableCell {
  dayIndex: number; // 0: شنبه, 1: یکشنبه, 2: دوشنبه, 3: سه‌شنبه, 4: چهارشنبه
  period: number; // 1 to 5
  subjectId: string;
  customSubjectName?: string;
  room?: string;
  teacher?: string;
  color?: string;
  notes?: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueTime?: string;
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  estimatedMinutes?: number;
  actualMinutes?: number;
  section?: SectionType;
  notes?: string;
  subtasks?: TaskSubtask[];
  date?: string; // YYYY-MM-DD
  isRollover?: boolean;
  tags?: string[];
  dependsOnTaskId?: string;
  energyLevel?: 'low' | 'medium' | 'high';
  importance?: 'critical' | 'high' | 'medium' | 'low';
  isFixedTime?: boolean;
}

export interface SchoolHomework {
  id: string;
  dayIndex: number; // 0 to 4
  subjectId: string;
  subjectName: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  estimatedMinutes?: number;
}

export interface SchoolExamItem {
  id: string;
  dayIndex?: number;
  subjectId: string;
  subjectName: string;
  title: string;
  type: 'exam' | 'quiz' | 'submission'; // امتحان | پرسش کلاسی | تحویل پروژه
  date: string;
  time?: string;
  chapters?: string;
  reviewSchedule?: string;
  completed: boolean;
  priority: Priority;
  notes?: string;
}

export interface DaySpecificData {
  dayIndex: number; // 0 to 4
  overallRating: DayRating;
  preSchoolTasks: TaskItem[];
  postSchoolTasks: TaskItem[];
  notes: string;
  reflectionReport: string; // گزارش پایان روز
}

export interface StudySession {
  id: string;
  subjectName: string;
  subjectId?: string;
  topic: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  expectedDurationMin: number;
  actualDurationMin: number;
  focusScore: number; // 1 to 5
  outcomeNotes: string;
  type?: SectionType;
}

export interface SkillRoadmapStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface SkillResource {
  id: string;
  title: string;
  type: 'course' | 'book' | 'article' | 'video';
  url?: string;
  completed: boolean;
}

export interface SkillExercise {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface SkillPracticeLog {
  id: string;
  date: string;
  minutes: number;
  notes: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'programming' | 'ai' | 'language' | 'security' | 'tools' | 'other';
  currentLevel: 'مقدماتی' | 'متوسط' | 'پیشرفته' | 'تخصصی';
  targetLevel: 'متوسط' | 'پیشرفته' | 'تخصصی' | 'تسلط کامل';
  dailyTargetMin: number;
  weeklyTargetMin: number;
  roadmap: SkillRoadmapStep[];
  resources: SkillResource[];
  exercises: SkillExercise[];
  practiceLogs: SkillPracticeLog[];
  notes: string;
  weaknesses: string[];
  relatedProjectIds: string[];
  targetDate: string;
  status: 'active' | 'paused' | 'completed';
  streak: number;
  activeDates: string[]; // List of YYYY-MM-DD dates practiced
  prerequisites?: string[]; // IDs or names of prerequisite skills
}

export type ProjectStatus = 'ideas' | 'todo' | 'in_progress' | 'waiting' | 'completed';

export interface ProjectSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  subtasks: ProjectSubtask[];
}

export interface ProjectBug {
  id: string;
  title: string;
  resolved: boolean;
  severity: Priority;
  notes?: string;
}

export interface ProjectActivityLog {
  id: string;
  timestamp: string;
  action: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  priority: Priority;
  targetsAndDeliverables: string;
  progressPercentage: number;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  techNotes: string;
  knownBugs: ProjectBug[];
  tasks: ProjectTask[];
  activityLogs: ProjectActivityLog[];
}

export interface CompetitionStage {
  id: string;
  name: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface CompetitionPrepTopic {
  id: string;
  title: string;
  mastered: boolean;
}

export interface CompetitionMockExam {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  notes?: string;
}

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  domain: string;
  description: string;
  officialUrl?: string;
  currentStage: string;
  registrationDate: string;
  registrationDeadline: string;
  stages: CompetitionStage[];
  resultDate?: string;
  syllabusAndResources: string;
  readinessStatus: 'preparing' | 'ready' | 'registered' | 'completed';
  readinessPercentage: number;
  notes: string;
  finalResult?: string;
  prepTopics: CompetitionPrepTopic[];
  mockExams: CompetitionMockExam[];
  solvedProblemsCount: number;
  weaknesses: string[];
}

export interface GoalMilestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  level: 'long_term' | 'monthly' | 'weekly';
  category: SectionType;
  startDate: string;
  deadline: string;
  priority: Priority;
  measurementMetric: string;
  status: 'todo' | 'in_progress' | 'completed';
  progressPercentage: number;
  milestones: GoalMilestone[];
  linkedEntityId?: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  totalStudyHours: number;
  biggestWin: string;
  nextWeekPriorities: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  section: SectionType;
  priority: Priority;
  reminderMinutesBefore?: number;
  completed?: boolean;
  linkedId?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface Habit {
  id: string;
  title: string;
  category: SectionType;
  targetDaysPerWeek: number; // 1 to 7
  streak: number;
  completedDates: string[]; // List of YYYY-MM-DD
  icon?: string;
  notes?: string;
  color?: string;
  paused?: boolean;
  plannedRestDates?: string[]; // استراحت برنامه‌ریزی‌شده
}

export interface ReviewLogEntry {
  id: string;
  date: string;
  rating: 'easy' | 'good' | 'hard' | 'forgotten';
  notes?: string;
}

export interface SpacedReviewItem {
  id: string;
  title: string;
  topic: string;
  section: SectionType;
  linkedEntityId?: string;
  linkedEntityName?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isDifficult: boolean;
  masteryLevel: number; // 1 to 5
  lastReviewedDate?: string;
  nextReviewDate: string; // YYYY-MM-DD
  intervalDays: number;
  repetitionCount: number;
  notes?: string;
  reviewLogs: ReviewLogEntry[];
}

export interface KnowledgeResource {
  id: string;
  title: string;
  type: 'book' | 'course' | 'video' | 'article' | 'documentation' | 'cheatsheet' | 'other';
  authorOrInstructor?: string;
  url?: string;
  section: SectionType;
  linkedEntityId?: string;
  linkedEntityName?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'archived';
  progressPercentage: number;
  pinned: boolean;
  tags: string[];
  notes: string;
  keyTakeaways: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickInboxItem {
  id: string;
  content: string;
  title?: string;
  priority: Priority;
  createdAt: string;
  dueDate?: string;
  category?: SectionType;
  archived: boolean;
  convertedTo?: {
    type: 'task' | 'homework' | 'project_task' | 'goal' | 'note';
    targetId: string;
  };
}

export interface FocusTimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
  autoLogSessions: boolean;
}

export interface DashboardWidgetConfig {
  showTodaySchedule: boolean;
  showTodayPriority: boolean;
  showMiniCalendar: boolean;
  showStudyHoursChart: boolean;
  showSectionProgress: boolean;
  showHabits: boolean;
  showRecentActivity: boolean;
  showTomorrowSchedule?: boolean;
  showFocusWidget?: boolean;
  showReviewsDue?: boolean;
  showFreeTimeMetric?: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: SectionType;
  tags: string[];
  pinned: boolean;
  linkedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  section: SectionType;
  description: string;
}

export interface ReminderNotification {
  id: string;
  title: string;
  message: string;
  targetTime: string;
  isRead: boolean;
  section: SectionType;
  linkedTab?: string;
}

export type NavTab =
  | 'dashboard'
  | 'daily_planner'
  | 'school'
  | 'skills'
  | 'projects'
  | 'competitions'
  | 'habits'
  | 'reviews'
  | 'focus_timer'
  | 'resources'
  | 'calendar'
  | 'goals'
  | 'notes'
  | 'analytics'
  | 'settings';

export type ThemeMode = 'dark' | 'light' | 'system' | 'cyber-purple' | 'emerald-matrix' | 'ocean-deep' | 'sunset-gold' | 'rose-quartz' | 'cyan-matrix';
export type AccentColor = 'cyan' | 'emerald' | 'violet' | 'rose' | 'amber' | 'blue';
export type FontSize = 'small' | 'normal' | 'large';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type BorderRadius = 'subtle' | 'medium' | 'rounded';
export type GlowIntensity = 'none' | 'subtle' | 'high';
export type DashboardColumns = '1' | '2' | '3' | 'auto';

export interface UserCustomization {
  sectionNames: Partial<Record<NavTab, string>>;
  hiddenSections: NavTab[];
  navOrder: NavTab[];
  themeMode: ThemeMode;
  accentColor: AccentColor;
  secondaryAccent?: AccentColor;
  borderRadius?: BorderRadius;
  glowIntensity?: GlowIntensity;
  fontSize: FontSize;
  density: LayoutDensity;
  dashboardCardsOrder: string[];
  hiddenDashboardCards: string[];
  dashboardColumns?: DashboardColumns;
}

export interface UserProfile {
  name: string;
  gradeOrField: string;
  avatarSeed: string;
  theme: 'light' | 'dark' | 'system';
  enableBrowserNotifications: boolean;
  bellTimes: SchoolBellTime[];
  widgetConfig?: DashboardWidgetConfig;
  studyTargetDailyHours?: number;
  focusSettings?: FocusTimerSettings;
  customization?: UserCustomization;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  securityQuestion?: string;
  createdAt?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface TrashItem {
  id: string;
  originalId: string;
  itemType: 'subject' | 'homework' | 'exam' | 'skill' | 'project' | 'competition' | 'goal' | 'note' | 'habit' | 'task' | 'calendarEvent' | 'resource';
  title: string;
  deletedAt: string;
  data: any;
}

// ----------------- Life RPG Gamification -----------------
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  xpReward: number;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  category: SectionType;
  icon?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'general' | 'study' | 'habit' | 'project' | 'competition';
  tier: 'bronze' | 'silver' | 'gold' | 'master';
  progressPercentage?: number;
}

export interface UserRPGState {
  enabled: boolean;
  xp: number;
  level: number;
  title: string;
  awardedEventIds: string[]; // Anti-cheat: prevent duplicate XP from same task completion
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  achievements: Achievement[];
}

// ----------------- Rescue Mode & Adaptive Planner -----------------
export type RescueModeType = '15_min' | '1_hour' | 'rebuild_day';

export interface RescueScheduleStep {
  id: string;
  taskId?: string;
  title: string;
  timeSlot: string; // e.g. "17:30 - 18:00"
  durationMin: number;
  isBreak?: boolean;
  note?: string;
}

export interface RescuePlan {
  mode: RescueModeType;
  smallestStep: string;
  criticalTaskIds: string[];
  deferredTaskIds: string[];
  suggestedSchedule: RescueScheduleStep[];
  message: string;
  generatedAt: string;
}

export interface ScheduleSimulation {
  totalRequiredMinutes: number;
  availableMinutes: number;
  varianceMinutes: number;
  feasibilityStatus: 'comfortable' | 'tight' | 'impossible';
  score: number; // 0 to 100
  suggestions: string[];
}

// ----------------- Focus Session Active State -----------------
export interface ActiveFocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  section: SectionType;
  mode: 'work' | 'short_break' | 'long_break';
  targetMinutes: number;
  elapsedSeconds: number;
  isRunning: boolean;
  lastUpdatedTimestamp: number;
}

