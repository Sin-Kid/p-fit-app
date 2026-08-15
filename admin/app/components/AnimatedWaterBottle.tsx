'use client';

import React, { useMemo } from 'react';

interface AnimatedWaterBottleProps {
  waterL: number;
  goalL: number;
  className?: string;
}

export function AnimatedWaterBottle({
  waterL,
  goalL,
  className = ''
}: AnimatedWaterBottleProps) {
  // Clamped percentage 0 to 100%
  const percentage = useMemo(() => {
    if (!goalL || goalL <= 0) return 0;
    return Math.min(100, Math.max(0, (waterL / goalL) * 100));
  }, [waterL, goalL]);

  // Geometry coordinates (viewBox 0 0 240 340)
  // Water chamber bounds: Y from 90 (shoulder) to 300 (base bottom)
  const chamberTop = 90;
  const chamberBottom = 300;
  const totalChamberHeight = chamberBottom - chamberTop; // 210px

  // Fill height and surface Y coordinate
  const currentFillHeight = (percentage / 100) * totalChamberHeight;
  const waterSurfaceY = chamberBottom - currentFillHeight;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 240 340"
        width="220"
        height="310"
        className="drop-shadow-2xl overflow-visible transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes fluidWave1 {
              0% { transform: translateX(0); }
              100% { transform: translateX(-120px); }
            }
            @keyframes fluidWave2 {
              0% { transform: translateX(-120px); }
              100% { transform: translateX(0); }
            }
            @keyframes floatBubbleA {
              0% { transform: translateY(0px) scale(0.6); opacity: 0; }
              20% { opacity: 0.9; }
              80% { opacity: 0.7; }
              100% { transform: translateY(-110px) scale(1.1); opacity: 0; }
            }
            @keyframes floatBubbleB {
              0% { transform: translateY(0px) scale(0.5); opacity: 0; }
              30% { opacity: 0.85; }
              85% { opacity: 0.5; }
              100% { transform: translateY(-130px) scale(1.2); opacity: 0; }
            }
            @keyframes floatBubbleC {
              0% { transform: translateY(0px) scale(0.8); opacity: 0; }
              40% { opacity: 0.95; }
              90% { opacity: 0.3; }
              100% { transform: translateY(-90px) scale(1); opacity: 0; }
            }
            @keyframes bottleGentleFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes pulseGlow {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .wave-back-anim {
              animation: fluidWave1 3.5s linear infinite;
            }
            .wave-front-anim {
              animation: fluidWave2 2.6s ease-in-out infinite alternate;
            }
            .bubble-a {
              animation: floatBubbleA 2.8s ease-in infinite;
            }
            .bubble-b {
              animation: floatBubbleB 3.6s ease-in 1s infinite;
            }
            .bubble-c {
              animation: floatBubbleC 3.1s ease-in 1.8s infinite;
            }
            .bottle-hover-group {
              animation: bottleGentleFloat 4s ease-in-out infinite;
              transform-origin: 120px 300px;
            }
            .water-level-transition {
              transition: transform 0.8s cubic-bezier(0.34, 1.3, 0.64, 1);
            }
          `}</style>

          {/* 3D Bottle Body Outer Shell Gradient */}
          <linearGradient id="bottleOuterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
            <stop offset="12%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#E0F2FE" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#BAE6FD" stopOpacity="0.4" />
            <stop offset="90%" stopColor="#7DD3FC" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.85" />
          </linearGradient>

          {/* Bottle Chamber Background Gradient */}
          <linearGradient id="chamberBgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          {/* Cap Gradient */}
          <linearGradient id="capGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="30%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Cap Loop Handle Gradient */}
          <linearGradient id="capHandleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0C4A6E" />
          </linearGradient>

          {/* Water Fluid Front (Luminous vibrant cyan to rich royal azure) */}
          <linearGradient id="waterFrontGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#0284C7" />
            <stop offset="80%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          {/* Water Fluid Back (Deep rich blue) */}
          <linearGradient id="waterBackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#0369A1" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.9" />
          </linearGradient>

          {/* Water Crest Highlight */}
          <linearGradient id="crestGlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>

          {/* Glass Specular Gloss Stripe */}
          <linearGradient id="glassGloss" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          {/* Bottle Shadow */}
          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
          </radialGradient>

          {/* Main Inner Chamber Clip Path: X: 48 to 192 (width 144), Y: 85 to 305 (height 220) */}
          <clipPath id="bottleInsideClip">
            <rect
              x="48"
              y="85"
              width="144"
              height="220"
              rx="36"
              ry="36"
            />
          </clipPath>
        </defs>

        {/* 1. Ground Shadow */}
        <ellipse
          cx="120"
          cy="325"
          rx="72"
          ry="10"
          fill="url(#groundShadow)"
        />

        {/* 2. Floating Bottle Container */}
        <g className="bottle-hover-group">
          {/* Top Loop Handle */}
          <path
            d="M 132 28 C 132 16 146 8 162 8 C 178 8 188 18 188 32 C 188 44 176 54 162 54 L 140 54"
            fill="none"
            stroke="url(#capHandleGradient)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Loop Handle Highlight */}
          <path
            d="M 138 25 C 138 18 148 13 162 13 C 172 13 180 19 180 30"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Top Cap Spout */}
          <rect
            x="85"
            y="34"
            width="70"
            height="28"
            rx="8"
            fill="url(#capGradient)"
            stroke="#0369A1"
            strokeWidth="1.5"
          />
          {/* Cap Grip Ridges */}
          <line x1="98" y1="40" x2="98" y2="56" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <line x1="110" y1="40" x2="110" y2="56" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <line x1="120" y1="40" x2="120" y2="56" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <line x1="130" y1="40" x2="130" y2="56" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
          <line x1="142" y1="40" x2="142" y2="56" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />

          {/* Metallic Neck Collar Ring */}
          <rect
            x="80"
            y="62"
            width="80"
            height="10"
            rx="4"
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth="1"
          />
          <rect x="84" y="64" width="72" height="2.5" rx="1" fill="#FFFFFF" opacity="0.9" />

          {/* Bottle Neck Transition */}
          <path
            d="M 82 72 L 78 88 L 162 88 L 158 72 Z"
            fill="url(#bottleOuterGradient)"
            stroke="#38BDF8"
            strokeWidth="1"
          />

          {/* Bottle Interior Chamber Base Layer */}
          <rect
            x="48"
            y="85"
            width="144"
            height="220"
            rx="36"
            ry="36"
            fill="url(#chamberBgGradient)"
            stroke="#38BDF8"
            strokeWidth="2"
          />

          {/* DYNAMIC WATER FLUID (Clipped inside Bottle Chamber) */}
          <g clipPath="url(#bottleInsideClip)">
            <g
              className="water-level-transition"
              style={{
                transform: `translateY(${waterSurfaceY}px)`,
              }}
            >
              {/* Back Wave Path */}
              <g className="wave-back-anim">
                <path
                  d="M -120 0 Q -90 -12 -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0 T 300 0 T 360 0 V 300 H -120 Z"
                  fill="url(#waterBackGradient)"
                />
              </g>

              {/* Front Wave Path */}
              <g className="wave-front-anim">
                <path
                  d="M -120 0 Q -90 10 -60 0 T 0 0 T 60 0 T 120 0 T 180 0 T 240 0 T 300 0 T 360 0 V 300 H -120 Z"
                  fill="url(#waterFrontGradient)"
                />
              </g>

              {/* Solid Water Body Beneath Wave */}
              <rect
                x="-120"
                y="0"
                width="480"
                height="300"
                fill="url(#waterFrontGradient)"
              />

              {/* Surface Meniscus Glow */}
              <ellipse
                cx="120"
                cy="0"
                rx="65"
                ry="3.5"
                fill="url(#crestGlowGradient)"
                opacity="0.85"
              />

              {/* Live Rising Bubbles when water level > 5% */}
              {percentage > 5 && (
                <g>
                  {/* Bubble 1 */}
                  <circle cx="80" cy="70" r="4.5" fill="#FFFFFF" className="bubble-a" />
                  <circle cx="81" cy="69" r="1.5" fill="#E0F2FE" />

                  {/* Bubble 2 */}
                  <circle cx="140" cy="95" r="3.5" fill="#E0F2FE" className="bubble-b" />

                  {/* Bubble 3 */}
                  <circle cx="110" cy="120" r="5" fill="#BAE6FD" className="bubble-c" />

                  {/* Bubble 4 */}
                  <circle cx="155" cy="80" r="3" fill="#FFFFFF" className="bubble-a" />

                  {/* Sparkle Bubbles */}
                  <circle cx="95" cy="45" r="2" fill="#FFFFFF" opacity="0.8" />
                  <circle cx="130" cy="55" r="1.5" fill="#FFFFFF" opacity="0.9" />
                </g>
              )}
            </g>
          </g>

          {/* 3D Glass Gloss & Reflection Overlay */}
          {/* Glass Outer Rim */}
          <rect
            x="48"
            y="85"
            width="144"
            height="220"
            rx="36"
            ry="36"
            fill="url(#bottleOuterGradient)"
            fillOpacity="0.25"
            stroke="#0284C7"
            strokeWidth="2.5"
          />

          {/* Left Vertical Gloss Reflection Stripe */}
          <path
            d="M 62 105 C 62 96 68 90 76 90 L 84 90 C 76 90 70 96 70 105 L 70 280 C 70 290 76 295 84 295 L 76 295 C 68 295 62 290 62 280 Z"
            fill="url(#glassGloss)"
            opacity="0.9"
          />

          {/* Right Subtle Rim Light */}
          <path
            d="M 178 105 L 178 280"
            stroke="#BAE6FD"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Measurement Markings & Labels */}
          <g opacity="0.95" className="font-mono select-none pointer-events-none">
            {/* Top tick: Full */}
            <line x1="56" y1="110" x2="72" y2="110" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <circle cx="76" cy="110" r="2" fill="#0284C7" />
            <text x="84" y="113" fontSize="8" fontWeight="800" fill="#0369A1" fontFamily="sans-serif">
              {goalL.toFixed(1)}L • FULL
            </text>

            {/* 75% Target */}
            <line x1="58" y1="155" x2="68" y2="155" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
            <text x="74" y="158" fontSize="7.5" fontWeight="700" fill="#0284C7">
              {(goalL * 0.75).toFixed(1)}L
            </text>

            {/* 50% Target / Halfway */}
            <line x1="56" y1="200" x2="72" y2="200" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <circle cx="76" cy="200" r="2" fill="#0284C7" />
            <text x="84" y="203" fontSize="8" fontWeight="800" fill="#0369A1" fontFamily="sans-serif">
              {(goalL * 0.5).toFixed(1)}L • HALFWAY
            </text>

            {/* 25% Target */}
            <line x1="58" y1="245" x2="68" y2="245" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
            <text x="74" y="248" fontSize="7.5" fontWeight="700" fill="#0284C7">
              {(goalL * 0.25).toFixed(1)}L
            </text>

            {/* Mini ticks */}
            <line x1="60" y1="132" x2="65" y2="132" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
            <line x1="60" y1="177" x2="65" y2="177" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
            <line x1="60" y1="222" x2="65" y2="222" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
            <line x1="60" y1="267" x2="65" y2="267" stroke="#38BDF8" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Center Brand Badge */}
          <g transform="translate(120, 282)" textAnchor="middle" className="select-none pointer-events-none">
            <rect
              x="-38"
              y="-12"
              width="76"
              height="18"
              rx="9"
              fill="#FFFFFF"
              stroke="#BAE6FD"
              strokeWidth="1.5"
              className="drop-shadow-xs"
            />
            <text
              x="0"
              y="1"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="900"
              fill="#0284C7"
              letterSpacing="0.06em"
              fontFamily="sans-serif"
            >
              P-FIT • H₂O
            </text>
          </g>

          {/* Condensation Droplets */}
          <g opacity="0.9">
            <ellipse cx="170" cy="140" rx="2.5" ry="4" fill="#FFFFFF" />
            <ellipse cx="170" cy="141" rx="1.5" ry="2" fill="#38BDF8" />
            <circle cx="166" cy="210" r="2.5" fill="#FFFFFF" />
            <circle cx="166" cy="211" r="1.5" fill="#0284C7" />
            <ellipse cx="68" cy="170" rx="2" ry="3.5" fill="#FFFFFF" />
          </g>
        </g>
      </svg>

      {/* Floating Status Pill */}
      <div className="mt-1 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#BAE6FD] shadow-md flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse" />
        <span className="text-xs font-black text-[#0369A1] font-mono">
          {Math.round(percentage)}%
        </span>
        <span className="text-[11px] text-slate-500 font-bold">
          ({waterL.toFixed(1)}L / {goalL.toFixed(1)}L)
        </span>
      </div>
    </div>
  );
}
