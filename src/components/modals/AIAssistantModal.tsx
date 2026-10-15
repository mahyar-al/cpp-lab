import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  RotateCcw,
  Clock,
  ArrowRight,
  Target,
  LifeBuoy,
} from 'lucide-react';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    aiMessages,
    isAILoading,
    sendAIMessage,
    clearAIMessages,
    setIsRescueModalOpen,
  } = useApp();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAIAssistantOpen]);

  if (!isAIAssistantOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isAILoading) return;
    const msg = input.trim();
    setInput('');
    await sendAIMessage(msg);
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        {/* Futuristic Background Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 relative z-10 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  دستیار هوشمند مسیر (AI Life Coach)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-medium">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                مشاور شخصی تحصیلی، شکستن اهداف، مدیریت تمرکز و نجات روز
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearAIMessages}
              title="پاکسازی تاریخچه گفتگو"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAIAssistantOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar relative z-10 text-[11px]">
          <span className="text-slate-500 whitespace-nowrap">پیشنهاد سریع:</span>
          <button
            type="button"
            onClick={() => handleQuickPrompt('امروز از برنامه عقب افتادم، کمکم کن.')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <LifeBuoy className="w-3 h-3 text-amber-500" />
            عقب افتادم
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt('یک برنامه بهینه ۴ ساعته برای مطالعه بعدازظهر من بچین.')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3 h-3 text-cyan-500" />
            برنامه ۴ ساعته
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt('چگونه برای آزمون هفته آینده مرور فاصله‌دار داشته باشم؟')}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/60 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer"
          >
            <Target className="w-3 h-3 text-emerald-500" />
            مرور آزمون
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 relative z-10 bg-slate-50/50 dark:bg-transparent">
          {aiMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-tr-none shadow-sm'
                    : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-tl-none whitespace-pre-line shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isAILoading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-tl-none text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-xs">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce delay-200" />
                </div>
                <span>در حال تحلیل و تدوین پاسخ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 relative z-10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سؤالتان را بنویسید یا درخواست برنامه‌ریزی دهید..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAILoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
