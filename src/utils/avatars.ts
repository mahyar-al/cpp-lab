import React from 'react';
import {
  Zap,
  Rocket,
  GraduationCap,
  Terminal,
  Trophy,
  Sparkles,
  Target,
  Flame,
  Cpu,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface AvatarOption {
  id: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'cyber-neon',
    label: 'پیشرو',
    icon: Zap,
    gradient: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'astronaut',
    label: 'کاوشگر',
    icon: Rocket,
    gradient: 'from-slate-700 to-indigo-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'scholar',
    label: 'دانش‌پژوه',
    icon: GraduationCap,
    gradient: 'from-slate-700 to-teal-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'coder',
    label: 'توسعه‌دهنده',
    icon: Terminal,
    gradient: 'from-slate-700 to-blue-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'champion',
    label: 'قهرمان',
    icon: Trophy,
    gradient: 'from-slate-700 to-amber-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'ai-core',
    label: 'پژوهشگر هوش',
    icon: Cpu,
    gradient: 'from-slate-700 to-rose-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'strategist',
    label: 'استراتژیست',
    icon: Target,
    gradient: 'from-slate-700 to-purple-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'flame',
    label: 'پرانرژی',
    icon: Flame,
    gradient: 'from-slate-700 to-orange-900',
    borderColor: 'border-slate-300 dark:border-slate-600',
    glowColor: 'shadow-xs',
    textColor: 'text-slate-700 dark:text-slate-300',
  },
];

export function getAvatarOption(id?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === id);
  return found || AVATAR_OPTIONS[0];
}
