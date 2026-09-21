import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "./contact-form";
import { Visual } from "./ui";
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
        <Visual className="map-placeholder" />
        <div className="map-caption">
          <span>Fethiye, Muğla</span>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Fethiye%2C%20Mu%C4%9Fla"
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
