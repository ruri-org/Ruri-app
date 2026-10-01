import React from 'react';

export const WelcomeGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden select-none">
      {/* Background radial glow & traditional scholarly circle motif */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Soft golden halo */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-radial from-[#D4AF37]/15 via-[#FAF6ED] to-transparent blur-xl" />
        {/* Subtle Japanese scholarly concentric circles */}
        <div className="w-64 h-64 rounded-full border border-[#D4AF37]/25 border-dashed animate-spin-slow opacity-60" />
        <div className="w-52 h-52 rounded-full border border-[#1E4B8A]/15 opacity-40" />
      </div>

      {/* Main SVG Vector Stage */}
      <svg
        viewBox="0 0 393 360"
        className="relative z-10 w-full max-w-[393px] h-full max-h-[360px] drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#255BB0" />
            <stop offset="100%" stop-color="#143666" />
          </linearGradient>
          <linearGradient id="goldLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF3C4" />
            <stop offset="40%" stop-color="#D4AF37" />
            <stop offset="100%" stop-color="#9E7C10" />
          </linearGradient>
          <linearGradient id="pencilWood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E8B878" />
            <stop offset="100%" stop-color="#C28E4A" />
          </linearGradient>
          <filter id="gentleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F2138" flood-opacity="0.14" />
          </filter>
        </defs>

        {/* 1. ATOM ORBITAL LOOPS (Physics & Science) */}
        <g className="origin-center animate-spin-orbital">
          {/* Orbital Ellipse 1 */}
          <ellipse
            cx="196"
            cy="175"
            rx="115"
            ry="48"
            transform="rotate(-28 196 175)"
            stroke="#1E4B8A"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            opacity="0.45"
          />
          {/* Orbiting Electron Particle 1 */}
          <circle cx="95" cy="130" r="4.5" fill="#D4AF37" filter="url(#gentleShadow)" />
          <circle cx="95" cy="130" r="1.5" fill="#FFFFFF" />

          {/* Orbital Ellipse 2 */}
          <ellipse
            cx="196"
            cy="175"
            rx="115"
            ry="48"
            transform="rotate(38 196 175)"
            stroke="#D4AF37"
            strokeWidth="1.8"
            opacity="0.45"
          />
          {/* Orbiting Electron Particle 2 */}
          <circle cx="285" cy="140" r="4" fill="#1E4B8A" filter="url(#gentleShadow)" />
          <circle cx="285" cy="140" r="1.5" fill="#FFFFFF" />
        </g>

        {/* 2. FLOATING OPEN SCHOLARLY BOOK WITH GOLD LEAF ACCENTS */}
        <g filter="url(#gentleShadow)" className="animate-float-slow origin-center">
          {/* Lower Book / Pages Shadow Platform */}
          <path
            d="M125 210 C155 198 185 204 196 212 C207 204 237 198 267 210 L267 232 C237 220 207 226 196 234 C185 226 155 220 125 232 Z"
            fill="#E8DFCE"
          />
          {/* Hardbound Cover Edge (Ruri Blue & Gold) */}
          <path
            d="M122 212 C154 200 185 206 196 215 C207 206 238 200 270 212 L270 220 C238 208 207 214 196 222 C185 214 154 208 122 220 Z"
            fill="url(#goldLeafGrad)"
          />

          {/* Open Left Book Page (Oyster-white Gofun) */}
          <path
            d="M126 208 C155 196 186 201 196 211 L196 142 C186 132 155 127 126 139 Z"
            fill="#FAF6ED"
            stroke="#E8DFCE"
            strokeWidth="1.5"
          />
          {/* Open Right Book Page */}
          <path
            d="M266 208 C237 196 206 201 196 211 L196 142 C206 132 237 127 266 139 Z"
            fill="#FFFFFF"
            stroke="#E8DFCE"
            strokeWidth="1.5"
          />

          {/* Book Spine Center Line */}
          <line x1="196" y1="142" x2="196" y2="212" stroke="#1E4B8A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Gold Leaf Edging along page corners */}
          <path
            d="M126 139 L134 142 L134 205 L126 208 Z"
            fill="url(#goldLeafGrad)"
            opacity="0.85"
          />
          <path
            d="M266 139 L258 142 L258 205 L266 208 Z"
            fill="url(#goldLeafGrad)"
            opacity="0.85"
          />

          {/* Academic Text Lines (Minimalist gold/ink strokes) */}
          {/* Left page text lines */}
          <line x1="142" y1="152" x2="182" y2="152" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="142" y1="164" x2="180" y2="164" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="142" y1="176" x2="175" y2="176" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="142" y1="188" x2="170" y2="188" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

          {/* Right page text lines */}
          <line x1="210" y1="152" x2="250" y2="152" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="212" y1="164" x2="248" y2="164" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="212" y1="176" x2="242" y2="176" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="212" y1="188" x2="236" y2="188" stroke="#1E4B8A" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

          {/* Golden Ribbon Bookmark (Shiori) draping down */}
          <path
            d="M196 142 Q194 185 204 225 Q208 238 206 248 L200 244 L194 248 Q196 238 194 225 Z"
            fill="url(#goldLeafGrad)"
            filter="url(#gentleShadow)"
          />
        </g>

        {/* 3. FLOATING CALLIGRAPHY BRUSH & DRAFTING PENCIL */}
        {/* Drafting Pencil with Gold Ferrule */}
        <g filter="url(#gentleShadow)" className="animate-float-reverse origin-center">
          <g transform="translate(68, 110) rotate(-32)">
            {/* Pencil Body (Ruri Blue & Natural Wood) */}
            <rect x="0" y="0" width="12" height="74" rx="2" fill="#1E4B8A" />
            {/* Gold Stripe Accent */}
            <rect x="0" y="14" width="12" height="3" fill="url(#goldLeafGrad)" />
            {/* Wood Neck */}
            <polygon points="0,0 12,0 6,-18" fill="url(#pencilWood)" />
            {/* Graphite Tip */}
            <polygon points="4,-12 8,-12 6,-18" fill="#0F2138" />
            {/* Gold Ferrule */}
            <rect x="0" y="66" width="12" height="8" rx="1" fill="url(#goldLeafGrad)" />
            {/* Eraser */}
            <path d="M0 74 C0 79 12 79 12 74 Z" fill="#D4AF37" />
          </g>
        </g>

        {/* Traditional Scholar Pen / Brush on the Right */}
        <g filter="url(#gentleShadow)" className="animate-float-delay origin-center">
          <g transform="translate(305, 95) rotate(26)">
            {/* Brush Shaft */}
            <rect x="0" y="0" width="8" height="80" rx="3" fill="url(#bookCoverGrad)" />
            {/* Gold Collar */}
            <rect x="0" y="10" width="8" height="4" fill="url(#goldLeafGrad)" />
            {/* Brush Bristles (Tapered) */}
            <path d="M0 0 Q4 -18 4 -22 Q4 -18 8 0 Z" fill="#FAF6ED" stroke="#E8DFCE" strokeWidth="0.5" />
            {/* Ink Dipped Tip (Deep Lapis Ink) */}
            <path d="M2 -10 Q4 -18 4 -22 Q4 -18 6 -10 Z" fill="#0F2138" />
          </g>
        </g>

        {/* 4. KOGANE GOLD SPARKLES & KNOWLEDGE STARBURSTS */}
        {/* Sparkle 1 (Top Left) */}
        <g transform="translate(85, 65)" className="animate-pulse-slow">
          <path
            d="M0 -10 C0 -2 2 0 10 0 C2 0 0 2 0 10 C0 2 -2 0 -10 0 C-2 0 0 -2 0 -10 Z"
            fill="url(#goldLeafGrad)"
          />
        </g>

        {/* Sparkle 2 (Top Right) */}
        <g transform="translate(300, 52)" className="animate-pulse-delay">
          <path
            d="M0 -14 C0 -3 3 0 14 0 C3 0 0 3 0 14 C0 3 -3 0 -14 0 C-3 0 0 -3 0 -14 Z"
            fill="url(#goldLeafGrad)"
          />
          <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
        </g>

        {/* Sparkle 3 (Lower Center Right) */}
        <g transform="translate(290, 240)" className="animate-pulse-slow">
          <path
            d="M0 -8 C0 -1.5 1.5 0 8 0 C1.5 0 0 1.5 0 8 C0 1.5 -1.5 0 -8 0 C-1.5 0 0 -1.5 0 -8 Z"
            fill="#D4AF37"
          />
        </g>

        {/* Small floating glowing orbs */}
        <circle cx="110" cy="180" r="3" fill="#D4AF37" opacity="0.6" className="animate-ping-slow" />
        <circle cx="280" cy="195" r="2.5" fill="#1E4B8A" opacity="0.5" />
        <circle cx="160" cy="85" r="2" fill="#D4AF37" opacity="0.7" />
        <circle cx="230" cy="95" r="3.5" fill="#D4AF37" opacity="0.65" />
      </svg>
    </div>
  );
};
