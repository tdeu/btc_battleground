// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { entities, getGraphData, classifyEdgeType } from '@/data/entities';
import { EntityType, EdgeType, ThreatLevel, RegionStyle } from '@/types';
import { EDGE_COLORS, EDGE_LABELS, ALL_EDGE_TYPES } from '@/lib/data';
import { getDefaultScore, getDecentralizationColor, getDecentralizationLabel } from '@/lib/scoring';
import CapturePath from '@/components/CapturePath';
import EntityDetailModal from '@/components/EntityDetailModal';
import EdgeDetailPanel from '@/components/EdgeDetailPanel';
import PathToCenter from '@/components/PathToCenter';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import { PathResult } from '@/lib/graph/pathfinding';
import { Loader2, RotateCcw, Search, X, Swords } from 'lucide-react';
import { Entity } from '@/types';

// Threat level colors (1 = green/ally, 5 = red/threat)
const THREAT_COLORS: Record<ThreatLevel, string> = {
  1: '#22c55e', // Pro-Decentralization - Green
  2: '#84cc16', // Low Threat - Lime
  3: '#eab308', // Neutral - Yellow
  4: '#f97316', // Moderate Threat - Orange
  5: '#ef4444', // High Threat - Red
};

// Get color from threat level (preferred) or score (fallback)
function getNodeColor(entity: { threatLevel?: ThreatLevel; decentralizationScore?: number; type: EntityType }): string {
  // Prefer explicit threatLevel
  if (entity.threatLevel) {
    return THREAT_COLORS[entity.threatLevel];
  }
  // Fallback to score-based color
  const score = entity.decentralizationScore ?? getDefaultScore(entity.type);
  return getScoreColor(score);
}

// Score-based node color (HSL gradient from red to green)
function getScoreColor(score: number): string {
  // Map score to hue: 0 (red) at score 0, 120 (green) at score 100
  const hue = (score / 100) * 120;
  return `hsl(${hue}, 80%, 50%)`;
}

// Entity type colors (kept for reference/badges only)
const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

// Force direction colors (for edges)
const FORCE_COLORS = {
  centralizing: '#ef4444',    // Red - Pro-Centralization
  neutral: '#eab308',         // Yellow - Mixed/Neutral
  decentralizing: '#22c55e',  // Green - Pro-Decentralization
};

// Calculate force direction for an edge based on connected entities' scores
function getForceDirection(sourceId: string, targetId: string): 'centralizing' | 'neutral' | 'decentralizing' {
  const source = entities.find(e => e.id === sourceId);
  const target = entities.find(e => e.id === targetId);

  const sourceScore = source?.decentralizationScore ?? getDefaultScore(source?.type || 'concept');
  const targetScore = target?.decentralizationScore ?? getDefaultScore(target?.type || 'concept');

  const avgScore = (sourceScore + targetScore) / 2;

  // If both entities are centralized (low scores), this is a centralizing force
  if (avgScore < 35) return 'centralizing';
  // If both are decentralized (high scores), this is a decentralizing force
  if (avgScore > 55) return 'decentralizing';
  // Otherwise neutral/mixed
  return 'neutral';
}

// Calculate influence/threat size for a node
// Institutions (organizations, stablecoins, government) are weighted higher than individuals
function getNodeSize(entity: typeof entities[0]): number {
  const score = entity.decentralizationScore ?? getDefaultScore(entity.type);
  const connections = entity.connections.length || 1;
  const centralizationFactor = 100 - score;

  // Type multipliers (institutions > people)
  const typeMultiplier: Record<EntityType, number> = {
    organization: 3.0,    // Companies have resources, longevity
    stablecoin: 2.5,      // Direct control over assets
    government: 2.5,      // Regulatory power
    concept: 1.5,         // Ideological influence
    person: 1.0,          // Individuals are replaceable (though we removed most)
    event: 0.5,           // Historical, not ongoing
  };

  // Calculate base influence
  const multiplier = typeMultiplier[entity.type] || 1.0;
  const influence = connections * centralizationFactor * multiplier;

  // Scale to pixel radius (4px min, 18px max)
  const maxInfluence = 1500;
  const normalized = Math.min(influence / maxInfluence, 1);
  return 4 + (normalized * 14);
}

// Get ring position based on decentralization score
function getRadialPosition(score: number, centerX: number, centerY: number, index: number, totalInRing: number): { x: number; y: number } {
  // Score 100 = center, Score 0 = outer edge
  // Map score to radius: 100 -> 0 radius, 0 -> maxRadius
  const maxRadius = 350;
  const minRadius = 50;

  // Invert score: higher score = closer to center
  const radius = minRadius + (maxRadius - minRadius) * (1 - score / 100);

  // Distribute entities around the ring
  const angle = (index / totalInRing) * 2 * Math.PI - Math.PI / 2; // Start from top

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

// Force analysis for an entity
function getForceAnalysis(entity: typeof entities[0]) {
  let centralizingCount = 0;
  let neutralCount = 0;
  let decentralizingCount = 0;

  entity.connections.forEach(conn => {
    const force = getForceDirection(entity.id, conn.targetId);
    if (force === 'centralizing') centralizingCount++;
    else if (force === 'neutral') neutralCount++;
    else decentralizingCount++;
  });

  const netForce = decentralizingCount - centralizingCount;

  return {
    centralizing: centralizingCount,
    neutral: neutralCount,
    decentralizing: decentralizingCount,
    netForce,
    netLabel: netForce > 0 ? 'Decentralizing' : netForce < 0 ? 'Centralizing' : 'Neutral',
  };
}

export default function NetworkPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [filterEdgeType, setFilterEdgeType] = useState<EdgeType | 'all'>('all');
  const [filterForceDirection, setFilterForceDirection] = useState<'all' | 'centralizing' | 'neutral' | 'decentralizing'>('all');

  // Capture Path state
  const [capturePathMode, setCapturePathMode] = useState(false);
  const [pathNodes, setPathNodes] = useState<[string | null, string | null]>([null, null]);
  const [currentPath, setCurrentPath] = useState<PathResult | null>(null);

  // Enhanced interaction state
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; entity: typeof entities[0] } | null>(null);
  const [edgeTooltipData, setEdgeTooltipData] = useState<{ x: number; y: number; source: string; target: string; edgeType: EdgeType; force: string } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<{
    sourceId: string;
    targetId: string;
    relationship: string;
    explanation?: string;
    edgeType: EdgeType;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Refs for D3 zoom control
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Create entity name map
  const entityNames = useMemo(() => {
    const map = new Map<string, string>();
    entities.forEach(e => map.set(e.id, e.name));
    return map;
  }, []);

  // Handle node selection for capture path
  const handlePathNodeSelect = useCallback((nodeId: string | null, slot: 0 | 1) => {
    setPathNodes(prev => {
      const newNodes: [string | null, string | null] = [...prev];
      newNodes[slot] = nodeId;
      return newNodes;
    });
  }, []);

  // Handle path found
  const handlePathFound = useCallback((result: PathResult | null) => {
    setCurrentPath(result);
  }, []);

  // Search results computation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return entities
      .filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  // Zoom to node handler with smooth animation
  const zoomToNode = useCallback((nodeId: string) => {
    if (!svgRef.current || !zoomRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const nodes = simulationRef.current.nodes();
    const node = nodes.find((n: any) => n.id === nodeId) as any;

    if (!node || node.x === undefined || node.y === undefined) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const scale = 1.5;
    const x = width / 2 - node.x * scale;
    const y = height / 2 - node.y * scale;

    // Smooth 800ms animation
    svg.transition()
      .duration(800)
      .ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));

    setHighlightedNode(nodeId);
    setSelectedNode(nodeId);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  // Reset view handler - centers on Bitcoin (positioned at radius 70px from center)
  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Find Bitcoin node and center on it
    const nodes = simulationRef.current.nodes();
    const bitcoinNode = nodes.find((n: any) => n.id === 'bitcoin-protocol') as any;

    if (bitcoinNode && bitcoinNode.x !== undefined) {
      const scale = 0.9;
      const x = width / 2 - bitcoinNode.x * scale;
      const y = height / 2 - bitcoinNode.y * scale;

      svg.transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));
    } else {
      svg.transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));
    }

    setSelectedNode(null);
    setHighlightedNode(null);
    setPathNodes([null, null]);
    setCurrentPath(null);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const graphData = getGraphData();

    // Filter nodes and links
    // Remove persons (shown in detail panels) and concepts (shown as regions)
    // BUT keep bitcoin-protocol as a visible centerpiece node
    let filteredNodes = [...graphData.nodes].filter(n =>
      n.type !== 'person' &&
      (n.type !== 'concept' || n.id === 'bitcoin-protocol')
    );
    const nodeIds = new Set(filteredNodes.map(n => n.id));

    // Helper to get ID from link source/target (can be string or object)
    const getLinkId = (node: any): string => typeof node === 'string' ? node : node.id;

    let filteredLinks = [...graphData.links].filter(l =>
      nodeIds.has(getLinkId(l.source)) && nodeIds.has(getLinkId(l.target))
    );

    // Filter by entity type
    if (filterType !== 'all') {
      filteredNodes = graphData.nodes.filter(n => n.type === filterType);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = graphData.links.filter(l => nodeIds.has(getLinkId(l.source)) && nodeIds.has(getLinkId(l.target)));
    }

    // Filter by edge type
    if (filterEdgeType !== 'all') {
      filteredLinks = filteredLinks.filter(l => l.edgeType === filterEdgeType);
      const linkedNodeIds = new Set<string>();
      filteredLinks.forEach(l => {
        linkedNodeIds.add(getLinkId(l.source));
        linkedNodeIds.add(getLinkId(l.target));
      });
      filteredNodes = filteredNodes.filter(n => linkedNodeIds.has(n.id));
    }

    // Filter by force direction
    if (filterForceDirection !== 'all') {
      filteredLinks = filteredLinks.filter(l => {
        const force = getForceDirection(getLinkId(l.source), getLinkId(l.target));
        return force === filterForceDirection;
      });
      const linkedNodeIds = new Set<string>();
      filteredLinks.forEach(l => {
        linkedNodeIds.add(getLinkId(l.source));
        linkedNodeIds.add(getLinkId(l.target));
      });
      filteredNodes = filteredNodes.filter(n => linkedNodeIds.has(n.id));
    }

    // Group nodes by score ranges for radial positioning
    const scoreRanges = [
      { min: 80, max: 100, nodes: [] as typeof filteredNodes },
      { min: 60, max: 79, nodes: [] as typeof filteredNodes },
      { min: 40, max: 59, nodes: [] as typeof filteredNodes },
      { min: 20, max: 39, nodes: [] as typeof filteredNodes },
      { min: 0, max: 19, nodes: [] as typeof filteredNodes },
    ];

    filteredNodes.forEach(node => {
      const entity = entities.find(e => e.id === node.id);
      const score = entity?.decentralizationScore ?? getDefaultScore(node.type);
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);
      if (range) range.nodes.push(node);
    });

    // Assign initial positions based on radial layout
    filteredNodes.forEach(node => {
      const entity = entities.find(e => e.id === node.id);
      const score = entity?.decentralizationScore ?? getDefaultScore(node.type);
      const range = scoreRanges.find(r => score >= r.min && score <= r.max);

      if (range) {
        const indexInRing = range.nodes.indexOf(node);
        const pos = getRadialPosition(score, centerX, centerY, indexInRing, range.nodes.length);
        (node as any).x = pos.x;
        (node as any).y = pos.y;
      }

      // Bitcoin is positioned by radial force at radius 70px (not pinned to exact center)
      // This prevents it from being inside hostile region hulls
    });

    // Create container group for zoom
    const g = svg.append('g');

    // Get concept entities for region rendering
    const conceptEntities = entities.filter(e => e.type === 'concept' && e.regionStyle);

    // Create regions layer (behind everything else for z-order)
    const regionsGroup = g.append('g').attr('class', 'concept-regions');

    // Helper function to expand polygon for padding
    function expandPolygon(points: [number, number][], padding: number): [number, number][] {
      if (points.length < 3) return points;
      const centroid = points.reduce(
        (acc, p) => [acc[0] + p[0] / points.length, acc[1] + p[1] / points.length],
        [0, 0] as [number, number]
      );
      return points.map(p => {
        const dx = p[0] - centroid[0];
        const dy = p[1] - centroid[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return p;
        return [p[0] + (dx / len) * padding, p[1] + (dy / len) * padding] as [number, number];
      });
    }

    // Create region paths for each concept
    const regionData = conceptEntities.map(concept => ({
      id: concept.id,
      name: concept.name,
      style: concept.regionStyle as RegionStyle,
      memberIds: concept.connections.map(c => c.targetId),
      score: concept.decentralizationScore || 50,
      // Calculate size for sorting (number of members)
      size: concept.connections.length,
    }));

    // Sort regions by size - larger regions first (will be rendered underneath)
    // Smaller regions rendered last will be on top and receive hover events first
    const sortedRegionData = regionData.sort((a, b) => b.size - a.size);

    const regions = regionsGroup.selectAll('g.region')
      .data(sortedRegionData)
      .join('g')
      .attr('class', 'region')
      .style('mix-blend-mode', 'screen')
      .style('cursor', 'pointer');

    regions.append('path')
      .attr('class', 'region-hull')
      .attr('fill', d => d.style.color)
      .attr('fill-opacity', 0)
      .attr('stroke', d => d.style.color)
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')
      .style('pointer-events', 'all'); // Ensure regions can receive clicks

    regions.append('text')
      .attr('class', 'region-label')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0)
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .style('pointer-events', 'none')
      .style('text-transform', 'uppercase')
      .style('letter-spacing', '1px')
      .style('text-shadow', '0 0 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.8)')
      .text(d => d.name);

    regions.append('text')
      .attr('class', 'region-score')
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 6px rgba(0,0,0,0.8)')
      .text(d => `Score: ${d.score}`);

    // Add hover interactions to regions
    regions
      .on('mouseenter', function() {
        const region = d3.select(this);
        region.select('.region-hull')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.3)
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 3);
        region.select('.region-label')
          .transition()
          .duration(200)
          .attr('fill-opacity', 1);
        region.select('.region-score')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0.8);
      })
      .on('mouseleave', function() {
        const region = d3.select(this);
        region.select('.region-hull')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 2);
        region.select('.region-label')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0);
        region.select('.region-score')
          .transition()
          .duration(200)
          .attr('fill-opacity', 0);
      })
      .on('click', function(event, d: any) {
        event.stopPropagation();
        // Find the concept entity and open modal
        const conceptEntity = entities.find(e => e.id === d.id);
        if (conceptEntity) {
          setModalEntity(conceptEntity);
        }
      });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Click on background to clear highlighting
    svg.on('click', () => {
      setHighlightedNode(null);
      setSelectedNode(null);
      setEdgeTooltipData(null);
    });

    // Initialize node positions around a circle based on their score
    // This gives the simulation a good starting point for even distribution
    filteredNodes.forEach((node: any, i: number) => {
      const entity = entities.find(e => e.id === node.id);
      const score = entity?.decentralizationScore ?? getDefaultScore(node.type);
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      const maxRadius = 350;
      const minRadius = 30;
      const radius = minRadius + (maxRadius - minRadius) * (1 - score / 100);
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });

    // Create simulation with radial forces
    setIsLoading(true);
    const simulation = d3.forceSimulation(filteredNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(80)
        .strength(0.3))
      .force('charge', d3.forceManyBody().strength(-300)) // Increased from -150 to spread nodes more
      .force('radial', d3.forceRadial((d: any) => {
        const entity = entities.find(e => e.id === d.id);
        const score = entity?.decentralizationScore ?? getDefaultScore(d.type);
        // Higher score = closer to center
        const maxRadius = 350;
        const minRadius = 30;

        // Special case: Bitcoin gets a small radius (70px) to avoid being inside hostile region hulls
        if (d.id === 'bitcoin-protocol') {
          return 70;
        }

        return minRadius + (maxRadius - minRadius) * (1 - score / 100);
      }, centerX, centerY).strength(0.8))
      // Add weak X/Y forces to improve angular distribution
      .force('x', d3.forceX(centerX).strength(0.05))
      .force('y', d3.forceY(centerY).strength(0.05))
      .force('collision', d3.forceCollide().radius((d: any) => {
        // Bitcoin Protocol has larger collision radius
        if (d.id === 'bitcoin-protocol') return 33;
        const entity = entities.find(e => e.id === d.id);
        return entity ? getNodeSize(entity) + 5 : 20;
      }))
      .alphaDecay(0.02)
      .velocityDecay(0.4);

    simulationRef.current = simulation;

    // Set loading to false when simulation stabilizes
    simulation.on('end', () => {
      setIsLoading(false);
    });
    const loadingTimeout = setTimeout(() => setIsLoading(false), 2000);

    // Create links container
    const linksGroup = g.append('g').attr('class', 'links');

    // Create invisible wider hit areas for easier clicking
    const linkHitAreas = linksGroup.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 15)
      .attr('cursor', 'pointer')
      .on('click', function(event, d: any) {
        event.stopPropagation();
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        setSelectedEdge({
          sourceId,
          targetId,
          relationship: d.relationship,
          explanation: d.explanation,
          edgeType: d.edgeType,
        });
        setEdgeTooltipData(null);
      })
      .on('mouseover', function(event, d: any) {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        const force = getForceDirection(sourceId, targetId);

        // Highlight the visible link
        linksGroup.selectAll('line.visible-link')
          .filter((ld: any) => {
            const lsId = typeof ld.source === 'string' ? ld.source : ld.source.id;
            const ltId = typeof ld.target === 'string' ? ld.target : ld.target.id;
            return (lsId === sourceId && ltId === targetId) || (lsId === targetId && ltId === sourceId);
          })
          .attr('stroke-opacity', 1)
          .attr('stroke-width', (ld: any) => {
            const f = getForceDirection(
              typeof ld.source === 'string' ? ld.source : ld.source.id,
              typeof ld.target === 'string' ? ld.target : ld.target.id
            );
            return (f === 'centralizing' ? 3 + (ld.strength || 0.5) * 2 : f === 'decentralizing' ? 1.5 + (ld.strength || 0.5) : 2 + (ld.strength || 0.5)) + 2;
          });

        setEdgeTooltipData({
          x: event.pageX,
          y: event.pageY,
          source: entityNames.get(sourceId) || sourceId,
          target: entityNames.get(targetId) || targetId,
          edgeType: d.edgeType,
          force: force === 'centralizing' ? 'Pro-Centralization' : force === 'decentralizing' ? 'Pro-Decentralization' : 'Neutral',
        });
      })
      .on('mousemove', function(event) {
        setEdgeTooltipData(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null);
      })
      .on('mouseout', function(event, d: any) {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;

        // Reset visible link style
        linksGroup.selectAll('line.visible-link')
          .filter((ld: any) => {
            const lsId = typeof ld.source === 'string' ? ld.source : ld.source.id;
            const ltId = typeof ld.target === 'string' ? ld.target : ld.target.id;
            return (lsId === sourceId && ltId === targetId) || (lsId === targetId && ltId === sourceId);
          })
          .attr('stroke-opacity', 0.1)
          .attr('stroke-width', (ld: any) => {
            const f = getForceDirection(
              typeof ld.source === 'string' ? ld.source : ld.source.id,
              typeof ld.target === 'string' ? ld.target : ld.target.id
            );
            return f === 'centralizing' ? 3 + (ld.strength || 0.5) * 2 : f === 'decentralizing' ? 1.5 + (ld.strength || 0.5) : 2 + (ld.strength || 0.5);
          });

        setEdgeTooltipData(null);
      });

    // Create visible links with FORCE DIRECTION colors (not edge type colors)
    const link = linksGroup.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('class', 'visible-link')
      .attr('stroke', (d: any) => {
        const force = getForceDirection(d.source as string || d.source.id, d.target as string || d.target.id);
        return FORCE_COLORS[force];
      })
      .attr('stroke-opacity', 0.1)
      .attr('stroke-width', (d: any) => {
        // Thicker lines for connections between centralized entities
        const force = getForceDirection(d.source as string || d.source.id, d.target as string || d.target.id);
        if (force === 'centralizing') return 3 + (d.strength || 0.5) * 2;
        if (force === 'decentralizing') return 1.5 + (d.strength || 0.5);
        return 2 + (d.strength || 0.5);
      })
      .style('pointer-events', 'none'); // Let hit areas handle events

    // Create node groups with a wrapper for z-order control
    const nodesGroup = g.append('g').attr('class', 'nodes');
    const node = nodesGroup
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          // Prevent dragging Bitcoin - it should stay at its radial force position
          if (d.id !== 'bitcoin-protocol') {
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on('drag', (event, d) => {
          // Prevent dragging Bitcoin Protocol
          if (d.id === 'bitcoin-protocol') return;
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          // Release drag constraints (Bitcoin never had them set)
          d.fx = null;
          d.fy = null;
        }));

    // Add circles to nodes - colored by DECENTRALIZATION SCORE (red=threat, green=ally)
    node.append('circle')
      .attr('r', (d: any) => {
        // Bitcoin Protocol gets larger size
        if (d.id === 'bitcoin-protocol') return 28;
        const entity = entities.find(e => e.id === d.id);
        return entity ? getNodeSize(entity) : 12;
      })
      .attr('fill', (d: any) => {
        // Bitcoin Protocol is 100% green
        if (d.id === 'bitcoin-protocol') return '#22c55e';
        const entity = entities.find(e => e.id === d.id);
        if (entity) {
          return getNodeColor(entity);
        }
        const score = getDefaultScore(d.type);
        return getScoreColor(score);
      })
      .attr('stroke', (d: any) => {
        // Bitcoin Protocol gets special golden border
        if (d.id === 'bitcoin-protocol') return '#f59e0b';
        return '#1a1a24';
      })
      .attr('stroke-width', (d: any) => d.id === 'bitcoin-protocol' ? 4 : 2)
      .on('click', (event, d: any) => {
        event.stopPropagation();
        // Handle capture path mode
        if (pathNodes[0] === null || pathNodes[1] === null) {
          if (!pathNodes[0]) {
            handlePathNodeSelect(d.id, 0);
          } else if (!pathNodes[1] && d.id !== pathNodes[0]) {
            handlePathNodeSelect(d.id, 1);
          }
        } else {
          // Normal selection mode - highlight ego network
          setHighlightedNode(d.id);
          setSelectedNode(d.id);
        }
      })
      .on('mouseover', function(event, d: any) {
        const currentNode = d3.select(this);
        currentNode
          .attr('stroke', '#fff')
          .attr('stroke-width', 3)
          .style('filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.5))');

        // Highlight connected edges
        linksGroup.selectAll('line.visible-link')
          .transition()
          .duration(200)
          .attr('stroke-opacity', (ld: any) => {
            const sourceId = typeof ld.source === 'string' ? ld.source : ld.source.id;
            const targetId = typeof ld.target === 'string' ? ld.target : ld.target.id;
            return (sourceId === d.id || targetId === d.id) ? 0.8 : 0.05;
          });

        // Highlight connected nodes
        const connectedNodeIds = new Set<string>();
        filteredLinks.forEach((link: any) => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          if (sourceId === d.id) connectedNodeIds.add(targetId);
          if (targetId === d.id) connectedNodeIds.add(sourceId);
        });

        node.selectAll('circle')
          .transition()
          .duration(200)
          .attr('opacity', (nd: any) => nd.id === d.id || connectedNodeIds.has(nd.id) ? 1 : 0.3);

        node.selectAll('text')
          .transition()
          .duration(200)
          .attr('opacity', (nd: any) => nd.id === d.id || connectedNodeIds.has(nd.id) ? 1 : 0.3);

        const entity = entities.find(e => e.id === d.id);
        if (entity) {
          setTooltipData({
            x: event.pageX,
            y: event.pageY,
            entity
          });
        }
      })
      .on('mousemove', function(event) {
        setTooltipData(prev => prev ? { ...prev, x: event.pageX, y: event.pageY } : null);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this)
          .attr('stroke', d.id === 'bitcoin-protocol' ? '#f59e0b' : '#1a1a24')
          .attr('stroke-width', d.id === 'bitcoin-protocol' ? 4 : 2)
          .style('filter', 'none');

        // Reset all edges
        linksGroup.selectAll('line.visible-link')
          .transition()
          .duration(200)
          .attr('stroke-opacity', 0.1);

        // Reset all nodes
        node.selectAll('circle')
          .transition()
          .duration(200)
          .attr('opacity', 1);

        node.selectAll('text')
          .transition()
          .duration(200)
          .attr('opacity', 1);

        setTooltipData(null);
      })
      .on('dblclick', (event, d: any) => {
        event.stopPropagation();
        const entity = entities.find(e => e.id === d.id);
        if (entity) {
          setModalEntity(entity);
        }
      });

    // Add labels
    node.append('text')
      .text((d: any) => d.name)
      .attr('x', 0)
      .attr('y', (d: any) => {
        // Bitcoin Protocol has larger node size
        if (d.id === 'bitcoin-protocol') return -36;
        const entity = entities.find(e => e.id === d.id);
        const size = entity ? getNodeSize(entity) : 12;
        return -(size + 4);
      })
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => d.id === 'bitcoin-protocol' ? '#22c55e' : '#a0a0a0')
      .attr('font-size', (d: any) => d.id === 'bitcoin-protocol' ? '14px' : '10px')
      .attr('font-weight', (d: any) => d.id === 'bitcoin-protocol' ? 'bold' : 'normal')
      .style('pointer-events', 'none');

    // Raise nodes to top of z-order for pointer events - nodes have priority over regions
    nodesGroup.raise();

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkHitAreas
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Update region hulls
      regions.each(function(regionDatum: any) {
        const region = d3.select(this);
        const memberPositions: [number, number][] = [];

        regionDatum.memberIds.forEach((memberId: string) => {
          const memberNode = filteredNodes.find((n: any) => n.id === memberId);
          if (memberNode && (memberNode as any).x !== undefined && (memberNode as any).y !== undefined) {
            memberPositions.push([(memberNode as any).x, (memberNode as any).y]);
          }
        });

        if (memberPositions.length >= 3) {
          const hull = d3.polygonHull(memberPositions);
          if (hull) {
            // Bitcoin is now positioned at radius 70px to stay outside hostile region hulls
            const expansionPadding = 50;

            const expandedHull = expandPolygon(hull, expansionPadding);
            const lineGenerator = d3.line<[number, number]>()
              .x(d => d[0])
              .y(d => d[1])
              .curve(d3.curveCardinalClosed.tension(0.75));

            region.select('.region-hull').attr('d', lineGenerator(expandedHull));

            // Calculate centroid for label
            const centroid = memberPositions.reduce(
              (acc, p) => [acc[0] + p[0] / memberPositions.length, acc[1] + p[1] / memberPositions.length],
              [0, 0]
            );
            region.select('.region-label').attr('x', centroid[0]).attr('y', centroid[1] - 12);
            region.select('.region-score').attr('x', centroid[0]).attr('y', centroid[1] + 6);
          }
        } else if (memberPositions.length > 0) {
          // For fewer than 3 points, draw a circle
          const centroid = memberPositions.reduce(
            (acc, p) => [acc[0] + p[0] / memberPositions.length, acc[1] + p[1] / memberPositions.length],
            [0, 0]
          );
          // Create a circular path
          const r = 70;
          const circlePoints: [number, number][] = [];
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            circlePoints.push([centroid[0] + r * Math.cos(angle), centroid[1] + r * Math.sin(angle)]);
          }
          const lineGenerator = d3.line<[number, number]>()
            .x(d => d[0])
            .y(d => d[1])
            .curve(d3.curveCardinalClosed.tension(0.75));

          region.select('.region-hull').attr('d', lineGenerator(circlePoints));
          region.select('.region-label').attr('x', centroid[0]).attr('y', centroid[1] - 12);
          region.select('.region-score').attr('x', centroid[0]).attr('y', centroid[1] + 6);
        }
      });
    });

    // Initial zoom to show ~3 rings with Bitcoin centered
    const initialScale = 0.85;
    svg.call(zoom.transform, d3.zoomIdentity.translate(width * 0.075, height * 0.075).scale(initialScale));

    return () => {
      simulation.stop();
      clearTimeout(loadingTimeout);
    };
  }, [filterType, filterEdgeType, filterForceDirection, pathNodes, handlePathNodeSelect, entityNames]);

  // Path highlighting effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    if (currentPath?.found && currentPath.path.length > 1) {
      const pathEdgeKeys = new Set<string>();
      for (let i = 0; i < currentPath.path.length - 1; i++) {
        const key1 = `${currentPath.path[i]}-${currentPath.path[i + 1]}`;
        const key2 = `${currentPath.path[i + 1]}-${currentPath.path[i]}`;
        pathEdgeKeys.add(key1);
        pathEdgeKeys.add(key2);
      }

      const pathNodeIds = new Set(currentPath.path);

      svg.selectAll('line.visible-link')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('stroke-opacity', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          const key = `${sourceId}-${targetId}`;
          return pathEdgeKeys.has(key) ? 1 : 0.05;
        })
        .attr('stroke-width', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          const key = `${sourceId}-${targetId}`;
          return pathEdgeKeys.has(key) ? 5 : 1;
        });

      svg.selectAll('circle')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.05);

      svg.selectAll('text')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.05);

      // Dim regions during path view
      svg.selectAll('.region')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 0.2);

    } else {
      svg.selectAll('line.visible-link')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('stroke-opacity', 0.1);

      svg.selectAll('circle')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);

      svg.selectAll('text')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);

      svg.selectAll('.region')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);
    }
  }, [currentPath]);

  // Ego network highlighting effect
  useEffect(() => {
    if (!svgRef.current || currentPath?.found) return;

    const svg = d3.select(svgRef.current);

    if (highlightedNode) {
      const entity = entities.find(e => e.id === highlightedNode);
      if (!entity) return;

      const connectedIds = new Set(entity.connections.map(c => c.targetId));
      connectedIds.add(highlightedNode);

      svg.selectAll('circle')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', (d: any) => connectedIds.has(d.id) ? 1 : 0.12);

      svg.selectAll('text')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', (d: any) => connectedIds.has(d.id) ? 1 : 0.12);

      svg.selectAll('line.visible-link')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('stroke-opacity', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          return (sourceId === highlightedNode || targetId === highlightedNode) ? 1 : 0.05;
        });

      // Dim concept regions too
      svg.selectAll('.region')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 0.3);
    } else {
      svg.selectAll('circle')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);

      svg.selectAll('text')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);

      svg.selectAll('line.visible-link')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('stroke-opacity', 0.1);

      svg.selectAll('.region')
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr('opacity', 1);
    }
  }, [highlightedNode, currentPath]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedEntity = selectedNode ? entities.find(e => e.id === selectedNode) : null;
  const selectedForceAnalysis = selectedEntity ? getForceAnalysis(selectedEntity) : null;
  const graphData = getGraphData();

  // Calculate stats
  const stats = useMemo(() => {
    const scores = entities.map(e => e.decentralizationScore ?? getDefaultScore(e.type));
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Count force directions
    let centralizing = 0;
    let neutral = 0;
    let decentralizing = 0;

    graphData.links.forEach(link => {
      const force = getForceDirection(link.source as string, link.target as string);
      if (force === 'centralizing') centralizing++;
      else if (force === 'neutral') neutral++;
      else decentralizing++;
    });

    return { avgScore, centralizing, neutral, decentralizing };
  }, [graphData.links]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Swords size={20} className="text-red-500" />
              Battlefield: The War for Decentralization
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Bitcoin is surrounded. Red edges = attacks. Green = defense.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--text-secondary)]">{entities.length} entities</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-red-400">{stats.centralizing} attacks</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-green-400">{stats.decentralizing} defenses</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-yellow-400">{stats.neutral} neutral</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-orange-400">Avg: {stats.avgScore}/100</span>
          </div>
          {/* Entity Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">Entities:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EntityType | 'all')}
              className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm px-3 py-1.5 rounded border border-[var(--border)] outline-none"
            >
              <option value="all">All Types</option>
              <option value="person">People</option>
              <option value="organization">Organizations</option>
              <option value="stablecoin">Stablecoins</option>
              <option value="government">Government</option>
              <option value="concept">Concepts</option>
              <option value="event">Events</option>
            </select>
          </div>
        </div>

        {/* Edge Type Filter */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-sm text-[var(--text-muted)]">Connection Type:</span>
          <button
            onClick={() => setFilterEdgeType('all')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterEdgeType === 'all'
                ? 'bg-[var(--text-muted)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            All
          </button>
          {ALL_EDGE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilterEdgeType(type)}
              className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1.5 ${
                filterEdgeType === type
                  ? 'text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
              style={{
                backgroundColor: filterEdgeType === type ? EDGE_COLORS[type] : undefined,
              }}
            >
              {EDGE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Force Direction Filter - NEW */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--text-muted)]">Force Direction:</span>
          <button
            onClick={() => setFilterForceDirection('all')}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              filterForceDirection === 'all'
                ? 'bg-[var(--text-muted)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterForceDirection('centralizing')}
            className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1.5 ${
              filterForceDirection === 'centralizing'
                ? 'bg-red-500 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Pro-Centralization
          </button>
          <button
            onClick={() => setFilterForceDirection('neutral')}
            className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1.5 ${
              filterForceDirection === 'neutral'
                ? 'bg-yellow-500 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Neutral/Mixed
          </button>
          <button
            onClick={() => setFilterForceDirection('decentralizing')}
            className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1.5 ${
              filterForceDirection === 'decentralizing'
                ? 'bg-green-500 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Pro-Decentralization
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">Node Color (Score):</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(0, 80%, 50%)' }} />
              <span className="text-xs text-red-400">0-30 Threat</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(40, 80%, 50%)' }} />
              <span className="text-xs text-orange-400">30-50 Caution</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(60, 80%, 50%)' }} />
              <span className="text-xs text-yellow-400">50-70 Mixed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(120, 80%, 50%)' }} />
              <span className="text-xs text-green-400">70+ Ally</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)]">Edge Color = Force:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-1 rounded bg-red-500" />
              <span className="text-xs text-red-400">Attack</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-1 rounded bg-yellow-500" />
              <span className="text-xs text-yellow-400">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-1 rounded bg-green-500" />
              <span className="text-xs text-green-400">Defense</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">Node Size = Institutional Power</span>
          </div>
        </div>
      </div>

      {/* Mobile Warning */}
      {isMobile && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 px-4 py-2 text-center">
          <span className="text-yellow-400 text-sm">
            Best viewed on desktop for full interactive experience
          </span>
        </div>
      )}

      {/* Graph Container */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          className={`w-full h-full bg-[var(--bg-primary)] transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={48} className="animate-spin text-[var(--accent)]" />
              <span className="text-[var(--text-muted)]">Building battlefield...</span>
            </div>
          </div>
        )}

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="absolute top-4 left-4 z-10 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors shadow-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw size={16} />
          Center on Bitcoin
        </button>

        {/* Search Input */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-80">
          <div className="relative">
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent text-[var(--text-primary)] text-sm outline-none flex-1 placeholder:text-[var(--text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                {searchResults.map((entity) => {
                  const score = entity.decentralizationScore ?? getDefaultScore(entity.type);
                  const threatLevel = score < 30 ? 'CRITICAL' : score < 50 ? 'HIGH' : score < 70 ? 'MODERATE' : 'LOW';
                  return (
                    <button
                      key={entity.id}
                      onClick={() => zoomToNode(entity.id)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getScoreColor(score) }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-[var(--text-primary)] truncate">
                          {entity.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {entity.type} • Score: {score} • Threat: {threatLevel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Hover Tooltip - Enhanced with force analysis and threat level */}
        {tooltipData && (
          <div
            className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 shadow-xl pointer-events-none max-w-xs"
            style={{ left: tooltipData.x + 15, top: tooltipData.y + 15 }}
          >
            {(() => {
              const score = tooltipData.entity.decentralizationScore ?? getDefaultScore(tooltipData.entity.type);
              const threatLevel = score < 30 ? 'CRITICAL' : score < 50 ? 'HIGH' : score < 70 ? 'MODERATE' : 'LOW';
              const threatColor = score < 30 ? 'text-red-400' : score < 50 ? 'text-orange-400' : score < 70 ? 'text-yellow-400' : 'text-green-400';
              const analysis = getForceAnalysis(tooltipData.entity);
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-[var(--text-primary)]">{tooltipData.entity.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                      {tooltipData.entity.type}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Score:</span>
                      <span style={{ color: getScoreColor(score) }}>
                        {score}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Threat Level:</span>
                      <span className={`font-bold ${threatColor}`}>
                        {threatLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Connections:</span>
                      <span className="text-[var(--text-secondary)]">
                        {tooltipData.entity.connections.length}
                        (<span className="text-red-400">{analysis.centralizing}</span> /
                        <span className="text-yellow-400">{analysis.neutral}</span> /
                        <span className="text-green-400">{analysis.decentralizing}</span>)
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">Net Force:</span>
                      <span className={analysis.netForce < 0 ? 'text-red-400' : analysis.netForce > 0 ? 'text-green-400' : 'text-yellow-400'}>
                        {analysis.netForce} ({analysis.netLabel})
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Edge Hover Tooltip */}
        {edgeTooltipData && (
          <div
            className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 shadow-xl pointer-events-none max-w-xs"
            style={{ left: edgeTooltipData.x + 15, top: edgeTooltipData.y + 15 }}
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Type:</span>
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: EDGE_COLORS[edgeTooltipData.edgeType] + '30',
                    color: EDGE_COLORS[edgeTooltipData.edgeType]
                  }}
                >
                  {EDGE_LABELS[edgeTooltipData.edgeType]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Force Direction:</span>
                <span className={
                  edgeTooltipData.force === 'Pro-Centralization' ? 'text-red-400 font-medium' :
                  edgeTooltipData.force === 'Pro-Decentralization' ? 'text-green-400 font-medium' :
                  'text-yellow-400 font-medium'
                }>
                  {edgeTooltipData.force}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                {edgeTooltipData.source} ↔ {edgeTooltipData.target}
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Panel - Enhanced with force analysis */}
        {selectedEntity && (
          <div className="absolute top-4 right-4 w-80 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 shadow-xl max-h-[80vh] overflow-y-auto">
            {(() => {
              const score = selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type);
              const threatLevel = score < 30 ? 'CRITICAL' : score < 50 ? 'HIGH' : score < 70 ? 'MODERATE' : 'LOW';
              const threatColor = score < 30 ? 'text-red-400 bg-red-500/20' : score < 50 ? 'text-orange-400 bg-orange-500/20' : score < 70 ? 'text-yellow-400 bg-yellow-500/20' : 'text-green-400 bg-green-500/20';
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getScoreColor(score) }}
                      />
                      <span className="text-xs text-[var(--text-muted)] uppercase">
                        {selectedEntity.type}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${threatColor}`}>
                        {threatLevel}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      ×
                    </button>
                  </div>
                </>
              );
            })()}

            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {selectedEntity.name}
            </h3>

            {/* Score Breakdown or Simple Score */}
            {selectedEntity.scoreBreakdown ? (
              <div className="mb-3 p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <ScoreBreakdown
                  breakdown={selectedEntity.scoreBreakdown}
                  overall={selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type)}
                  compact
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-[var(--bg-tertiary)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: getDecentralizationColor(selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type)) + '30',
                    color: getDecentralizationColor(selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type))
                  }}
                >
                  {selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type)}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[var(--text-muted)]">Decentralization Score</div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: getDecentralizationColor(selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type)) }}
                  >
                    {getDecentralizationLabel(selectedEntity.decentralizationScore ?? getDefaultScore(selectedEntity.type))}
                  </div>
                </div>
              </div>
            )}

            {/* Force Analysis - NEW */}
            {selectedForceAnalysis && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
                <h4 className="text-xs text-[var(--text-muted)] uppercase mb-2 flex items-center gap-1">
                  <Swords size={12} />
                  Force Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Centralization pressure:</span>
                    <span className="text-red-400 font-medium">{selectedForceAnalysis.centralizing} red connections</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Decentralization support:</span>
                    <span className="text-green-400 font-medium">{selectedForceAnalysis.decentralizing} green connections</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Neutral:</span>
                    <span className="text-yellow-400 font-medium">{selectedForceAnalysis.neutral} yellow connections</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Net force:</span>
                    <span className={`font-bold ${
                      selectedForceAnalysis.netForce < 0 ? 'text-red-400' :
                      selectedForceAnalysis.netForce > 0 ? 'text-green-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedForceAnalysis.netForce} ({selectedForceAnalysis.netLabel})
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {selectedEntity.description}
            </p>

            {/* Path to Center */}
            {selectedEntity.id !== 'bitcoin-protocol' && (
              <div className="mb-4">
                <PathToCenter
                  entityId={selectedEntity.id}
                  onNavigateToEntity={(entityId) => {
                    setSelectedNode(entityId);
                    setHighlightedNode(entityId);
                  }}
                  compact
                />
              </div>
            )}

            <div>
              <h4 className="text-xs text-[var(--text-muted)] uppercase mb-2">
                Connections ({selectedEntity.connections.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedEntity.connections.map((conn, i) => {
                  const edgeType = classifyEdgeType(conn.relationship);
                  const force = getForceDirection(selectedEntity.id, conn.targetId);
                  return (
                    <div
                      key={i}
                      className="text-sm text-[var(--text-secondary)] flex items-start gap-2 cursor-pointer hover:text-[var(--text-primary)] p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
                      onClick={() => setSelectedNode(conn.targetId)}
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: FORCE_COLORS[force] }}
                        title={force === 'centralizing' ? 'Pro-Centralization' : force === 'decentralizing' ? 'Pro-Decentralization' : 'Neutral'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{conn.targetName}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: EDGE_COLORS[edgeType] + '30',
                              color: EDGE_COLORS[edgeType]
                            }}
                          >
                            {EDGE_LABELS[edgeType]}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] block truncate">
                          {conn.relationship}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Capture Path Panel */}
        <CapturePath
          graphData={graphData}
          selectedNodes={pathNodes}
          onSelectNode={handlePathNodeSelect}
          onPathFound={handlePathFound}
          entityNames={entityNames}
          entities={entities}
        />

        {/* Edge Detail Panel */}
        {selectedEdge && (() => {
          const sourceEntity = entities.find(e => e.id === selectedEdge.sourceId);
          const targetEntity = entities.find(e => e.id === selectedEdge.targetId);
          if (!sourceEntity || !targetEntity) return null;
          return (
            <EdgeDetailPanel
              sourceEntity={sourceEntity}
              targetEntity={targetEntity}
              relationship={selectedEdge.relationship}
              explanation={selectedEdge.explanation}
              edgeType={selectedEdge.edgeType}
              onClose={() => setSelectedEdge(null)}
              onNavigateToEntity={(entityId) => {
                setSelectedEdge(null);
                const entity = entities.find(e => e.id === entityId);
                if (entity) setModalEntity(entity);
              }}
            />
          );
        })()}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)]/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          Drag to pan • Scroll to zoom • Click edges/nodes • Double-click for full info
        </div>
      </div>

      {/* Entity Detail Modal */}
      {modalEntity && (
        <EntityDetailModal
          entity={modalEntity}
          onClose={() => setModalEntity(null)}
          onNavigateToEntity={(entityId) => {
            const newEntity = entities.find(e => e.id === entityId);
            if (newEntity) setModalEntity(newEntity);
          }}
        />
      )}
    </div>
  );
}
