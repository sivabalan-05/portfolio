"use client";

import React, { useEffect, useState } from "react";

export default function DesktopLoreWarning() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in this session
    const hasDismissed = sessionStorage.getItem("desktop-lore-warning-dismissed");
    if (hasDismissed) return;

    // Show warning on mobile and tablet screens (under 1024px)
    const checkViewport = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(true);
      }
    };

    checkViewport();
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    sessionStorage.setItem("desktop-lore-warning-dismissed", "true");
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`lore-modal-overlay ${isClosing ? "lore-modal--closing" : ""}`}>
      <style>{`
        .lore-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: grid;
          place-items: center;
          padding: 1.25rem;
          background: rgba(18, 18, 16, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: lore-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .lore-modal-overlay.lore-modal--closing {
          animation: lore-fade-out 0.25s ease forwards;
        }

        .lore-modal-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          background: var(--site-paper, #ede7da);
          color: var(--site-ink, #1c1b18);
          border: 1.5px solid var(--site-ink, #1c1b18);
          box-shadow: 8px 8px 0 var(--site-ink, #1c1b18);
          overflow: hidden;
          animation: lore-pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .lore-modal-overlay.lore-modal--closing .lore-modal-card {
          animation: lore-pop-out 0.25s ease forwards;
        }

        .lore-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.85rem;
          background: color-mix(in srgb, var(--site-ink, #1c1b18) 8%, var(--site-paper, #ede7da));
          border-bottom: 1.5px solid var(--site-ink, #1c1b18);
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .lore-mac-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lore-mac-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.2);
        }

        .lore-dot-red { background: #ff5f56; }
        .lore-dot-yellow { background: #ffbd2e; }
        .lore-dot-green { background: #27c93f; }

        .lore-modal-body {
          padding: 1.75rem 1.35rem 1.4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
        }

        .lore-icon-badge {
          font-size: 1.4rem;
          color: var(--site-accent, #843f3a);
          line-height: 1;
        }

        .lore-message-text {
          font-family: var(--font-subtitle, var(--font-mono, monospace));
          font-size: 1.12rem;
          line-height: 1.45;
          letter-spacing: 0.01em;
          font-weight: 500;
          color: var(--site-ink, #1c1b18);
          margin: 0;
        }

        .lore-ok-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--site-ink, #1c1b18);
          color: var(--site-paper, #ede7da);
          border: 1.5px solid var(--site-ink, #1c1b18);
          font-family: var(--font-subtitle, var(--font-mono, monospace));
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, transform 0.1s ease;
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.12);
        }

        .lore-ok-btn:hover {
          background: var(--site-paper, #ede7da);
          color: var(--site-ink, #1c1b18);
        }

        .lore-ok-btn:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.12);
        }

        @keyframes lore-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes lore-fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes lore-pop-in {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes lore-pop-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(12px); }
        }
      `}</style>

      <div className="lore-modal-card" role="dialog" aria-modal="true" aria-labelledby="lore-title">
        <div className="lore-modal-header">
          <div className="lore-mac-dots">
            <span className="lore-mac-dot lore-dot-red" />
            <span className="lore-mac-dot lore-dot-yellow" />
            <span className="lore-mac-dot lore-dot-green" />
          </div>
          <span id="lore-title">SYSTEM_NOTICE.TXT</span>
          <span style={{ opacity: 0.5 }}>✳︎</span>
        </div>

        <div className="lore-modal-body">
          <span className="lore-icon-badge">✦</span>
          <p className="lore-message-text">
            Hop on desktop, you’re missing out on the full lore 😝
          </p>
          <button className="lore-ok-btn" onClick={handleDismiss} autoFocus>
            <span>[ OK, ENTER ANYWAY ]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
