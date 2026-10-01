import React, { useState } from 'react';
import { Flame, Sparkles, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { UserStats } from '../services/storageService';

interface TopAppBarProps {
  stats: UserStats;
  onOpenProfile: () => void;
  onOpenQuizHub?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ stats, onOpenProfile, onOpenQuizHub }) => {
  const { user, signInWithGoogle, signInAsGuest, signOut } = useAuth();
  const [showAuthMenu, setShowAuthMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF6ED]/95 backdrop-blur-md border-b border-[#E8DFCE] safe-top transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#1E4B8A] flex items-center justify-center text-[#D4AF37] shadow-sm border border-[#D4AF37]/30">
            <span className="font-serif font-bold text-lg leading-none">瑠</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#0F2138]">Ruri</span>
              <span className="text-xs font-serif text-[#1E4B8A] font-semibold">瑠璃</span>
            </div>
            <p className="text-[11px] text-[#0F2138]/65 font-medium leading-none">
              Scholarly Micro-Learning
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak indicator with Kogane gold */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EEE0] border border-[#D4AF37]/40 text-[#8B6E0B] shadow-2xs"
            title={`${stats.streakDays} day scholarly study streak`}
          >
            <Flame className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="text-xs font-bold text-[#0F2138]">{stats.streakDays}d</span>
          </div>

          {/* XP pill */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] text-xs font-semibold text-[#1E4B8A]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{stats.xp} XP</span>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* User Account / Auth dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowAuthMenu(!showAuthMenu)}
              className="w-11 h-11 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE] hover:border-[#1E4B8A] flex items-center justify-center text-[#0F2138] transition-all touch-target-48 min-w-[48px] min-h-[48px]"
              aria-label="User profile menu"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Learner'}
                  className="w-8 h-8 rounded-xl object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-[#1E4B8A]" />
              )}
            </button>

            {/* Auth Dropdown */}
            {showAuthMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF6ED] p-3 shadow-xl border border-[#E8DFCE] animate-in fade-in zoom-in-95 duration-150 z-50 text-[#0F2138]"
                onClick={() => setShowAuthMenu(false)}
              >
                {user ? (
                  <div>
                    <div className="p-2 border-b border-[#E8DFCE] mb-2">
                      <p className="text-xs font-bold truncate text-[#0F2138]">
                        {user.displayName || 'Scholar'}
                      </p>
                      <p className="text-[11px] text-[#0F2138]/60 truncate">
                        {user.email || 'Guest Mode (Local Sync)'}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#D4AF37] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                        <span>{stats.rankTitle}</span>
                      </div>
                    </div>
                    <button
                      onClick={onOpenProfile}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#E8DFCE] transition flex items-center gap-2 min-h-[44px]"
                    >
                      <UserIcon className="w-4 h-4 text-[#1E4B8A]" />
                      <span>View Scholarly Record</span>
                    </button>
                    {onOpenQuizHub && (
                      <button
                        onClick={onOpenQuizHub}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#1E4B8A] rounded-xl hover:bg-[#E8DFCE] transition flex items-center gap-2 min-h-[44px]"
                      >
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span>Quiz Hub & Mastery</span>
                      </button>
                    )}
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 rounded-xl hover:bg-rose-50 transition flex items-center gap-2 min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-1 space-y-2">
                    <p className="text-xs font-semibold text-[#0F2138]">Scholarly Sync</p>
                    <p className="text-[11px] text-[#0F2138]/70">
                      Sign in with Google to sync streaks and flashcards across devices.
                    </p>
                    <button
                      onClick={signInWithGoogle}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] text-white text-xs font-bold transition flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      <span>Sign In with Google</span>
                    </button>
                    <button
                      onClick={signInAsGuest}
                      className="w-full py-2 px-3 rounded-xl bg-[#F4EEE0] hover:bg-[#E8DFCE] text-[#0F2138] text-xs font-semibold transition border border-[#E8DFCE] min-h-[40px]"
                    >
                      Continue as Guest
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
