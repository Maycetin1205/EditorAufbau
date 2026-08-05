The iteration loop has converged (or been capped). Produce a **consolidated final review** for archival.

This is the canonical record of how this change was reviewed. Cover every finding from the whole thread — addressed, overridden, or open — with final status and `file:line` references.

## Format

Plain markdown, no template file. Sections:
- **Title**: feature/change name from `{{TARGET}}`
- **Review Date**: today's date (YYYY-MM-DD)
- **Files Reviewed**: from `git diff --name-only HEAD`
- **Plan**: `{{TARGET}}` if it is a file path, else "no plan — unplanned change"
- **Findings**: every finding from all rounds with `file:line` and disposition (addressed / overridden with rationale / open)
- **Verdict**: `APPROVED` / `APPROVED with observations` / `NEEDS REVISION`

Output only the rendered markdown — no preamble or commentary.

## Sentinel

After the review, on its own line: `PROMOTION_READY`

{{EXTRA_PROMPT}}
