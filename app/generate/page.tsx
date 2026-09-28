/**
 * app/generate/page.tsx — Creatorly Generate Post Idea Page
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

interface GenerateResult {
  caption: string;
  hashtags: string[];
  bestTime: string;
  hook: string;
  insight: string;
  memoryUsed: boolean;
  memoriesCount: number;
}

const PLATFORMS = ['Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok'];
const FORMATS   = ['Reel', 'Carousel', 'Static Post', 'Thread', 'Story'];

export default function GeneratePage() {
  const [niche,    setNiche]    = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [format,   setFormat]   = useState('Reel');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<GenerateResult | null>(null);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);

  const handleGenerate = async () => {
    if (!niche.trim()) { setError('Please enter a niche or topic.'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: niche.trim(), platform, format }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = () => {
    if (!result?.caption) return;
    navigator.clipboard.writeText(result.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const text = `${result.caption}\n\n${(result.hashtags || []).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="AI CONTENT GENERATION"
        title="Generate Post Idea"
        description="Enter your niche — Creatorly recalls your past performance memories and crafts a personalized suggestion."
      />

      {/* Input Form */}
      <div className="card-base space-y-5">
        <div>
          <label htmlFor="niche" className="form-label">Niche / Topic</label>
          <input
            id="niche"
            type="text"
            className="input-field"
            placeholder='e.g. "fitness", "tech reviews", "morning routines"'
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="platform" className="form-label">Platform</label>
            <select id="platform" className="select-field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="form-label">Format</label>
            <select id="format" className="select-field" value={format} onChange={(e) => setFormat(e.target.value)}>
              {FORMATS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">{error}</div>
        )}

        <button
          id="btn-generate"
          className="btn-primary w-full"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Recalling memories &amp; generating...
            </span>
          ) : 'Generate Post Idea'}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="card-base space-y-4">
          <div className="h-4 skeleton-box w-1/3" />
          <div className="h-3 skeleton-box w-full" />
          <div className="h-3 skeleton-box w-5/6" />
          <div className="h-3 skeleton-box w-4/6" />
          <div className="flex gap-2 pt-2">
            {[1,2,3,4].map(i => <div key={i} className="h-6 skeleton-box w-20 rounded-full" />)}
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && (
        <div className="card-base space-y-5 animate-fade-in">
          {/* Header row */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block mb-0.5">{platform} · {format}</span>
              <span className="text-sm font-semibold text-white">Generated Caption</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
              result.memoryUsed
                ? 'bg-teal-950/60 text-teal-300 border-teal-800/60'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}>
              {result.memoryUsed ? `${result.memoriesCount} memories injected` : 'No memory context yet'}
            </span>
          </div>

          {/* Hook */}
          {result.hook && (
            <div>
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">Opening Hook</span>
              <p className="text-white font-bold text-base leading-snug">{result.hook}</p>
            </div>
          )}

          {/* Caption Body */}
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Full Caption</span>
            <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{result.caption}</p>
          </div>

          {/* Hashtags */}
          {result.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.hashtags.map((tag: string) => (
                <span key={tag} className="text-xs text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {result.bestTime && (
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">Best Time to Post</span>
                <span className="text-sm font-semibold text-teal-400">{result.bestTime}</span>
              </div>
            )}
            {result.insight && (
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">Strategy Reasoning</span>
                <span className="text-xs text-zinc-300">{result.insight}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-zinc-800/80">
            <button id="btn-copy-caption" onClick={copyCaption} className="btn-secondary flex-1 text-xs py-2">
              {copied ? 'Copied!' : 'Copy Caption'}
            </button>
            <button id="btn-copy-all" onClick={copyAll} className="btn-primary flex-1 text-xs py-2">
              Copy Caption + Hashtags
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
