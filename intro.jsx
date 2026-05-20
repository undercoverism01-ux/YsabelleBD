// ---------- Video Intro ----------
// "Tap to begin" gate → fullscreen video with BGM. The gate captures a user
// gesture so both the video AND the background music (which is NOT muted)
// can start. Without the gate, browsers autoplay muted media only.
function VideoIntro({ src, onDone, onStart }) {
  const { useState, useRef, useEffect } = React;
  const [stage, setStage] = useState("gate"); // "gate" | "playing" | "leaving" | "gone"
  const [ready, setReady] = useState(false);
  const vref = useRef(null);

  const begin = () => {
    if (stage !== "gate") return;
    setStage("playing");
    onStart && onStart();
    // Kick the video off explicitly — autoPlay is on but we want this
    // tied to the click so it's reliable on iOS.
    requestAnimationFrame(() => {
      const v = vref.current;
      if (!v) return;
      try { v.currentTime = 0; } catch {}
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  };

  const finish = () => {
    if (stage !== "playing") return;
    setStage("leaving");
    setTimeout(() => {
      setStage("gone");
      onDone && onDone();
    }, 700);
  };

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const onLoaded = () => setReady(true);
    v.addEventListener("loadeddata", onLoaded);
    return () => v.removeEventListener("loadeddata", onLoaded);
  }, []);

  if (stage === "gone") return null;

  return (
    <div
      className={`vintro vintro--${stage} ${stage === "leaving" ? "is-leaving" : ""}`}
      onClick={stage === "gate" ? begin : finish}
      role="button"
      aria-label={stage === "gate" ? "Begin" : "Skip intro"}
    >
      <div className="vintro__frame">
        <video
          ref={vref}
          className="vintro__video"
          src={src}
          muted
          playsInline
          preload="auto"
          onEnded={finish}
        />
      </div>
      {stage === "gate" && (
        <div className="vintro__gate" aria-hidden="true">
          <div className="vintro__gate-eyebrow">A Magical 18th</div>
          <div className="vintro__gate-title">Tap to Begin</div>
          <div className="vintro__gate-sub">♪ with music</div>
        </div>
      )}
      {stage === "playing" && !ready && (
        <div className="vintro__loader" aria-hidden="true">
          <div className="vintro__spinner"></div>
          <div className="vintro__loading">LOADING</div>
        </div>
      )}
      {stage === "playing" && <div className="vintro__skip">Tap to skip</div>}
      <style>{`
        .vintro {
          position: fixed; inset: 0;
          z-index: 500;
          background: #000;
          display: grid; place-items: center;
          cursor: pointer;
          animation: vintroIn .35s ease both;
        }
        .vintro.is-leaving { animation: vintroOut .7s ease forwards; }
        .vintro__frame {
          position: relative;
          /* Source video is 716×1284 (≈9:16). Constrain to a phone-shaped
             window so it never blows up on tablets/desktops, while filling
             the screen on real phones. */
          width: min(100vw, calc(100vh * 716 / 1284));
          height: min(100vh, calc(100vw * 1284 / 716));
          max-width: 100vw;
          max-height: 100vh;
          display: grid; place-items: center;
          overflow: hidden;
        }
        .vintro__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .vintro__loader {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          gap: 14px;
          pointer-events: none;
        }
        .vintro__spinner {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(255,235,245,0.25);
          border-top-color: rgba(255,235,245,0.95);
          animation: vintroSpin 0.9s linear infinite;
        }
        .vintro__loading {
          position: absolute;
          margin-top: 64px;
          font-family: "Cinzel", serif;
          letter-spacing: 6px;
          font-size: 10px;
          color: rgba(255, 235, 245, 0.75);
        }
        .vintro__skip {
          position: absolute;
          bottom: 24px; left: 50%;
          transform: translateX(-50%);
          font-family: "Cinzel", serif;
          letter-spacing: 4px;
          font-size: 10px;
          color: rgba(255, 235, 245, 0.7);
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
          animation: vintroHintPulse 1.8s ease-in-out infinite;
          pointer-events: none;
          user-select: none;
        }
        @keyframes vintroIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vintroOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes vintroSpin { to { transform: rotate(360deg); } }
        @keyframes vintroHintPulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }

        /* Tap-to-begin gate */
        .vintro__gate {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          background: radial-gradient(120% 80% at 50% 50%, rgba(74,19,64,0.65) 0%, rgba(0,0,0,0.85) 80%);
          color: #fff;
          text-align: center;
          padding: 20px;
          animation: vintroGateIn .5s ease both;
          pointer-events: none;
        }
        .vintro__gate-eyebrow {
          font-family: "Cinzel", serif;
          font-size: 11px;
          letter-spacing: 0.5em;
          color: #f7c8d8;
          text-transform: uppercase;
          padding-left: 0.5em;
        }
        .vintro__gate-title {
          font-family: "Allura", "Cormorant Garamond", cursive;
          font-size: clamp(48px, 12vw, 72px);
          font-weight: 400;
          color: #fff;
          line-height: 1;
          text-shadow:
            0 0 20px rgba(255,200,220,0.6),
            0 4px 16px rgba(0,0,0,0.5);
          animation: vintroTitlePulse 2.2s ease-in-out infinite;
        }
        .vintro__gate-sub {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 14px;
          letter-spacing: 0.15em;
          color: #f7c8d8;
          opacity: 0.85;
          margin-top: 4px;
        }
        @keyframes vintroGateIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes vintroTitlePulse {
          0%, 100% { transform: scale(1); text-shadow: 0 0 20px rgba(255,200,220,0.6), 0 4px 16px rgba(0,0,0,0.5); }
          50%      { transform: scale(1.03); text-shadow: 0 0 36px rgba(255,200,220,0.9), 0 4px 16px rgba(0,0,0,0.5); }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { VideoIntro });
