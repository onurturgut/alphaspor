import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container section">
      <p className="eyebrow">404 · SAYFA BULUNAMADI</p>
      <h1>Burada oyun durdu.</h1>
      <p className="not-found-copy">
        Aradığınız sayfa taşınmış olabilir. Ana sayfadan devam edebilirsiniz.
      </p>
      <Link href="/" className="button">
        Ana sayfaya dön
      </Link>
    </section>
  );
}
