'use client';

import { useState, useEffect } from 'react';
import { X, Network, FileText, Newspaper, Link2, ExternalLink } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import { classifyEdgeType } from '@/data/entities';
import type { Entity, EntityType, EdgeType } from '@/types';
import NewsFeed from './NewsFeed';

const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

interface EntityDetailModalProps {
  entity: Entity;
  onClose: () => void;
  onNavigateToEntity: (entityId: string) => void;
}

type TabType = 'story' | 'connections' | 'news' | 'sources';

function CentralizationBadge({ score }: { score: number }) {
  // Score is 0-1, lower = more centralized
  const percentage = Math.round(score * 100);
  let color = '#ef4444'; // Red for centralized
  let label = 'Centralized';

  if (score > 0.7) {
    color = '#22c55e'; // Green for decentralized
    label = 'Decentralized';
  } else if (score > 0.4) {
    color = '#eab308'; // Yellow for hybrid
    label = 'Hybrid';
  }

  return (
    <div
      className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label} ({percentage}%)
    </div>
  );
}

export default function EntityDetailModal({
  entity,
  onClose,
  onNavigateToEntity,
}: EntityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('connections');

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const tabs: { id: TabType; label: string; icon: typeof Network }[] = [
    { id: 'story', label: 'Story', icon: FileText },
    { id: 'connections', label: 'Connections', icon: Network },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'sources', label: 'Sources', icon: Link2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-[var(--border)]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Type badge and score */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[entity.type] }}
                  />
                  <span className="text-xs text-[var(--text-muted)] uppercase font-medium">
                    {entity.type}
                  </span>
                </div>
                {entity.centralizationScore !== undefined && (
                  <CentralizationBadge score={entity.centralizationScore} />
                )}
              </div>

              {/* Name */}
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {entity.name}
              </h2>

              {/* Description */}
              <p className="text-[var(--text-secondary)]">
                {entity.description}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--bg-tertiary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Story Tab */}
          {activeTab === 'story' && (
            <div>
              {entity.captureStory ? (
                <div className="prose prose-invert max-w-none">
                  <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {entity.captureStory}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                  <p className="text-[var(--text-muted)]">
                    No capture story available for this entity yet.
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Stories explain how entities fit into the centralization narrative.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div>
              <div className="text-sm text-[var(--text-muted)] mb-4">
                {entity.connections.length} connection{entity.connections.length !== 1 ? 's' : ''}
              </div>

              {entity.connections.length > 0 ? (
                <div className="space-y-2">
                  {entity.connections.map((conn, i) => {
                    const edgeType = classifyEdgeType(conn.relationship);
                    return (
                      <div
                        key={i}
                        onClick={() => onNavigateToEntity(conn.targetId)}
                        className="p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                            style={{ backgroundColor: EDGE_COLORS[edgeType] }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                                {conn.targetName}
                              </span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${EDGE_COLORS[edgeType]}20`,
                                  color: EDGE_COLORS[edgeType],
                                }}
                              >
                                {EDGE_LABELS[edgeType]}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">
                              {conn.relationship}
                            </p>
                          </div>
                          <ExternalLink
                            size={16}
                            className="text-[var(--text-muted)] group-hover:text-[var(--accent)] flex-shrink-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Network size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                  <p className="text-[var(--text-muted)]">
                    No connections recorded for this entity.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              <NewsFeed entityId={entity.id} limit={10} />
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div>
              {entity.sources && entity.sources.length > 0 ? (
                <div className="space-y-3">
                  {entity.sources.map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <Link2
                          size={16}
                          className="text-[var(--text-muted)] mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] mb-1">
                            {source.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)]">
                              {source.sourceType.replace('_', ' ')}
                            </span>
                            {source.publicationDate && (
                              <span>{source.publicationDate}</span>
                            )}
                          </div>
                          {source.excerpt && (
                            <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">
                              {source.excerpt}
                            </p>
                          )}
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-[var(--text-muted)] group-hover:text-[var(--accent)] flex-shrink-0"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Link2 size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                  <p className="text-[var(--text-muted)]">
                    No sources documented for this entity yet.
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Sources will include SEC filings, news articles, and official documentation.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
