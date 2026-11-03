# DarkKnight · Archero 2 guild library

English static knowledge hub for GitHub Pages. Featured field guides, searchable library, full reading pages, event tools, screenshots, original diagrams and language selection. No runtime dependencies, site accounts, trackers or external fonts.

Current content: **67 guides and summaries**, reviewed on **3 November 2026**. Public prose uses original summaries and neutral reference labels without personal bylines or server attribution. Game claims retain community/needs-recheck labels; editorial review is not live-game testing. Dedicated playbooks cover Treasure Island multipliers and fishing routes.

The collection saved **5,313 message records across 81 channels/threads** and indexed **334 forum topics**. This is not an exhaustive history export: large discussions were sampled around guides, pinned posts and visible replies. Most media and linked spreadsheets remain unreviewed. Two farming tables and three fishing screenshots were visually checked. Local coverage and unresolved gaps are recorded in ignored `.private/discord/coverage.json`; raw messages remain outside the public build.

## Languages and reading pages

Every published guide is generated as `guides/<id>.html`, with its full text present before JavaScript. The homepage language control opens the static guide index through Google Translate; each guide can be translated separately. Twenty language shortcuts plus **More languages** expose the translation service's supported languages. Translations are automatic, external, and may misinterpret game terminology; English remains the original. Localhost cannot be fetched by Google Translate, so local preview links to browser-translation instructions. Availability depends on the translation service and region. No unofficial translation API, API key or embedded third-party script is used.

Treasure recommendations implement the linked September 2025 companion model, including departure tiles and held-dice caps. They are not verified current game rules. Fishing routes distinguish normal lakes, partial pools, special events and rod-specific screenshots. The source links and dates document those limits.

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

Categories: `guides`, `builds`, `equipment`, `expedition`, `tips`, `bugs`. Statuses: `community`, `verified`, `outdated`. Dates use `YYYY-MM-DD`. Set `reviewedOn` and `published: true` only after review. The build validates every record, rejects duplicate IDs and unsafe URL schemes, strips unknown fields, excludes unpublished entries and removes previously generated pages when unpublished. Bodies support `##` headings, `-` bullets and numbered steps. Imported text is escaped; raw HTML and Markdown links never execute. Curated media lives in `site/media.mjs` and its explicit asset allowlist. These checks cannot replace editorial judgment.

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

```powershell
npm run test:unit
npm run test:integration
```

Unit tests cover schema rejection, publication review, draft exclusion, source URL validation, category/status/search combinations, ordering and plain-text content. Integration tests build into an isolated temporary folder, verify exclusion of private fields/drafts, preserve previous output on validation errors, and serve the result through a real HTTP server at a GitHub-style subpath.

Browser usage checks in `tests/browser-flow.js`: empty library, category selection, filter reset, article search/detail/source links with synthetic data, error/retry, keyboard dismissal and mobile overflow. `tests/guide-flow.js` checks the production library, multiplier inputs, dedicated guide navigation, translation fallback, fishing images and responsive layout. Synthetic fixtures never enter production content.
