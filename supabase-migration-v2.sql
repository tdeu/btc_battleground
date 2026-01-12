-- Migration: Crypto Centralization Observatory v2
-- Run this in the Supabase SQL Editor after the initial schema

-- =============================================================================
-- NEW ENUMS
-- =============================================================================

-- Edge type enum for relationship classification
CREATE TYPE edge_type AS ENUM (
  'ownership',    -- Owns, subsidiary, acquired, controls
  'partnership',  -- Partner, collaborates, joint venture
  'regulatory',   -- Regulates, sanctions, investigation
  'funding',      -- Investor, funded by, raised from
  'boardSeat',    -- Board member, director, CEO, founder
  'custody',      -- Custodian, holds, stores
  'other'         -- Default for unclassified
);

-- Entity category for Bitcoin vs Stablecoin scope
CREATE TYPE entity_category AS ENUM ('bitcoin', 'stablecoin', 'both');

-- Source type for citations
CREATE TYPE source_type AS ENUM (
  'sec_filing',
  'news_article',
  'official_website',
  'research_report',
  'other'
);

-- =============================================================================
-- ALTER EXISTING TABLES
-- =============================================================================

-- Add new columns to entities table
ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS category entity_category DEFAULT 'stablecoin',
  ADD COLUMN IF NOT EXISTS centralization_score DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS capture_story TEXT;

-- Add new columns to connections table
ALTER TABLE connections
  ADD COLUMN IF NOT EXISTS edge_type edge_type DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS strength DECIMAL(3,2) DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- =============================================================================
-- NEW TABLES
-- =============================================================================

-- Entity sources/citations table
CREATE TABLE IF NOT EXISTS entity_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT REFERENCES entities(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  source_type source_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  publication_date DATE,
  excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- At least one of entity_id or connection_id should be set
  CONSTRAINT source_has_reference CHECK (entity_id IS NOT NULL OR connection_id IS NOT NULL)
);

-- Market data cache table
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id TEXT REFERENCES entities(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'market_cap', 'btc_holdings', 'stablecoin_supply', 'custody_amount'
  value DECIMAL(20,2) NOT NULL,
  unit TEXT DEFAULT 'USD', -- 'USD', 'BTC', etc.
  source TEXT, -- 'coingecko', 'sec_edgar', etc.
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  UNIQUE(entity_id, data_type)
);

-- Metrics snapshots for historical tracking
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20,4) NOT NULL,
  breakdown JSONB, -- { "blackrock": 25.5, "fidelity": 20.1, ... }
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_name, snapshot_date)
);

-- =============================================================================
-- NEW INDEXES
-- =============================================================================

-- Index for edge type filtering
CREATE INDEX IF NOT EXISTS idx_connections_edge_type ON connections(edge_type);

-- Index for entity category filtering
CREATE INDEX IF NOT EXISTS idx_entities_category ON entities(category);

-- Index for entity sources
CREATE INDEX IF NOT EXISTS idx_entity_sources_entity ON entity_sources(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_sources_connection ON entity_sources(connection_id);

-- Index for market data
CREATE INDEX IF NOT EXISTS idx_market_data_entity ON market_data(entity_id);
CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data(data_type);

-- Index for metrics snapshots
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_name ON metrics_snapshots(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_date ON metrics_snapshots(snapshot_date DESC);

-- =============================================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- =============================================================================

ALTER TABLE entity_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read entity_sources" ON entity_sources FOR SELECT USING (true);
CREATE POLICY "Public read market_data" ON market_data FOR SELECT USING (true);
CREATE POLICY "Public read metrics_snapshots" ON metrics_snapshots FOR SELECT USING (true);

-- Service role can insert/update
CREATE POLICY "Service insert entity_sources" ON entity_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update entity_sources" ON entity_sources FOR UPDATE USING (true);
CREATE POLICY "Service insert market_data" ON market_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update market_data" ON market_data FOR UPDATE USING (true);
CREATE POLICY "Service insert metrics_snapshots" ON metrics_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update metrics_snapshots" ON metrics_snapshots FOR UPDATE USING (true);

-- =============================================================================
-- HELPER FUNCTION: Classify edge type from relationship text
-- =============================================================================

CREATE OR REPLACE FUNCTION classify_edge_type(relationship_text TEXT)
RETURNS edge_type AS $$
DECLARE
  r TEXT := LOWER(relationship_text);
BEGIN
  -- Ownership patterns
  IF r ~ '(owns|owned|subsidiary|parent|acquired|acquir|controls|controlled|majority)' THEN
    RETURN 'ownership';
  -- Partnership patterns
  ELSIF r ~ '(partner|co-creat|collaborat|joint venture|alliance|cooperat)' THEN
    RETURN 'partnership';
  -- Regulatory patterns
  ELSIF r ~ '(regulat|sanction|lawsuit|sue|investigat|wells notice|enforcement|fine|audit)' THEN
    RETURN 'regulatory';
  -- Funding patterns
  ELSIF r ~ '(invest|funded|raised|backing|capital|venture|seed|series)' THEN
    RETURN 'funding';
  -- Board/Executive patterns
  ELSIF r ~ '(board|director|ceo|cto|cfo|coo|founder|co-founder|executive|chief|president|chairman)' THEN
    RETURN 'boardSeat';
  -- Custody patterns
  ELSIF r ~ '(custod|holds|stores|safekeep|vault|reserve|treasury)' THEN
    RETURN 'custody';
  ELSE
    RETURN 'other';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- UPDATE EXISTING CONNECTIONS WITH EDGE TYPES
-- Run this to classify existing connections
-- =============================================================================

-- UPDATE connections SET edge_type = classify_edge_type(relationship) WHERE edge_type = 'other';

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View: Entities with their connection counts and edge type breakdown
CREATE OR REPLACE VIEW entity_connection_stats AS
SELECT
  e.id,
  e.name,
  e.type,
  e.category,
  e.centralization_score,
  COUNT(DISTINCT c.id) as connection_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'ownership' THEN c.id END) as ownership_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'regulatory' THEN c.id END) as regulatory_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'funding' THEN c.id END) as funding_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'boardSeat' THEN c.id END) as board_count
FROM entities e
LEFT JOIN connections c ON e.id = c.source_id OR e.id = c.target_id
GROUP BY e.id, e.name, e.type, e.category, e.centralization_score;
