'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  AlertTriangle,
  Shield,
  Network,
  Building,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  getAllMetrics,
  getMostCentralized,
  getMostDecentralized,
} from '@/lib/metrics';
import { getDecentralizationColor, getDecentralizationLabel } from '@/lib/scoring';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/data';
import { EntityType, EdgeType } from '@/types';

const typeLabels: Record<EntityType, string> = {
  person: 'Person',
  organization: 'Organization',
  stablecoin: 'Stablecoin',
  government: 'Government',
  concept: 'Concept',
  event: 'Event',
};

// Score color helper
function getScoreColor(score: number): string {
  if (score < 40) return '#ef4444'; // Red
  if (score < 60) return '#eab308'; // Yellow
  return '#22c55e'; // Green
}

// KPI Card Component
function KPICard({
  title,
  value,
  subtext,
  icon,
  color,
  tooltip,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  tooltip?: string;
}) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 relative group">
      {tooltip && (
        <div className="absolute top-2 right-2 text-[var(--text-muted)] opacity-50 group-hover:opacity-100 transition-opacity">
          <Info size={14} />
          <div className="absolute right-0 top-6 w-64 p-3 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltip}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ color }} className="opacity-80">
          {icon}
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{title}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{subtext}</div>
    </div>
  );
}

// Distribution Bar Chart
function DistributionChart({
  data,
}: {
  data: { range: string; count: number; color: string; label: string }[];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.range} className="flex items-center gap-3">
          <div className="w-16 text-xs text-[var(--text-muted)]">{item.range}</div>
          <div className="flex-1 h-8 bg-[var(--bg-tertiary)] rounded overflow-hidden relative">
            <div
              className="h-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                backgroundColor: item.color,
                minWidth: item.count > 0 ? '30px' : '0',
              }}
            >
              <span className="text-xs font-medium text-white">{item.count}</span>
            </div>
          </div>
          <div className="w-32 text-xs text-[var(--text-secondary)] hidden sm:block">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Entity List Component
function EntityList({
  entities,
  type,
}: {
  entities: { id: string; name: string; type: EntityType; score: number; description: string }[];
  type: 'centralized' | 'decentralized';
}) {
  return (
    <div className="space-y-2">
      {entities.map((entity, index) => {
        const color = getDecentralizationColor(entity.score);
        return (
          <Link
            key={entity.id}
            href={`/entities?entity=${entity.id}`}
            className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-tertiary)]/80 transition-colors group"
          >
            <span className="text-sm text-[var(--text-muted)] w-6">#{index + 1}</span>
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {entity.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{typeLabels[entity.type]}</p>
            </div>
            <div
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {entity.score}
            </div>
            <ChevronRight
              size={16}
              className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </Link>
        );
      })}
    </div>
  );
}

// Connection Breakdown Donut (simplified bar version)
function ConnectionBreakdown({
  data,
}: {
  data: { type: EdgeType; count: number; percentage: number }[];
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.type} className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: EDGE_COLORS[item.type] }}
          />
          <span className="flex-1 text-sm text-[var(--text-secondary)]">
            {EDGE_LABELS[item.type]}
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{item.count}</span>
          <span className="text-xs text-[var(--text-muted)] w-12 text-right">
            {item.percentage}%
          </span>
        </div>
      ))}
    </div>
  );
}

// Gauge Chart
function GaugeChart({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = (value / max) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  let color = '#22c55e';
  if (percentage > 70) color = '#ef4444';
  else if (percentage > 40) color = '#eab308';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <div className="absolute inset-0 border-8 border-[var(--bg-tertiary)] rounded-t-full" />
        <div
          className="absolute inset-0 border-8 rounded-t-full transition-all duration-1000"
          style={{
            borderColor: color,
            clipPath: `polygon(0 100%, 0 0, ${percentage}% 0, ${percentage}% 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-1 h-12 origin-bottom transition-all duration-1000"
          style={{
            backgroundColor: color,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--text-primary)]" />
      </div>
      <div className="mt-2 text-2xl font-bold" style={{ color }}>
        {value.toFixed(1)}
        <span className="text-sm text-[var(--text-muted)]">/{max}</span>
      </div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

// Section Card
function SectionCard({
  title,
  icon,
  children,
  rightContent,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        {rightContent}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function MetricsPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate all metrics
  const metrics = useMemo(() => getAllMetrics(), []);
  const mostCentralized = useMemo(() => getMostCentralized(10), []);
  const mostDecentralized = useMemo(() => getMostDecentralized(10), []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate recalculation
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  // Determine KPI colors
  const avgColor = getScoreColor(metrics.avgCentralization);
  const custodyColor =
    metrics.custodyConcentration.percentage > 70
      ? '#ef4444'
      : metrics.custodyConcentration.percentage > 50
      ? '#eab308'
      : '#22c55e';
  const networkColor =
    metrics.networkCentralization.level === 'High'
      ? '#ef4444'
      : metrics.networkCentralization.level === 'Medium'
      ? '#eab308'
      : '#22c55e';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Centralization Metrics
          </h1>
          <p className="text-[var(--text-secondary)]">
            Real-time analysis of {metrics.totalEntities} tracked entities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-[var(--text-muted)]">
            Calculated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-tertiary)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Average Centralization"
          value={`${metrics.avgCentralization}/100`}
          subtext="Lower = more centralized"
          icon={<AlertTriangle size={24} />}
          color={avgColor}
          tooltip="Average decentralization score across all tracked entities. Lower scores indicate higher centralization risk."
        />
        <KPICard
          title="Custody Concentration"
          value={`${metrics.custodyConcentration.percentage}%`}
          subtext={`Top 5 custodians control ${metrics.custodyConcentration.percentage}% of custody connections`}
          icon={<Building size={24} />}
          color={custodyColor}
          tooltip="Percentage of custody relationships concentrated in the top 5 custodians. Higher concentration = more systemic risk."
        />
        <KPICard
          title="Regulatory Capture"
          value={`${metrics.regulatoryCapture.score}/10`}
          subtext={`${metrics.regulatoryCapture.breakdown.entitiesWithGovConnections} entities with government ties`}
          icon={<Shield size={24} />}
          color={metrics.regulatoryCapture.score > 7 ? '#ef4444' : metrics.regulatoryCapture.score > 5 ? '#eab308' : '#22c55e'}
          tooltip="Weighted score of regulatory connections. Government entities = 3x, regulatory relationships = 2x, connected entities = 1x."
        />
        <KPICard
          title="Network Centralization"
          value={metrics.networkCentralization.level}
          subtext={`${metrics.networkCentralization.hubCount} hub entities (>10 connections)`}
          icon={<Network size={24} />}
          color={networkColor}
          tooltip={`Network has ${metrics.networkCentralization.hubCount} hub entities with more than 10 connections. Max connections: ${metrics.networkCentralization.maxConnections}.`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribution Chart */}
        <SectionCard
          title="Decentralization Distribution"
          icon={<AlertTriangle size={18} className="text-[var(--accent)]" />}
          rightContent={
            <span className="text-xs text-[var(--text-muted)]">
              {metrics.distribution.filter((d) => d.count > 0 && d.range.startsWith('0')).reduce((sum, d) => sum + d.count, 0) +
                metrics.distribution.filter((d) => d.range.startsWith('20')).reduce((sum, d) => sum + d.count, 0)}{' '}
              entities in centralized range
            </span>
          }
        >
          <DistributionChart data={metrics.distribution} />
          <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-[var(--text-secondary)]">
                {Math.round(
                  ((metrics.distribution[0].count + metrics.distribution[1].count) /
                    metrics.totalEntities) *
                    100
                )}
                % of entities score below 40 (centralized)
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Connection Breakdown */}
        <SectionCard
          title="Connection Types"
          icon={<Network size={18} className="text-[var(--accent)]" />}
          rightContent={
            <span className="text-xs text-[var(--text-muted)]">
              {metrics.connectionBreakdown.reduce((sum, c) => sum + c.count, 0)} total connections
            </span>
          }
        >
          <ConnectionBreakdown data={metrics.connectionBreakdown} />
          <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-[var(--text-secondary)]">
                {metrics.connectionBreakdown.find((c) => c.type === 'regulatory')?.percentage || 0}%
                of connections involve regulatory relationships
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Most Centralized */}
        <SectionCard
          title="Most Centralized Entities"
          icon={<AlertTriangle size={18} className="text-red-500" />}
          rightContent={
            <Link
              href="/entities"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              View all
            </Link>
          }
        >
          <EntityList entities={mostCentralized} type="centralized" />
        </SectionCard>

        {/* Most Decentralized */}
        <SectionCard
          title="Most Decentralized Entities"
          icon={<Shield size={18} className="text-green-500" />}
          rightContent={
            <Link
              href="/entities"
              className="text-xs text-[var(--accent)] hover:underline"
            >
              View all
            </Link>
          }
        >
          <EntityList entities={mostDecentralized} type="decentralized" />
        </SectionCard>
      </div>

      {/* Regulatory Capture Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SectionCard
          title="Regulatory Capture Index"
          icon={<Shield size={18} className="text-[var(--accent)]" />}
        >
          <div className="flex justify-center py-4">
            <GaugeChart
              value={metrics.regulatoryCapture.score}
              max={10}
              label="Higher = More Captured"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-lg font-bold text-red-500">
                {metrics.regulatoryCapture.breakdown.governmentEntities}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Gov Entities</div>
            </div>
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-500">
                {metrics.regulatoryCapture.breakdown.regulatoryConnections}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Reg Connections</div>
            </div>
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg text-center">
              <div className="text-lg font-bold text-orange-500">
                {metrics.regulatoryCapture.breakdown.entitiesWithGovConnections}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Gov-Connected</div>
            </div>
          </div>
        </SectionCard>

        {/* Network Hubs */}
        <SectionCard
          title="Network Hubs"
          icon={<Network size={18} className="text-[var(--accent)]" />}
        >
          <div className="space-y-2">
            {metrics.networkCentralization.topHubs.map((hub, i) => {
              const color = getDecentralizationColor(hub.score);
              return (
                <div
                  key={hub.name}
                  className="flex items-center gap-3 p-2 bg-[var(--bg-tertiary)] rounded"
                >
                  <span className="text-sm text-[var(--text-muted)] w-4">#{i + 1}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 text-sm text-[var(--text-primary)] truncate">
                    {hub.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {hub.connections} conn
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {metrics.networkCentralization.averageConnections}
            </div>
            <div className="text-xs text-[var(--text-muted)]">Avg connections per entity</div>
          </div>
        </SectionCard>

        {/* Entity Type Breakdown */}
        <SectionCard
          title="By Entity Type"
          icon={<Building size={18} className="text-[var(--accent)]" />}
        >
          <div className="space-y-2">
            {metrics.entityTypeBreakdown.map((item) => {
              const color = getDecentralizationColor(item.avgScore);
              return (
                <div
                  key={item.type}
                  className="flex items-center gap-3 p-2 bg-[var(--bg-tertiary)] rounded"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="flex-1 text-sm text-[var(--text-primary)]">
                    {typeLabels[item.type]}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{item.count}</span>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    avg {item.avgScore}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Data Sources */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Methodology & Data Sources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--text-muted)]">
          <div>
            <p className="font-medium text-[var(--text-secondary)] mb-1">Data Sources:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Entity scores: Manual curation based on public disclosures</li>
              <li>Custody data: SEC filings, corporate announcements</li>
              <li>Regulatory connections: Public records, news reports</li>
              <li>Network data: {metrics.totalEntities} entities, {metrics.connectionBreakdown.reduce((sum, c) => sum + c.count, 0)} connections</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-[var(--text-secondary)] mb-1">Limitations:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Scores are interpretive and reflect our methodology</li>
              <li>Private arrangements may not be fully captured</li>
              <li>Bias toward US-based entities due to data availability</li>
              <li>Updated periodically, not real-time</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Last calculated: {new Date(metrics.lastCalculated).toLocaleString()}
          </span>
          <Link
            href="/about"
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Read full methodology
          </Link>
        </div>
      </div>
    </div>
  );
}
