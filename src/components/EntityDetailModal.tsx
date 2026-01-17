'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Network,
  FileText,
  Newspaper,
  Link2,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Globe,
  Shield,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import { classifyEdgeType } from '@/data/entities';
import type { Entity, EntityType, ThreatLevel } from '@/types';
import NewsFeed from './NewsFeed';

const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

const threatLevelConfig: Record<ThreatLevel, { color: string; label: string; bg: string }> = {
  1: { color: '#22c55e', label: 'Pro-Decentralization', bg: '#22c55e20' },
  2: { color: '#84cc16', label: 'Low Threat', bg: '#84cc1620' },
  3: { color: '#eab308', label: 'Neutral', bg: '#eab30820' },
  4: { color: '#f97316', label: 'Moderate Threat', bg: '#f9731620' },
  5: { color: '#ef4444', label: 'High Threat', bg: '#ef444420' },
};

interface EntityDetailModalProps {
  entity: Entity;
  onClose: () => void;
  onNavigateToEntity: (entityId: string) => void;
}

type TabType = 'overview' | 'connections' | 'news' | 'sources';

function ThreatLevelBadge({ level }: { level: ThreatLevel }) {
  const config = threatLevelConfig[level];
  return (
    <div
      className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {level >= 4 ? <AlertTriangle size={12} /> : <Shield size={12} />}
      {config.label}
    </div>
  );
}

function MetadataItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Calendar;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-[var(--text-muted)] mb-0.5">{label}</div>
        <div className="text-sm text-[var(--text-primary)]">{value}</div>
      </div>
    </div>
  );
}

export default function EntityDetailModal({
  entity,
  onClose,
  onNavigateToEntity,
}: EntityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const tabs: { id: TabType; label: string; icon: typeof Network }[] = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'connections', label: 'Connections', icon: Network },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'sources', label: 'Sources', icon: Link2 },
  ];

  const metadata = entity.metadata;

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
              {/* Type badge and threat level */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[entity.type] }}
                  />
                  <span className="text-xs text-[var(--text-muted)] uppercase font-medium">
                    {entity.type}
                  </span>
                </div>
                {entity.threatLevel && (
                  <ThreatLevelBadge level={entity.threatLevel} />
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Capture Story - Why This Matters */}
              {entity.captureStory && (
                <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border-l-4 border-[var(--accent)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[var(--accent)]" />
                    Why This Matters
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {entity.captureStory}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              {metadata && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <MetadataItem
                    icon={Calendar}
                    label="Founded"
                    value={metadata.founded}
                  />
                  <MetadataItem
                    icon={MapPin}
                    label="Headquarters"
                    value={metadata.headquarters}
                  />
                  <MetadataItem
                    icon={Wallet}
                    label="Assets Under Management"
                    value={metadata.aum}
                  />
                  <MetadataItem
                    icon={Shield}
                    label="Regulatory Status"
                    value={metadata.regulatoryStatus}
                  />

                  {/* Key People */}
                  {metadata.keyPeople && metadata.keyPeople.length > 0 && (
                    <div className="col-span-full mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Key People</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {metadata.keyPeople.map((person, i) => (
                          <div
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm"
                          >
                            <span className="text-[var(--text-primary)]">{person.name}</span>
                            <span className="text-[var(--text-muted)]"> · {person.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funding History */}
                  {metadata.fundingHistory && metadata.fundingHistory.length > 0 && (
                    <div className="col-span-full mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Funding</span>
                      </div>
                      <div className="space-y-2">
                        {metadata.fundingHistory.map((round, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-sm flex items-center justify-between"
                          >
                            <div>
                              <span className="text-[var(--text-primary)]">{round.round || 'Funding'}</span>
                              {round.date && (
                                <span className="text-[var(--text-muted)]"> · {round.date}</span>
                              )}
                            </div>
                            {round.amount && (
                              <span className="text-[var(--accent)] font-medium">{round.amount}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {metadata.socials && (
                    <div className="col-span-full mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={16} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Links</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {metadata.socials.website && (
                          <a
                            href={metadata.socials.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors flex items-center gap-1.5"
                          >
                            <Globe size={14} />
                            Website
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {metadata.socials.twitter && (
                          <a
                            href={metadata.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors flex items-center gap-1.5"
                          >
                            𝕏
                            <ExternalLink size={12} />
                          </a>
                        )}
                        {metadata.socials.linkedin && (
                          <a
                            href={metadata.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--border)] transition-colors flex items-center gap-1.5"
                          >
                            LinkedIn
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent News Summary (AI-generated) */}
                  {metadata.recentNewsSummary && (
                    <div className="col-span-full mt-4 p-4 rounded-lg bg-[var(--bg-tertiary)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Newspaper size={16} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Recent Developments</span>
                        {metadata.lastUpdated && (
                          <span className="text-xs text-[var(--text-muted)] ml-auto">
                            Updated: {metadata.lastUpdated}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {metadata.recentNewsSummary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Empty state if no metadata */}
              {!entity.captureStory && !metadata && (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                  <p className="text-[var(--text-muted)]">
                    No detailed information available yet.
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Entity details will be populated with research data.
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
                    const edgeType = conn.edgeType || classifyEdgeType(conn.relationship);
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                            <p className="text-sm text-[var(--text-secondary)]">
                              {conn.relationship}
                            </p>
                            {/* Connection context - why this matters */}
                            {conn.context && (
                              <p className="text-xs text-[var(--text-muted)] mt-2 italic border-l-2 border-[var(--accent)] pl-2">
                                {conn.context}
                              </p>
                            )}
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
