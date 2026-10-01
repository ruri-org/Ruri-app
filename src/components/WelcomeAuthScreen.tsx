import React, { useState } from 'react';
import { WelcomeGraphic } from './WelcomeGraphic';
import { useAuth } from '../context/AuthContext';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeAuthScreenProps {
  onSignInSuccess?: () => void;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({ onSignInSuccess }) => {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorNotice(null);
    setIsAuthenticating(true);
    try {
      await signInWithGoogle();
      if (onSignInSuccess) onSignInSuccess();
    } catch (err: unknown) {
      console.warn('Sign-in error:', err);
      setErrorNotice('Google Sign-In was cancelled or unavailable. Continuing as guest.');
      await signInAsGuest();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorNotice(null);
    setIsAuthenticating(true);
    try {
      await signInAsGuest();
      if (onSignInSuccess) onSignInSuccess();
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4EEE0] text-[#0F2138] flex items-center justify-center sm:p-4 selection:bg-[#1E4B8A]/20">
      {/* 
        M3 Viewport Shell:
        Primary Compact Class baseline: 393px width x 852px height (iPhone 16e standard).
        Scales cleanly with responsive max boundaries on desktop.
      */}
      <div className="relative w-full max-w-[393px] h-screen max-h-[852px] bg-[#F4EEE0] flex flex-col justify-between overflow-hidden sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#E8DFCE]">
        {/* Top App Status Accent */}
        <div className="safe-top w-full pt-3 px-6 flex items-center justify-between text-xs text-[#0F2138]/60 z-20">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-sm text-[#1E4B8A]">瑠璃</span>
            <span className="text-[11px] text-[#D4AF37] font-semibold tracking-wider uppercase">
              Ruri
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#1E4B8A]">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>M3 Scholarly Edition</span>
          </div>
        </div>

        {/* 
          1. TOP REGION:
          Animated illustrative graphic area occupying the top 45% of the viewport.
        */}
        <section
          aria-label="Scholarly Illustration Graphic"
          className="relative w-full h-[45%] flex items-center justify-center px-4"
        >
          <WelcomeGraphic />
        </section>

        {/* 
          2. MIDDLE REGION:
          Centered typography layout with Google Sans Flex & Plus Jakarta Sans.
        */}
        <section
          aria-label="Welcome Introduction"
          className="w-full px-6 flex flex-col items-center justify-center text-center -mt-2 z-10"
        >
          {/* Subtle Japanese Theme Accent */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF6ED] border border-[#D4AF37]/35 text-[11px] font-serif text-[#1E4B8A] mb-2 shadow-2xs">
            <span className="text-[#D4AF37] font-bold">知の探求</span>
            <span className="text-[#0F2138]/40">·</span>
            <span>Pursuit of Knowledge</span>
          </div>

          {/* Main Headline: Hero header with the title "瑠璃 (Ruri)" (#1E4B8A) */}
          <h1
            className="font-bold tracking-tight text-[#1E4B8A] leading-tight select-none"
            style={{
              fontSize: '44px',
              lineHeight: '52px',
              fontFamily: "'Google Sans Flex', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            瑠璃 (Ruri)
          </h1>

          {/* Subtitle: "Bite-sized micro-learning generated from your textbooks" */}
          <p
            className="mt-2 text-[#0F2138] leading-relaxed max-w-[320px] mx-auto select-none"
            style={{
              fontSize: '14px',
              lineHeight: '22px',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 500,
            }}
          >
            Bite-sized micro-learning generated from your textbooks
          </p>

          {/* Micro-learning pledge chip */}
          <p className="mt-3 text-[12px] text-[#0F2138]/60 font-medium font-serif italic">
            2-minute distilled wisdom & active recall quizzes.
          </p>
        </section>

        {/* 
          3. BOTTOM REGION:
          Fixed action container padded at 16px from edges and bottom safe-area insets.
        */}
        <footer className="w-full px-4 pb-6 pt-2 safe-bottom flex flex-col items-center space-y-3 z-20">
          {errorNotice && (
            <p className="text-[11px] text-[#8B6E0B] text-center px-2 animate-in fade-in">
              {errorNotice}
            </p>
          )}

          {/* 
            Google Sign-In Action:
            Prominent M3 Outlined/Tonal Button.
            - Container Color: Ruri Blue (#1E4B8A)
            - Icon: Official multi-color Google 'G' logo aligned left
            - Text: "Sign In with Google" (Label Large: Plus Jakarta Sans 14px SemiBold, #FFFFFF)
            - Target Boundary: Minimum 56px height, full-width (361px on 393px width), rounded-full shape (9999dp)
          */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating || loading}
            aria-label="Sign In with Google"
            className="group relative w-full max-w-[361px] min-h-[56px] h-14 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] active:scale-[0.98] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between px-4 sm:px-5 border border-[#1E4B8A] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Left Aligned Official Google 'G' Multi-Color Logo Container */}
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            {/* Centered Text: Label Large Plus Jakarta Sans 14px SemiBold #FFFFFF */}
            <span
              className="text-white text-center flex-1 font-semibold tracking-wide pr-3"
              style={{
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              {isAuthenticating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Connecting...</span>
                </span>
              ) : (
                'Sign in with Google'
              )}
            </span>

            {/* Right gold accent indicator */}
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Secondary Guest / Explore Action: "Explore as Guest" */}
          <div className="flex items-center justify-center gap-1.5 pt-1 w-full max-w-[361px]">
            <button
              onClick={handleGuestSignIn}
              disabled={isAuthenticating}
              aria-label="Explore as Guest"
              className="w-full text-xs sm:text-sm font-semibold text-[#0F2138]/80 hover:text-[#1E4B8A] hover:bg-[#FAF6ED] transition-all py-3 px-4 rounded-full border border-[#E8DFCE] min-h-[48px] touch-target-48 flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <span>Explore as Guest</span>
            </button>
          </div>

          {/* Privacy & Educational Terms Note */}
          <p className="text-[10px] text-[#0F2138]/50 text-center leading-tight max-w-[280px]">
            By continuing, you agree to Ruri's Scholarly Honor Code and personalized learning recommendations.
          </p>
        </footer>
      </div>
    </div>
  );
};
