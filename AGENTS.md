# Repository Guidelines

## Project Structure & Module Organization
- `src/main.ts` boots Vue 3 + Pinia + Router; route-level pages stay in `src/views`, shared UI in `src/components`, layout wrappers in `src/layouts`.
- Data helpers (`src/api`, `src/lib`, `src/utils`, `src/stores`) isolate network/state logic; prefer composables when behavior crosses modules.
- Bundled assets belong in `src/assets`, while heavy media or icons go to `public/`. Long-form docs live in `docs/` and `MOBILE_ADAPTATION.md`.
- Keep color, spacing, and typography definitions in `src/styles`, `tailwind.config.js`, and `postcss.config.js` instead of scattering magic numbers.

## Build, Test, and Development Commands
- `pnpm dev` — launches Vite hot reload at `http://localhost:5173`, including LAN exposure for mobile devices.
- `pnpm build` — executes `vue-tsc --build` and `vite build` to emit `dist/`.
- `pnpm preview` — serves the production bundle for downstream QA or stakeholders.
- `pnpm type-check`, `pnpm lint`, `pnpm format` — gate pushes with TS + ESLint/Prettier, and reflow code in `src/` after large edits.

## Coding Style & Naming Conventions
- Use 2-space indentation, `<script setup lang="ts">`, and Composition API patterns; components stay PascalCase (`FeatureCard.vue`), stores follow `useXStore.ts`, and composables in `src/lib` adopt `useFoo.ts`.
- Prefer Tailwind utilities for layout, keep tokens in `src/styles/tokens.css`, and write px values so the px-to-rem toolchain can convert them.
- ESLint + Prettier own whitespace, quotes, and semicolons; never override lint results in commits.

## Testing & Quality Gates
- No standalone test runner yet, so lean on `pnpm type-check` and `pnpm lint` plus manual regression passes for flows touching routing, stores, or Vant components.
- Capture the manual scenario inside the PR (device, browser, steps). For new helpers in `src/lib`/`src/utils`, provide inline usage examples or temporary console assertions for reviewers.

## Commit & Pull Request Guidelines
- Keep commits in the `<type>: <summary>` format from history (`feat`, `fix`, `refactor`, `update`, etc.) and stay under 72 characters while explaining the user impact.
- Squash work per feature, reference the issue ID, and include PR details: purpose, screenshots for UI shifts (mobile + desktop), verification steps, and any env/config updates (`env.d.ts`).
- Run `pnpm lint && pnpm type-check && pnpm build` before requesting review so CI mirrors local state.
