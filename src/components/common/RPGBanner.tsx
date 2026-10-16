import React from 'react';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/jalali';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  ChevronRight,
  ShieldAlert,
  Award,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const RPGBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { rpg } = useApp();

  if (!rpg || !rpg.enabled) return null;

  const level = rpg.level || 1;
  const xp = rpg.xp || 0;
  const currentBaseXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const spanXp = Math.max(1, nextLevelXp - currentBaseXp);
  const progressInLevel = Math.min(100, Math.max(0, Math.round(((xp - currentBaseXp) / spanXp) * 100)));

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          سطح {toPersianDigits(level)}
        </span>
        <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
            style={{ width: `${progressInLevel}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
          {toPersianDigits(progressInLevel)}٪
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-[#0D0D0D] border border-slate-200/90 dark:border-[#242424] p-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Level and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                سطح {toPersianDigits(level)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {rpg.title || 'نوآموز مسیر'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="font-mono tabular-nums">{toPersianDigits(xp)} XP کل</span>
              <span>·</span>
              <span className="font-mono tabular-nums">
                {toPersianDigits(Math.max(0, nextLevelXp - xp))} XP تا سطح بعدی
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-60 h-1.5 bg-slate-100 dark:bg-[#1C1C1C] rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
                style={{ width: `${progressInLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Quests */}
        <div className="flex-1 md:max-w-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>مأموریت‌های روزانه</span>
            <span className="text-[11px] font-mono tabular-nums text-slate-500">
              +{toPersianDigits((rpg.dailyQuests || []).reduce((acc, q) => acc + q.xpReward, 0))} XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(rpg.dailyQuests || []).slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                className="p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
              >
                <div className="text-slate-800 dark:text-slate-200 truncate font-medium">
                  {quest.title}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{quest.completed ? 'تکمیل شده' : 'در جریان'}</span>
                  <span className={quest.completed ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                    {quest.completed ? '✓' : `${toPersianDigits(quest.currentValue)}/${toPersianDigits(quest.targetValue)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
