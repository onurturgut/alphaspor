import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function PageIntro({
  title,
  eyebrow,
  description,
  parent,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  parent?: { href: string; label: string };
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
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
