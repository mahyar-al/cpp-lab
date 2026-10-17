import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-full border border-line bg-surface text-fg hover:text-muted hover:border-fg/40 px-2.5 sm:px-3 py-1 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors select-none ${className}`}
      aria-label={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
      title={isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-fg shrink-0" />
          <span className="text-[11px] font-medium leading-none">روشن</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-fg shrink-0" />
          <span className="text-[11px] font-medium leading-none">تیره</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
