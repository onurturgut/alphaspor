"use client";
import { useEffect, useState } from "react";
type User = {
  _id: string;
  name?: string;
  email: string;
  role?: "admin" | "editor";
  active: boolean;
};
const empty = {
  id: undefined as string | undefined,
  name: "",
  email: "",
  role: "editor" as "admin" | "editor",
  active: true,
  password: "",
};
export function UserManagement({
  onDirtyChange,
}: {
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [draft, setDraft] = useState(empty);
  const [baseline, setBaseline] = useState(empty);
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  function changeDraft(next: typeof empty) {
    setDraft(next);
    onDirtyChange(JSON.stringify(next) !== JSON.stringify(baseline));
  }
  function selectDraft(next: typeof empty) {
    if (
      busy ||
      (dirty && !confirm("Kaydedilmemiş kullanıcı değişiklikleri silinsin mi?"))
    )
      return;
    setDraft(next);
    setBaseline(next);
    onDirtyChange(false);
    setMessage("");
  }
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setUsers(data.records);
  }
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/admin/users", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Kullanıcılar yüklenemedi.");
        if (!controller.signal.aborted) setUsers(data.records);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setMessage(
            error instanceof Error
              ? error.message
              : "Kullanıcılar yüklenemedi.",
          );
      });
    return () => controller.abort();
  }, []);
  return (
    <section className="admin-card admin-users">
      <div className="admin-section-heading">
        <div>
          <p className="admin-kicker">ERİŞİM YÖNETİMİ</p>
          <h2>Kullanıcılar ve yetkiler</h2>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => selectDraft(empty)}
        >
          + Kullanıcı ekle
        </button>
      </div>
      <p className="admin-help">
        Yönetici, kullanıcıları ve içerikleri yönetir. Editör yalnızca
        içerikleri düzenler.
      </p>
      <div className="admin-user-grid">
        <div>
          {users.map((user) => (
            <button
              className="admin-user-row"
              type="button"
              key={user._id}
              aria-pressed={draft.id === user._id}
              disabled={busy}
              onClick={() =>
                selectDraft({
                  id: user._id,
                  name: user.name ?? "",
                  email: user.email,
                  role: user.role ?? "admin",
                  active: user.active,
                  password: "",
                })
              }
            >
              <span>
                <strong>{user.name || user.email}</strong>
                <small>{user.email}</small>
              </span>
              <span className="admin-badge">
                {user.active ? "Aktif" : "Pasif"} ·{" "}
                {(user.role ?? "admin") === "admin" ? "Yönetici" : "Editör"}
              </span>
            </button>
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              const response = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(draft),
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);
              setDraft(empty);
              setBaseline(empty);
              onDirtyChange(false);
              setMessage("Kullanıcı kaydedildi.");
              try {
                await load();
              } catch {
                setMessage(
                  "Kullanıcı kaydedildi; liste yenilenemedi. Sayfayı yenileyin.",
                );
              }
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Kaydedilemedi.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <fieldset disabled={busy}>
            <h3>{draft.id ? "Kullanıcıyı düzenle" : "Yeni kullanıcı"}</h3>
            <label>
              Ad soyad
              <input
                required
                value={draft.name}
                onChange={(e) =>
                  changeDraft({ ...draft, name: e.target.value })
                }
              />
            </label>
            <label>
              E-posta
              <input
                type="email"
                required
                value={draft.email}
                onChange={(e) =>
                  changeDraft({ ...draft, email: e.target.value })
                }
              />
            </label>
            <label>
              Yetki
              <select
                value={draft.role}
                onChange={(e) =>
                  changeDraft({
                    ...draft,
                    role: e.target.value as "admin" | "editor",
                  })
                }
              >
                <option value="editor">Editör</option>
                <option value="admin">Yönetici</option>
              </select>
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) =>
                  changeDraft({ ...draft, active: e.target.checked })
                }
              />
              Hesap aktif
            </label>
            <label>
              {draft.id ? "Yeni şifre (değişmeyecekse boş bırakın)" : "Şifre"}
              <input
                type="password"
                autoComplete="new-password"
                required={!draft.id}
                minLength={12}
                maxLength={200}
                value={draft.password}
                onChange={(e) =>
                  changeDraft({ ...draft, password: e.target.value })
                }
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const bytes = crypto.getRandomValues(new Uint8Array(18));
                changeDraft({
                  ...draft,
                  password: Array.from(bytes, (b) =>
                    b.toString(16).padStart(2, "0"),
                  ).join(""),
                });
              }}
            >
              Güçlü şifre oluştur
            </button>
            {draft.password && (
              <details>
                <summary>Şifreyi göster</summary>
                <code className="admin-generated-password">
                  {draft.password}
                </code>
              </details>
            )}
            <p className="admin-help">
              Şifre, yetki veya aktiflik değişince kullanıcının mevcut
              oturumları kapatılır.
            </p>
            <button className="admin-primary" disabled={busy}>
              {busy ? "Kaydediliyor…" : "Kullanıcıyı kaydet"}
            </button>
          </fieldset>
        </form>
      </div>
      {message && (
        <p role="status" className="admin-alert">
          {message}
        </p>
      )}
    </section>
  );
}
