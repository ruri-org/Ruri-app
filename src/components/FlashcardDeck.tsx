import React, { useState } from 'react';
import { RotateCw, CheckCircle, XCircle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { MicroLesson } from '../services/geminiService';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceLesson: string;
  isMastered: boolean;
}

interface FlashcardDeckProps {
  lessons: MicroLesson[];
  onMasterCard: (term: string) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ lessons, onMasterCard }) => {
  // Aggregate concepts from all available lessons into flashcards
  const allCards: Flashcard[] = lessons.flatMap((l) =>
    l.coreConcepts.map((c, idx) => ({
      id: `${l.id}_c_${idx}`,
      front: c.term,
      back: `${c.definition} — ${c.scholarlyNote}`,
      sourceLesson: l.title,
      isMastered: false,
    }))
  );

  const [cards, setCards] = useState<Flashcard[]>(allCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#FAF6ED] border border-[#E8DFCE]">
        <Layers className="w-10 h-10 text-[#1E4B8A] mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#0F2138]">No flashcards available yet</h3>
        <p className="text-xs text-[#0F2138]/60 mt-1">
          Explore lessons or scan materials with Gemini to generate new study cards.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = () => {
    const updated = [...cards];
    updated[currentIndex].isMastered = true;
    setCards(updated);
    onMasterCard(currentCard.front);
    handleNext();
  };

  const masteredCount = cards.filter((c) => c.isMastered).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl text-[#1E4B8A] font-bold">札</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2138]">
              Spaced Repetition Karuta (歌留多)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#0F2138]/70 mt-1 leading-relaxed">
            Active recall flashcards based on the Leitner spaced repetition system. Tap the card to flip and verify your internal mental model.
          </p>
        </div>

        {/* Mastered metric */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs font-bold text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {masteredCount}/{cards.length}
            </span>
          </div>
          <span className="text-[11px] text-[#0F2138]/60">Mastered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[#0F2138]/60">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span className="truncate max-w-[200px]">{currentCard.sourceLesson}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#E8DFCE] overflow-hidden">
          <div
            className="h-full bg-[#1E4B8A] transition-all duration-200"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Interactive Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="group cursor-pointer select-none perspective-1000 min-h-[260px] sm:min-h-[280px] rounded-3xl bg-[#FAF6ED] p-6 sm:p-8 border-2 border-[#E8DFCE] hover:border-[#1E4B8A]/50 shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
      >
        {/* Subtle decorative washi paper background watermark */}
        <div className="absolute -right-6 -bottom-6 text-[#1E4B8A]/5 font-serif font-bold text-9xl pointer-events-none select-none">
          瑠
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E4B8A]">
            {isFlipped ? 'Academic Elaboration' : 'Foundational Concept'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0F2138]/50 group-hover:text-[#1E4B8A] transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Tap to flip</span>
          </span>
        </div>

        {/* Card Center Body */}
        <div className="my-auto py-4 z-10 text-center">
          {isFlipped ? (
            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <h4 className="text-xs font-bold text-[#1E4B8A] uppercase tracking-wider">
                {currentCard.front}
              </h4>
              <p className="text-sm sm:text-base text-[#0F2138] leading-relaxed font-serif max-w-md mx-auto">
                {currentCard.back}
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-150">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F2138]">
                {currentCard.front}
              </h3>
              <p className="text-xs text-[#0F2138]/60">
                Can you explain this concept from first principles?
              </p>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-[11px] text-[#0F2138]/60 border-t border-[#E8DFCE] pt-3 z-10">
          <span>Source: {currentCard.sourceLesson}</span>
          {currentCard.isMastered && (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Mastered
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl border border-[#E8DFCE] bg-[#FAF6ED] hover:bg-[#E8DFCE] text-xs font-bold text-[#0F2138] transition-all min-h-[48px] touch-target-48"
        >
          Previous
        </button>

        <button
          onClick={handleMarkMastered}
          className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow transition-all flex items-center justify-center gap-1.5 min-h-[48px] touch-target-48"
        >
          <CheckCircle className="w-4 h-4" />
          <span>I Know This (+15 XP)</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
        >
          Next
        </button>
      </div>
    </div>
  );
};
