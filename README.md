# Worksheet Hub — Math Lagoon

Independent static worksheet app: maths, reading and optional enrichment across five **skill levels**, not five school grades. No account, server database or ChatGPT connection is needed.

## Improvements

- Strict numeric checking rejects partial answers such as `5abc` and does not truncate decimals.
- Arithmetic worksheets sample unique questions, including mirrored addition/multiplication pairs. New worksheets may revisit previous questions: this is practice, not a globally unique curriculum bank.
- Foundation arithmetic stays within 10. Level 3 arithmetic tables stay within 10; Level 4 division uses a three-digit dividend and one-digit divisor.
- Shorter default worksheets, examples, hints, written answer feedback and retry-mistakes controls.
- Recent practice checks stay locally under `wh_practice_v2`, not shared between browsers, devices or apps.
- Print blank or completed worksheets; arithmetic also has an answer-key mode. Choose A4 and Save as PDF in the browser dialog. Ink-saving mode is enabled by default.
- Triangle perimeter questions state every side. Mini-Sudoku generation preserves exactly one solution.

## Editable source

`index.html` contains markup. `assets/core.js` handles numeric validation, arithmetic and Sudoku validation. `assets/level-1.js` through `level-5.js` contain activity engines. `assets/learning-data.js` contains examples and hints. `assets/interface.js` handles feedback, retry and local history. `assets/printing.js` and `assets/print.css` handle printing. Remaining CSS and `assets/shell.js` provide appearance and navigation.

## Validate and deploy

Use Node 22.13+ (Node 24 recommended):

```sh
npm ci
npm test
npm run build
```

Cloudflare Pages: build command `npm run build`, output `dist`. Static hosting that already serves the repository root can continue serving `index.html` and the complete `assets/` folder without a build. Keep the existing custom domain.

No runtime dependencies are shipped. jsdom is test-only. Tests cover arithmetic, within-worksheet uniqueness, numeric parsing, activity initialisation, checks/reveal controls, retries, Sudoku uniqueness and print-copy content. These are logic/DOM tests, not physical-device or paper print certification.

`scripts/split-source.cjs` and `scripts/connect-core.cjs` are one-time migration records; **do not rerun on the split source**.

## Content boundaries

This is supplemental practice, not a certified complete Maldivian curriculum. Circle measures, advanced vocabulary and general knowledge are enrichment/extension. A curriculum specialist should approve grade mapping before skill labels become grades.
