import Link from 'next/link';
import { entities, timelineEvents, getStats } from '@/data/entities';
import { Users, Link2, Activity, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { getDecentralizationColor, getDecentralizationLabel, getDefaultScore } from '@/lib/scoring';

export default function Dashboard() {
  const stats = getStats();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Stablecoin Network
        </h1>
        <p className="text-[var(--text-secondary)]">
          Explore the network of actors behind stablecoins and dollar hegemony
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Users size={24} />}
          label="Total Entities"
          value={stats.totalEntities}
          color="var(--node-person)"
        />
        <StatCard
          icon={<Link2 size={24} />}
          label="Connections"
          value={stats.totalConnections}
          color="var(--node-org)"
        />
        <StatCard
          icon={<Activity size={24} />}
          label="Timeline Events"
          value={stats.recentUpdates}
          color="var(--node-event)"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Stablecoins Tracked"
          value={stats.byType.stablecoin || 0}
          color="var(--node-stablecoin)"
        />
      </div>

      {/* Entity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Entities by Type
          </h2>
          <div className="space-y-3">
            <TypeBar label="People" count={stats.byType.person || 0} total={stats.totalEntities} color="var(--node-person)" />
            <TypeBar label="Organizations" count={stats.byType.organization || 0} total={stats.totalEntities} color="var(--node-org)" />
            <TypeBar label="Stablecoins" count={stats.byType.stablecoin || 0} total={stats.totalEntities} color="var(--node-stablecoin)" />
            <TypeBar label="Government" count={stats.byType.government || 0} total={stats.totalEntities} color="var(--node-gov)" />
            <TypeBar label="Concepts" count={stats.byType.concept || 0} total={stats.totalEntities} color="var(--node-concept)" />
            <TypeBar label="Events" count={stats.byType.event || 0} total={stats.totalEntities} color="var(--node-event)" />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Recent Events
          </h2>
          <div className="space-y-3">
            {timelineEvents.slice(-5).reverse().map((event) => (
              <div key={event.id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[var(--node-event)] mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-[var(--text-primary)]">{event.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centralization Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-500" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Most Centralized Entities
            </h2>
          </div>
          <div className="space-y-2">
            {entities
              .map(e => ({
                ...e,
                score: e.decentralizationScore ?? getDefaultScore(e.type)
              }))
              .sort((a, b) => a.score - b.score)
              .slice(0, 5)
              .map((entity) => (
                <EntityScoreCard key={entity.id} entity={entity} score={entity.score} />
              ))}
          </div>
          <Link
            href="/entities"
            className="block mt-4 text-center text-sm text-[var(--accent)] hover:underline"
          >
            View all entities
          </Link>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Most Decentralized
            </h2>
          </div>
          <div className="space-y-2">
            {entities
              .map(e => ({
                ...e,
                score: e.decentralizationScore ?? getDefaultScore(e.type)
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((entity) => (
                <EntityScoreCard key={entity.id} entity={entity} score={entity.score} />
              ))}
          </div>
          <Link
            href="/entities"
            className="block mt-4 text-center text-sm text-[var(--accent)] hover:underline"
          >
            View all entities
          </Link>
        </div>
      </div>

      {/* Key Thesis */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Key Thesis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThesisCard
            title="Private CBDCs"
            description="Stablecoins have the same surveillance and control capabilities as feared government CBDCs, but with less oversight."
          />
          <ThesisCard
            title="Dollar Extension"
            description="Stablecoins extend US dollar hegemony globally by creating new demand for Treasury bills."
          />
          <ThesisCard
            title="Financial Surveillance"
            description="Every stablecoin transaction is tracked. FBI and Secret Service have direct access to Tether's systems."
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border)]">
      <div className="flex items-center gap-3 mb-3">
        <div style={{ color }} className="opacity-80">
          {icon}
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function TypeBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = (count / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)]">{count}</span>
      </div>
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ThesisCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

function EntityScoreCard({ entity, score }: { entity: typeof entities[0]; score: number }) {
  const color = getDecentralizationColor(score);
  const label = getDecentralizationLabel(score);

  const typeLabels: Record<string, string> = {
    person: 'Person',
    organization: 'Organization',
    stablecoin: 'Stablecoin',
    government: 'Government',
    concept: 'Concept',
    event: 'Event',
  };

  return (
    <Link
      href={`/entities?entity=${entity.id}`}
      className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-tertiary)]/80 transition-colors"
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        title={`Score: ${score}/100`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {entity.name}
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          {typeLabels[entity.type] || entity.type}
        </p>
      </div>
      <div
        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
        title={label}
      >
        {score}
      </div>
    </Link>
  );
}
