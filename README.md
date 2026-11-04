# DarkKnight · Archero 2 guild wiki

Public site: https://nalo-do-it.github.io/darkknight-archero2/ — Spanish: https://nalo-do-it.github.io/darkknight-archero2/es/

Professional static wiki with **50 practical guides in English and Spanish**, six topic hubs, persistent navigation, breadcrumbs, article contents, full-text search and related reading. Five progression guides cover gems, upgrade order, builds by mode, daily/weekly actions and event spending. Bug reports, speculative interaction notes and duplicate fragments were removed from the published library.

Four combat guides add visual Croc control components, a Flame Demon movement diagram, expandable eight-rune PvP recipes and Jungle skill priorities. Historical recipes remain dated. The homepage links each combat guide directly.

The homepage gives clear starting paths. Event tools include a playable Treasure Island board, configurable starting progress, multiplier strategies, 300-run score estimates with percentiles and target success, plus a fishing pool planner with practice catches, remaining-pool odds and refundable-break tracking. Tools are independently implemented from linked community model facts; they do not predict current game outcomes.

Actual Archero 2 scenery, hero art and equipment remain locally packaged. Native Spanish covers article bodies, navigation, captions, tool messages and original vector diagrams. Original screenshots keep their in-image language. No runtime dependencies, accounts, trackers or remote fonts.

Public prose uses original summaries and neutral reference labels without personal bylines. Most source material was reviewed on 3 November 2026; the five consolidated practical guides were reviewed on 4 November. Review labels describe evidence, not guaranteed current-game testing.

The collection saved **5,313 message records across 81 channels/threads** and indexed **334 forum topics**. This is not an exhaustive history export: large discussions were sampled around guides, pinned posts and visible replies. Most media and linked spreadsheets remain unreviewed. Two farming tables and three fishing screenshots were visually checked. Local coverage and unresolved gaps are recorded in ignored `.private/discord/coverage.json`; raw messages remain outside the public build.

## Languages, routes and event models

- English: root, `guides/<id>.html`, `topics/<category>.html`, `tools.html`.
- Spanish: the same paths beneath `es/`; every retained guide ID stays stable.
- Language links preserve the current guide, section anchor and search filters. A remembered Spanish preference applies to the root landing page; explicit deep links retain their language.
- All content is generated as static HTML. Reading and ordinary links work without JavaScript. Search falls back to rendered titles/summaries if full-text JSON cannot load.
- Other languages remain available through an optional Google Translate link in the footer.

`site/wiki.mjs` owns page rendering; `wiki.css` owns the current layout. `wiki-client.mjs` handles navigation and search. Legacy site templates remain in source for compatibility; the build generates the current homepage. All browser modules and CSS use content-based cache versions.

`content/library.json` and `content/library.es.json` must contain matching published IDs, status, dates and source URLs. The build rejects incomplete or stale translation metadata before changing output. Update both libraries when editing a guide.

Treasure model: pinned community source from **20 September 2025**. Two independent d6, landing rewards, weighted wheels, held-dice caps and newly crossed score/task refunds. Earlier thresholds are treated as already claimed. No pass-start bonus, jail, external income or non-score loot valuation. Runs are limited to 5,000 starting dice and bounded simulation work; a safety stop reports failure rather than a false complete result. Three hundred runs provide sample estimates, not guaranteed rewards. Source: [pinned model](https://github.com/ksun4176/archero2-dice-companion/blob/62798d88e03e5fb9eab88d8d929fb95ea548426c/app/_utils/simulate.ts).

Fishing model: normal pools 30 rare / 9 epic / 1 legendary; Polar 60 / 18 / 2. Batch odds use uniform sampling without replacement. Catch simulation removes fish; line breaks leave the pool unchanged. Cross-refill batches are blocked, and the historical 120-break allowance remains explicit. No unsupported ticket or gem-return calculation is presented. Source: [pinned tracker](https://github.com/JGDevAlpha/archero-fish-companion/blob/962612dfbb6ac51a97fe2f5369714be1bc199c5d/index.html). Formulas and implementation are original; no source code is copied. Treasure uses unmodified game art from the original island project, pinned in `content/treasure-art-sources.json`. SVG viewports display the sprite atlas. The 24-tile isometric board supports animated movement, manual ×1/×2/×3/×5/×10 selection and rewards scaled to the active bet.

## Run locally

Requirements: Node.js 22+; Python 3 for preview and HTTP integration tests. Both are already available in this workspace. No dependency installation required.

```powershell
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:4173. Stop preview with Ctrl+C. Rebuild after edits. Preview serves only `dist/`; opening HTML directly with `file://` will not load modules or JSON.

If npm on Windows reports that `node` is not recognized even though PowerShell can run it, prepend its actual installation directory for this session:

```powershell
$env:Path = (Split-Path -Parent (Get-Command node).Source) + ';' + $env:Path
```

Alternatively run `node --test tests/catalog.test.mjs tests/build.test.mjs tests/guides.test.mjs` and `node scripts/build.mjs` directly.

## Collect useful knowledge

1. Inspect selected channels, guide threads and pinned posts through the connected browser. Record original message links and source dates; include later corrections when reviewing a claim.
2. Keep raw exports and source access details under ignored `.private/`, outside the public repository. `.gitignore` is not access control; never force-add this directory.
3. Summarize each useful topic into practical original guidance. Keep neutral reference labels and links; record game version, observation date, conditions and conflicting claims. Deduplicate by message link and topic. Do not assume old advice still works.
4. Guild editors review the summary and publication permission. Label empirical guild tests `verified`, untested reports `community`, obsolete advice `outdated`. Bug reports should include reproduction, expected/actual behavior, platform and version; mark fixed reports for recheck.
5. Add only publication-ready, shareable summaries to `content/library.json`, then test/build. Raw messages, private account details and bot credentials never belong in tracked content.

This collection used a browser signed into Discord by the user. Session research helpers and raw evidence are retained privately for continuation. Account tokens were not exported or placed in the website. Captured message timestamps were checked against Discord snowflake creation times so quoted-message timestamps are not mistaken for the reply's own date; visible edit dates are recorded separately in summaries where relevant.

An unattended collector is not implemented. For a future bot-based integration, obtain channel permissions (`VIEW_CHANNEL`, `READ_MESSAGE_HISTORY`) and configured/approved `MESSAGE_CONTENT` access. Forum posts, threads and archived threads require their own coverage tracking. Keep any collector outside the static website and write private drafts for review.

Personal-account automation/self-bots are prohibited by Discord. Do not supply a personal account token. There is no need for one in this project.

Source references: [Discord message API](https://docs.discord.com/developers/resources/message#get-channel-messages), [Discord self-bot policy](https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots).

## Article format

`content/library.json` contains `schemaVersion: 1` and an `articles` array. Each record follows the shape below. This example is deliberately unpublished and is **not game advice**. Replace all example values and the reference URL before editorial review.

```json
{
  "id": "replace-with-topic-slug",
  "title": "Replace with article title",
  "summary": "Replace with a concise original summary.",
  "body": "## Quick take\nReplace with reviewed original prose.\n\n## Steps\n1. First action\n2. Next action",
  "category": "expedition",
  "status": "community",
  "gameVersion": "Unknown — needs confirmation",
  "updatedOn": "2026-11-03",
  "reviewedOn": null,
  "published": false,
  "tags": ["expedition"],
  "sources": [{ "label": "Replace with original source", "url": "https://example.com/replace-with-original-message-link" }]
}
```

Categories: `guides`, `builds`, `equipment`, `expedition`, `tips`, `resources`. Statuses: `community`, `verified`, `outdated`. Dates use `YYYY-MM-DD`. Set `reviewedOn` and `published: true` only after review. The build validates every record, rejects duplicate IDs and unsafe URL schemes, strips unknown fields, excludes unpublished entries and removes previously generated pages when unpublished. Bodies support `##` headings, `-` bullets and numbered steps. Imported text is escaped; raw HTML and Markdown links never execute. Curated media lives in `site/media.mjs` and its explicit asset allowlist. These checks cannot replace editorial judgment.

Unpublished entries in tracked files remain visible in a public GitHub repository even though excluded from the site. Keep private drafts exclusively in `.private/`.

## GitHub Pages

GitHub Free supports Pages from public repositories. Standard Pages is a public website; it is not a members-only Discord archive. Keep public summaries separate from private material. If members-only access is required, select an authenticated hosting design before publishing.

1. Use the project repository `Nalo-DO-IT/darkknight-archero2`.
2. Review the tracked files. Commit with a Conventional Commit such as `feat: add DarkKnight guild library`.
3. Push the reviewed project to `main` in the chosen repository.
4. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
5. Run the supplied workflow on `main`, or push a new commit. It tests, builds, uploads only `dist/`, then deploys.

The project uses relative asset and data URLs, so `https://OWNER.github.io/REPOSITORY/` works without a custom base path. Branch pull requests run validation without deploying. Runtime bot tokens cannot be stored in browser JavaScript; GitHub Pages has no backend for a collector.

References: [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [custom deployment workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Validation

`npm test` runs schema/security checks, bilingual completeness, safe HTML rendering, deterministic Treasure/fishing math, build validation, stale-page removal, HTTP project-subpath serving, module cache versions and a complete internal-link/anchor audit across both languages. No private research enters the build.

`tests/wiki-flow.js` is the current browser acceptance flow: 60 checks covering native translation, search/filter state, article contents, mobile navigation, keyboard dismissal, Treasure play/estimation/cancellation, fishing pool boundaries and responsive pages at 360–1440 px. Execute its exported Playwright function through the connected browser against the local preview. Older browser-flow/guide-flow/theme-flow files describe the retired landing-page UI and are retained as historical checks; use wiki-flow for the current interface.

`tests/island-flow.js` adds 139 browser checks for multiplied rewards, accessible labels, manual bets, automatic caps, animated movement and reduced-motion play in both languages.

`tests/combat-flow.js` adds 83 browser checks for visual guide navigation, source links, expandable rune recipes, language-preserving diagram anchors and 360–1440 px layouts. Preview checks account for browser zoom and bypass stale local HTTP cache.

`tests/events.test.mjs` verifies two-dice movement, no pass-start reward, caps, exact wheel weight sums, milestone refunds, prior-claim handling, simulation limits, percentiles and no-replacement fishing odds. `tests/wiki.test.mjs` verifies complete native translations and practical-only content.
