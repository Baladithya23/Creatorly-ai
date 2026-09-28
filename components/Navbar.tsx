/**
 * components/Navbar.tsx
 * Creatorly Navigation Bar — Clean, professional header with active route highlighting.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/',            label: 'Home' },
  { href: '/generate',    label: 'Generate' },
  { href: '/demo',        label: 'Demo Mode' },
  { href: '/log',         label: 'Log a Post' },
  { href: '/insights',   label: 'Insights' },
  { href: '/research',    label: 'Research' },
  { href: '/trend-scout', label: 'Trend Scout' },
  { href: '/analytics',   label: 'Analytics' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-md bg-teal-600 flex items-center justify-center font-bold text-white text-sm tracking-tighter">
              Cr
            </div>
            <span className="font-bold text-lg text-white tracking-tight group-hover:text-teal-400 transition-colors duration-150">
              Creatorly
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'text-teal-400 bg-teal-950/50 border border-teal-800/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu toggle button */}
          <button
            className="md:hidden p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/80 px-4 py-3 bg-zinc-950 space-y-1">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'text-teal-400 bg-teal-950/60 border border-teal-800/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
