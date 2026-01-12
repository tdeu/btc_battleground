export type EntityType = 'person' | 'organization' | 'stablecoin' | 'government' | 'concept' | 'event';
export type EdgeType = 'ownership' | 'partnership' | 'regulatory' | 'funding' | 'boardSeat' | 'custody' | 'other';
export type EntityCategory = 'bitcoin' | 'stablecoin' | 'both';

export interface Database {
  public: {
    Tables: {
      entities: {
        Row: {
          id: string;
          name: string;
          type: EntityType;
          category: EntityCategory | null;
          description: string;
          centralization_score: number | null;
          capture_story: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: EntityType;
          category?: EntityCategory | null;
          description: string;
          centralization_score?: number | null;
          capture_story?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: EntityType;
          category?: EntityCategory | null;
          description?: string;
          centralization_score?: number | null;
          capture_story?: string | null;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          source_id: string;
          target_id: string;
          relationship: string;
          edge_type: EdgeType;
          strength: number | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          target_id: string;
          relationship: string;
          edge_type?: EdgeType;
          strength?: number | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          target_id?: string;
          relationship?: string;
          edge_type?: EdgeType;
          strength?: number | null;
          verified?: boolean;
        };
      };
      timeline_events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          source_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          date: string;
          source_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          date?: string;
          source_url?: string | null;
        };
      };
      event_entities: {
        Row: {
          id: string;
          event_id: string;
          entity_id: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          entity_id: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          entity_id?: string;
        };
      };
      news_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          url: string;
          source: string;
          published_at: string;
          fetched_at: string;
          relevance_score: number;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          url: string;
          source: string;
          published_at: string;
          fetched_at?: string;
          relevance_score?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          url?: string;
          source?: string;
          published_at?: string;
          relevance_score?: number;
        };
      };
      news_entity_mentions: {
        Row: {
          id: string;
          news_id: string;
          entity_id: string;
          confidence: number;
        };
        Insert: {
          id?: string;
          news_id: string;
          entity_id: string;
          confidence?: number;
        };
        Update: {
          id?: string;
          news_id?: string;
          entity_id?: string;
          confidence?: number;
        };
      };
      entity_sources: {
        Row: {
          id: string;
          entity_id: string | null;
          connection_id: string | null;
          source_type: 'sec_filing' | 'news_article' | 'official_website' | 'research_report' | 'other';
          title: string;
          url: string;
          publication_date: string | null;
          excerpt: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_id?: string | null;
          connection_id?: string | null;
          source_type: 'sec_filing' | 'news_article' | 'official_website' | 'research_report' | 'other';
          title: string;
          url: string;
          publication_date?: string | null;
          excerpt?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_id?: string | null;
          connection_id?: string | null;
          source_type?: 'sec_filing' | 'news_article' | 'official_website' | 'research_report' | 'other';
          title?: string;
          url?: string;
          publication_date?: string | null;
          excerpt?: string | null;
        };
      };
      market_data: {
        Row: {
          id: string;
          entity_id: string | null;
          data_type: string;
          value: number;
          unit: string | null;
          source: string | null;
          fetched_at: string;
          valid_until: string | null;
        };
        Insert: {
          id?: string;
          entity_id?: string | null;
          data_type: string;
          value: number;
          unit?: string | null;
          source?: string | null;
          fetched_at?: string;
          valid_until?: string | null;
        };
        Update: {
          id?: string;
          entity_id?: string | null;
          data_type?: string;
          value?: number;
          unit?: string | null;
          source?: string | null;
          valid_until?: string | null;
        };
      };
      metrics_snapshots: {
        Row: {
          id: string;
          metric_name: string;
          metric_value: number;
          breakdown: Record<string, number> | null;
          snapshot_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          metric_name: string;
          metric_value: number;
          breakdown?: Record<string, number> | null;
          snapshot_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          metric_name?: string;
          metric_value?: number;
          breakdown?: Record<string, number> | null;
          snapshot_date?: string;
        };
      };
    };
  };
}

// Helper types for the app
export type Entity = Database['public']['Tables']['entities']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row'];
export type NewsItem = Database['public']['Tables']['news_items']['Row'];
export type NewsEntityMention = Database['public']['Tables']['news_entity_mentions']['Row'];
export type EntitySource = Database['public']['Tables']['entity_sources']['Row'];
export type MarketData = Database['public']['Tables']['market_data']['Row'];
export type MetricsSnapshot = Database['public']['Tables']['metrics_snapshots']['Row'];
