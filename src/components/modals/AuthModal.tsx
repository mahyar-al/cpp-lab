import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AuthPage, AuthMode } from '../auth/AuthPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'recovery' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mappedMode: AuthMode =
    initialTab === 'recovery' || initialTab === 'forgot_password'
      ? 'forgot_password'
      : (initialTab as AuthMode);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="پنجره احراز هویت و ورود"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/45 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button floating comfortably */}
        <button
          onClick={onClose}
          className="absolute -top-3 -left-3 sm:-top-3.5 sm:-left-3.5 z-50 p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-white/85 dark:bg-[#141418]/85 backdrop-blur-xl hover:bg-white dark:hover:bg-[#1c1c22] border border-stone-200/90 dark:border-white/15 rounded-full shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-400 active:scale-95"
          title="بستن و بازگشت (Esc)"
          aria-label="بستن پنجره"
        >
          <X className="w-4 h-4" />
        </button>

        <AuthPage
          initialMode={mappedMode}
          onSuccess={onClose}
          onCancel={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
