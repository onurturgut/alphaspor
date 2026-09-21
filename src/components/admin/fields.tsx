"use client";
import { useId, useState } from "react";
import Image from "next/image";
export type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
};
export function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  multiline,
  hint,
  options,
}: FieldProps) {
  const id = useId();
  return (
    <label
      className={multiline ? "admin-field wide" : "admin-field"}
      htmlFor={id}
    >
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {options ? (
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={label.includes("Haber") || label.includes("Hakk") ? 10 : 4}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          step={type === "number" ? 1 : undefined}
        />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function MediaField({
  label,
  value,
  onChange,
  video = false,
  onBusy,
}: {
  label: string;
  value: string;
  onChange: (
    url: string,
    dimensions?: { width: number; height: number },
  ) => void;
  video?: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const id = useId();
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    onBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onChange(data.url, { width: data.width, height: data.height });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      onBusy(false);
    }
  }
  return (
    <div className="admin-media wide">
      <div className="admin-media-head">
        <strong>{label}</strong>
        {value && !video && (
          <Image
            unoptimized
            src={value}
            alt="Seçilen görsel"
            width={80}
            height={64}
          />
        )}
      </div>
      <div className="admin-media-input">
        <label htmlFor={id} className="admin-upload">
          {busy ? "Yükleniyor…" : video ? "Video yükle" : "Görsel yükle"}
          <input
            id={id}
            type="file"
            accept={
              video ? "video/mp4" : "image/jpeg,image/png,image/webp,image/avif"
            }
            disabled={busy}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <input
          aria-label={`${label} adresi`}
          placeholder="veya HTTPS adresi yapıştırın"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={busy}
        />
      </div>
      <small>
        {video
          ? "MP4 · En fazla 25 MB · Web için sıkıştırılmış video kullanın."
          : "JPEG, PNG, WebP, AVIF · En fazla 10 MB · Otomatik sıkıştırılır."}
      </small>
      {error && (
        <p role="alert" className="admin-alert error">
          {error}
        </p>
      )}
    </div>
  );
}
