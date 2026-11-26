# 🌍 Country Quiz

A client-side country comparison quiz game. Test your knowledge of world geography, economics, and demographics by comparing countries across various metrics.

**Play now: [mycountryquiz.github.io](https://mycountryquiz.github.io)**

## Features

- **13 Quiz Categories**
  - Population
  - Area (km²)
  - GDP (nominal, current US$)
  - GDP per Capita
  - GNI per Capita (PPP)
  - Population Density
  - Adult Literacy Rate
  - Human Development Index (HDI)
  - Life Expectancy
  - Fertility Rate
  - Urbanization (share of urban population)
  - Internet Use (share of population)
  - Forest Cover (share of land area)

- **Every country with World Bank coverage** (~200 economies), each value shown with the year it was measured
- **Automatically refreshed data** via a weekly GitHub Actions workflow
- **No ties** — pairs with equal (or identically displayed) values are never asked
- **Score Tracking**
  - Current score (correct/total), current streak, best streak
  - All stats persist in localStorage
- **Audible and tactile feedback**
  - Short synthesized tones (Web Audio API) and vibration (Vibration API) on taps, correct and wrong answers
  - Toggle with the 🔊/🔇 button; the choice is remembered
  - Vibration is unavailable on iOS Safari; sound still works
- **Progressive Web App (PWA)**
  - Installable ("Add to Home Screen")
  - Works offline after first load (network-first service worker, same-origin only)
- **Accessible** — real buttons, keyboard navigation, visible focus, reduced-motion support
- **Fully Client-Side**
  - No server, no data collection, no third-party requests at runtime
  - Statistics are bundled into the app at build time

## Tech Stack

- **TypeScript 7** (native compiler)
- **Vite 8** (Rolldown-based bundler)
- **Vanilla TypeScript** - No framework dependencies
- **Node.js test runner** - Unit tests with no extra dependencies
- **GitHub Actions + GitHub Pages** - CI, scheduled data refresh, deployment
- **Dependabot** - Weekly npm and GitHub Actions updates

## Development

### Prerequisites

- Node.js 22.18+ (current LTS recommended; scripts run TypeScript directly via Node type stripping)
- Yarn 1.x

### Setup

```sh
git clone https://github.com/mycountryquiz/mycountryquiz.github.io.git
cd mycountryquiz.github.io
yarn install
yarn dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server at localhost:5173 |
| `yarn typecheck` | Type-check app, scripts and tests |
| `yarn test` | Run unit tests |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview production build locally |
| `yarn update-data` | Fetch the latest statistics into `src/data/countries.json` |
| `./scripts/dump-code.sh` | Export codebase to docs/llm/dump.txt |

### Project Structure

```
├── src/
│   ├── main.ts             # UI (QuizApp)
│   ├── quiz.ts             # Pure game logic (round creation, tie guard)
│   ├── metrics.ts          # Category definitions, sources and formatting
│   ├── data.ts             # Loads bundled dataset, derives flags
│   ├── storage.ts          # localStorage persistence
│   ├── feedback.ts         # Sound and vibration
│   ├── types.ts            # Shared types
│   ├── style.css           # Responsive styling
│   └── data/
│       └── countries.json  # Generated dataset
├── scripts/
│   ├── update-data.ts      # Data refresh entry point
│   ├── lib/                # HTTP, World Bank, OWID, dataset builder
│   └── dump-code.sh        # Export code for LLM context
├── tests/                  # node:test suites
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Offline service worker
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml      # Test, build, deploy (also reusable)
│   │   └── update-data.yml # Weekly data refresh
│   └── dependabot.yml
├── index.html
├── tsconfig.json           # App (browser)
└── tsconfig.node.json      # Scripts and tests (Node)
```

## Data

### Sources

| Category | Source | Indicator |
|----------|--------|-----------|
| Population | World Bank WDI | `SP.POP.TOTL` |
| Area | World Bank WDI | `AG.SRF.TOTL.K2` |
| GDP | World Bank WDI | `NY.GDP.MKTP.CD` |
| GDP per Capita | World Bank WDI | `NY.GDP.PCAP.CD` |
| GNI per Capita (PPP) | World Bank WDI | `NY.GNP.PCAP.PP.CD` |
| Population Density | World Bank WDI | `EN.POP.DNST` |
| Adult Literacy Rate | World Bank WDI (UNESCO UIS) | `SE.ADT.LITR.ZS` |
| HDI | UNDP Human Development Report via Our World in Data | `human-development-index` |
| Life Expectancy | World Bank WDI | `SP.DYN.LE00.IN` |
| Fertility Rate | World Bank WDI | `SP.DYN.TFRT.IN` |
| Urbanization | World Bank WDI | `SP.URB.TOTL.IN.ZS` |
| Internet Use | World Bank WDI (ITU) | `IT.NET.USER.ZS` |
| Forest Cover | World Bank WDI (FAO) | `AG.LND.FRST.ZS` |

- [World Bank Open Data](https://data.worldbank.org/) (CC BY 4.0)
- [UNDP Human Development Reports](https://hdr.undp.org/) via [Our World in Data](https://ourworldindata.org/grapher/human-development-index) (CC BY 4.0)

For every country and category the most recent non-empty value from the last 20 years is used, and the year is shown next to the value. Country names come from the Unicode CLDR (via `Intl.DisplayNames`) with a few short-form overrides; flags are derived from ISO 3166-1 codes. Regional aggregates and entries without population and area are excluded.

### Automatic updates

`.github/workflows/update-data.yml` runs every Monday (and on demand from the Actions tab):

1. Runs `yarn update-data`, which fetches every metric, keeps the latest value per country, rounds to each metric's precision and writes a deterministically sorted `src/data/countries.json`.
2. Rejects the result if coverage looks wrong (fewer than 180 countries, any category under 60 countries, duplicate codes) so a broken upstream response never reaches the site.
3. Runs tests and a full build.
4. Commits only when the data actually changed, then calls `deploy.yml` to publish that exact commit.

The workflow pushes to `main` with `GITHUB_TOKEN`; if branch protection blocks this, allow GitHub Actions to bypass it or switch the commit step to open a pull request.

To add a category, add an entry to `METRICS` in `src/metrics.ts` with a World Bank indicator or OWID chart slug, then run `yarn update-data`.

## Privacy

- No analytics, cookies, fingerprinting, or external requests at runtime
- localStorage holds only score, streaks, selected category and the feedback toggle
- The Web Audio API is used only to play tones; nothing is read back
- The service worker caches same-origin files on your device and never contacts other hosts

## AI Disclosure

This project was developed with assistance from Claude (Anthropic). The codebase in `docs/llm/dump.txt` is exported for LLM context during development.

This disclosure is for transparency only. There are no restrictions on using this code for AI training—knowledge should be shared freely. If you prefer human-only code for your training datasets, this notice allows you to make that choice.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:
- You can use, modify, and distribute this code
- If you modify and deploy it as a network service, you must release your source code
- Derivative works must also be licensed under AGPL-3.0
- See [LICENSE](LICENSE) file for full terms

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `yarn test && yarn build` to ensure it passes and compiles
5. Submit a pull request

## Acknowledgments

- Flag emojis from Unicode standard
- Inspired by geography quiz games and the desire to learn more about our world
