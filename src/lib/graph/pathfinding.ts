/**
 * Graph Pathfinding Algorithm
 *
 * Breadth-First Search (BFS) implementation for finding the shortest path
 * between two entities in the network graph.
 */

import type { GraphData, GraphLink, EdgeType } from '@/types';

export interface PathResult {
  path: string[];           // Array of entity IDs from start to end
  edges: PathEdge[];        // Array of edges connecting the path
  distance: number;         // Number of hops
  found: boolean;           // Whether a path was found
}

export interface PathEdge {
  source: string;
  target: string;
  relationship: string;
  edgeType: EdgeType;
}

interface AdjacencyEntry {
  neighbor: string;
  edge: PathEdge;
}

/**
 * Build an adjacency map from graph data for efficient traversal
 */
function buildAdjacencyMap(graphData: GraphData): Map<string, AdjacencyEntry[]> {
  const adjacencyMap = new Map<string, AdjacencyEntry[]>();

  // Initialize map with all nodes
  graphData.nodes.forEach(node => {
    adjacencyMap.set(node.id, []);
  });

  // Add edges (bidirectional)
  graphData.links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as { id: string }).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as { id: string }).id;

    const edge: PathEdge = {
      source: sourceId,
      target: targetId,
      relationship: link.relationship,
      edgeType: link.edgeType,
    };

    // Add both directions for undirected graph
    const sourceEntries = adjacencyMap.get(sourceId) || [];
    sourceEntries.push({ neighbor: targetId, edge });
    adjacencyMap.set(sourceId, sourceEntries);

    const targetEntries = adjacencyMap.get(targetId) || [];
    targetEntries.push({
      neighbor: sourceId,
      edge: { ...edge, source: targetId, target: sourceId },
    });
    adjacencyMap.set(targetId, targetEntries);
  });

  return adjacencyMap;
}

/**
 * Find the shortest path between two entities using Breadth-First Search
 */
export function findShortestPath(
  graphData: GraphData,
  startId: string,
  endId: string
): PathResult {
  // Same node - trivial path
  if (startId === endId) {
    return {
      path: [startId],
      edges: [],
      distance: 0,
      found: true,
    };
  }

  const adjacencyMap = buildAdjacencyMap(graphData);

  // Check if nodes exist
  if (!adjacencyMap.has(startId) || !adjacencyMap.has(endId)) {
    return {
      path: [],
      edges: [],
      distance: -1,
      found: false,
    };
  }

  // BFS
  const queue: { node: string; path: string[]; edges: PathEdge[] }[] = [
    { node: startId, path: [startId], edges: [] },
  ];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const { node, path, edges } = queue.shift()!;

    const neighbors = adjacencyMap.get(node) || [];

    for (const { neighbor, edge } of neighbors) {
      if (neighbor === endId) {
        // Found the path
        return {
          path: [...path, neighbor],
          edges: [...edges, edge],
          distance: path.length,
          found: true,
        };
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          node: neighbor,
          path: [...path, neighbor],
          edges: [...edges, edge],
        });
      }
    }
  }

  // No path found
  return {
    path: [],
    edges: [],
    distance: -1,
    found: false,
  };
}

/**
 * Find all paths between two entities up to a maximum length
 * (useful for showing alternative routes)
 */
export function findAllPaths(
  graphData: GraphData,
  startId: string,
  endId: string,
  maxLength: number = 5
): PathResult[] {
  const adjacencyMap = buildAdjacencyMap(graphData);
  const allPaths: PathResult[] = [];

  if (!adjacencyMap.has(startId) || !adjacencyMap.has(endId)) {
    return allPaths;
  }

  // DFS with backtracking
  function dfs(
    current: string,
    path: string[],
    edges: PathEdge[],
    visited: Set<string>
  ) {
    if (path.length > maxLength) return;

    if (current === endId) {
      allPaths.push({
        path: [...path],
        edges: [...edges],
        distance: path.length - 1,
        found: true,
      });
      return;
    }

    const neighbors = adjacencyMap.get(current) || [];

    for (const { neighbor, edge } of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dfs(neighbor, [...path, neighbor], [...edges, edge], visited);
        visited.delete(neighbor);
      }
    }
  }

  const initialVisited = new Set<string>([startId]);
  dfs(startId, [startId], [], initialVisited);

  // Sort by path length
  allPaths.sort((a, b) => a.distance - b.distance);

  return allPaths;
}

/**
 * Get the degree of separation (shortest path length) between two entities
 */
export function getDegreesOfSeparation(
  graphData: GraphData,
  startId: string,
  endId: string
): number {
  const result = findShortestPath(graphData, startId, endId);
  return result.found ? result.distance : -1;
}

/**
 * Find all entities within N degrees of separation from a starting entity
 */
export function findEntitiesWithinDegrees(
  graphData: GraphData,
  startId: string,
  maxDegrees: number
): Map<string, number> {
  const adjacencyMap = buildAdjacencyMap(graphData);
  const distances = new Map<string, number>();

  if (!adjacencyMap.has(startId)) {
    return distances;
  }

  // BFS to find all reachable nodes
  const queue: { node: string; distance: number }[] = [
    { node: startId, distance: 0 },
  ];
  distances.set(startId, 0);

  while (queue.length > 0) {
    const { node, distance } = queue.shift()!;

    if (distance >= maxDegrees) continue;

    const neighbors = adjacencyMap.get(node) || [];

    for (const { neighbor } of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, distance + 1);
        queue.push({ node: neighbor, distance: distance + 1 });
      }
    }
  }

  return distances;
}
