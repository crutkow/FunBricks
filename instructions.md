# AI Agent Project Configuration Instructions

Purpose
- Provide a step-by-step recipe for an AI agent to convert a minimal repo into a Vite + TypeScript HTML5 game scaffold using `proton-engine`, with runtime assets in `public/`, sprite and audio managers, and Playwright tests.

Overview
- Add dependencies and dev-dependencies: `proton-engine`, `vite`, `typescript`, `@playwright/test`.
- Use `public/` as the app root and serve runtime assets from `public/assets`.
- Add Vite and TypeScript configs, an HTML shell, game bootstrap, sprite/audio managers, and Playwright tests.

Detailed Steps

1. Inspect repository

- Check for `package.json`, `public/`, and `tests/`. Create `package.json` if missing.
- If the app source is not under `public/src`, move it there and place static assets into `public/assets`.

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
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "types": ["vite/client"]
  },
  "include": ["public/src", "tests"]
}
```

- Create `vite.config.ts` with `root: 'public'`, `publicDir: 'assets'`, and output to `../dist`.

4. Add app scaffolding

- Create `public/index.html` with a `#game-root` element and a module script to `/src/main.ts`.
- Create `public/src/main.ts` to locate `#game-root`, instantiate `Game`, and call `game.init()`.

5. Implement core modules

- `public/src/Game.ts`: create and size a canvas, instantiate `Proton`, `CanvasRenderer`, and `Emitter`, add an animation loop that calls `proton.update()` and draws sprites on the canvas, and provide a `resize()` method.
- `public/src/SpriteManager.ts`: load `/sprite_sheet.png` from the public assets root, expose `draw(ctx, name, x, y, scale)`, and hold sprite frame data.
- `public/src/AudioManager.ts`: load `/assets.json` at runtime, preload `Audio` objects for each sound entry, and expose `play(name)`.

6. Type definitions

- If `proton-engine` lacks types, add `public/src/types/proton-engine.d.ts` declaring the minimal API used by the game.

7. Assets manifest and public assets

- Create `public/assets/assets.json` describing sprite frames and sound files.
- Place runtime assets in `public/assets`, such as:
  - `public/assets/sprite_sheet.png`
  - `public/assets/sounds/click.wav`
  - `public/assets/sounds/*.wav`
- The manifest should reference runtime files from the served root, for example `/sprite_sheet.png` and `/sounds/click.wav`.

8. Integrate loading and interaction

- In `Game.init()`, call `await spriteManager.load()` and `await audioManager.load()`.
- Add a user interaction (click) to unlock audio and play a short sound.

9. Playwright configuration and tests

- `playwright.config.js`: set `testDir: './tests'`, `use.baseURL: 'http://127.0.0.1:4173'`, and `webServer` to run `npm run dev` with `reuseExistingServer: true`.
- Add `tests/example.spec.js` or `tests/game.spec.js` with smoke tests that verify:
  - the page loads and title is correct,
  - `#game-canvas` exists and is visible,
  - the canvas can be read via `getImageData`,
  - optional sprite rendering and animation state.

10. Verify and CI

- Locally run:

```bash
npm install
npm run dev
# open http://127.0.0.1:4173
npx playwright test --config playwright.config.js
npx playwright install # CI step to install browsers
```

- Note autoplay restrictions: only play audio from a user gesture to avoid browser policy failures.

Outputs
- Files the agent should create or update: `public/index.html`, `vite.config.ts`, `tsconfig.json`, `public/src/main.ts`, `public/src/Game.ts`, `public/src/SpriteManager.ts`, `public/src/AudioManager.ts`, `public/src/types/proton-engine.d.ts` (if needed), `public/assets/assets.json`, and `tests/*`.

Tips and gotchas
- Use `public/` as the Vite root and `public/assets` for static runtime assets.
- Serve the manifest from `/assets.json` when using `publicDir: 'assets'`.
- Avoid importing `assets.json` directly from TS if you want runtime flexibility; fetch it from the served URL instead.
- Keep `dist/` gitignored because it is generated build output.
- Keep the `AudioManager` resilient to playback failures and unsupported browsers.

Commit & push
- After verifying locally, commit and push with a descriptive message, e.g.:

```bash
git add -A
git commit -m "fix: update public-root Vite game scaffold and asset loading"
git push origin HEAD
```

---

This instruction set is intended to be run end-to-end by an automated agent; stop for verification after steps that modify repository structure or install dependencies.
