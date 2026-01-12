# Stablecoin Network Explorer

A visual intelligence platform mapping the actors, connections, and events shaping the stablecoin ecosystem and dollar hegemony.

**Live Demo:** [stablecoin-explorer.vercel.app](https://stablecoin-explorer.vercel.app)

## Overview

This project visualizes the complex web of relationships between stablecoins, their issuers, financial institutions, government agencies, and key individuals. It helps users understand:

- Who controls the major stablecoins (USDT, USDC, DAI, BUSD, PYUSD)
- How stablecoins connect to traditional finance (BlackRock, Cantor Fitzgerald, JP Morgan)
- The regulatory landscape (SEC, Treasury, FinCEN, OCC)
- Key events that shaped the ecosystem

## Features

### Dashboard
- Overview statistics (49 entities, 156+ connections)
- Entity breakdown by type
- Recent events feed
- Key thesis cards explaining the stablecoin narrative

### Network Graph
- Interactive D3.js force-directed graph
- Zoom, pan, and drag functionality
- Click nodes to view entity details
- Filter by entity type (Person, Organization, Stablecoin, Government, Concept, Event)
- Color-coded nodes for easy identification

### People & Entities
- Searchable list of all tracked entities
- Filter buttons by type
- Detailed view with all connections
- Click-through navigation between connected entities

### Timeline
- Chronological view of key events (2014-2025)
- Events linked to related entities
- Source citations where available

### News Feed
- Live news from crypto RSS feeds (CoinDesk, Cointelegraph, The Block, Decrypt)
- Automatic filtering for stablecoin-relevant content
- Entity tagging and relevance scoring
- Refresh on demand

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Graph Visualization:** D3.js
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stablecoin-explorer.git
cd stablecoin-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the schema in `supabase-schema.sql` via the SQL Editor
   - Copy your project URL and keys

4. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

5. Fill in your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-random-secret
```

6. Seed the database:
```bash
npx tsx scripts/seed-database.ts
```

7. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── news/          # News fetch endpoints
│   ├── entities/          # Entity list page
│   ├── network/           # D3.js network graph
│   ├── news/              # News feed page
│   ├── timeline/          # Timeline page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── Navigation.tsx     # Sidebar navigation
│   └── NewsFeed.tsx       # News feed component
├── data/
│   └── entities.ts        # Entity data and helpers
├── lib/
│   ├── news/              # News fetching utilities
│   │   ├── rss-feeds.ts   # RSS parser
│   │   ├── currents-api.ts # Currents API client
│   │   └── entity-matcher.ts # Entity detection
│   └── supabase.ts        # Supabase client
└── types/                 # TypeScript types
    ├── index.ts           # App types
    └── database.ts        # Database types
```

## Entity Types

| Type | Color | Description |
|------|-------|-------------|
| Person | Green | Key individuals in the ecosystem |
| Organization | Purple | Companies, exchanges, analytics firms |
| Stablecoin | Blue | USDT, USDC, DAI, BUSD, PYUSD |
| Government | Red | Regulatory bodies and agencies |
| Concept | Orange | Ideas like CBDC, Dollar Hegemony |
| Event | Yellow | Historical events like FTX Collapse |

## Fetching News

The news feed pulls from RSS sources and can optionally use the Currents API.

**Manual fetch:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://stablecoin-explorer.vercel.app/api/news/fetch
```

**Set up auto-refresh:** Use Vercel Cron or an external service to call the endpoint hourly.

## Deployment

The app is deployed on Vercel. To deploy your own:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Key Thesis

This explorer is built around three core observations:

1. **Private CBDCs:** Stablecoins have the same surveillance and control capabilities as government CBDCs, but with less oversight.

2. **Dollar Extension:** Stablecoins extend US dollar hegemony globally by creating new demand for Treasury bills.

3. **Financial Surveillance:** Every stablecoin transaction is tracked. Issuers can freeze funds, and law enforcement has direct access to issuer systems.

## Contributing

Contributions are welcome! Areas for improvement:

- Add more entities and connections
- Improve entity matching for news
- Add more timeline events
- Enhance the network graph visualization
- Add data export features

## License

MIT

## Acknowledgments

- Research sources: Simon Dixon interviews, Congressional hearings, Mark Goodwin analysis
- Inspiration: [Epstein Secrets](https://epsteinsecrets.com) network visualization
