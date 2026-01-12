'use client';

import { ExternalLink, Github, AlertTriangle, Eye, Database } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          Centralization Observatory
        </h1>
        <p className="text-xl text-[var(--text-secondary)]">
          Tracking the capture of crypto by traditional finance
        </p>
      </div>

      {/* Thesis Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <AlertTriangle className="text-[var(--accent)]" size={24} />
          Our Thesis
        </h2>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Bitcoin was created to eliminate trusted third parties. Stablecoins promised to bring
            dollar liquidity to the world without banks. Instead, we&apos;re witnessing the quiet
            capture of crypto by the very institutions it was designed to disrupt.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Coinbase Custody</strong> holds Bitcoin
            for 8 of 11 spot ETFs&mdash;a single point of failure for hundreds of billions in assets.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">USDT and USDC</strong> can freeze, blacklist,
            and monitor transactions&mdash;capabilities identical to the CBDCs they claim to oppose.
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Self-custody</strong> has declined from
            ~90% in 2015 to ~30% today. &quot;Not your keys, not your coins&quot; is becoming a minority practice.
          </p>
          <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-lg border border-[var(--accent)]/20">
            <p className="text-[var(--accent)] font-medium">
              This observatory exists to make these dynamics visible.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Eye className="text-[var(--accent)]" size={24} />
          Methodology
        </h2>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              Centralization Score (0-100%)
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              Each entity receives a centralization score based on multiple factors:
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span><strong>0-30%:</strong> Highly centralized. Single points of failure, freeze capabilities, government access.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                <span><strong>30-70%:</strong> Hybrid. Some decentralized properties but significant centralization risks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                <span><strong>70-100%:</strong> Decentralized. No single point of control, censorship resistant.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              Edge Types
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-3">
              Connections between entities are classified by relationship type:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-red-500"></span>
                <span className="text-[var(--text-secondary)]">Ownership/Control</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-yellow-500"></span>
                <span className="text-[var(--text-secondary)]">Regulatory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-purple-500"></span>
                <span className="text-[var(--text-secondary)]">Board/Executive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-blue-500"></span>
                <span className="text-[var(--text-secondary)]">Funding/Investment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-orange-500"></span>
                <span className="text-[var(--text-secondary)]">Custody</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded bg-green-500"></span>
                <span className="text-[var(--text-secondary)]">Partnership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Database className="text-[var(--accent)]" size={24} />
          Data Sources
        </h2>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6">
          <div className="grid gap-4">
            <a
              href="https://www.sec.gov/cgi-bin/browse-edgar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border)] transition-colors group"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">SEC EDGAR</p>
                <p className="text-xs text-[var(--text-muted)]">ETF filings, corporate disclosures</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-muted)]" />
            </a>
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border)] transition-colors group"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">CoinGecko</p>
                <p className="text-xs text-[var(--text-muted)]">Market caps, stablecoin data</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-muted)]" />
            </a>
            <a
              href="https://bitcointreasuries.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border)] transition-colors group"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">Bitcoin Treasuries</p>
                <p className="text-xs text-[var(--text-muted)]">Corporate BTC holdings</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-muted)]" />
            </a>
            <a
              href="https://tether.to/en/transparency"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border)] transition-colors group"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">Tether Transparency</p>
                <p className="text-xs text-[var(--text-muted)]">USDT reserves attestations</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-muted)]" />
            </a>
            <a
              href="https://www.circle.com/en/transparency"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border)] transition-colors group"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">Circle Transparency</p>
                <p className="text-xs text-[var(--text-muted)]">USDC reserves reports</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-muted)]" />
            </a>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Data is aggregated from public sources and updated regularly. Some metrics are estimates based on available information.
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-[var(--border)] pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">
              Built to make centralization visible.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Not financial advice. Do your own research.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
          >
            <Github size={16} />
            View Source
          </a>
        </div>
      </section>
    </div>
  );
}
