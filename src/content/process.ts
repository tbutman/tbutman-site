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
    title: 'Write the spec first',
    body: [
      'Every project starts with a living spec: the goal, the domain model, the architecture, and a phased build plan. Anything I am unsure about is marked as an assumption or an open question instead of being quietly decided, so neither I nor an agent builds on a guess.',
      'The spec is what agents read before they touch the code, and it changes as the product does.',
    ],
    excerpt: {
      file: 'SPEC.md',
      text: `> Status: draft v1 (2026-06-27). Distilled from ideation.
> Open items and assumptions are marked **[ASSUMPTION]** / **[OPEN]** — flag any to change.

### The draft → published boundary

Imports enter as **drafts**, sit in a **needs-review** queue if any required field is unresolved (never guessed), get resolved/aliased, then **published**.`,
    },
  },
  {
    title: 'Turn every mistake into a standing rule',
    body: [
      'Agents follow a short rules file that every session loads. Most rules exist because something went wrong once: a check that passed when it should have failed, or a test script that wiped settings it should have left alone.',
      'When an agent makes a mistake, I fix the code and then fix the rules, so the same mistake does not happen twice.',
    ],
    excerpt: {
      file: 'CLAUDE.md',
      text: `## Verification

- Check \`npm run lint\` / \`npx tsc --noEmit\` **bare or by exit code — never through a pipe** (\`| tail\` masks failures; deploys have silently broken this way).
- Synthetic test scripts that touch the local DB must **read existing state first and restore exactly that in cleanup** — never blanket-delete rows (feature flags the owner flipped have been wiped this way).`,
    },
  },
  {
    title: 'Small changes, detailed records',
    body: [
      'Agents work in small, single-purpose commits, each with a message that explains the problem, the fix and how it was verified. The history reads like an engineering log, which makes review fast and makes it easy to see why any line exists.',
      'I use more than one agent (Claude Code and Codex) and keep the same rules file for both, so the standards do not depend on which tool did the work.',
    ],
    excerpt: {
      file: 'git log --oneline (two days in August)',
      text: `7c4b117 Classifier provenance: live re-guess instead of a stored baseline
8cabd22 Classifier provenance: diff against a FROZEN auto-baseline
435e5ad Rep gate: fail SAFE (not open) when a vendor has no synced reps
b21bd8d Process all: run in the background with live progress instead of blocking
3a7701b Process all: show extraction count + rough cost + blocking warning before running
f2c14b2 Render all user-facing dates in the viewer's timezone`,
    },
  },
  {
    title: 'Review like it is going to production',
    body: [
      'Because it is. One review caught a filter that failed open: when a data source had no allow-list yet, it let everything through and flooded the review queue. The fix made it fail closed, refused to replace a good allow-list with an empty fetch, and surfaced the condition in the admin UI. It was verified with unit tests and by re-running detection on real data, which cut 138 false positives to 3.',
      'Review also means simplifying. One design shipped, and the next day I replaced it with a simpler version that had a single source of truth, then wrote the lesson into the code as a contract for future changes.',
    ],
    excerpt: {
      file: 'commit 435e5ad (abridged)',
      text: `Rep gate: fail SAFE (not open) when a vendor has no synced reps

A vendor with no reps made detection fail OPEN, flooding the queue. Fix, layered:

- Fail-safe gate: with no reps, only channel posts pass.
- A failed or empty fetch never replaces the existing reps; it is a retryable no-op.
- Surface it: a warning on /vendors and a banner on /updates.

Verified: unit test (11/11); re-detect on real data dropped 138 -> 3 pending.`,
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
    body: 'Model calls cost money, so expensive reprocessing is batched, tracked on a cost dashboard and only run when it is worth it.',
  },
  {
    title: 'Fail safe, then make it visible',
    body: 'Defaults block rather than allow, and anything degraded shows up in the admin UI instead of failing silently.',
  },
]
