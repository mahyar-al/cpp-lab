import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { DoodleCrewFooter } from '../ui/doodle-crew-footer';
import { useApp } from '../../context/AppContext';

interface AlefOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlanning?: () => void;
}

export const AlefOpeningModal: React.FC<AlefOpeningModalProps> = ({
  isOpen,
  onClose,
  onStartPlanning,
}) => {
  const { resolvedTheme } = useApp();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain]);

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('alef_intro_dismissed_v1', 'true');
      } catch {}
    }
    onClose();
  };

  const handleStartPlanning = () => {
    handleClose();
    if (onStartPlanning) {
      onStartPlanning();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="خوش‌آمدگویی سامانه الف"
    >
      <div className="relative w-full max-w-5xl rounded-[32px] overflow-hidden border border-line bg-surface shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
        {/* Top Control Bar */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/90 border border-line backdrop-blur-md shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-bold text-fg">خوش‌آمدید به سامانه الف</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-surface/90 hover:bg-chip border border-line text-muted hover:text-fg transition-all cursor-pointer shadow-xs active:scale-95"
              title="ورود به سامانه (Esc)"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Doodle Crew Storyboard with Wordmark ALEF */}
        <div className="pt-12 pb-4 sm:pb-6 px-2 sm:px-4">
          <DoodleCrewFooter
            wordmark="ALEF"
            brand="سامانه الف"
            blurb="دفترچه هوشمند شما برای برنامه‌ریزی درسی، پیگیری مهارت‌ها و مسیر موفقیت تحصیلی با تقویم شمسی."
            tagline="سفر پیشرفت و یادگیری هدفمند شما از الف آغاز می‌شود."
            preset={resolvedTheme === 'dark' ? 'night' : 'paper'}
            actions={[
              {
                label: 'ورود مستقیم به برنامه',
                icon: 'bolt',
                variant: 'solid',
                onClick: handleClose,
              },
              {
                label: 'شروع برنامه‌ریزی امروز',
                icon: 'star',
                variant: 'outline',
                onClick: handleStartPlanning,
              },
            ]}
            onEnterApp={handleClose}
            interactive={true}
            doodleCount={16}
            height="auto"
            backToTop={false}
          />
        </div>

        {/* Bottom Preferences Bar */}
        <div className="px-6 py-3.5 border-t border-line bg-chip/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted" dir="rtl">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-line text-fg accent-fg cursor-pointer"
            />
            <span>عدم نمایش خودکار در دفعات بعدی (همواره از طریق دکمه «افتتاحیه الف» در هدر قابل مشاهده است)</span>
          </label>

          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-fg text-bg hover:opacity-90 font-bold rounded-full transition-all cursor-pointer active:scale-95 text-xs shadow-xs"
          >
            <span>شروع کار با الف</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
