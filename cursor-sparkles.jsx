// Cursor-trailing sparkle effect — gentle dust that falls and fades.
const { useEffect, useRef } = React;

function CursorSparkles() {
  const layerRef = useRef(null);
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const colors = ["#fff5fa", "#ffd6ec", "#f7c8e6", "#ffe9b5", "#e8d4ff"];
    let last = 0;
    let lastX = -1, lastY = -1;

    const spawn = (x, y, count = 1) => {
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        s.className = "cs-spark";
        const size = 4 + Math.random() * 8;
        const dx = (Math.random() - 0.5) * 36;
        const dy = 30 + Math.random() * 60;
        const rot = (Math.random() - 0.5) * 180;
        const dur = 700 + Math.random() * 700;
        const color = colors[(Math.random() * colors.length) | 0];
        s.style.cssText = `
          left: ${x}px; top: ${y}px;
          width: ${size}px; height: ${size}px;
          --dx: ${dx}px; --dy: ${dy}px; --rot: ${rot}deg;
          background: radial-gradient(circle, #fff 0%, ${color} 45%, transparent 70%);
          box-shadow: 0 0 ${size * 1.4}px ${color};
          animation-duration: ${dur}ms;
        `;
        layer.appendChild(s);
        setTimeout(() => s.remove(), dur + 80);
      }
    };

    const onMove = (e) => {
      const now = performance.now();
      const x = e.clientX, y = e.clientY;
      // Throttle: ~60ms between spawns, plus extra spawns on fast movement
      if (now - last < 28) return;
      last = now;
      const moved = lastX < 0 ? 0 : Math.hypot(x - lastX, y - lastY);
      const count = 1 + (moved > 40 ? 2 : moved > 18 ? 1 : 0);
      spawn(x, y, count);
      lastX = x; lastY = y;
    };
    const onTouch = (e) => {
      const t = e.touches[0]; if (!t) return;
      onMove({ clientX: t.clientX, clientY: t.clientY });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });

    // Butterfly sparkle trail
    let bfTimer = 0;
    const bfTick = () => {
      const orbits = document.querySelectorAll(".butterfly-field .bf-orbit");
      orbits.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const cx = r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.4;
        const cy = r.top + r.height / 2 + (Math.random() - 0.5) * r.height * 0.4;
        if (Math.random() < 0.5) spawn(cx, cy, 1);
      });
    };
    bfTimer = setInterval(bfTick, 180);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      clearInterval(bfTimer);
    };
  }, []);

  return (
    <div className="cs-layer" ref={layerRef} aria-hidden="true">
      <style>{`
        .cs-layer {
          position: fixed; inset: 0;
          pointer-events: none;
          z-index: 80;
          overflow: hidden;
        }
        .cs-spark {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation-name: cs-fall;
          animation-timing-function: cubic-bezier(.3, .6, .4, 1);
          animation-fill-mode: forwards;
          will-change: transform, opacity;
        }
        @keyframes cs-fall {
          0%   { transform: translate(-50%, -50%) scale(0.6) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(calc(var(--rot) * 0.3)); }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.2) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, { CursorSparkles });
