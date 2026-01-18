'use client';

import { X, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import { generateExplanation } from '@/lib/explanations';
import type { Entity, EdgeType } from '@/types';

interface EdgeDetailPanelProps {
  sourceEntity: Entity;
  targetEntity: Entity;
  relationship: string;
  explanation?: string;
  edgeType: EdgeType;
  onClose: () => void;
  onNavigateToEntity: (entityId: string) => void;
}

export default function EdgeDetailPanel({
  sourceEntity,
  targetEntity,
  relationship,
  explanation,
  edgeType,
  onClose,
  onNavigateToEntity,
}: EdgeDetailPanelProps) {
  // Generate explanation if not provided
  const displayExplanation = explanation || generateExplanation(
    sourceEntity,
    targetEntity,
    relationship,
    edgeType
  );

  // Calculate decentralization impact
  const sourceScore = sourceEntity.decentralizationScore || 50;
  const targetScore = targetEntity.decentralizationScore || 50;
  const avgScore = (sourceScore + targetScore) / 2;
  const impact = avgScore < 35 ? 'centralizing' : avgScore > 55 ? 'decentralizing' : 'neutral';

  const impactConfig = {
    centralizing: {
      color: '#ef4444',
      bg: '#ef444420',
      label: 'Pro-Centralization',
      description: 'This connection strengthens centralized control over the ecosystem.',
    },
    neutral: {
      color: '#eab308',
      bg: '#eab30820',
      label: 'Neutral / Mixed',
      description: 'This connection has mixed effects on decentralization.',
    },
    decentralizing: {
      color: '#22c55e',
      bg: '#22c55e20',
      label: 'Pro-Decentralization',
      description: 'This connection supports decentralized principles.',
    },
  };

  const config = impactConfig[impact];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[500px] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 shadow-xl z-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 text-xs rounded-full font-medium"
            style={{
              backgroundColor: `${EDGE_COLORS[edgeType]}30`,
              color: EDGE_COLORS[edgeType],
            }}
          >
            {EDGE_LABELS[edgeType]}
          </span>
          <span className="text-xs text-[var(--text-muted)]">Connection</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Entities */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onNavigateToEntity(sourceEntity.id)}
          className="flex-1 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors text-left"
        >
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {sourceEntity.name}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Score: {sourceScore}
          </div>
        </button>

        <div className="flex flex-col items-center gap-1">
          <ArrowRight size={20} className="text-[var(--text-muted)]" />
          <span className="text-[10px] text-[var(--text-muted)] max-w-[80px] text-center leading-tight">
            {relationship}
          </span>
        </div>

        <button
          onClick={() => onNavigateToEntity(targetEntity.id)}
          className="flex-1 p-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border)] transition-colors text-left"
        >
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {targetEntity.name}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            Score: {targetScore}
          </div>
        </button>
      </div>

      {/* Explanation */}
      <div className="mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)] border-l-4 border-[var(--accent)]">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {displayExplanation}
          </p>
        </div>
      </div>

      {/* Decentralization Impact */}
      <div
        className="p-3 rounded-lg flex items-start gap-3"
        style={{ backgroundColor: config.bg }}
      >
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: config.color }} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
}
