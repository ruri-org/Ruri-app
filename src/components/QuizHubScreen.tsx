import React, { useState } from 'react';
import {
  MoreVertical,
  BookOpen,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  X,
  ArrowRight,
  Filter,
  Flame,
  Award,
  BookCheck,
} from 'lucide-react';
import { QuizQuestion, generateSimilarQuestions } from '../services/geminiService';
import { UserStats, recordQuizResult } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

export interface QuizCardItem {
  id: string;
  subjectBadge: string; // e.g. "SAT Math - Quadratic Equations"
  videoSnippet: {
    title: string;
    thumbnail: string;
    channelTitle: string;
    durationTag: string;
    videoId: string;
  };
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  aiBreakdown: {
    summary: string;
    keyFormulasOrTerms: string[];
    scholarlyTip: string;
  };
}

const INITIAL_QUIZ_CARDS: QuizCardItem[] = [
  {
    id: 'quiz_sat_quadratics',
    subjectBadge: 'SAT Math - Quadratic Equations',
    videoSnippet: {
      title: 'Quadratic Vertex Form & Axis of Symmetry Shortcut',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
      channelTitle: 'College Board Masterclass',
      durationTag: '1:15',
      videoId: 'HEfHFsfGXjs',
    },
    question: 'The parabola y = 2x² - 12x + 10 has its minimum at (h, k). What is the value of k?',
    options: ['k = -8', 'k = 3', 'k = -10', 'k = 18'],
    correctIndex: 0,
    explanation:
      'The x-coordinate of the vertex is h = -b/(2a) = 12/(2*2) = 3. Substituting into y gives k = 2(3)² - 12(3) + 10 = 18 - 36 + 10 = -8.',
    aiBreakdown: {
      summary:
        'Standard quadratic form is y = ax² + bx + c. The axis of symmetry always bisects root solutions at x = -b/(2a).',
      keyFormulasOrTerms: [
        'Vertex x-coordinate: h = -b / (2a)',
        'Discriminant: Δ = b² - 4ac (determines number of real roots)',
        'Factored Form: y = a(x - r1)(x - r2)',
      ],
      scholarlyTip:
        'Always calculate the vertex x-coordinate first; plugging back into original function yields extreme value k effortlessly.',
    },
  },
  {
    id: 'quiz_ap_physics_inertia',
    subjectBadge: 'AP Physics - Newton’s Laws & Inertia',
    videoSnippet: {
      title: 'Newton’s 1st Law in Non-Inertial Reference Frames',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
      channelTitle: 'Domain of Physics',
      durationTag: '1:05',
      videoId: 'kKKM8Y-u7ds',
    },
    question:
      'An elevator accelerates downward at 2 m/s² (g = 9.8 m/s²). What does a scale read for a 60 kg student inside?',
    options: ['468 N', '588 N', '708 N', '120 N'],
    correctIndex: 0,
    explanation:
      'Using Newton’s 2nd Law: F_net = mg - N = ma, so N = m(g - a) = 60(9.8 - 2.0) = 60(7.8) = 468 N.',
    aiBreakdown: {
      summary:
        'Apparent weight is the normal force exerted by the supporting surface. Downward acceleration decreases normal contact force.',
      keyFormulasOrTerms: [
        'Apparent Weight: N = m(g ± a)',
        'Free-fall Condition: If a = g, N = 0 (apparent weightlessness)',
        'Inertial Frame: A reference frame with zero acceleration where Newton’s 1st Law holds',
      ],
      scholarlyTip:
        'Set up coordinate axes in direction of acceleration to avoid algebraic sign flips.',
    },
  },
  {
    id: 'quiz_ap_bio_chemiosmosis',
    subjectBadge: 'AP Biology - Chemiosmosis & ATP Synthase',
    videoSnippet: {
      title: 'The Proton-Motive Force & Mitochondrial Chemiosmosis',
      thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=400&q=80',
      channelTitle: 'BioInteractive Academy',
      durationTag: '1:10',
      videoId: '8kK2zwjRV0M',
    },
    question:
      'What immediate physiological change occurs if the inner mitochondrial membrane becomes leaky to protons (H+)?',
    options: [
      'ATP synthase rotation slows while oxidation of NADH continues, dissipating energy as heat',
      'The electron transport chain immediately shuts off completely',
      'Oxygen consumption drops to zero',
      'Cellular pH in the intermembrane space drops to 1.0',
    ],
    correctIndex: 0,
    explanation:
      'Protons bypass ATP synthase through the leak, uncoupling electron transport from phosphorylation. Energy converts directly to thermal dissipation (as seen in brown fat thermogenesis).',
    aiBreakdown: {
      summary:
        'The proton gradient links metabolic fuel oxidation to ADP phosphorylation via mechanical rotation of the F0/F1 complex.',
      keyFormulasOrTerms: [
        'Proton-motive force (pmf) = chemical ΔpH + electrical ΔΨ',
        'ATP Yield: ~2.5 ATP per NADH and ~1.5 ATP per FADH2',
        'Terminal Electron Acceptor: 1/2 O2 + 2H+ + 2e- -> H2O',
      ],
      scholarlyTip:
        'Remember that uncouplers do NOT stop oxygen consumption—they uncouple respiration from ATP yield.',
    },
  },
  {
    id: 'quiz_igcse_chem_lattice',
    subjectBadge: 'IGCSE Chemistry - Covalent vs Ionic Lattices',
    videoSnippet: {
      title: 'Giant Molecular vs Giant Ionic Structures',
      thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80',
      channelTitle: 'Cambridge Science Hub',
      durationTag: '1:00',
      videoId: 'z1GCnyRNTgk',
    },
    question:
      'Why does solid silicon dioxide (SiO₂) have an exceptionally high melting point compared to solid carbon dioxide (CO₂)?',
    options: [
      'SiO₂ has giant 3D covalent networks, whereas CO₂ consists of simple covalent molecules held by weak intermolecular forces',
      'SiO₂ is an ionic salt with ionic electrostatic attractions',
      'CO₂ has metallic bonds that melt easily',
      'Silicon atoms are much heavier than carbon atoms',
    ],
    correctIndex: 0,
    explanation:
      'Melting SiO₂ requires breaking countless strong Si-O covalent bonds throughout the macroscopic 3D lattice, requiring immense thermal energy (> 1,700°C). CO₂ only requires overcoming weak intermolecular dispersion forces.',
    aiBreakdown: {
      summary:
        'Physical properties differ drastically between macromolecular giant structures and discrete simple molecular compounds.',
      keyFormulasOrTerms: [
        'Giant Covalent: Diamond, Graphite, SiO2 (Quartz)',
        'Intermolecular Forces: London dispersion, dipole-dipole, hydrogen bonds',
        'Ionic Lattices: High melting points, brittle, conduct when molten or aqueous',
      ],
      scholarlyTip:
        'Never state that covalent bonds break when melting simple molecules like water or carbon dioxide; only weak intermolecular attractions separate.',
    },
  },
];

interface QuizHubScreenProps {
  stats: UserStats;
  onFilterRelatedTopic: (topic: string) => void;
  onPlayVideoSnippet?: (videoId: string) => void;
}

export const QuizHubScreen: React.FC<QuizHubScreenProps> = ({
  stats,
  onFilterRelatedTopic,
  onPlayVideoSnippet,
}) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<QuizCardItem[]>(INITIAL_QUIZ_CARDS);
  const [answers, setAnswers] = useState<{ [cardId: string]: number }>({});
  const [activeMenuCardId, setActiveMenuCardId] = useState<string | null>(null);

  // Modal 1: "Learn More" AI Concept Breakdown Sheet
  const [learnMoreItem, setLearnMoreItem] = useState<QuizCardItem | null>(null);

  // Modal 2: "Similar Questions" Practice Generator Modal
  const [similarQuestionsModal, setSimilarQuestionsModal] = useState<{
    subject: string;
    originalQuestion: string;
    questions: QuizQuestion[];
    isLoading: boolean;
    answers: { [qId: string]: number };
  } | null>(null);

  // Answer handler for cards
  const handleSelectOption = async (cardId: string, optionIdx: number, correctIdx: number) => {
    if (answers[cardId] !== undefined) return; // already answered

    setAnswers((prev) => ({ ...prev, [cardId]: optionIdx }));
    const isCorrect = optionIdx === correctIdx;
    const userId = user?.uid || 'guest';
    await recordQuizResult(userId, isCorrect ? 1 : 0, 1);
  };

  // Action Menu: 1. "Learn More"
  const handleLearnMore = (card: QuizCardItem) => {
    setActiveMenuCardId(null);
    setLearnMoreItem(card);
  };

  // Action Menu: 2. "Related Topics"
  const handleRelatedTopics = (card: QuizCardItem) => {
    setActiveMenuCardId(null);
    onFilterRelatedTopic(card.subjectBadge);
  };

  // Action Menu: 3. "Similar Questions"
  const handleGenerateSimilarQuestions = async (card: QuizCardItem) => {
    setActiveMenuCardId(null);
    setSimilarQuestionsModal({
      subject: card.subjectBadge,
      originalQuestion: card.question,
      questions: [],
      isLoading: true,
      answers: {},
    });

    try {
      const generated = await generateSimilarQuestions(card.subjectBadge, card.question);
      setSimilarQuestionsModal((prev) =>
        prev
          ? {
              ...prev,
              questions: generated,
              isLoading: false,
            }
          : null
      );
    } catch (err) {
      console.error('Similar questions generation error:', err);
    }
  };

  // Answer handler inside Similar Questions modal
  const handleSimilarAnswer = async (qId: string, optionIdx: number, correctIdx: number) => {
    if (!similarQuestionsModal || similarQuestionsModal.answers[qId] !== undefined) return;
    const updatedAnswers = { ...similarQuestionsModal.answers, [qId]: optionIdx };
    setSimilarQuestionsModal({
      ...similarQuestionsModal,
      answers: updatedAnswers,
    });

    const isCorrect = optionIdx === correctIdx;
    const userId = user?.uid || 'guest';
    await recordQuizResult(userId, isCorrect ? 1 : 0, 1);
  };

  // Stats calculation
  const answeredCount = Object.keys(answers).length;
  const correctCount = cards.filter((c) => answers[c.id] === c.correctIndex).length;
  const accuracyScore =
    stats.quizzesTaken > 0
      ? Math.round((stats.totalCorrectAnswers / (stats.quizzesTaken * 3 || 1)) * 100)
      : answeredCount > 0
      ? Math.round((correctCount / answeredCount) * 100)
      : 92;

  const quizzesCompletedToday = Math.max(stats.quizzesTaken, answeredCount, 3);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* 
        TOP APP BAR:
        - Title: "Quiz Hub & Mastery" (Headline Medium: 28px in Google Sans Flex, #1E4B8A).
        - Action: Daily Stats Bar showing "Quizzes Completed Today: X" and "Accuracy Score: Y%"
          formatted inside a Kogane Gold (#D4AF37) badge container.
      */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFCE]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-[#1E4B8A] font-bold">問</span>
            <h1
              className="text-[#1E4B8A] font-bold tracking-tight leading-tight"
              style={{
                fontSize: '28px',
                lineHeight: '36px',
                fontFamily: "'Google Sans Flex', 'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              Quiz Hub & Mastery
            </h1>
          </div>
          <p className="text-xs text-[#0F2138]/65 mt-0.5">
            Diagnostic active recall checkpoints with instant AI remediation.
          </p>
        </div>

        {/* Daily Stats Bar (Kogane Gold #D4AF37 badge container) */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FAF6ED] border border-[#D4AF37] shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B6E0B]">
            <BookCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Quizzes Completed Today: {quizzesCompletedToday}</span>
          </div>

          <span className="text-[#D4AF37]/50" aria-hidden="true">
            |
          </span>

          <div className="flex items-center gap-1 text-xs font-bold text-[#1E4B8A]">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>Accuracy Score: {accuracyScore}%</span>
          </div>
        </div>
      </header>

      {/* 
        QUIZ CARD STACK:
        Vertical list of card components:
        - Surface Container Low (#FAF6ED)
        - 12dp rounded corners (rounded-[12px])
        - Subtle Ruri (#1E4B8A) border outlines
        - 16px padding
      */}
      <section aria-label="Diagnostic Quiz Queue" className="space-y-4">
        {cards.map((card) => {
          const userAnswer = answers[card.id];
          const isAnswered = userAnswer !== undefined;
          const isMenuOpen = activeMenuCardId === card.id;

          return (
            <article
              key={card.id}
              className="relative p-4 rounded-[12px] bg-[#FAF6ED] border border-[#1E4B8A]/20 hover:border-[#1E4B8A]/45 shadow-2xs transition-all space-y-3.5"
            >
              {/* Card Top: Subject Badge + 3-Dots Action Menu */}
              <div className="flex items-center justify-between gap-2">
                {/* Subject Badge: Kogane Gold (#D4AF37) pill tag */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/60 text-xs font-bold text-[#8B6E0B] shadow-3xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{card.subjectBadge}</span>
                </span>

                {/* Diagnostic 3-Dots Action Menu: M3 IconButton (48x48px tap target, #1E4B8A) */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuCardId(isMenuOpen ? null : card.id)}
                    className="w-10 h-10 rounded-full hover:bg-[#E8DFCE] flex items-center justify-center text-[#1E4B8A] transition-colors touch-target-48 min-w-[48px] min-h-[48px]"
                    aria-label="Diagnostic actions menu"
                    aria-expanded={isMenuOpen}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu in Gofun (#F4EEE0) */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-52 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE] p-2 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                      onClick={() => setActiveMenuCardId(null)}
                    >
                      {/* 1. "Learn More" */}
                      <button
                        onClick={() => handleLearnMore(card)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#0F2138] hover:bg-[#FAF6ED] hover:text-[#1E4B8A] transition-colors flex items-center gap-2 min-h-[40px] touch-target-48"
                      >
                        <BookOpen className="w-4 h-4 text-[#1E4B8A]" />
                        <span>Learn More (AI Breakdown)</span>
                      </button>

                      {/* 2. "Related Topics" */}
                      <button
                        onClick={() => handleRelatedTopics(card)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#0F2138] hover:bg-[#FAF6ED] hover:text-[#1E4B8A] transition-colors flex items-center gap-2 min-h-[40px] touch-target-48"
                      >
                        <Filter className="w-4 h-4 text-[#D4AF37]" />
                        <span>Related Topics Feed</span>
                      </button>

                      {/* 3. "Similar Questions" via Gemini Flash API */}
                      <button
                        onClick={() => handleGenerateSimilarQuestions(card)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#8B6E0B] hover:bg-[#FAF6ED] transition-colors flex items-center gap-2 min-h-[40px] touch-target-48"
                      >
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span>Similar Questions (Gemini)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Reference Snippet: Thumbnail preview of the clip this quiz originated from */}
              <div
                onClick={() => onPlayVideoSnippet && onPlayVideoSnippet(card.videoSnippet.videoId)}
                className="group/video cursor-pointer rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] p-2 flex items-center gap-3 hover:border-[#1E4B8A]/40 transition-colors"
              >
                <div className="relative w-20 h-12 rounded-lg bg-black overflow-hidden shrink-0">
                  <img
                    src={card.videoSnippet.thumbnail}
                    alt={card.videoSnippet.title}
                    className="w-full h-full object-cover group-hover/video:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                  </div>
                  <span className="absolute bottom-0.5 right-1 px-1 rounded-sm bg-black/80 text-[9px] font-bold text-white">
                    {card.videoSnippet.durationTag}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#1E4B8A] font-semibold uppercase tracking-wider">
                    Derived from Video Lecture
                  </p>
                  <h4 className="text-xs font-bold text-[#0F2138] truncate group-hover/video:text-[#1E4B8A] transition-colors">
                    {card.videoSnippet.title}
                  </h4>
                  <span className="text-[10px] text-[#0F2138]/60">
                    {card.videoSnippet.channelTitle}
                  </span>
                </div>
              </div>

              {/* Question Text: Title Medium Plus Jakarta Sans 16px SemiBold #0F2138 */}
              <div>
                <h3
                  className="text-[#0F2138] font-semibold leading-snug"
                  style={{
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {card.question}
                </h3>
              </div>

              {/* Multiple Choice Options: 4 Radio Button List Items */}
              <div className="space-y-2">
                {card.options.map((opt, idx) => {
                  const isSelected = userAnswer === idx;
                  let cardStyle =
                    'border-[#E8DFCE] bg-[#F4EEE0] hover:bg-[#E8DFCE]/70 text-[#0F2138]';

                  if (isAnswered) {
                    if (idx === card.correctIndex) {
                      cardStyle =
                        'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs';
                    } else if (isSelected) {
                      cardStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                    } else {
                      cardStyle = 'border-[#E8DFCE] bg-[#F4EEE0]/40 text-[#0F2138]/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(card.id, idx, card.correctIndex)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 min-h-[48px] touch-target-48 cursor-pointer ${cardStyle}`}
                    >
                      {/* Radio dot element */}
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-[#1E4B8A] bg-[#1E4B8A] text-white'
                            : isAnswered && idx === card.correctIndex
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-[#1E4B8A]/40 bg-[#FAF6ED]'
                        }`}
                      >
                        {isSelected || (isAnswered && idx === card.correctIndex) ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#0F2138]/60">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </span>

                      <span className="flex-1 leading-relaxed">{opt}</span>

                      {isAnswered && idx === card.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelected && idx !== card.correctIndex && (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Rationale feedback reveal after answer */}
              {isAnswered && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border animate-in fade-in duration-200 ${
                    userAnswer === card.correctIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <p className="font-bold mb-0.5">
                    {userAnswer === card.correctIndex ? 'Correct Analysis!' : 'Cognitive Rationale:'}
                  </p>
                  <p className="text-[11px] leading-relaxed">{card.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* 
        MODAL 1: "Learn More" AI Concept Breakdown Sheet
        Opens modal sheet in Gofun (#F4EEE0) with core concepts, formulas, and scholarly tips.
      */}
      {learnMoreItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setLearnMoreItem(null)}
        >
          <div
            className="w-full max-w-xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-[#F4EEE0] p-5 sm:p-6 border-t-2 sm:border border-[#D4AF37] shadow-2xl flex flex-col text-[#0F2138] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-[#1E4B8A] font-bold">解</span>
                <div>
                  <h3 className="text-base font-bold text-[#0F2138]">
                    AI Conceptual Breakdown
                  </h3>
                  <p className="text-xs text-[#8B6E0B] font-semibold">
                    {learnMoreItem.subjectBadge}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLearnMoreItem(null)}
                className="w-9 h-9 rounded-full bg-[#FAF6ED] border border-[#E8DFCE] hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/70 touch-target-48 min-w-[40px] min-h-[40px]"
                aria-label="Close learn more sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4B8A]">
                  Core Mechanism
                </h4>
                <p className="text-xs sm:text-sm text-[#0F2138]/85 leading-relaxed mt-1 font-serif">
                  {learnMoreItem.aiBreakdown.summary}
                </p>
              </div>

              {/* Formulas & Terms */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4B8A]">
                  Key Formulas & Definitions
                </h4>
                <div className="space-y-1.5">
                  {learnMoreItem.aiBreakdown.keyFormulasOrTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#E8DFCE] text-xs font-medium text-[#0F2138] flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-md bg-[#1E4B8A] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scholarly Exam Tip */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6ED] border-l-4 border-l-[#D4AF37] border-y border-r border-[#E8DFCE] text-xs leading-relaxed space-y-1">
                <span className="font-bold text-[#8B6E0B] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  瑠璃の助言 · Scholarly Strategy:
                </span>
                <p className="text-[#0F2138]/80">{learnMoreItem.aiBreakdown.scholarlyTip}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8DFCE]">
              <button
                onClick={() => setLearnMoreItem(null)}
                className="w-full py-3 rounded-xl bg-[#1E4B8A] text-white font-bold text-xs shadow min-h-[48px] touch-target-48"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        MODAL 2: "Similar Questions" Practice Generator Modal (Gemini Flash API)
      */}
      {similarQuestionsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSimilarQuestionsModal(null)}
        >
          <div
            className="w-full max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl bg-[#F4EEE0] p-5 sm:p-6 border-t-2 sm:border border-[#D4AF37] shadow-2xl flex flex-col text-[#0F2138] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-[#1E4B8A] font-bold">鍛</span>
                <div>
                  <h3 className="text-base font-bold text-[#0F2138]">
                    Generated Practice Drill
                  </h3>
                  <p className="text-xs text-[#8B6E0B] font-semibold">
                    3 Targeted Questions via Gemini 1.5 Flash
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSimilarQuestionsModal(null)}
                className="w-9 h-9 rounded-full bg-[#FAF6ED] border border-[#E8DFCE] hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/70 touch-target-48 min-w-[40px] min-h-[40px]"
                aria-label="Close similar drill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions list or Loading state */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              {similarQuestionsModal.isLoading ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#1E4B8A] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#0F2138]">
                    Gemini 1.5 Flash is synthesizing practice variants...
                  </p>
                  <p className="text-[11px] text-[#0F2138]/60">
                    Formulating variations on: {similarQuestionsModal.subject}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {similarQuestionsModal.questions.map((q, qIndex) => {
                    const ans = similarQuestionsModal.answers[q.id];
                    const isQAnswered = ans !== undefined;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1E4B8A]">
                            Drill #{qIndex + 1}
                          </span>
                          <span className="text-[11px] text-[#8B6E0B]">
                            {q.sourceConcept || similarQuestionsModal.subject}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-[#0F2138] leading-snug">
                          {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            let style =
                              'bg-[#F4EEE0] border-[#E8DFCE] text-[#0F2138] hover:bg-[#E8DFCE]/80';
                            if (isQAnswered) {
                              if (optIdx === q.correctIndex) {
                                style =
                                  'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold';
                              } else if (optIdx === ans) {
                                style = 'bg-rose-50 border-rose-500 text-rose-950';
                              } else {
                                style = 'bg-[#F4EEE0]/40 border-[#E8DFCE] text-[#0F2138]/40';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isQAnswered}
                                onClick={() =>
                                  handleSimilarAnswer(q.id, optIdx, q.correctIndex)
                                }
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 min-h-[44px] ${style}`}
                              >
                                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isQAnswered && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed">
                            <span className="font-bold block">Academic Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E8DFCE]">
              <button
                onClick={() => setSimilarQuestionsModal(null)}
                className="w-full py-3 rounded-xl bg-[#1E4B8A] text-white font-bold text-xs shadow min-h-[48px] touch-target-48"
              >
                Complete Drill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
