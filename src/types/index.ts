export type EntityType = 'person' | 'organization' | 'stablecoin' | 'government' | 'concept' | 'event';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  connections: Connection[];
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Connection {
  targetId: string;
  targetName: string;
  relationship: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  entityIds: string[];
  source?: string;
  sourceUrl?: string;
  type: 'event' | 'news' | 'tweet' | 'onchain';
}

export interface GraphNode {
  id: string;
  name: string;
  type: EntityType;
  connections: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Stats {
  totalEntities: number;
  totalConnections: number;
  byType: Record<EntityType, number>;
  recentUpdates: number;
}
