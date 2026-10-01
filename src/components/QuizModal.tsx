import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Award, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { QuizQuestion, MicroLesson } from '../services/geminiService';

interface QuizModalProps {
  lesson: MicroLesson | { title: string; quiz: QuizQuestion[]; id?: string };
  onClose: () => void;
  onComplete: (correctCount: number, total: number, lessonId?: string) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ lesson, onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = lesson.quiz;
  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      const finalScore = selectedOption === currentQ.correctIndex ? score : score;
      onComplete(finalScore, questions.length, (lesson as MicroLesson).id);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF6ED] p-5 sm:p-7 shadow-2xl border border-[#E8DFCE] flex flex-col text-[#0F2138]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#1E4B8A] text-white flex items-center justify-center text-xs font-bold">
              問
            </span>
            <div>
              <p className="text-xs font-bold text-[#1E4B8A]">Scholarly Retrieval Quiz</p>
              <p className="text-[11px] text-[#0F2138]/60 truncate max-w-[200px]">
                {lesson.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/60 hover:text-[#0F2138] touch-target-48 min-w-[48px] min-h-[48px]"
            aria-label="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Finished State View */}
        {quizFinished ? (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center text-[#8B6E0B]">
              <Award className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div>
              <span className="text-xs font-serif font-bold text-[#1E4B8A]">
                修了 · Mastery Assessment
              </span>
              <h3 className="text-2xl font-bold text-[#0F2138] mt-1">
                {score === questions.length
                  ? 'Flawless Comprehension'
                  : score >= 2
                  ? 'Substantial Mastery'
                  : 'Deliberate Practice Needed'}
              </h3>
              <p className="text-sm text-[#0F2138]/70 mt-1">
                You answered {score} of {questions.length} questions correctly.
              </p>
            </div>

            {/* Score & XP badge */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F4EEE0] border border-[#D4AF37]/40 shadow-xs">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#1E4B8A]">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>+{score * 25} XP Earned</span>
              </div>
              <span className="text-[#0F2138]/30">|</span>
              <span className="text-xs font-semibold text-[#8B6E0B]">
                {Math.round((score / questions.length) * 100)}% Accuracy
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DFCE] bg-[#F4EEE0] hover:bg-[#E8DFCE] px-4 py-2.5 text-xs font-semibold text-[#0F2138] transition-all min-h-[48px] touch-target-48"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] px-6 py-2.5 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
              >
                <span>Continue Learning</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Question View */
          <div className="py-4 space-y-4">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#0F2138]/70">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[#1E4B8A] font-bold">
                  Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E8DFCE] overflow-hidden">
                <div
                  className="h-full bg-[#1E4B8A] transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              {currentQ.sourceConcept && (
                <span className="text-[11px] font-semibold text-[#1E4B8A] uppercase tracking-wider">
                  Target Concept: {currentQ.sourceConcept}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-bold text-[#0F2138] leading-snug mt-1">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                let cardStyle =
                  'border-[#E8DFCE] bg-[#F4EEE0] hover:bg-[#E8DFCE] text-[#0F2138]';

                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    cardStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (idx === selectedOption) {
                    cardStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                  } else {
                    cardStyle = 'border-[#E8DFCE] bg-[#F4EEE0]/60 text-[#0F2138]/40';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 min-h-[52px] touch-target-48 ${cardStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#FAF6ED] border border-current text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed flex-1">{option}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation reveal */}
            {isAnswered && (
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed animate-in fade-in duration-200 border ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <span className="font-bold block mb-1">
                  {selectedOption === currentQ.correctIndex
                    ? 'Correct intuition!'
                    : 'Academic Rationale:'}
                </span>
                {currentQ.explanation}
              </div>
            )}

            {/* Footer Next Button */}
            {isAnswered && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] px-6 py-3 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
                >
                  <span>
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
