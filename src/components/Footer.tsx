'use client';

import { Github, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/stablecoin-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Github size={14} />
              <span>Source</span>
            </a>
            <a
              href="mailto:feedback@centralization.observatory"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Mail size={14} />
              <span>Feedback</span>
            </a>
          </div>

          {/* Credits */}
          <div className="text-xs text-[var(--text-muted)]">
            Built with Next.js, Supabase, D3.js
          </div>

          {/* Copyright */}
          <div className="text-xs text-[var(--text-muted)]">
            © 2025 Centralization Observatory
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
            <strong>Disclaimer:</strong> Data aggregated from public sources. Scores are interpretive. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
