// Background music player.
//
// Autoplay-safe strategy:
//   1. On mount, try to play immediately (works when mounted inside a user
//      gesture chain — e.g. right after the intro video's "tap to enter").
//   2. If that fails, register a one-shot document listener so the NEXT
//      user interaction (anywhere) starts playback.
//   3. The button is always functional as an explicit play/pause toggle.
//
// Play state is driven by the real <audio> element's events (onplay /
// onpause) so the icon reflects truth, not optimistic state. A 404 or
// decode error surfaces as a small error label under the button.
//
// Place the audio file at deploy/assets/bgm.mp3.
const { useEffect, useRef, useState } = React;

function BGM({ src = "assets/bgm.mp3", volume = 0.5 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
    a.loop = true;

    const onPlay  = () => { setPlaying(true);  setError(null); };
    const onPause = () => setPlaying(false);
    const onErr   = () => setError("音声ファイルが見つかりません");
    a.addEventListener("play",  onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onErr);

    // Restore mute state
    if (sessionStorage.getItem("bgm-muted") === "1") {
      a.muted = true; setMuted(true);
    }

    // Attempt 1: try immediately (works if mount follows a recent gesture).
    let armed = false;
    const tryPlay = () => a.play().catch(() => {
      // Attempt 2: wait for any user interaction.
      if (armed) return;
      armed = true;
      const onGesture = () => {
        a.play().catch(() => {});
        document.removeEventListener("pointerdown", onGesture);
        document.removeEventListener("keydown", onGesture);
        document.removeEventListener("touchstart", onGesture);
      };
      document.addEventListener("pointerdown", onGesture, { once: true });
      document.addEventListener("keydown",     onGesture, { once: true });
      document.addEventListener("touchstart",  onGesture, { once: true });
    });
    tryPlay();

    return () => {
      a.removeEventListener("play",  onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onErr);
    };
  }, [volume]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setError("再生できませんでした"));
    else a.pause();
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    const next = !a.muted;
    a.muted = next;
    setMuted(next);
    sessionStorage.setItem("bgm-muted", next ? "1" : "0");
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" playsInline />
      <div className="bgm-ctl" role="group" aria-label="Background music">
        <button
          className={`bgm-btn ${playing ? "is-playing" : ""}`}
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          title={playing ? "Pause music" : "Play music"}
        >
          {playing ? (
            // Pause icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            // Play triangle
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4l13 8-13 8V4z" />
            </svg>
          )}
        </button>
        {playing && (
          <button
            className="bgm-mute"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        )}
        {error && <div className="bgm-err">{error}</div>}
      </div>

      <style>{`
        .bgm-ctl {
          position: fixed;
          right: 14px;
          bottom: 14px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }
        .bgm-btn, .bgm-mute {
          appearance: none;
          border: 0;
          cursor: pointer;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: inline-flex; align-items: center; justify-content: center;
          color: #fff;
          transition: transform .2s ease, box-shadow .2s ease, background .2s;
        }
        .bgm-btn {
          width: 40px; height: 40px;
          background:
            radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.25), rgba(255,255,255,0) 60%),
            linear-gradient(180deg, rgba(138,91,122,0.92) 0%, rgba(74,19,64,0.92) 100%);
          box-shadow:
            0 0 0 1px rgba(215,178,106,0.55) inset,
            0 0 0 2px rgba(255,255,255,0.25) inset,
            0 6px 18px rgba(74,19,64,0.45);
        }
        .bgm-btn:hover {
          transform: translateY(-1px) scale(1.04);
          box-shadow:
            0 0 0 1px rgba(215,178,106,0.85) inset,
            0 0 0 2px rgba(255,255,255,0.35) inset,
            0 0 14px rgba(255,210,230,0.7),
            0 10px 22px rgba(74,19,64,0.55);
        }
        .bgm-btn:active { transform: scale(0.97); }

        .bgm-btn.is-playing {
          animation: bgmPulse 1.6s ease-in-out infinite;
        }
        @keyframes bgmPulse {
          0%, 100% { box-shadow:
            0 0 0 1px rgba(215,178,106,0.55) inset,
            0 0 0 2px rgba(255,255,255,0.25) inset,
            0 6px 18px rgba(74,19,64,0.45),
            0 0 0 0 rgba(255,180,210, 0.6); }
          50% { box-shadow:
            0 0 0 1px rgba(215,178,106,0.85) inset,
            0 0 0 2px rgba(255,255,255,0.35) inset,
            0 6px 18px rgba(74,19,64,0.45),
            0 0 0 8px rgba(255,180,210, 0); }
        }

        .bgm-mute {
          width: 26px; height: 26px;
          font-size: 12px;
          background: rgba(20,10,20,0.5);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.18) inset, 0 4px 10px rgba(0,0,0,0.3);
        }
        .bgm-mute:hover { background: rgba(20,10,20,0.7); }

        .bgm-err {
          font-family: system-ui, sans-serif;
          font-size: 11px;
          color: #fff;
          background: rgba(180, 50, 50, 0.85);
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          max-width: 200px;
          text-align: center;
        }
      `}</style>
    </>);

}

Object.assign(window, { BGM });
