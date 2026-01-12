// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { entities, getGraphData } from '@/data/entities';
import { EntityType } from '@/types';

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

    if (filterType !== 'all') {
      filteredNodes = graphData.nodes.filter(n => n.type === filterType);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredLinks = graphData.links.filter(l => nodeIds.has(l.source as string) && nodeIds.has(l.target as string));
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

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .join('line')
      .attr('stroke', '#2a2a35')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

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
        setSelectedNode(d.id);
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
  }, [filterType]);

  const selectedEntity = selectedNode ? entities.find(e => e.id === selectedNode) : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-secondary)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Network Graph</h1>

        {/* Filter */}
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
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedEntity.connections.map((conn, i) => (
                  <div
                    key={i}
                    className="text-sm text-[var(--text-secondary)] flex items-center gap-2 cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => setSelectedNode(conn.targetId)}
                  >
                    <span className="text-[var(--text-muted)]">→</span>
                    <span>{conn.targetName}</span>
                    <span className="text-xs text-[var(--text-muted)]">({conn.relationship})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-[var(--text-muted)]">
          Drag to pan • Scroll to zoom • Click nodes for details
        </div>
      </div>
    </div>
  );
}
