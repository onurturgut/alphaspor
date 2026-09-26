"use client";

import Image from "next/image";
import {
  FiArrowUpRight as ArrowUpRight,
  FiCheck as Check,
  FiMail as Mail,
} from "react-icons/fi";
import { useId, useState, type FormEvent } from "react";
import "./utility.css";

type ContactFormProps = {
  email?: string;
  heading?: string;
};

export function ContactForm({
  email = "Fethiyealfask@gmail.com",
  heading = "İlk adımı birlikte atalım.",
}: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const senderEmail = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const nameField = form.elements.namedItem("name") as HTMLInputElement;
    const messageField = form.elements.namedItem(
      "message",
    ) as HTMLTextAreaElement;

    nameField.setCustomValidity(
      name.length < 2
        ? "Lütfen en az 2 karakterden oluşan adınızı ve soyadınızı yazın."
        : "",
    );
    messageField.setCustomValidity(
      message.length < 5
        ? "Lütfen en az 5 karakterden oluşan bir mesaj yazın. Yalnızca boşluk kullanmayın."
        : "",
    );
    if (!form.reportValidity()) return;

    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: senderEmail,
          message,
          website: data.get("website"),
        }),
        signal: AbortSignal.timeout(30000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Mesaj gönderilemedi.");
      setStatus("sent");
      form.reset();
    } catch (failure) {
      setStatus("error");
      setError(
        failure instanceof Error && failure.name !== "TimeoutError"
          ? failure.message
          : "Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.",
      );
    }
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      aria-labelledby={`${id}-heading`}
    >
      <div className="contact-form__heading">
        <span className="contact-form__eyebrow">
          <Mail size={15} aria-hidden="true" /> BİZE ULAŞIN
        </span>
        <div className="contact-form__title">
          <Image src="/media/logo.webp" alt="" width={42} height={58} />
          <h2 id={`${id}-heading`}>{heading}</h2>
        </div>
        <p>
          Futbol eğitimleri, takımlarımız ve başvuru süreci hakkında bize yazın.
        </p>
      </div>

      <label className="contact-honeypot" aria-hidden="true">
        Web sitesi
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="contact-form__fields">
        <div className="contact-form__field">
          <label htmlFor={`${id}-name`}>
            Ad soyad <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Adınız ve soyadınız"
            required
            minLength={2}
            maxLength={100}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
        </div>
        <div className="contact-form__field">
          <label htmlFor={`${id}-phone`}>
            Telefon{" "}
            <span className="contact-form__optional">(isteğe bağlı)</span>
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="05xx xxx xx xx"
            maxLength={30}
          />
        </div>
        <div className="contact-form__field contact-form__field--wide">
          <label htmlFor={`${id}-email`}>
            E-posta <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@eposta.com"
            required
            maxLength={254}
          />
        </div>
        <div className="contact-form__field contact-form__field--wide">
          <label htmlFor={`${id}-message`}>
            Mesajınız <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            placeholder="Size nasıl yardımcı olabiliriz?"
            required
            minLength={5}
            maxLength={3000}
            rows={4}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
        </div>
      </div>

      <p className="contact-form__note" id={`${id}-note`}>
        Mesajınız doğrudan kulübümüze iletilir. * İşaretli alanlar zorunludur.
      </p>
      <button
        className="contact-form__submit"
        type="submit"
        disabled={status === "sending"}
        aria-describedby={`${id}-note`}
      >
        {status === "sending" ? "Gönderiliyor…" : "Mesajı gönder"}{" "}
        <ArrowUpRight size={19} aria-hidden="true" />
      </button>
      <div aria-live="polite" aria-atomic="true">
        {status === "error" && (
          <p className="contact-form__error" role="alert">
            {error} <a href={`mailto:${email}`}>{email}</a>
          </p>
        )}
        {status === "sent" && (
          <div className="contact-form__status" role="status">
            <Check size={18} aria-hidden="true" />
            <p>
              Mesajınız iletildi. Bizimle iletişime geçtiğiniz için teşekkür
              ederiz.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

export default ContactForm;
