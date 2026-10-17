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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/85 backdrop-blur-xl animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-2xl glass-strong rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Subtle Ambient Specular Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fg opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fg opacity-5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-line relative z-10 bg-chip/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chip border border-line flex items-center justify-center text-fg shadow-xs">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-fg">
                حالت نجات روز
              </h2>
              <p className="text-xs text-muted mt-0.5">
                سازماندهی اولویت‌ها و جبران عقب‌افتادگی روزانه
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRescueModalOpen(false)}
            className="p-2 text-muted hover:text-fg rounded-lg hover:bg-chip transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 relative z-10 flex-1">
          {/* Supportive Guidance Hint */}
          <div className="p-3.5 rounded-xl bg-chip border border-line text-xs text-fg leading-relaxed flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-fg shrink-0" />
            <span>اولویت‌های ضروری امروز را مشخص کنید تا کارهای غیرفوری به روزهای بعد موکول شوند.</span>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-fg block mb-2.5">
              چقدر توان یا زمان برای امروز دارید؟
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleGenerate('15_min')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  selectedMode === '15_min'
                    ? 'border-fg bg-chip text-fg ring-1 ring-fg/20'
                    : 'border-line bg-surface text-muted hover:border-line hover:text-fg hover:bg-chip'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-fg">میکرو اسپرینت</span>
                  <Clock className="w-4 h-4 text-fg" />
                </div>
                <div className="font-semibold text-sm text-fg">فقط ۱۵ دقیقه وقت دارم</div>
                <div className="text-[11px] text-muted mt-1">یک اقدام فوق‌العاده کوتاه و بستن روز با حس موفقیت</div>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('1_hour')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  selectedMode === '1_hour'
                    ? 'border-fg bg-chip text-fg ring-1 ring-fg/20'
                    : 'border-line bg-surface text-muted hover:border-line hover:text-fg hover:bg-chip'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-fg">بلوک قدرت</span>
                  <Flame className="w-4 h-4 text-fg" />
                </div>
                <div className="font-semibold text-sm text-fg">یک ساعت وقت دارم</div>
                <div className="text-[11px] text-muted mt-1">۲ بازه ۲۵ دقیقه‌ای پومودورو با استراحت کوتاه</div>
              </button>

              <button
                type="button"
                onClick={() => handleGenerate('rebuild_day')}
                disabled={loading}
                className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  selectedMode === 'rebuild_day'
                    ? 'border-fg bg-chip text-fg ring-1 ring-fg/20'
                    : 'border-line bg-surface text-muted hover:border-line hover:text-fg hover:bg-chip'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-fg">بازسازی واقع‌بینانه</span>
                  <RotateCcw className="w-4 h-4 text-fg" />
                </div>
                <div className="font-semibold text-sm text-fg">بازسازی باقی روز</div>
                <div className="text-[11px] text-muted mt-1">انتخاب ۳ کار حیاتی و انتقال بقیه بدون عذاب وجدان</div>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-fg border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted">در حال ارزیابی وظایف و ساخت برنامه نجات...</p>
            </div>
          )}

          {/* Rescue Plan Result */}
          {!loading && rescuePlan && (
            <div className="space-y-4 animate-fade-in">
              {/* Smallest Step Highlight */}
              <div className="p-4 rounded-xl bg-chip border border-line">
                <div className="flex items-center gap-2 text-fg text-xs font-bold mb-1.5">
                  <Sparkles className="w-4 h-4" />
                  کوچک‌ترین قدم مفید برای شروع همین الان:
                </div>
                <p className="text-sm font-semibold text-fg leading-relaxed">
                  {rescuePlan.smallestStep}
                </p>
              </div>

              {/* Message from Coach */}
              {rescuePlan.message && (
                <div className="text-xs text-fg bg-chip p-3 rounded-xl border border-line">
                  {rescuePlan.message}
                </div>
              )}

              {/* Suggested Steps */}
              <div>
                <h3 className="text-xs font-bold text-fg mb-2 flex items-center justify-between">
                  <span>برنامه پیشنهادی متناسب با زمان شما:</span>
                  <span className="text-[11px] text-muted">
                    {toPersianDigits(rescuePlan.suggestedSchedule.length)} گام
                  </span>
                </h3>
                <div className="space-y-2">
                  {rescuePlan.suggestedSchedule.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        step.isBreak
                          ? 'bg-chip/50 border-dashed border-line text-muted'
                          : 'bg-surface border-line text-fg shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-chip border border-line flex items-center justify-center text-xs font-bold text-fg">
                          {step.isBreak ? <Coffee className="w-3.5 h-3.5" /> : toPersianDigits(idx + 1)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium">{step.title}</div>
                          {step.note && (
                            <div className="text-[11px] text-muted mt-0.5">{step.note}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-xs font-mono text-fg bg-chip px-2 py-0.5 rounded border border-line font-bold">
                          {toPersianDigits(step.timeSlot)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deferred vs Critical Tasks Notes */}
              {rescuePlan.deferredTaskIds?.length > 0 && (
                <div className="p-3 rounded-xl bg-chip border border-line text-xs text-muted flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted shrink-0" />
                  <span>
                    {toPersianDigits(rescuePlan.deferredTaskIds.length)} وظیفه غیرفوری شناسایی و به فردا موکول شدند تا ذهن شما آسوده باشد.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-line bg-surface/90 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={() => handleGenerate(selectedMode)}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-fg bg-chip hover:bg-chip/80 border border-line rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            تحلیل مجدد
          </button>

          <div className="flex items-center gap-2 mr-auto">
            <button
              type="button"
              onClick={() => setIsRescueModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-muted hover:text-fg rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            {rescuePlan && (
              <button
                type="button"
                onClick={() => applyRescuePlan(rescuePlan)}
                className="px-5 py-2.5 text-xs font-bold text-bg bg-fg hover:opacity-90 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
