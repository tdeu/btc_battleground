'use client';

import NewsFeed from '@/components/NewsFeed';
import { Newspaper, Rss, AlertCircle } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
              <Newspaper size={24} />
              News Feed
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Latest stablecoin and crypto news, automatically filtered for relevance
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)]">
              <Rss size={14} className="text-[var(--accent)]" />
              <span className="text-xs text-[var(--text-secondary)]">RSS Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] flex items-start gap-3">
        <AlertCircle size={18} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
        <div className="text-sm text-[var(--text-secondary)]">
          <p className="mb-1">
            <strong className="text-[var(--text-primary)]">Sources:</strong> CoinDesk, Cointelegraph, The Block, Decrypt, Bitcoin Magazine
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            News is filtered by keywords related to stablecoins, key people, and organizations in the network.
            Click an article to read the full story.
          </p>
        </div>
      </div>

      {/* News Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <NewsFeed limit={30} />
        </div>
      </div>
    </div>
  );
}
