import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto flex items-center justify-between gap-3 rounded-2xl bg-[#0F2138] px-4 py-3 text-xs font-medium text-[#FAF6ED] shadow-xl border border-[#D4AF37]/40 animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 text-[#D4AF37] shrink-0" />
        <div>
          <span className="font-bold text-[#F4EEE0]">Offline Mode Active</span>
          <p className="text-[11px] text-[#FAF6ED]/70">Using local cache & study materials</p>
        </div>
      </div>
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
    </div>
  );
};
