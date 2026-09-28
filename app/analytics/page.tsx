/**
 * app/analytics/page.tsx — Creatorly Performance Analytics Dashboard
 */
'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PageHeader } from '@/components/PageHeader';
import { MetricDisplay } from '@/components/MetricDisplay';

interface AnalyticsData {
  summary: {
    totalPosts: number;
    avgEngagement: number;
    percentChange: string;
    isPositiveChange: boolean;
    bestFormat: string;
    aiSummary: string;
  };
  timelineData: Array<{
    date: string;
    engagement: number;
    likes: number;
    comments: number;
    saves: number;
    format: string;
  }>;
  formatData: Array<{
    format: string;
    avgEngagement: number;
    avgLikes: number;
    avgSaves: number;
    count: number;
  }>;
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  borderColor: '#3f3f46',
  borderRadius: '8px',
  color: '#f4f4f5',
  fontSize: '12px',
  boxShadow: 'none',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (!res.ok) throw new Error('Failed to load analytics data');
        setData(await res.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="PERFORMANCE ANALYTICS"
        title="Analytics"
        description="Engagement metrics computed directly from your Creatorly memory bank. Logs automatically update as you add posts."
      />

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton-box" />)}
          </div>
          <div className="h-64 skeleton-box" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72 skeleton-box" />
            <div className="h-72 skeleton-box" />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-sm">{error}</div>
      )}

      {data && !loading && (
        <div className="space-y-8">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricDisplay
              label="TOTAL LOGGED POSTS"
              value={data.summary.totalPosts}
              subtext="Stored as long-term memories"
            />
            <MetricDisplay
              label="AVG ENGAGEMENT / POST"
              value={data.summary.avgEngagement.toLocaleString()}
              subtext="Weighted: Likes + Comments×3 + Saves×2"
              accent
            />
            <MetricDisplay
              label="WEEK-OVER-WEEK"
              value={data.summary.percentChange}
              subtext="vs. previous 7-day average"
              trend={{
                value: data.summary.isPositiveChange ? 'Growth' : 'Dip',
                isPositive: data.summary.isPositiveChange,
              }}
            />
          </div>

          {/* AI Executive Summary */}
          <div className="card-base border-teal-500/20 bg-teal-950/5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">AI EXECUTIVE SUMMARY</span>
            <p className="text-zinc-200 text-sm leading-relaxed">{data.summary.aiSummary}</p>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Line Chart */}
            <div className="card-base space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Engagement Over Time</h3>
                <p className="text-xs text-zinc-500">Historical trend across logged posts</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.7} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(val: any) => [`${Number(val || 0).toLocaleString()} pts`, 'Engagement']}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#14b8a6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Format Bar Chart */}
            <div className="card-base space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Best Performing Formats</h3>
                <p className="text-xs text-zinc-500">Average engagement score per content type</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.formatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.7} />
                    <XAxis dataKey="format" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      formatter={(val: any) => [`${Number(val || 0).toLocaleString()} avg`, 'Avg Engagement']}
                    />
                    <Bar dataKey="avgEngagement" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-300">Automatic Updates:</span> Analytics refresh every time you log a new post — no platform connection required.
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">Hackathon Note:</span> Analytics are generated from posts logged directly into Creatorly memory. A production build would connect to Instagram/YouTube via OAuth once platform API approval is obtained.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
