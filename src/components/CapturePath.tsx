'use client';

import { useState, useEffect } from 'react';
import { X, Route, ArrowRight, Loader2 } from 'lucide-react';
import { findShortestPath, PathResult, PathEdge } from '@/lib/graph/pathfinding';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import type { GraphData, EdgeType } from '@/types';

interface CapturePathProps {
  graphData: GraphData;
  selectedNodes: [string | null, string | null];
  onSelectNode: (nodeId: string | null, slot: 0 | 1) => void;
  onPathFound: (pathResult: PathResult | null) => void;
  entityNames: Map<string, string>;
}

export default function CapturePath({
  graphData,
  selectedNodes,
  onSelectNode,
  onPathFound,
  entityNames,
}: CapturePathProps) {
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate path when both nodes are selected
  useEffect(() => {
    if (selectedNodes[0] && selectedNodes[1]) {
      setIsCalculating(true);

      // Use setTimeout to allow UI to update
      setTimeout(() => {
        const result = findShortestPath(graphData, selectedNodes[0]!, selectedNodes[1]!);
        setPathResult(result);
        onPathFound(result);
        setIsCalculating(false);
      }, 100);
    } else {
      setPathResult(null);
      onPathFound(null);
    }
  }, [selectedNodes, graphData, onPathFound]);

  const handleClear = () => {
    onSelectNode(null, 0);
    onSelectNode(null, 1);
    setPathResult(null);
  };

  const getEntityName = (id: string) => entityNames.get(id) || id;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-[var(--bg-tertiary)] transition-colors shadow-lg"
      >
        <Route size={16} className="text-[var(--accent)]" />
        <span className="text-sm text-[var(--text-primary)]">Capture Path</span>
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 w-80 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Route size={18} className="text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Capture Path</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)]">
        Click two nodes in the graph to find how they connect.
        The path will highlight showing the shortest route between them.
      </div>

      {/* Node Selection */}
      <div className="p-4 space-y-3">
        {/* Node 1 */}
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-bold">
            1
          </span>
          <div className="flex-1">
            {selectedNodes[0] ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">
                  {getEntityName(selectedNodes[0])}
                </span>
                <button
                  onClick={() => onSelectNode(null, 0)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Click first node...</span>
            )}
          </div>
        </div>

        {/* Node 2 */}
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-xs flex items-center justify-center font-bold">
            2
          </span>
          <div className="flex-1">
            {selectedNodes[1] ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">
                  {getEntityName(selectedNodes[1])}
                </span>
                <button
                  onClick={() => onSelectNode(null, 1)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Click second node...</span>
            )}
          </div>
        </div>
      </div>

      {/* Path Result */}
      {isCalculating && (
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-center gap-2 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Calculating path...</span>
        </div>
      )}

      {!isCalculating && pathResult && (
        <div className="border-t border-[var(--border)]">
          {pathResult.found ? (
            <>
              {/* Path Info */}
              <div className="p-4 bg-green-500/10 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 text-green-500">
                  <span className="text-sm font-medium">
                    Path found! {pathResult.distance} hop{pathResult.distance !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Path Visualization */}
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  {pathResult.path.map((nodeId, index) => (
                    <div key={nodeId}>
                      {/* Node */}
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {getEntityName(nodeId)}
                        </span>
                      </div>

                      {/* Edge */}
                      {index < pathResult.edges.length && (
                        <div className="flex items-center gap-2 py-1 pl-4">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: EDGE_COLORS[pathResult.edges[index].edgeType as EdgeType] }}
                          />
                          <ArrowRight size={12} className="text-[var(--text-muted)]" />
                          <span className="text-xs text-[var(--text-muted)]">
                            {pathResult.edges[index].relationship}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${EDGE_COLORS[pathResult.edges[index].edgeType as EdgeType]}20`,
                              color: EDGE_COLORS[pathResult.edges[index].edgeType as EdgeType],
                            }}
                          >
                            {EDGE_LABELS[pathResult.edges[index].edgeType as EdgeType]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-red-500/10 text-red-500 text-sm">
              No path found between these entities.
            </div>
          )}
        </div>
      )}

      {/* Clear Button */}
      {(selectedNodes[0] || selectedNodes[1]) && (
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={handleClear}
            className="w-full py-2 px-4 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-secondary)] rounded-lg transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
