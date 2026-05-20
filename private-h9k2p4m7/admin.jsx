// Admin app for the hidden gallery management page.
// Renders into #root. Uses window.GalleryStore (gallery-store.js).
const { useEffect, useRef, useState, useCallback } = React;

function AdminApp() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0); // count of in-flight uploads
  const [toast, setToast] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null); // photo pending delete
  const [dragOver, setDragOver] = useState(false);

  // Reorder state — index in `photos` of the card being dragged + the
  // index it would land at if released now. Stored as refs so dragover
  // handlers don't re-render on every pointer move.
  const dragFrom = useRef(null);
  const [dragTo, setDragTo] = useState(null);

  const configured = window.GalleryStore && window.GalleryStore.isConfigured();

  // ── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!configured) { setLoading(false); return; }
    try {
      const data = await window.GalleryStore.list();
      setPhotos(data);
    } catch (e) {
      console.error(e);
      showToast("読み込みに失敗しました", "err");
    } finally {
      setLoading(false);
    }
  }, [configured, showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  // Realtime: refetch when another tab or the public page changes data.
  useEffect(() => {
    if (!configured) return;
    return window.GalleryStore.subscribe(() => refresh());
  }, [configured, refresh]);

  // ── Upload ─────────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (fileList) => {
    if (!configured) return;
    const files = Array.from(fileList).filter((f) => /^image\//.test(f.type));
    if (!files.length) {
      showToast("画像ファイルを選択してください", "err");
      return;
    }
    setUploading((n) => n + files.length);
    let ok = 0, fail = 0;
    for (const file of files) {
      try {
        await window.GalleryStore.upload(file);
        ok++;
      } catch (e) {
        console.error(e);
        fail++;
      } finally {
        setUploading((n) => n - 1);
      }
    }
    await refresh();
    if (ok && !fail) showToast(`${ok}枚アップロード完了`);
    else if (ok && fail) showToast(`${ok}枚成功 / ${fail}枚失敗`, "err");
    else showToast("アップロード失敗", "err");
  }, [configured, refresh, showToast]);

  // ── Caption ────────────────────────────────────────────────────────────
  const onCaptionBlur = useCallback(async (photo, e) => {
    const next = e.target.value;
    if (next === (photo.caption || "")) return;
    // Optimistic update
    setPhotos((arr) => arr.map((p) => (p.id === photo.id ? { ...p, caption: next } : p)));
    try {
      await window.GalleryStore.updateCaption(photo.id, next);
    } catch (err) {
      console.error(err);
      showToast("キャプション保存失敗", "err");
      refresh();
    }
  }, [refresh, showToast]);

  // ── Delete ─────────────────────────────────────────────────────────────
  const doDelete = useCallback(async () => {
    const p = confirmDel;
    setConfirmDel(null);
    if (!p) return;
    setPhotos((arr) => arr.filter((x) => x.id !== p.id));
    try {
      await window.GalleryStore.remove(p.id, p.storage_path);
      showToast("削除しました");
    } catch (e) {
      console.error(e);
      showToast("削除失敗", "err");
      refresh();
    }
  }, [confirmDel, refresh, showToast]);

  // ── Reorder ────────────────────────────────────────────────────────────
  // HTML5 drag-and-drop. Visual: source card fades, target card gets ring.
  // On drop we splice the array and persist.
  const onCardDragStart = (idx) => (e) => {
    dragFrom.current = idx;
    e.dataTransfer.effectAllowed = "move";
    // Some browsers require dataTransfer to be set or the drag is cancelled
    try { e.dataTransfer.setData("text/plain", String(idx)); } catch {}
    // Use requestAnimationFrame so the drag image is captured first.
    requestAnimationFrame(() => setDragTo(idx));
  };
  const onCardDragOver = (idx) => (e) => {
    if (dragFrom.current === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragTo !== idx) setDragTo(idx);
  };
  const onCardDragEnd = () => { dragFrom.current = null; setDragTo(null); };
  const onCardDrop = (idx) => async (e) => {
    e.preventDefault();
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragTo(null);
    if (from === null || from === idx) return;
    const next = photos.slice();
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    setPhotos(next);
    try {
      await window.GalleryStore.reorder(next.map((p) => p.id));
    } catch (err) {
      console.error(err);
      showToast("並び替え保存失敗", "err");
      refresh();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <header className="head">
        <div>
          <span className="eyebrow">A Magical 18th · Private</span>
          <h1>Gallery Admin</h1>
        </div>
        <div className="count">
          {loading ? "読み込み中…" : `${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
          {uploading > 0 && ` · アップロード中 (${uploading})`}
        </div>
      </header>

      {!configured && (
        <div className="warn">
          <strong>Supabase が未設定です。</strong><br />
          <code>deploy/gallery-config.js</code> に Supabase URL と anon key を記入してください。
          手順は <code>deploy/SUPABASE_SETUP.md</code> 参照。
        </div>
      )}

      <DropZone
        disabled={!configured}
        busy={uploading > 0}
        onFiles={handleFiles}
        dragOver={dragOver}
        setDragOver={setDragOver}
      />

      {photos.length === 0 && !loading && configured && (
        <div className="empty">写真をドロップして始めましょう ✨</div>
      )}

      <div className="grid">
        {photos.map((p, i) => (
          <PhotoCard
            key={p.id}
            photo={p}
            index={i}
            dragging={dragFrom.current === i}
            dropTarget={dragTo === i && dragFrom.current !== null && dragFrom.current !== i}
            onDragStart={onCardDragStart(i)}
            onDragOver={onCardDragOver(i)}
            onDragEnd={onCardDragEnd}
            onDrop={onCardDrop(i)}
            onCaptionBlur={onCaptionBlur}
            onDelete={() => setConfirmDel(p)}
          />
        ))}
      </div>

      {toast && (
        <div className={`toast ${toast.kind === "err" ? "err" : ""}`}>{toast.msg}</div>
      )}

      {confirmDel && (
        <ConfirmDialog
          photo={confirmDel}
          onCancel={() => setConfirmDel(null)}
          onConfirm={doDelete}
        />
      )}
    </>
  );
}

function DropZone({ disabled, busy, onFiles, dragOver, setDragOver }) {
  const inputRef = useRef(null);
  const depth = useRef(0);

  const onClick = () => { if (!disabled) inputRef.current && inputRef.current.click(); };
  const onChange = (e) => { if (e.target.files && e.target.files.length) onFiles(e.target.files); e.target.value = ""; };

  const onDragEnter = (e) => {
    if (disabled) return;
    e.preventDefault();
    depth.current++;
    setDragOver(true);
  };
  const onDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragLeave = () => {
    if (--depth.current <= 0) { depth.current = 0; setDragOver(false); }
  };
  const onDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    depth.current = 0;
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`drop ${dragOver ? "over" : ""} ${busy ? "busy" : ""}`}
      onClick={onClick}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
    >
      <div className="big">{busy ? "Uploading…" : "Drop Photos"}</div>
      <div className="sub">
        {busy ? "しばらくお待ちください" : "ここに画像をドロップ または クリックして選択（複数可）"}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={onChange} />
    </div>
  );
}

function PhotoCard({ photo, index, dragging, dropTarget, onDragStart, onDragOver, onDragEnd, onDrop, onCaptionBlur, onDelete }) {
  return (
    <div
      className={`card ${dragging ? "dragging" : ""} ${dropTarget ? "drop-target" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className="thumb-wrap">
        <img src={photo.url} alt="" loading="lazy" draggable={false} />
        <div className="pos">#{index + 1}</div>
        <button className="del" aria-label="削除" onClick={(e) => { e.stopPropagation(); onDelete(); }}>×</button>
      </div>
      <textarea
        className="cap"
        defaultValue={photo.caption || ""}
        placeholder="キャプション…"
        onBlur={(e) => onCaptionBlur(photo, e)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.target.blur(); }
        }}
        onDragStart={(e) => e.preventDefault()}
        rows={1}
      />
    </div>
  );
}

function ConfirmDialog({ photo, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, onConfirm]);
  return (
    <div className="modal-wrap" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>削除しますか？</h3>
        <p>この写真は元に戻せません。{photo.caption ? `「${photo.caption}」` : ""}</p>
        <div className="row">
          <button className="btn btn-ghost" onClick={onCancel}>キャンセル</button>
          <button className="btn btn-danger" onClick={onConfirm}>削除</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
