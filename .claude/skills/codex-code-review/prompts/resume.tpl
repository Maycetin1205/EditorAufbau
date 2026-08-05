The code change for plan `{{TARGET}}` has been updated since your previous review. Re-run `git status -s` and `git diff HEAD` (the same working-tree-vs-last-commit view from turn 1) to see the current state, then produce an incremental review:

  1. Confirm whether each of your prior findings is now addressed. Quote the prior finding briefly, then state addressed / not addressed / partially addressed with the `file:line` references that resolved (or didn't).
  2. Flag any **new** issues introduced by the edits — re-checking against the same review priorities from turn 1 (correctness, security/safety, plan conformance, practical concerns) and the rules in `CLAUDE.md`.

## Implementer notes

The implementer has provided context on what changed and why. Findings that
are explicitly marked as intentional decisions, environment limitations, or
with a doc-update to-do should NOT be re-flagged.

{{IMPLEMENTER_NOTES}}

Apply the same severity tags (P1/P2) and the same approval gate as the initial review.

End with the same tag on its own line:

  APPROVED
  REQUEST_CHANGES
  NEEDS_REWORK

{{EXTRA_PROMPT}}
