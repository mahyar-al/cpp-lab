import React from 'react';
import { X } from 'lucide-react';
import { AuthPage, AuthMode } from '../auth/AuthPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'recovery' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  if (!isOpen) return null;

  const mappedMode: AuthMode =
    initialTab === 'recovery' || initialTab === 'forgot_password'
      ? 'forgot_password'
      : (initialTab as AuthMode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl my-auto animate-in zoom-in-95 duration-200">
        {/* Close Button at top-left/right */}
        <button
          onClick={onClose}
          className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 z-50 p-2 text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full shadow-2xl transition-all cursor-pointer ring-2 ring-cyan-500/20"
          title="بستن و ادامه به عنوان مهمان"
        >
          <X className="w-5 h-5" />
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
