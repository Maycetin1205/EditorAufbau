# Code Review Checklist

This file is the **single source of truth** for code-review criteria. Both human-driven reviews via `.claude/skills/TRIP-review` and Codex-driven reviews via `.claude/skills/codex-code-review` apply the criteria below — referenced, not copied — so the two review surfaces cannot drift.

## Systematic Review Checklist

### 1. Functional Requirements

- [ ] Implementation logic matches requirements correctly
- [ ] Interface/API matches documented specifications
- [ ] Error scenarios handled with proper feedback
- [ ] Edge cases and boundary conditions validated

### 2. Code Quality

- [ ] Proper typing (no unjustified dynamic types)
- [ ] DRY principle - no code duplication
- [ ] KISS principle - not unnecessarily complex
- [ ] Consistent, descriptive naming conventions
- [ ] Complex logic has explanatory comments
- [ ] Files/modules not excessively large
- [ ] Imports/includes organized, unused ones removed

### 3. Architectural Compliance

- [ ] Code follows established patterns from ARCHI.md
- [ ] Proper separation of concerns
- [ ] Appropriate abstractions used
- [ ] Consistent with existing codebase style

### 4. Projekt-Regeln (Aufbau-Editor — die 10 Regeln aus CLAUDE.md)

- [ ] Registry statt Sondercode — nirgends `if typ === '...'` (Regel 2)
- [ ] Eine Render-Quelle — Editor-Hilfen im BlockHost, nie im Baustein (Regel 1)
- [ ] Technikwert ≠ Anzeigename — Klarnamen sichtbar, Feldcodes/NRs unsichtbar (Regel 3, Ausnahmen s. CLAUDE.md)
- [ ] Keine erfundenen Daten — Striche/Platzhalter statt Demo-Werte (Regel 7)
- [ ] SE-Kontrakte aus Originalquellen belegt; Installations-Individuelles als Daten/Vorlagen (Regel 5)
- [ ] Schicht-Regel: `src/softengine/` importiert NIE einen Baustein
- [ ] Zwei Design-Welten nicht gemischt (`--se-*` vs. shadcn)
- [ ] Nichts auf Verdacht gebaut — Gemeinsames erst beim echten zweiten Fall (Regel 10)

### 5. Export & SoftEngine-Laufzeit (wenn berührt)

- [ ] Export deterministisch; Zeichen-Regeln NUR in `serializer.ts`
- [ ] ff-runtime-Bündel erneuert, wenn Masken-Laufzeit geändert (`npm run build:runtime`)
- [ ] Referenzabzug grün bzw. absichtlich erneuert (Diff im Commit sichtbar)
- [ ] Preflight/Validator decken neue Fehlerfälle mit Klartext ab — nichts scheitert still (Regel 4)
- [ ] Editor-ids reisen nie in den Export (stabile ids/Klarnamen)
- [ ] Test-Bremse eingehalten: neue e2e nur bei Export/Laufzeit-Berührung, dann EIN Kreislauf
- [ ] SE-Echttest beim Nutzer angemeldet (gebündelt)

### 6. Error Handling

- [ ] Errors are properly caught and handled
- [ ] Error messages are clear and actionable
- [ ] Failure modes are graceful
- [ ] Logging is appropriate (not too verbose, not silent)

### 7. Security (if applicable)

- [ ] Input validation implemented
- [ ] No sensitive data exposed
- [ ] Authentication/authorization respected
- [ ] No obvious vulnerabilities

### 8. Performance

- [ ] No obvious performance issues
- [ ] Resource cleanup implemented (no leaks)
- [ ] Appropriate data structures used
- [ ] No unnecessary operations in hot paths

---

## Issue Severity Classification

**Critical (Block Deployment)**:

- Security vulnerabilities
- Data corruption risks
- Breaking API/interface changes
- Authentication bypasses

**Major (Require Immediate Fix)**:

- Incorrect business logic
- Significant performance degradation
- Missing error handling
- Compilation/build errors

**Minor (Should Fix)**:

- Code style inconsistencies
- Missing documentation
- Code duplication
- Missing edge case handling

**Suggestions (Nice to Have)**:

- Performance optimizations
- Readability improvements
- Additional test coverage

---

## Review Completion Criteria (Approval Gate)

Minimum for approval:

- [ ] All functional requirements implemented
- [ ] No critical or major issues remaining
- [ ] Prüfbündel grün (Regel 9): `npx tsc -b` + `npx eslint src` + `npm test` + `npx playwright test`
- [ ] Referenzabzug grün bzw. absichtlich erneuert (Diff im Commit sichtbar)
- [ ] New logic has test coverage (or a coverage-debt ledger entry per the hard-to-cover policy)
- [ ] Documentation updated per project standards (CLAUDE.md-Stand + ARCHI.md nach ARCHI-rules)
