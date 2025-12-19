# 🌍 Country Quiz

A client-side country comparison quiz game. Test your knowledge of world geography, economics, and demographics by comparing countries across various metrics.

**Play now: [mycountryquiz.github.io](https://mycountryquiz.github.io)**

## Features

- **8 Quiz Categories**
  - Population
  - Area (km²)
  - GDP (nominal)
  - GDP per Capita
  - Population Density
  - Literacy Rate
  - Human Development Index (HDI)
  - Life Expectancy

- **80+ Countries** across all continents with real-world data from World Bank, UN, IMF, and UNDP (2023/2024 estimates)

- **Score Tracking**
  - Current score (correct/total)
  - Current streak counter
  - Best streak tracking
  - All stats persist in localStorage

- **Progressive Web App (PWA)**
  - Installable on mobile devices ("Add to Home Screen")
  - Works offline after first load
  - Standalone app experience

- **Fully Client-Side**
  - No server required
  - No data collection
  - Runs entirely in your browser

## Tech Stack

- **TypeScript** - Type-safe code
- **Vite** (rolldown-vite) - Fast build tooling
- **Vanilla JS** - No framework dependencies
- **CSS** - Custom responsive styling
- **localStorage** - Persistent state

## Development

### Prerequisites

- Node.js 22+
- Yarn

### Setup

```sh
# Clone the repository
git clone https://github.com/mycountryquiz/mycountryquiz.github.io.git
cd mycountryquiz.github.io

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

### Project Structure

```
├── src/
│   ├── main.ts      # Game logic and UI
│   ├── data.ts      # Country data and types
│   └── style.css    # Responsive styling
├── public/
│   └── manifest.json # PWA manifest
├── index.html        # Entry point
├── scripts/
│   └── dump-code.sh  # Export code for LLM context
└── docs/llm/
    └── dump.txt      # Code dump for LLM assistance
```

### Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server at localhost:5173 |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview production build locally |
| `./scripts/dump-code.sh` | Export codebase to docs/llm/dump.txt |

## Data Sources

Country statistics sourced from:
- [World Bank Open Data](https://data.worldbank.org/)
- [United Nations Statistics](https://unstats.un.org/)
- [IMF World Economic Outlook](https://www.imf.org/en/Publications/WEO)
- [UNDP Human Development Reports](https://hdr.undp.org/)

Data represents 2023/2024 estimates where available.

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
4. Run `yarn build` to ensure it compiles
5. Submit a pull request

## Acknowledgments

- Flag emojis from Unicode standard
- Inspired by geography quiz games and the desire to learn more about our world
