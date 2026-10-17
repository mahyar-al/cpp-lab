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
    gradient: 'from-neutral-700 to-neutral-900',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'astronaut',
    label: 'کاوشگر',
    icon: Rocket,
    gradient: 'from-neutral-700 to-neutral-950',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'scholar',
    label: 'دانش‌پژوه',
    icon: GraduationCap,
    gradient: 'from-neutral-800 to-black',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'coder',
    label: 'توسعه‌دهنده',
    icon: Terminal,
    gradient: 'from-neutral-700 to-neutral-900',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'champion',
    label: 'قهرمان',
    icon: Trophy,
    gradient: 'from-neutral-800 to-neutral-950',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'ai-core',
    label: 'پژوهشگر هوش',
    icon: Cpu,
    gradient: 'from-neutral-700 to-neutral-900',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'strategist',
    label: 'استراتژیست',
    icon: Target,
    gradient: 'from-neutral-800 to-black',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
  {
    id: 'flame',
    label: 'پرانرژی',
    icon: Flame,
    gradient: 'from-neutral-700 to-neutral-950',
    borderColor: 'border-line',
    glowColor: 'shadow-xs',
    textColor: 'text-fg',
  },
];

export function getAvatarOption(id?: string): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.id === id);
  return found || AVATAR_OPTIONS[0];
}
