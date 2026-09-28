/**
 * app/insights/page.tsx — Creatorly Insights Page
 */
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { MetricDisplay } from '@/components/MetricDisplay';

interface Insight {
  title: string;
  description: string;
  type: 'format' | 'timing' | 'content' | 'platform' | 'engagement';
  trend: 'positive' | 'negative' | 'neutral';
}

const TYPE_LABELS: Record<string, string> = {
  format:     'FORMAT',
  timing:     'TIMING',
  content:    'CONTENT',
  platform:   'PLATFORM',
  engagement: 'ENGAGEMENT',
};

export default function InsightsPage() {
  const [insights, setInsights]           = useState<Insight[]>([]);
  const [memoriesCount, setMemoriesCount] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [message, setMessage]             = useState('');

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/insights');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load insights');
      setInsights(data.insights || []);
      setMemoriesCount(data.memoriesCount || 0);
      setMessage(data.message || '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsights(); }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="AUDIENCE INTELLIGENCE"
        title="Insights"
        description="AI-synthesized patterns detected from your logged post history, updated automatically as you add more data."
        action={
          !loading && memoriesCount > 0 ? (
            <button id="btn-refresh-insights" className="btn-secondary text-xs" onClick={loadInsights}>
              Refresh
            </button>
          ) : undefined
        }
      />

      {/* Memory Count Banner */}
      {!loading && memoriesCount > 0 && (
        <MetricDisplay
          label="MEMORIES ANALYZED"
          value={memoriesCount}
          subtext="Structured creator memories in Creatorly Hindsight bank"
          accent
        />
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-base space-y-3">
              <div className="h-4 skeleton-box w-1/3" />
              <div className="h-3 skeleton-box w-full" />
              <div className="h-3 skeleton-box w-5/6" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">{error}</div>
      )}

      {/* Empty State */}
      {!loading && !error && memoriesCount === 0 && (
        <div className="card-base text-center py-12 space-y-4">
          <h3 className="text-lg font-bold text-white">No memories yet</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            {message || 'Log at least 3-5 past posts so Creatorly can start identifying patterns in your audience.'}
          </p>
          <a href="/log" className="btn-primary inline-flex">Log your first post</a>
        </div>
      )}

      {/* Insight Cards */}
      {!loading && insights.length > 0 && (
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="card-interactive space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-teal-400 tracking-widest">
                      {TYPE_LABELS[insight.type] || insight.type.toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      insight.trend === 'positive'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                        : insight.trend === 'negative'
                        ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}>
                      {insight.trend === 'positive' ? '+' : insight.trend === 'negative' ? '−' : '='} {insight.trend}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{insight.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
