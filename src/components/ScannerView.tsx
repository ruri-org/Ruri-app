import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Loader2, ArrowRight, BookOpen, Check } from 'lucide-react';
import {
  extractQuizFromImage,
  generateMicroLesson,
  MicroLesson,
  QuizQuestion,
} from '../services/geminiService';

interface ScannerViewProps {
  onStartCustomQuiz: (quizData: { title: string; quiz: QuizQuestion[] }) => void;
  onOpenGeneratedLesson: (lesson: MicroLesson) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onStartCustomQuiz,
  onOpenGeneratedLesson,
}) => {
  const [activeMode, setActiveMode] = useState<'scan' | 'generate'>('scan');
  const [topicInput, setTopicInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    classification: string;
    summary: string;
    quiz: QuizQuestion[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      setAnalysisResult(null);
      setIsProcessing(true);

      try {
        const result = await extractQuizFromImage(base64, file.type || 'image/jpeg');
        setAnalysisResult(result);
      } catch (err) {
        console.error('Extraction error:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const lesson = await generateMicroLesson(topicInput.trim());
      onOpenGeneratedLesson(lesson);
      setTopicInput('');
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl text-[#1E4B8A] font-bold">鏡</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2138]">
            AI Optical Scanner & Quiz Engine
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#0F2138]/70 mt-1 leading-relaxed">
          Powered by Gemini 1.5 Flash. Photograph diagrams, study notes, or enter any scholarly topic to generate instant micro-learning modules.
        </p>
      </div>

      {/* Mode Selector Tabs (Segmented control) */}
      <div className="flex items-center p-1 rounded-2xl bg-[#E8DFCE]/60 border border-[#E8DFCE]">
        <button
          onClick={() => setActiveMode('scan')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-target-48 ${
            activeMode === 'scan'
              ? 'bg-[#FAF6ED] text-[#1E4B8A] shadow-xs'
              : 'text-[#0F2138]/60 hover:text-[#0F2138]'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan Diagram / Notes</span>
        </button>

        <button
          onClick={() => setActiveMode('generate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-target-48 ${
            activeMode === 'generate'
              ? 'bg-[#FAF6ED] text-[#1E4B8A] shadow-xs'
              : 'text-[#0F2138]/60 hover:text-[#0F2138]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Topic Synthesizer</span>
        </button>
      </div>

      {/* Scanner Mode */}
      {activeMode === 'scan' && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer rounded-3xl border-2 border-dashed border-[#D4AF37]/60 hover:border-[#1E4B8A] bg-[#FAF6ED] p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center min-h-[200px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageFile(e.target.files[0]);
                }
              }}
            />

            {previewImage ? (
              <div className="space-y-3 w-full max-w-xs">
                <img
                  src={previewImage}
                  alt="Scanned source"
                  className="w-full h-40 object-cover rounded-2xl border border-[#E8DFCE] mx-auto shadow-xs"
                />
                <p className="text-xs font-bold text-[#1E4B8A] flex items-center justify-center gap-1">
                  <span>Tap to choose another image</span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#1E4B8A]/10 text-[#1E4B8A] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#0F2138]">
                  Upload or Photograph Educational Material
                </h3>
                <p className="text-xs text-[#0F2138]/65 max-w-sm mx-auto leading-relaxed">
                  Textbook pages, blackboard sketches, mind maps, or specimen photos. Gemini 1.5 Flash classifies the subject and extracts a 3-question active recall test.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] text-xs font-semibold text-[#1E4B8A]">
                    <Camera className="w-3.5 h-3.5" />
                    Open Camera / Browse Files
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Processing state */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] text-center space-y-2 animate-in fade-in">
              <Loader2 className="w-6 h-6 text-[#1E4B8A] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#0F2138]">
                Gemini 1.5 Flash is analyzing your image...
              </p>
              <p className="text-[11px] text-[#0F2138]/60">
                Classifying cognitive subject and synthesizing active retrieval questions
              </p>
            </div>
          )}

          {/* Analysis Result Card */}
          {analysisResult && !isProcessing && (
            <div className="rounded-3xl bg-[#FAF6ED] p-5 sm:p-6 border border-[#D4AF37]/50 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E8DFCE]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                    Optical Classification
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0F2138]">
                    {analysisResult.classification}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#0F2138]/80 leading-relaxed font-serif">
                {analysisResult.summary}
              </p>

              <div className="p-3 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE]">
                <p className="text-xs font-semibold text-[#1E4B8A]">
                  {analysisResult.quiz.length} Interactive active recall questions prepared.
                </p>
              </div>

              <button
                onClick={() =>
                  onStartCustomQuiz({
                    title: analysisResult.classification,
                    quiz: analysisResult.quiz,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] px-5 py-3 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Launch Extracted Quiz Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Synthesizer Mode */}
      {activeMode === 'generate' && (
        <form onSubmit={handleGenerateTopic} className="space-y-4">
          <div className="rounded-3xl bg-[#FAF6ED] p-5 sm:p-6 border border-[#E8DFCE] space-y-4">
            <div>
              <label htmlFor="topic-input" className="block text-xs font-bold text-[#0F2138] uppercase tracking-wider mb-1">
                Enter Any Academic Inquiry or Curiosity
              </label>
              <p className="text-xs text-[#0F2138]/65 mb-3">
                Examples: "Photosynthesis light-dependent reaction", "Roman cement pozzolanic ash", "Game Theory Nash Equilibrium", "Claude Shannon Information Entropy"
              </p>
              <input
                id="topic-input"
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g., The Physics of Origami Folding..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-sm text-[#0F2138] placeholder:text-[#0F2138]/40 min-h-[48px]"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] text-[#0F2138]/60 font-semibold self-center">
                Quick Prompts:
              </span>
              {[
                'Japanese Shinto Architecture',
                'CRISPR Gene Editing',
                'Kintsugi & Resilience',
                'Fermi Paradox',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setTopicInput(suggestion)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F4EEE0] hover:bg-[#E8DFCE] text-[11px] font-medium text-[#1E4B8A] border border-[#E8DFCE] transition-all min-h-[36px]"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!topicInput.trim() || isProcessing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] disabled:opacity-50 px-5 py-3 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Synthesizing Micro-Lesson with Gemini...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>Generate Scholarly Micro-Lesson & Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
