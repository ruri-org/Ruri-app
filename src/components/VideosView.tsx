import React, { useState, useEffect } from 'react';
import { Search, Play, Sparkles, Filter, Loader2, PlaySquare, ArrowRight } from 'lucide-react';
import {
  EducationalVideo,
  searchEducationalVideos,
  getCuratedVideos,
} from '../services/youtubeService';

interface VideosViewProps {
  onSelectVideo: (video: EducationalVideo) => void;
  onGenerateQuizFromTopic: (topic: string) => void;
  onOpenShortsFeed?: () => void;
}

export const VideosView: React.FC<VideosViewProps> = ({
  onSelectVideo,
  onGenerateQuizFromTopic,
  onOpenShortsFeed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [videos, setVideos] = useState<EducationalVideo[]>(getCuratedVideos());
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'All',
    'Architecture',
    'Physics',
    'Cognitive Science',
    'History',
    'Mathematics',
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const results = await searchEducationalVideos(searchQuery || 'micro learning');
      setVideos(results);
    } catch (err) {
      console.error('Video search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'All') {
      setVideos(getCuratedVideos());
    } else {
      const filtered = getCuratedVideos().filter((v) => v.category === activeCategory);
      setVideos(filtered.length > 0 ? filtered : getCuratedVideos());
    }
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl text-[#1E4B8A] font-bold">映</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F2138]">
            Scholarly Micro-Lectures
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#0F2138]/70 mt-1 leading-relaxed">
          Powered by YouTube Data API v3. Distilled 2–5 minute academic audiovisuals covering master craft, theoretical physics, cognitive science, and ancient philosophy.
        </p>
      </div>

      {/* Immersive Vertical Reels / Shorts Feed Launch Banner */}
      {onOpenShortsFeed && (
        <div
          onClick={onOpenShortsFeed}
          className="group cursor-pointer rounded-3xl bg-linear-to-r from-[#1E4B8A] via-[#163a6c] to-[#0F2138] p-4 sm:p-5 text-white shadow-lg border border-[#D4AF37]/50 hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
        >
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:scale-105 transition-transform">
              <PlaySquare className="w-6 h-6 fill-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#D4AF37]">
                  Reels & Shorts Feed
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Textbook Curated
                </span>
              </div>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                Launch Fullscreen Vertical Feed
              </h3>
              <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                30–90s micro-lessons with diagnostic concept checks every 10 clips.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="z-10 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2e] text-[#0F2138] font-bold text-xs shadow-md transition-all shrink-0 min-h-[44px] flex items-center justify-center gap-1.5 touch-target-48 cursor-pointer"
          >
            <span>Watch Shorts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics (e.g. quantum entanglement, carpentry, neural plasticity)..."
          className="w-full pl-11 pr-24 py-3 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-xs sm:text-sm text-[#0F2138] placeholder:text-[#0F2138]/45 min-h-[48px]"
        />
        <Search className="absolute left-4 w-4 h-4 text-[#0F2138]/50" />
        <button
          type="submit"
          className="absolute right-1.5 px-4 py-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] text-white text-xs font-bold transition-all min-h-[38px]"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Category Filter bar (Interactive segmented button control) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-[#0F2138]/60 flex items-center gap-1 pl-1 pr-2 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] touch-target-48 flex items-center justify-center ${
              activeCategory === cat
                ? 'bg-[#1E4B8A] text-white shadow-xs'
                : 'bg-[#FAF6ED] text-[#0F2138]/75 border border-[#E8DFCE] hover:bg-[#E8DFCE]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => onSelectVideo(vid)}
            className="group cursor-pointer rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] hover:border-[#1E4B8A]/40 hover:shadow-md transition-all flex flex-col overflow-hidden"
          >
            {/* Thumbnail banner with duration tag */}
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#1E4B8A]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Duration badge */}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-semibold text-white">
                {vid.durationTag}
              </span>
            </div>

            {/* Video metadata */}
            <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
              <div>
                <span className="text-[11px] font-medium text-[#1E4B8A]">
                  {vid.channelTitle} · {vid.category}
                </span>
                <h3 className="text-sm font-bold text-[#0F2138] group-hover:text-[#1E4B8A] transition-colors line-clamp-2 mt-0.5 leading-snug">
                  {vid.title}
                </h3>
                <p className="mt-1 text-xs text-[#0F2138]/70 line-clamp-2 leading-relaxed">
                  {vid.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8DFCE] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1E4B8A] group-hover:underline">
                  Watch Lecture
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateQuizFromTopic(vid.title);
                  }}
                  title="Generate Quiz from this video topic"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F4EEE0] hover:bg-[#E8DFCE] text-[11px] font-semibold text-[#8B6E0B] border border-[#D4AF37]/40 min-h-[36px]"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>AI Quiz</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
