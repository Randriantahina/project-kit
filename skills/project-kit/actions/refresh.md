# refresh

Run when the user asks to refresh/update project-kit's memory for a project
that already has `.project-kit/` — typically after the architecture changed
meaningfully (new stack added, major restructuring, new key dependency).

Unlike `init`, this does **not** touch `CHANGELOG.md` and does not rebuild
everything from scratch — it updates the standing snapshots in place.

## 1. Re-detect stacks

Follow `../references/stack-detection.md` again. Compare against the stacks
already covered under `.project-kit/skills/`:
- new stack found → generate its module (same process as `init` step 2)
- existing stack module → skim it against the current code; update it only
  if it's actually stale (framework version bump, new convention adopted).
  Don't rewrite a module that's still accurate just to "refresh" it.

## 2. Update PACKAGES.md

Re-parse the manifests. Add new dependencies, remove ones no longer present,
update the objective note for any dependency whose role in the project
changed.

## 3. Update PROJECT.md

Update the architecture snapshot only where it's actually out of date.
Preserve notes that are still true.

## 4. Update BEST-PRACTICES.md

Re-check the "state of this project" note from `init` step 5 (which
patterns are followed/violated) against the current code, and update the
idiomatic-guidance section if a newly added stack needs its own section.

## 5. Report

Summarize what changed in these files (not a changelog entry — this is
project-kit's own bookkeeping, not a task the user asked for). If nothing
was actually stale, say so plainly instead of writing no-op edits.
