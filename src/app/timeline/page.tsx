'use client';

import { useState } from 'react';
import { timelineEvents, entities } from '@/data/entities';
import { EntityType } from '@/types';

const typeColors: Record<EntityType, string> = {
  person: '#22c55e',
  organization: '#a855f7',
  stablecoin: '#3b82f6',
  government: '#ef4444',
  concept: '#f97316',
  event: '#eab308',
};

export default function TimelinePage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Sort events by date
  const sortedEvents = [...timelineEvents].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const selectedEventData = selectedEvent
    ? timelineEvents.find(e => e.id === selectedEvent)
    : null;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          Timeline
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Key events in the stablecoin ecosystem
        </p>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-[var(--border)]" />

          {/* Events */}
          <div className="space-y-8">
            {sortedEvents.map((event) => {
              const relatedEntities = event.entityIds
                .map(id => entities.find(e => e.id === id))
                .filter(Boolean);

              return (
                <div
                  key={event.id}
                  className="relative pl-12 cursor-pointer group"
                  onClick={() => setSelectedEvent(event.id)}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-2.5 top-1 w-4 h-4 rounded-full border-4 transition-colors ${
                      selectedEvent === event.id
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] group-hover:border-[var(--accent)]'
                    }`}
                  />

                  {/* Content Card */}
                  <div
                    className={`bg-[var(--bg-secondary)] rounded-xl p-5 border transition-colors ${
                      selectedEvent === event.id
                        ? 'border-[var(--accent)]'
                        : 'border-[var(--border)] group-hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {/* Date */}
                    <div className="text-xs text-[var(--text-muted)] mb-2">
                      {formatDate(event.date)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {event.description}
                    </p>

                    {/* Related Entities */}
                    <div className="flex flex-wrap gap-2">
                      {relatedEntities.map((entity) => (
                        <span
                          key={entity!.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs text-[var(--text-secondary)]"
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: typeColors[entity!.type] }}
                          />
                          {entity!.name}
                        </span>
                      ))}
                    </div>

                    {/* Source */}
                    {event.sourceUrl && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Source →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* End marker */}
          <div className="relative pl-12 mt-8">
            <div className="absolute left-2 top-0 w-5 h-5 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border)] flex items-center justify-center">
              <span className="text-[8px] text-[var(--text-muted)]">●</span>
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              More events coming as they happen...
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)] font-semibold">{timelineEvents.length}</span> events tracked
          </div>
          <div className="text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)] font-semibold">
              {new Date(sortedEvents[0]?.date || '').getFullYear()}
            </span>
            {' - '}
            <span className="text-[var(--text-primary)] font-semibold">
              {new Date(sortedEvents[sortedEvents.length - 1]?.date || '').getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
