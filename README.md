# Centralization Observatory

Track the centralization of crypto: Bitcoin ETFs, stablecoin custody, and institutional capture.

**Live:** [stablecoin-explorer.vercel.app](https://stablecoin-explorer.vercel.app)

---

## UX Overview

### Navigation (Sidebar)

**Current state:**
- Fixed 264px sidebar on all pages
- Logo: "Centralization Observatory" with "Bitcoin + Stablecoins" tagline
- Search input (currently non-functional placeholder)
- 7 nav items: Dashboard, Network, People & Entities, Timeline, News Feed, Metrics, About
- Legend section showing Entity Types (6 colors) and Edge Types (7 colors)

**Interaction:**
- Active page highlighted with accent color
- Hover states on nav items
- Legend is scrollable if content overflows

**UX considerations:**
- Search is a placeholder - needs implementation
- Legend takes significant vertical space - could be collapsible
- Mobile responsiveness not implemented (sidebar is fixed width)

---

## Pages

### 1. Dashboard (`/`)

**Purpose:** Overview of the entire dataset with key statistics and thesis.

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Heading + Description                      │
├──────────┬──────────┬──────────┬───────────┤
│ Entities │ Connect. │ Timeline │ Stables   │  ← 4 stat cards
├──────────┴──────────┴──────────┴───────────┤
│ Entities by Type    │ Recent Events        │  ← 2 columns
├─────────────────────┴──────────────────────┤
│ Key Thesis (3 cards)                       │
└─────────────────────────────────────────────┘
```

**Current UX:**
- Static data display, no interactions beyond viewing
- Recent events list shows 5 most recent (sorted by date)
- Entity type breakdown uses color dots matching the legend
- Thesis cards explain the core narrative

**UX considerations:**
- Stat cards could link to relevant pages (click "Entities" → go to /entities)
- Recent events could be clickable to navigate to timeline or entity
- No loading states (data is static)
- Thesis cards are text-only - could have expandable details

---

### 2. Network Graph (`/network`)

**Purpose:** Interactive visualization of all entity connections.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: Title + Entity Type Dropdown        │
├─────────────────────────────────────────────┤
│ Edge Type Filter Buttons (All, Ownership,   │
│ Partnership, Regulatory, Funding, etc.)     │
├─────────────────────────────────────────────┤
│                                             │
│         D3.js Force-Directed Graph          │
│                                             │
│   [Capture Path Panel]   [Selected Node]    │
│                                             │
├─────────────────────────────────────────────┤
│ Instructions: Drag to pan • Scroll to zoom  │
└─────────────────────────────────────────────┘
```

**Interactions:**
1. **Pan/Zoom:** Scroll to zoom, drag background to pan
2. **Node drag:** Drag individual nodes to reposition
3. **Node click:**
   - If Capture Path mode: Select as path endpoint
   - Otherwise: Open side panel with entity details
4. **Node hover:** Highlight with white border
5. **Entity Type Filter:** Dropdown filters nodes by type
6. **Edge Type Filter:** Buttons filter connections by relationship type
7. **Capture Path:** Click button to open panel, then click two nodes to find shortest path

**Capture Path Panel:**
- Collapsible (button toggles open/closed)
- Shows slots for 2 nodes (green "1", blue "2")
- After selecting both: Shows path result with hop count
- Path visualization lists each node and edge relationship
- "Clear Selection" button resets

**Selected Node Panel:**
- Appears top-right when node clicked (outside Capture Path mode)
- Shows: Type badge, name, description
- Lists all connections with relationship text
- Click connection to navigate to that entity

**UX considerations:**
- Graph can be overwhelming with 81 nodes - initial zoom/layout matters
- No way to search/find a specific node from the graph page
- Path highlighting dims other nodes but graph stays busy
- Mobile experience is poor (drag conflicts with scroll)
- No "reset view" button to return to default zoom/position
- Selected panel and Capture Path can't be open simultaneously
- Edge colors are visible but legend is in sidebar (not on graph)

---

### 3. People & Entities (`/entities`)

**Purpose:** Searchable/filterable list with detail view.

**Layout:**
```
┌──────────────────┬──────────────────────────┐
│ Search + Filters │                          │
├──────────────────┤                          │
│                  │     Entity Detail        │
│   Entity List    │     (right panel)        │
│   (scrollable)   │                          │
│                  │                          │
├──────────────────┤                          │
│ X of Y entities  │                          │
└──────────────────┴──────────────────────────┘
```

**Left Panel (List):**
- Search input (filters by name and description)
- Filter buttons for each entity type
- Scrollable list of entity cards
- Each card shows: type dot, type label, name, description (truncated), connection count
- Click card to select and view details
- Footer shows "X of Y entities"

**Right Panel (Detail):**
- Empty state: "Select an entity to view details"
- Selected state:
  - Type badge + "Full Details" button
  - Large entity name
  - Full description
  - Connections list with edge type badges
  - Click connection to navigate to that entity

**Full Details Modal:**
- Triggered by "Full Details" button
- 4 tabs: Story, Connections, News, Sources
- **Story tab:** Capture narrative (most entities show "No capture story available")
- **Connections tab:** Same as panel but with more detail
- **News tab:** Filtered news feed for this entity
- **Sources tab:** Citation links (most show "No sources documented")

**Interactions:**
- Type text in search → instant filter
- Click type button → toggle filter
- Click entity → loads in right panel
- Click "Full Details" → opens modal
- Click connection → navigates to that entity (panel updates or modal navigates)
- Press Escape → closes modal

**UX considerations:**
- Search works but no keyboard shortcut to focus it
- Can't combine type filters (e.g., show People AND Organizations)
- Modal "Story" and "Sources" tabs are mostly empty - could hide if empty
- News tab in modal loads separately (shows loading spinner)
- No way to return to list from modal without closing modal
- Connection click in modal changes the modal content (jarring)

---

### 4. Timeline (`/timeline`)

**Purpose:** Chronological view of key events.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: Title + Description                 │
├─────────────────────────────────────────────┤
│                                             │
│  2024 ──●── Event Card                      │
│         │                                   │
│         ●── Event Card                      │
│         │                                   │
│  2023 ──●── Event Card                      │
│         │                                   │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Current UX:**
- Vertical timeline with year markers
- Each event shows: date, title, description
- Entity tags linking to related entities (clickable)
- Events sorted newest first (2024 at top)
- 15 events total (8 stablecoin, 7 Bitcoin-related)

**Interactions:**
- Click entity tag → navigates to /entities with that entity selected

**UX considerations:**
- No filtering by category (Bitcoin vs Stablecoin events)
- No filtering by date range
- No search
- Entity tags click behavior: goes to entities page, but doesn't show modal
- Could benefit from horizontal timeline option for overview
- Events are static - no expand/collapse for more detail

---

### 5. News Feed (`/news`)

**Purpose:** Live news with entity matching.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: Title + Last Updated + Refresh Btn  │
├─────────────────────────────────────────────┤
│                                             │
│  News Card                                  │
│  - Source + Time ago                        │
│  - Title (link)                             │
│  - Description                              │
│  - Entity Tags                              │
│                                             │
│  News Card...                               │
│                                             │
└─────────────────────────────────────────────┘
```

**Current UX:**
- Pulls from RSS feeds (CoinDesk, Cointelegraph, The Block, Decrypt)
- Auto-tags entities mentioned in articles
- Shows relevance badge (High/Medium/Low)
- External links open in new tab
- Refresh button to fetch latest

**Interactions:**
- Click "Refresh" → fetches new articles (shows loading spinner)
- Click article title → opens external link
- Click entity tag → navigates to entities page

**UX considerations:**
- No filtering by source
- No filtering by entity
- No search
- No infinite scroll (shows limited articles)
- Entity matching can be imprecise (false positives)
- "Last updated" shows time, not how fresh the data is

---

### 6. Metrics (`/metrics`)

**Purpose:** Centralization metrics dashboard.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: Title + Last Updated + Refresh      │
├──────────┬──────────┬──────────┬───────────┤
│ Stable   │ BTC in   │ Corp BTC │ Self-     │  ← 4 KPI cards
│ Supply   │ ETFs     │ Holdings │ Custody   │
├──────────┴──────────┼──────────┴───────────┤
│ Stablecoin Market   │ BTC ETF Custody      │
│ Share (bar chart)   │ Concentration        │
├─────────────────────┼──────────────────────┤
│ Regulatory Capture  │ Corporate BTC        │
│ Index (gauge)       │ Holdings (list)      │
├─────────────────────┴──────────────────────┤
│ Data Sources (links)                       │
└─────────────────────────────────────────────┘
```

**Visualizations:**
1. **KPI Cards:** Total Stablecoin Supply, BTC in ETFs, Corporate BTC, Self-Custody Estimate
2. **Stablecoin Market Share:** Stacked bar with legend (USDT 65%, USDC 21%, etc.)
3. **BTC ETF Custody:** Stacked bar showing ETF market share
4. **Regulatory Capture Index:** Gauge visualization (7.2/10)
5. **Corporate BTC Holdings:** List with company, BTC amount, USD value

**Interactions:**
- Refresh button (currently simulates refresh with timeout)
- Hover on bar chart segments shows tooltip with name and percentage
- Data source links open in new tab

**UX considerations:**
- Data is placeholder/static - not connected to live APIs
- Refresh button doesn't actually fetch new data
- No historical comparison (no "vs last week")
- Gauge is custom CSS - could be more polished
- Warning badges (yellow triangles) add narrative but no click action
- Mobile layout untested

---

### 7. About (`/about`)

**Purpose:** Explain thesis, methodology, and data sources.

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: Title + Subtitle                    │
├─────────────────────────────────────────────┤
│ Our Thesis (warning icon)                   │
│ - 4 paragraphs explaining centralization    │
│ - Highlighted callout                       │
├─────────────────────────────────────────────┤
│ Methodology (eye icon)                      │
│ - Centralization Score explanation          │
│ - Edge Types explanation                    │
├─────────────────────────────────────────────┤
│ Data Sources (database icon)               │
│ - 5 source links with descriptions          │
├─────────────────────────────────────────────┤
│ Footer: Disclaimer + GitHub link            │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Data source cards are links (hover state, open external)
- GitHub link in footer

**UX considerations:**
- Text-heavy, could benefit from visuals
- Methodology score ranges could show example entities
- No anchor links to jump to sections
- GitHub link goes to generic github.com (needs real repo URL)

---

## Component Inventory

| Component | Location | Used On |
|-----------|----------|---------|
| `Navigation` | Sidebar | All pages |
| `NewsFeed` | News list | /news, EntityDetailModal |
| `EntityDetailModal` | Modal overlay | /entities |
| `CapturePath` | Floating panel | /network |

---

## Data Flow

```
src/data/entities.ts (81 entities, hardcoded)
         ↓
    getGraphData() → Network graph
    getStats() → Dashboard
    entities array → Entities page, Timeline
         ↓
src/lib/data/index.ts (abstraction layer, edge colors/labels)
         ↓
    EDGE_COLORS, EDGE_LABELS → Network, Entities, Navigation
```

**News Flow:**
```
/api/news/fetch → RSS feeds → Supabase (news_items table)
         ↓
/api/news → Query Supabase → NewsFeed component
```

---

## Known UX Issues

### High Priority
1. **Search is non-functional** - Sidebar search does nothing
2. **Mobile not supported** - Fixed sidebar breaks on small screens
3. **Metrics data is static** - Refresh button is fake

### Medium Priority
4. **Graph overwhelming** - 81 nodes with no search/highlight
5. **Empty modal tabs** - Story/Sources tabs mostly empty
6. **No entity deep linking** - Can't share URL to specific entity

### Low Priority
7. **Timeline not filterable** - No category/date filters
8. **News not filterable** - No source/entity filters
9. **Legend always visible** - Takes space, could collapse

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Variables
- **Graph:** D3.js (force simulation)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Icons:** Lucide React

---

## Getting Started

```bash
# Install
npm install

# Environment
cp .env.local.example .env.local
# Fill in Supabase credentials

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Entity Counts

| Type | Count | Examples |
|------|-------|----------|
| Person | 27 | Larry Fink, Elon Musk, Michael Saylor |
| Organization | 27 | BlackRock, Coinbase Custody, Tesla |
| Stablecoin | 5 | USDT, USDC, DAI, BUSD, PYUSD |
| Government | 6 | SEC, FBI, US Treasury |
| Concept | 10 | Self-Custody, BTC Custody Concentration |
| Event | 6 | BTC ETF Approval, FTX Collapse |
| **Total** | **81** | |

---

## License

MIT
