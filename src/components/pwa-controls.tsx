"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, RefreshCw } from "lucide-react";
import "./pwa-controls.css";

type InstallEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function subscribeStandalone(onChange: () => void) {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    query.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaControls() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [busy, setBusy] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [message, setMessage] = useState("");
  const updateRequested = useRef(false);
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalone, () => false);

  useEffect(() => {
    let disposed = false;
    const cleanups: (() => void)[] = [];
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      setMessage("Alfa Spor ana ekranınıza eklendi.");
    };
    const controllerChanged = () => {
      if (updateRequested.current) window.location.reload();
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // Development must never leave an offline worker controlling hot reloads.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
      void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => {
          if (disposed) return;
          if (registration.waiting) setWaiting(registration.waiting);
          const onUpdate = () => {
            const worker = registration.installing;
            if (!worker) return;
            const onState = () => {
              if (!disposed && worker.state === "installed" && navigator.serviceWorker.controller) {
                setWaiting(registration.waiting);
              }
            };
            worker.addEventListener("statechange", onState);
            cleanups.push(() => worker.removeEventListener("statechange", onState));
          };
          registration.addEventListener("updatefound", onUpdate);
          cleanups.push(() => registration.removeEventListener("updatefound", onUpdate));
          const checkUpdate = () => {
            if (document.visibilityState === "visible") void registration.update().catch(() => {});
          };
          document.addEventListener("visibilitychange", checkUpdate);
          cleanups.push(() => document.removeEventListener("visibilitychange", checkUpdate));
        }).catch(() => {
          // The website remains fully usable if the browser denies offline storage.
          console.warn("Alfa Spor: çevrimdışı destek bu tarayıcıda başlatılamadı.");
        });
    }
    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      navigator.serviceWorker?.removeEventListener("controllerchange", controllerChanged);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  async function install() {
    if (!installEvent || busy) return;
    setBusy(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    } catch {
      setMessage("Tarayıcı menüsündeki ‘Uygulamayı yükle’ veya ‘Ana ekrana ekle’ seçeneğini kullanabilirsiniz.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pwa-controls">
      {!standalone && !installed && (installEvent ? (
        <button className="pwa-button" type="button" onClick={install} disabled={busy}>
          <Download size={16} aria-hidden="true" /> {busy ? "Açılıyor…" : "Uygulamayı yükle"}
        </button>
      ) : (
        <details className="pwa-install-help">
          <summary><Download size={16} aria-hidden="true" /> Ana ekrana ekle</summary>
          <p>iPhone veya iPad’de Safari’nin paylaş menüsünden <strong>Ana Ekrana Ekle</strong> seçeneğini kullanın. Android ve bilgisayarda tarayıcı menüsündeki <strong>Uygulamayı yükle</strong> veya <strong>Ana ekrana ekle</strong> seçeneğini seçin.</p>
        </details>
      ))}
      {waiting && (
        <div className="pwa-update" role="status">
          <span>Alfa Spor’un yeni sürümü hazır.</span>
          <button className="pwa-button" type="button" onClick={() => {
            updateRequested.current = true;
            waiting.postMessage({ type: "SKIP_WAITING" });
          }}><RefreshCw size={16} aria-hidden="true" /> Güncelle</button>
        </div>
      )}
      {message && <p className="pwa-message" role="status">{message}</p>}
    </div>
  );
}
