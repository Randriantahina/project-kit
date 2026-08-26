# init

Run once when a project has no `.project-kit/` folder yet (or is re-run
deliberately to rebuild everything from scratch — ask for confirmation
before overwriting an existing `.project-kit/` in that case).

## 1. Detect the stack(s)

Follow `../references/stack-detection.md`. A project can have more than one
stack (e.g. a Laravel API + a Flutter app in the same repo, or a Rust/Axum
backend). Detect all of them; don't force a single answer.

If nothing in the reference matches, look for the closest signal (a single
recognizable manifest or config file, a dominant file extension) and name
that stack anyway — the point is coverage, not a perfect taxonomy. If truly
nothing is identifiable, tell the user and ask what the stack is.

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

Create `.project-kit/CHANGELOG.md` with a single header line and today's
date as the "created" entry. Entries follow this shape:

```
## YYYY-MM-DD — <short title>
- What changed: ...
- Why: ...
- Files: path/one, path/two
```

## 7. Wire memory into CLAUDE.md

Ensure the project has a `CLAUDE.md` at its root (create a minimal one if
missing). Add these lines if not already present (do not duplicate them on
a re-run):

```
@.project-kit/PROJECT.md
@.project-kit/PACKAGES.md
@.project-kit/BEST-PRACTICES.md
```

## 8. Report

Summarize what was created/detected in the chat: stacks found, files
written, and remind the user these are plain files they should commit like
any other project file.
