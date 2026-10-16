import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { toPersianDigits, getIranianDayOfWeek, getIranianDayName, formatJalaliFull } from '../../utils/jalali';
import { Priority, SectionType } from '../../types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Clock,
  Target,
  Square,
  RefreshCw,
  Plus,
  MessageSquare,
  Trash2,
  Calendar,
  CheckCircle2,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Flame,
  LifeBuoy,
  Layers,
  Sliders,
  ChevronDown,
  Edit3,
  CalendarCheck,
  CheckSquare,
} from 'lucide-react';

interface ActionProposal {
  type: 'create_task' | 'create_goal' | 'create_note' | 'create_event';
  title: string;
  details?: string;
  time?: string;
  date?: string;
  priority?: Priority;
  category?: SectionType;
}

function parseActionProposal(rawText: string): { cleanText: string; proposal: ActionProposal | null } {
  if (!rawText) return { cleanText: '', proposal: null };
  const match = rawText.match(/:::action_proposal\s*(\{[\s\S]*?\})\s*:::/);
  if (!match) return { cleanText: rawText, proposal: null };

  try {
    const proposal = JSON.parse(match[1]);
    const cleanText = rawText.replace(/:::action_proposal\s*\{[\s\S]*?\}\s*:::/, '').trim();
    return { cleanText, proposal };
  } catch {
    return { cleanText: rawText, proposal: null };
  }
}

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    aiMessages,
    isAILoading,
    isAIStreaming,
    aiStreamText,
    aiError,
    aiConversations,
    activeConversationId,
    activeConversationTitle,
    selectedAIModel,
    setSelectedAIModel,
    selectedAITone,
    setSelectedAITone,
    selectAIConversation,
    createNewAIConversation,
    deleteAIConversation,
    clearActiveAIConversation,
    sendStreamingAIMessage,
    stopAIGeneration,
    retryLastAIMessage,
    currentUser,
    profile,
    dayData,
    homeworks,
    goals,
    habits,
    addPostSchoolTask,
    addGoal,
    addNote,
    addCalendarEvent,
    showToast,
  } = useApp();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);

  // Track applied action proposals by message ID
  const [appliedProposals, setAppliedProposals] = useState<Record<string, boolean>>({});
  const [dismissedProposals, setDismissedProposals] = useState<Record<string, boolean>>({});

  // Proposal quick editor state
  const [editingProposalMsgId, setEditingProposalMsgId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editTime, setEditTime] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = new Date();
  const currentIranianDayIdx = useMemo(() => getIranianDayOfWeek(today), [today]);
  const todayIso = today.toISOString().slice(0, 10);

  // Today stats summary for user context
  const todayTasks = (dayData[currentIranianDayIdx]?.postSchoolTasks || []).concat(
    dayData[currentIranianDayIdx]?.preSchoolTasks || []
  );
  const completedTodayTasksCount = todayTasks.filter((t) => t.completed).length;
  const pendingTodayTasksCount = todayTasks.filter((t) => !t.completed).length;
  const pendingHomeworkCount = homeworks.filter((h) => !h.completed).length;
  const activeGoalsCount = goals.filter((g) => g.status !== 'completed').length;
  const activeHabitsCount = habits.length;

  const userName = currentUser?.name || profile.name || 'همراه گرامی';

  // Auto-scroll on new message or during streaming
  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiStreamText, isAIAssistantOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isAIAssistantOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isAIAssistantOpen]);

  if (!isAIAssistantOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isAILoading || isAIStreaming) return;
    const msg = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendStreamingAIMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
    textareaRef.current?.focus();
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Execute Action Proposal with Explicit User Approval
  const handleApproveProposal = (msgId: string, proposal: ActionProposal) => {
    try {
      const finalTitle = editingProposalMsgId === msgId ? editTitle.trim() || proposal.title : proposal.title;
      const finalDetails = editingProposalMsgId === msgId ? editDetails.trim() || proposal.details : proposal.details;
      const finalTime = editingProposalMsgId === msgId ? editTime.trim() || proposal.time : proposal.time;

      if (proposal.type === 'create_task') {
        addPostSchoolTask(
          currentIranianDayIdx,
          finalTitle.trim(),
          proposal.priority || 'medium',
          finalTime ? finalTime.trim() : undefined
        );
        showToast(`وظیفه «${finalTitle}» در برنامه امروز ثبت شد.`);
      } else if (proposal.type === 'create_goal') {
        addGoal({
          title: finalTitle.trim(),
          description: finalDetails || '',
          level: 'weekly',
          category: proposal.category || 'general',
          startDate: todayIso,
          deadline: proposal.date || todayIso,
          priority: proposal.priority || 'medium',
          measurementMetric: 'درصد پیشرفت',
          status: 'in_progress',
          progressPercentage: 0,
          milestones: [],
        });
        showToast(`هدف «${finalTitle}» در بخش اهداف ثبت شد.`);
      } else if (proposal.type === 'create_note') {
        addNote({
          title: finalTitle.trim(),
          content: finalDetails || finalTitle,
          category: proposal.category || 'general',
          tags: ['دستیار_هوشمند'],
          pinned: false,
        });
        showToast(`یادداشت «${finalTitle}» ذخیره شد.`);
      } else if (proposal.type === 'create_event') {
        addCalendarEvent({
          title: finalTitle.trim(),
          date: proposal.date || todayIso,
          startTime: finalTime ? finalTime.trim() : undefined,
          section: proposal.category || 'general',
          priority: proposal.priority || 'medium',
          completed: false,
        });
        showToast(`رویداد «${finalTitle}» در تقویم ثبت شد.`);
      }

      setAppliedProposals((prev) => ({ ...prev, [msgId]: true }));
      setEditingProposalMsgId(null);
    } catch (err) {
      console.error('Error executing proposal:', err);
      showToast('خطا در ثبت اطلاعات.');
    }
  };

  const handleDismissProposal = (msgId: string) => {
    setDismissedProposals((prev) => ({ ...prev, [msgId]: true }));
    setEditingProposalMsgId(null);
  };

  const handleStartEditingProposal = (msgId: string, proposal: ActionProposal) => {
    setEditingProposalMsgId(msgId);
    setEditTitle(proposal.title);
    setEditDetails(proposal.details || '');
    setEditTime(proposal.time || '');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-[#F4F3EF] dark:bg-[#000000] border border-[#E7E5DF] dark:border-[#252525] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[740px] max-h-[95vh] transition-colors duration-200">
        {/* =========================================================================
            TOP HEADER
            ========================================================================= */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-[#E7E5DF] dark:border-[#252525] bg-white dark:bg-[#0D0D0D] relative z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle Conversations Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'بستن تاریخچه مکالمات' : 'مشاهده تاریخچه مکالمات'}
              className="p-1.5 sm:p-2 rounded-xl text-[#74756F] dark:text-[#A0A0A0] hover:text-[#292A27] dark:hover:text-[#E8E8E8] hover:bg-[#F4F3EF] dark:hover:bg-[#151515] transition-colors cursor-pointer shrink-0"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 rtl:rotate-180" /> : <PanelLeftOpen className="w-4 h-4 rtl:rotate-180" />}
            </button>

            {/* AI Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-[#D6A62E]/15 border border-[#D6A62E]/40 flex items-center justify-center text-[#D6A62E] shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#0D0D0D] bg-emerald-500"
                title="متصل به مدل هوش مصنوعی Pathly"
              />
            </div>

            {/* Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-[#292A27] dark:text-[#E8E8E8] truncate">
                  {activeConversationTitle || 'دستیار هوشمند Pathly'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-[#D6A62E]/15 text-[#D6A62E] font-medium border border-[#D6A62E]/25">
                  <Sparkles className="w-2.5 h-2.5" />
                  مدل زنده
                </span>
              </div>
              <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] truncate">
                دسترسی اختصاصی به داده‌های برنامه‌ریزی شما
              </p>
            </div>
          </div>

          {/* Controls: Model & Tone Dropdowns, New Chat, Clear, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Model Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setShowModelMenu((prev) => !prev);
                  setShowToneMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#292A27] dark:text-[#E8E8E8] bg-[#F9F8F5] dark:bg-[#151515] border border-[#E7E5DF] dark:border-[#252525] rounded-xl hover:border-[#D6A62E] transition-all cursor-pointer font-medium"
              >
                <span>{selectedAIModel === 'gemini-3.1-flash-lite' ? 'Gemini 3.1 Lite' : 'Gemini 3.8 Flash'}</span>
                <ChevronDown className="w-3 h-3 text-[#74756F] dark:text-[#A0A0A0]" />
              </button>

              {showModelMenu && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] rounded-xl shadow-xl p-1.5 z-50 text-right animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setSelectedAIModel('gemini-3.8-flash');
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedAIModel === 'gemini-3.8-flash'
                        ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-bold'
                        : 'text-[#292A27] dark:text-[#E8E8E8] hover:bg-[#F9F8F5] dark:hover:bg-[#151515]'
                    }`}
                  >
                    <div className="font-semibold">Gemini 3.8 Flash</div>
                    <div className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] mt-0.5">
                      پیشنهادی، فوق‌العاده هوشمند و زنده
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAIModel('gemini-3.1-flash-lite');
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedAIModel === 'gemini-3.1-flash-lite'
                        ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-bold'
                        : 'text-[#292A27] dark:text-[#E8E8E8] hover:bg-[#F9F8F5] dark:hover:bg-[#151515]'
                    }`}
                  >
                    <div className="font-semibold">Gemini 3.1 Flash Lite</div>
                    <div className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] mt-0.5">
                      پاسخ‌های بسیار سریع و کم‌حجم
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Tone Selector Dropdown */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  setShowToneMenu((prev) => !prev);
                  setShowModelMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#292A27] dark:text-[#E8E8E8] bg-[#F9F8F5] dark:bg-[#151515] border border-[#E7E5DF] dark:border-[#252525] rounded-xl hover:border-[#D6A62E] transition-all cursor-pointer font-medium"
              >
                <span>
                  {selectedAITone === 'academic'
                    ? 'لحن منضبط'
                    : selectedAITone === 'motivational'
                    ? 'لحن انگیزشی'
                    : 'لحن متوازن'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#74756F] dark:text-[#A0A0A0]" />
              </button>

              {showToneMenu && (
                <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] rounded-xl shadow-xl p-1.5 z-50 text-right animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      setSelectedAITone('balanced');
                      setShowToneMenu(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedAITone === 'balanced'
                        ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-bold'
                        : 'text-[#292A27] dark:text-[#E8E8E8] hover:bg-[#F9F8F5] dark:hover:bg-[#151515]'
                    }`}
                  >
                    متوازن و صمیمی
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAITone('motivational');
                      setShowToneMenu(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedAITone === 'motivational'
                        ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-bold'
                        : 'text-[#292A27] dark:text-[#E8E8E8] hover:bg-[#F9F8F5] dark:hover:bg-[#151515]'
                    }`}
                  >
                    انگیزشی و پرانرژی
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAITone('academic');
                      setShowToneMenu(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      selectedAITone === 'academic'
                        ? 'bg-[#D6A62E]/15 text-[#D6A62E] font-bold'
                        : 'text-[#292A27] dark:text-[#E8E8E8] hover:bg-[#F9F8F5] dark:hover:bg-[#151515]'
                    }`}
                  >
                    علمی و ساختاریافته
                  </button>
                </div>
              )}
            </div>

            {/* New Conversation Button */}
            <button
              onClick={createNewAIConversation}
              title="گفتگوی تازه"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#D6A62E]/15 hover:bg-[#D6A62E]/25 text-[#D6A62E] border border-[#D6A62E]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">گفتگوی جدید</span>
            </button>

            {/* Clear Current Chat */}
            <button
              onClick={clearActiveAIConversation}
              title="پاکسازی این گفتگو"
              className="p-2 text-[#74756F] hover:text-[#292A27] dark:text-[#A0A0A0] dark:hover:text-[#E8E8E8] rounded-xl hover:bg-[#F4F3EF] dark:hover:bg-[#151515] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={() => setIsAIAssistantOpen(false)}
              title="بستن پنجره"
              className="p-2 text-[#74756F] hover:text-[#292A27] dark:text-[#A0A0A0] dark:hover:text-[#E8E8E8] rounded-xl hover:bg-[#F4F3EF] dark:hover:bg-[#151515] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            MAIN BODY (SIDEBAR + CHAT VIEW)
            ========================================================================= */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Conversation Sidebar (Collapsible Drawer) */}
          <div
            className={`absolute sm:relative inset-y-0 right-0 z-30 w-72 sm:w-64 bg-white dark:bg-[#0D0D0D] border-l border-[#E7E5DF] dark:border-[#252525] flex flex-col transition-all duration-300 ease-in-out shadow-xl sm:shadow-none ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full sm:-mr-64 sm:hidden'
            }`}
          >
            <div className="p-3 border-b border-[#E7E5DF] dark:border-[#252525] flex items-center justify-between">
              <span className="text-xs font-bold text-[#292A27] dark:text-[#E8E8E8] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#D6A62E]" />
                تاریخچه گفتگوها ({toPersianDigits(aiConversations.length)})
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="sm:hidden p-1 text-[#74756F] dark:text-[#A0A0A0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
              <button
                onClick={() => {
                  createNewAIConversation();
                  if (window.innerWidth < 640) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#D6A62E]/40 text-[#D6A62E] hover:bg-[#D6A62E]/10 text-xs font-semibold transition-all text-right cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>شروع گفتگوی تازه</span>
              </button>

              {aiConversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#74756F] dark:text-[#A0A0A0]">
                  مکالمه ذخیره‌شده‌ای وجود ندارد.
                </div>
              ) : (
                aiConversations.map((conv) => {
                  const isActive = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        selectAIConversation(conv.id);
                        if (window.innerWidth < 640) setIsSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#D6A62E]/15 border-[#D6A62E]/40 text-[#D6A62E] font-bold'
                          : 'bg-[#F9F8F5] dark:bg-[#151515] border-[#E7E5DF] dark:border-[#252525] text-[#292A27] dark:text-[#E8E8E8] hover:border-[#D6A62E]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-[#D6A62E]' : 'text-[#A0A0A0]'
                          }`}
                        />
                        <div className="truncate text-right">
                          <p className="truncate">{conv.title}</p>
                          <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] font-normal">
                            {toPersianDigits(conv.messageCount)} پیام
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAIConversation(conv.id);
                        }}
                        title="حذف مکالمه"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#A0A0A0] hover:text-rose-500 transition-opacity rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Messages Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F4F3EF] dark:bg-[#000000]">
            {/* Quick Scenario Buttons Strip (Section 5) */}
            <div className="px-3 sm:px-4 py-2 border-b border-[#E7E5DF] dark:border-[#252525] bg-white dark:bg-[#0D0D0D] flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] shrink-0">
              <span className="text-[#74756F] dark:text-[#A0A0A0] whitespace-nowrap font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D6A62E]" />
                سناریوهای پرکاربرد:
              </span>
              <button
                type="button"
                onClick={() => handleQuickPrompt('بر اساس کارهای ثبت‌شده من، بهترین زمان‌بندی و برنامه متمرکز برای امروز را پیشنهاد بده')}
                className="px-2.5 py-1 rounded-lg bg-[#F9F8F5] dark:bg-[#151515] hover:border-[#D6A62E] text-[#292A27] dark:text-[#E8E8E8] border border-[#E7E5DF] dark:border-[#252525] transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <CalendarCheck className="w-3 h-3 text-[#D6A62E]" />
                برنامه بهینه امروز
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('من دچار عقب‌افتادگی و کمبود زمان شده‌ام. کارهای حیاتی را از قابل‌تعویق جدا کن و یک گام ۵ دقیقه‌ای برای شروع به من بده')}
                className="px-2.5 py-1 rounded-lg bg-[#F9F8F5] dark:bg-[#151515] hover:border-[#D6A62E] text-[#292A27] dark:text-[#E8E8E8] border border-[#E7E5DF] dark:border-[#252525] transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <LifeBuoy className="w-3 h-3 text-[#D6A62E]" />
                طرح نجات روز (Rescue)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('هدف فعال من را بررسی کن و آن را به ۳ گام اجرایی کوچک و وظایف مشخص این هفته تبدیل کن')}
                className="px-2.5 py-1 rounded-lg bg-[#F9F8F5] dark:bg-[#151515] hover:border-[#D6A62E] text-[#292A27] dark:text-[#E8E8E8] border border-[#E7E5DF] dark:border-[#252525] transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Target className="w-3 h-3 text-[#D6A62E]" />
                خرد کردن اهداف بزرگ
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('وضعیت استمرار عادات و پیشرفت اهداف من در این هفته چطور است؟ برای حفظ پیوستگی چه توصیه‌ای داری؟')}
                className="px-2.5 py-1 rounded-lg bg-[#F9F8F5] dark:bg-[#151515] hover:border-[#D6A62E] text-[#292A27] dark:text-[#E8E8E8] border border-[#E7E5DF] dark:border-[#252525] transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Flame className="w-3 h-3 text-[#D6A62E]" />
                ارزیابی استمرار و پیشرفت
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin">
              {/* Empty state when conversation has no messages */}
              {aiMessages.length === 0 && !isAILoading && !isAIStreaming && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-lg mx-auto space-y-4 animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#D6A62E]/15 border border-[#D6A62E]/30 flex items-center justify-center text-[#D6A62E] shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-sm sm:text-base font-bold text-[#292A27] dark:text-[#E8E8E8]">
                      سلام، {userName}! چطور می‌توانم در کارهایت به تو کمک کنم؟
                    </h3>
                    <p className="text-xs text-[#74756F] dark:text-[#A0A0A0] leading-relaxed">
                      من به عنوان مشاور هوشمند، به اطلاعات وظایف امروز، تکالیف در انتظار، اهداف و عادات شما دسترسی دارم و برای ساخت برنامه روزانه، غلبه بر خستگی و پیگیری گام‌به‌گام در کنارتان هستم.
                    </p>
                  </div>

                  {/* Workload snapshot banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-center">
                      <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] block">کارهای امروز</span>
                      <span className="text-xs font-bold text-[#292A27] dark:text-[#E8E8E8] font-mono">
                        {toPersianDigits(pendingTodayTasksCount)} باقی‌مانده
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-center">
                      <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] block">تکالیف در انتظار</span>
                      <span className="text-xs font-bold text-[#292A27] dark:text-[#E8E8E8] font-mono">
                        {toPersianDigits(pendingHomeworkCount)} مورد
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-center">
                      <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] block">اهداف فعال</span>
                      <span className="text-xs font-bold text-[#292A27] dark:text-[#E8E8E8] font-mono">
                        {toPersianDigits(activeGoalsCount)} هدف
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-center">
                      <span className="text-[10px] text-[#74756F] dark:text-[#A0A0A0] block">عادات روزانه</span>
                      <span className="text-xs font-bold text-[#292A27] dark:text-[#E8E8E8] font-mono">
                        {toPersianDigits(activeHabitsCount)} عادت
                      </span>
                    </div>
                  </div>

                  {/* 4 Clickable Quick Starter Prompts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                    <button
                      onClick={() => handleQuickPrompt('بر اساس کارهای ثبت‌شده من، بهترین زمان‌بندی و برنامه متمرکز برای امروز را پیشنهاد بده')}
                      className="p-3 text-right rounded-xl bg-white dark:bg-[#0D0D0D] hover:border-[#D6A62E] border border-[#E7E5DF] dark:border-[#252525] transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#292A27] dark:text-[#E8E8E8] group-hover:text-[#D6A62E]">
                        <Clock className="w-3.5 h-3.5 text-[#D6A62E]" />
                        <span>زمان‌بندی هوشمند امروز</span>
                      </div>
                      <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] mt-1">
                        تقسیم روز به بازه‌های تمرکز ۴۵ دقیقه‌ای همراه با استراحت
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickPrompt('من دچار عقب‌افتادگی و کمبود زمان شده‌ام. کارهای حیاتی را از قابل‌تعویق جدا کن و یک گام ۵ دقیقه‌ای برای شروع به من بده')}
                      className="p-3 text-right rounded-xl bg-white dark:bg-[#0D0D0D] hover:border-[#D6A62E] border border-[#E7E5DF] dark:border-[#252525] transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#292A27] dark:text-[#E8E8E8] group-hover:text-[#D6A62E]">
                        <LifeBuoy className="w-3.5 h-3.5 text-[#D6A62E]" />
                        <span>طرح نجات کارهای عقب‌افتاده</span>
                      </div>
                      <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] mt-1">
                        کاهش اضطراب، فیلتر اولویت‌ها و شروع با اقدام ۵ دقیقه‌ای
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickPrompt('هدف فعال من را بررسی کن و آن را به ۳ گام اجرایی کوچک و وظایف مشخص این هفته تبدیل کن')}
                      className="p-3 text-right rounded-xl bg-white dark:bg-[#0D0D0D] hover:border-[#D6A62E] border border-[#E7E5DF] dark:border-[#252525] transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#292A27] dark:text-[#E8E8E8] group-hover:text-[#D6A62E]">
                        <Target className="w-3.5 h-3.5 text-[#D6A62E]" />
                        <span>خرد کردن هدف بزرگ</span>
                      </div>
                      <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] mt-1">
                        تبدیل اهداف کلی به نقاط عطف هفتگی و اقدامات ملموس
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickPrompt('وضعیت استمرار عادات و پیشرفت اهداف من در این هفته چطور است؟ برای حفظ پیوستگی چه توصیه‌ای داری؟')}
                      className="p-3 text-right rounded-xl bg-white dark:bg-[#0D0D0D] hover:border-[#D6A62E] border border-[#E7E5DF] dark:border-[#252525] transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#292A27] dark:text-[#E8E8E8] group-hover:text-[#D6A62E]">
                        <Flame className="w-3.5 h-3.5 text-[#D6A62E]" />
                        <span>ارزیابی تداوم و استمرار</span>
                      </div>
                      <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] mt-1">
                        بررسی زنجیره استمرار و توصیه‌های روان‌شناختی حفظ انگیزه
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Message List */}
              {aiMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isCopied = copiedMessageId === msg.id;

                const { cleanText, proposal } = isUser
                  ? { cleanText: msg.text, proposal: null }
                  : parseActionProposal(msg.text);

                const isApplied = appliedProposals[msg.id];
                const isDismissed = dismissedProposals[msg.id];
                const isEditingThis = editingProposalMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 sm:gap-3 group ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                        isUser
                          ? 'bg-[#292A27] dark:bg-[#E8E8E8] text-white dark:text-black font-bold'
                          : 'bg-[#D6A62E]/15 text-[#D6A62E] border border-[#D6A62E]/30'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {/* Message Bubble Container */}
                    <div className="relative max-w-[88%] sm:max-w-[80%] space-y-2.5">
                      <div
                        className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed transition-colors shadow-2xs ${
                          isUser
                            ? 'bg-[#292A27] dark:bg-[#151515] text-white dark:text-[#E8E8E8] font-medium rounded-tr-none'
                            : 'bg-white dark:bg-[#0D0D0D] text-[#292A27] dark:text-[#E8E8E8] border border-[#E7E5DF] dark:border-[#252525] rounded-tl-none'
                        }`}
                      >
                        {/* Assistant Markdown rendering or user plain text */}
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <MarkdownRenderer content={cleanText} />
                        )}

                        {/* Message Toolbar */}
                        <div
                          className={`mt-2 pt-1 flex items-center justify-between text-[10px] ${
                            isUser ? 'text-[#A0A0A0]' : 'text-[#74756F] dark:text-[#A0A0A0]'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {!isUser && (
                            <button
                              onClick={() => handleCopyMessage(msg.id, cleanText)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-[#D6A62E] transition-opacity cursor-pointer p-0.5 rounded"
                              title="کپی متن پاسخ"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500">کپی شد</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>کپی</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Interactive Action Proposal Card (Section 4 & 6) */}
                      {proposal && !isDismissed && (
                        <div className="p-3 bg-white dark:bg-[#0D0D0D] border border-[#D6A62E]/40 rounded-xl shadow-xs space-y-2.5 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 font-bold text-[#D6A62E]">
                              <Sparkles className="w-3.5 h-3.5" />
                              پیشنهاد هوشمند برای ثبت در سیستم:
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D6A62E]/15 text-[#D6A62E] font-medium border border-[#D6A62E]/25">
                              {proposal.type === 'create_task'
                                ? 'وظیفه امروز'
                                : proposal.type === 'create_goal'
                                ? 'هدف جدید'
                                : proposal.type === 'create_note'
                                ? 'یادداشت'
                                : 'رویداد تقویم'}
                            </span>
                          </div>

                          {/* Editable Preview Card */}
                          <div className="p-2.5 rounded-lg bg-[#F9F8F5] dark:bg-[#151515] border border-[#E7E5DF] dark:border-[#252525] text-xs space-y-1">
                            {isEditingThis ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-[#74756F] dark:text-[#A0A0A0]">عنوان:</label>
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full mt-0.5 p-1.5 text-xs rounded bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-[#292A27] dark:text-[#E8E8E8] focus:border-[#D6A62E] outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-[#74756F] dark:text-[#A0A0A0]">توضیحات:</label>
                                  <input
                                    type="text"
                                    value={editDetails}
                                    onChange={(e) => setEditDetails(e.target.value)}
                                    className="w-full mt-0.5 p-1.5 text-xs rounded bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-[#292A27] dark:text-[#E8E8E8] focus:border-[#D6A62E] outline-none"
                                  />
                                </div>
                                {proposal.time && (
                                  <div>
                                    <label className="text-[10px] text-[#74756F] dark:text-[#A0A0A0]">ساعت:</label>
                                    <input
                                      type="text"
                                      value={editTime}
                                      onChange={(e) => setEditTime(e.target.value)}
                                      className="w-full mt-0.5 p-1.5 text-xs rounded bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-[#292A27] dark:text-[#E8E8E8] focus:border-[#D6A62E] outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <p className="font-bold text-[#292A27] dark:text-[#E8E8E8]">{proposal.title}</p>
                                {proposal.details && (
                                  <p className="text-[11px] text-[#74756F] dark:text-[#A0A0A0] mt-0.5 leading-relaxed">
                                    {proposal.details}
                                  </p>
                                )}
                                <div className="flex items-center gap-2.5 text-[10px] text-[#74756F] dark:text-[#A0A0A0] mt-1.5 font-mono">
                                  {proposal.time && <span>ساعت: {toPersianDigits(proposal.time)}</span>}
                                  {proposal.date && <span>تاریخ: {toPersianDigits(proposal.date)}</span>}
                                  {proposal.priority && (
                                    <span>
                                      اولویت:{' '}
                                      {proposal.priority === 'high'
                                        ? 'فوری'
                                        : proposal.priority === 'medium'
                                        ? 'متوسط'
                                        : 'عادی'}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Approval / Edit / Dismiss Action Buttons */}
                          <div className="flex items-center justify-between pt-1">
                            {isApplied ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>با موفقیت در سامانه ثبت شد ✓</span>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDismissProposal(msg.id)}
                                    className="text-xs text-[#74756F] dark:text-[#A0A0A0] hover:underline cursor-pointer"
                                  >
                                    رد پیشنهاد
                                  </button>
                                  {!isEditingThis && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditingProposal(msg.id, proposal)}
                                      className="text-xs text-[#74756F] dark:text-[#A0A0A0] hover:text-[#D6A62E] flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      ویرایش
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleApproveProposal(msg.id, proposal)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6A62E] hover:bg-[#c4931a] text-black text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>تأیید و ثبت در سیستم</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Live Streaming Chunk Bubble */}
              {isAIStreaming && aiStreamText && (
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row animate-in fade-in duration-100">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#D6A62E]/15 text-[#D6A62E] border border-[#D6A62E]/30 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="relative max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed bg-white dark:bg-[#0D0D0D] text-[#292A27] dark:text-[#E8E8E8] border border-[#D6A62E]/30 rounded-tl-none shadow-xs">
                    <MarkdownRenderer content={aiStreamText} isStreaming={true} />
                  </div>
                </div>
              )}

              {/* Thinking / Processing Spinner (Before first token arrives) */}
              {isAILoading && !aiStreamText && (
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row animate-in fade-in duration-150">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#D6A62E]/15 border border-[#D6A62E]/30 flex items-center justify-center text-[#D6A62E] shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-[#0D0D0D] border border-[#E7E5DF] dark:border-[#252525] text-xs text-[#74756F] dark:text-[#A0A0A0] flex items-center gap-2 shadow-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A62E] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A62E] animate-bounce delay-150" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A62E] animate-bounce delay-300" />
                    </div>
                    <span>در حال ارزیابی برنامه و تولید پاسخ زنده...</span>
                  </div>
                </div>
              )}

              {/* Error Display with Retry */}
              {aiError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  <button
                    onClick={retryLastAIMessage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shrink-0 cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تلاش مجدد</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Stop Button (While streaming) */}
            {isAIStreaming && (
              <div className="flex justify-center -mb-2 relative z-20">
                <button
                  type="button"
                  onClick={stopAIGeneration}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/90 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg border border-[#252525] transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                >
                  <Square className="w-3 h-3 fill-current text-rose-400" />
                  <span>توقف پاسخ</span>
                </button>
              </div>
            )}

            {/* Bottom Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 border-t border-[#E7E5DF] dark:border-[#252525] bg-white dark:bg-[#0D0D0D] relative z-10"
            >
              <div className="flex items-end gap-2 bg-[#F9F8F5] dark:bg-[#151515] border border-[#E7E5DF] dark:border-[#252525] focus-within:border-[#D6A62E] rounded-2xl p-2 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="سؤالتان را بنویسید یا درخواست برنامه‌ریزی دهید (مثلاً: برای تکالیف امشب یک زمان‌بندی بهینه پیشنهاد بده)..."
                  rows={1}
                  disabled={isAILoading || isAIStreaming}
                  className="flex-1 bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-[#292A27] dark:text-[#E8E8E8] placeholder-[#74756F]/60 dark:placeholder-[#A0A0A0]/60 resize-none max-h-32 min-h-[38px] py-1.5 px-2 leading-relaxed"
                />

                {isAIStreaming ? (
                  <button
                    type="button"
                    onClick={stopAIGeneration}
                    title="توقف تولید"
                    className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || isAILoading}
                    title="ارسال پیام"
                    className="p-2.5 rounded-xl bg-[#D6A62E] hover:bg-[#c4931a] text-black font-bold disabled:opacity-40 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                )}
              </div>

              <div className="mt-2 text-[10px] text-[#74756F] dark:text-[#A0A0A0] px-1 flex items-center justify-between">
                <span>
                  کلید <kbd className="px-1 py-0.5 rounded bg-[#E7E5DF] dark:bg-[#252525] font-mono">Enter</kbd> برای ارسال · <kbd className="px-1 py-0.5 rounded bg-[#E7E5DF] dark:bg-[#252525] font-mono">Shift+Enter</kbd> برای خط بعد
                </span>
                <span className="hidden sm:inline">
                  متصل به اطلاعات زنده برنامه‌ریز شما
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
