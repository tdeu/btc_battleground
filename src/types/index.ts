export type EntityType = 'person' | 'organization' | 'stablecoin' | 'government' | 'concept' | 'event';

export type EdgeType = 'ownership' | 'partnership' | 'regulatory' | 'funding' | 'boardSeat' | 'custody' | 'other';

export type EntityCategory = 'bitcoin' | 'stablecoin' | 'both';

// Threat level: 1 = pro-decentralization, 5 = major centralization threat
export type ThreatLevel = 1 | 2 | 3 | 4 | 5;

export interface KeyPerson {
  name: string;
  role: string;
  linkedEntityId?: string; // If this person has their own entity page
}

export interface SocialLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface FundingRound {
  date?: string;
  amount?: string;
  investors?: string[];
  round?: string; // "Series A", "Seed", etc.
}

export interface EntityMetadata {
  // Basic info
  founded?: string; // Year or date
  headquarters?: string;

  // People (for orgs)
  keyPeople?: KeyPerson[];

  // Financial
  aum?: string; // Assets under management/control (human readable, e.g., "214,000 BTC")
  fundingHistory?: FundingRound[];

  // Links
  socials?: SocialLinks;

  // Regulatory
  regulatoryStatus?: string;
  licenses?: string[];
  jurisdictions?: string[];

  // AI-populated fields
  recentNewsSummary?: string;
  lastUpdated?: string; // When AI last refreshed this data
}

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
  threatLevel?: ThreatLevel; // 1 = pro-decentralization, 5 = major threat
  decentralizationScore?: number; // 0-100 scale (100 = fully decentralized) - legacy, use threatLevel
  captureStory?: string; // One paragraph: why this entity matters for centralization
  sources?: EntitySource[];
  metadata?: EntityMetadata; // Structured metadata for display
  createdAt?: string;
  updatedAt?: string;
}

export interface Connection {
  targetId: string;
  targetName: string;
  relationship: string;
  context?: string; // One-liner explaining why this connection matters
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
  threatLevel?: ThreatLevel;
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
