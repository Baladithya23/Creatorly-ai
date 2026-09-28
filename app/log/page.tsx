/**
 * app/log/page.tsx — Creatorly Log a Past Post Page
 */
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';

const PLATFORMS = ['Instagram', 'X (Twitter)', 'LinkedIn', 'TikTok'];
const FORMATS   = ['Reel', 'Carousel', 'Static Post', 'Thread', 'Story'];

export default function LogPage() {
  const [caption,  setCaption]  = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [format,   setFormat]   = useState('Reel');
  const [likes,    setLikes]    = useState('');
  const [comments, setComments] = useState('');
  const [saves,    setSaves]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState<{ label: string } | null>(null);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) { setError('Please enter a caption.'); return; }
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const res = await fetch('/api/log-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim(),
          platform,
          format,
          likes:    Number(likes)    || 0,
          comments: Number(comments) || 0,
          saves:    Number(saves)    || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Logging failed');
      setSuccess({ label: data.engagementLabel });
      setCaption('');
      setLikes('');
      setComments('');
      setSaves('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="MEMORY TRAINING"
        title="Log a Past Post"
        description="Every post you log trains Creatorly to understand what resonates with your specific audience."
      />

      {/* Success state */}
      {success && (
        <div className="card-base border-teal-500/30 bg-teal-950/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Memory stored successfully</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-950/80 text-teal-300 border border-teal-800/60 rounded">
              {success.label}
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            This post has been classified as <span className="text-teal-400 font-semibold">{success.label}</span> and stored in your Creatorly memory bank. It will influence future caption personalization.
          </p>
          <button
            id="btn-log-another"
            className="btn-secondary text-xs"
            onClick={() => setSuccess(null)}
          >
            Log another post
          </button>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="card-base space-y-5">
          {/* Caption */}
          <div>
            <label htmlFor="caption" className="form-label">Caption Text</label>
            <textarea
              id="caption"
              className="textarea-field"
              rows={5}
              placeholder="Paste your full caption here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {/* Platform + Format */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="platform" className="form-label">Platform</label>
              <select id="platform" className="select-field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="format" className="form-label">Format</label>
              <select id="format" className="select-field" value={format} onChange={(e) => setFormat(e.target.value)}>
                {FORMATS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Engagement Numbers */}
          <div>
            <span className="form-label block mb-3">Engagement Numbers</span>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="likes" className="form-label">Likes</label>
                <input id="likes" type="number" min="0" className="input-field" placeholder="0" value={likes} onChange={(e) => setLikes(e.target.value)} />
              </div>
              <div>
                <label htmlFor="comments" className="form-label">Comments</label>
                <input id="comments" type="number" min="0" className="input-field" placeholder="0" value={comments} onChange={(e) => setComments(e.target.value)} />
              </div>
              <div>
                <label htmlFor="saves" className="form-label">Saves</label>
                <input id="saves" type="number" min="0" className="input-field" placeholder="0" value={saves} onChange={(e) => setSaves(e.target.value)} />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">{error}</div>
          )}

          <button
            id="btn-log-submit"
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Storing memory...
              </span>
            ) : 'Log & Store Memory'}
          </button>

          {/* Tip */}
          <p className="text-xs text-zinc-500 text-center leading-relaxed">
            Add at least 5 posts for Creatorly to start identifying patterns. At 10+ posts, suggestions become noticeably more targeted.
          </p>
        </form>
      )}
    </div>
  );
}
