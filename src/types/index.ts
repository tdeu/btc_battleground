export type EntityType = 'person' | 'organization' | 'stablecoin' | 'government' | 'concept' | 'event';

export type EdgeType = 'ownership' | 'partnership' | 'regulatory' | 'funding' | 'boardSeat' | 'custody' | 'other';

export type EntityCategory = 'bitcoin' | 'stablecoin' | 'both';

export interface EntitySource {
  id: string;
  entityId?: string;
  connectionId?: string;
  sourceType: 'sec_filing' | 'news_article' | 'official_website' | 'research_report' | 'other';
  title: string;
  url: string;
  publicationDate?: string;
  excerpt?: string;
  createdAt?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  category?: EntityCategory;
  description: string;
  connections: Connection[];
  centralizationScore?: number;
  captureStory?: string;
  sources?: EntitySource[];
  metadata?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Connection {
  targetId: string;
  targetName: string;
  relationship: string;
  edgeType?: EdgeType;
  strength?: number;
  verified?: boolean;
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
  edgeType: EdgeType;
  strength?: number;
  verified?: boolean;
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
