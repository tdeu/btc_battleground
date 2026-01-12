export type EntityType = 'person' | 'organization' | 'stablecoin' | 'government' | 'concept' | 'event';

export interface Database {
  public: {
    Tables: {
      entities: {
        Row: {
          id: string;
          name: string;
          type: EntityType;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: EntityType;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: EntityType;
          description?: string;
          updated_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          source_id: string;
          target_id: string;
          relationship: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          target_id: string;
          relationship: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          target_id?: string;
          relationship?: string;
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
    };
  };
}

// Helper types for the app
export type Entity = Database['public']['Tables']['entities']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row'];
export type NewsItem = Database['public']['Tables']['news_items']['Row'];
export type NewsEntityMention = Database['public']['Tables']['news_entity_mentions']['Row'];
