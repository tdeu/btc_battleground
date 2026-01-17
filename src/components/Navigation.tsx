'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, Users, Clock, BarChart3, Info } from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const navItems = [
  { href: '/network', label: 'Network', icon: Network },
  { href: '/entities', label: 'People & Entities', icon: Users },
  { href: '/timeline', label: 'Timeline', icon: Clock },
  { href: '/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-screen w-16 md:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col z-40">
      {/* Logo */}
      <Link href="/network" className="block p-3 md:p-6 border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
        <h1 className="hidden md:block text-lg font-bold text-[var(--text-primary)] leading-tight">
          Centralization
        </h1>
        <p className="hidden md:block text-sm text-[var(--accent)] font-medium">Observatory</p>
        <p className="hidden md:block text-xs text-[var(--text-muted)] mt-1">Bitcoin + Stablecoins</p>
        {/* Mobile: show just icon */}
        <div className="md:hidden flex items-center justify-center">
          <Network size={24} className="text-[var(--accent)]" />
        </div>
      </Link>

      {/* Global Search - hidden on mobile */}
      <div className="hidden md:block p-4">
        <GlobalSearch />
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-2 md:px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              title={item.label}
            >
              <Icon size={18} />
              <span className="hidden md:inline text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

    </nav>
  );
}
