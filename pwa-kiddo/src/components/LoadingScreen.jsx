import { useEffect, useRef, useState } from "react";

const STATUS_MESSAGES = [
  "Taking attendance…",
  "Syncing today's timetable…",
  "Loading your dashboard…",
];

function BookIcon() {
  return (
    <svg width="30" height="20" viewBox="0 0 48 32" fill="none">
      <path
        d="M24 6 C19 3 12 2 5 3 V27 C12 26 19 27 24 30 C29 27 36 26 43 27 V3 C36 2 29 3 24 6 Z"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
      <path d="M24 6 V30" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg width="30" height="20" viewBox="0 0 48 32" fill="none">
      <path d="M24 4 L46 13 L24 22 L2 13 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M13 17 V25 C13 27 18 29 24 29 C30 29 35 27 35 25 V17" stroke="currentColor" strokeWidth="2" />
      <path d="M44 13 V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="24" r="1.6" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="26" height="20" viewBox="0 0 28 24" fill="none">
      <path d="M3 4 H25 V17 H10 L5 22 V17 H3 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="22" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 5 L17 3 L21 7 L19 9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function LoadingScreen({ schoolName = "SchoolIQ" }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const sceneRef = useRef(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = (e) => {
    const { innerWidth: w, innerHeight: h } = e.currentTarget.ownerDocument.defaultView;
    e.currentTarget.style.setProperty("--mx", `${(e.clientX / w) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${(e.clientY / h) * 100}%`);
    if (reducedMotion.current || !sceneRef.current) return;
    const rx = (e.clientX / w - 0.5) * 22;
    const ry = (e.clientY / h - 0.5) * 22;
    sceneRef.current.style.transform = `rotateX(${-ry}deg) rotateY(${rx}deg)`;
  };

  const handleMouseLeave = () => {
    if (sceneRef.current) sceneRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="siq-loading-root" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <style>{`
        .siq-loading-root {
          --c-bg: #F5EDE3;
          --c-surface: rgba(255,255,255,0.55);
          --c-primary: #1976D2;
          --c-secondary: #E8A33D;
          --c-text: #1E2A38;
          --c-text-muted: #8B8577;
          --c-border: rgba(30,42,56,0.14);

          position: fixed;
          inset: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--c-bg);
          font-family: 'Inter', -apple-system, sans-serif;
          z-index: 9999;
        }

        .siq-loading-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.35), transparent 60%);
          pointer-events: none;
        }

        .siq-blob {
          position: absolute;
          border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%;
          opacity: 0.14;
          animation: siq-blob-morph 14s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .siq-blob-a { width: 340px; height: 340px; top: -90px; left: -90px; background: var(--c-primary); }
        .siq-blob-b { width: 280px; height: 280px; bottom: -100px; right: -100px; background: var(--c-secondary); animation-delay: 2s; }

        @keyframes siq-blob-morph {
          0%   { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: translate(0,0) rotate(0deg); }
          50%  { border-radius: 58% 42% 37% 63% / 54% 60% 40% 46%; transform: translate(14px,-14px) rotate(8deg); }
          100% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: translate(-10px,12px) rotate(-6deg); }
        }

        .siq-enter {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: siq-scene-enter 0.6s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes siq-scene-enter {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }

        .siq-wordmark {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-weight: 600;
          font-size: 20px;
          color: var(--c-text);
          letter-spacing: -0.01em;
          margin-bottom: 44px;
        }

        .siq-scene {
          position: relative;
          width: 210px;
          height: 210px;
          perspective: 900px;
          will-change: transform;
          transition: transform 0.2s ease-out;
        }

        .siq-halo {
          position: absolute;
          top: 50%; left: 50%;
          width: 140px; height: 140px;
          margin: -70px 0 0 -70px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--c-primary), transparent 70%);
          filter: blur(10px);
          opacity: 0.45;
          animation: siq-halo-spin 3s linear infinite;
        }
        @keyframes siq-halo-spin { to { transform: rotate(360deg); } }

        .siq-orbit-tilt {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transform: rotateX(66deg);
        }
        .siq-orbit-spin {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: siq-orbit-spin 5s linear infinite;
        }
        @keyframes siq-orbit-spin { from { transform: rotateZ(0); } to { transform: rotateZ(360deg); } }
        .siq-orbit-spin span {
          position: absolute;
          top: 50%; left: 50%;
          width: 7px; height: 7px;
          margin: -3.5px;
          border-radius: 50%;
          background: var(--c-secondary);
          box-shadow: 0 0 8px var(--c-secondary);
        }
        .siq-orbit-spin span:nth-child(1) { transform: rotate(0deg)   translateX(100px); }
        .siq-orbit-spin span:nth-child(2) { transform: rotate(90deg)  translateX(100px); }
        .siq-orbit-spin span:nth-child(3) { transform: rotate(180deg) translateX(100px); }
        .siq-orbit-spin span:nth-child(4) { transform: rotate(270deg) translateX(100px); }

        .siq-cube-wrap {
          position: absolute;
          top: 50%; left: 50%;
          width: 100px; height: 100px;
          margin: -50px 0 0 -50px;
          animation: siq-cube-bounce 3s ease-in-out infinite;
        }
        @keyframes siq-cube-bounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }

        .siq-cube {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: siq-cube-spin 9s linear infinite;
        }
        @keyframes siq-cube-spin {
          from { transform: rotateX(0) rotateY(0); }
          to   { transform: rotateX(360deg) rotateY(360deg); }
        }

        .siq-face {
          position: absolute;
          width: 100px; height: 100px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          color: var(--c-primary);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 -18px 26px -18px rgba(0,0,0,0.28);
        }
        .siq-face-front  { transform: translateZ(50px); }
        .siq-face-back   { transform: rotateY(180deg) translateZ(50px); }
        .siq-face-right  { transform: rotateY(90deg) translateZ(50px); }
        .siq-face-left   { transform: rotateY(-90deg) translateZ(50px); }
        .siq-face-top    { transform: rotateX(90deg) translateZ(50px); filter: brightness(1.18); }
        .siq-face-bottom { transform: rotateX(-90deg) translateZ(50px); filter: brightness(0.8); }

        .siq-msg-wrap {
          perspective: 400px;
          height: 20px;
          overflow: hidden;
          margin-top: 36px;
        }
        .siq-status-msg {
          display: inline-block;
          font-size: 14px;
          font-weight: 500;
          color: var(--c-text);
          transform-origin: 50% 100%;
          animation: siq-msg-flip 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes siq-msg-flip {
          from { opacity: 0; transform: rotateX(55deg) translateY(6px); }
          to   { opacity: 1; transform: rotateX(0) translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .siq-cube, .siq-cube-wrap, .siq-orbit-spin, .siq-halo,
          .siq-blob, .siq-status-msg {
            animation: none !important;
          }
          .siq-scene { transform: none !important; }
        }
      `}</style>

      <div className="siq-blob siq-blob-a" aria-hidden="true" />
      <div className="siq-blob siq-blob-b" aria-hidden="true" />

      <div className="siq-enter">
        <div className="siq-wordmark">{schoolName}</div>

        <div className="siq-scene" ref={sceneRef} aria-hidden="true">
          <div className="siq-halo" />
          <div className="siq-orbit-tilt">
            <div className="siq-orbit-spin">
              <span /><span /><span /><span />
            </div>
          </div>
          <div className="siq-cube-wrap">
            <div className="siq-cube">
              <div className="siq-face siq-face-front"><BookIcon /></div>
              <div className="siq-face siq-face-back"><CapIcon /></div>
              <div className="siq-face siq-face-right"><ChatIcon /></div>
              <div className="siq-face siq-face-left"><PencilIcon /></div>
              <div className="siq-face siq-face-top" />
              <div className="siq-face siq-face-bottom" />
            </div>
          </div>
        </div>

        <div className="siq-msg-wrap">
          <span key={messageIndex} className="siq-status-msg" role="status" aria-live="polite">
            {STATUS_MESSAGES[messageIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
