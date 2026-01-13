'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { entities } from '@/data/entities';
import { getDecentralizationColor, getDecentralizationLabel, getDefaultScore } from '@/lib/scoring';
import type { Entity, EntityType } from '@/types';

const typeLabels: Record<EntityType, string> = {
  person: 'Person',
  organization: 'Organization',
  stablecoin: 'Stablecoin',
  government: 'Government',
  concept: 'Concept',
  event: 'Event',
};

interface SearchResult extends Entity {
  score: number;
  matchType: 'name' | 'description';
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search and sort results
  const results: SearchResult[] = query.trim()
    ? entities
        .filter((e) => {
          const q = query.toLowerCase();
          return (
            e.name.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
          );
        })
        .map((e) => ({
          ...e,
          score: e.decentralizationScore ?? getDefaultScore(e.type),
          matchType: (e.name.toLowerCase().includes(query.toLowerCase())
            ? 'name'
            : 'description') as 'name' | 'description',
        }))
        // Sort by: name matches first, then by score (most centralized first = lowest score)
        .sort((a, b) => {
          // Name matches come first
          if (a.matchType === 'name' && b.matchType !== 'name') return -1;
          if (a.matchType !== 'name' && b.matchType === 'name') return 1;
          // Then sort by score ascending (most centralized/threatening first)
          return a.score - b.score;
        })
        .slice(0, 8) // Limit to 8 results
    : [];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle arrow keys and enter when dropdown is open
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          navigateToEntity(results[selectedIndex].id);
        }
        break;
    }
  };

  // Navigate to entity
  const navigateToEntity = useCallback(
    (entityId: string) => {
      router.push(`/entities?entity=${entityId}`);
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    },
    [router]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-[var(--accent)]/30 text-[var(--accent)]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg border transition-colors ${
          isOpen ? 'border-[var(--accent)]' : 'border-[var(--border)]'
        }`}
      >
        <Search size={16} className="text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search entities... (/)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-xl z-50 overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-3 py-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => {
                  const scoreColor = getDecentralizationColor(result.score);
                  return (
                    <div
                      key={result.id}
                      onClick={() => navigateToEntity(result.id)}
                      className={`px-3 py-2.5 cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? 'bg-[var(--bg-tertiary)]'
                          : 'hover:bg-[var(--bg-tertiary)]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Score indicator dot */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: scoreColor }}
                          title={`Decentralization Score: ${result.score}/100`}
                        />

                        {/* Entity info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {highlightMatch(result.name, query)}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] uppercase flex-shrink-0">
                              {typeLabels[result.type]}
                            </span>
                          </div>
                          {result.matchType === 'description' && (
                            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                              {highlightMatch(result.description, query)}
                            </p>
                          )}
                        </div>

                        {/* Score badge */}
                        <div
                          className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                          style={{
                            backgroundColor: `${scoreColor}20`,
                            color: scoreColor,
                          }}
                        >
                          {result.score}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-3 py-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">↑↓</kbd> navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">Enter</kbd> select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">Esc</kbd> close
                </span>
              </div>
            </>
          ) : (
            <div className="px-3 py-6 text-center text-[var(--text-muted)] text-sm">
              No entities found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
