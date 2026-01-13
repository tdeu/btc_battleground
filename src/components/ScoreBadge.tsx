'use client';

import { getDecentralizationColor, getDecentralizationLabel } from '@/lib/scoring';

interface ScoreBadgeProps {
  score: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDot?: boolean;
}

/**
 * Reusable score badge component for displaying decentralization scores
 * throughout the app with consistent styling.
 */
export default function ScoreBadge({
  score,
  size = 'sm',
  showLabel = false,
  showDot = false,
}: ScoreBadgeProps) {
  const color = getDecentralizationColor(score);
  const label = getDecentralizationLabel(score);

  const sizeClasses = {
    xs: 'px-1 py-0.5 text-[9px]',
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded font-medium flex items-center gap-1.5`}
      style={{ backgroundColor: `${color}20`, color }}
      title={`Decentralization Score: ${score}/100 - ${label}`}
    >
      {showDot && (
        <span
          className={`${dotSizes[size]} rounded-full`}
          style={{ backgroundColor: color }}
        />
      )}
      {showLabel ? `${label} (${score})` : score}
    </div>
  );
}

/**
 * Simple score indicator dot with tooltip
 */
export function ScoreIndicator({
  score,
  size = 'sm',
}: {
  score: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  const color = getDecentralizationColor(score);
  const label = getDecentralizationLabel(score);

  const dotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`${dotSizes[size]} rounded-full inline-block`}
      style={{ backgroundColor: color }}
      title={`Decentralization Score: ${score}/100 - ${label}`}
    />
  );
}
