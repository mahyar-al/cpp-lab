import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { toPersianDigits } from '../../utils/jalali';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Clock,
  Target,
  LifeBuoy,
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
} from 'lucide-react';

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
    selectAIConversation,
    createNewAIConversation,
    deleteAIConversation,
    clearActiveAIConversation,
    sendStreamingAIMessage,
    stopAIGeneration,
    retryLastAIMessage,
    currentUser,
    openAuthModal,
  } = useApp();

  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1120] border border-slate-200 dark:border-cyan-500/25 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[740px] max-h-[94vh] transition-colors duration-200">
        {/* Futuristic Ambient Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/8 dark:bg-cyan-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/8 dark:bg-purple-600/12 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 relative z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Toggle Conversations Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'بستن تاریخچه مکالمات' : 'مشاهده تاریخچه مکالمات'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 rtl:rotate-180" /> : <PanelLeftOpen className="w-5 h-5 rtl:rotate-180" />}
            </button>

            {/* AI Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="مدل هوش مصنوعی متصل و فعال" />
            </div>

            {/* Title & Status */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeConversationTitle || 'مسیرساز هوشمند (AI Life Coach)'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                متصل به اطلاعات واقعی، تکالیف و اهداف شما در Pathly
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={createNewAIConversation}
              title="مکالمه جدید"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">مکالمه جدید</span>
            </button>

            <button
              onClick={clearActiveAIConversation}
              title="پاکسازی تاریخچه این گفتگو"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsAIAssistantOpen(false)}
              title="بستن پنجره"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body with Sidebar Drawer */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Conversation Sidebar (Collapsible Drawer) */}
          <div
            className={`absolute sm:relative inset-y-0 right-0 z-30 w-72 sm:w-64 bg-slate-50 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-xl sm:shadow-none ${
              isSidebarOpen ? 'translate-x-0' : 'translate-x-full sm:-mr-64 sm:hidden'
            }`}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                تاریخچه گفتگوها ({toPersianDigits(aiConversations.length)})
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="sm:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
              <button
                onClick={() => {
                  createNewAIConversation();
                  if (window.innerWidth < 640) setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold transition-all text-right cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0 text-cyan-500" />
                <span>شروع گفتگوی تازه</span>
              </button>

              {aiConversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  هنوز مکالمه ذخیره‌شده‌ای وجود ندارد.
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
                      className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-900 dark:text-cyan-200 font-bold'
                          : 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="truncate text-right">
                          <p className="truncate">{conv.title}</p>
                          <span className="text-[10px] opacity-60 font-normal">
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
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity rounded cursor-pointer"
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
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50/40 dark:bg-[#080B14]/60">
            {/* Quick Context & Prompts Strip */}
            <div className="px-3 sm:px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] shrink-0">
              <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                پرسش‌های پیشنهادی:
              </span>
              <button
                type="button"
                onClick={() => handleQuickPrompt('امروز چه کارها و تکالیفی برای انجام دارم؟')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/70 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                کارهای امروز من
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('تکالیف مدرسه در انتظار من چیه و مهلت کدام نزدیک‌تره؟')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/70 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-emerald-500" />
                تکالیف در انتظار
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('امروز از برنامه عقب افتادم، چطور در یک ساعت روز را نجات دهم؟')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/70 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <LifeBuoy className="w-3 h-3 text-amber-500" />
                نجات روز (عقب‌افتادگی)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt('وضعیت استمرار عادات و پیشرفت اهداف من چطوره؟')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/70 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
              >
                <Target className="w-3 h-3 text-purple-500" />
                استمرار عادات و اهداف
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 no-scrollbar">
              {aiMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isCopied = copiedMessageId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 sm:gap-3 group ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold'
                          : 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-colors ${
                        isUser
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-tr-none'
                          : 'bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                      }`}
                    >
                      {/* Assistant Markdown rendering or user text */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <MarkdownRenderer content={msg.text} />
                      )}

                      {/* Message Toolbar */}
                      <div
                        className={`mt-2 pt-1 flex items-center justify-between text-[10px] ${
                          isUser ? 'text-cyan-100' : 'text-slate-400'
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
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-cyan-500 transition-opacity cursor-pointer p-1 rounded"
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
                  </div>
                );
              })}

              {/* Live Streaming Chunk Bubble */}
              {isAIStreaming && aiStreamText && (
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 animate-spin text-cyan-500" />
                  </div>
                  <div className="relative max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 border border-cyan-500/30 rounded-tl-none shadow-sm shadow-cyan-500/5">
                    <MarkdownRenderer content={aiStreamText} isStreaming={true} />
                  </div>
                </div>
              )}

              {/* Thinking / Processing Spinner (Before first token) */}
              {isAILoading && !aiStreamText && (
                <div className="flex items-start gap-2.5 sm:gap-3 flex-row animate-fade-in">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-cyan-500 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5 shadow-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce delay-150" />
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce delay-300" />
                    </div>
                    <span>در حال فراخوانی مدل زنده Gemini و پردازش اطلاعات برنامه‌ریز...</span>
                  </div>
                </div>
              )}

              {/* Error Display with Retry */}
              {aiError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                  <button
                    onClick={retryLastAIMessage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shrink-0 cursor-pointer text-xs"
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/90 hover:bg-red-500/90 text-white text-xs font-semibold shadow-lg border border-slate-700 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                >
                  <Square className="w-3 h-3 fill-current text-red-400" />
                  <span>توقف تولید پاسخ</span>
                </button>
              </div>
            )}

            {/* Bottom Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 relative z-10"
            >
              <div className="flex items-end gap-2 bg-slate-100/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-within:border-cyan-500 dark:focus-within:border-cyan-500 rounded-2xl p-2 transition-all shadow-inner">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    currentUser
                      ? 'سؤالتان را بنویسید یا درخواست برنامه‌ریزی دهید (مثلاً: امروز چه تکالیفی دارم؟)...'
                      : 'برای گفتگو با هوش مصنوعی ابتدا وارد حساب خود شوید...'
                  }
                  rows={1}
                  disabled={isAILoading || isAIStreaming}
                  className="flex-1 bg-transparent border-0 focus:outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none max-h-32 min-h-[36px] py-1.5 px-2 leading-relaxed"
                />

                {isAIStreaming ? (
                  <button
                    type="button"
                    onClick={stopAIGeneration}
                    title="توقف تولید"
                    className="p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-red-500/20"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || isAILoading}
                    title="ارسال پیام"
                    className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>
                  کلید <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Enter</kbd> برای ارسال • <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">Shift+Enter</kbd> برای خط جدید
                </span>
                <span className="hidden sm:inline">
                  پاسخ‌ها به صورت زنده و مستقیماً از مدل زبانی تولید می‌شوند.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
