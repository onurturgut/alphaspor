import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
export function PageIntro({
  title,
  eyebrow,
  description,
  parent,
  logo = false,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  parent?: { href: string; label: string };
  logo?: boolean;
}) {
  return (
    <div className="container page-intro">
      <div className="breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <ChevronRight size={12} />
        {parent && (
          <>
            <Link href={parent.href}>{parent.label}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span>{title}</span>
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className={logo ? "page-intro-with-logo" : undefined}>{logo && <Image src="/media/logo.webp" alt="" width={56} height={76} />}{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
