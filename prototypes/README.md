# Sentinel concept prototype

Find a builder or property manager through a five-step journey, or explore how provider verification could work. All providers, evidence, and review outcomes are fictional. Connection buttons only preview requests.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Open the Local URL printed by the server, usually http://localhost:3000.

## Code map

- `app/layout.tsx`: shared header, footer, fonts, and metadata.
- `app/page.tsx`: particle landing page; primary action starts the builder journey.
- `app/a/page.tsx`: five-step journey controller and completion screen.
- `app/components/`: particle animation, location input, property planner, team carousel, connection form, and verification preview.
- `app/hooks/use-build-draft.ts`: validates and saves drafts in browser storage, with an in-memory fallback when storage fails. Refreshing starts at step 1 with saved fields. Clear the draft between interviews.
- `app/data/builders.ts`: fictional builder and manager metadata, services, and location suggestions.
- `app/data/property-goals.ts`: build, renovation, upkeep, and buy-with-upkeep goals; shared brief formatting.
- `app/b/page.tsx`: provider-verification page, with online evidence, local follow-up, simulated onboarding, and proposed bank roles. Card links select a sample team using the URL query.
- `app/data/verification.ts`: fictional review outcomes and onboarding sections.
- `app/data/samples.ts`: shared fictional provider checks.
- `app/globals.css`: shared styling, responsive layout, and reduced-motion rules; imports Tailwind.

`@/` imports point to this project’s root via `tsconfig.json`. This app has its own dependencies and TypeScript settings. Drafts do not sync across devices. No Google Maps, Google Meet, bank, messaging, or scheduling APIs are connected. There are no property listings or purchase transactions. Banks are proposed escrow partners; Sentinel would provide milestone evidence and verification reports.

## Check

```sh
npm run lint
npm run build
```

The build checks TypeScript. Google fonts need network access during a fresh build.

See `../PROTOTYPES.md` for decisions and interview goals. For Vercel, set the root directory to `prototypes`.
