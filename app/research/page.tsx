/**
 * app/research/page.tsx — Creatorly Niche Research & News Feed Page
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

interface Headline {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface ResearchResult {
  niche: string;
  headlines: Headline[];
  storedToHindsight: boolean;
}

const POPULAR_NICHES = [
  'fitness & workout',
  'artificial intelligence',
  'personal finance',
  'web development',
  'content creation',
];

export default function ResearchPage() {
  const [niche, setNiche] = useState('fitness & workout');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState('');

  const handleFetchNews = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch news feed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="NICHE INTELLIGENCE"
        title="Research Feed"
        description="Fetch live news and trending headlines for your niche. Top trends are automatically saved to Creatorly memory to keep AI captions current."
      />

      {/* Input Section */}
      <div className="card-base">
        <label htmlFor="niche-input" className="form-label">Target Niche or Keyword</label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            id="niche-input"
            type="text"
            className="input-field"
            placeholder="e.g. fitness, crypto, artificial intelligence, real estate..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchNews()}
          />
          <button
            id="btn-fetch-research"
            className="btn-primary shrink-0"
            onClick={handleFetchNews}
            disabled={loading || !niche.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Fetching...
              </span>
            ) : 'Fetch Latest News'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium mr-1">Popular:</span>
          {POPULAR_NICHES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNiche(n)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                niche === n
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">{error}</div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card-base space-y-2">
              <div className="h-4 skeleton-box w-3/4" />
              <div className="h-3 skeleton-box w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Headlines List */}
      {result && !loading && (
        <div className="space-y-4">
          {/* Memory Status */}
          {result.storedToHindsight && (
            <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-800/60 flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-300">
                Trending headlines for <span className="text-white font-semibold">&quot;{result.niche}&quot;</span> stored as long-term Creatorly memory.
              </span>
              <span className="shrink-0 text-xs font-bold px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-800/80 rounded">
                Memory Active
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Top Headlines: <span className="text-teal-400">&quot;{result.niche}&quot;</span>
            </h2>
            <span className="text-xs text-zinc-400">{result.headlines.length} results</span>
          </div>

          {/* Clean scannable headline list */}
          <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-xl overflow-hidden">
            {result.headlines.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors px-5 py-4 flex items-start justify-between gap-4 group">
                <div className="flex-1 min-w-0 space-y-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-zinc-100 hover:text-teal-300 transition-colors block leading-snug"
                  >
                    {item.title}
                  </a>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium">{item.source}</span>
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-xs text-zinc-600">{item.pubDate}</span>
                  </div>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold text-zinc-500 hover:text-teal-400 transition-colors group-hover:text-zinc-300 mt-0.5"
                  aria-label={`Read full article: ${item.title}`}
                >
                  ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
