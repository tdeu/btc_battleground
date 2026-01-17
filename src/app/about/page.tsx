'use client';

import { ExternalLink, Github, AlertTriangle, Database, Users, BarChart3, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';
import { getDecentralizationColor } from '@/lib/scoring';

// Example entity card component
function EntityExample({ name, score, type }: { name: string; score: number; type: string }) {
  const color = getDecentralizationColor(score);
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-tertiary)] rounded-lg">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
        <p className="text-xs text-[var(--text-muted)]">{type}</p>
      </div>
      <div
        className="px-2 py-0.5 rounded text-xs font-bold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {score}
      </div>
    </div>
  );
}

// Gradient scale component
function GradientScale() {
  return (
    <div className="space-y-2">
      <div className="h-4 rounded-full overflow-hidden flex">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: getDecentralizationColor(i * 5) }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>0 - Centralized</span>
        <span>50 - Mixed</span>
        <span>100 - Decentralized</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Is Bitcoin Still Decentralized?
        </h1>
        <p className="text-xl text-[var(--text-secondary)] mb-6">
          The data suggests a troubling answer.
        </p>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
          This tool maps the network of people, companies, and governments shaping Bitcoin and stablecoins.
          Each entity gets a decentralization score from 0 (centralized) to 100 (decentralized),
          revealing how power is actually distributed in crypto.
        </p>

        {/* Visual legend */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 max-w-md mx-auto">
          <p className="text-sm text-[var(--text-muted)] mb-4">Decentralization Score Examples</p>
          <div className="space-y-2">
            <EntityExample name="SEC" score={5} type="Government" />
            <EntityExample name="BlackRock" score={10} type="Organization" />
            <EntityExample name="USDT (Tether)" score={25} type="Stablecoin" />
            <EntityExample name="DAI" score={45} type="Stablecoin" />
            <EntityExample name="Jack Dorsey" score={70} type="Person" />
            <EntityExample name="Bitcoin Protocol" score={100} type="Concept" />
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          The Problem
        </h2>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">
              Why Decentralization Matters
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Bitcoin was created to eliminate trusted third parties. Decentralization provides
              financial sovereignty, censorship resistance, and trust minimization. Without it,
              crypto is just a slower database controlled by the same institutions it claimed to replace.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">
              Evidence of Centralization
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Coinbase custodies 8 of 11 Bitcoin ETFs
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    A single point of failure for hundreds of billions in assets
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Tether and Circle control ~90% of stablecoin supply
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Both can freeze, blacklist, and monitor any transaction
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Self-custody has declined from ~90% to ~30%
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    &quot;Not your keys, not your coins&quot; is now a minority practice
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    FBI and Secret Service have direct access to Tether&apos;s systems
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Stablecoins have the same surveillance capabilities as CBDCs
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-[var(--text-muted)] italic">
            These dynamics are invisible without tools that map the full network of relationships.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Database className="text-[var(--accent)]" size={24} />
          How It Works
        </h2>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--accent)] mb-1">82+</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Entities tracked: people, organizations, governments, protocols, events
              </p>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--accent)] mb-1">0-100</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Decentralization score assigned to each entity based on control and connections
              </p>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--accent)] mb-1">7</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Connection types: ownership, partnership, regulatory, funding, advisory, custody, other
              </p>
            </div>
            <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--accent)] mb-1">Network</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Interactive graph visualizes centralization as a heat map (red = centralized)
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Data is updated regularly from public sources including SEC filings, on-chain analytics, and news reports.
          </p>
        </div>
      </section>

      {/* Decentralization Scoring Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <BarChart3 className="text-[var(--accent)]" size={24} />
          Decentralization Scoring
        </h2>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          {/* Gradient scale */}
          <GradientScale />

          {/* Score ranges */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-16 h-6 rounded flex-shrink-0 flex">
                {[0, 5, 10, 15].map(s => (
                  <div key={s} className="flex-1" style={{ backgroundColor: getDecentralizationColor(s) }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">0-20: Highly Centralized</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Government agencies, large asset managers, surveillance companies.
                  Examples: SEC (5), BlackRock (10), Coinbase Custody (15)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-16 h-6 rounded flex-shrink-0 flex">
                {[20, 25, 30, 35].map(s => (
                  <div key={s} className="flex-1" style={{ backgroundColor: getDecentralizationColor(s) }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">20-40: Mostly Centralized</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Stablecoin issuers, major exchanges, centralized custodians.
                  Examples: USDT (25), USDC (30), Coinbase (35)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-16 h-6 rounded flex-shrink-0 flex">
                {[40, 45, 50, 55].map(s => (
                  <div key={s} className="flex-1" style={{ backgroundColor: getDecentralizationColor(s) }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">40-60: Mixed</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Individuals with influence, hybrid protocols, crypto-collateralized assets.
                  Examples: DAI (45), Michael Saylor (50), Cash App (55)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-16 h-6 rounded flex-shrink-0 flex">
                {[60, 65, 70, 75].map(s => (
                  <div key={s} className="flex-1" style={{ backgroundColor: getDecentralizationColor(s) }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">60-80: Mostly Decentralized</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Open protocols with some centralized elements, strong self-custody advocates.
                  Examples: Jack Dorsey (70)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-16 h-6 rounded flex-shrink-0 flex">
                {[80, 90, 95, 100].map(s => (
                  <div key={s} className="flex-1" style={{ backgroundColor: getDecentralizationColor(s) }} />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">80-100: Decentralized</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Truly decentralized concepts with no single point of control.
                  Examples: Self-Custody (95), Bitcoin Protocol (100)
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] p-3 bg-[var(--bg-tertiary)] rounded-lg">
            <strong>Scoring factors:</strong> Entity type, custody arrangements, regulatory relationships,
            freeze/blacklist capabilities, governance structure, and network of connections.
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <BookOpen className="text-[var(--accent)]" size={24} />
          Methodology
        </h2>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Data Sources</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                SEC EDGAR filings
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                On-chain analytics
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Corporate disclosures
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                News reports and interviews
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Congressional testimony
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                Transparency reports
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Connection Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-red-500" />
                <span className="text-[var(--text-secondary)]">Ownership</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-green-500" />
                <span className="text-[var(--text-secondary)]">Partnership</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-yellow-500" />
                <span className="text-[var(--text-secondary)]">Regulatory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-blue-500" />
                <span className="text-[var(--text-secondary)]">Funding</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-purple-500" />
                <span className="text-[var(--text-secondary)]">Board/Executive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-orange-500" />
                <span className="text-[var(--text-secondary)]">Custody</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 rounded bg-gray-500" />
                <span className="text-[var(--text-secondary)]">Other</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Limitations</h3>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">&bull;</span>
                Data is imperfect and may contain inaccuracies
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">&bull;</span>
                Scores are interpretive and reflect our methodology
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">&bull;</span>
                Bias toward US-based entities due to data availability
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--text-muted)]">&bull;</span>
                Private arrangements may not be fully captured
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* For Researchers Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Users className="text-[var(--accent)]" size={24} />
          For Researchers
        </h2>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Use Cases</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-sm font-medium text-[var(--text-primary)]">Journalists</p>
                <p className="text-xs text-[var(--text-muted)]">Investigating crypto power structures and conflicts of interest</p>
              </div>
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-sm font-medium text-[var(--text-primary)]">Policy Makers</p>
                <p className="text-xs text-[var(--text-muted)]">Evaluating regulation impact and systemic risks</p>
              </div>
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-sm font-medium text-[var(--text-primary)]">Investors</p>
                <p className="text-xs text-[var(--text-muted)]">Assessing counterparty risk and custody concentration</p>
              </div>
              <div className="p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <p className="text-sm font-medium text-[var(--text-primary)]">Researchers</p>
                <p className="text-xs text-[var(--text-muted)]">Documenting the evolution of crypto centralization</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/network" className="px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Interactive Network Graph
              </Link>
              <Link href="/timeline" className="px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Timeline of Events
              </Link>
              <Link href="/entities" className="px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Entity Database
              </Link>
              <Link href="/metrics" className="px-3 py-1.5 bg-[var(--bg-tertiary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                Centralization Metrics
              </Link>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">How to Cite</h3>
            <code className="text-xs text-[var(--text-muted)] block">
              Centralization Observatory. (2025). Bitcoin and Stablecoin Decentralization Tracker.
              Retrieved from https://stablecoin-explorer.vercel.app
            </code>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-[var(--border)] pt-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/yourusername/centralization-observatory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
              >
                <Github size={16} />
                View Source
              </a>
              <a
                href="mailto:feedback@centralization.observatory"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
              >
                <Mail size={16} />
                Feedback
              </a>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Built with Next.js, Supabase, D3.js
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              <strong>Disclaimer:</strong> Data is aggregated from public sources and may contain inaccuracies.
              Decentralization scores are interpretive and reflect our methodology. This is a research tool
              for educational purposes, not financial advice. Do your own research.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
