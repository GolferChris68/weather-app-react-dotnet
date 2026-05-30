# Claude Code — Project Instructions

## Git workflow

All changes go on a feature branch, never directly on `master`.

**Branch naming:** `feature/<short-description>` (e.g. `feature/night-icons`, `feature/auto-refresh`)

**Sequence for every task:**
1. Create a branch from the latest `master`: `git checkout -b feature/<name>`
2. Commit work there as usual
3. Push the branch: `git push -u origin feature/<name>`
4. Open a PR targeting `master` via `gh pr create`

Do not `git push` to `master` directly. Do not merge the branch yourself — leave that to the user.

## Spec and skill files

`specs/weather-app.spec.md` is the source of truth for requirements.
`skills/` contains implementation guidance for specific subsystems.
Always update the relevant spec/skill file when behaviour changes.

## Open questions

Never resolve the open questions in `specs/weather-app.spec.md` (OQ-1, OQ-2, OQ-3)
unilaterally. Ask the user before implementing anything that touches them.
See `guardrails/guardrails.md` for the full list of constraints.
