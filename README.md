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
   conversation doesn't need to re-scan the codebase, and keeps a changelog
   of what was done over time.

## Install

Locally, from this repo:

```
/plugin marketplace add /path/to/project-kit
/plugin install project-kit@project-kit
```

(or, non-interactively: `claude plugin marketplace add /path/to/project-kit`
then `claude plugin install project-kit@project-kit`)

Once published to a git remote, replace the path above with
`<account>/project-kit`.

## Usage

- `/project-kit init` — first-time setup in a project: detects the stack,
  writes `.project-kit/PROJECT.md`, `PACKAGES.md`, `BEST-PRACTICES.md`,
  `skills/<stack>.md`, and wires the first three into the project's
  `CLAUDE.md` so they load automatically every session.
- `/project-kit log` — draft and (after your confirmation) append a
  changelog entry for what just changed. Also triggered automatically at
  the end of a meaningful task.
- `/project-kit refresh` — update the standing snapshots after a
  significant architecture change, without touching the changelog history.

## Why

Every new conversation on a project otherwise starts from zero: the agent
either remembers nothing (new chat) or has to re-read the codebase to
rebuild context, which costs tokens every time. `project-kit` front-loads a
curated, versioned summary (architecture, dependencies, conventions, design
guidance) that gets imported automatically, and keeps a running record of
what changed and why — so context survives across conversations without
paying for a full re-scan each time.
