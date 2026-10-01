import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Bookmark,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { MicroLessonClip, generatePersonalizedFeed } from '../services/videoFeedService';
import { QuizQuestion } from '../services/geminiService';
import { recordQuizResult } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface VerticalVideoFeedProps {
  onClose?: () => void;
  onOpenScanner?: () => void;
  isHomeScreen?: boolean;
}

export const VerticalVideoFeed: React.FC<VerticalVideoFeedProps> = ({
  onClose,
  onOpenScanner,
  isHomeScreen = false,
}) => {
  const { user } = useAuth();
  const [clips, setClips] = useState<MicroLessonClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedClips, setLikedClips] = useState<{ [id: string]: boolean }>({});
  const [bookmarkedClips, setBookmarkedClips] = useState<{ [id: string]: boolean }>({});
  const [progressPercent, setProgressPercent] = useState(0);

  // M3 Bottom Sheet for AI Summary
  const [showSummarySheet, setShowSummarySheet] = useState(false);

  // Interstitial Quiz Tracking
  const [clipsWatchedCount, setClipsWatchedCount] = useState(0);
  const [viewedClipIds, setViewedClipIds] = useState<Set<string>>(new Set());
  const [activeInterstitialQuiz, setActiveInterstitialQuiz] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizScoreRecorded, setQuizScoreRecorded] = useState(false);

  // Initialize personalized feed
  useEffect(() => {
    const feed = generatePersonalizedFeed();
    setClips(feed);
  }, []);

  const currentClip = clips[currentIndex];

  // Track clips watched for 10-clip interstitial quiz trigger
  useEffect(() => {
    if (!currentClip) return;
    if (!viewedClipIds.has(currentClip.id)) {
      const updatedSet = new Set(viewedClipIds).add(currentClip.id);
      setViewedClipIds(updatedSet);
      const newCount = clipsWatchedCount + 1;
      setClipsWatchedCount(newCount);

      // Trigger Interstitial Quiz every 10 clips!
      if (newCount % 10 === 0 && newCount > 0) {
        setIsPlaying(false);
        setActiveInterstitialQuiz(currentClip.diagnosticQuestion);
        setSelectedOption(null);
        setIsQuizAnswered(false);
        setQuizScoreRecorded(false);
      }
    }
  }, [currentIndex, currentClip]);

  // Simulated segment playback progress timer (30-90 seconds)
  useEffect(() => {
    if (!isPlaying || activeInterstitialQuiz) return;
    const duration = (currentClip?.durationSeconds || 45) * 10;
    setProgressPercent(0);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          // Auto advance to next clip
          handleNextClip();
          return 0;
        }
        return prev + 1;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, activeInterstitialQuiz, currentClip]);

  const handleNextClip = () => {
    if (activeInterstitialQuiz) return;
    setShowSummarySheet(false);
    if (currentIndex < clips.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back or refresh feed
      setCurrentIndex(0);
    }
  };

  const handlePrevClip = () => {
    if (activeInterstitialQuiz) return;
    setShowSummarySheet(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Touch gesture handling for smooth vertical swiping (Reels format)
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped UP -> Next Clip
        handleNextClip();
      } else {
        // Swiped DOWN -> Prev Clip
        handlePrevClip();
      }
    }
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNextClip();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrevClip();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, clips.length, activeInterstitialQuiz]);

  const toggleLike = () => {
    if (!currentClip) return;
    setLikedClips((prev) => ({ ...prev, [currentClip.id]: !prev[currentClip.id] }));
  };

  const toggleBookmark = () => {
    if (!currentClip) return;
    setBookmarkedClips((prev) => ({
      ...prev,
      [currentClip.id]: !prev[currentClip.id],
    }));
  };

  // Handle interstitial quiz answer
  const handleSelectQuizOption = async (optionIdx: number) => {
    if (isQuizAnswered || !activeInterstitialQuiz) return;
    setSelectedOption(optionIdx);
    setIsQuizAnswered(true);

    const isCorrect = optionIdx === activeInterstitialQuiz.correctIndex;
    if (!quizScoreRecorded) {
      setQuizScoreRecorded(true);
      const userId = user?.uid || 'guest';
      await recordQuizResult(userId, isCorrect ? 1 : 0, 1);
    }

    // Auto-resume feed after 1.8 seconds feedback
    setTimeout(() => {
      setActiveInterstitialQuiz(null);
      setIsPlaying(true);
      handleNextClip();
    }, 1800);
  };

  if (!currentClip) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F2138] flex items-center justify-center text-[#F4EEE0]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1E4B8A] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-xl font-serif font-bold mx-auto">
            瑠
          </div>
          <p className="text-sm font-semibold">Generating Your Scholarly Video Feed...</p>
        </div>
      </div>
    );
  }

  const isLiked = likedClips[currentClip.id] || false;
  const isBookmarked = bookmarkedClips[currentClip.id] || false;
  const likesDisplay = currentClip.likesCount + (isLiked ? 1 : 0);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 ${
        isHomeScreen ? 'z-10 pb-20' : 'z-50'
      } bg-[#0F2138] flex items-center justify-center select-none overflow-hidden`}
    >
      {/* 
        M3 VIEWPORT CANVAS:
        Fullscreen 393x852px edge-to-edge media player with overlay UI controls.
        Background fallback: Deep Lapis Ink (#0F2138).
      */}
      <div className="relative w-full max-w-[393px] h-full max-h-[852px] bg-[#0F2138] flex flex-col justify-between overflow-hidden sm:rounded-[36px] sm:border sm:border-[#1E4B8A]/40 shadow-2xl">
        {/* VIDEO MEDIA LAYER */}
        <div
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 w-full h-full bg-[#0F2138] cursor-pointer"
        >
          {/* YouTube Embed Player (Vertical Reels configuration) */}
          <iframe
            key={currentClip.id}
            src={`https://www.youtube-nocookie.com/embed/${currentClip.sourceVideoId}?autoplay=1&mute=${
              isMuted ? '1' : '0'
            }&controls=0&modestbranding=1&loop=1&playsinline=1&start=${currentClip.startSeconds}&end=${
              currentClip.endSeconds
            }&enablejsapi=1`}
            title={currentClip.title}
            className="w-full h-full object-cover pointer-events-none scale-135"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />

          {/* Vignette Gradients for High-Contrast Text Legibility */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />

          {/* Pause overlay icon */}
          {!isPlaying && !activeInterstitialQuiz && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 animate-in zoom-in-95">
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* TOP STATUS BAR OVERLAY */}
        <header className="relative z-20 safe-top w-full px-4 pt-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#D4AF37]">瑠璃</span>
            <span className="text-[11px] font-semibold text-white/80">Scholarly Shorts</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E4B8A]/80 border border-[#D4AF37]/40 text-[#D4AF37] font-bold">
              Clip {currentIndex + 1}/{clips.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors touch-target-48 min-w-[48px] min-h-[48px]"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/80" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
              )}
            </button>

            {/* Close / Return Button */}
            {!isHomeScreen && onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors touch-target-48 min-w-[48px] min-h-[48px]"
                aria-label="Close feed"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* RIGHT SIDE UTILITY COLUMN (Vertical Stack, 48x48px tap targets) */}
        <aside
          aria-label="Video Interactions"
          className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5"
        >
          {/* 1. Like / Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
            className="group flex flex-col items-center gap-1 touch-target-48 min-w-[48px] min-h-[48px] justify-center"
            aria-label="Like micro-lesson"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isLiked
                  ? 'bg-rose-600 text-white shadow-lg scale-110'
                  : 'bg-black/45 text-white border border-white/25 hover:bg-black/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">
              {likesDisplay}
            </span>
          </button>

          {/* 2. Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark();
            }}
            className="group flex flex-col items-center gap-1 touch-target-48 min-w-[48px] min-h-[48px] justify-center"
            aria-label="Bookmark micro-lesson"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isBookmarked
                  ? 'bg-[#D4AF37] text-[#0F2138] shadow-lg scale-110'
                  : 'bg-black/45 text-white border border-white/25 hover:bg-black/60'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-[#0F2138]' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-white drop-shadow-md">Save</span>
          </button>

          {/* 3. AI Summary Icon (Triggers M3 Bottom Sheet in Gofun #F4EEE0) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSummarySheet(true);
            }}
            className="group flex flex-col items-center gap-1 touch-target-48 min-w-[48px] min-h-[48px] justify-center"
            aria-label="View AI Summary"
          >
            <div className="w-11 h-11 rounded-full bg-[#1E4B8A]/90 text-[#D4AF37] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#D4AF37] drop-shadow-md">
              AI Notes
            </span>
          </button>

          {/* 4. Clip Navigation Helpers (Swipe or click) */}
          <div className="flex flex-col gap-1 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevClip();
              }}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded-full bg-black/40 text-white/80 disabled:opacity-20 flex items-center justify-center border border-white/20 touch-target-48 min-w-[48px] min-h-[48px]"
              aria-label="Previous clip"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextClip();
              }}
              className="w-8 h-8 rounded-full bg-black/40 text-white/80 flex items-center justify-center border border-white/20 touch-target-48 min-w-[48px] min-h-[48px]"
              aria-label="Next clip"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* BOTTOM VIDEO DETAILS AREA */}
        <footer className="relative z-20 w-full px-4 pb-4 pt-10 flex flex-col space-y-2 pointer-events-auto">
          {/* Subject Tag Chip with Kogane Gold (#D4AF37) accent text */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-[#D4AF37]/50 text-xs font-bold text-[#D4AF37] shadow-sm">
              <span>{currentClip.subjectTag}</span>
            </span>
            <span className="text-[11px] text-white/70 font-semibold font-serif">
              Part {currentClip.clipPart}/{currentClip.totalParts}
            </span>
          </div>

          {/* Video Title */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-md line-clamp-2">
            {currentClip.title}
          </h2>

          {/* Creator Avatar + Channel Name */}
          <div className="flex items-center gap-2">
            <img
              src={currentClip.channelAvatar}
              alt={currentClip.channelName}
              className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/50"
            />
            <span className="text-xs font-semibold text-white/90 drop-shadow-sm">
              {currentClip.channelName}
            </span>
          </div>

          {/* Book Context Tag: "Sourced from: [Book Title] - Chapter 3" */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border-l-2 border-[#D4AF37] text-[11px] text-[#FAF6ED] font-medium max-w-full">
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{currentClip.bookContext}</span>
          </div>

          {/* 
            PROGRESS BAR:
            Segmented Progress Bar in Kogane Gold (#D4AF37) at the absolute bottom edge.
          */}
          <div className="w-full pt-2">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </footer>

        {/* 
          AI SUMMARY M3 BOTTOM SHEET:
          Modal bottom sheet in Gofun (#F4EEE0) with key lesson bullet points.
        */}
        {showSummarySheet && (
          <div
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end animate-in fade-in duration-200"
            onClick={() => setShowSummarySheet(false)}
          >
            <div
              className="w-full max-h-[70%] rounded-t-3xl bg-[#F4EEE0] p-5 border-t-2 border-[#D4AF37] shadow-2xl flex flex-col text-[#0F2138] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bottom Sheet Handlebar & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1E4B8A] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    要
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2138]">AI Concept Breakdown</h3>
                    <p className="text-[11px] text-[#0F2138]/60 truncate max-w-[220px]">
                      {currentClip.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSummarySheet(false)}
                  className="w-9 h-9 rounded-full bg-[#FAF6ED] border border-[#E8DFCE] hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/70 touch-target-48 min-w-[40px] min-h-[40px]"
                  aria-label="Close summary sheet"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bullet Points */}
              <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E4B8A]">
                  Key Exam Takeaways (30s Review)
                </span>

                <div className="space-y-2.5">
                  {currentClip.summaryBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#1E4B8A] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-[#0F2138]/85 leading-relaxed">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Book Linkage */}
                <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#D4AF37]/50 text-xs text-[#0F2138]">
                  <span className="font-semibold text-[#8B6E0B] block">Curriculum Alignment:</span>
                  <p className="text-[11px] text-[#0F2138]/70 mt-0.5">{currentClip.bookContext}</p>
                </div>
              </div>

              {/* Close Action */}
              <div className="pt-2 border-t border-[#E8DFCE]">
                <button
                  onClick={() => setShowSummarySheet(false)}
                  className="w-full py-3 rounded-xl bg-[#1E4B8A] text-white font-bold text-xs shadow min-h-[48px] touch-target-48"
                >
                  Resume Video Clip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 
          INTERSTITIAL QUIZ OVERLAY (EVERY 10 CLIPS):
          Trigger: After every 10 video clips scrolled, pause feed and lock screen with an M3 Surface Card Overlay:
          - Modal Card: Surface Container Low (#FAF6ED) with a Ruri Blue (#1E4B8A) top accent border.
          - Card Header: "Quick Concept Check! (1 Question)" (Title Medium: 16px SemiBold).
          - Body: Single multiple-choice diagnostic question generated by Gemini Flash based on the last 10 clips watched.
          - Option Buttons: 4 full-width M3 Outlined Buttons (Background: Gofun #F4EEE0, Border: #1E4B8A).
          - Feedback: Instant color shift (Kogane Gold #D4AF37 / Green for correct, Red for incorrect).
          - Auto-Resume: Automatically logs score to Firestore and unlocks the next 10 video clips upon answer selection.
        */}
        {activeInterstitialQuiz && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-[361px] rounded-3xl bg-[#FAF6ED] border-t-4 border-t-[#1E4B8A] border-x border-b border-[#E8DFCE] p-5 shadow-2xl flex flex-col text-[#0F2138] space-y-4">
              {/* Card Header: Title Medium 16px SemiBold */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFCE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1E4B8A] text-[#D4AF37] flex items-center justify-center font-bold text-sm">
                    問
                  </div>
                  <div>
                    <h3
                      className="text-[#0F2138] font-semibold"
                      style={{
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Quick Concept Check! (1 Question)
                    </h3>
                    <p className="text-[11px] text-[#8B6E0B] font-medium">
                      Checkpoint after 10 micro-lessons watched
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#1E4B8A] bg-[#1E4B8A]/10 px-2 py-0.5 rounded-full">
                  +25 XP
                </span>
              </div>

              {/* Question Body */}
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-[#0F2138] leading-snug">
                  {activeInterstitialQuiz.question}
                </p>
              </div>

              {/* 4 Full-Width M3 Outlined Buttons */}
              <div className="space-y-2">
                {activeInterstitialQuiz.options.map((opt, idx) => {
                  let btnStyle =
                    'bg-[#F4EEE0] border-[#1E4B8A] text-[#0F2138] hover:bg-[#E8DFCE]';

                  if (isQuizAnswered) {
                    if (idx === activeInterstitialQuiz.correctIndex) {
                      // Correct: Kogane Gold / Green shift
                      btnStyle =
                        'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs';
                    } else if (idx === selectedOption) {
                      // Incorrect: Red shift
                      btnStyle =
                        'bg-rose-50 border-rose-500 text-rose-950 font-semibold';
                    } else {
                      btnStyle = 'bg-[#F4EEE0]/40 border-[#E8DFCE] text-[#0F2138]/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isQuizAnswered}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 min-h-[48px] touch-target-48 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[#FAF6ED] border border-current text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-snug">{opt}</span>
                      {isQuizAnswered && idx === activeInterstitialQuiz.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isQuizAnswered &&
                        idx === selectedOption &&
                        idx !== activeInterstitialQuiz.correctIndex && (
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Reveal */}
              {isQuizAnswered && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border animate-in fade-in duration-200 ${
                    selectedOption === activeInterstitialQuiz.correctIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="font-bold">
                    {selectedOption === activeInterstitialQuiz.correctIndex
                      ? '✓ Mastery Confirmed! (+25 XP)'
                      : 'Review Note:'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight">
                    {activeInterstitialQuiz.explanation}
                  </p>
                  <p className="text-[10px] text-[#1E4B8A] font-semibold mt-1">
                    Auto-resuming next 10 video clips...
                  </p>
                </div>
              )}

              {/* Progress counter */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-[#0F2138]/60">
                <span>Streak Secured</span>
                <span className="font-semibold text-[#8B6E0B]">Diagnostic Assessment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
