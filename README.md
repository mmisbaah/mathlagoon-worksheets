# Worksheet Hub — Math Lagoon

Independent static worksheet app: maths, reading and optional enrichment across five **skill levels**, not five school grades. No account, server database or ChatGPT connection is needed.

## Improvements

- Strict numeric checking rejects partial answers such as `5abc` and does not truncate decimals.
- Every arithmetic operation has a validated bank of 20 challenges with five semantically distinct questions each. `verifyQuestionBank()` rejects duplicate prompts, duplicate mathematical setups, invalid answers and missing explanations.
- Challenge difficulty moves from Guided (1–7) to Independent (8–14) and Reasoning (15–20). Learners need at least 3/5 to unlock the next challenge; custom printable worksheets remain available separately.
- Foundation arithmetic stays within 10. Level 3 arithmetic tables stay within 10; Level 4 division uses a three-digit dividend and one-digit divisor.
- Shorter default worksheets, examples, hints, written answer feedback and retry-mistakes controls.
- Recent practice checks stay locally under `wh_practice_v2`, not shared between browsers, devices or apps.
- Multiple learner profiles keep challenge progress, awards and stars separate on the same device. Each learner can earn 20 awards, and the grown-up dashboard recommends what to practise next.
- A five-question placement helper recommends a comfortable starting skill level without presenting itself as a school-grade assessment.
- Curriculum/enrichment labels, breadcrumbs, spoken instructions, visible focus states, reduced-motion support and Level 1 pictographs improve navigation and accessibility.
- Print blank or completed worksheets; arithmetic also has an answer-key mode. Choose A4 and Save as PDF in the browser dialog. Ink-saving mode is enabled by default.
- Triangle perimeter questions state every side. Mini-Sudoku generation preserves exactly one solution.

## Editable source

`index.html` contains markup. `assets/core.js` handles numeric validation, challenge banks, arithmetic auditing and Sudoku validation. `assets/level-1.js` through `level-5.js` contain activity engines. `assets/learning-data.js` contains examples and hints. `assets/interface.js` handles feedback, retry and local history. `assets/progression.js` handles learner profiles, challenge mastery, awards, curriculum labels, placement and parent recommendations. `assets/printing.js` and `assets/print.css` handle printing. Remaining CSS and `assets/shell.js` provide appearance and navigation.

## Validate and deploy

Use Node 22.13+ (Node 24 recommended):

```sh
npm ci
npm test
npm run build
```

Cloudflare Pages: build command `npm run build`, output `dist`. Static hosting that already serves the repository root can continue serving `index.html` and the complete `assets/` folder without a build. Keep the existing custom domain.

No runtime dependencies are shipped. jsdom is test-only. Tests cover the global 20×5 arithmetic banks, semantic setup uniqueness, independent answer verification, profile separation, challenge unlocking, curriculum guidance, pictographs, activity initialisation, retries, Sudoku uniqueness and print-copy content. These are logic/DOM tests, not physical-device or paper print certification.

`scripts/split-source.cjs` and `scripts/connect-core.cjs` are one-time migration records; **do not rerun on the split source**.

## Content boundaries

This is supplemental practice, not a certified complete Maldivian curriculum. Circle measures, advanced vocabulary and general knowledge are enrichment/extension. A curriculum specialist should approve grade mapping before skill labels become grades.
