'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { entities } from '@/data/entities';

interface NewsEntityMention {
  entity_id: string;
  confidence: number;
}

interface NewsItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  source: string;
  published_at: string;
  relevance_score: number;
  news_entity_mentions: NewsEntityMention[];
}

interface NewsFeedProps {
  entityId?: string;
  limit?: number;
}

const typeColors: Record<string, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

export default function NewsFeed({ entityId, limit = 20 }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (entityId) params.set('entity', entityId);

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      setError('Failed to load news. Make sure Supabase is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [entityId, limit]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEntityForMention = (mention: NewsEntityMention) => {
    return entities.find(e => e.id === mention.entity_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 text-[var(--text-muted)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--text-muted)] mb-4">{error}</p>
        <button
          onClick={fetchNews}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        <p className="mb-2">No news articles yet.</p>
        <p className="text-sm">News will appear here once the feed is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={fetchNews}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* News items */}
      {news.map((item) => (
        <article
          key={item.id}
          className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors"
        >
          {/* Source and date */}
          <div className="flex items-center gap-3 mb-2 text-xs text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-secondary)]">{item.source}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(item.published_at)}
            </span>
            {item.relevance_score > 0.5 && (
              <>
                <span>•</span>
                <span className="text-[var(--accent)]">High relevance</span>
              </>
            )}
          </div>

          {/* Title */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-start gap-2">
              {item.title}
              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex-shrink-0" />
            </h3>
          </a>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Entity tags */}
          {item.news_entity_mentions && item.news_entity_mentions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.news_entity_mentions.slice(0, 5).map((mention) => {
                const entity = getEntityForMention(mention);
                if (!entity) return null;
                return (
                  <span
                    key={mention.entity_id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-secondary)]"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: typeColors[entity.type] || '#666' }}
                    />
                    {entity.name}
                  </span>
                );
              })}
              {item.news_entity_mentions.length > 5 && (
                <span className="text-xs text-[var(--text-muted)] px-2 py-1">
                  +{item.news_entity_mentions.length - 5} more
                </span>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
