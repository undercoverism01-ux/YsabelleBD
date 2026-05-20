// Floating butterflies & sparkles. Pure CSS-driven via random anchors.
const { useMemo } = React;

function Butterfly({ size = 28 }) {
  return (
    <img
      src="assets/butterfly.compressed.webp"
      width={size}
      height={size}
      alt=""
      style={{ display: "block", filter: "drop-shadow(0 4px 8px rgba(180,80,140,0.3))" }}
    />
  );
}

function FloatingButterflies({ density = 8 }) {
  const items = useMemo(() => {
    const arr = [];
    const rng = mulberry(42);
    for (let i = 0; i < density; i++) {
      arr.push({
        id: i,
        left: rng() * 100,
        top: rng() * 100,
        size: 32 + rng() * 28,
        delay: -rng() * 14,
        dur: 16 + rng() * 12,
        sway: 30 + rng() * 60,
        rise: 60 + rng() * 120,
        flap: 0.6 + rng() * 0.5,
      });
    }
    return arr;
  }, [density]);

  return (
    <div className="butterfly-field" aria-hidden="true">
      {items.map((b) => (
        <div
          key={b.id}
          className="bf-orbit"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            animation: `bf-rise ${b.dur}s ${b.delay}s linear infinite`,
            "--sway": `${b.sway}px`,
            "--rise": `${b.rise}px`,
          }}
        >
          <div className="bf-flap" style={{ animationDuration: `${b.flap}s` }}>
            <Butterfly size={b.size} />
          </div>
        </div>
      ))}
      <style>{`
        .butterfly-field {
          position: fixed; inset: 0; pointer-events: none; z-index: 30;
        }
        .bf-orbit {
          position: absolute;
          will-change: transform, opacity;
          opacity: 0.85;
        }
        .bf-flap {
          animation-name: bf-flap;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          transform-origin: 50% 60%;
        }
        @keyframes bf-rise {
          0%   { transform: translate(0, 20vh) rotate(-6deg); opacity: 0; }
          8%   { opacity: .9; }
          50%  { transform: translate(calc(var(--sway) * -1), -40vh) rotate(8deg); }
          92%  { opacity: .9; }
          100% { transform: translate(var(--sway), -110vh) rotate(-4deg); opacity: 0; }
        }
        @keyframes bf-flap {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.45); }
        }
      `}</style>
    </div>
  );
}

function Sparkles({ density = 30 }) {
  const items = useMemo(() => {
    const arr = [];
    const rng = mulberry(7);
    for (let i = 0; i < density; i++) {
      arr.push({
        id: i,
        left: rng() * 100,
        top: rng() * 100,
        size: 2 + rng() * 4,
        delay: -rng() * 6,
        dur: 3 + rng() * 4,
      });
    }
    return arr;
  }, [density]);
  return (
    <div className="sparkle-field" aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <style>{`
        .sparkle-field { position: absolute; inset: 0; pointer-events: none; }
        .spark {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, rgba(255,200,230,0.9) 40%, transparent 70%);
          box-shadow: 0 0 6px rgba(255,180,220,0.9);
          animation-name: twinkle;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function mulberry(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

Object.assign(window, { Butterfly, FloatingButterflies, Sparkles });
