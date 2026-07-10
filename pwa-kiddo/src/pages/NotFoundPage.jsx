import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);
  const { user } = useAuth();

  const handleBackToDashboard = () => {
    if (user?.role === "student") {
      navigate("/student/dashboard", { replace: true });
    } else if (user?.role === "teacher") {
      navigate("/teacher/dashboard", { replace: true });
    } else if (user?.role === "driver") {
      navigate("/driver/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const handleMouseMove = (e) => {
    const { innerWidth: w, innerHeight: h } = e.currentTarget.ownerDocument.defaultView;
    e.currentTarget.style.setProperty("--mx", `${(e.clientX / w) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${(e.clientY / h) * 100}%`);
    if (!sceneRef.current) return;
    const rx = (e.clientX / w - 0.5) * 14;
    const ry = (e.clientY / h - 0.5) * 14;
    sceneRef.current.style.transform = `rotateX(${-ry}deg) rotateY(${rx}deg)`;
  };

  const handleMouseLeave = () => {
    if (sceneRef.current) sceneRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div className="siq-404-root" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <style>{`
        .siq-404-root {
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--c-bg);
          font-family: 'Inter', -apple-system, sans-serif;
          text-align: center;
          padding: 24px;
          z-index: 0;
        }

        .siq-404-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(360px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.35), transparent 60%);
          pointer-events: none;
        }

        .siq-404-blob {
          position: absolute;
          border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%;
          opacity: 0.12;
          animation: siq-blob-morph 14s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .siq-404-blob-a { width: 300px; height: 300px; top: -80px; left: -80px; background: var(--c-primary); }
        .siq-404-blob-b { width: 260px; height: 260px; bottom: -80px; right: -80px; background: var(--c-secondary); animation-delay: 2s; }

        @keyframes siq-blob-morph {
          0%   { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: translate(0,0) rotate(0deg); }
          50%  { border-radius: 58% 42% 37% 63% / 54% 60% 40% 46%; transform: translate(14px,-14px) rotate(8deg); }
          100% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; transform: translate(-10px,12px) rotate(-6deg); }
        }

        .siq-404-enter {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: siq-404-enter 0.7s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes siq-404-enter {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }

        .siq-404-wordmark {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-weight: 600;
          font-size: 18px;
          color: var(--c-text-muted);
          letter-spacing: -0.01em;
          margin-bottom: 40px;
        }

        .siq-404-scene {
          position: relative;
          width: 180px;
          height: 180px;
          perspective: 800px;
          will-change: transform;
          transition: transform 0.2s ease-out;
          margin-bottom: 36px;
        }

        .siq-404-halo {
          position: absolute;
          top: 50%; left: 50%;
          width: 120px; height: 120px;
          margin: -60px 0 0 -60px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--c-secondary), transparent 70%);
          filter: blur(10px);
          opacity: 0.4;
          animation: siq-halo-spin 5s linear infinite reverse;
        }
        @keyframes siq-halo-spin { to { transform: rotate(360deg); } }

        .siq-404-cube-wrap {
          position: absolute;
          top: 50%; left: 50%;
          width: 90px; height: 90px;
          margin: -45px 0 0 -45px;
          animation: siq-404-float 4s ease-in-out infinite;
        }
        @keyframes siq-404-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(3deg); }
        }

        .siq-404-cube {
          width: 100%; height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(20deg) rotateY(35deg);
        }

        .siq-404-face {
          position: absolute;
          width: 90px; height: 90px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 -16px 22px -16px rgba(0,0,0,0.22);
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-weight: 700;
          color: var(--c-secondary);
          font-size: 32px;
          letter-spacing: -1px;
        }
        .siq-404-face-front  { transform: translateZ(45px); }
        .siq-404-face-back   { transform: rotateY(180deg) translateZ(45px); color: var(--c-primary); }
        .siq-404-face-right  { transform: rotateY(90deg) translateZ(45px); font-size: 24px; }
        .siq-404-face-left   { transform: rotateY(-90deg) translateZ(45px); color: var(--c-primary); font-size: 24px; }
        .siq-404-face-top    { transform: rotateX(90deg) translateZ(45px); filter: brightness(1.15); }
        .siq-404-face-bottom { transform: rotateX(-90deg) translateZ(45px); filter: brightness(0.75); }

        .siq-404-code {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 80px;
          font-weight: 700;
          color: var(--c-text);
          letter-spacing: -4px;
          line-height: 1;
          margin-bottom: 12px;
          background: linear-gradient(135deg, var(--c-text) 0%, var(--c-primary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .siq-404-title {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--c-text);
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .siq-404-sub {
          font-size: 14px;
          color: var(--c-text-muted);
          font-weight: 400;
          max-width: 260px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .siq-404-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 14px;
          background: var(--c-primary);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          letter-spacing: 0.1px;
          box-shadow: 0 4px 18px rgba(25,118,210,0.28);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .siq-404-btn:hover {
          background: #1565C0;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(25,118,210,0.38);
        }
        .siq-404-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(25,118,210,0.2);
        }

        @media (prefers-reduced-motion: reduce) {
          .siq-404-cube-wrap, .siq-404-halo, .siq-404-blob { animation: none !important; }
          .siq-404-scene { transform: none !important; }
        }
      `}</style>

      <div className="siq-404-blob siq-404-blob-a" aria-hidden="true" />
      <div className="siq-404-blob siq-404-blob-b" aria-hidden="true" />

      <div className="siq-404-enter">
        <div className="siq-404-wordmark">SchoolIQ</div>

        <div className="siq-404-scene" ref={sceneRef} aria-hidden="true">
          <div className="siq-404-halo" />
          <div className="siq-404-cube-wrap">
            <div className="siq-404-cube">
              <div className="siq-404-face siq-404-face-front">404</div>
              <div className="siq-404-face siq-404-face-back">?</div>
              <div className="siq-404-face siq-404-face-right">!</div>
              <div className="siq-404-face siq-404-face-left">?</div>
              <div className="siq-404-face siq-404-face-top" />
              <div className="siq-404-face siq-404-face-bottom" />
            </div>
          </div>
        </div>

        <div className="siq-404-code" aria-label="404">404</div>
        <div className="siq-404-title">Page Not Found</div>
        <p className="siq-404-sub">
          This page doesn't exist or was moved.<br />Let's get you back on track.
        </p>

        <button
          className="siq-404-btn"
          onClick={handleBackToDashboard}
        >
          ← Back to Homeroom
        </button>
      </div>
    </div>
  );
}
