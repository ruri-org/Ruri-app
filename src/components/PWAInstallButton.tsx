import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install Ruri Progressive Web App"
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E4B8A] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#163a6c] active:scale-[0.98] transition-all min-h-[48px] touch-target-48 ${
          compact ? 'px-3' : 'px-4'
        }`}
      >
        <Download className="w-4 h-4 text-[#D4AF37]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install Ruri on iOS"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#FAF6ED] px-3.5 py-2 text-xs font-semibold text-[#1E4B8A] hover:bg-[#E8DFCE] active:scale-[0.98] transition-all min-h-[48px] touch-target-48"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-3xl bg-[#FAF6ED] p-6 shadow-2xl border border-[#E8DFCE] text-[#0F2138]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFCE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1E4B8A] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                    瑠
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F2138]">Install Ruri (瑠璃)</h3>
                    <p className="text-xs text-[#0F2138]/70">For iPhone & iPad</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#E8DFCE] text-[#0F2138]/60 hover:text-[#0F2138]"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-[#0F2138]">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE]">
                  <div className="w-8 h-8 rounded-full bg-[#1E4B8A]/10 text-[#1E4B8A] flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Tap the Share Icon</p>
                    <p className="text-xs text-[#0F2138]/75 mt-0.5 flex items-center gap-1">
                      Located in your Safari toolbar (<Share2 className="w-3.5 h-3.5 inline text-[#1E4B8A]" />).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE]">
                  <div className="w-8 h-8 rounded-full bg-[#1E4B8A]/10 text-[#1E4B8A] flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Select "Add to Home Screen"</p>
                    <p className="text-xs text-[#0F2138]/75 mt-0.5 flex items-center gap-1">
                      Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-[#1E4B8A]" /> Add to Home Screen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F4EEE0] border border-[#E8DFCE]">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#8B6E0B] flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Enjoy Fullscreen Scholarly App</p>
                    <p className="text-xs text-[#0F2138]/75 mt-0.5">
                      Launch Ruri with offline capability and instant micro-learning.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[48px] rounded-xl bg-[#1E4B8A] py-3 text-xs font-bold text-white shadow hover:bg-[#163a6c] active:scale-[0.98] transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
