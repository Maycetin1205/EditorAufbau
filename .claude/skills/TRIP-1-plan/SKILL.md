---
name: TRIP-1-plan
description: Plan a new feature following project standards
argument-hint: "describe the feature you want to build"
---

# Planning Mode

You are now in **planning mode** for **Aufbau-Editor (EditorAufbau)**.

> Projekt-Kontext: Regeln, Entscheidungen und Stand leben in `CLAUDE.md` (bei
> Widerspruch gewinnt CLAUDE.md bzw. der Nutzer). Der Nutzer kann nicht
> programmieren — alle Rückfragen und Zusammenfassungen auf Deutsch und
> fachlich (was die Maske können soll), nie als Technik-Review.

## Prerequisites - Read First

Before creating any plan, you MUST read ALL THE LINES of:

1. @docs/ARCHI.md - Understand current system architecture

## Your Task

Plan the following feature: $ARGUMENTS

---

## Step 1: Discovery & Clarification (Interactive)

**Do NOT start writing a plan immediately.** First, engage in a discovery conversation to fully understand the user's intent.

### 1.1 Initial Understanding

After reading the feature request, summarize your understanding in 2-3 sentences, then **use the `AskUserQuestion` tool** to present clarifying questions with structured options.

Frame questions around:

- **Scope**: What's included vs excluded?
- **Behavior**: How should it work from the user's perspective?
- **Constraints**: Any technical limitations, deadlines, or dependencies?
- **Priority**: What's most important if trade-offs are needed?

For each question, provide 2-4 concrete options based on your analysis of the codebase and the feature request. Always let the user provide custom input via the built-in "Other" option.

After the user answers, proceed **directly to writing the plan** (Step 2) — no approach-confirmation question. Ask a follow-up round with `AskUserQuestion` only if a blocking ambiguity remains (**maximum 3 rounds total**; if still unclear, summarize what you know and proceed with noted assumptions).

---

## Step 2: Plan Document Creation

Once understanding is confirmed, create the plan document.

### File Naming

Depending on the feature (major, minor, patch), propose a new version using SemVer (x.y.z) and create:
`docs/1-plans/F_[version]_[feature-name].plan.md`

### Required Sections

```markdown
# [Feature Name] Implementation Plan

## Overview

[2-4 sentences describing the feature and its purpose]

## Problem Statement (if applicable)

[Current limitations/issues this feature addresses]

## Solution Architecture

[High-level design approach]

## Implementation Details

### 1. [Component/Module/File Name]

**File**: `path/to/file`

[Detailed description of changes needed]

**Current state** (if modifying existing):
[Describe what currently exists]

**Modifications**:

- Specific change 1 (around line X)
- Specific change 2 (around line Y)

### 2. [Next Component/Module/File]

[Continue with same pattern]

## Technical Considerations

- **Pattern Usage**: Which existing patterns to follow (from ARCHI.md)
- **Registry statt Sondercode**: neue Fähigkeiten als BlockDefinition-Einträge, nirgends `if typ === '...'` (Regel 2)
- **Export berührt?**: Wenn ja — ff-runtime-Bündel erneuern (`npm run build:runtime`), Referenzabzug (absichtliche Änderung → `npx vitest run -u`, Diff im Commit sichtbar), SE-Echttest beim Nutzer einplanen (wird gebündelt)
- **Klarname vs. Technikwert**: sichtbar sind Klarnamen; Feldcodes/IDs/NRs arbeiten unsichtbar (bewusste Ausnahmen: CLAUDE.md Regel 3)
- **Zwei Design-Welten**: Masken-Tokens (`--se-*`) vs. Editor-UI (shadcn) — nie mischen
- **Keine erfundenen Daten**: Striche/Platzhalter statt Demo-Werte (Regel 7)
- **Test-Bremse**: neue e2e NUR bei Export/Laufzeit-Berührung, dann EIN Kreislauf-Test (Regel 9)
- **Nichts auf Verdacht**: Gemeinsames erst beim echten zweiten Fall herausziehen (Regel 10)
- **Edge Cases**: leere Werte (LEER-Regel), alte Speicherstände (Migration), fehlender Daten-Push

## Files to Modify/Create

[Comprehensive numbered list with purposes]

1. `path/to/file1` (modify) - Purpose description
2. `path/to/file2` (new) - Purpose description

## Type Definitions (if applicable)

[New types, interfaces, structs, or modifications to existing ones]

## Performance & Cost Impact (if applicable)

[Expected performance implications]

## Backward Compatibility (if applicable)

[Migration strategy if needed]

## Test Impact

[2-5 bullets: which existing tests the change affects, what new logic will need tests, whether an integration/E2E check applies. No test code — the TRIP-2 testing gate consumes this section.]

## To-dos

### Phase 1: [Phase Name] (if multiple phases are needed) or simply skip title if only one phase is needed

- [ ] Task description
- [ ] Another task

### Phase 2: [Phase Name] (if applicable)

- [ ] Task description
- [ ] Another task

**Note**: For simple plans, a single phase is sufficient. Split into multiple phases only for complex features requiring sequential implementation.

**Note**: Do NOT write test code during planning — the Test Impact section above only names what the TRIP-2 testing gate will run and author.
```

## Quality Standards

- **Zero Ambiguity**: Every step must be clear and actionable
- **File-Level Specificity**: List exact files and functions to modify
- **Architecture Alignment**: Must conform to existing patterns in ARCHI.md
- **Risk Assessment**: Highlight potential failure points

---

## Step 3: Codex Second-Opinion Review

Before the user sees the plan, run the Codex plan review loop.

### Confirm

`AskUserQuestion`: "I'll run Codex as a second-opinion reviewer and iterate until clean. Proceed?"
Options: "Yes, run Codex review" (recommended) / "Skip Codex, go to user review" / "Cap iterations at N"

Skip for trivial plans (single-file, low-risk). Run for non-trivial (new module, schema/algorithm change).

### Loop

1. **Start**: `bash .claude/skills/codex-plan-review/scripts/start.sh --prompt-file .claude/skills/codex-plan-review/prompts/start.tpl <plan-path>`
2. **Parse trailing tag**: `APPROVED` -> Step 4. `NEEDS_REWORK` -> surface to user. `REQUEST_CHANGES` -> continue.
3. **Address findings critically** — quote each P1/P2, push back on incorrect ones, fix legitimate ones by editing the plan in place.
4. **Write implementer notes** (1-3 sentences): which findings you fixed, which you pushed back on and why, any user decisions that override existing docs or environment limitations that can't be resolved in the plan.
5. **Resume** with notes:
   ```bash
   bash .claude/skills/codex-plan-review/scripts/resume.sh \
       --prompt-file .claude/skills/codex-plan-review/prompts/resume.tpl \
       --notes "Fixed X. Pushed back on Y because Z. User decided W." \
       <plan-path>
   ```
   -> back to step 2.
6. **Cap at 5 rounds** (or user-specified). Surface remaining findings and let user decide.

Surface Codex reviews verbatim. Keep edits scoped to findings. Reset thread (`reset.sh <plan-path>`) only if context is genuinely confused.

---

## Step 4: User Review & Validation

After Codex review converges (or is skipped), present the plan to the user **in
chat, auf Deutsch, in Klartext** — the user is not a programmer: no
file-review requests, no jargon. Summarize:

- **Vorhaben**: was die Maske/der Editor danach kann (fachlich)
- **Ansatz**: 1–2 Sätze
- **Preisschild**: Aufwand; Export berührt? → Referenzabzug erneuern + SE-Echttest (gebündelt)
- **Codex-Zweitmeinung**: APPROVED / übersprungen / offene Punkte in Klartext

Then **STOP and wait for the user's explicit „go"** (Projektregel — eine
Reihenfolge-Aussage wie „dann machen wir …" ist KEINE Freigabe). Einwände →
Plan anpassen und erneut vorlegen (bei substanziellen Änderungen noch eine
Codex-Runde). Nach „go" direkt weiter mit `TRIP-2-implement` auf diesem Plan.

---

## IMPORTANT: No Code Implementation

**DO NOT write code snippets or implement anything during planning.**

This is a high-level planning phase only. Your plan should describe:

- WHAT needs to be done (features, changes, structures)
- WHERE changes will happen (files, modules, functions)
- WHY certain approaches are chosen (trade-offs, rationale)

But NOT:

- Actual code implementations
- Detailed algorithm code

Keep it architectural and descriptive. Code comes in the `TRIP-2-implement` phase.

## Für neue Bausteine

Pflicht-Analyse:

- BlockDefinition-Fähigkeiten (allowedChildTypes, bindableSpots, blockEvents, bindingProp, acceptsDataSource, resizableHeight, …)
- Web Component rendert im Editor UND Export identisch (eine Render-Quelle; Editor-Hilfen gehören in den BlockHost, nie in den Baustein)
- Masken-Tokens (`--se-*`) statt Editor-CSS
- Verhalten bei leeren Werten (LEER-Regel) und ohne Datenquelle (Platzhalter, nie Demo-Daten)
- Export: HTML-Erzeugung abgedeckt + Preflight-Fälle mit Klartext

## Für neue Ketten-Schritt-Arten

Pflicht-Analyse:

- Echte Union im Aktionsmodell (`src/core/data/`), Klarname vs. Technikwert
- StepForm-Formular (nur Unzeigbares ins Formular), Text der Schrittzeile
- Laufzeit in `seAktionen.ts` + Wächter-Fälle (aktionen.test, seAktionen.test)
- Export: was reist mit (FF_RELATIONS / FF_DATA_SOURCES) — Editor-ids reisen NIE
- Preflight: welche Fehlkonfiguration blockt mit welchem Klartext?

## Für Änderungen an der SoftEngine-Schicht

Pflicht-Analyse:

- Kontrakt aus einer Originalquelle belegt? (Regel 5 — nie raten; unbelegt → Merkliste)
- Schicht kennt NIE einen Baustein (Abhängigkeitsregel)
- Wirkung auf BEIDE Plattformen (BüroWARE/WinUI und WEBWARE)
- ff-runtime-Bündel + Referenzabzug + SE-Echttest einplanen
