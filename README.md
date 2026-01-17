# Centralization Observatory

**Track the centralization of crypto: Bitcoin ETFs, stablecoin custody, and institutional capture.**

An interactive research tool that maps the network of people, companies, and governments shaping Bitcoin and stablecoins. Each entity is assigned a decentralization score from 0 (centralized) to 100 (decentralized), revealing how power is actually distributed in crypto.

**Live Demo:** [stablecoin-explorer.vercel.app](https://stablecoin-explorer.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [The Problem](#the-problem)
- [Pages Overview](#pages-overview)
- [Decentralization Scoring](#decentralization-scoring)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Methodology](#methodology)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Interactive Network Graph
- **Force-directed D3.js visualization** with 82+ entities and 245+ connections
- **Score-based node coloring** - red (centralized) to green (decentralized) gradient
- **7 edge type filters** - Ownership, Partnership, Regulatory, Funding, Board/Executive, Custody, Other
- **Entity type filters** - People, Organizations, Stablecoins, Government, Concepts, Events
- **Zoom and pan controls** with mouse wheel and drag
- **Node interactions:**
  - Hover: Tooltip with entity name, type, score, and connection count
  - Click: Ego network highlighting (dims unrelated nodes/edges)
  - Double-click: Opens full entity detail modal
  - Drag: Reposition nodes in the force simulation
- **In-graph search** - Find and zoom to any entity with animated camera movement
- **Reset view button** - Return to default zoom and clear selections
- **Mobile warning banner** - Alerts users that desktop provides better experience
- **Loading state** - Spinner while graph simulation initializes

### Capture Path Tool
- **Pathfinding between any two entities** - Find the shortest connection path
- **Visual path highlighting** - Dramatically dims non-path nodes/edges
- **Path metrics:**
  - Hop count (distance)
  - Connection strength rating (Direct, Strong, Moderate, Weak)
  - Average decentralization score along path
  - Path centralization level
- **Step-by-step path visualization** showing each entity and relationship

### Global Search
- **Keyboard shortcut** - Press `/` to focus search from anywhere
- **Real-time filtering** with highlighted matching text
- **Smart sorting** - Name matches first, then by centralization score (most centralized first)
- **Keyboard navigation** - Arrow keys to navigate, Enter to select, Escape to close
- **Cross-page navigation** - Results link directly to entity detail pages

### Entity Database
- **Searchable and filterable entity list** with 82+ tracked entities
- **Split-panel interface** - List on left, details on right
- **Deep linking support** - Share URLs like `/entities?entity=blackrock`
- **Entity cards show:**
  - Decentralization score with color indicator
  - Entity type
  - Description preview
  - Connection count
  - News article count (when available)
- **Full detail modal** with 4 tabs:
  - **Story** - Centralization narrative for the entity
  - **Connections** - All relationships with edge type badges
  - **News** - Live news feed filtered to this entity
  - **Sources** - Citations and documentation links
- **Debounced search** for smooth performance

### Metrics Dashboard
- **4 Key Performance Indicators:**
  - Average Centralization Score (0-100)
  - Custody Concentration (% held by top 5 custodians)
  - Regulatory Capture Index (0-10 scale)
  - Network Centralization Level (Low/Medium/High)
- **Interactive tooltips** explaining each metric's methodology
- **Decentralization Distribution Chart** - Bar chart showing entity count by score range
- **Connection Type Breakdown** - Visual breakdown of all 245+ connections by type
- **Top 10 Most Centralized Entities** - Ranked list with direct links
- **Top 10 Most Decentralized Entities** - Ranked list with direct links
- **Regulatory Capture Detail:**
  - Gauge visualization
  - Government entity count
  - Regulatory connection count
  - Government-connected entity count
- **Network Hubs** - Top 5 most connected entities
- **Entity Type Breakdown** - Count and average score by type
- **Methodology & Data Sources** section with limitations

### Timeline
- **Chronological event list** with 15+ key events
- **Vertical timeline design** with connected dots
- **Event cards include:**
  - Formatted date
  - Title and description
  - Related entity tags with type-colored dots
  - Source links when available
- **Click to select/highlight events**
- **Date range displayed** in footer

### About Page
- **Thesis explanation** - Why decentralization matters
- **Evidence of centralization** with specific examples
- **Visual score examples** showing entities across the spectrum
- **Full methodology documentation:**
  - Data sources (SEC EDGAR, on-chain analytics, news, etc.)
  - Connection type definitions with color legend
  - Limitations and biases
- **Researcher use cases** - Journalists, policy makers, investors, academics
- **How to cite** section

### Responsive Design
- **Collapsible sidebar navigation** - Full width on desktop, icon-only on mobile
- **Mobile-optimized layouts** across all pages
- **Footer** with source links, credits, and legal disclaimer

---

## The Problem

Bitcoin was created to eliminate trusted third parties. Decentralization provides financial sovereignty, censorship resistance, and trust minimization. Without it, crypto is just a slower database controlled by the same institutions it claimed to replace.

**Evidence of centralization this tool tracks:**

| Issue | Details |
|-------|---------|
| ETF Custody Concentration | Coinbase custodies 8 of 11 Bitcoin ETFs |
| Stablecoin Duopoly | Tether and Circle control ~90% of stablecoin supply |
| Self-Custody Decline | Dropped from ~90% to ~30% of holdings |
| Surveillance Capabilities | FBI and Secret Service have direct access to Tether's systems |

---

## Pages Overview

| Page | Route | Purpose |
|------|-------|---------|
| Network Graph | `/network` | Interactive visualization of entity relationships |
| Entities | `/entities` | Searchable database with detail panels |
| Timeline | `/timeline` | Chronological key events |
| Metrics | `/metrics` | Centralization analytics dashboard |
| About | `/about` | Thesis, methodology, and documentation |

---

## Decentralization Scoring

Each entity receives a score from 0-100 based on control factors:

| Score Range | Label | Color | Examples |
|-------------|-------|-------|----------|
| 0-20 | Highly Centralized | Red | SEC (5), BlackRock (10), Coinbase Custody (15) |
| 20-40 | Mostly Centralized | Orange | USDT (25), USDC (30), Coinbase (35) |
| 40-60 | Mixed | Yellow | DAI (45), Michael Saylor (50), Cash App (55) |
| 60-80 | Mostly Decentralized | Lime | Jack Dorsey (70) |
| 80-100 | Decentralized | Green | Self-Custody (95), Bitcoin Protocol (100) |

**Scoring Factors:**
- Entity type (government entities start at 5, organizations at 30)
- Custody arrangements
- Freeze/blacklist capabilities
- Regulatory relationships
- Governance structure
- Network of connections

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling with CSS variables for theming |
| **D3.js 7** | Force-directed graph visualization |
| **Supabase** | PostgreSQL database for entities, connections, news |
| **Lucide React** | Icon library |
| **Vercel** | Hosting and deployment |

---

## Data Model

### Entities (82+)

| Type | Count | Examples |
|------|-------|----------|
| Person | 27 | Larry Fink, Elon Musk, Michael Saylor, Paolo Ardoino |
| Organization | 27 | BlackRock, Coinbase Custody, Tesla, Circle, Tether Limited |
| Stablecoin | 5 | USDT, USDC, DAI, BUSD, PYUSD |
| Government | 6 | SEC, FBI, US Treasury, Federal Reserve, FinCEN, OCC |
| Concept | 11 | Self-Custody, BTC Custody Concentration, CBDC, Dollar Hegemony |
| Event | 6 | BTC ETF Approval, FTX Collapse, Tornado Cash Sanctions |

### Connection Types (245+)

| Type | Color | Description |
|------|-------|-------------|
| Ownership | Red | Equity stakes, parent companies |
| Partnership | Green | Business relationships, collaborations |
| Regulatory | Yellow | Government oversight, compliance |
| Funding | Blue | Investment, financing |
| Board/Executive | Purple | Leadership positions, advisory roles |
| Custody | Orange | Asset storage relationships |
| Other | Gray | Miscellaneous connections |

### Timeline Events (15+)

Key events from 2022-2025 including:
- BTC ETF Approval (Jan 2024)
- FTX Collapse (Nov 2022)
- Tornado Cash Sanctions (Aug 2022)
- Congressional Hearings
- MicroStrategy BTC Accumulation

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database features)

### Installation

```bash
# Clone the repository
git clone https://github.com/tdeu/btc_battleground.git
cd btc_battleground

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deployment

The app is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel --prod
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Navigation and Footer
│   ├── page.tsx           # Home page (redirects to /network)
│   ├── network/
│   │   └── page.tsx       # Network graph visualization
│   ├── entities/
│   │   └── page.tsx       # Entity database with search
│   ├── timeline/
│   │   └── page.tsx       # Chronological events
│   ├── metrics/
│   │   └── page.tsx       # Analytics dashboard
│   ├── about/
│   │   └── page.tsx       # Methodology and documentation
│   └── api/
│       └── news/          # News feed API routes
├── components/
│   ├── Navigation.tsx     # Sidebar with legend (responsive)
│   ├── Footer.tsx         # Site footer with links
│   ├── GlobalSearch.tsx   # Cross-site search component
│   ├── CapturePath.tsx    # Pathfinding panel
│   ├── EntityDetailModal.tsx # Full entity modal with tabs
│   ├── NewsFeed.tsx       # News article list
│   └── ScoreBadge.tsx     # Decentralization score display
├── lib/
│   ├── data/
│   │   └── index.ts       # Data abstraction layer (Supabase/hardcoded)
│   ├── graph/
│   │   └── pathfinding.ts # BFS shortest path algorithm
│   ├── metrics.ts         # Centralization metrics calculations
│   ├── scoring.ts         # Decentralization score utilities
│   └── supabase.ts        # Database client
├── data/
│   └── entities.ts        # Hardcoded entity and connection data
└── types/
    └── index.ts           # TypeScript type definitions
```

---

## API Routes

### `/api/news`
Fetches news articles from Supabase, optionally filtered by entity.

### `/api/news/counts`
Returns count of news articles per entity ID.

### `/api/news/fetch`
Triggers RSS feed fetch and entity matching (admin use).

---

## Methodology

### Data Sources
- SEC EDGAR filings
- On-chain analytics
- Corporate disclosures
- News reports and interviews
- Congressional testimony
- Transparency reports

### Scoring Methodology

Decentralization scores are assigned based on:
1. **Entity type baseline** - Government (5), Organizations (30), People (40), Concepts (50)
2. **Control factors** - Can they freeze assets? Censor transactions? Surveil users?
3. **Governance** - Single point of control vs. distributed decision-making
4. **Regulatory capture** - Government connections and compliance requirements
5. **Custody arrangements** - Self-custody vs. third-party custody

### Limitations
- Data is imperfect and may contain inaccuracies
- Scores are interpretive and reflect our methodology
- Bias toward US-based entities due to data availability
- Private arrangements may not be fully captured
- Updated periodically, not real-time

---

## How to Cite

```
Centralization Observatory. (2025). Bitcoin and Stablecoin Decentralization Tracker.
Retrieved from https://stablecoin-explorer.vercel.app
```

---

## Contributing

Contributions are welcome! Areas where help is needed:

- **Data additions** - New entities, connections, or events
- **Score refinements** - Better methodology for decentralization scoring
- **International coverage** - Entities beyond US focus
- **Feature requests** - Open an issue to discuss

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify no errors
5. Submit a pull request

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Disclaimer

Data is aggregated from public sources and may contain inaccuracies. Decentralization scores are interpretive and reflect our methodology. This is a research tool for educational purposes, not financial advice. Do your own research.

---

**Built with Next.js, Supabase, and D3.js**
