import React from 'react';
import { useTheme } from './ThemeProvider';
import { SunMoonThemeToggle } from '../../components/ui/sun-moon-theme-toggle';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 36 }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <SunMoonThemeToggle
      theme={theme}
      onThemeChange={() => toggleTheme()}
      syncDocument={false}
      size={size}
      duration={1200}
      className={`border-line/70 hover:border-fg/30 transition-all shadow-xs active:scale-95 ${className}`}
      aria-label={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      title={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
    />
  );
};

export default ThemeToggle;

