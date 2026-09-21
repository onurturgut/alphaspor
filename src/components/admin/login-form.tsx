"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      router.replace("/admin"); router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Giriş yapılamadı.");
      setBusy(false);
    }
  }
  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <Link href="/" className="admin-brand">
          ALFA <span>SPOR</span>
        </Link>
        <p className="admin-kicker">İÇERİK YÖNETİMİ</p>
        <h1>Hoş geldiniz.</h1>
        <p>Siteyi yönetmek için hesabınıza giriş yapın.</p>
        <form onSubmit={submit}>
          <label>
            E-posta
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
            />
          </label>
          <label>
            Şifre
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={200}
            />
          </label>
          {error && (
            <p className="admin-alert error" role="alert">
              {error}
            </p>
          )}
          <button className="admin-primary" disabled={busy}>
            {busy ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
        <Link href="/" className="admin-back">
          ← Siteye dön
        </Link>
      </div>
    </main>
  );
}
