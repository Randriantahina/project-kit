# Staleness tracking

Read this from `init.md` and `refresh.md` to write the state file, and to
understand what `hooks/check_staleness.js` checks automatically on every
`SessionStart` (that script re-implements the "checking it" logic below
directly in Node — it doesn't read this file at runtime, so keep the two in
sync if you change the rules here).

This replaces guessing at "is this file still accurate?" with an objective
check based on what changed on disk since the memory was last written, and
— because it runs as a hook rather than a skill instruction — it fires on
every session regardless of whether project-kit itself gets invoked for
the task at hand.

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

## Checking it (done automatically by `hooks/check_staleness.js`)

1. If `.project-kit/.state.json` is missing, this project predates this
   feature (or was never fully initialized) — stay silent rather than
   alarming on every session; `init`/`refresh` will create it.
2. Otherwise compare:
   - current `git rev-parse HEAD` (if a git repo) against `gitCommit`.
     Different → the project has moved since the last sync. Try
     `git rev-list --count <stored>..HEAD` for a commit count; if that fails
     (e.g. history was rewritten), just note "history diverged" instead.
   - a fresh hash of each file listed in `manifestHashes` against the
     stored value. Any mismatch → dependencies changed since the last sync.
3. If either check shows drift, print **one short line** to stdout and exit
   0 — on `SessionStart`, that output is added directly to the
   conversation's context, so it's visible from the very first turn without
   anyone needing to invoke the skill. If nothing is stale, print nothing:
   a healthy project should cost zero extra tokens for this check.

Never re-run a full `init`/`refresh` automatically just because this check
found drift — that would burn the exact token budget this whole mechanism
exists to save. The point is an honest, cheap signal the user (or a future
you) can act on, not an automatic re-scan.
