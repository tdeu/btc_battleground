'use client';

import { Key, Eye, Unlock, HelpCircle } from 'lucide-react';
import type { ScoreBreakdown as ScoreBreakdownType } from '@/types';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  overall?: number;
  compact?: boolean;
  showLabels?: boolean;
}

interface BreakdownItemProps {
  icon: typeof Key;
  label: string;
  question: string;
  value: number;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  const hue = (score / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Poor';
  return 'Critical';
}

function BreakdownItem({ icon: Icon, label, question, value, compact }: BreakdownItemProps) {
  const color = getScoreColor(value);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-[var(--text-muted)]" />
        <div className="flex-1">
          <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${value}%`, backgroundColor: color }}
            />
          </div>
        </div>
        <span className="text-xs font-medium w-6 text-right" style={{ color }}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
          <div className="group relative">
            <HelpCircle size={12} className="text-[var(--text-muted)] cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 w-48 p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-xs text-[var(--text-muted)] z-10">
              {question}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{getScoreLabel(value)}</span>
          <span className="text-sm font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      </div>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ScoreBreakdown({
  breakdown,
  overall,
  compact = false,
  showLabels = true,
}: ScoreBreakdownProps) {
  const calculatedOverall = overall ?? Math.round(
    (breakdown.custody + breakdown.transparency + breakdown.permissionless) / 3
  );

  const overallColor = getScoreColor(calculatedOverall);

  if (compact) {
    return (
      <div className="space-y-2">
        {showLabels && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-muted)]">Score Breakdown</span>
            <span className="text-xs font-bold" style={{ color: overallColor }}>
              {calculatedOverall}/100
            </span>
          </div>
        )}
        <BreakdownItem
          icon={Key}
          label="Custody"
          question="Who controls the keys/assets?"
          value={breakdown.custody}
          compact
        />
        <BreakdownItem
          icon={Eye}
          label="Transparency"
          question="Is it open source and auditable?"
          value={breakdown.transparency}
          compact
        />
        <BreakdownItem
          icon={Unlock}
          label="Permissionless"
          question="Can anyone use without permission?"
          value={breakdown.permissionless}
          compact
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] p-4">
      {/* Header with Overall Score */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Decentralization Score
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Composite of custody, transparency, and permissionless metrics
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
          style={{
            backgroundColor: `${overallColor}20`,
            color: overallColor,
          }}
        >
          {calculatedOverall}
        </div>
      </div>

      {/* Breakdown Items */}
      <div className="space-y-4">
        <BreakdownItem
          icon={Key}
          label="Custody"
          question="Who controls the keys/assets? Higher = more self-custody options."
          value={breakdown.custody}
        />
        <BreakdownItem
          icon={Eye}
          label="Transparency"
          question="Is it open source? Are there on-chain proofs and audits? Higher = more transparent."
          value={breakdown.transparency}
        />
        <BreakdownItem
          icon={Unlock}
          label="Permissionless"
          question="Can anyone use it without approval? Higher = more permissionless."
          value={breakdown.permissionless}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-center gap-4 text-[10px] text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(0) }} />
          <span>0-20 Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(40) }} />
          <span>20-60 Poor/Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(80) }} />
          <span>60-100 Good/Excellent</span>
        </div>
      </div>
    </div>
  );
}
