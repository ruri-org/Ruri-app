import React from 'react';
import { Award, Flame, Sparkles, BookOpen, CheckCircle, ShieldCheck, LogIn, LogOut, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserStats } from '../services/storageService';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileViewProps {
  stats: UserStats;
  onEditCurriculum?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ stats, onEditCurriculum }) => {
  const { user, signInWithGoogle, signInAsGuest, signOut } = useAuth();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Retrieve student profile if configured
  const studentProfile = (() => {
    try {
      const raw = localStorage.getItem('ruri_student_profile');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  })();

  const achievements = [
    {
      title: '一歩の道 (First Step)',
      desc: 'Completed your first micro-lesson and quiz',
      achieved: stats.completedLessons.length >= 1,
    },
    {
      title: '三日坊主の打破 (3-Day Resolve)',
      desc: 'Maintained a 3-day continuous scholarly study streak',
      achieved: stats.streakDays >= 3,
    },
    {
      title: '鏡の眼 (Optical Inquirer)',
      desc: 'Tested understanding using Gemini optical scanning',
      achieved: true,
    },
    {
      title: '百問鍛錬 (Centurion Thinker)',
      desc: 'Answered over 10 quiz questions with high accuracy',
      achieved: stats.totalCorrectAnswers >= 10,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-[#FAF6ED] p-6 sm:p-7 border border-[#E8DFCE] shadow-sm relative overflow-hidden">
        {/* Subtle decorative gold badge accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#D4AF37]/15 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-18 h-18 rounded-3xl bg-[#1E4B8A] border-2 border-[#D4AF37] flex items-center justify-center text-[#FAF6ED] text-2xl font-serif font-bold shadow-md shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover rounded-3xl"
              />
            ) : (
              '瑠'
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2138]">
                {user?.displayName || 'Scholarly Seeker'}
              </h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#8B6E0B] text-xs font-bold self-center sm:self-auto">
                {stats.rankTitle}
              </span>
            </div>
            <p className="text-xs text-[#0F2138]/60">
              {user?.email ? user.email : 'Guest Mode · Synchronized to Local Storage'}
            </p>
          </div>

          <div className="mt-2 sm:mt-0">
            {user && !user.isAnonymous ? (
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-all min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] text-white text-xs font-bold shadow transition-all min-h-[48px]"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Link Google Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Track & Verified Textbooks Summary Card */}
      <div className="rounded-3xl bg-[#FAF6ED] p-5 sm:p-6 border border-[#E8DFCE] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-base text-[#1E4B8A]">学課</span>
            <h3 className="text-sm font-bold text-[#0F2138]">Curriculum & Study Materials</h3>
          </div>
          {onEditCurriculum && (
            <button
              onClick={onEditCurriculum}
              className="text-xs font-semibold text-[#1E4B8A] hover:underline"
            >
              Update Curriculum
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] font-bold text-[#1E4B8A]">
            {studentProfile?.grade || 'Grade 11'}
          </span>
          {(studentProfile?.programs || ['SAT', 'AP']).map((p: string) => (
            <span
              key={p}
              className="px-3 py-1 rounded-xl bg-[#1E4B8A] text-white font-semibold shadow-2xs"
            >
              {p}
            </span>
          ))}
          {studentProfile?.username && (
            <span className="px-3 py-1 rounded-xl bg-[#FAF6ED] border border-[#D4AF37]/50 font-bold text-[#8B6E0B]">
              {studentProfile.username}
            </span>
          )}
        </div>

        {studentProfile?.textbooks && studentProfile.textbooks.length > 0 && (
          <div className="pt-2 border-t border-[#E8DFCE]/80">
            <p className="text-[11px] font-semibold text-[#0F2138]/60 mb-1.5">
              Verified Textbooks ({studentProfile.textbooks.length}):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {studentProfile.textbooks.map((tb: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4EEE0] text-[11px] font-medium text-[#0F2138] border border-[#E8DFCE]"
                >
                  <BookOpen className="w-3 h-3 text-[#1E4B8A]" />
                  <span className="truncate max-w-[180px]">{tb}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE]">
          <div className="flex items-center gap-1 text-xs text-[#0F2138]/60 font-semibold mb-1">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <span>Streak</span>
          </div>
          <p className="text-2xl font-bold text-[#0F2138]">{stats.streakDays} Days</p>
          <p className="text-[11px] text-[#8B6E0B] font-medium mt-0.5">Consecutive daily study</p>
        </div>

        <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE]">
          <div className="flex items-center gap-1 text-xs text-[#0F2138]/60 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Total XP</span>
          </div>
          <p className="text-2xl font-bold text-[#1E4B8A]">{stats.xp} XP</p>
          <p className="text-[11px] text-[#0F2138]/60 font-medium mt-0.5">Scholarly experience</p>
        </div>

        <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE]">
          <div className="flex items-center gap-1 text-xs text-[#0F2138]/60 font-semibold mb-1">
            <Award className="w-4 h-4 text-[#1E4B8A]" />
            <span>Quizzes</span>
          </div>
          <p className="text-2xl font-bold text-[#0F2138]">{stats.quizzesTaken}</p>
          <p className="text-[11px] text-[#0F2138]/60 font-medium mt-0.5">
            {stats.totalCorrectAnswers} Correct answers
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE]">
          <div className="flex items-center gap-1 text-xs text-[#0F2138]/60 font-semibold mb-1">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Completed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-800">
            {stats.completedLessons.length}
          </p>
          <p className="text-[11px] text-[#0F2138]/60 font-medium mt-0.5">Micro-lessons finished</p>
        </div>
      </div>

      {/* Scholarly Achievements */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#0F2138] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1E4B8A]" />
          Scholarly Milestones (学問の道標)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                item.achieved
                  ? 'bg-[#FAF6ED] border-[#D4AF37]/50 shadow-2xs'
                  : 'bg-[#F4EEE0]/60 border-[#E8DFCE] opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.achieved
                    ? 'bg-[#D4AF37]/20 text-[#8B6E0B]'
                    : 'bg-[#E8DFCE] text-[#0F2138]/40'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F2138]">{item.title}</h4>
                  {item.achieved && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[#0F2138]/70 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PWA Installation Card if installable */}
      {isInstallable && !isInstalled && (
        <div className="rounded-3xl bg-linear-to-r from-[#1E4B8A] to-[#0F2138] p-5 sm:p-6 text-white shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4AF37]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Install Ruri PWA on Device</h3>
              <p className="text-xs text-white/80">
                Unlock instant offline access, fullscreen layout, and micro-learning anytime.
              </p>
            </div>
          </div>
          <button
            onClick={install}
            className="w-full py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2e] text-[#0F2138] font-bold text-xs shadow transition-all min-h-[48px] touch-target-48"
          >
            Install App to Home Screen
          </button>
        </div>
      )}
    </div>
  );
};
