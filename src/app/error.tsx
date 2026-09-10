"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container section">
      <p className="eyebrow">BİR SORUN OLUŞTU</p>
      <h1>Kısa bir mola.</h1>
      <p className="not-found-copy">
        Sayfa yüklenemedi. Yeniden deneyebilirsiniz.
      </p>
      <button className="button" onClick={() => reset()}>
        Yeniden dene
      </button>
    </section>
  );
}
