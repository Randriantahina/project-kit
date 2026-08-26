# project-kit

A Claude Code plugin that, for any project:

1. detects its tech stack(s) (`/project-kit init`),
2. generates the skill knowledge needed for each stack (e.g. Laravel →
   migrations/jobs/queues, Flutter → widgets/state management, Rust/Axum →
   extractors/middleware), grounded in the actual project rather than
   generic templates,
3. documents the project's dependencies and what each one is for,
4. writes a per-project best-practices guide (SOLID, design patterns, DTOs,
   Repository/Service layers, ...) applied idiomatically to the detected
   stack(s), plus a note on what the project already follows or violates,
5. maintains a versioned project memory (`.project-kit/`) so a **new**
   conversation doesn't need to re-scan the codebase, keeps a changelog of
   what was done over time, and tracks whether that memory has drifted from
   the current code so it's never trusted silently once stale.

## Install

```
/plugin marketplace add Randriantahina/project-kit
/plugin install project-kit@project-kit
```

(or, non-interactively: `claude plugin marketplace add Randriantahina/project-kit`
then `claude plugin install project-kit@project-kit`)

For local development instead, point at your working copy:
`/plugin marketplace add /path/to/project-kit`.

## Usage

- `/project-kit init` — first-time setup in a project: detects the stack,
  writes `.project-kit/PROJECT.md`, `PACKAGES.md`, `BEST-PRACTICES.md`,
  `skills/<stack>.md`, `.state.json`, and a first entry under
  `changelog/`; wires `PROJECT.md`/`PACKAGES.md`/`BEST-PRACTICES.md` into
  the project's `CLAUDE.md` so they load automatically every session.
- `/project-kit log` — draft and (after your confirmation) write a new
  changelog entry — one file per entry, under `.project-kit/changelog/`, to
  stay merge-conflict-free across branches. Also triggered automatically at
  the end of a meaningful task.
- `/project-kit refresh` — update the standing snapshots (and the
  staleness state) after a significant architecture change, without
  touching the changelog history. Also the response to the staleness
  notice project-kit surfaces when its memory has drifted from the current
  code.

## Safety net

A `Stop` hook (`hooks/check_changelog.js`) checks, at the end of a turn,
whether a project-kit project has uncommitted changes and no changelog
entry for today — if so it blocks once with a reminder to run `log`. It's
throttled (won't re-nag within 15 minutes) and guarded against looping on
its own continuation. It never writes anything itself; the confirm step in
`log-change.md` is still what decides what gets recorded.

## Why

Every new conversation on a project otherwise starts from zero: the agent
either remembers nothing (new chat) or has to re-read the codebase to
rebuild context, which costs tokens every time. `project-kit` front-loads a
curated, versioned summary (architecture, dependencies, conventions, design
guidance) that gets imported automatically, and keeps a running record of
what changed and why — so context survives across conversations without
paying for a full re-scan each time.
