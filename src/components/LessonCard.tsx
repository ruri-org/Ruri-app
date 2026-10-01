import React from 'react';
import { Clock, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { MicroLesson } from '../services/geminiService';

interface LessonCardProps {
  lesson: MicroLesson;
  isCompleted: boolean;
  onOpenLesson: (lesson: MicroLesson) => void;
  onStartQuiz: (lesson: MicroLesson) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted,
  onOpenLesson,
  onStartQuiz,
}) => {
  return (
    <article
      onClick={() => onOpenLesson(lesson)}
      className="group relative cursor-pointer rounded-2xl bg-[#FAF6ED] p-4 sm:p-5 border border-[#E8DFCE] hover:border-[#1E4B8A]/40 hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between"
    >
      <div>
        {/* Unboxed clean metadata kicker (Zero-pill discipline) */}
        <div className="flex items-center justify-between text-xs text-[#0F2138]/65 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="font-serif text-[#1E4B8A] font-semibold">{lesson.kanjiTheme}</span>
            <span aria-hidden="true">·</span>
            <span>{lesson.subject}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0F2138]/50" />
              {lesson.estimatedMinutes} min
            </span>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mastered</span>
            </div>
          )}
        </div>

        {/* Primary Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#0F2138] group-hover:text-[#1E4B8A] transition-colors line-clamp-2">
          {lesson.title}
        </h3>

        {/* Summary */}
        <p className="mt-1.5 text-xs sm:text-sm text-[#0F2138]/75 line-clamp-2 leading-relaxed">
          {lesson.summary}
        </p>

        {/* Scholarly quote / proverb teaser */}
        {lesson.proverb && (
          <div className="mt-3 py-1.5 px-2.5 rounded-xl bg-[#F4EEE0] border-l-2 border-[#D4AF37] text-[11px] text-[#0F2138]/85 flex items-center justify-between">
            <span className="font-serif italic truncate">{lesson.proverb.japanese}</span>
            <span className="text-[10px] text-[#D4AF37] font-semibold ml-2 shrink-0">
              {lesson.quiz.length} Questions
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#E8DFCE] flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLesson(lesson);
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#1E4B8A] hover:underline min-h-[48px] px-2 touch-target-48"
        >
          <span>Read Lesson</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartQuiz(lesson);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E4B8A]/10 hover:bg-[#1E4B8A] text-[#1E4B8A] hover:text-white px-3.5 py-2 text-xs font-bold transition-all min-h-[48px] touch-target-48"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Take Quiz</span>
        </button>
      </div>
    </article>
  );
};
