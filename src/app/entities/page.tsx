'use client';

import { useState } from 'react';
import { entities, classifyEdgeType } from '@/data/entities';
import { EntityType } from '@/types';
import { Search, ChevronRight, ExternalLink } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import EntityDetailModal from '@/components/EntityDetailModal';

const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

const typeLabels: Record<EntityType, string> = {
  person: 'Person',
  organization: 'Organization',
  stablecoin: 'Stablecoin',
  government: 'Government',
  concept: 'Concept',
  event: 'Event',
};

export default function EntitiesPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [modalEntity, setModalEntity] = useState<string | null>(null);

  const filteredEntities = entities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || e.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedEntityData = selectedEntity ? entities.find(e => e.id === selectedEntity) : null;
  const modalEntityData = modalEntity ? entities.find(e => e.id === modalEntity) : null;

  return (
    <div className="h-screen flex">
      {/* List */}
      <div className="w-96 border-r border-[var(--border)] flex flex-col bg-[var(--bg-secondary)]">
        {/* Search & Filter */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)] mb-3">
            <Search size={16} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            >
              All
            </FilterButton>
            {(Object.keys(typeColors) as EntityType[]).map((type) => (
              <FilterButton
                key={type}
                active={filterType === type}
                onClick={() => setFilterType(type)}
                color={typeColors[type]}
              >
                {typeLabels[type]}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => setSelectedEntity(entity.id)}
              className={`p-4 border-b border-[var(--border)] cursor-pointer transition-colors ${
                selectedEntity === entity.id
                  ? 'bg-[var(--bg-tertiary)]'
                  : 'hover:bg-[var(--bg-tertiary)]/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: typeColors[entity.type] }}
                />
                <span className="text-xs text-[var(--text-muted)] uppercase">
                  {typeLabels[entity.type]}
                </span>
              </div>
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                {entity.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">
                {entity.description}
              </p>
              <div className="text-xs text-[var(--text-muted)] mt-2">
                {entity.connections.length} connections
              </div>
            </div>
          ))}

          {filteredEntities.length === 0 && (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No entities found
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          {filteredEntities.length} of {entities.length} entities
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 bg-[var(--bg-primary)] overflow-y-auto">
        {selectedEntityData ? (
          <div className="p-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: typeColors[selectedEntityData.type] }}
                />
                <span className="text-sm text-[var(--text-muted)] uppercase">
                  {typeLabels[selectedEntityData.type]}
                </span>
              </div>
              <button
                onClick={() => setModalEntity(selectedEntity)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--accent)]/90 transition-colors"
              >
                <ExternalLink size={16} />
                Full Details
              </button>
            </div>

            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              {selectedEntityData.name}
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-8">
              {selectedEntityData.description}
            </p>

            {/* Connections */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Connections ({selectedEntityData.connections.length})
              </h2>

              <div className="space-y-2">
                {selectedEntityData.connections.map((conn, i) => {
                  const connectedEntity = entities.find(e => e.id === conn.targetId);
                  const edgeType = classifyEdgeType(conn.relationship);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedEntity(conn.targetId)}
                      className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: EDGE_COLORS[edgeType] }}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {conn.targetName}
                            </p>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${EDGE_COLORS[edgeType]}20`,
                                color: EDGE_COLORS[edgeType],
                              }}
                            >
                              {EDGE_LABELS[edgeType]}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">
                            {conn.relationship}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[var(--text-muted)]" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            Select an entity to view details
          </div>
        )}
      </div>

      {/* Entity Detail Modal */}
      {modalEntityData && (
        <EntityDetailModal
          entity={modalEntityData}
          onClose={() => setModalEntity(null)}
          onNavigateToEntity={(entityId) => {
            setSelectedEntity(entityId);
            setModalEntity(entityId);
          }}
        />
      )}
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  color,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
        active
          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
      }`}
      style={active && color ? { backgroundColor: color, borderColor: color } : {}}
    >
      {children}
    </button>
  );
}
