-- Supabase Schema for Stablecoin Network Explorer
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Entity types enum
CREATE TYPE entity_type AS ENUM ('person', 'organization', 'stablecoin', 'government', 'concept', 'event');

-- Entities table
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type entity_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections between entities
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_id, target_id, relationship)
);

-- Timeline events
CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for events and entities
CREATE TABLE event_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  UNIQUE(event_id, entity_id)
);

-- News items from RSS/API feeds
CREATE TABLE news_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  relevance_score REAL DEFAULT 0
);

-- Junction table for news and entity mentions
CREATE TABLE news_entity_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  news_id UUID NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  confidence REAL DEFAULT 1.0,
  UNIQUE(news_id, entity_id)
);

-- Indexes for performance
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_connections_source ON connections(source_id);
CREATE INDEX idx_connections_target ON connections(target_id);
CREATE INDEX idx_news_published ON news_items(published_at DESC);
CREATE INDEX idx_news_relevance ON news_items(relevance_score DESC);
CREATE INDEX idx_news_mentions_entity ON news_entity_mentions(entity_id);

-- Enable Row Level Security (public read access)
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_entity_mentions ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can read)
CREATE POLICY "Public read entities" ON entities FOR SELECT USING (true);
CREATE POLICY "Public read connections" ON connections FOR SELECT USING (true);
CREATE POLICY "Public read timeline_events" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Public read event_entities" ON event_entities FOR SELECT USING (true);
CREATE POLICY "Public read news_items" ON news_items FOR SELECT USING (true);
CREATE POLICY "Public read news_entity_mentions" ON news_entity_mentions FOR SELECT USING (true);

-- Service role can insert/update (for our API routes)
CREATE POLICY "Service insert entities" ON entities FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update entities" ON entities FOR UPDATE USING (true);
CREATE POLICY "Service insert connections" ON connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert timeline_events" ON timeline_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert event_entities" ON event_entities FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert news_items" ON news_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert news_entity_mentions" ON news_entity_mentions FOR INSERT WITH CHECK (true);
