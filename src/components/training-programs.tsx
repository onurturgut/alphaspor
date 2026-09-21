"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, UserRound, UsersRound, Target } from "lucide-react";
import "./training-programs.css";

const programs = [
  {
    title: "Bireysel Antrenmanlar",
    summary:
      "Her oyuncunun kendi yolculuğuna, güçlü yönlerine ve gelişimine odaklanıyoruz.",
    tags: ["BİREYSEL GELİŞİM", "TEKNİK", "OYUN AKLI"],
    description:
      "Her oyuncunun güçlü yanları, öğrenme hızı ve sahada kendini ifade etme biçimi farklıdır. Bireysel gelişim yaklaşımımızın merkezinde oyuncuyu tanımak ve potansiyelini ortaya çıkarmak var. Top kontrolü, pas, şut ve karar verme gibi becerileri oyunla ilişkilendiriyor; oyuncunun yalnızca hareketi uygulamasını değil, ne zaman ve neden kullanacağını anlamasını önemsiyoruz.",
    closing:
      "Kendi oyununu bir adım ileri taşımak için nereden başlayacağını birlikte keşfedelim.",
    icon: UserRound,
  },
  {
    title: "Grup Antrenmanları",
    summary:
      "Yaş gruplarına göre birlikte öğrenme, takım oyunu ve saha deneyimi.",
    tags: ["YAŞ GRUPLARI", "TAKIM RUHU", "BİRLİKTE GELİŞİM"],
    description:
      "Futbol birlikte düşünmeyi, iletişim kurmayı ve sorumluluk almayı gerektirir. Yaş gruplarına göre şekillenen takım çalışmalarımızda oyuncuların teknik becerilerini oyun içinde kullanmalarını destekliyoruz. Paslaşma, alan paylaşımı ve birlikte karar verme üzerine kurulu çalışmalarla, her oyuncunun takım içindeki rolünü keşfetmesini amaçlıyoruz.",
    closing:
      "Aynı heyecanı paylaşacağın takım arkadaşlarınla tanışmaya hazır mısın?",
    icon: UsersRound,
  },
  {
    title: "Oyun Temelli Eğitim",
    summary:
      "Düşünen, karar veren ve sorumluluk alan oyuncular için oyun odaklı öğrenme.",
    tags: ["OYUN TEMELLİ", "KARAR VERME", "GELİŞİM ODAKLI"],
    description:
      "Oyunu öğrenmenin merkezine yine oyunu koyuyoruz. Oyuncuları sahada farklı durumlarla karşılaştırarak gözlem yapmalarını, seçenekleri değerlendirmelerini ve kendi çözümlerini bulmalarını teşvik ediyoruz. Amacımız yalnızca futbol oynayan değil; oyunu anlayan, kararlarının sorumluluğunu alan ve öğrendiklerini sahaya taşıyan sporcular yetiştirmek.",
    closing: "Alfa Spor’da öğrenmenin nasıl sahadaki oyuna dönüştüğünü keşfet.",
    icon: Target,
  },
];

export function TrainingPrograms() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % programs.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index + programs.length - 1) % programs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = programs.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }
  return (
    <section
      id="programlar"
      className="training-section"
      aria-labelledby="training-title"
    >
      <div className="training-shell">
        <header className="training-heading">
          <p className="eyebrow">ANTRENMAN</p>
          <h2 id="training-title">Programlarımız</h2>
          <p>
            Bireysel gelişimi, takım ruhunu ve oyun temelli eğitimi aynı sahada
            buluşturuyoruz.
          </p>
        </header>
        <div className="training-layout">
          <div
            className="training-tabs"
            role="tablist"
            aria-label="Antrenman programları"
            aria-orientation="vertical"
          >
            {programs.map((program, index) => (
              <button
                key={program.title}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`training-tab-${index}`}
                aria-controls={`training-panel-${index}`}
                aria-selected={selected === index}
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => navigate(event, index)}
              >
                <span className="training-tab-number">0{index + 1}</span>
                <span className="training-tab-copy">
                  <strong>{program.title}</strong>
                  <span>{program.summary}</span>
                </span>
                <span className="training-tab-arrow">
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <div
                key={program.title}
                className="training-panel"
                role="tabpanel"
                id={`training-panel-${index}`}
                aria-labelledby={`training-tab-${index}`}
                hidden={selected !== index}
                tabIndex={0}
              >
                <div className="training-panel-top">
                  <span className="training-panel-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="training-icon">
                    <Icon size={27} aria-hidden="true" />
                  </span>
                </div>
                <h3>{program.title}</h3>
                <ul className="training-tags">
                  {program.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p>{program.description}</p>
                <p className="training-closing">{program.closing}</p>
                <Link href="/iletisim#basvuru" className="training-cta">
                  Bu program hakkında bilgi al{" "}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
