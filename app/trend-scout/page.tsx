/**
 * app/trend-scout/page.tsx — Creatorly Trend Scout Page
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MetricDisplay } from '@/components/MetricDisplay';

interface TrendVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  viralityScore: number;
  publishedAt: string;
  videoUrl: string;
}

interface TrendScoutResult {
  niche: string;
  suggestedPostTime: string;
  videos: TrendVideo[];
  storedToHindsight: boolean;
}

const POPULAR_NICHES = [
  'fitness & workout',
  'artificial intelligence',
  'personal finance',
  'tech reviews',
  'gaming tips',
];

export default function TrendScoutPage() {
  const [niche, setNiche] = useState('fitness & workout');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendScoutResult | null>(null);
  const [error, setError] = useState('');

  const handleScout = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/trend-scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scout trends');
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
        eyebrow="VIRAL IDEA FINDER"
        title="Trend Scout"
        description="Analyze top performing content on YouTube to discover high-virality hooks and optimal posting windows, automatically saved to your Creatorly memory."
      />

      {/* Input Section */}
      <div className="card-base">
        <label htmlFor="scout-niche-input" className="form-label">
          Target Niche or Topic Keyword
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            id="scout-niche-input"
            type="text"
            className="input-field"
            placeholder="e.g. fitness routines, AI tools, crypto news, productivity..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScout()}
          />
          <button
            id="btn-scout-trends"
            className="btn-primary shrink-0"
            onClick={handleScout}
            disabled={loading || !niche.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scouting Trends...
              </span>
            ) : (
              'Scout Viral Trends'
            )}
          </button>
        </div>

        {/* Quick select tags */}
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
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 skeleton-box" />
            <div className="h-24 skeleton-box" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-base space-y-4">
                <div className="aspect-video skeleton-box rounded-lg" />
                <div className="h-6 skeleton-box w-1/3" />
                <div className="h-4 skeleton-box w-3/4" />
                <div className="h-3 skeleton-box w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Key Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricDisplay
              label="Optimal Posting Window"
              value={result.suggestedPostTime}
              subtext="Derived from publishing windows of top viral content"
              accent
            />
            <MetricDisplay
              label="Hindsight Memory Status"
              value={result.storedToHindsight ? 'Patterns Retained' : 'Saved Locally'}
              subtext="Top virality patterns stored in Creatorly long-term memory"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Top Viral Content: <span className="text-teal-400">&quot;{result.niche}&quot;</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Sorted by Virality Score (0-100)</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.videos.map((vid) => (
              <div key={vid.id} className="card-interactive flex flex-col justify-between space-y-4">
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-zinc-950 mb-4 border border-zinc-800">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Dominant Virality Score Header */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Virality Score</span>
                      <span className="text-2xl font-bold tracking-tight text-white">{vid.viralityScore}<span className="text-xs text-zinc-500 font-normal">/100</span></span>
                    </div>
                    {/* Horizontal Bar Indicator */}
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          vid.viralityScore >= 85 ? 'bg-teal-500' : vid.viralityScore >= 60 ? 'bg-amber-500' : 'bg-zinc-500'
                        }`}
                        style={{ width: `${vid.viralityScore}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-teal-400 block mb-1">{vid.channelTitle}</span>
                  <a
                    href={vid.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-zinc-100 hover:text-teal-300 transition-colors line-clamp-2 leading-snug"
                  >
                    {vid.title}
                  </a>
                </div>

                {/* Metrics Breakdown */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <div><span className="text-zinc-200 font-semibold">{(vid.viewCount / 1000).toFixed(0)}k</span> views</div>
                  <div><span className="text-zinc-200 font-semibold">{(vid.likeCount / 1000).toFixed(1)}k</span> likes</div>
                  <div><span className="text-zinc-200 font-semibold">{vid.commentCount}</span> comments</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
