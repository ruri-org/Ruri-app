import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  Brain,
  Bell,
  Check,
  ArrowRight,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface ConsentScreenProps {
  onConsentCompleted: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onConsentCompleted }) => {
  const { user, completeConsent, signOut } = useAuth();
  const [studyFocus, setStudyFocus] = useState('All Academic Inquiries');
  const [enableDailyReminder, setEnableDailyReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const focusOptions = [
    'All Academic Inquiries',
    'Science & Physics',
    'Architecture & Design',
    'Cognitive Science',
    'History & Philosophy',
  ];

  const handleAgreeAndProceed = async () => {
    setIsSubmitting(true);
    try {
      await completeConsent({
        studyGoal: studyFocus,
        dailyReminder: enableDailyReminder,
      });
      onConsentCompleted();
    } catch (e) {
      console.error('Consent error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4EEE0] text-[#0F2138] flex items-center justify-center sm:p-4 selection:bg-[#1E4B8A]/20">
      <div className="relative w-full max-w-[393px] h-screen max-h-[852px] bg-[#F4EEE0] flex flex-col justify-between overflow-y-auto sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#E8DFCE]">
        {/* Top Header */}
        <div className="safe-top px-6 pt-4 pb-2 flex items-center justify-between border-b border-[#E8DFCE]/80">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base text-[#1E4B8A]">瑠璃</span>
            <span className="text-xs font-bold text-[#0F2138]">Permissions & Onboarding</span>
          </div>

          <button
            onClick={signOut}
            title="Sign in with different account"
            className="text-xs text-[#0F2138]/60 hover:text-rose-700 flex items-center gap-1 py-1 px-2 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="px-6 py-4 space-y-5 flex-1 overflow-y-auto">
          {/* User Profile Card from Google OAuth */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] flex items-center gap-3.5 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#1E4B8A] border-2 border-[#D4AF37] flex items-center justify-center text-white font-serif font-bold text-lg overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                '瑠'
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#0F2138] truncate">
                  {user?.displayName || 'New Scholar'}
                </h3>
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-[#0F2138]/60 truncate">
                {user?.email || 'Authenticated via Google'}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                New Disciple (門下生)
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl font-bold text-[#1E4B8A] leading-tight">
              Personalize Your Study Feed
            </h2>
            <p className="text-xs text-[#0F2138]/75 mt-1 leading-relaxed">
              To tailor your 2-minute micro-lessons and active recall challenges, Ruri requests the following permissions.
            </p>
          </div>

          {/* Permission Items */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1E4B8A]/10 text-[#1E4B8A] flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F2138]">AI Personalization Engine</h4>
                <p className="text-[11px] text-[#0F2138]/70 mt-0.5 leading-relaxed">
                  Allows Gemini 1.5 Flash to synthesize micro-lessons matching your intellectual interests and knowledge gaps.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 text-[#8B6E0B] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0F2138]">Spaced Repetition & Streaks</h4>
                <p className="text-[11px] text-[#0F2138]/70 mt-0.5 leading-relaxed">
                  Stores your quiz retries, card masteries, and daily streak records securely in your scholarly profile.
                </p>
              </div>
            </div>

            {/* Daily Reminder Toggle */}
            <div
              onClick={() => setEnableDailyReminder(!enableDailyReminder)}
              className="p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] flex items-center justify-between cursor-pointer hover:bg-[#E8DFCE]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1E4B8A]/10 text-[#1E4B8A] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F2138]">Daily Scholarly Pearl</h4>
                  <p className="text-[11px] text-[#0F2138]/70">1 daily micro-lesson reminder</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  enableDailyReminder ? 'bg-[#1E4B8A] text-white' : 'bg-[#E8DFCE] text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Primary Scholarly Interest Selection */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-[#0F2138] uppercase tracking-wider">
              Primary Learning Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {focusOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStudyFocus(opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                    studyFocus === opt
                      ? 'bg-[#1E4B8A] text-white shadow-2xs'
                      : 'bg-[#FAF6ED] text-[#0F2138]/70 border border-[#E8DFCE] hover:bg-[#E8DFCE]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA container */}
        <div className="px-6 py-4 safe-bottom border-t border-[#E8DFCE] bg-[#FAF6ED]/80 backdrop-blur-xs flex flex-col items-center space-y-2">
          <button
            onClick={handleAgreeAndProceed}
            disabled={isSubmitting}
            className="w-full max-w-[361px] min-h-[56px] h-14 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] active:scale-[0.98] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 touch-target-48 disabled:opacity-70"
          >
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <span>{isSubmitting ? 'Finalizing Profile...' : 'Consent & Enter Home Feed'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <p className="text-[10px] text-[#0F2138]/50 text-center">
            You can modify learning preferences anytime in your Scholarly Record.
          </p>
        </div>
      </div>
    </div>
  );
};
