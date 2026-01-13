-- Migration: Add decentralization_score to entities
-- Run this in the Supabase SQL Editor AFTER the base schema
--
-- This migration:
-- 1. Drops the old centralization_score column (if exists)
-- 2. Adds decentralization_score (0-100 scale, higher = more decentralized)
-- 3. Adds metadata JSONB column for flexibility
-- 4. Creates index for score-based queries

-- =============================================================================
-- DROP OLD COLUMN
-- =============================================================================

-- Drop the old centralization_score column if it exists
ALTER TABLE entities
  DROP COLUMN IF EXISTS centralization_score;

-- =============================================================================
-- ADD NEW COLUMNS
-- =============================================================================

-- Add decentralization_score column (0-100 scale, higher = more decentralized)
-- 0 = Fully centralized (e.g., SEC, BlackRock)
-- 50 = Mixed/neutral
-- 100 = Fully decentralized (e.g., Bitcoin Protocol)
ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS decentralization_score INTEGER
  CHECK (decentralization_score >= 0 AND decentralization_score <= 100);

-- Add metadata JSONB column for additional flexible data
ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Index for efficient score-based queries (descending order for "most decentralized first")
CREATE INDEX IF NOT EXISTS idx_entities_decentralization_score
  ON entities(decentralization_score DESC);

-- =============================================================================
-- UPDATE VIEW (if exists from v2 migration)
-- =============================================================================

-- Drop and recreate the view to use new column name
DROP VIEW IF EXISTS entity_connection_stats;

CREATE OR REPLACE VIEW entity_connection_stats AS
SELECT
  e.id,
  e.name,
  e.type,
  e.category,
  e.decentralization_score,
  COUNT(DISTINCT c.id) as connection_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'ownership' THEN c.id END) as ownership_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'regulatory' THEN c.id END) as regulatory_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'funding' THEN c.id END) as funding_count,
  COUNT(DISTINCT CASE WHEN c.edge_type = 'boardSeat' THEN c.id END) as board_count
FROM entities e
LEFT JOIN connections c ON e.id = c.source_id OR e.id = c.target_id
GROUP BY e.id, e.name, e.type, e.category, e.decentralization_score;

-- =============================================================================
-- VERIFY
-- =============================================================================

-- Query to verify the migration
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'entities'
-- ORDER BY ordinal_position;
