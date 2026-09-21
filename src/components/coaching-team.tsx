import Image from "next/image";
import { ChevronDown, Camera } from "lucide-react";
import "./coaching-team.css";
import { coachLicense } from "@/lib/coach-license";

type Coach = { name: string; role: string; photo?: string; bio?: string; license?: string };

export function CoachingTeam({
  staff,
  instagram,
}: {
  staff: Coach[];
  instagram?: string;
}) {
  if (!staff.length) return null;

  return (
    <section
      id="teknik-ekip"
      className="coaching-team"
      aria-labelledby="coaching-title"
    >
      <div className="coaching-shell">
        <header className="coaching-heading">
          <p>KADRO</p>
          <h2 id="coaching-title">Eğitmenlerimiz</h2>
          <span>Deneyimli kadromuzla sahada ve saha dışında yanınızdayız.</span>
        </header>
        <div className="coaching-grid">
          {staff.map((person, index) => {
            const license = coachLicense(person);
            const paragraphs =
              person.bio?.split(/\n\s*\n/).filter(Boolean) ?? [];
            return (
              <article
                className={`coach-card${index === 0 ? " coach-featured" : ""}`}
                key={person.name}
              >
                {person.photo && (
                  <div className="coach-photo">
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      sizes="(max-width: 700px) 90vw, 30vw"
                    />
                  </div>
                )}
                <div className="coach-content">
                  <div className="coach-intro">
                    <span className="coach-role">{person.role}</span>
                    <div className="coach-name-row">
                      <h3>{person.name}</h3>
                      {license && <span className="coach-license" aria-label={`Lisans: ${license}`}>{license}</span>}
                    </div>
                    {paragraphs[0] && (
                      <p className="coach-summary">{paragraphs[0]}</p>
                    )}
                  </div>
                  <div className="coach-footer">
                    {paragraphs.length > 1 && (
                      <details className="coach-details">
                        <summary>
                          <span className="coach-read-more">Devamını oku</span>
                          <span className="coach-read-less">
                            Daha az göster
                          </span>
                          <ChevronDown size={15} aria-hidden="true" />
                          <span className="coach-sr-only">: {person.name}</span>
                        </summary>
                        <div className="coach-biography">
                          {paragraphs.slice(1).map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      </details>
                    )}
                    {instagram && (
                      <a
                        className="coach-social"
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Fethiye Alfa Spor Instagram hesabı"
                      >
                        <Camera size={17} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
