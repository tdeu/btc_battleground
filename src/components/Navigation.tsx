'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Network, Users, Clock, Newspaper, Search, BarChart3, Info } from 'lucide-react';
import { EDGE_COLORS, EDGE_LABELS, ALL_EDGE_TYPES } from '@/lib/data';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/network', label: 'Network', icon: Network },
  { href: '/entities', label: 'People & Entities', icon: Users },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/news', label: 'News Feed', icon: Newspaper },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
          Centralization
        </h1>
        <p className="text-sm text-[var(--accent)] font-medium">Observatory</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Bitcoin + Stablecoins</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border)]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search entities..."
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full"
          />
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-[var(--border)] overflow-y-auto max-h-[40vh]">
        <p className="text-xs text-[var(--text-muted)] mb-3">Entity Types</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-person)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Person</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-org)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Organization</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-stablecoin)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Stablecoin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-gov)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Government</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-concept)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Concept</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--node-event)]"></span>
            <span className="text-xs text-[var(--text-secondary)]">Event</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-3">Edge Types</p>
        <div className="space-y-2">
          {ALL_EDGE_TYPES.map((edgeType) => (
            <div key={edgeType} className="flex items-center gap-2">
              <span
                className="w-4 h-0.5 rounded"
                style={{ backgroundColor: EDGE_COLORS[edgeType] }}
              ></span>
              <span className="text-xs text-[var(--text-secondary)]">{EDGE_LABELS[edgeType]}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
