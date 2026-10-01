import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';
import { StudentOnboardingForm } from './components/StudentOnboardingForm';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { LessonCard } from './components/LessonCard';
import { LessonModal } from './components/LessonModal';
import { QuizModal } from './components/QuizModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ScannerView } from './components/ScannerView';
import { VideosView } from './components/VideosView';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ProfileView } from './components/ProfileView';
import { VerticalVideoFeed } from './components/VerticalVideoFeed';
import { QuizHubScreen } from './components/QuizHubScreen';
import { SocialMessagingScreen } from './components/SocialMessagingScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  MicroLesson,
  QuizQuestion,
  getCuratedLessons,
} from './services/geminiService';
import { EducationalVideo, getCuratedVideos } from './services/youtubeService';
import {
  UserStats,
  getLocalStats,
  fetchUserStats,
  recordLessonComplete,
  recordQuizResult,
} from './services/storageService';
import { Search, Sparkles, Compass, Loader2, X, PlaySquare } from 'lucide-react';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [stats, setStats] = useState<UserStats>(getLocalStats());
  const [lessons, setLessons] = useState<MicroLesson[]>(getCuratedLessons());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isEditingCurriculum, setIsEditingCurriculum] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Modals state
  const [activeLessonModal, setActiveLessonModal] = useState<MicroLesson | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{
    title: string;
    quiz: QuizQuestion[];
    id?: string;
  } | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<EducationalVideo | null>(null);

  // Sync stats when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchUserStats(user.uid).then(setStats);
    }
  }, [user]);

  const handleOpenLesson = (lesson: MicroLesson) => {
    setActiveLessonModal(lesson);
  };

  const handleStartQuiz = (
    lesson: MicroLesson | { title: string; quiz: QuizQuestion[]; id?: string }
  ) => {
    setActiveQuiz(lesson);
  };

  const handleQuizComplete = async (correctCount: number, total: number, lessonId?: string) => {
    const userId = user?.uid || 'guest';
    let updated = await recordQuizResult(userId, correctCount, total);

    if (lessonId && correctCount >= 2) {
      updated = await recordLessonComplete(userId, lessonId, 50);
    }
    setStats(updated);
  };

  const handleMasterFlashcard = async (term: string) => {
    const current = stats;
    const mastered = Array.from(new Set([...current.masteredFlashcards, term]));
    const updated: UserStats = {
      ...current,
      masteredFlashcards: mastered,
      xp: current.xp + 15,
    };
    setStats(updated);
  };

  const handleAddGeneratedLesson = (newLesson: MicroLesson) => {
    setLessons((prev) => [newLesson, ...prev]);
    setActiveLessonModal(newLesson);
    setActiveTab('home');
  };

  const handleStartCustomQuiz = (quizData: { title: string; quiz: QuizQuestion[] }) => {
    setActiveQuiz(quizData);
  };

  const handleOpenVideoSearch = () => {
    setActiveTab('home');
  };

  // Filter lessons
  const subjects = ['All', 'Architecture', 'Physics', 'Cognitive Science', 'History'];
  const filteredLessons = lessons.filter((l) => {
    const matchesSubject = selectedSubject === 'All' || l.subject.includes(selectedSubject);
    const matchesQuery =
      searchQuery.trim() === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  const dailyFocusLesson = lessons[0];

  return (
    <div className="min-h-screen bg-[#F4EEE0] text-[#0F2138] flex flex-col font-sans">
      {/* Top App Bar */}
      <TopAppBar
        stats={stats}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenQuizHub={() => setActiveTab('quizzes')}
      />

      {/* Main Content Container */}
      <main className="flex-1 w-full pb-20">
        {/* DESTINATION 1: "Home" -> TikTok Video Feed */}
        {activeTab === 'home' && (
          <div className="w-full h-full animate-in fade-in duration-200">
            <VerticalVideoFeed
              isHomeScreen={true}
              onOpenScanner={() => setActiveLessonModal(lessons[0])}
            />
          </div>
        )}

        {/* DESTINATION 2: "Quizzes" -> Quiz Hub */}
        {activeTab === 'quizzes' && (
          <div className="animate-in fade-in duration-200 py-2">
            <QuizHubScreen
              stats={stats}
              onFilterRelatedTopic={() => {
                setActiveTab('home');
              }}
              onPlayVideoSnippet={(videoId) => {
                setActiveVideoModal({
                  id: videoId,
                  videoId,
                  title: 'Derived Lecture Clip',
                  channelTitle: 'Verified Academic Source',
                  description: 'Watch the original micro-lecture behind this concept check.',
                  thumbnail:
                    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
                  durationTag: '1:15',
                  category: 'Curriculum',
                });
              }}
            />
          </div>
        )}

        {/* DESTINATION 3: "Messages" -> Chat & Stories Page */}
        {activeTab === 'messages' && (
          <div className="animate-in fade-in duration-200 py-2">
            <SocialMessagingScreen stats={stats} />
          </div>
        )}
      </main>

      {/* Scholarly Record & Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-[#F4EEE0] overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFCE]">
              <span className="font-serif font-bold text-lg text-[#1E4B8A]">道 Scholarly Record</span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-full bg-[#FAF6ED] border border-[#E8DFCE] hover:bg-[#E8DFCE]"
                aria-label="Close record"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProfileView
              stats={stats}
              onEditCurriculum={() => setIsEditingCurriculum(true)}
            />
          </div>
        </div>
      )}
      {/* Curriculum Edit Modal */}
      {isEditingCurriculum && (
        <div className="fixed inset-0 z-50 bg-[#F4EEE0] overflow-y-auto">
          <div className="relative max-w-[480px] mx-auto min-h-screen">
            <button
              onClick={() => setIsEditingCurriculum(false)}
              className="absolute top-4 right-4 z-40 p-2 rounded-full bg-[#FAF6ED] text-[#0F2138] border border-[#E8DFCE] hover:bg-[#E8DFCE] transition-colors"
              aria-label="Close curriculum form"
            >
              <X className="w-5 h-5" />
            </button>
            <StudentOnboardingForm onComplete={() => setIsEditingCurriculum(false)} />
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Lesson Reader Modal */}
      {activeLessonModal && (
        <LessonModal
          lesson={activeLessonModal}
          onClose={() => setActiveLessonModal(null)}
          onStartQuiz={handleStartQuiz}
          onOpenVideoSearch={handleOpenVideoSearch}
          isCompleted={stats.completedLessons.includes(activeLessonModal.id)}
        />
      )}

      {/* Interactive 3-Question Quiz Modal */}
      {activeQuiz && (
        <QuizModal
          lesson={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* YouTube Micro-Lecture Player Modal */}
      {activeVideoModal && (
        <VideoPlayerModal
          video={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          onGenerateQuizFromTopic={() => {
            setActiveTab('quizzes');
          }}
        />
      )}
    </div>
  );
}

/**
 * Authentication Guard & Root Routing Controller:
 * 1. If the user is NOT authenticated via Firebase Auth, render the Welcome / Sign-In view first:
 *    - Hero header with the title "瑠璃 (Ruri)" (#1E4B8A) and subtitle "Bite-sized micro-learning generated from your textbooks".
 *    - Primary "Sign in with Google" button (48x48px touch target) wired to trigger signInWithPopup(auth, googleProvider).
 *    - "Explore as Guest" secondary button granting instant access to the demo repository view.
 * 2. Once authenticated (or when "Explore as Guest" is clicked), smoothly transition into the home dashboard view.
 */
function AppNavigationFlow() {
  const { user, isNewUser, hasConsented, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EEE0] flex items-center justify-center animate-in fade-in duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1E4B8A] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-2xl shadow-md animate-pulse">
            瑠
          </div>
          <Loader2 className="w-6 h-6 text-[#1E4B8A] animate-spin" />
          <p className="text-xs font-semibold text-[#0F2138]/70">Loading Ruri...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Show Welcome / Sign-In Screen
  if (!user) {
    return (
      <div className="animate-in fade-in duration-300">
        <WelcomeAuthScreen />
      </div>
    );
  }

  // 2. New User -> Route to Student Onboarding & Curriculum Selection Form Screen
  if (isNewUser && !hasConsented) {
    return (
      <div className="animate-in fade-in duration-300">
        <StudentOnboardingForm onComplete={() => {}} />
      </div>
    );
  }

  // 3. Authenticated -> Smooth transition into the home dashboard view
  return (
    <div className="animate-in fade-in duration-300">
      <MainApp />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigationFlow />
    </AuthProvider>
  );
}
