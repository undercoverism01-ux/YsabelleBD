// Gallery + Dress Code modals — fade-in overlays with placeholder visuals.
const { useEffect, useState, useCallback } = React;

function SparkleBurst() {
  const sparks = React.useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    angle: (i / 22) * 360 + Math.random() * 12,
    dist: 120 + Math.random() * 180,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 120,
    color: ["#fff", "#ffd6ec", "#f7c8e6", "#ffe9b5"][i % 4],
  })), []);
  return (
    <div className="sb-burst" aria-hidden="true">
      {sparks.map((s) => (
        <span key={s.id} className="sb-spark" style={{
          width: s.size, height: s.size,
          background: `radial-gradient(circle, #fff 0%, ${s.color} 50%, transparent 75%)`,
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          "--ang": `${s.angle}deg`,
          "--dist": `${s.dist}px`,
          animationDelay: `${s.delay}ms`,
        }} />
      ))}
      <style>{`
        .sb-burst {
          position: absolute; left: 50%; top: 50%;
          width: 0; height: 0;
          pointer-events: none;
          z-index: 4;
        }
        .sb-spark {
          position: absolute; left: 0; top: 0;
          border-radius: 50%;
          transform: translate(-50%, -50%) rotate(var(--ang)) translateX(0);
          opacity: 0;
          animation: sb-out 800ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes sb-out {
          0%   { opacity: 0; transform: translate(-50%, -50%) rotate(var(--ang)) translateX(0) scale(0.4); }
          25%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--ang)) translateX(var(--dist)) scale(0.6); }
        }
      `}</style>
    </div>);

}

function ModalShell({ open, onClose, children, labelledBy, anim = "fade", cardClass = "" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={`mdl mdl-anim-${anim} ${open ? "mdl-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      onClick={onClose}
    >
      <div className="mdl-scrim" aria-hidden="true"></div>
      {anim === "sparkle" && open && <SparkleBurst />}
      <div className={`mdl-card ${cardClass}`} onClick={(e) => e.stopPropagation()}>
        <button className="mdl-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
      <style>{`
        .mdl {
          position: fixed; inset: 0;
          z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 12px;
          opacity: 0;
          visibility: hidden;
          transition: opacity .42s ease, visibility 0s linear .42s;
        }
        .mdl.mdl-open {
          opacity: 1;
          visibility: visible;
          transition: opacity .42s ease, visibility 0s;
        }
        .mdl-scrim {
          position: absolute; inset: 0;
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(120, 50, 110, 0.55), rgba(40, 12, 50, 0.78) 60%),
            rgba(28, 10, 40, 0.55);
          backdrop-filter: blur(8px) saturate(110%);
          -webkit-backdrop-filter: blur(8px) saturate(110%);
        }
        .mdl-card {
          position: relative;
          width: min(100%, 880px);
          max-height: calc(100dvh - 24px);
          background:
            radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.65), rgba(255,255,255,0) 60%),
            linear-gradient(180deg, #fbe9ee 0%, #f3cdd9 60%, #e6acc1 100%);
          border-radius: 22px;
          box-shadow:
            0 0 0 1px rgba(180,130,80,0.55) inset,
            0 0 0 6px rgba(255,255,255,0.45) inset,
            0 30px 80px -20px rgba(60, 20, 60, 0.7);
          color: #3a124e;
          display: flex; flex-direction: column;
          overflow: hidden;
          transform: translateY(14px) scale(0.985);
          opacity: 0;
          transition: transform .55s cubic-bezier(.2,.8,.2,1), opacity .42s ease;
        }
        .mdl-open .mdl-card {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .mdl-close {
          position: absolute; top: 12px; right: 12px;
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 0;
          background: rgba(255,255,255,0.8);
          color: #5a1f4a;
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(80,30,80,0.25), 0 0 0 1px rgba(180,130,80,0.35);
          z-index: 5;
          transition: transform .2s ease, background .2s ease;
        }
        .mdl-close:hover { transform: scale(1.06); background: #fff; }

        .mdl-head {
          padding: 18px 22px 6px;
          flex: 0 0 auto;
          text-align: center;
          font-family: "Cormorant Garamond", "Playfair Display", serif;
        }
        .mdl-eyebrow {
          font-family: "Cinzel", serif;
          letter-spacing: 0.32em;
          font-size: 11px;
          color: #8a3b6b;
          text-transform: uppercase;
        }
        .mdl-title {
          font-family: "Allura", "Cormorant Garamond", serif;
          font-size: clamp(38px, 6vw, 56px);
          line-height: 1;
          margin: 4px 0 6px;
          color: #4a1340;
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
        }
        .mdl-subtitle {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 15px;
          color: #6e3a5a;
        }
        .mdl-rule {
          margin: 10px auto 0;
          width: 56px; height: 1px;
          background: linear-gradient(90deg, transparent, #b58f3e, transparent);
        }
      `}</style>
    </div>);

}

/* ------------------ GALLERY ------------------ */
// Read-only gallery. Photos are managed from the private admin page and
// fetched from Supabase via window.GalleryStore. The store handles auth +
// realtime; here we just list, render, and lightbox-navigate.

function GalleryModal({ open, onClose, anim = "fade" }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // index in photos

  const close = useCallback(() => {
    if (active !== null) setActive(null);
    else onClose();
  }, [active, onClose]);

  // Fetch on open + subscribe to realtime updates while open.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const fetchOnce = async () => {
      if (!window.GalleryStore || !window.GalleryStore.isConfigured()) {
        if (alive) { setPhotos([]); setLoading(false); }
        return;
      }
      try {
        const data = await window.GalleryStore.list();
        if (alive) { setPhotos(data); setLoading(false); }
      } catch (e) {
        console.error(e);
        if (alive) setLoading(false);
      }
    };
    setLoading(true);
    fetchOnce();
    const unsub = window.GalleryStore && window.GalleryStore.isConfigured()
      ? window.GalleryStore.subscribe(fetchOnce)
      : () => {};
    return () => { alive = false; unsub && unsub(); };
  }, [open]);

  // Lightbox keyboard nav.
  useEffect(() => {
    if (!open) { setActive(null); return; }
    const onKey = (e) => {
      if (active === null || photos.length === 0) return;
      if (e.key === "ArrowRight") setActive((active + 1) % photos.length);
      if (e.key === "ArrowLeft")  setActive((active - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, active, photos.length]);

  const navLb = (dir) => () => {
    if (!photos.length) return;
    setActive((a) => (a === null ? 0 : (a + dir + photos.length) % photos.length));
  };

  const activePhoto = active !== null ? photos[active] : null;

  return (
    <ModalShell open={open} onClose={close} labelledBy="gal-title" anim={anim}>
      <header className="mdl-head">
        <div className="mdl-eyebrow">A Magical 18th</div>
        <h2 id="gal-title" className="mdl-title">Gallery</h2>
        <div className="mdl-subtitle">memories of ysabelle</div>
        <div className="mdl-rule"></div>
      </header>

      <div className="gal-grid">
        {!loading && photos.length === 0 && (
          <div className="gal-empty">
            <em>Photos coming soon ✨</em>
          </div>
        )}
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="gal-cell"
            onClick={() => setActive(i)}
            aria-label={p.caption || `Photo ${i + 1}`}
          >
            <img src={p.url} alt={p.caption || ""} loading="lazy" draggable={false} />
            {p.caption && <span className="gal-cap-overlay">{p.caption}</span>}
          </button>
        ))}
      </div>

      <footer className="gal-foot">
        <span>
          {loading
            ? "loading…"
            : photos.length === 0
              ? "—"
              : `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
        </span>
      </footer>

      {/* Lightbox */}
      <div className={`gal-lb ${activePhoto ? "gal-lb-open" : ""}`} onClick={() => setActive(null)} aria-hidden={!activePhoto}>
        {activePhoto && (
          <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
            <button className="lb-nav lb-prev" aria-label="Previous" onClick={navLb(-1)}>‹</button>
            <div className="lb-tile">
              <img src={activePhoto.url} alt={activePhoto.caption || ""} />
              {activePhoto.caption && <div className="lb-caption">{activePhoto.caption}</div>}
            </div>
            <button className="lb-nav lb-next" aria-label="Next" onClick={navLb(1)}>›</button>
            <div className="lb-counter">
              {active + 1} / {photos.length}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gal-grid {
          flex: 1 1 auto;
          min-height: 0;
          padding: 8px 14px 18px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          grid-auto-rows: max-content;
          align-items: start;
          gap: 10px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          align-content: start;
        }
        .gal-cell {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 235, 245, 0.55);
          box-shadow:
            0 0 0 1px rgba(180,130,80,0.55) inset,
            0 4px 14px -6px rgba(80, 30, 80, 0.35);
          transition: transform .25s cubic-bezier(.2,.8,.2,1), filter .25s ease;
          padding: 0;
          border: 0;
          cursor: zoom-in;
          display: block;
          font: inherit;
          color: inherit;
        }
        .gal-cell:hover { transform: translateY(-2px) scale(1.015); filter: brightness(1.04) saturate(1.04); }
        .gal-cell img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
        }
        .gal-cap-overlay {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          padding: 16px 10px 8px;
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 13px;
          color: #fff;
          text-align: left;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%);
          line-height: 1.25;
          pointer-events: none;
          text-shadow: 0 1px 4px rgba(0,0,0,0.45);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .gal-empty {
          grid-column: 1 / -1;
          padding: 60px 20px;
          text-align: center;
          font-family: "Cormorant Garamond", serif;
          color: #8a5b7a;
          font-size: 16px;
        }
        .lb-tile {
          width: 100%;
          position: relative;
        }
        .lb-caption {
          margin-top: 10px;
          text-align: center;
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 15px;
          color: #fce7f0;
          padding: 0 8px;
          line-height: 1.35;
        }
        .lb-tile img {
          display: block;
          width: 100%;
          height: auto;
          max-height: calc(100vh - 160px);
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 30px 80px -20px rgba(0,0,0,0.7);
        }
        .gal-foot {
          flex: 0 0 auto;
          padding: 8px 22px 16px;
          text-align: center;
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 13px;
          color: #6e3a5a;
        }

        /* Lightbox */
        .gal-lb {
          position: absolute; inset: 0;
          background: rgba(28, 10, 40, 0.78);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; visibility: hidden;
          transition: opacity .35s ease, visibility 0s linear .35s;
          z-index: 6;
        }
        .gal-lb.gal-lb-open { opacity: 1; visibility: visible; transition: opacity .35s ease, visibility 0s; }
        .lb-stage {
          position: relative;
          width: min(72%, 460px);
        }
        .lb-tile { width: 100%; }
        .lb-counter {
          margin-top: 12px; text-align: center;
          font-family: "Cinzel", serif;
          color: #fce7f0;
          font-size: 11px; letter-spacing: 0.32em;
        }
        .lb-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px;
          border: 0; border-radius: 50%;
          background: rgba(255,255,255,0.85);
          color: #4a1340;
          font-size: 26px; line-height: 1;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.35);
          transition: transform .2s ease, background .2s ease;
        }
        .lb-nav:hover { transform: translateY(-50%) scale(1.06); background: #fff; }
        .lb-prev { left: -56px; }
        .lb-next { right: -56px; }

        @media (max-width: 560px) {
          .gal-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 6px 12px 14px; }
          .mdl-head { padding: 14px 16px 4px; }
          .mdl-title { font-size: 38px !important; }
          .mdl-subtitle { font-size: 13px; }
          .gal-foot { padding: 6px 16px 12px; font-size: 12px; }
          .lb-stage { width: calc(100% - 24px); }
          .lb-prev { left: 4px; }
          .lb-next { right: 4px; }
        }
        @media (max-width: 380px) {
          .gal-grid { gap: 6px; padding: 4px 10px 12px; }
          .mdl-title { font-size: 32px !important; }
        }
      `}</style>
    </ModalShell>);

}

/* ------------------ DRESS CODE ------------------ */

function DressCodeModal({ open, onClose, anim = "fade" }) {
  return (
    <ModalShell open={open} onClose={onClose} labelledBy="dc-title" anim={anim} cardClass="mdl-card-fit">
      <div className="dc-img-wrap">
        <img src="assets/dresscode.compressed.webp" alt="Dress Code" className="dc-img" />
      </div>

      <style>{`
        .mdl-card-fit {
          display: inline-block !important;
          width: auto !important;
          max-width: calc(100vw - 48px) !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 16px !important;
          overflow: visible !important;
        }
        .mdl-card-fit .mdl-close { top: 6px; right: 6px; }
        .dc-img-wrap {
          position: relative;
          display: block;
          line-height: 0;
        }
        .dc-img {
          display: block;
          max-width: calc(100vw - 48px);
          max-height: calc(100vh - 48px);
          width: auto;
          height: auto;
          border-radius: 16px;
          user-select: none;
          -webkit-user-drag: none;
        }
      `}</style>
    </ModalShell>);

}

Object.assign(window, { GalleryModal, DressCodeModal });
