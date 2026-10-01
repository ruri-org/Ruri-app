import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Send,
  X,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Smile,
  BookOpen,
  MessageCircle,
  ThumbsUp,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserStats } from '../services/storageService';

export interface PeerUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  dailyQuizCompleted: boolean;
  todayScore: string; // e.g. "9/10"
  accuracy: number; // e.g. 90
  streak: number;
  completedTopics: string[];
  unreadCount: number;
  latestMessage: {
    text: string;
    timestamp: string;
    isSelf: boolean;
  };
  messages: Array<{
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
  }>;
}

const INITIAL_PEERS: PeerUser[] = [
  {
    id: 'peer_1',
    name: 'Hana Takahashi',
    username: 'hana_bio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isOnline: true,
    dailyQuizCompleted: true,
    todayScore: '10/10',
    accuracy: 100,
    streak: 12,
    completedTopics: ['AP Biology: Chemiosmosis', 'Cellular Respiration: ATP Synthase'],
    unreadCount: 2,
    latestMessage: {
      text: 'Did you review the chemiosmosis proton-motive force drill? Question 3 was great!',
      timestamp: '2m ago',
      isSelf: false,
    },
    messages: [
      {
        id: 'm1',
        senderId: 'peer_1',
        text: 'Hey! Are you studying for the AP Biology checkpoint tonight?',
        timestamp: '14:20',
      },
      {
        id: 'm2',
        senderId: 'self',
        text: 'Yes! Just completed the video clip on ATP Synthase.',
        timestamp: '14:22',
      },
      {
        id: 'm3',
        senderId: 'peer_1',
        text: 'Did you review the chemiosmosis proton-motive force drill? Question 3 was great!',
        timestamp: '14:25',
      },
    ],
  },
  {
    id: 'peer_2',
    name: 'Kenji Sato',
    username: 'kenji_sat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isOnline: true,
    dailyQuizCompleted: true,
    todayScore: '8/10',
    accuracy: 85,
    streak: 6,
    completedTopics: ['SAT Math: Quadratic Equations', 'Circle Vertex & Radian Measure'],
    unreadCount: 1,
    latestMessage: {
      text: 'The quadratic vertex formula shortcut saved me so much time!',
      timestamp: '15m ago',
      isSelf: false,
    },
    messages: [
      {
        id: 'm4',
        senderId: 'peer_2',
        text: 'The quadratic vertex formula shortcut saved me so much time!',
        timestamp: '14:10',
      },
    ],
  },
  {
    id: 'peer_3',
    name: 'Elena Rostova',
    username: 'elena_chem',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    isOnline: false,
    dailyQuizCompleted: false,
    todayScore: 'Pending',
    accuracy: 0,
    streak: 4,
    completedTopics: ['IGCSE Chemistry: Covalent Lattices (In Progress)'],
    unreadCount: 0,
    latestMessage: {
      text: "Let's review the giant covalent lattice questions together later.",
      timestamp: '1h ago',
      isSelf: false,
    },
    messages: [
      {
        id: 'm5',
        senderId: 'peer_3',
        text: "Let's review the giant covalent lattice questions together later.",
        timestamp: '13:30',
      },
    ],
  },
  {
    id: 'peer_4',
    name: 'Marcus Vance',
    username: 'marcus_ap',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isOnline: true,
    dailyQuizCompleted: true,
    todayScore: '9/10',
    accuracy: 92,
    streak: 18,
    completedTopics: ['AP Physics: Newton’s 1st & 3rd Laws', 'Free-Body Diagrams'],
    unreadCount: 0,
    latestMessage: {
      text: 'Sent you the free-body diagram derivation breakdown.',
      timestamp: '3h ago',
      isSelf: true,
    },
    messages: [
      {
        id: 'm6',
        senderId: 'self',
        text: 'Sent you the free-body diagram derivation breakdown.',
        timestamp: '11:15',
      },
    ],
  },
  {
    id: 'peer_5',
    name: 'Dr. Hiroshi Arisawa',
    username: 'sensei_arisawa',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    isOnline: false,
    dailyQuizCompleted: true,
    todayScore: '10/10',
    accuracy: 100,
    streak: 45,
    completedTopics: ['Academic Advisory: Spaced Retrieval Mastery'],
    unreadCount: 0,
    latestMessage: {
      text: 'Remarkable accuracy on today’s retrieval checkpoints, scholar.',
      timestamp: '5h ago',
      isSelf: false,
    },
    messages: [
      {
        id: 'm7',
        senderId: 'peer_5',
        text: 'Remarkable accuracy on today’s retrieval checkpoints, scholar.',
        timestamp: '09:40',
      },
    ],
  },
];

interface SocialMessagingScreenProps {
  stats: UserStats;
}

export const SocialMessagingScreen: React.FC<SocialMessagingScreenProps> = ({ stats }) => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<PeerUser[]>(INITIAL_PEERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Peer for Full-screen Story / Quiz Status Overlay
  const [activeStoryPeer, setActiveStoryPeer] = useState<PeerUser | null>(null);
  const [congratulatedPeers, setCongratulatedPeers] = useState<{ [id: string]: boolean }>({});

  // Selected Peer for Direct P2P Messaging Interface
  const [activeChatPeer, setActiveChatPeer] = useState<PeerUser | null>(null);
  const [chatInputText, setChatInputText] = useState('');

  // Add Student / Teacher Modal
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newHandleInput, setNewHandleInput] = useState('');

  // User Self Daily Quiz Score
  const userTodayScore = stats.quizzesTaken > 0 ? `${stats.totalCorrectAnswers % 10 || 8}/10` : '8/10';

  // Filtered peers based on search
  const filteredPeers = peers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.completedTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Send a message in active chat
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim() || !activeChatPeer) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'self',
      text: chatInputText.trim(),
      timestamp: 'Just now',
    };

    const updatedPeers = peers.map((p) => {
      if (p.id === activeChatPeer.id) {
        return {
          ...p,
          messages: [...p.messages, newMsg],
          latestMessage: {
            text: newMsg.text,
            timestamp: 'Just now',
            isSelf: true,
          },
          unreadCount: 0,
        };
      }
      return p;
    });

    setPeers(updatedPeers);
    setActiveChatPeer({
      ...activeChatPeer,
      messages: [...activeChatPeer.messages, newMsg],
      latestMessage: {
        text: newMsg.text,
        timestamp: 'Just now',
        isSelf: true,
      },
    });
    setChatInputText('');
  };

  // Congratulate a peer
  const handleCongratulate = (peerId: string) => {
    setCongratulatedPeers((prev) => ({ ...prev, [peerId]: true }));
    // Append auto cheer message to chat thread
    const cheerMsg = {
      id: `msg_cheer_${Date.now()}`,
      senderId: 'self',
      text: '🎉 Outstanding work completing today’s quiz with high mastery! +10 Scholarly Cheer sent!',
      timestamp: 'Just now',
    };

    setPeers((prev) =>
      prev.map((p) => {
        if (p.id === peerId) {
          return {
            ...p,
            messages: [...p.messages, cheerMsg],
            latestMessage: {
              text: cheerMsg.text,
              timestamp: 'Just now',
              isSelf: true,
            },
          };
        }
        return p;
      })
    );
  };

  // Add new peer
  const handleAddPeer = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = newHandleInput.trim().replace(/^@/, '');
    if (!handle) return;

    const newPeer: PeerUser = {
      id: `peer_${Date.now()}`,
      name: handle.charAt(0).toUpperCase() + handle.slice(1),
      username: handle.toLowerCase(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
      dailyQuizCompleted: true,
      todayScore: '9/10',
      accuracy: 90,
      streak: 3,
      completedTopics: ['Curriculum Onboarding Diagnostic'],
      unreadCount: 1,
      latestMessage: {
        text: 'Connected on Ruri! Ready for daily study drills.',
        timestamp: 'Just now',
        isSelf: false,
      },
      messages: [
        {
          id: `m_init_${Date.now()}`,
          senderId: `peer_${Date.now()}`,
          text: 'Connected on Ruri! Ready for daily study drills.',
          timestamp: 'Just now',
        },
      ],
    };

    setPeers([newPeer, ...peers]);
    setNewHandleInput('');
    setShowAddPersonModal(false);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-200 text-[#0F2138]">
      {/* 
        TOP SEARCH BAR:
        - Container: Surface Container High (#E8DFCE), 56px height, rounded-full shape (9999dp).
        - Leading Ruri Blue (#1E4B8A) search icon.
        - Trailing add-person icon.
      */}
      <div className="relative flex items-center">
        <div className="w-full h-14 min-h-[56px] rounded-full bg-[#E8DFCE] px-4 flex items-center gap-3 border border-[#E8DFCE] focus-within:border-[#1E4B8A] focus-within:bg-[#FAF6ED] transition-colors shadow-2xs">
          {/* Leading Ruri Blue (#1E4B8A) search icon */}
          <Search className="w-5 h-5 text-[#1E4B8A] shrink-0" />

          {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, teachers, or add username..."
            className="flex-1 bg-transparent border-none outline-hidden text-xs sm:text-sm text-[#0F2138] placeholder:text-[#0F2138]/50 font-body"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-[#0F2138]/50 hover:text-[#0F2138]"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Trailing Add-Person Icon Button: 48x48 touch target */}
          <button
            type="button"
            onClick={() => setShowAddPersonModal(true)}
            className="w-10 h-10 rounded-full hover:bg-[#FAF6ED] text-[#1E4B8A] flex items-center justify-center transition-colors touch-target-48 min-w-[40px] min-h-[40px] shrink-0"
            title="Add student or teacher"
            aria-label="Add student or teacher"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 
        INSTAGRAM-STYLE STATUS / STORY CAROUSEL:
        - Header: "Daily Quiz Status" (Label Medium: 12px, #1E4B8A).
        - Container: Horizontal scrolling row (gap: 16px, 16px side margins).
        - Story Circles (80x80px total component area):
          * First Circle (User Self): "My Status" avatar with today's quiz score badge in Kogane Gold (#D4AF37).
          * Peer Circles: Student Avatar framed with M3 Dynamic Expressive Ring:
            - Kogane Gold (#D4AF37) border if daily quizzes completed.
            - Muted Ruri/Grey border if daily quizzes pending.
          * Label: Username below circle (Label Small: Plus Jakarta Sans 11px).
      */}
      <section aria-label="Daily Quiz Status Carousel" className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className="font-semibold uppercase tracking-wider text-[#1E4B8A]"
            style={{
              fontSize: '12px',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            Daily Quiz Status
          </span>
          <span className="text-[11px] text-[#0F2138]/60 font-medium">
            Tap circle to inspect student mastery
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar px-1">
          {/* First Circle: User Self ("My Status") */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-20">
            <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-[#D4AF37] flex items-center justify-center bg-[#FAF6ED] shadow-2xs">
              <div className="w-full h-full rounded-full bg-[#1E4B8A] overflow-hidden flex items-center justify-center text-white font-serif font-bold text-lg">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'You'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  '瑠'
                )}
              </div>

              {/* Score / + Badge in Kogane Gold (#D4AF37) */}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0F2138] text-[10px] font-bold shadow-xs border border-white">
                {userTodayScore}
              </span>
            </div>
            <span
              className="text-[#0F2138] font-bold text-center truncate w-full"
              style={{
                fontSize: '11px',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}
            >
              My Status
            </span>
          </div>

          {/* Peer Story Circles */}
          {peers.map((peer) => {
            const hasCompleted = peer.dailyQuizCompleted;

            return (
              <button
                key={peer.id}
                onClick={() => setActiveStoryPeer(peer)}
                className="group flex flex-col items-center gap-1 shrink-0 w-20 touch-target-48 cursor-pointer focus:outline-hidden"
              >
                {/* 
                  M3 Dynamic Expressive Ring:
                  - Kogane Gold (#D4AF37) gradient ring if daily quizzes completed.
                  - Muted Ruri/Grey border if daily quizzes pending.
                */}
                <div
                  className={`relative w-16 h-16 rounded-full p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${
                    hasCompleted
                      ? 'bg-linear-to-tr from-[#D4AF37] via-[#FAF6ED] to-[#1E4B8A] p-[2.5px]'
                      : 'border-2 border-slate-300 bg-[#FAF6ED]'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden border border-white/50">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Online dot */}
                  {peer.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#F4EEE0]" />
                  )}

                  {/* Completed Check badge */}
                  {hasCompleted && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0F2138] flex items-center justify-center text-[9px] font-bold border border-white">
                      ✓
                    </span>
                  )}
                </div>

                {/* Label: Username below circle (Label Small: 11px) */}
                <span
                  className="text-[#0F2138]/85 text-center truncate w-full transition-colors group-hover:text-[#1E4B8A]"
                  style={{
                    fontSize: '11px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  @{peer.username}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 
        MESSAGING CHAT LIST (BELOW STORIES):
        - Structure: Vertical list of recent direct message threads sorted by recency (latest message top).
        - Chat Item Row: M3 List Item component, 72px min height, background: #FAF6ED.
          * Leading: Peer Avatar (40x40px) + Online/Offline indicator dot.
          * Center Stack: Peer Display Name + Handle (@username), preview of latest message text (Body Medium: 14px, #0F2138).
          * Trailing Stack: Time indicator (e.g. "2m ago") + Unread message badge in Ruri Blue (#1E4B8A) with white text.
          * Action: Tapping opens direct P2P messaging interface.
      */}
      <section aria-label="Direct Message Threads" className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E4B8A] flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-[#1E4B8A]" />
            Scholarly Direct Threads
          </h2>
          <span className="text-xs text-[#0F2138]/60">{filteredPeers.length} Discussions</span>
        </div>

        <div className="space-y-2">
          {filteredPeers.map((peer) => (
            <div
              key={peer.id}
              onClick={() => {
                setActiveChatPeer(peer);
                // Mark as read
                setPeers((prev) =>
                  prev.map((p) => (p.id === peer.id ? { ...p, unreadCount: 0 } : p))
                );
              }}
              className="cursor-pointer rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] hover:border-[#1E4B8A]/40 hover:shadow-xs p-3.5 transition-all flex items-center justify-between gap-3 min-h-[72px] touch-target-48"
            >
              {/* Leading: Peer Avatar (40x40px) + Online/Offline indicator dot */}
              <div className="relative w-10 h-10 rounded-full shrink-0">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E8DFCE]"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#FAF6ED] ${
                    peer.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>

              {/* Center Stack: Peer Display Name + Handle (@username), preview of latest message text */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#0F2138] truncate">{peer.name}</h3>
                  <span className="text-[11px] text-[#0F2138]/50 truncate">@{peer.username}</span>
                </div>

                <p
                  className="text-[#0F2138]/80 truncate mt-0.5"
                  style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >
                  {peer.latestMessage.isSelf && <span className="font-semibold text-[#1E4B8A]">You: </span>}
                  {peer.latestMessage.text}
                </p>
              </div>

              {/* Trailing Stack: Time indicator + Unread message badge in Ruri Blue (#1E4B8A) with white text */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] text-[#0F2138]/50 whitespace-nowrap">
                  {peer.latestMessage.timestamp}
                </span>

                {peer.unreadCount > 0 ? (
                  <span className="w-5 h-5 rounded-full bg-[#1E4B8A] text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                    {peer.unreadCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8B6E0B] font-semibold">
                    {peer.todayScore}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        FULL-SCREEN STATUS / STORY OVERLAY:
        Opens full-screen status overlay showing peer's daily quiz stats, completed topics, and direct "Congratulate" button.
      */}
      {activeStoryPeer && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveStoryPeer(null)}
        >
          <div
            className="w-full max-w-[380px] rounded-3xl bg-[#FAF6ED] border-2 border-[#D4AF37] p-6 shadow-2xl flex flex-col text-[#0F2138] space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setActiveStoryPeer(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#F4EEE0] text-[#0F2138]/70 hover:text-[#0F2138] touch-target-48"
              aria-label="Close story status"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Peer Profile Header */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37] overflow-hidden p-0.5">
                <img
                  src={activeStoryPeer.avatar}
                  alt={activeStoryPeer.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0F2138]">{activeStoryPeer.name}</h3>
                <p className="text-xs text-[#1E4B8A] font-semibold">@{activeStoryPeer.username}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8B6E0B] font-bold mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{activeStoryPeer.streak} Day Continuous Streak</span>
                </div>
              </div>
            </div>

            {/* Daily Quiz Result Status Card */}
            <div className="rounded-2xl bg-[#F4EEE0] p-4 border border-[#E8DFCE] space-y-2">
              <span className="text-[11px] font-bold text-[#1E4B8A] uppercase tracking-wider block">
                Today’s Quiz Diagnostic Result
              </span>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#D4AF37]/50">
                  <span className="text-[10px] text-[#0F2138]/60 font-semibold block">Score</span>
                  <span className="text-lg font-bold text-[#1E4B8A]">
                    {activeStoryPeer.todayScore}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#D4AF37]/50">
                  <span className="text-[10px] text-[#0F2138]/60 font-semibold block">Accuracy</span>
                  <span className="text-lg font-bold text-[#8B6E0B]">
                    {activeStoryPeer.accuracy}%
                  </span>
                </div>
              </div>
            </div>

            {/* Completed Topics list */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0F2138] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#1E4B8A]" />
                Completed Modules Today:
              </span>
              <div className="space-y-1">
                {activeStoryPeer.completedTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] text-xs text-[#0F2138]/85 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct "Congratulate" Action Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleCongratulate(activeStoryPeer.id)}
                disabled={congratulatedPeers[activeStoryPeer.id]}
                className="w-full py-3 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] disabled:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 touch-target-48 min-h-[48px] cursor-pointer"
              >
                {congratulatedPeers[activeStoryPeer.id] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    <span>Scholarly Cheer Sent! (+10 XP)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Congratulate Peer</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const peer = activeStoryPeer;
                  setActiveStoryPeer(null);
                  setActiveChatPeer(peer);
                }}
                className="w-full py-2.5 rounded-full bg-[#F4EEE0] border border-[#E8DFCE] text-[#0F2138] font-semibold text-xs hover:bg-[#E8DFCE] transition-all touch-target-48"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        DIRECT P2P MESSAGING INTERFACE MODAL:
        Full-featured messaging view with back navigation, real-time message bubbles, and input area.
      */}
      {activeChatPeer && (
        <div className="fixed inset-0 z-50 bg-[#F4EEE0] flex flex-col justify-between animate-in slide-in-from-bottom duration-200">
          {/* Chat Header */}
          <div className="safe-top bg-[#FAF6ED] border-b border-[#E8DFCE] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatPeer(null)}
                className="p-2 rounded-full hover:bg-[#E8DFCE] text-[#0F2138] touch-target-48 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Back to chat list"
              >
                <ArrowLeft className="w-5 h-5 text-[#1E4B8A]" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full">
                  <img
                    src={activeChatPeer.avatar}
                    alt={activeChatPeer.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#D4AF37]"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                      activeChatPeer.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0F2138]">{activeChatPeer.name}</h3>
                  <p className="text-[11px] text-[#0F2138]/60">
                    @{activeChatPeer.username} · {activeChatPeer.todayScore} Today
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStoryPeer(activeChatPeer)}
              className="px-3 py-1.5 rounded-full bg-[#FAF6ED] border border-[#D4AF37] text-xs font-bold text-[#8B6E0B] shadow-2xs hover:bg-[#D4AF37]/10"
            >
              Quiz Status
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-xl mx-auto w-full">
            <div className="text-center py-2">
              <span className="text-[10px] uppercase font-bold text-[#0F2138]/40 tracking-wider">
                Encrypted Scholarly Communication
              </span>
            </div>

            {activeChatPeer.messages.map((msg) => {
              const isSelf = msg.senderId === 'self';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isSelf
                        ? 'bg-[#1E4B8A] text-white rounded-br-xs'
                        : 'bg-[#FAF6ED] border border-[#E8DFCE] text-[#0F2138] rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-[#0F2138]/40 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="safe-bottom bg-[#FAF6ED] border-t border-[#E8DFCE] p-3 max-w-xl mx-auto w-full">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder={`Message @${activeChatPeer.username}...`}
                className="flex-1 px-4 py-3 rounded-full bg-[#F4EEE0] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-xs sm:text-sm text-[#0F2138] placeholder:text-[#0F2138]/45 min-h-[48px]"
              />

              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="w-12 h-12 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all touch-target-48 min-w-[48px] min-h-[48px]"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-[#D4AF37]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 
        ADD STUDENT / TEACHER MODAL:
        Triggered by trailing add-person icon in top search bar.
      */}
      {showAddPersonModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAddPersonModal(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-3xl bg-[#FAF6ED] border border-[#E8DFCE] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFCE]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E4B8A]" />
                <h3 className="text-sm font-bold text-[#0F2138]">Add Student or Teacher</h3>
              </div>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="p-1 rounded-full text-[#0F2138]/60 hover:text-[#0F2138]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPeer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F2138]/70 mb-1">
                  Scholarly Handle (@username)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-[#1E4B8A]">@</span>
                  <input
                    type="text"
                    value={newHandleInput}
                    onChange={(e) => setNewHandleInput(e.target.value)}
                    placeholder="e.g. maria_ap_physics"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-xs text-[#0F2138] min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newHandleInput.trim()}
                className="w-full py-3 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] disabled:opacity-40 text-white font-bold text-xs shadow transition-all min-h-[48px] touch-target-48"
              >
                Connect Scholar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
