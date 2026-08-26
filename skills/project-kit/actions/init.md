# init

Run once when a project has no `.project-kit/` folder yet (or is re-run
deliberately to rebuild everything from scratch — ask for confirmation
before overwriting an existing `.project-kit/` in that case).

## 1. Detect the stack(s)

Follow `../references/stack-detection.md`. A project can have more than one
stack (e.g. a Laravel API in `backend/` + a Flutter app in `frontend/`, or a
Rust/Axum service alongside a React admin panel). Detect all of them; don't
force a single answer, and note which subfolder each stack lives in when
they're split like this.

If nothing in the reference matches, look for the closest signal (a single
recognizable manifest or config file, a dominant file extension) and name
that stack anyway — the point is coverage, not a perfect taxonomy. If truly
nothing is identifiable, tell the user and ask what the stack is.

**Monorepo rule:** there is exactly one `.project-kit/` folder, at the
**repository root**, regardless of how many stacks/subfolders are found —
never one per subfolder. `PROJECT.md` (step 4) records the folder → stack
mapping. Stack modules under `.project-kit/skills/` are named after the
stack (`laravel.md`, `flutter.md`), not the folder; only add a folder suffix
(`laravel-backend.md`, `laravel-admin.md`) if two subfolders genuinely use
the *same* stack in different, non-interchangeable ways.

## 2. Generate the stack skill module(s)

For each detected stack, write `.project-kit/skills/<stack>.md` covering,
grounded in what you actually find in this project (not generic boilerplate):

- directory/file layout conventions this project follows
- the framework's core building blocks relevant to day-to-day work (for
  example: migrations, jobs/queues, events, service providers for Laravel;
  widgets, state management approach in use, routing for Flutter; router,
  extractors, middleware, error handling for Axum)
- common commands used to build/test/run in this project (read
  `package.json` scripts, `Makefile`, `composer.json` scripts, etc. rather
  than guessing generic ones)
- known pitfalls or version-specific behavior relevant to the exact
  framework version pinned in this project's manifest

Skip regenerating a stack module that already exists and still matches the
detected stack — `refresh` handles updates, `init` is for first-time setup.

## 3. Inventory the packages

Parse the manifest(s) present (`composer.json`, `pubspec.yaml`, `Cargo.toml`,
`package.json`, `go.mod`, ...) and write `.project-kit/PACKAGES.md`: for each
direct dependency, name, version, and a one-line objective **specific to
this project** — grep for where/how it's actually used rather than repeating
its generic marketing description. Group by rough purpose (HTTP, testing,
persistence, UI, ...) if the list is long.

## 4. Write the architecture snapshot

Write `.project-kit/PROJECT.md`: stack(s), high-level structure, naming and
code-organization conventions actually observed, and any architectural
decisions visible in the code (why a folder is structured a certain way, an
unusual choice worth flagging). Keep this to what isn't obvious from
skimming the file tree — don't restate a directory listing.

If more than one stack was detected (monorepo), open with an explicit
folder → stack table (e.g. `backend/` → Laravel, `frontend/` → Flutter) —
this is the one place that mapping is recorded.

## 5. Write the project's best-practices file

Read `../references/best-practices-core.md` (generic, ships with this
plugin — do not rewrite it). Write `.project-kit/BEST-PRACTICES.md`:
translate the relevant parts of the core reference into concrete, idiomatic
guidance for each stack detected in step 1 (see the examples in that
reference for the tone expected — e.g. DTOs, Repository/Service layers,
dependency inversion, error-handling boundaries, expressed in that stack's
idioms). Then spend a few targeted reads/greps on the actual codebase and
add a short "state of this project" note: which of these patterns are
already followed, which are notably absent or violated. This second part is
what makes the file actionable instead of a generic lecture.

## 6. Seed the changelog

Create the `.project-kit/changelog/` directory with a single first entry,
`YYYY-MM-DD-HHmm-project-kit-init.md` (today's date/time), following the
shape used by every future entry (see `log-change.md`):

```
## YYYY-MM-DD — project-kit init
- What changed: initial project-kit setup for this project
- Why: bootstrap stack skills, package inventory, best-practices, and memory
- Files: .project-kit/
```

Each changelog entry is its own file — never a single growing file — so
that concurrent branches don't collide on it in a merge.

## 7. Write the staleness state

Follow `references/staleness.md` to write `.project-kit/.state.json` — this
is what lets a future session tell whether everything above is still
accurate without re-scanning the project. Do this last, after every other
file in this list has actually been written.

## 8. Wire memory into CLAUDE.md

Ensure the project has a `CLAUDE.md` at its root (create a minimal one if
missing). Add this block if not already present (do not duplicate it on a
re-run):

```
@.project-kit/PROJECT.md
@.project-kit/PACKAGES.md
@.project-kit/BEST-PRACTICES.md

When making a design decision in this project (which pattern to use, which
layer owns a responsibility), follow @.project-kit/BEST-PRACTICES.md
instead of defaulting to generic conventions.
```

The instruction line matters as much as the import: end-to-end testing
showed that a design-guidance sentence living only in this skill's own
`SKILL.md` never applies unless the skill happens to be invoked for the
task — a plain "add a field to this endpoint" request usually won't invoke
it. `CLAUDE.md` is loaded on every turn regardless, so putting the
instruction there (not just the raw file content) is what makes it apply
even when this skill never runs.

`.project-kit/changelog/` and `.state.json` are deliberately **not**
imported here — the changelog would grow the always-on token cost forever,
and the state file is only useful to the staleness check, not as reading
material.

## 9. Ignore the local nag-throttle file

Add `.project-kit/.nag-state.local.json` to the project's `.gitignore`
(create the file if it doesn't exist yet) if not already present. This is a
timestamp file the `Stop` hook uses to avoid nagging repeatedly about a
missing changelog entry — purely local bookkeeping, not memory content, so
it shouldn't be committed or trigger merge conflicts.

## 10. Report

Summarize what was created/detected in the chat: stacks found, files
written, and remind the user these are plain files they should commit like
any other project file.
