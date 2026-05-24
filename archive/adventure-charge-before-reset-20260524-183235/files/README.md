# Adventure Charge

A roguelike deck adventure prototype. Choose routes across 3 maps, fight turn-based card battles, buy cards in shops, collect keys, unlock 4 skins, and open the big boss gate.

## Local Development

Install dependencies:

```bash
npm install
```

Start the game:

```bash
npm run dev
```

Run the rule tests:

```bash
npm run test
```

Build for production:

```bash
npm run build
```

## Adding 3D Assets

Put scene files and models under `public/assets/`, then update `public/assets/adventure-assets.json`.

- `.spz` scene backdrop: `public/assets/scenes/adventure-scene.spz`
- people/skin `.glb` files: `public/assets/people/`
- enemy `.glb` files: `public/assets/enemies/`

The game checks whether each manifest file exists before loading it. If an asset is missing, it keeps using the built-in procedural fallback so the game still runs.
