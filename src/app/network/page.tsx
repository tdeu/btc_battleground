// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { entities, getGraphData, classifyEdgeType } from '@/data/entities';
import { EntityType, EdgeType } from '@/types';
import { EDGE_COLORS, EDGE_LABELS, ALL_EDGE_TYPES } from '@/lib/data';
import CapturePath from '@/components/CapturePath';
import { PathResult } from '@/lib/graph/pathfinding';

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

    // Create simulation
    const simulation = d3.forceSimulation(filteredNodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(filteredLinks)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

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

    // Add circles to nodes
    node.append('circle')
      .attr('r', (d: any) => 8 + d.connections * 2)
      .attr('fill', (d: any) => typeColors[d.type as EntityType])
      .attr('stroke', '#1a1a24')
      .attr('stroke-width', 2)
      .on('click', (event, d: any) => {
        // Handle capture path mode
        if (!pathNodes[0]) {
          handlePathNodeSelect(d.id, 0);
        } else if (!pathNodes[1] && d.id !== pathNodes[0]) {
          handlePathNodeSelect(d.id, 1);
        } else {
          // Normal selection mode
          setSelectedNode(d.id);
        }
      })
      .on('mouseover', function(event, d: any) {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d: any) {
        d3.select(this).attr('stroke', '#1a1a24').attr('stroke-width', 2);
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

      // Update link styles
      svg.selectAll('line')
        .attr('stroke-opacity', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          const key = `${sourceId}-${targetId}`;
          return pathEdgeKeys.has(key) ? 1 : 0.15;
        })
        .attr('stroke-width', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          const key = `${sourceId}-${targetId}`;
          return pathEdgeKeys.has(key) ? 4 : 1;
        });

      // Update node styles
      svg.selectAll('circle')
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.3);

      svg.selectAll('text')
        .attr('opacity', (d: any) => pathNodeIds.has(d.id) ? 1 : 0.3);

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

  const selectedEntity = selectedNode ? entities.find(e => e.id === selectedNode) : null;
  const graphData = getGraphData();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Network Graph</h1>

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
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          className="w-full h-full bg-[var(--bg-primary)]"
        />

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
        />

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-[var(--text-muted)]">
          Drag to pan • Scroll to zoom • Click nodes for details
        </div>
      </div>
    </div>
  );
}
