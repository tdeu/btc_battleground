import { entities, classifyEdgeType, getGraphData } from '@/data/entities';
import { getDefaultScore } from '@/lib/scoring';
import { EntityType, EdgeType } from '@/types';

// Get score for an entity, using default if not set
function getEntityScore(entity: typeof entities[0]): number {
  return entity.decentralizationScore ?? getDefaultScore(entity.type);
}

// Calculate average centralization score across all entities
export function calculateAverageCentralization(): number {
  const scores = entities.map(getEntityScore);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Calculate custody concentration (top 5 custodians' share)
export function calculateCustodyConcentration(): {
  percentage: number;
  topCustodians: { name: string; connections: number }[];
  totalCustodyConnections: number;
} {
  // Find all custody-type connections
  const custodyConnections: Map<string, number> = new Map();
  let totalCustody = 0;

  entities.forEach((entity) => {
    entity.connections.forEach((conn) => {
      const edgeType = classifyEdgeType(conn.relationship);
      if (edgeType === 'custody') {
        totalCustody++;
        // Track both the entity and target
        custodyConnections.set(entity.id, (custodyConnections.get(entity.id) || 0) + 1);
        custodyConnections.set(conn.targetId, (custodyConnections.get(conn.targetId) || 0) + 1);
      }
    });
  });

  // Get top 5 by custody connections
  const sorted = Array.from(custodyConnections.entries())
    .map(([id, count]) => {
      const entity = entities.find((e) => e.id === id);
      return { name: entity?.name || id, connections: count };
    })
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);

  const top5Total = sorted.reduce((sum, c) => sum + c.connections, 0);
  const allTotal = Array.from(custodyConnections.values()).reduce((sum, c) => sum + c, 0);

  return {
    percentage: allTotal > 0 ? Math.round((top5Total / allTotal) * 100) : 0,
    topCustodians: sorted,
    totalCustodyConnections: totalCustody,
  };
}

// Calculate regulatory capture index (0-10 scale)
export function calculateRegulatoryCapture(): {
  score: number;
  breakdown: {
    governmentEntities: number;
    regulatoryConnections: number;
    entitiesWithGovConnections: number;
  };
} {
  const governmentEntities = entities.filter((e) => e.type === 'government');

  // Count regulatory connections
  let regulatoryConnections = 0;
  const entitiesWithGovConnections = new Set<string>();

  entities.forEach((entity) => {
    entity.connections.forEach((conn) => {
      const edgeType = classifyEdgeType(conn.relationship);
      if (edgeType === 'regulatory') {
        regulatoryConnections++;
        entitiesWithGovConnections.add(entity.id);
        entitiesWithGovConnections.add(conn.targetId);
      }
      // Also count direct government connections
      const targetEntity = entities.find((e) => e.id === conn.targetId);
      if (targetEntity?.type === 'government') {
        entitiesWithGovConnections.add(entity.id);
      }
    });
  });

  // Calculate weighted score
  // Weight: Government entities = 3x, Regulatory connections = 2x, Connected entities = 1x
  const weightedScore =
    governmentEntities.length * 3 +
    regulatoryConnections * 2 +
    entitiesWithGovConnections.size;

  // Normalize to 0-10 scale (max reasonable score ~150)
  const normalized = Math.min(10, (weightedScore / 150) * 10);

  return {
    score: Math.round(normalized * 10) / 10,
    breakdown: {
      governmentEntities: governmentEntities.length,
      regulatoryConnections,
      entitiesWithGovConnections: entitiesWithGovConnections.size,
    },
  };
}

// Calculate network centralization metrics
export function calculateNetworkCentralization(): {
  level: 'High' | 'Medium' | 'Low';
  density: number;
  hubCount: number;
  averageConnections: number;
  maxConnections: number;
  topHubs: { name: string; connections: number; score: number }[];
} {
  const graphData = getGraphData();
  const n = graphData.nodes.length;
  const actualConnections = graphData.links.length;
  const possibleConnections = (n * (n - 1)) / 2;
  const density = possibleConnections > 0 ? actualConnections / possibleConnections : 0;

  // Count hubs (entities with >10 connections)
  const connectionCounts = new Map<string, number>();
  graphData.links.forEach((link) => {
    // GraphLink source and target are always strings from getGraphData()
    connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
    connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
  });

  const counts = Array.from(connectionCounts.values());
  const maxConnections = Math.max(...counts, 0);
  const avgConnections = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  const hubCount = counts.filter((c) => c > 10).length;

  // Get top hubs
  const topHubs = Array.from(connectionCounts.entries())
    .map(([id, count]) => {
      const entity = entities.find((e) => e.id === id);
      return {
        name: entity?.name || id,
        connections: count,
        score: entity ? getEntityScore(entity) : 50,
      };
    })
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 5);

  // Determine level based on hub concentration
  const hubRatio = hubCount / n;
  let level: 'High' | 'Medium' | 'Low';
  if (hubRatio > 0.1 || maxConnections > 15) {
    level = 'High';
  } else if (hubRatio > 0.05 || maxConnections > 10) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    level,
    density: Math.round(density * 1000) / 10,
    hubCount,
    averageConnections: Math.round(avgConnections * 10) / 10,
    maxConnections,
    topHubs,
  };
}

// Get distribution of entities by score range
export function getEntityDistribution(): {
  range: string;
  count: number;
  color: string;
  label: string;
}[] {
  const ranges = [
    { min: 0, max: 20, label: '0-20', color: '#ef4444', description: 'Highly Centralized' },
    { min: 20, max: 40, label: '20-40', color: '#f97316', description: 'Mostly Centralized' },
    { min: 40, max: 60, label: '40-60', color: '#eab308', description: 'Mixed' },
    { min: 60, max: 80, label: '60-80', color: '#84cc16', description: 'Mostly Decentralized' },
    { min: 80, max: 101, label: '80-100', color: '#22c55e', description: 'Decentralized' },
  ];

  return ranges.map((r) => ({
    range: r.label,
    count: entities.filter((e) => {
      const score = getEntityScore(e);
      return score >= r.min && score < r.max;
    }).length,
    color: r.color,
    label: r.description,
  }));
}

// Get most centralized entities
export function getMostCentralized(limit: number = 10): {
  id: string;
  name: string;
  type: EntityType;
  score: number;
  description: string;
}[] {
  return entities
    .map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      score: getEntityScore(e),
      description: e.description,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

// Get most decentralized entities
export function getMostDecentralized(limit: number = 10): {
  id: string;
  name: string;
  type: EntityType;
  score: number;
  description: string;
}[] {
  return entities
    .map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      score: getEntityScore(e),
      description: e.description,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get connection type breakdown
export function getConnectionBreakdown(): {
  type: EdgeType;
  count: number;
  percentage: number;
}[] {
  const counts: Record<EdgeType, number> = {
    ownership: 0,
    partnership: 0,
    regulatory: 0,
    funding: 0,
    boardSeat: 0,
    custody: 0,
    other: 0,
  };

  entities.forEach((entity) => {
    entity.connections.forEach((conn) => {
      const edgeType = classifyEdgeType(conn.relationship);
      counts[edgeType]++;
    });
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (Object.entries(counts) as [EdgeType, number][])
    .map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Get entity type breakdown with average scores
export function getEntityTypeBreakdown(): {
  type: EntityType;
  count: number;
  avgScore: number;
}[] {
  const types: EntityType[] = ['government', 'organization', 'stablecoin', 'person', 'concept', 'event'];

  return types.map((type) => {
    const typeEntities = entities.filter((e) => e.type === type);
    const avgScore =
      typeEntities.length > 0
        ? Math.round(typeEntities.reduce((sum, e) => sum + getEntityScore(e), 0) / typeEntities.length)
        : 0;
    return { type, count: typeEntities.length, avgScore };
  }).sort((a, b) => a.avgScore - b.avgScore);
}

// Get all metrics summary
export function getAllMetrics() {
  return {
    avgCentralization: calculateAverageCentralization(),
    custodyConcentration: calculateCustodyConcentration(),
    regulatoryCapture: calculateRegulatoryCapture(),
    networkCentralization: calculateNetworkCentralization(),
    distribution: getEntityDistribution(),
    mostCentralized: getMostCentralized(10),
    mostDecentralized: getMostDecentralized(10),
    connectionBreakdown: getConnectionBreakdown(),
    entityTypeBreakdown: getEntityTypeBreakdown(),
    totalEntities: entities.length,
    lastCalculated: new Date().toISOString(),
  };
}
