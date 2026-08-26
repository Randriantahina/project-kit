# log

Called explicitly via `/project-kit log`, or self-triggered by `SKILL.md`'s
"always-on behavior" right after finishing a meaningful task.

## 1. Draft the entry

Look at what actually changed this session (git status/diff, or the list of
files you edited if git isn't in use). Draft an entry in this shape:

```
## YYYY-MM-DD — <short title>
- What changed: <1-3 lines, plain language>
- Why: <the reason/request behind it>
- Files: path/one, path/two
- Notes: <optional — a deviation from BEST-PRACTICES.md worth flagging, a
  follow-up left undone, a decision made along the way>
```

Keep it factual and short. This is a changelog entry, not a commit message
essay and not a restatement of the diff.

## 2. Confirm before writing

Show the drafted entry to the user and ask for a go-ahead (or let them edit
it) before appending it to `.project-kit/CHANGELOG.md`. This is the hybrid
behavior: auto-drafted, human-approved. Don't skip the confirmation step
even if the change seems obviously fine — the user decides what's worth
keeping in the permanent record.

## 3. Skip when not worth it

If the task was trivial (a typo, a one-off question with no file changes,
something the user clearly treats as throwaway), say so and skip the
changelog instead of asking for confirmation on a near-empty entry.
