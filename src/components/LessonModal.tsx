import React, { useState } from 'react';
import { X, Volume2, VolumeX, CheckCircle, HelpCircle, Youtube, BookOpen } from 'lucide-react';
import { MicroLesson } from '../services/geminiService';

interface LessonModalProps {
  lesson: MicroLesson | null;
  onClose: () => void;
  onStartQuiz: (lesson: MicroLesson) => void;
  onOpenVideoSearch: (query: string) => void;
  isCompleted: boolean;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  onClose,
  onStartQuiz,
  onOpenVideoSearch,
  isCompleted,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!lesson) return null;

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${lesson.title}. ${lesson.summary}. ${lesson.coreConcepts
      .map((c) => `${c.term}. ${c.definition}. ${c.scholarlyNote}`)
      .join(' ')}. Japanese reflection: ${lesson.proverb.japanese}, ${lesson.proverb.meaning}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-[#FAF6ED] p-5 sm:p-7 shadow-2xl border border-[#E8DFCE] flex flex-col overflow-hidden text-[#0F2138]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-[#1E4B8A] font-bold">
              {lesson.kanjiTheme}
            </span>
            <span className="text-xs text-[#0F2138]/60 font-medium">
              {lesson.subject} · {lesson.estimatedMinutes} min read
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSpeech}
              title={isPlayingAudio ? 'Pause reading' : 'Scholarly read-aloud'}
              aria-label={isPlayingAudio ? 'Pause reading' : 'Read lesson aloud'}
              className="w-10 h-10 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] hover:border-[#1E4B8A] flex items-center justify-center text-[#1E4B8A] transition-all touch-target-48 min-w-[48px] min-h-[48px]"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-5 h-5 text-rose-600 animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/60 hover:text-[#0F2138] touch-target-48 min-w-[48px] min-h-[48px]"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1">
          {/* Title & Mastered status */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2138] leading-tight">
                {lesson.title}
              </h2>
              {isCompleted && (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Mastered
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#0F2138]/80 leading-relaxed font-serif">
              {lesson.summary}
            </p>
          </div>

          {/* Core Concepts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E4B8A] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Core Academic Principles
            </h3>

            {lesson.coreConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#F4EEE0] p-4 border border-[#E8DFCE] space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#1E4B8A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#0F2138]">{concept.term}</h4>
                </div>
                <p className="text-xs sm:text-sm text-[#0F2138]/85 leading-relaxed pl-7">
                  {concept.definition}
                </p>
                <div className="mt-1.5 pl-7 pt-1.5 border-t border-[#E8DFCE]/60 text-xs text-[#1E4B8A] font-medium italic">
                  Note: {concept.scholarlyNote}
                </div>
              </div>
            ))}
          </div>

          {/* Proverb / Wisdom Box */}
          {lesson.proverb && (
            <div className="rounded-2xl bg-linear-to-r from-[#FAF6ED] to-[#F4EEE0] p-4 border border-[#D4AF37]/40 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#D4AF37] font-bold mb-1">
                <span>瑠璃の省察 (Scholarly Reflection)</span>
                <span className="font-serif text-[#0F2138]">{lesson.proverb.romaji}</span>
              </div>
              <p className="font-serif text-lg font-bold text-[#1E4B8A]">
                {lesson.proverb.japanese}
              </p>
              <p className="mt-1 text-xs text-[#0F2138]/80 leading-relaxed">
                {lesson.proverb.meaning}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E8DFCE] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={() => {
              handleClose();
              onOpenVideoSearch(lesson.suggestedYoutubeQuery || lesson.title);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8DFCE] bg-[#F4EEE0] hover:bg-[#E8DFCE] px-4 py-2.5 text-xs font-semibold text-[#0F2138] transition-all min-h-[48px] touch-target-48"
          >
            <Youtube className="w-4 h-4 text-rose-600" />
            <span>Watch Micro-Lecture</span>
          </button>

          <button
            onClick={() => {
              handleClose();
              onStartQuiz(lesson);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] px-5 py-2.5 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
          >
            <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>Test Knowledge ({lesson.quiz.length} Qs)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
