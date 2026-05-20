const { useState } = React;


// Hard-coded layout values (locked by user) — kept here for reference.
const LB_Y = [32.2, 43.6, 58.6, 71, 85.4]; // Roses, Candles, Pink, Shots, Bills
const LB_PAD_X = 10.5;
const LB_PAD_Y = 1;
const LB_WIDTH = 72;
const LB_FONT = 11;
const LB_BG_OPACITY = 0.64;
const LB_BLUR = 22;
const LB_FEATHER = 21;

const BTN_GALLERY_X = 17.4;
const BTN_GALLERY_Y = 19.5;
const BTN_DRESS_X = 54.9;
const BTN_DRESS_Y = 19.5;
const BTN_W = 113;
const BTN_H = 31;
const BTN_LIFT = 4;
const BTN_SCALE = 1.065;
const BTN_GLOW = 1.15;

const CD_X = 41;
const CD_Y = 13;
const CD_W = 39;
const CD_H = 5.6;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "butterflies": true,
  "cursorTrail": true,
  "modalAnim": "sparkle"
} /*EDITMODE-END*/;

function App() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [dressOpen, setDressOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  const btnVars = {
    "--btn-w": BTN_W + "px",
    "--btn-h": BTN_H + "px",
    "--btn-lift": `${-BTN_LIFT}px`,
    "--btn-scale": BTN_SCALE,
    "--btn-glow": BTN_GLOW,
  };

  return (
    <div className="page" style={btnVars}>
      <div className="sheet">
        <img className="bg" src="assets/page-bg.compressed.jpg" alt="" />
        <div className="cd-slot" style={{ left: CD_X + "%", top: CD_Y + "%", width: CD_W + "%", height: CD_H + "%" }}><CountdownTimer /></div>
        <button className="rb rb-gallery" aria-label="Gallery" onClick={() => setGalleryOpen(true)} style={{ left: BTN_GALLERY_X + "%", top: BTN_GALLERY_Y + "%" }}>
          <span className="rb__bg" aria-hidden="true"></span>
          <span className="rb-label">GALLERY</span>
        </button>
        <button className="rb rb-dress" aria-label="Dress Code" onClick={() => setDressOpen(true)} style={{ left: BTN_DRESS_X + "%", top: BTN_DRESS_Y + "%" }}>
          <span className="rb__bg" aria-hidden="true"></span>
          <span className="rb-label">DRESS CODE</span>
        </button>
        <ListBoards
          boardYs={LB_Y}
          paddingX={LB_PAD_X}
          paddingY={LB_PAD_Y}
          fontSize={LB_FONT}
          bgOpacity={LB_BG_OPACITY}
          blur={LB_BLUR}
          feather={LB_FEATHER}
          width={LB_WIDTH}
        />
      </div>

      {t.butterflies && <FloatingButterflies density={9} />}
      {t.cursorTrail && <CursorSparkles />}

      <GalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} anim={t.modalAnim} />
      <DressCodeModal open={dressOpen} onClose={() => setDressOpen(false)} anim={t.modalAnim} />

      {!introDone && <VideoIntro src="assets/opening.mp4" onDone={() => setIntroDone(true)} onStart={() => setIntroStarted(true)} />}
      {introStarted && <BGM src="assets/bgm.mp3" volume={0.5} />}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Atmosphere">
          <TweakToggle label="Butterflies" value={t.butterflies} onChange={(v) => setT("butterflies", v)} />
          <TweakToggle label="Cursor Sparkles" value={t.cursorTrail} onChange={(v) => setT("cursorTrail", v)} />
          <TweakRadio label="Modal anim" value={t.modalAnim} options={[{value:"fade",label:"Fade"},{value:"sparkle",label:"Sparkle"}]} onChange={(v) => setT("modalAnim", v)} />
        </TweakSection>
      </TweaksPanel>

      <style>{`
        body {
          background: #2c1730 url("assets/page-bg-wide.compressed.jpg") center center / cover no-repeat fixed;
        }
        body::after {
          content: "";
          position: fixed; inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            radial-gradient(2px 2px at 12% 18%, rgba(255,255,255,0.85), transparent 60%),
            radial-gradient(1.5px 1.5px at 78% 32%, rgba(255,235,250,0.85), transparent 60%),
            radial-gradient(1.2px 1.2px at 32% 68%, rgba(255,255,255,0.7), transparent 60%),
            radial-gradient(2px 2px at 88% 78%, rgba(255,220,240,0.85), transparent 60%),
            radial-gradient(1.5px 1.5px at 24% 42%, rgba(255,255,255,0.6), transparent 60%),
            radial-gradient(1.5px 1.5px at 62% 88%, rgba(255,255,255,0.65), transparent 60%);
          animation: bgTwinkle 6s ease-in-out infinite;
        }
        @keyframes bgTwinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 24px 0;
        }
        .sheet {
          position: relative;
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          background: #fff;
          border-radius: 24px;
          box-shadow:
            0 0 0 1px rgba(215,178,106,.5) inset,
            0 0 0 6px rgba(255,255,255,.55),
            0 40px 80px -20px rgba(80, 30, 80, .55),
            0 12px 24px -8px rgba(80, 30, 80, .35);
          overflow: hidden;
          isolation: isolate;
        }
        .sheet .bg {
          display: block;
          width: 100%;
          height: auto;
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }
        .cd-slot {
          position: absolute;
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
        }
        /* Refined rectangular invitation buttons */
        .rb {
          position: absolute;
          width: var(--btn-w, 135px);
          height: var(--btn-h, 52px);
          display: inline-flex; align-items: center; justify-content: center;
          padding: 0 14px;
          border: 0;
          background: transparent;
          cursor: pointer;
          z-index: 3;
          font-family: "Cormorant Garamond", "Playfair Display", serif;
          font-style: italic;
          font-weight: 700;
          font-size: clamp(11px, 4vw, 15px);
          letter-spacing: 0.04em;
          color: transparent;
          overflow: visible;
          transition: transform .35s cubic-bezier(.2,.8,.2,1);
        }
        .rb__bg {
          position: absolute; inset: 0;
          pointer-events: none;
          border-radius: 12px;
          background:
            radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%),
            linear-gradient(180deg, #fbe9ee 0%, #f3cdd9 50%, #e6acc1 100%);
          box-shadow:
            0 0 0 1px rgba(180,130,80,0.9) inset,
            0 0 0 2px rgba(255,255,255,0.55) inset,
            0 0 0 3px rgba(180,130,80,0.6) inset,
            0 6px 14px rgba(80,40,60,0.32),
            0 2px 4px rgba(80,40,60,0.22);
          transition: box-shadow .35s ease;
          z-index: 0;
        }
        .rb-label {
          position: relative; z-index: 1;
          background: linear-gradient(180deg, #2a0a44 0%, #150624 100%);
          -webkit-background-clip: text;
                  background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 1px 0 rgba(255,255,255,0.5);
          white-space: nowrap;
        }
        .rb:hover {
          transform: translateY(var(--btn-lift, -2px)) scale(var(--btn-scale, 1.04));
        }
        .rb:hover .rb__bg {
          box-shadow:
            0 0 0 1px rgba(180,130,80,0.9) inset,
            0 0 0 2px rgba(255,255,255,0.65) inset,
            0 0 0 3px rgba(180,130,80,0.6) inset,
            0 0 calc(10px * var(--btn-glow, 1)) rgba(255,210,230, calc(0.7 * var(--btn-glow, 1))),
            0 0 calc(22px * var(--btn-glow, 1)) rgba(245,180,210, calc(0.55 * var(--btn-glow, 1))),
            0 10px 22px rgba(80,40,60,0.4);
        }
        .rb:active { transform: translateY(0) scale(0.99); }
        @media (min-width: 480px) { .page { padding: 40px 24px; } }
      `}</style>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);