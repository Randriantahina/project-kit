# Staleness tracking

Read this from `init.md`, `refresh.md`, and `SKILL.md`'s always-on section.
It replaces guessing at "is this file still accurate?" with an objective
check based on what changed on disk since the memory was last written.

## The state file

`.project-kit/.state.json`, written by `init` and `refresh`, never by hand:

```json
{
  "syncedAt": "2026-08-26T19:04:00Z",
  "gitCommit": "a1b2c3d4e5f6...",
  "manifestHashes": {
    "composer.json": "sha256:...",
    "pubspec.yaml": "sha256:..."
  }
}
```

- `syncedAt` — timestamp of the `init`/`refresh` run that wrote this file.
- `gitCommit` — output of `git rev-parse HEAD` at that time, or `null` if
  the project isn't a git repo.
- `manifestHashes` — a sha256 of each manifest file used during stack
  detection (`composer.json`, `pubspec.yaml`, `Cargo.toml`, `package.json`,
  ...), keyed by its path relative to the project root. Covers dependency
  changes even when there's no git history to compare (uncommitted work) or
  when git history was rewritten.

## Writing it (end of `init` / `refresh`)

Compute `gitCommit` and `manifestHashes` for the manifests actually found
during stack detection, and write/overwrite `.project-kit/.state.json` with
the current timestamp. This is the last step of both actions, after
everything else has been written.

## Checking it (start of any task in a project with `.project-kit/`)

1. If `.project-kit/.state.json` is missing, this project predates this
   feature (or was never fully initialized) — mention it once, suggest
   `/project-kit refresh` to enable tracking, and move on without blocking.
2. Otherwise compare:
   - current `git rev-parse HEAD` (if a git repo) against `gitCommit`.
     Different → the project has moved since the last sync. Try
     `git rev-list --count <stored>..HEAD` for a commit count; if that fails
     (e.g. history was rewritten), just note "history diverged" instead.
   - a fresh hash of each file listed in `manifestHashes` against the
     stored value. Any mismatch → dependencies changed since the last sync.
3. If either check shows drift, surface **one short line** at the start of
   your response (not a blocking question): what's stale and roughly by how
   much (e.g. "project-kit memory is 42 commits behind HEAD, dependencies
   unchanged — consider `/project-kit refresh`"). Then proceed using the
   existing memory anyway.

Never re-run a full `init`/`refresh` automatically just because this check
found drift — that would burn the exact token budget this whole mechanism
exists to save. The point is an honest, cheap signal the user (or a future
you) can act on, not an automatic re-scan.
