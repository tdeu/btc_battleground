'use client';

import { useMemo } from 'react';
import * as d3 from 'd3';
import { Entity, RegionStyle } from '@/types';

interface ConceptRegionProps {
  concept: Entity;
  memberPositions: Array<{ x: number; y: number; id: string }>;
  onHover?: (conceptId: string | null) => void;
  onClick?: (conceptId: string) => void;
}

// Expand a polygon by a padding amount
function expandPolygon(points: [number, number][], padding: number): [number, number][] {
  if (points.length < 3) return points;

  // Calculate centroid
  const centroid = points.reduce(
    (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
    [0, 0] as [number, number]
  );

  // Expand each point away from centroid
  return points.map(p => {
    const dx = p[0] - centroid[0];
    const dy = p[1] - centroid[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return p;
    return [
      p[0] + (dx / len) * padding,
      p[1] + (dy / len) * padding,
    ] as [number, number];
  });
}

// Create a smooth path from hull points using cardinal curve
function createSmoothPath(points: [number, number][]): string {
  if (points.length < 3) return '';

  // Use D3 line generator with cardinal curve for smooth corners
  const lineGenerator = d3.line<[number, number]>()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveCardinalClosed.tension(0.75));

  return lineGenerator(points) || '';
}

export function ConceptRegion({
  concept,
  memberPositions,
  onHover,
  onClick
}: ConceptRegionProps) {
  const regionStyle: RegionStyle = concept.regionStyle || { color: '#888888', opacity: 0.1 };

  const pathData = useMemo(() => {
    if (memberPositions.length < 3) {
      // For fewer than 3 points, create a circle around the centroid
      if (memberPositions.length === 0) return null;

      const centroid = memberPositions.reduce(
        (acc, p) => ({ x: acc.x + p.x / memberPositions.length, y: acc.y + p.y / memberPositions.length }),
        { x: 0, y: 0 }
      );

      // Return circle data
      return { type: 'circle' as const, cx: centroid.x, cy: centroid.y, r: 80 };
    }

    // Convert to array format for d3.polygonHull
    const points: [number, number][] = memberPositions.map(p => [p.x, p.y]);

    // Compute convex hull
    const hull = d3.polygonHull(points);

    if (!hull) return null;

    // Expand hull for padding around nodes
    const expandedHull = expandPolygon(hull, 40);

    // Create smooth path
    const path = createSmoothPath(expandedHull);

    return { type: 'path' as const, d: path };
  }, [memberPositions]);

  if (!pathData) return null;

  // Calculate average score of member entities (for label)
  const avgScore = concept.decentralizationScore || 50;

  // Calculate centroid for label placement
  const centroid = memberPositions.length > 0
    ? memberPositions.reduce(
        (acc, p) => ({ x: acc.x + p.x / memberPositions.length, y: acc.y + p.y / memberPositions.length }),
        { x: 0, y: 0 }
      )
    : { x: 0, y: 0 };

  return (
    <g
      className="concept-region"
      style={{ mixBlendMode: 'multiply' }}
      onMouseEnter={() => onHover?.(concept.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(concept.id)}
    >
      {pathData.type === 'circle' ? (
        <circle
          cx={pathData.cx}
          cy={pathData.cy}
          r={pathData.r}
          fill={regionStyle.color}
          fillOpacity={regionStyle.opacity || 0.12}
          stroke={regionStyle.color}
          strokeOpacity={0.3}
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <path
          d={pathData.d}
          fill={regionStyle.color}
          fillOpacity={regionStyle.opacity || 0.12}
          stroke={regionStyle.color}
          strokeOpacity={0.3}
          strokeWidth={1}
          style={{ cursor: 'pointer' }}
        />
      )}

      {/* Region label */}
      <text
        x={centroid.x}
        y={centroid.y - 10}
        textAnchor="middle"
        fill={regionStyle.color}
        fillOpacity={0.7}
        fontSize="11px"
        fontWeight="600"
        style={{ pointerEvents: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}
      >
        {concept.name}
      </text>

      {/* Score badge */}
      <text
        x={centroid.x}
        y={centroid.y + 8}
        textAnchor="middle"
        fill={regionStyle.color}
        fillOpacity={0.5}
        fontSize="10px"
        style={{ pointerEvents: 'none' }}
      >
        Avg: {avgScore}
      </text>
    </g>
  );
}

export default ConceptRegion;
