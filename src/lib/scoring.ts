/**
 * Decentralization Scoring Utilities
 *
 * Provides functions to convert decentralization scores (0-100) to visual representations.
 *
 * Score Scale:
 * - 0 = Fully centralized (red) - e.g., SEC, BlackRock, large custodians
 * - 50 = Mixed/neutral (yellow/orange)
 * - 100 = Fully decentralized (green) - e.g., Bitcoin Protocol, Self-Custody
 */

/**
 * Get CSS color for decentralization score using HSL gradient
 *
 * Maps 0-100 score to hue 0-120:
 * - 0 (centralized) = red (hsl 0°)
 * - 50 (mixed) = yellow (hsl 60°)
 * - 100 (decentralized) = green (hsl 120°)
 *
 * @param score - Decentralization score (0-100)
 * @returns CSS HSL color string
 *
 * @example
 * getDecentralizationColor(0)   // "hsl(0, 80%, 45%)" - red
 * getDecentralizationColor(50)  // "hsl(60, 80%, 45%)" - yellow
 * getDecentralizationColor(100) // "hsl(120, 80%, 45%)" - green
 */
export function getDecentralizationColor(score: number): string {
  // Clamp score to 0-100
  const s = Math.max(0, Math.min(100, score));
  // Map 0-100 to hue 0-120 (red to green)
  const hue = s * 1.2;
  return `hsl(${hue}, 80%, 45%)`;
}

/**
 * Get a lighter version of the decentralization color (for backgrounds)
 *
 * @param score - Decentralization score (0-100)
 * @returns CSS HSL color string with higher lightness
 */
export function getDecentralizationColorLight(score: number): string {
  const s = Math.max(0, Math.min(100, score));
  const hue = s * 1.2;
  return `hsl(${hue}, 70%, 90%)`;
}

/**
 * Get human-readable label for a score range
 *
 * @param score - Decentralization score (0-100)
 * @returns Human-readable label
 */
export function getDecentralizationLabel(score: number): string {
  if (score >= 80) return 'Decentralized';
  if (score >= 60) return 'Mostly Decentralized';
  if (score >= 40) return 'Mixed';
  if (score >= 20) return 'Mostly Centralized';
  return 'Centralized';
}

/**
 * Get short label for compact displays
 *
 * @param score - Decentralization score (0-100)
 * @returns Short label (1-2 words)
 */
export function getDecentralizationLabelShort(score: number): string {
  if (score >= 80) return 'Decentralized';
  if (score >= 60) return 'Mostly Decentr.';
  if (score >= 40) return 'Mixed';
  if (score >= 20) return 'Mostly Centr.';
  return 'Centralized';
}

/**
 * Get Tailwind CSS background color class for a score
 *
 * @param score - Decentralization score (0-100)
 * @returns Tailwind CSS class name
 */
export function getDecentralizationBgClass(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-lime-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get Tailwind CSS text color class for a score
 *
 * @param score - Decentralization score (0-100)
 * @returns Tailwind CSS class name
 */
export function getDecentralizationTextClass(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-lime-500';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get Tailwind CSS border color class for a score
 *
 * @param score - Decentralization score (0-100)
 * @returns Tailwind CSS class name
 */
export function getDecentralizationBorderClass(score: number): string {
  if (score >= 80) return 'border-green-500';
  if (score >= 60) return 'border-lime-500';
  if (score >= 40) return 'border-yellow-500';
  if (score >= 20) return 'border-orange-500';
  return 'border-red-500';
}

/**
 * Get a score description explaining what the score means
 *
 * @param score - Decentralization score (0-100)
 * @returns Detailed description
 */
export function getDecentralizationDescription(score: number): string {
  if (score >= 80) {
    return 'Highly decentralized with minimal single points of control or failure.';
  }
  if (score >= 60) {
    return 'Mostly decentralized but with some concentration of control.';
  }
  if (score >= 40) {
    return 'Mixed level of centralization with significant control by specific entities.';
  }
  if (score >= 20) {
    return 'Mostly centralized with control concentrated in few entities.';
  }
  return 'Highly centralized with single points of control and potential censorship.';
}

/**
 * Default scores by entity type (used when no specific score is assigned)
 */
export const DEFAULT_SCORES_BY_TYPE: Record<string, number> = {
  government: 5,
  organization: 30,
  stablecoin: 30,
  person: 40,
  concept: 50,
  event: 50,
};

/**
 * Get default score for an entity type
 *
 * @param type - Entity type
 * @returns Default decentralization score
 */
export function getDefaultScore(type: string): number {
  return DEFAULT_SCORES_BY_TYPE[type] ?? 50;
}
