/**
 * app/demo/page.tsx — Creatorly Demo Mode Page
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

interface AgentResult {
  caption: string;
  hashtags: string[];
  insight: string;
}

interface DemoResult {
  fresh: AgentResult;
  trained: AgentResult;
  memoriesCount: number;
}

const SAMPLE_SUGGESTIONS = [
  'morning workout routine',
  'coding & web dev tips',
  'personal finance advice',
  'healthy meal prep',
  'travel photography',
];

export default function DemoPage() {
  const [topic, setTopic] = useState('morning workout routine');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo comparison failed');
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
        eyebrow="SIDE-BY-SIDE BENCHMARK"
        title="Demo Mode"
        description="Experience the difference between generic LLM output and Creatorly memory-informed generation across any niche."
      />

      {/* Input Section */}
      <div className="card-base max-w-2xl mx-auto">
        <label htmlFor="demo-topic" className="form-label">
          Content Topic or Creator Niche
        </label>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            id="demo-topic"
            type="text"
            className="input-field"
            placeholder="e.g. real estate tips, keto diet, AI tools, fashion trends..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
          />
          <button
            id="btn-demo-compare"
            className="btn-primary shrink-0"
            onClick={handleCompare}
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Comparing...
              </span>
            ) : (
              'Run Comparison'
            )}
          </button>
        </div>

        {/* Quick select tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium mr-1">Sample topics:</span>
          {SAMPLE_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                topic === s
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {[1, 2].map((i) => (
            <div key={i} className="card-base space-y-4">
              <div className="h-4 skeleton-box w-1/4" />
              <div className="h-6 skeleton-box w-1/2" />
              <div className="h-20 skeleton-box w-full" />
              <div className="h-4 skeleton-box w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Side-by-side comparison results */}
      {result && !loading && (
        <div className="space-y-6 pt-2">
          <div className="text-center text-xs font-medium text-zinc-400">
            Trained agent queried Hindsight for <span className="text-zinc-200 font-semibold">&quot;{topic}&quot;</span> using{' '}
            <span className="text-teal-400 font-semibold">{result.memoriesCount} Hindsight memories</span>.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {/* ── FRESH AGENT (WITHOUT MEMORY) ── */}
            <div className="card-base space-y-4 border-zinc-800">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-1">WITHOUT MEMORY</span>
                  <h3 className="text-base font-bold text-zinc-200">Fresh Agent</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Zero Context
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Generated Caption</span>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-normal">{result.fresh.caption}</p>
              </div>

              {result.fresh.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {result.fresh.hashtags.map((t: string) => (
                    <span key={t} className="text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {t.startsWith('#') ? t : `#${t}`}
                    </span>
                  ))}
                </div>
              )}

              {result.fresh.insight && (
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider block mb-0.5">Strategy Reasoning</span>
                  {result.fresh.insight}
                </div>
              )}
            </div>

            {/* ── TRAINED AGENT (WITH MEMORY - TEAL LEFT BORDER) ── */}
            <div className="card-base space-y-4 border-zinc-800 border-l-4 border-l-teal-500 bg-teal-950/10">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-teal-400 block mb-1">WITH MEMORY</span>
                  <h3 className="text-base font-bold text-white">Trained Agent</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800/80">
                  {result.memoriesCount} Memories Injected
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">Personalized Caption</span>
                <p className="text-zinc-100 text-sm leading-relaxed whitespace-pre-wrap font-medium">{result.trained.caption}</p>
              </div>

              {result.trained.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {result.trained.hashtags.map((t: string) => (
                    <span key={t} className="text-xs text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                      {t.startsWith('#') ? t : `#${t}`}
                    </span>
                  ))}
                </div>
              )}

              {result.trained.insight && (
                <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/60 text-xs text-teal-200">
                  <span className="text-teal-400 font-semibold uppercase tracking-wider block mb-0.5">Audience Memory Citations</span>
                  {result.trained.insight}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
