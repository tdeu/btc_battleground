'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Route, AlertTriangle, Shield } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import { findPathToCenter, PathToCenterResult } from '@/lib/graph/pathfinding';
import { getGraphData, entities } from '@/data/entities';
import { getDefaultScore } from '@/lib/scoring';
import type { Entity } from '@/types';

interface PathToCenterProps {
  entityId: string;
  onNavigateToEntity: (entityId: string) => void;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  const hue = (score / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

export default function PathToCenter({
  entityId,
  onNavigateToEntity,
  compact = false,
}: PathToCenterProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [expandedHops, setExpandedHops] = useState<Set<number>>(new Set());

  const pathResult = useMemo(() => {
    const graphData = getGraphData();
    return findPathToCenter(graphData, entityId, entities);
  }, [entityId]);

  const toggleHop = (index: number) => {
    setExpandedHops(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!pathResult.found) {
    return (
      <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Route size={14} />
          <span>No path to Bitcoin Protocol found</span>
        </div>
      </div>
    );
  }

  // Get path entities
  const pathEntities = pathResult.path.map(id => entities.find(e => e.id === id)).filter(Boolean) as Entity[];

  // Trust distance color
  const trustColor = pathResult.trustDistance > 70
    ? '#ef4444'
    : pathResult.trustDistance > 40
      ? '#eab308'
      : '#22c55e';

  return (
    <div className="rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--border)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Route size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Path to Bitcoin Protocol
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">
            {pathResult.distance} hop{pathResult.distance > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)]">Trust Distance:</span>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${trustColor}30`, color: trustColor }}
            >
              {pathResult.trustDistance}%
            </span>
          </div>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Visual Chain */}
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {pathEntities.map((entity, i) => {
              const score = entity.decentralizationScore ?? getDefaultScore(entity.type);
              const isFirst = i === 0;
              const isLast = i === pathEntities.length - 1;

              return (
                <div key={entity.id} className="flex items-center">
                  <button
                    onClick={() => onNavigateToEntity(entity.id)}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity ${
                      isLast ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      isFirst ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' :
                      'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getScoreColor(score) }}
                    />
                    {entity.name}
                  </button>
                  {i < pathEntities.length - 1 && (
                    <span className="text-[var(--text-muted)] px-1">→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Narrative */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {pathResult.narrative}
          </p>

          {/* Hop Explanations */}
          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)] uppercase font-medium">
              Step by Step
            </div>
            {pathResult.hopExplanations.map((hop, i) => {
              const isHopExpanded = expandedHops.has(i);
              return (
                <div
                  key={i}
                  className="rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden"
                >
                  <button
                    onClick={() => toggleHop(i)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[var(--border)] transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[var(--text-muted)]">#{i + 1}</span>
                      <span className="text-[var(--text-primary)]">{hop.fromName}</span>
                      <span className="text-[var(--text-muted)]">→</span>
                      <span className="text-[var(--text-primary)]">{hop.toName}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${EDGE_COLORS[hop.edgeType]}30`,
                          color: EDGE_COLORS[hop.edgeType],
                        }}
                      >
                        {EDGE_LABELS[hop.edgeType]}
                      </span>
                    </div>
                    {isHopExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {isHopExpanded && (
                    <div className="px-3 pb-3">
                      <p className="text-xs text-[var(--text-muted)] mb-2">
                        {hop.relationship}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {hop.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trust Assessment */}
          <div
            className="p-3 rounded-lg flex items-start gap-3"
            style={{ backgroundColor: `${trustColor}15` }}
          >
            {pathResult.trustDistance > 50 ? (
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: trustColor }} />
            ) : (
              <Shield size={16} className="flex-shrink-0 mt-0.5" style={{ color: trustColor }} />
            )}
            <div>
              <div className="text-sm font-medium" style={{ color: trustColor }}>
                {pathResult.trustDistance > 70
                  ? 'High Centralization Path'
                  : pathResult.trustDistance > 40
                    ? 'Moderate Centralization'
                    : 'Relatively Decentralized Path'}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Trust distance measures how much centralized infrastructure lies between
                this entity and the Bitcoin protocol. Higher = more trust required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
