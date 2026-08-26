---
name: project-kit
description: Detect a project's stack, generate the skills and best-practices it needs, and maintain a versioned project memory (architecture, dependencies, changelog) so a new conversation never has to re-scan the whole codebase. Use when the user runs "/project-kit init" on a new or existing project, wants to refresh that memory, wants to log what just changed, or is about to write code in a project that already has a ".project-kit/" folder.
---

# project-kit

Router skill. Dispatch on the first argument passed after `/project-kit`.

| Argument | Action |
|---|---|
| `init` (or no `.project-kit/` folder yet and the user asks to set one up) | Run `actions/init.md` |
| `log` (or a significant task in this project just finished) | Run `actions/log-change.md` |
| `refresh` | Run `actions/refresh.md` |
| anything else / no argument | Explain the three actions above and ask which one is wanted |

## Always-on behavior in a project that has `.project-kit/`

`.project-kit/PROJECT.md`, `.project-kit/PACKAGES.md`, and
`.project-kit/BEST-PRACTICES.md` are imported into the project's `CLAUDE.md`
by `actions/init.md`, so they load automatically at the start of every
session — do not re-read the whole codebase to rediscover facts already
in these files. Only fall back to a fresh scan if a file is missing,
contradicts what you observe in the code, or is clearly stale.

While writing code in such a project:
- Consult `.project-kit/BEST-PRACTICES.md` for the design choice to make
  (which pattern, which layer owns what responsibility) — it already
  contains the idiomatic answer for this project's stack, not just generic
  theory.
- After finishing a meaningful task (new feature, bug fix, refactor,
  migration, non-trivial config change), follow `actions/log-change.md` to
  propose a changelog entry before ending the turn. Skip it for trivial
  one-line asks the user clearly considers throwaway.

## Design principles for the actions below

- Never fabricate URLs, usernames, or emails — ask the user or leave the
  field out.
- Everything this skill writes into a project (`.project-kit/`, the
  `CLAUDE.md` import lines) must be committed by the user like any other
  project file — do not `git add`/`git commit` on their behalf unless asked.
- Content generated for a project (stack skills, best-practices) must be
  grounded in that project's actual files and dependencies, not generic
  boilerplate copy-pasted across projects.
