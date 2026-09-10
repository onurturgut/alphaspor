(async () => {
  const checks = [];
  const assert = (value, message) => {
    if (!value) throw new Error(message);
    checks.push(message);
  };
  const waitFor = async (predicate) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (predicate()) return;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error("UI update timed out");
  };
  const rows = () => [...document.querySelectorAll(".match-row")];
  const ids = () => rows().map((row) => row.dataset.matchId);
  const select = async (index, value) => {
    const element = document.querySelectorAll(".match-center select")[index];
    element.value = value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 100));
  };
  const tab = async (index) => {
    document.querySelectorAll(".match-center [role=tab]")[index].click();
    await waitFor(() => document.querySelectorAll(".match-center [role=tab]")[index].getAttribute("aria-selected") === "true");
  };
  const collectPages = async () => {
    const collected = [];
    for (let page = 0; page < 10; page++) {
      collected.push(...ids());
      const next = document.querySelector(".match-pagination button:last-child");
      if (!next || next.disabled) return collected;
      const first = ids()[0];
      next.click();
      await waitFor(() => ids()[0] !== first);
    }
    throw new Error("Pagination did not terminate");
  };

  await select(1, "2025/2026");
  await select(0, "all");
  await tab(1);
  const results = await collectPages();
  assert(results.length === 60 && new Set(results).size === 60, "All 60 scored matches accessible once across five result pages");
  assert(results[0] === "u13-2025-2026-13", "Results start with latest published match on 17 May 2026");
  assert(!results.includes("u11-2025-2026-12") && !results.includes("u13-2025-2026-14"), "Missing scores and withdrawal excluded from results");
  await tab(0);
  const fixtures = await collectPages();
  assert(fixtures.length === 64 && new Set(fixtures).size === 64, "All 64 fixtures accessible once across six pages");

  await select(0, "U11");
  assert(rows().length === 12 && ids()[0] === "u11-2025-2026-01", "Team filter resets pagination and retains chronological order");
  const withdrawn = document.querySelector('[data-match-id="u11-2025-2026-12"]');
  assert(withdrawn.querySelector(".match-row__score").textContent.trim() === "—", "Withdrawal has no fabricated score");
  assert(withdrawn.textContent.includes("Saat belirtilmedi"), "Source midnight placeholder is not shown as a confirmed kickoff");
  await tab(1);
  assert(rows().length === 11 && document.querySelectorAll(".match-row__status--awarded").length === 2, "U11 results contain 11 scores including both awarded wins");
  assert(document.querySelector('[data-match-id="u11-2025-2026-06"] .match-row__outcome').textContent === "Mağlubiyet", "Away 3–0 defeat classified from Alfa perspective");
  assert(document.querySelector('[data-match-id="u11-2025-2026-01"] .match-row__outcome').textContent === "Galibiyet", "Away 0–11 victory classified from Alfa perspective");

  await select(0, "U13");
  assert(document.querySelector('[data-match-id="u13-2025-2026-03"] .match-row__outcome').textContent === "Beraberlik", "Real 0–0 result preserved as a draw");
  const u13 = await collectPages();
  assert(u13.length === 13, "U13 filter includes all 13 published results");
  await select(0, "U14/U15");
  assert(rows().every((row) => row.dataset.matchId.startsWith("u14-")), "Combined squad filter shows source U14 fixtures");
  assert(new URL(location.href).searchParams.get("takim") === "u14-u15", "Team filter retained in URL");
  await select(1, "2026/2027");
  assert(rows().length === 0 && !!document.querySelector(".match-center__empty"), "Unpublished 2026/2027 season shows an empty state");
  await select(1, "2025/2026");
  await select(0, "U9");
  assert(rows().length === 0, "No invented U9 matches");
  await select(0, "U11");
  await tab(0);
  document.querySelector(".match-sources summary").click();
  assert(document.querySelectorAll(".match-sources a").length === 2, "Selected league source image and club page are linked");
  assert(document.documentElement.scrollWidth <= innerWidth, "No horizontal page overflow");
  assert(!document.querySelector("[data-nextjs-dialog]"), "No framework error overlay");
  window.scrollTo(0, 0);
  return { passed: checks.length, checks };
})();
