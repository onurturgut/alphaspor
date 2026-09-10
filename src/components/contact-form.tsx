"use client";

import { ArrowUpRight, Check, Mail } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import "./utility.css";

type ContactFormProps = {
  email?: string;
  heading?: string;
};

export function ContactForm({
  email = "Fethiyealfask@gmail.com",
  heading = "Birlikte başlayalım.",
}: ContactFormProps) {
  const id = useId();
  const [draftUrl, setDraftUrl] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    const subject = `Fethiye Alfa Spor · ${name}`;
    const body = [
      `Ad soyad: ${name}`,
      `E-posta: ${senderEmail}`,
      ...(phone ? [`Telefon: ${phone}`] : []),
      "",
      message,
    ].join("\n");
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setDraftUrl(url);
    window.location.assign(url);
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      onChange={() => setDraftUrl("")}
      aria-labelledby={`${id}-heading`}
    >
      <div className="contact-form__heading">
        <span className="contact-form__eyebrow">
          <Mail size={15} aria-hidden="true" /> BİZE ULAŞIN
        </span>
        <h2 id={`${id}-heading`}>{heading}</h2>
        <p>
          Futbol eğitimleri, takımlarımız ve başvuru süreci hakkında bize yazın.
        </p>
      </div>

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
        Bu form e-posta uygulamanızda bir taslak açar. Mesajı o uygulamadan
        gönderebilirsiniz. * İşaretli alanlar zorunludur.
      </p>
      <button
        className="contact-form__submit"
        type="submit"
        aria-describedby={`${id}-note`}
      >
        E-posta taslağı oluştur <ArrowUpRight size={19} aria-hidden="true" />
      </button>
      <div aria-live="polite" aria-atomic="true">
        {draftUrl && (
          <div className="contact-form__status" role="status">
            <Check size={18} aria-hidden="true" />
            <p>
              E-posta uygulamanızda açılan taslağı göndererek bize
              ulaşabilirsiniz. Uygulama açılmadıysa{" "}
              <a href={draftUrl}>taslağı tekrar açın</a> veya{" "}
              <a href={`mailto:${email}`}>{email}</a> adresine yazın.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

export default ContactForm;
