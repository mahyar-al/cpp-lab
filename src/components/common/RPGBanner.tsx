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
  const { rpg, toggleRPG } = useApp();

  if (!rpg || !rpg.enabled) return null;

  const level = rpg.level || 1;
  const xp = rpg.xp || 0;
  const currentBaseXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const spanXp = Math.max(1, nextLevelXp - currentBaseXp);
  const progressInLevel = Math.min(100, Math.max(0, Math.round(((xp - currentBaseXp) / spanXp) * 100)));

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>سطح {toPersianDigits(level)}</span>
        </div>
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressInLevel}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {toPersianDigits(progressInLevel)}%
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950 border border-amber-500/25 p-4 sm:p-5 shadow-xl shadow-amber-500/5">
      {/* Background glow orb */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Level and Title Section */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 flex flex-col items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] font-bold text-amber-300 mt-0.5">
                سطح {toPersianDigits(level)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400/90 font-medium">لقب:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                {rpg.title || 'نوآموز مسیر'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <span>{toPersianDigits(xp)} XP کل</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                {toPersianDigits(Math.max(0, nextLevelXp - xp))} XP تا سطح بعدی
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full sm:w-64 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-800 mt-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400 transition-all duration-700 shadow-sm"
                style={{ width: `${progressInLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Quests Mini-Track */}
        <div className="flex-1 md:max-w-md bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              مأموریت‌های روزانه
            </span>
            <span className="text-[11px] text-slate-500">
              +{toPersianDigits((rpg.dailyQuests || []).reduce((acc, q) => acc + q.xpReward, 0))} XP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(rpg.dailyQuests || []).slice(0, 3).map((quest) => (
              <div
                key={quest.id}
                className="p-2 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                    {quest.title}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono shrink-0">
                    +{toPersianDigits(quest.xpReward)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{quest.completed ? 'تکمیل شد' : 'در جریان'}</span>
                  <span className={quest.completed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
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
