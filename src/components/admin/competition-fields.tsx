"use client";
import { useState } from "react";
import { Field } from "./fields";
import type { Draft, TeamOption } from "./editor";
import {
  generateFixtures,
  type Competition,
  type Opponent,
} from "@/lib/matches";

export function CompetitionFields({
  draft,
  update,
  teams,
  opponents,
  onGenerated,
  canGenerate,
}: {
  draft: Draft;
  update: (value: Partial<Draft>) => void;
  teams: TeamOption[];
  opponents: Opponent[];
  onGenerated: () => Promise<void>;
  canGenerate: boolean;
}) {
  const [query, setQuery] = useState("");
  const [availableOpponents, setAvailableOpponents] = useState(opponents);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newOpponentName, setNewOpponentName] = useState("");
  const [addingOpponent, setAddingOpponent] = useState(false);
  const [opponentError, setOpponentError] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [intervalDays, setInterval] = useState(7);
  const [returnLeg, setReturnLeg] = useState(true);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const eligibleOpponents = availableOpponents.filter(
    (o) => o.teamSlugs?.includes(draft.teamSlug ?? "") || draft.opponentIds?.includes(o._id),
  );
  const fixtureInputValid =
    /^\d{4}-\d{2}-\d{2}$/.test(startDate) &&
    !isNaN(new Date(`${startDate}T12:00:00Z`).getTime()) &&
    Number.isInteger(intervalDays) &&
    intervalDays >= 1 &&
    intervalDays <= 30;
  const fixtures =
    preview && fixtureInputValid && draft._id
      ? generateFixtures(
          draft as Competition,
          availableOpponents,
          startDate,
          intervalDays,
          returnLeg,
        )
      : [];
  const field = (key: keyof Draft, label: string, type = "text") => (
    <Field
      label={label}
      type={type}
      required
      value={draft[key] as string | number}
      onChange={(v) => update({ [key]: type === "number" ? Number(v) : v })}
    />
  );
  async function addOpponent() {
    const name = newOpponentName.trim();
    if (!name || !draft.teamSlug || addingOpponent) return;
    setAddingOpponent(true);
    setOpponentError("");
    try {
      const response = await fetch("/api/admin/data/opponents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: null,
          version: null,
          data: {
            name,
            teamSlugs: [draft.teamSlug],
            order: availableOpponents.length,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const opponent: Opponent = {
        _id: result.id,
        name,
        teamSlugs: [draft.teamSlug],
      };
      setAvailableOpponents((items) => [...items, opponent]);
      update({ opponentIds: [...(draft.opponentIds ?? []), result.id] });
      setNewOpponentName("");
      setShowQuickAdd(false);
      setQuery("");
    } catch (error) {
      setOpponentError(
        error instanceof Error ? error.message : "Rakip eklenemedi.",
      );
    } finally {
      setAddingOpponent(false);
    }
  }
  return (
    <>
      <div className="admin-form-grid">
        {field("name", "Organizasyon adı")}
        <Field
          label="Takım / yaş grubu"
          value={draft.teamSlug ?? ""}
          onChange={(teamSlug) => update({ teamSlug, season: teams.find(t => t.slug === teamSlug)?.season ?? draft.season, opponentIds: [] })}
          options={teams.map((t) => ({ value: t.slug, label: t.name }))}
        />
        {field("season", "Sezon")}
        {field("clubName", "Fikstürde kulübümüzün adı")}
        <Field
          label="Organizasyon türü"
          value={draft.kind ?? "official"}
          options={[
            { value: "official", label: "Lig / resmî maç" },
            { value: "friendly", label: "Hazırlık (puan tablosu yok)" },
            { value: "tournament", label: "Lig usulü turnuva" },
          ]}
          onChange={(kind) => update({ kind: kind as Competition["kind"] })}
        />
        {field("duration", "Normal maç süresi (dakika)", "number")}
        {field("starterCount", "Başlangıç oyuncu sayısı (1–11)", "number")}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.standingsEnabled !== false}
            onChange={(e) => update({ standingsEnabled: e.target.checked })}
          />
          Puan tablosunu etkinleştir
        </label>
        {draft.standingsEnabled !== false && (
          <>
            {field("winPoints", "Galibiyet puanı", "number")}
            {field("drawPoints", "Beraberlik puanı", "number")}
            {field("lossPoints", "Mağlubiyet puanı", "number")}
            <Field
              label="Eşit puan sıralaması"
              value={draft.standingsRule ?? "general"}
              options={[
                { value: "general", label: "Genel averaj → atılan gol" },
                { value: "tff", label: "TFF: ikili / çoklu averaj öncelikli" },
              ]}
              onChange={(value) =>
                update({ standingsRule: value as Competition["standingsRule"] })
              }
            />
            {draft.standingsRule === "tff" && (
              <Field
                label="Her rakiple oynanacak maç sayısı"
                type="number"
                value={draft.headToHeadMeetings ?? 2}
                onChange={(value) =>
                  update({ headToHeadMeetings: Number(value) })
                }
              />
            )}
          </>
        )}
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.allowReentry ?? false}
            onChange={(e) => update({ allowReentry: e.target.checked })}
          />
          Oyuncular tekrar oyuna girebilir
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={draft.published ?? false}
            onChange={(e) => update({ published: e.target.checked })}
          />
          Organizasyonu yayımla
        </label>
      </div>
      <h3>Katılımcı rakipler ({draft.opponentIds?.length ?? 0})</h3>
      <p className="admin-help">
        Rakip seçmeden taslak olarak kaydedebilirsiniz. Yayımlamak ve fikstür
        oluşturmak için en az bir rakip ekleyin.
      </p>
      <div className="admin-opponent-toolbar">
        <label>
          Rakip ara
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="admin-primary"
          aria-expanded={showQuickAdd}
          onClick={() => {
            setShowQuickAdd((value) => !value);
            setOpponentError("");
          }}
        >
          + Rakip ekle
        </button>
      </div>
      {showQuickAdd && (
        <div className="admin-quick-opponent">
          <label>
            Yeni rakip takım adı
            <input
              autoFocus
              value={newOpponentName}
              maxLength={150}
              placeholder="Takım adını yazın"
              onChange={(e) => setNewOpponentName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addOpponent();
                }
              }}
            />
          </label>
          <button
            type="button"
            className="admin-primary"
            disabled={addingOpponent || !newOpponentName.trim() || !draft.teamSlug}
            onClick={() => void addOpponent()}
          >
            {addingOpponent ? "Ekleniyor…" : "Rakibi ekle ve seç"}
          </button>
          {opponentError && (
            <p className="admin-alert error" role="alert">{opponentError}</p>
          )}
        </div>
      )}
      {eligibleOpponents.length === 0 && !showQuickAdd && (
        <p className="admin-help" role="status">
          Bu yaş grubuna atanmış rakip yok. Taslağı kaydettikten sonra Rakipler
          bölümünde bir rakibi bu yaş grubuna atayın ve organizasyonu tekrar açın.
        </p>
      )}
      <p className="admin-help">
        Kulübümüz otomatik katılır. Eksik takımları “Rakip ekle” ile
        hemen oluşturabilirsiniz. Maçlar oluşturulduktan sonra katılımcılar; ilk maç raporu
        kaydedildikten sonra oyun kuralları kilitlenir. Kadro girmeden önce maç
        süresini ve başlangıç oyuncu sayısını kontrol edin.
      </p>
      <div className="admin-roster-grid">
        {eligibleOpponents
          .filter((o) =>
            o.name
              .toLocaleLowerCase("tr")
              .includes(query.toLocaleLowerCase("tr")),
          )
          .map((o) => (
            <label className="admin-check" key={o._id}>
              <input
                type="checkbox"
                checked={draft.opponentIds?.includes(o._id) ?? false}
                onChange={(e) =>
                  update({
                    opponentIds: e.target.checked
                      ? [...(draft.opponentIds ?? []), o._id]
                      : draft.opponentIds?.filter((id) => id !== o._id),
                  })
                }
              />
              {o.name}
            </label>
          ))}
      </div>
      {draft.standingsEnabled !== false && (
        <p className="admin-help">
          Tam puan tablosu için rakiplerin kendi aralarındaki sonuçlarını da
          girin. TFF seçeneğinde eşit puanlı takımların aralarındaki tüm maçlar
          bitince ikili / çoklu averaj uygulanır; o zamana kadar genel averajla
          geçici sıralama yapılır. Eşitliği bozulmayan takımlar aynı sırayı
          paylaşır.
        </p>
      )}
      {draft._id && canGenerate ? (
        <details className="admin-fixture-generator">
          <summary>Otomatik fikstür oluştur</summary>
          <p className="admin-help">
            Önce organizasyon değişikliklerini kaydedin. Fikstür kayıtlı
            kurallarla oluşturulur; yeni maçlar taslak kalır. Yeniden
            çalıştırmak mevcut maçları değiştirmez veya silinen maçları geri
            getirmez.
          </p>
          <div className="admin-form-grid">
            <Field
              label="İlk hafta tarihi"
              type="date"
              value={startDate}
              onChange={setStartDate}
            />
            <Field
              label="Haftalar arası gün"
              type="number"
              value={intervalDays}
              onChange={(v) => setInterval(Number(v))}
            />
            <label className="admin-check">
              <input
                type="checkbox"
                checked={returnLeg}
                onChange={(e) => setReturnLeg(e.target.checked)}
              />
              Rövanşlı fikstür
            </label>
          </div>
          <button
            type="button"
            disabled={!fixtureInputValid || busy || !draft.opponentIds?.length}
            onClick={() => setPreview(true)}
          >
            Fikstürü önizle
          </button>
          {preview && (
            <>
              <p>
                {fixtures.length} maç · Maç tarihleri sonradan düzenlenebilir.
              </p>
              <div className="admin-fixture-preview">
                {fixtures.map((m) => (
                  <p key={m.id}>
                    {m.week != null ? `${m.week}. hafta · ` : ""}
                    {m.date} · {m.homeTeam} — {m.awayTeam}
                  </p>
                ))}
              </div>
              <button
                type="button"
                className="admin-primary"
                disabled={busy || !fixtures.length}
                onClick={async () => {
                  setBusy(true);
                  setMessage("");
                  try {
                    const response = await fetch("/api/admin/fixtures", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        competitionId: draft._id,
                        version: draft._rev,
                        startDate,
                        intervalDays,
                        returnLeg,
                      }),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error);
                    alert(
                      `${result.created} taslak maç oluşturuldu. ${result.existing} mevcut kayıt korundu.`,
                    );
                    await onGenerated();
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Fikstür oluşturulamadı.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Oluşturuluyor…" : "Taslak maçları oluştur"}
              </button>
            </>
          )}
          {message && (
            <p role="alert" className="admin-alert error">
              {message}
            </p>
          )}
        </details>
      ) : (
        <p className="admin-help">
          Fikstür üretmek için önce organizasyonu kaydedin, ardından tekrar
          açın.
        </p>
      )}
    </>
  );
}
