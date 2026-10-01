import React from 'react';
import { Home, HelpCircle, MessageSquare } from 'lucide-react';

export type NavTab = 'home' | 'quizzes' | 'messages';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  unreadCount = 2,
}) => {
  const destinations = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'quizzes' as NavTab,
      label: 'Quizzes',
      icon: HelpCircle,
    },
    {
      id: 'messages' as NavTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Persistent Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#F4EEE0] border-t border-[#E8DFCE] h-20 min-h-[80px] pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(15,33,56,0.06)]"
    >
      {/* Centered M3 Navigation Bar Container */}
      <div className="w-full max-w-[540px] md:max-w-[720px] h-full mx-auto px-4 flex items-center justify-between">
        {destinations.map((dest) => {
          const isActive = activeTab === dest.id;
          const Icon = dest.icon;

          return (
            <button
              key={dest.id}
              onClick={() => onSelectTab(dest.id)}
              aria-selected={isActive}
              className="flex-1 w-full h-full flex flex-col items-center justify-center gap-1 group cursor-pointer focus:outline-hidden touch-target-48 min-w-[48px] min-h-[48px]"
            >
              {/* 
                ACTIVE PILL INDICATOR:
                - Ruri Blue (#1E4B8A) animated active container pill with white active icon.
                - Inactive: Muted Lapis (#1E4B8A at 60% opacity).
              */}
              <div
                className={`relative w-16 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1E4B8A] text-white shadow-xs scale-100'
                    : 'bg-transparent text-[#1E4B8A]/60 group-hover:text-[#1E4B8A] group-hover:bg-[#E8DFCE]/40'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-white' : 'text-[#1E4B8A]/60 group-hover:text-[#1E4B8A]'
                  }`}
                />

                {/* Unread badge on Messages */}
                {dest.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0F2138] text-[10px] font-bold shadow-xs border border-white">
                    {dest.badge}
                  </span>
                )}
              </div>

              {/* 
                TEXT LABELS:
                - Plus Jakarta Sans 12px Label Medium.
                - Active: #1E4B8A font-bold.
                - Inactive: #1E4B8A at 60% opacity.
              */}
              <span
                className={`transition-colors duration-200 ${
                  isActive ? 'text-[#1E4B8A] font-bold' : 'text-[#1E4B8A]/60 group-hover:text-[#1E4B8A]'
                }`}
                style={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {dest.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
