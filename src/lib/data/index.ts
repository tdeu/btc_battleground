/**
 * Data Abstraction Layer
 *
 * This module provides a unified interface for accessing entity/connection data
 * from either hardcoded sources (entities.ts) or Supabase.
 *
 * Currently uses hardcoded data, but can be switched to Supabase once migration is complete.
 */

import { supabase } from '@/lib/supabase';
import {
  entities as hardcodedEntities,
  timelineEvents as hardcodedTimelineEvents,
  getGraphData as getHardcodedGraphData,
  getStats as getHardcodedStats,
  classifyEdgeType,
} from '@/data/entities';
import type {
  Entity,
  EntityType,
  EdgeType,
  GraphData,
  GraphNode,
  GraphLink,
  TimelineEvent,
  Stats,
} from '@/types';

// Configuration: Set to true to use Supabase, false for hardcoded data
const USE_SUPABASE = false;

// =============================================================================
// ENTITY OPERATIONS
// =============================================================================

/**
 * Get all entities
 */
export async function getEntities(): Promise<Entity[]> {
  if (!USE_SUPABASE) {
    return hardcodedEntities;
  }

  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('name');

  if (error || !data) {
    console.error('Error fetching entities:', error);
    return hardcodedEntities; // Fallback to hardcoded
  }

  // Transform database format to app format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(e => ({
    id: e.id,
    name: e.name,
    type: e.type as EntityType,
    description: e.description,
    category: e.category,
    centralizationScore: e.centralization_score,
    captureStory: e.capture_story,
    connections: [], // Will be populated separately
  }));
}

/**
 * Get a single entity by ID
 */
export async function getEntity(id: string): Promise<Entity | null> {
  if (!USE_SUPABASE) {
    return hardcodedEntities.find(e => e.id === id) || null;
  }

  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    const fallback = hardcodedEntities.find(e => e.id === id);
    return fallback || null;
  }

  // Get connections for this entity
  const { data: connections } = await supabase
    .from('connections')
    .select('*, target:entities!connections_target_id_fkey(id, name, type)')
    .eq('source_id', id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityData = data as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connData = (connections || []) as any[];

  return {
    id: entityData.id,
    name: entityData.name,
    type: entityData.type as EntityType,
    description: entityData.description,
    category: entityData.category,
    centralizationScore: entityData.centralization_score,
    captureStory: entityData.capture_story,
    connections: connData.map(c => ({
      targetId: c.target_id,
      targetName: c.target?.name || c.target_id,
      relationship: c.relationship,
      edgeType: c.edge_type as EdgeType,
      strength: c.strength,
      verified: c.verified,
    })),
  };
}

/**
 * Get entities by type
 */
export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
  if (!USE_SUPABASE) {
    return hardcodedEntities.filter(e => e.type === type);
  }

  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('type', type)
    .order('name');

  if (error || !data) {
    return hardcodedEntities.filter(e => e.type === type);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(e => ({
    id: e.id,
    name: e.name,
    type: e.type as EntityType,
    description: e.description,
    category: e.category,
    centralizationScore: e.centralization_score,
    captureStory: e.capture_story,
    connections: [],
  }));
}

// =============================================================================
// GRAPH DATA
// =============================================================================

/**
 * Get graph data for D3 visualization
 */
export async function getGraphData(): Promise<GraphData> {
  if (!USE_SUPABASE) {
    return getHardcodedGraphData();
  }

  // Get all entities
  const { data: entitiesData, error: entityError } = await supabase
    .from('entities')
    .select('*');

  if (entityError || !entitiesData) {
    return getHardcodedGraphData();
  }

  // Get all connections
  const { data: connectionsData, error: connError } = await supabase
    .from('connections')
    .select('*');

  if (connError || !connectionsData) {
    return getHardcodedGraphData();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entitiesArr = entitiesData as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connectionsArr = connectionsData as any[];

  const nodes: GraphNode[] = entitiesArr.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type as EntityType,
    connections: connectionsArr.filter(c => c.source_id === e.id || c.target_id === e.id).length,
  }));

  const links: GraphLink[] = connectionsArr.map(c => ({
    source: c.source_id,
    target: c.target_id,
    relationship: c.relationship,
    edgeType: c.edge_type as EdgeType,
    strength: c.strength,
    verified: c.verified,
  }));

  return { nodes, links };
}

/**
 * Get filtered graph data by edge type
 */
export async function getGraphDataByEdgeType(edgeType: EdgeType | 'all'): Promise<GraphData> {
  const fullData = await getGraphData();

  if (edgeType === 'all') {
    return fullData;
  }

  const filteredLinks = fullData.links.filter(l => l.edgeType === edgeType);
  const linkedNodeIds = new Set<string>();
  filteredLinks.forEach(l => {
    linkedNodeIds.add(l.source as string);
    linkedNodeIds.add(l.target as string);
  });

  const filteredNodes = fullData.nodes.filter(n => linkedNodeIds.has(n.id));

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

// =============================================================================
// TIMELINE EVENTS
// =============================================================================

/**
 * Get all timeline events
 */
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  if (!USE_SUPABASE) {
    return hardcodedTimelineEvents;
  }

  const { data, error } = await supabase
    .from('timeline_events')
    .select(`
      *,
      event_entities(entity_id)
    `)
    .order('date', { ascending: false });

  if (error || !data) {
    return hardcodedTimelineEvents;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(e => ({
    id: e.id,
    date: e.date,
    title: e.title,
    description: e.description,
    entityIds: e.event_entities?.map((ee: { entity_id: string }) => ee.entity_id) || [],
    sourceUrl: e.source_url,
    type: 'event' as const,
  }));
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<Stats> {
  if (!USE_SUPABASE) {
    return getHardcodedStats();
  }

  const { data: entitiesData } = await supabase.from('entities').select('type');
  const { data: connectionsData } = await supabase.from('connections').select('id');
  const { data: eventsData } = await supabase.from('timeline_events').select('id');

  if (!entitiesData) {
    return getHardcodedStats();
  }

  const byType: Record<EntityType, number> = {
    person: 0,
    organization: 0,
    stablecoin: 0,
    government: 0,
    concept: 0,
    event: 0,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (entitiesData as any[]).forEach(e => {
    byType[e.type as EntityType] = (byType[e.type as EntityType] || 0) + 1;
  });

  return {
    totalEntities: entitiesData.length,
    totalConnections: connectionsData?.length || 0,
    byType,
    recentUpdates: eventsData?.length || 0,
  };
}

// =============================================================================
// EDGE TYPE UTILITIES
// =============================================================================

/**
 * Edge type color mapping
 */
export const EDGE_COLORS: Record<EdgeType, string> = {
  ownership: '#ef4444',    // Red
  partnership: '#22c55e',  // Green
  regulatory: '#eab308',   // Yellow
  funding: '#3b82f6',      // Blue
  boardSeat: '#a855f7',    // Purple
  custody: '#f97316',      // Orange
  other: '#6b7280',        // Gray
};

/**
 * Edge type labels
 */
export const EDGE_LABELS: Record<EdgeType, string> = {
  ownership: 'Ownership',
  partnership: 'Partnership',
  regulatory: 'Regulatory',
  funding: 'Funding',
  boardSeat: 'Board/Executive',
  custody: 'Custody',
  other: 'Other',
};

/**
 * Get all edge types
 */
export const ALL_EDGE_TYPES: EdgeType[] = [
  'ownership',
  'partnership',
  'regulatory',
  'funding',
  'boardSeat',
  'custody',
  'other',
];

// Re-export the classifyEdgeType function
export { classifyEdgeType };
