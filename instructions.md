# AI Agent Project Configuration Instructions

Purpose
- Provide a step-by-step recipe an AI agent can run to convert a minimal repo into a Vite + TypeScript HTML5 game scaffold using `proton-engine`, with sprite and audio managers and Playwright tests.

Overview
- Add dependencies and dev-dependencies: `proton-engine`, `vite`, `typescript`, `@playwright/test`.
- Add Vite and TypeScript configs, an HTML shell, game bootstrap, sprite/audio managers, and Playwright tests.

Detailed Steps

1. Inspect repository

- Check for `package.json`, `src/`, `assets/`, `tests/`. Create `package.json` if missing.

2. Install dependencies and scripts

- Install runtime and dev packages:

```bash
npm install proton-engine
npm install -D vite typescript @playwright/test
```

- Update `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "playwright test",
  "test:headed": "playwright test --headed"
}
```

3. Add TypeScript and Vite configuration

- Create `tsconfig.json` with at least:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "ES2020"],
    "resolveJsonModule": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src", "tests"]
}
```

- Create `vite.config.ts` (serve on `127.0.0.1:4173` recommended).

4. Add app scaffolding

- Create `index.html` with a `#game-root` element and module script to `/src/main.ts`.
- Create `src/main.ts` to locate `#game-root`, instantiate `Game` and call `await game.init()`.

5. Implement core modules

- `src/Game.ts`: create and size a canvas, instantiate `Proton`, `CanvasRenderer`, and `Emitter`, add an animation loop that calls `proton.update()` and draws sprites on the canvas, and provide a `resize()` method.
- `src/SpriteManager.ts`: load `/sprite_sheet.png` (from `public/`), expose `draw(ctx, name, x, y, scale)` and hold sprite frame data.
- `src/AudioManager.ts`: import `assets/assets.json`, preload `Audio` objects for each sound, expose `play(name)`.

6. Type definitions

- If `proton-engine` lacks types, add `src/types/proton-engine.d.ts` declaring minimal classes (`Proton`, `Emitter`, `CanvasRenderer`, etc.).

7. Assets manifest and public assets

- Create `assets/assets.json` describing sprite frames and sound files.
- Copy runtime assets into `public/` (e.g. `public/sprite_sheet.png`, `public/sounds/*`) and reference them in the manifest as `/sprite_sheet.png` and `/sounds/*`.

8. Integrate loading and interaction

- In `Game.init()`, `await spriteManager.load()` and `await audioManager.load()`.
- Add a user interaction (click) to unlock audio and play a short sound.

9. Playwright configuration and tests

- `playwright.config.js`: set `testDir: './tests'`, `use.baseURL: 'http://127.0.0.1:4173'`, and `webServer` to run `npm run dev` with `reuseExistingServer: true`.
- Add `tests/game.spec.js` with smoke tests: page loads, `#game-canvas` exists, canvas is readable via `getImageData`, and optionally audio objects are present on `window.game`.

10. Verify and CI

- Locally run:

```bash
npm install
npm run dev
# open http://127.0.0.1:4173
npx playwright test --config playwright.config.js
npx playwright install # CI step to install browsers
```

- Note autoplay restrictions: play audio in response to user gestures.

Outputs
- Files the agent should create or update: `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.ts`, `src/Game.ts`, `src/SpriteManager.ts`, `src/AudioManager.ts`, `src/types/proton-engine.d.ts` (if needed), `assets/assets.json`, `public/*`, and `tests/*`.

Tips and gotchas
- Prefer `public/` for static runtime assets so Vite serves them at `/...`.
- Use `resolveJsonModule` for static manifests; otherwise fetch the manifest at runtime.
- Keep the `AudioManager` resilient to autoplay errors and fallback gracefully.
- Replace local `d.ts` when official types become available.

Commit & push
- After verifying locally, commit and push with a descriptive message, e.g.:

```bash
git add -A
git commit -m "feat: scaffold Proton+Vite game template"
git push origin HEAD
```

---

This instruction set is intended to be run end-to-end by an automated agent; stop for verification after steps that modify repository structure or install dependencies.
