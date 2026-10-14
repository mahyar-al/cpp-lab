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
    label: 'سایبرپانک',
    icon: Zap,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-[0_0_12px_rgba(0,245,255,0.4)]',
    textColor: 'text-cyan-400',
  },
  {
    id: 'astronaut',
    label: 'فضانورد',
    icon: Rocket,
    gradient: 'from-purple-600 to-indigo-600',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    textColor: 'text-purple-400',
  },
  {
    id: 'scholar',
    label: 'دانش‌پژوه',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-700',
    borderColor: 'border-emerald-400',
    glowColor: 'shadow-[0_0_12px_rgba(57,255,136,0.4)]',
    textColor: 'text-emerald-400',
  },
  {
    id: 'coder',
    label: 'توسعه‌دهنده',
    icon: Terminal,
    gradient: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-400',
    glowColor: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    textColor: 'text-blue-400',
  },
  {
    id: 'champion',
    label: 'قهرمان',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]',
    textColor: 'text-amber-400',
  },
  {
    id: 'ai-core',
    label: 'هسته هوشمند',
    icon: Cpu,
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400',
    glowColor: 'shadow-[0_0_12px_rgba(255,79,216,0.4)]',
    textColor: 'text-pink-400',
  },
  {
    id: 'strategist',
    label: 'استراتژیست',
    icon: Target,
    gradient: 'from-violet-600 to-fuchsia-600',
    borderColor: 'border-violet-400',
    glowColor: 'shadow-[0_0_12px_rgba(192,132,252,0.4)]',
    textColor: 'text-violet-400',
  },
  {
    id: 'flame',
    label: 'پرانرژی',
    icon: Flame,
    gradient: 'from-rose-500 to-amber-500',
    borderColor: 'border-rose-400',
    glowColor: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    textColor: 'text-rose-400',
  },
];

export function getAvatarOption(id?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === id);
  return found || AVATAR_OPTIONS[0];
}
