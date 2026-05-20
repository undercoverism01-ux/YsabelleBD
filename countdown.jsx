// Compact decorated countdown timer.
const { useState, useEffect } = React;

const TARGET_MS = Date.UTC(2026, 6, 4, 8, 0, 0); // 2026-07-04 16:00 +08:00 Manila

function CountdownTimer() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, TARGET_MS - now);
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const arrived = diff === 0;

  const Crown = () => (
    <svg viewBox="0 0 24 14" width="14" height="8" aria-hidden="true">
      <path d="M2 12 L4 4 L8 8 L12 2 L16 8 L20 4 L22 12 Z" fill="#D7B26A" stroke="#B58F3E" strokeWidth="0.6" strokeLinejoin="round"/>
      <circle cx="4" cy="4" r="1.1" fill="#fff5e0"/>
      <circle cx="12" cy="2" r="1.2" fill="#fff5e0"/>
      <circle cx="20" cy="4" r="1.1" fill="#fff5e0"/>
    </svg>
  );

  const Sparkle = ({ s = 6 }) => (
    <svg viewBox="0 0 12 12" width={s} height={s} aria-hidden="true">
      <path d="M6 0 L6.8 5.2 L12 6 L6.8 6.8 L6 12 L5.2 6.8 L0 6 L5.2 5.2 Z" fill="#3a2a78"/>
    </svg>
  );

  return (
    <div className="cd-mini" aria-live="polite">
      <span className="cd-orn cd-orn-tl"><Sparkle s={5}/></span>
      <span className="cd-orn cd-orn-tr"><Sparkle s={5}/></span>
      <span className="cd-orn cd-orn-bl"><Sparkle s={4}/></span>
      <span className="cd-orn cd-orn-br"><Sparkle s={4}/></span>

      <div className="cd-prelude">Time remaining…</div>

      {arrived ? (
        <div className="cd-arrived">Today is the day ✨</div>
      ) : (
        <div className="cd-row">
          <Cell n={days} l="Days" />
          <Sep />
          <Cell n={hours} l="Hrs" />
          <Sep />
          <Cell n={mins} l="Min" />
          <Sep />
          <Cell n={secs} l="Sec" />
        </div>
      )}

      <div className="cd-eyebrow">Counting Down</div>

      <style>{`
        .cd-mini {
          position: relative;
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 2px;
          padding: 4px 8px;
          color: #6E3F61;
          font-family: "Cormorant Garamond", "Times New Roman", serif;
        }
        .cd-orn { position: absolute; line-height: 0; opacity: .9; }
        .cd-orn-tl { top: 6%; left: 5%; }
        .cd-orn-tr { top: 6%; right: 5%; }
        .cd-orn-bl { bottom: 6%; left: 5%; }
        .cd-orn-br { bottom: 6%; right: 5%; }
        .cd-prelude {
          font-family: "Cinzel", serif;
          font-size: 5.5px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #1a0f4a;
          line-height: 1;
        }
        .cd-eyebrow {
          font-family: "Cinzel", serif;
          font-size: 7.5px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #1a0f4a;
          line-height: 1;
        }
        .cd-row {
          display: flex; align-items: stretch; justify-content: center;
          gap: 2px;
        }
        .cd-cell {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-width: 30px;
        }
        .cd-num {
          font-family: "Playfair Display", "Cormorant Garamond", serif;
          font-weight: 500;
          font-size: 18px;
          line-height: 1;
          color: #6E3F61;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.02em;
          text-shadow: 0 1px 0 rgba(255,255,255,0.6);
        }
        .cd-lab {
          font-family: "Cinzel", serif;
          font-size: 6.5px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #3a2a78;
          margin-top: 2px;
        }
        .cd-sep {
          font-family: "Playfair Display", serif;
          font-style: italic;
          font-size: 14px;
          color: rgba(58, 42, 120, 0.55);
          padding-bottom: 7px;
          align-self: center;
        }
        .cd-arrived {
          font-family: "Allura", cursive;
          font-size: 18px;
          color: #8A5B7A;
        }
      `}</style>
    </div>
  );
}

function Cell({ n, l }) {
  return (
    <div className="cd-cell">
      <div className="cd-num">{String(n).padStart(2, "0")}</div>
      <div className="cd-lab">{l}</div>
    </div>
  );
}
function Sep() { return <div className="cd-sep">·</div>; }

Object.assign(window, { CountdownTimer });
