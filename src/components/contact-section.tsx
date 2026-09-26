import {
  FiArrowUpRight as ArrowUpRight,
  FiClock as Clock3,
  FiMail as Mail,
  FiMapPin as MapPin,
  FiPhone as Phone,
} from "react-icons/fi";
import { ContactForm } from "./contact-form";
import { getContent } from "@/lib/content";
export async function ContactSection() {
  const content = await getContent();
  return (
    <div className="contact-layout" id="basvuru">
      <ContactForm email={content.contact.email} />
      <aside className="contact-aside">
        <p className="eyebrow">FETHİYE ALFA SPOR</p>
        <h2>Bir mesaj kadar yakınız.</h2>
        <a href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`}>
          <Phone size={17} />
          {content.contact.phone}
        </a>
        <a href={`mailto:${content.contact.email}`}>
          <Mail size={17} />
          {content.contact.email}
        </a>
        <p className="contact-line">
          <MapPin size={17} />
          {content.contact.address}
        </p>
        <p className="contact-line">
          <Clock3 size={17} />
          {content.contact.hours}
        </p>
        <iframe
          className="contact-map"
          title="Alfa Spor kulüp konumu"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(content.contact.address)}&output=embed`}
        />
        <div className="map-caption">
          <span>Fethiye, Muğla</span>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.contact.address)}`}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Haritada aç
            <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
    </div>
  );
}
