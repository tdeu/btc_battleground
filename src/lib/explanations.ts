/**
 * Template-based explanation generator for edge relationships
 * Generates human-readable explanations for connections between entities
 */

import type { Entity, EdgeType } from '@/types';

// Templates for each edge type
const EDGE_TEMPLATES: Record<EdgeType, (source: Entity, target: Entity, relationship: string) => string> = {
  custody: (source, target) =>
    `${source.name} holds assets for ${target.name}, meaning ${source.name} physically controls what ${target.name} owns. This creates counterparty risk and a single point of failure.`,

  ownership: (source, target) =>
    `${source.name} owns or controls ${target.name}, giving it direct authority over operations, strategy, and decision-making.`,

  partnership: (source, target) =>
    `${source.name} and ${target.name} have a formal partnership, aligning their interests and creating mutual dependencies in the ecosystem.`,

  regulatory: (source, target, relationship) => {
    const rel = relationship.toLowerCase();
    if (rel.includes('lawsuit') || rel.includes('sue') || rel.includes('investigation')) {
      return `${source.name} has taken regulatory action against ${target.name}, demonstrating government power over the crypto ecosystem.`;
    }
    if (rel.includes('sanction') || rel.includes('fine')) {
      return `${source.name} has sanctioned or fined ${target.name}, showing how traditional regulatory frameworks apply to crypto entities.`;
    }
    return `${source.name} has regulatory authority over ${target.name}, meaning government rules and enforcement directly affect ${target.name}'s operations.`;
  },

  funding: (source, target) =>
    `${source.name} has provided funding or investment to ${target.name}, creating financial ties and potential influence over ${target.name}'s direction.`,

  boardSeat: (source, target, relationship) => {
    const rel = relationship.toLowerCase();
    if (rel.includes('ceo') || rel.includes('founder') || rel.includes('chairman')) {
      return `${source.name} holds a leadership position at ${target.name}, giving direct control over strategic decisions and company direction.`;
    }
    if (rel.includes('board') || rel.includes('director')) {
      return `${source.name} serves on the board of ${target.name}, participating in governance and major corporate decisions.`;
    }
    return `${source.name} has an executive or advisory relationship with ${target.name}, providing influence over operations.`;
  },

  other: (source, target, relationship) =>
    `${source.name} ${relationship} ${target.name}. This connection links them within the broader financial ecosystem.`,
};

// Relationship-specific overrides for common patterns
const RELATIONSHIP_PATTERNS: Array<{
  pattern: RegExp;
  template: (source: Entity, target: Entity, match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /issued?\s*by/i,
    template: (source, target) =>
      `${target.name} issues ${source.name}, making them the sole authority over minting, burning, and blacklisting operations.`,
  },
  {
    pattern: /issues?(?:\s+for)?/i,
    template: (source, target) =>
      `${source.name} issues ${target.name}, controlling all creation and destruction of the token.`,
  },
  {
    pattern: /direct\s*(system\s*)?access/i,
    template: (source, target) =>
      `${source.name} has direct system access to ${target.name}, allowing real-time surveillance and intervention capabilities.`,
  },
  {
    pattern: /surveillance\s*partner/i,
    template: (source, target) =>
      `${source.name} provides surveillance capabilities for ${target.name}, tracking and monitoring all transactions.`,
  },
  {
    pattern: /treasury\s*custodian/i,
    template: (source, target) =>
      `${source.name} holds ${target.name}'s treasury reserves, meaning a single institution controls the backing assets.`,
  },
  {
    pattern: /primary\s*(trading\s*)?venue/i,
    template: (source, target) =>
      `${source.name} is the primary trading venue for ${target.name}, concentrating liquidity and creating exchange dependency.`,
  },
  {
    pattern: /co-?creat(or|ed)/i,
    template: (source, target) =>
      `${source.name} co-created ${target.name}, making them a founding stakeholder with significant influence over the project.`,
  },
  {
    pattern: /central\s*node/i,
    template: (source, target) =>
      `${source.name} is a central node in ${target.name}, representing a key point of concentration and influence.`,
  },
  {
    pattern: /core\s*member/i,
    template: (source, target) =>
      `${source.name} is a core member of ${target.name}, playing a fundamental role in its structure and operations.`,
  },
  {
    pattern: /threatened\s*by/i,
    template: (source, target) =>
      `${source.name} is directly threatened by ${target.name}, which undermines its core principles and purpose.`,
  },
  {
    pattern: /enables?/i,
    template: (source, target) =>
      `${source.name} enables ${target.name}, providing essential infrastructure or capability for its operation.`,
  },
  {
    pattern: /can\s*freeze/i,
    template: (source, target) =>
      `${source.name} can freeze or blacklist addresses on ${target.name}, demonstrating programmable control over user funds.`,
  },
  {
    pattern: /reporting\s*pipeline/i,
    template: (source, target) =>
      `${source.name} has a direct reporting pipeline to ${target.name}, sharing transaction data with authorities.`,
  },
];

/**
 * Generate a human-readable explanation for a connection between two entities
 */
export function generateExplanation(
  source: Entity,
  target: Entity,
  relationship: string,
  edgeType: EdgeType
): string {
  // First, check for relationship-specific patterns
  for (const { pattern, template } of RELATIONSHIP_PATTERNS) {
    const match = relationship.match(pattern);
    if (match) {
      return template(source, target, match);
    }
  }

  // Fall back to edge type templates
  return EDGE_TEMPLATES[edgeType](source, target, relationship);
}

/**
 * Generate a hop explanation for path-to-center display
 */
export function generateHopExplanation(
  source: Entity,
  target: Entity,
  relationship: string,
  edgeType: EdgeType
): string {
  // Shorter version for path display
  const full = generateExplanation(source, target, relationship, edgeType);

  // Truncate to first sentence if too long
  const firstSentence = full.split(/\.\s/)[0];
  return firstSentence.length < full.length ? firstSentence + '.' : full;
}

/**
 * Generate a narrative description of a full path
 */
export function generatePathNarrative(
  pathEntities: Entity[],
  pathEdges: Array<{ relationship: string; edgeType: EdgeType }>
): string {
  if (pathEntities.length < 2) {
    return 'No path to display.';
  }

  const start = pathEntities[0];
  const end = pathEntities[pathEntities.length - 1];

  const parts: string[] = [];
  parts.push(`Starting from ${start.name}`);

  for (let i = 0; i < pathEdges.length; i++) {
    const from = pathEntities[i];
    const to = pathEntities[i + 1];
    const edge = pathEdges[i];

    parts.push(
      `${from.name} connects to ${to.name} through a ${edge.edgeType} relationship (${edge.relationship})`
    );
  }

  parts.push(`reaching ${end.name} in ${pathEdges.length} hop${pathEdges.length > 1 ? 's' : ''}.`);

  return parts.join('. ');
}

/**
 * Calculate a "trust distance" metric for a path
 * Higher = more steps through centralized entities
 */
export function calculateTrustDistance(pathEntities: Entity[]): number {
  if (pathEntities.length < 2) return 0;

  let totalPenalty = 0;

  for (const entity of pathEntities) {
    const score = entity.decentralizationScore || 50;
    // Penalty increases for centralized entities (low scores)
    const penalty = (100 - score) / 100;
    totalPenalty += penalty;
  }

  // Normalize by path length
  return Math.round((totalPenalty / pathEntities.length) * 100);
}
