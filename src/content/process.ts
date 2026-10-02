// The AI-workflow page, told through PepAlert. Excerpts are quoted from the PepAlert repo
// (SPEC.md and the standing agent rules in CLAUDE.md / AGENTS.md). Keep them generic: no vendor
// names, pipeline mechanics or anything a copycat could use.

export const processIntro = {
  title: 'How I build with AI agents',
  lede: 'PepAlert is the clearest example of how I work now: one engineer, coding agents doing most of the typing, and a process that keeps them honest. The agents write the code. I own the spec, the rules, the review and what ships.',
}

export const processStats = [
  { value: '41', label: 'days of commits, June to August 2026' },
  { value: '583', label: 'commits' },
  { value: '~60k', label: 'lines of TypeScript' },
  { value: '143', label: 'database migrations' },
  { value: '27', label: 'design and runbook docs' },
]

export type ProcessStep = {
  title: string
  body: string[]
  excerpt?: { file: string; text: string }
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Write the spec first, and mark the guesses',
    body: [
      'Every project starts with a living spec: the goal, the domain model, the architecture and a phased build plan. Anything I have not verified is marked as an assumption or an open question instead of being quietly decided, so neither I nor an agent builds on a guess without knowing it.',
      'The spec is what agents read before they touch the code. The assumptions in it become the first things to test.',
    ],
    excerpt: {
      file: 'SPEC.md',
      text: `> Open items and assumptions are marked **[ASSUMPTION]** / **[OPEN]** — flag any to change.

- **Extraction = LLM-driven.** [ASSUMPTION] Use Claude — Haiku 4.5 for cheap classification, Sonnet 4.6 / Opus 4.8 (vision) for hard image/PDF extraction. (Detailed API choices deferred to build.)`,
    },
  },
  {
    title: 'Measure before you trust a model',
    body: [
      'Within the first week, that assumption got tested. Instead of picking a model on instinct, I had an agent build a small harness that runs several models over real data and diffs every extracted row against a baseline.',
      'On a first sample, a cheaper model ran at 42% of the cost with 88 of 89 rows matching and no price errors. Model choice became a per-task setting backed by numbers, and every call is now tracked on a cost dashboard.',
    ],
    excerpt: {
      file: 'commit 5b71d9f · 3 July',
      text: `feat(llm): per-kind model config + A/B compare harness (cut extraction cost)

Extraction runs on Opus 4.8 ($5/$25) for every kind. Add per-kind model overrides (ANTHROPIC_MODEL_<KIND>) via modelFor() so cheaper models can be dialed in per kind, plus Sonnet 4.6 / Haiku 4.5 pricing so recorded costs stay accurate. New \`npm run llm:compare\` runs several models over real dumped price lists and diffs rows vs a baseline — measured Sonnet 4.6 at 0.42x Opus cost with 88/89 rows matched and zero price deltas on a 2-list sample.`,
    },
  },
  {
    title: "Don't ask a model to do what code can",
    body: [
      'Models are good at messy, judgment-heavy extraction and unreliable at exhaustive recall. When dense posts made the model silently drop lab-report links, the fix was not a longer prompt.',
      'Plain code now finds every link, the model only has to match a known list, and anything it still misses is reconciled afterwards, so nothing is lost. The deterministic part lives in a small, unit-tested library.',
    ],
    excerpt: {
      file: 'commit 0726ade · 12 July',
      text: `Regex-extract COA test links so the model doesn't drop any

Multi-product COA promo posts caused the extractor to miss some janoshik test links (recall drops on dense posts), silently losing third-party tests. Test reports are deterministic janoshik URLs, so now:

- regex every link out of the message and hand the model an explicit checklist, so it only has to attribute a known list rather than hunt for links;
- strengthen the prompt: a product can have several test links — include all;
- reconcile the result — append any link the model still dropped, resolving the product from the link slug (or leaving it for manual mapping and logging it), so no test is lost.

Link extraction + reconciliation live in a pure, unit-tested lib/llm/coa-links.`,
    },
  },
  {
    title: 'Turn every mistake into a standing rule',
    body: [
      'Agents follow a short rules file that every session loads. I wrote it on day nine to codify conventions that until then lived only in conversation, and the best rules name the incident that created them.',
      'When an agent gets something wrong, I fix the code and then fix the rules, so the same mistake does not happen twice. Claude Code and Codex read the same rules, so the standard does not depend on the tool.',
    ],
    excerpt: {
      file: 'CLAUDE.md',
      text: `## Verification

- Check \`npm run lint\` / \`npx tsc --noEmit\` **bare or by exit code — never through a pipe** (\`| tail\` masks failures; deploys have silently broken this way).
- Synthetic test scripts that touch the local DB must **read existing state first and restore exactly that in cleanup** — never blanket-delete rows (feature flags the owner flipped have been wiped this way).`,
    },
  },
  {
    title: 'Ship like it is production, because it is',
    body: [
      'Every commit is small and records the problem, the fix and how it was verified; 65 of them include an explicit verification note. Review catches what the agents miss: one filter failed open when it had no data yet, letting noise flood the review queue, and the fix made it fail closed and cut 138 false positives to 3 on real data.',
      'The same care goes into operations. When a flaky build started serving errors in production, the deploy learned to check its own health and recover.',
    ],
    excerpt: {
      file: 'commit a843dd4 · 4 July',
      text: `fix(deploy): self-heal — health-check after build, rebuild once on turbopack flake

Next 16 turbopack prod builds intermittently emit broken native-module externals (better-sqlite3, setup-node-env) that build fine but 500 at runtime; a fresh rebuild clears it. deploy.sh now health-checks / (exercises the DB) after build+restart and auto-rebuilds once if it 500s, so a flaky build can't leave the site down.`,
    },
  },
]

export const processPrinciples = [
  {
    title: 'Uncertainty goes to a human',
    body: 'When extraction is not confident, the item waits in a review queue. Nothing is guessed into the published data.',
  },
  {
    title: 'Cost is a design constraint',
    body: 'Repeat content is fingerprinted and served from a cache instead of a new model call, and full reprocessing is batched until it is worth the spend.',
  },
  {
    title: 'Fail safe, then make it visible',
    body: 'Defaults block rather than allow, and anything degraded shows up in the admin UI instead of failing silently.',
  },
]
