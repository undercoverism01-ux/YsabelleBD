// Shared photo store for the Gallery (read) and the private admin page (CRUD).
//
// Depends on:
//   • window.GALLERY_CONFIG     — set by gallery-config.js
//   • window.supabase           — loaded from @supabase/supabase-js v2 UMD
//
// Exposes window.GalleryStore with:
//   isConfigured(): bool
//   list(): Promise<Photo[]>          — sorted by sort_order, oldest-first tiebreak
//   upload(file): Promise<Photo>      — uploads to storage + inserts row
//   updateCaption(id, caption): Promise<void>
//   remove(id, storage_path): Promise<void>
//   reorder(orderedIds): Promise<void> — batches sort_order updates
//   subscribe(fn): unsubscribe        — fn() called on any change (realtime)
//
// Photo shape: { id, storage_path, caption, sort_order, created_at, url }
(() => {
  const C = window.GALLERY_CONFIG || {};
  const configured = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);

  let client = null;
  if (configured) {
    try {
      client = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.error("[GalleryStore] createClient failed:", e);
    }
  }

  const TABLE = C.TABLE || "gallery_photos";
  const BUCKET = C.BUCKET || "gallery";

  function publicUrl(storage_path) {
    if (!client || !storage_path) return null;
    const { data } = client.storage.from(BUCKET).getPublicUrl(storage_path);
    return data && data.publicUrl;
  }

  function decorate(row) {
    return Object.assign({}, row, { url: publicUrl(row.storage_path) });
  }

  async function list() {
    if (!client) return [];
    const { data, error } = await client
      .from(TABLE)
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) { console.error("[GalleryStore] list", error); return []; }
    return (data || []).map(decorate);
  }

  // Sanitize filename for storage. Keep extension, strip unsafe chars.
  function safeName(file) {
    const dot = file.name.lastIndexOf(".");
    const ext = (dot > 0 ? file.name.slice(dot) : "").toLowerCase().replace(/[^.a-z0-9]/g, "");
    const stamp = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    return `${stamp}${ext || ".jpg"}`;
  }

  async function upload(file) {
    if (!client) throw new Error("Supabase が未設定です。gallery-config.js を確認してください。");
    if (!/^image\//.test(file.type)) throw new Error("画像ファイルのみアップロードできます。");

    const path = safeName(file);

    // 1. Upload to storage
    const { error: upErr } = await client.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;

    // 2. Pick a sort_order at the end of the list
    const { data: maxRow } = await client
      .from(TABLE)
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const next = ((maxRow && maxRow.sort_order) || 0) + 10;

    // 3. Insert row
    const { data: row, error: insErr } = await client
      .from(TABLE)
      .insert({ storage_path: path, sort_order: next, caption: "" })
      .select()
      .single();
    if (insErr) {
      // Try to clean up the orphaned upload
      client.storage.from(BUCKET).remove([path]).catch(() => {});
      throw insErr;
    }
    return decorate(row);
  }

  async function updateCaption(id, caption) {
    if (!client) return;
    const { error } = await client
      .from(TABLE)
      .update({ caption: caption || "" })
      .eq("id", id);
    if (error) throw error;
  }

  async function remove(id, storage_path) {
    if (!client) return;
    const { error } = await client.from(TABLE).delete().eq("id", id);
    if (error) throw error;
    if (storage_path) {
      const { error: rmErr } = await client.storage.from(BUCKET).remove([storage_path]);
      if (rmErr) console.warn("[GalleryStore] storage remove", rmErr);
    }
  }

  // Re-number sort_order for the provided id list. Step of 10 so single moves
  // later can slot between without renumbering the entire list.
  async function reorder(orderedIds) {
    if (!client || !orderedIds || !orderedIds.length) return;
    const updates = orderedIds.map((id, i) =>
      client.from(TABLE).update({ sort_order: (i + 1) * 10 }).eq("id", id)
    );
    const results = await Promise.all(updates);
    const firstErr = results.find((r) => r.error);
    if (firstErr) throw firstErr.error;
  }

  // Realtime subscription. Calls fn() on any insert/update/delete.
  function subscribe(fn) {
    if (!client) return () => {};
    const channel = client
      .channel("gallery_photos_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => fn())
      .subscribe();
    return () => { try { client.removeChannel(channel); } catch {} };
  }

  window.GalleryStore = {
    isConfigured: () => configured,
    list,
    upload,
    updateCaption,
    remove,
    reorder,
    subscribe,
    publicUrl,
  };
})();
