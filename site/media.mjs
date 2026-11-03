export const GUIDE_MEDIA = Object.freeze({
  'fishing-event-playbook': [
    { path: 'assets/fishing-plan.svg', alt: 'Fishing plan: choose a reward route, confirm the event pool, log catches and recalculate before spending.', caption: 'Plan the route first. Track normal and special pools separately.' },
    { path: 'assets/fishing-lake1-1.png', portrait: true, alt: 'Lakehouse fishing screenshot, final rod, first initial-tension example.', caption: 'Example 1 · Lakehouse, final rod. Historical tension comparison.' },
    { path: 'assets/fishing-lake1-2.png', portrait: true, alt: 'Lakehouse fishing screenshot, final rod, second initial-tension example.', caption: 'Example 2 · Same lake and rod. Compare initial tension.' },
    { path: 'assets/fishing-lake1-3.png', portrait: true, alt: 'Lakehouse fishing screenshot, final rod, third example with a small yellow initial-tension segment.', caption: 'Example 3 · Small yellow tension segment. Do not transfer thresholds to another rod or lake.' }
  ],
  'treasure-island-x10-tile-guide': [{ path: 'assets/treasure-board.svg', alt: 'Treasure Island departure tiles: 8, 9, 20, 21 and 22 use the companion model’s high multiplier.', caption: 'Companion model, zero-based tiles. Read your CURRENT tile before rolling. Tile 0 is Start; check the live event board before using this map.' }],
  'fishing-pool-management-corrections-2025': [{ path: 'assets/fishing-plan.svg', alt: 'Fishing planning flow: inspect event rules, track remaining pool, conserve line breaks and reassess after each catch.', caption: 'A decision checklist, not a forecast of your next catch. Historical pool counts need a fresh check each event.' }],
  'fishing-budgets-and-changing-event-tasks': [{ path: 'assets/fishing-plan.svg', alt: 'Fishing workflow: choose reward target, count remaining free lures, buy small batches and recalculate.', caption: 'Plan around the current event’s tasks and remaining free resources.' }],
  'farming-quick-hunt-hm5-ch47-2025': [
    { path: 'assets/farming-comparison.png', alt: 'Historical Chapter 47 versus Quick Hunt table for 145 energy per day over 30 days.', caption: 'October 2025 table: 1,740 vs 1,066 gear; 1,679 vs 1,066 runes. Printed rune difference is 612, while the displayed totals subtract to 613. Times model run/action time, not all monthly play.' },
    { path: 'assets/farming-full-table.png', alt: 'Historical farming calculations for Hard Mode 5, Chapter 47 and Quick Hunt, with separate 145 and 165 energy scenarios.', caption: 'Full calculation sheet. Requires the recorded drop-rate talents. Keep the 145-energy and 165-energy scenarios separate; current drops are unverified.' }
  ]
});

export const CATEGORY_ART = Object.freeze({
  guides: 'assets/hero-alex.png',
  builds: 'assets/gear-crossbow.png',
  equipment: 'assets/gear-oracle-armor.png',
  expedition: 'assets/gear-griffin-amulet.png',
  tips: 'assets/gold.png',
  bugs: 'assets/rune-elemental.png'
});

export const FEATURED_ART = Object.freeze({
  'treasure-island-x10-tile-guide': { image: 'assets/gold.png', theme: 'treasure', label: '×1 / ×10 · TREASURE ISLAND' },
  'fishing-event-playbook': { image: 'assets/fishing-lake1-3.png', theme: 'fishing', label: "ANGLER'S BOUNTY" },
  'beginner-gear-plan-november-2026': { image: 'assets/gear-crossbow.png', theme: 'gear', label: 'YOUR NEXT UPGRADE' },
  'farming-quick-hunt-hm5-ch47-2025': { image: 'assets/gear-oracle-armor.png', theme: 'farming', label: 'ENERGY → LOOT' }
});

export const THEME_ASSETS = Object.freeze([
  'assets/archero-world.png', 'assets/archero-logo.png', 'assets/hero-alex.png',
  'assets/gear-crossbow.png', 'assets/gear-oracle-armor.png', 'assets/gear-griffin-amulet.png',
  'assets/gear-oracle-ring.png', 'assets/gold.png', 'assets/rune-echoes.png', 'assets/rune-elemental.png'
]);

export const PUBLIC_ASSETS = Object.freeze([...new Set([...Object.values(GUIDE_MEDIA).flat().map(({ path }) => path), ...THEME_ASSETS])]);
