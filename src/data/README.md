# Content migration

`content.json` is the UTF-8 application dataset generated from `arsiv/` by
`node scripts/prepare-content.mjs`. The archived source is never overwritten.

- `teams`: U9, U10, U11, U12, U13, U14/U15; URL slugs are lowercase, with
  `u14-u15` for the combined squad. There are 74 team-player records. U9 has no
  player records in the source, so its array is intentionally empty.
- `players`: source names and broad positions are preserved. A person appearing
  in multiple squads remains in each squad. There are 42 distinct image files
  after SHA-256 deduplication. Five records use generic source photos, flagged
  with `placeholder: true`; interfaces should not present those as real portraits.
- `news`: 18 source articles across seven categories, with title, subtitle, full
  paragraph text, source ID and local image. Source dates and stray “Kopyala”
  suffixes remain in this dataset; verify them before presenting them as current
  fixture dates. News items retain source order, which is not chronological.
- `staff`: four source names and their exact roles. No biography is fabricated.
- `contact`: formatted phone/hours plus the source email, town/postcode and
  Instagram URL. The source does not contain a precise street or training address.
- `about`: the full source introduction as a string.

`source-pages.json` additionally retains all 16 page texts, sections, seven
category texts and the original contact object for later migration work. It
should not be included in the client bundle unnecessarily.

`media-sources.json` records the 18 article images missing from the old downloaded
inventory. They are now stored under `public/media/`. A normal rebuild reuses
these files without network access. If starting without those media files, fetch
them with `node scripts/prepare-content.mjs --fetch-missing-media`.

The requested 2026/2027 display season is used for the rebuilt team pages. The
original team cards also contain 25/26 labels; those original labels survive in
`source-pages.json` rather than being used to infer a verified historical roster.

## Brand assets

Team card photos are matched by the U9–U14 labels in the archived
`arsiv/sayfalar/04-ekiplerimiz.html` and stored locally under `public/media/`.
The U14 source photo is used for the combined U14/U15 team. Their source season
is 2025/2026; the mapping is preserved by `prepare-content.mjs`.

- `public/media/logo.webp`: club crest supplied by the user as
  `400_69d214b288fdb.webp`, used in the header and browser icon.
- `public/fonts/aldrich.woff2`: official Google Fonts Aldrich Latin subset.
- `public/fonts/Aldrich-OFL.txt`: the upstream SIL Open Font License.
- `public/fonts/aldrich-regular.ttf`: upstream full font retained as the source.

The official Aldrich font lacks Ğ/ğ/İ/Ş/ş glyphs. Keep a system sans-serif fallback
for those characters. The font was not altered or substituted.

The homepage may intentionally render “g” placeholders. Actual archived player
and article images are independently available for the roster and article pages.

## Fixture migration (2026-09-10)

The four `matches-u*.json` files contain all 64 rows manually transcribed from
the current club website's fixture screenshots. The source page still references
each downloaded image as of retrieval. `match-sources.json` records the original
page/CDN URL, local image, league group and image SHA-256. Full JPEG originals
are retained in `public/media/fixtures/` and linked from the match center.

| League | Group | Fixtures | Published scores |
| ------ | ----- | -------: | ---------------: |
| U11    | H     |       14 |               11 |
| U12    | H     |       18 |               18 |
| U13    | G     |       14 |               13 |
| U14    | E     |       18 |               18 |

- The 2025/2026 season is inferred from match dates (October 2025–June 2026),
  not the new team's 2026/2027 roster label. No new-season fixtures were inferred.
- Scores retain home–away order. `played` and `awarded` have numeric scores;
  `unreported` and `withdrawn` have two null scores, never invented zeros.
- U11 weeks 5 and 7 are explicitly marked **Hükmen**, both 3–0.
- U11 week 12 shows **Ölüdeniz Spor — Ligden Çıkarıldı** with no score. It is
  retained as `withdrawn`. Its source time 00:00 is stored as null with a note,
  since the screenshot does not establish an actual midnight kickoff.
- U11 weeks 13–14 and U13 week 14 have no published score. These old fixtures
  appear as “Sonuç açıklanmadı”, not upcoming games or completed results.
- U14 week 9 is dated December 17 after week 10's December 13; week 14 is
  January 20 after week 15's January 18. Dates are preserved, not corrected
  from week order. The fixture UI sorts by date while retaining week labels.
- U14 is linked to the combined `u14-u15` squad slug; all match labels remain
  U14. No U15, U10 or U9 fixtures were invented.
- The homepage displays the latest match date with a published score, not a
  fabricated upcoming fixture. This is a static source snapshot, not a live feed.

Run `npm run verify:matches` to check row/week completeness, valid dates,
score/status consistency, duplicate IDs and source exceptions. Reconcile
the expected source counts if a later snapshot adds records.
