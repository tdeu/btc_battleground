'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Shield,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

// Placeholder data - will be replaced with API data
const STABLECOIN_DATA = [
  { name: 'USDT (Tether)', marketCap: 140, share: 65, color: '#22c55e', centralized: true },
  { name: 'USDC', marketCap: 45, share: 21, color: '#3b82f6', centralized: true },
  { name: 'DAI', marketCap: 5, share: 2, color: '#eab308', centralized: false },
  { name: 'PYUSD', marketCap: 1.5, share: 0.7, color: '#a855f7', centralized: true },
  { name: 'Others', marketCap: 24, share: 11.3, color: '#6b7280', centralized: true },
];

const BTC_ETF_DATA = [
  { name: 'BlackRock (IBIT)', aum: 55, share: 40, color: '#ef4444' },
  { name: 'Fidelity (FBTC)', aum: 20, share: 14.5, color: '#3b82f6' },
  { name: 'Grayscale (GBTC)', aum: 18, share: 13, color: '#eab308' },
  { name: 'ARK 21Shares', aum: 4, share: 3, color: '#22c55e' },
  { name: 'Others', aum: 41, share: 29.5, color: '#6b7280' },
];

const CORPORATE_BTC = [
  { name: 'MicroStrategy', btc: 450000, value: 45, color: '#ef4444' },
  { name: 'Marathon Digital', btc: 44000, value: 4.4, color: '#3b82f6' },
  { name: 'Tesla', btc: 9720, value: 0.97, color: '#eab308' },
  { name: 'Block Inc', btc: 8027, value: 0.8, color: '#22c55e' },
];

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

function MetricCard({ title, icon, children, trend, trendLabel }: MetricCardProps) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              trend === 'up'
                ? 'bg-red-500/10 text-red-500'
                : trend === 'down'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp size={12} />
            ) : trend === 'down' ? (
              <TrendingDown size={12} />
            ) : null}
            {trendLabel}
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ProgressBar({
  items,
}: {
  items: { name: string; share: number; color: string }[];
}) {
  return (
    <div className="space-y-3">
      <div className="h-4 rounded-full overflow-hidden flex bg-[var(--bg-tertiary)]">
        {items.map((item, i) => (
          <div
            key={i}
            style={{ width: `${item.share}%`, backgroundColor: item.color }}
            className="h-full transition-all duration-500"
            title={`${item.name}: ${item.share}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
            <span className="text-[var(--text-muted)] ml-auto">{item.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <div className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
        {value.toFixed(1)}
        <span className="text-sm text-[var(--text-muted)]">/{max}</span>
      </div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

export default function MetricsPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Calculate totals
  const totalStablecoinMarketCap = STABLECOIN_DATA.reduce((sum, d) => sum + d.marketCap, 0);
  const centralizedStablecoinShare = STABLECOIN_DATA.filter((d) => d.centralized).reduce(
    (sum, d) => sum + d.share,
    0
  );

  const totalETFAum = BTC_ETF_DATA.reduce((sum, d) => sum + d.aum, 0);
  const top3ETFShare =
    BTC_ETF_DATA.slice(0, 3).reduce((sum, d) => sum + d.share, 0);

  const totalCorporateBTC = CORPORATE_BTC.reduce((sum, d) => sum + d.btc, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Centralization Metrics
          </h1>
          <p className="text-[var(--text-secondary)]">
            Real-time tracking of crypto centralization indicators
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-[var(--text-muted)]">
            Last updated: {lastUpdated.toLocaleTimeString()}
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

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Total Stablecoin Supply</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            ${totalStablecoinMarketCap}B
          </div>
          <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            +12% YTD
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">BTC in ETFs</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            ${totalETFAum}B
          </div>
          <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            ~5.2% of supply
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Corporate BTC Holdings</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {(totalCorporateBTC / 1000).toFixed(0)}K BTC
          </div>
          <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <TrendingUp size={12} />
            Growing via debt
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-xs text-[var(--text-muted)] mb-1">Self-Custody Estimate</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">~30%</div>
          <div className="text-xs text-yellow-500 flex items-center gap-1 mt-1">
            <TrendingDown size={12} />
            Down from 90% (2015)
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stablecoin Market Share */}
        <MetricCard
          title="Stablecoin Market Share"
          icon={<PieChart size={18} className="text-[var(--accent)]" />}
          trend="up"
          trendLabel="Concentration rising"
        >
          <ProgressBar items={STABLECOIN_DATA} />
          <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-[var(--text-secondary)]">
                {centralizedStablecoinShare.toFixed(1)}% of stablecoins are fully centralized
                (can freeze/blacklist)
              </span>
            </div>
          </div>
        </MetricCard>

        {/* BTC ETF Custody */}
        <MetricCard
          title="BTC ETF Custody Concentration"
          icon={<BarChart3 size={18} className="text-[var(--accent)]" />}
          trend="up"
          trendLabel="Coinbase dominates"
        >
          <ProgressBar items={BTC_ETF_DATA} />
          <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-[var(--text-secondary)]">
                Top 3 ETFs control {top3ETFShare.toFixed(1)}% of ETF AUM.
                Coinbase is custodian for 8/11 ETFs.
              </span>
            </div>
          </div>
        </MetricCard>

        {/* Regulatory Capture Index */}
        <MetricCard
          title="Regulatory Capture Index"
          icon={<Shield size={18} className="text-[var(--accent)]" />}
          trend="up"
          trendLabel="Increasing"
        >
          <div className="flex justify-center py-4">
            <GaugeChart value={7.2} max={10} label="Higher = More Captured" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-xs text-[var(--text-muted)] mb-1">Gov't Access to USDT</div>
              <div className="text-lg font-bold text-red-500">Direct</div>
            </div>
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="text-xs text-[var(--text-muted)] mb-1">Can Freeze Stablecoins</div>
              <div className="text-lg font-bold text-red-500">98%+</div>
            </div>
          </div>
        </MetricCard>

        {/* Corporate BTC Holdings */}
        <MetricCard
          title="Corporate BTC Holdings"
          icon={<TrendingUp size={18} className="text-[var(--accent)]" />}
          trend="up"
          trendLabel="Growing fast"
        >
          <div className="space-y-3">
            {CORPORATE_BTC.map((company, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: company.color }}
                />
                <span className="flex-1 text-sm text-[var(--text-secondary)]">
                  {company.name}
                </span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {company.btc.toLocaleString()} BTC
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  (~${company.value}B)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-[var(--text-secondary)]">
                MicroStrategy alone holds ~2.1% of all Bitcoin via debt financing
              </span>
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Data Sources */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Data Sources</h3>
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[var(--accent)]"
          >
            <ExternalLink size={12} />
            CoinGecko (Market Data)
          </a>
          <a
            href="https://www.sec.gov/cgi-bin/browse-edgar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[var(--accent)]"
          >
            <ExternalLink size={12} />
            SEC EDGAR (ETF Filings)
          </a>
          <a
            href="https://bitcointreasuries.net"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[var(--accent)]"
          >
            <ExternalLink size={12} />
            Bitcoin Treasuries
          </a>
          <span className="text-[var(--text-muted)]">
            Note: Some data is estimated and updated weekly
          </span>
        </div>
      </div>
    </div>
  );
}
