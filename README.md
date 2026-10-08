# Crownfall: Sovereign’s Hand

Northern Summit Studios · V0.1 digital-first tabletop card game prototype.

**Control the battlefronts. Pull the Crown. Ascend.**

Fifteen noncanonical prototype champions, three fronts, alternating actions, 4→8 Command, three-copy ascension, Forge recipes, six representative traits, Crown tug-of-war and a local AI. No original Crownfall files or artwork were accessible or modified. This is a separate match engine, prepared for a later authoritative identity and visual integration pass.

## Develop

Node 22.12+ or 24; npm with the committed lockfile. No application secrets or backend required.

```sh
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

Standard npm cache is also fine outside the cloud sandbox. Setup works in the existing checkout; cloud tasks are already isolated and do not need another worktree. Open the development server in your local browser when running on your own machine. In cloud onboarding, use internal requests for validation rather than a loopback preview link.

```sh
npm test
npm run build
npm run test:browser
npm run simulate -- 30
npm run print:cards
```

Browser tests use system Chromium at `/usr/bin/chromium`; set `PLAYWRIGHT_CHROMIUM_PATH` to another installed Chromium executable where needed. The Playwright suite exercises an entire seeded match through the actual UI. Printing produces `public/print-and-play.html` and is included automatically in production builds.

## Play

Choose a starter, enter the battle, select a hand card and select a front to deploy. Select a matching copy to ascend a board champion. Select a board champion to reposition or forge an item. Pass when ready; two consecutive passes resolve battle. Crown endpoint claims require a later positive-influence battle to win. “How to play” explains the complete loop. Matches save locally; rematches use a new shuffle. The journal can be exported as a deterministic replay.

- [Authoritative prototype rules](docs/RULES.md)
- [Physical component model and tabletop review](docs/TABLETOP_REVIEW.md)
- [Architecture and integration boundary](docs/ARCHITECTURE.md)
- [V0.1 playtest brief](docs/PLAYTEST.md)

Use Vercel's Vite framework preset, `npm run build`, and output directory `dist` for deployment. This repository has no authenticated Vercel project link configured by the prototype. Link the intended existing project through its normal deployment flow; do not create or replace a project blindly.

Collector metadata is separate from gameplay definitions. Standard, Radiant, Ascended and Sovereign printings have equal gameplay. No real-money economy, paid packs, ranking, networking, account system, full roster or canonical artwork is implemented.

## V0.2 redesign (branch `redesign/v0.2`)

The V0.1 battlefront prototype above is preserved at tag `v0.1.0`. The V0.2 direction (Model B, The Shattered Crown) is being proven first as a paper print-and-play prototype in [`prototype-v0.2/`](prototype-v0.2/README.md). No digital V0.2 game exists yet.
