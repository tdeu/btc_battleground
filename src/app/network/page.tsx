// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { entities, getGraphData, classifyEdgeType } from '@/data/entities';
import { EntityType, EdgeType } from '@/types';
import { EDGE_COLORS, EDGE_LABELS, ALL_EDGE_TYPES } from '@/lib/data';
import { getDefaultScore, getDecentralizationColor, getDecentralizationLabel } from '@/lib/scoring';
import CapturePath from '@/components/CapturePath';
import EntityDetailModal from '@/components/EntityDetailModal';
import { PathResult } from '@/lib/graph/pathfinding';
import { Loader2, RotateCcw, Search, X } from 'lucide-react';
import { Entity } from '@/types';

const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

export default function NetworkPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [filterEdgeType, setFilterEdgeType] = useState<EdgeType | 'all'>('all');

  // Capture Path state
  const [capturePathMode, setCapturePathMode] = useState(false);
  const [pathNodes, setPathNodes] = useState<[string | null, string | null]>([null, null]);
  const [currentPath, setCurrentPath] = useState<PathResult | null>(null);

  // Enhanced interaction state
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [modalEntity, setModalEntity] = useState<Entity | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; entity: typeof entities[0] } | null>(null);
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

  // Zoom to node handler
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

    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));

    setHighlightedNode(nodeId);
    setSelectedNode(nodeId);
    setSearchQuery('');
    setShowSearch(false);
  }, []);

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity.scale(0.8));

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

    const graphData = getGraphData();

    // Filter nodes and links
    let filteredNodes = graphData.nodes;
    let filteredLinks = graphData.links;

    // Filter by entity type
    if (filterType !== 'all') {
      filteredNodes = graphData.nodes.filter(n => n.type === filterType);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = graphData.links.filter(l => nodeIds.has(l.source as string) && nodeIds.has(l.target as string));
    }

    // Filter by edge type
    if (filterEdgeType !== 'all') {
      filteredLinks = filteredLinks.filter(l => l.edgeType === filterEdgeType);
      // Only show nodes that have connections of this type
      const linkedNodeIds = new Set<string>();
      filteredLinks.forEach(l => {
        linkedNodeIds.add(l.source as string);
        linkedNodeIds.add(l.target as string);
      });
      filteredNodes = filteredNodes.filter(n => linkedNodeIds.has(n.id));
    }

    // Create container group for zoom
    const g = svg.append('g');

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
    });

    // Create simulation
    setIsLoading(true);
    const simulation = d3.forceSimulation(filteredNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Set loading to false when simulation stabilizes
    simulation.on('end', () => {
      setIsLoading(false);
    });
    // Fallback timeout in case simulation doesn't fully stabilize
    const loadingTimeout = setTimeout(() => setIsLoading(false), 2000);

    // Create links with edge type colors
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', (d: any) => EDGE_COLORS[d.edgeType as EdgeType] || EDGE_COLORS.other)
      .attr('stroke-opacity', 0.7)
      .attr('stroke-width', (d: any) => 1.5 + (d.strength || 0.5) * 2)
      .attr('stroke-dasharray', (d: any) => d.verified ? 'none' : '4,2');

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles to nodes - colored by decentralization score (red=centralized, green=decentralized)
    node.append('circle')
      .attr('r', (d: any) => 8 + d.connections * 2)
      .attr('fill', (d: any) => {
        const entity = entities.find(e => e.id === d.id);
        const score = entity?.decentralizationScore ?? getDefaultScore(d.type);
        return getDecentralizationColor(score);
      })
      .attr('stroke', '#1a1a24')
      .attr('stroke-width', 2)
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
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 3)
          .style('filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.5))');

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
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#1a1a24')
          .attr('stroke-width', 2)
          .style('filter', 'none');
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
      .attr('y', (d: any) => -(12 + d.connections * 2))
      .attr('text-anchor', 'middle')
      .attr('fill', '#a0a0a0')
      .attr('font-size', '10px')
      .style('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Initial zoom to fit
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));

    return () => {
      simulation.stop();
      clearTimeout(loadingTimeout);
    };
  }, [filterType, filterEdgeType, pathNodes, handlePathNodeSelect]);

  // Path highlighting effect
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    if (currentPath?.found && currentPath.path.length > 1) {
      // Create set of path edge keys for quick lookup
      const pathEdgeKeys = new Set<string>();
      for (let i = 0; i < currentPath.path.length - 1; i++) {
        const key1 = `${currentPath.path[i]}-${currentPath.path[i + 1]}`;
        const key2 = `${currentPath.path[i + 1]}-${currentPath.path[i]}`;
        pathEdgeKeys.add(key1);
        pathEdgeKeys.add(key2);
      }

      const pathNodeIds = new Set(currentPath.path);

      // Update link styles - more dramatic highlighting
      svg.selectAll('line')
        .transition()
        .duration(300)
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

      // Update node styles - more dramatic dimming
      svg.selectAll('circle')
        .transition()
        .duration(300)
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.05);

      svg.selectAll('text')
        .transition()
        .duration(300)
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.05);

    } else {
      // Reset styles when no path
      svg.selectAll('line')
        .attr('stroke-opacity', 0.7)
        .attr('stroke-width', (d: any) => 1.5 + ((d as any).strength || 0.5) * 2);

      svg.selectAll('circle')
        .attr('opacity', 1);

      svg.selectAll('text')
        .attr('opacity', 1);
    }
  }, [currentPath]);

  // Ego network highlighting effect
  useEffect(() => {
    if (!svgRef.current || currentPath?.found) return; // Don't override path highlighting

    const svg = d3.select(svgRef.current);

    if (highlightedNode) {
      const entity = entities.find(e => e.id === highlightedNode);
      if (!entity) return;

      // Get 1-hop connections
      const connectedIds = new Set(entity.connections.map(c => c.targetId));
      connectedIds.add(highlightedNode);

      // Dim non-connected nodes
      svg.selectAll('circle')
        .transition()
        .duration(200)
        .attr('opacity', (d: any) => connectedIds.has(d.id) ? 1 : 0.2);

      svg.selectAll('text')
        .transition()
        .duration(200)
        .attr('opacity', (d: any) => connectedIds.has(d.id) ? 1 : 0.2);

      // Dim non-connected edges
      svg.selectAll('line')
        .transition()
        .duration(200)
        .attr('stroke-opacity', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          return (sourceId === highlightedNode || targetId === highlightedNode) ? 1 : 0.1;
        });
    } else {
      // Reset when no highlighted node
      svg.selectAll('circle')
        .transition()
        .duration(200)
        .attr('opacity', 1);

      svg.selectAll('text')
        .transition()
        .duration(200)
        .attr('opacity', 1);

      svg.selectAll('line')
        .transition()
        .duration(200)
        .attr('stroke-opacity', 0.7);
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
  const graphData = getGraphData();

  // Calculate average decentralization score
  const avgScore = useMemo(() => {
    const scores = entities.map(e => e.decentralizationScore ?? getDefaultScore(e.type));
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Centralization Network</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Visualizing control and capture in stablecoin infrastructure
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
            <span>{entities.length} entities</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>Avg score: <span className="text-[var(--accent)] font-medium">{avgScore}/100</span></span>
          </div>
          {/* Entity Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-muted)]">Filter:</span>
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[var(--text-muted)]">Connections:</span>
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
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: EDGE_COLORS[type] }}
              />
              {EDGE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Decentralization Score Legend */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">Node Color:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400 font-medium">0</span>
            <div
              className="h-2.5 w-40 rounded-full"
              style={{
                background: 'linear-gradient(to right, hsl(0, 80%, 45%), hsl(30, 80%, 45%), hsl(60, 80%, 45%), hsl(90, 80%, 45%), hsl(120, 80%, 45%))'
              }}
            />
            <span className="text-xs text-green-400 font-medium">100</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            <span className="text-red-400">Centralized</span> → <span className="text-green-400">Decentralized</span>
          </span>
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
              <span className="text-[var(--text-muted)]">Building network graph...</span>
            </div>
          </div>
        )}

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="absolute top-4 left-4 z-10 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors shadow-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw size={16} />
          Reset View
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
                  return (
                    <button
                      key={entity.id}
                      onClick={() => zoomToNode(entity.id)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getDecentralizationColor(score) }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-[var(--text-primary)] truncate">
                          {entity.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {entity.type} • Score: {score}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Hover Tooltip */}
        {tooltipData && (
          <div
            className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 shadow-xl pointer-events-none max-w-xs"
            style={{ left: tooltipData.x + 15, top: tooltipData.y + 15 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-[var(--text-primary)]">{tooltipData.entity.name}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: typeColors[tooltipData.entity.type] + '30',
                  color: typeColors[tooltipData.entity.type]
                }}
              >
                {tooltipData.entity.type}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: getDecentralizationColor(tooltipData.entity.decentralizationScore ?? getDefaultScore(tooltipData.entity.type)) + '30',
                  color: getDecentralizationColor(tooltipData.entity.decentralizationScore ?? getDefaultScore(tooltipData.entity.type))
                }}
              >
                Score: {tooltipData.entity.decentralizationScore ?? getDefaultScore(tooltipData.entity.type)}/100
              </div>
              <span className="text-[var(--text-muted)]">
                {tooltipData.entity.connections.length} connections
              </span>
            </div>
          </div>
        )}

        {/* Selected Node Panel */}
        {selectedEntity && (
          <div className="absolute top-4 right-4 w-80 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColors[selectedEntity.type] }}
                />
                <span className="text-xs text-[var(--text-muted)] uppercase">
                  {selectedEntity.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ×
              </button>
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {selectedEntity.name}
            </h3>

            {/* Decentralization Score */}
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

            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {selectedEntity.description}
            </p>

            <div>
              <h4 className="text-xs text-[var(--text-muted)] uppercase mb-2">
                Connections ({selectedEntity.connections.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedEntity.connections.map((conn, i) => {
                  const edgeType = classifyEdgeType(conn.relationship);
                  return (
                    <div
                      key={i}
                      className="text-sm text-[var(--text-secondary)] flex items-start gap-2 cursor-pointer hover:text-[var(--text-primary)] p-1.5 rounded hover:bg-[var(--bg-tertiary)]"
                      onClick={() => setSelectedNode(conn.targetId)}
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: EDGE_COLORS[edgeType] }}
                        title={EDGE_LABELS[edgeType]}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block font-medium">{conn.targetName}</span>
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

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 text-xs text-[var(--text-muted)] bg-[var(--bg-primary)]/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          Drag to pan • Scroll to zoom • Click for details • Double-click for full info
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
