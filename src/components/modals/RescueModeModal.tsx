import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RescueModeType } from '../../types';
import { toPersianDigits } from '../../utils/jalali';
import {
  LifeBuoy,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ArrowRight,
  Flame,
  Coffee,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const RescueModeModal: React.FC = () => {
  const {
    isRescueModalOpen,
    setIsRescueModalOpen,
    rescuePlan,
    generateRescuePlan,
    applyRescuePlan,
    clearRescuePlan,
  } = useApp();

  const [selectedMode, setSelectedMode] = useState<RescueModeType>('1_hour');
  const [loading, setLoading] = useState(false);

  if (!isRescueModalOpen) return null;

  const handleGenerate = async (mode: RescueModeType) => {
    setSelectedMode(mode);
    setLoading(true);
    try {
      await generateRescuePlan(mode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Amber/Cyan Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                حالت نجات روز من
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Rescue Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                وقتی از برنامه عقب افتاده‌اید، خسته‌اید یا نمی‌دانید از کجا شروع کنید
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRescueModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 relative z-10 flex-1">
          {/* Supportive Mindset Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-cyan-500/10 border border-amber-500/20 text-sm text-slate-300 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-0.5">هیچ شکستی در کار نیست!</span>
              عقب‌افتادن از برنامه کاملاً طبیعی است. هدف این بخش کاهش اضطراب، حذف کارهای غیرضروری امروز و ایجاد یک پیروزی فوری برای بازگشت به مسیر است.
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2.5">
              چقدر توان یا زمان برای امروز دارید؟
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleGenerate('15_min')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  selectedMode === '15_min'
                    ? 'border-cyan-500 bg-cyan-500/15 text-white shadow-lg shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-400">میکرو اسپرینت</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-semibold text-sm">فقط ۱۵ دقیقه وقت دارم</div>
                <div className="text-[11px] text-slate-400 mt-1">یک اقدام فوق‌العاده کوتاه و بستن روز با حس موفقیت</div>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('1_hour')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  selectedMode === '1_hour'
                    ? 'border-amber-500 bg-amber-500/15 text-white shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400">بلوک قدرت</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-semibold text-sm">یک ساعت وقت دارم</div>
                <div className="text-[11px] text-slate-400 mt-1">۲ بازه ۲۵ دقیقه‌ای پومودورو با استراحت کوتاه</div>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('rebuild_day')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                  selectedMode === 'rebuild_day'
                    ? 'border-purple-500 bg-purple-500/15 text-white shadow-lg shadow-purple-500/10'
                    : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400">بازسازی واقع‌بینانه</span>
                  <RotateCcw className="w-4 h-4 text-purple-400" />
                </div>
                <div className="font-semibold text-sm">بازسازی باقی روز</div>
                <div className="text-[11px] text-slate-400 mt-1">انتخاب ۳ کار حیاتی و انتقال بقیه بدون عذاب وجدان</div>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-amber-300">در حال ارزیابی وظایف و ساخت برنامه نجات...</p>
            </div>
          )}

          {/* Rescue Plan Result */}
          {!loading && rescuePlan && (
            <div className="space-y-4 animate-fade-in">
              {/* Smallest Step Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-800/70 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  کوچک‌ترین قدم مفید برای شروع همین الان:
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {rescuePlan.smallestStep}
                </p>
              </div>

              {/* Message from Coach */}
              {rescuePlan.message && (
                <div className="text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  {rescuePlan.message}
                </div>
              )}

              {/* Suggested Steps */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center justify-between">
                  <span>برنامه پیشنهادی متناسب با زمان شما:</span>
                  <span className="text-[11px] text-slate-500">
                    {toPersianDigits(rescuePlan.suggestedSchedule.length)} گام
                  </span>
                </h3>
                <div className="space-y-2">
                  {rescuePlan.suggestedSchedule.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        step.isBreak
                          ? 'bg-slate-800/30 border-dashed border-slate-700 text-slate-400'
                          : 'bg-slate-800/80 border-slate-700/80 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            step.isBreak
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {step.isBreak ? <Coffee className="w-3.5 h-3.5" /> : toPersianDigits(idx + 1)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium">{step.title}</div>
                          {step.note && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{step.note}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          {toPersianDigits(step.timeSlot)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deferred vs Critical Tasks Notes */}
              {rescuePlan.deferredTaskIds?.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    {toPersianDigits(rescuePlan.deferredTaskIds.length)} وظیفه غیرفوری شناسایی و به فردا موکول شدند تا ذهن شما آسوده باشد.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={() => handleGenerate(selectedMode)}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            تحلیل مجدد
          </button>

          <div className="flex items-center gap-2 mr-auto">
            <button
              type="button"
              onClick={() => setIsRescueModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
            >
              انصراف
            </button>
            {rescuePlan && (
              <button
                type="button"
                onClick={() => applyRescuePlan(rescuePlan)}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                تأیید و اعمال در برنامه امروز
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
