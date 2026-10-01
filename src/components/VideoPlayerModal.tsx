import React from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { EducationalVideo } from '../services/youtubeService';

interface VideoPlayerModalProps {
  video: EducationalVideo | null;
  onClose: () => void;
  onGenerateQuizFromTopic: (topic: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onGenerateQuizFromTopic,
}) => {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-t-3xl sm:rounded-3xl bg-[#FAF6ED] p-4 sm:p-6 shadow-2xl border border-[#E8DFCE] flex flex-col text-[#0F2138] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base text-[#1E4B8A] font-bold">映 · Micro-Lecture</span>
            <span className="text-xs text-[#0F2138]/60 font-medium">{video.category}</span>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[#E8DFCE] flex items-center justify-center text-[#0F2138]/60 hover:text-[#0F2138] touch-target-48 min-w-[48px] min-h-[48px]"
            aria-label="Close lecture"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player (Responsive 16:9 iframe) */}
        <div className="my-3 relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-md border border-[#E8DFCE]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&modestbranding=1&rel=0`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Details */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#0F2138] leading-snug">
            {video.title}
          </h2>
          <div className="flex items-center justify-between text-xs text-[#0F2138]/70">
            <span className="font-semibold text-[#1E4B8A]">{video.channelTitle}</span>
            <span>Duration: {video.durationTag}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#0F2138]/80 leading-relaxed font-serif pt-1">
            {video.description}
          </p>
        </div>

        {/* Action Bar */}
        <div className="mt-4 pt-3 border-t border-[#E8DFCE] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E8DFCE] bg-[#F4EEE0] hover:bg-[#E8DFCE] px-3.5 py-2.5 text-xs font-semibold text-[#0F2138] transition-all min-h-[48px] touch-target-48"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              onClose();
              onGenerateQuizFromTopic(video.title);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] px-4 py-2.5 text-xs font-bold text-white shadow transition-all min-h-[48px] touch-target-48"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Extract AI Quiz from this Lecture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
