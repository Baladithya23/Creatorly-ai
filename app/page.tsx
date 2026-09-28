/**
 * app/page.tsx — Creatorly Home / Landing Page
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import { MetricDisplay } from '@/components/MetricDisplay';

export const metadata: Metadata = {
  title: 'Creatorly — AI Agent That Learns Your Audience',
  description:
    'Creatorly — an AI agent that learns what your audience loves and helps you create smarter content over time.',
};

const FEATURES = [
  {
    tag: 'PERSISTENT MEMORY',
    title: 'Hindsight Memory Bank',
    description:
      'Remembers every post you log — what got engagement, what underperformed, and why — building a permanent knowledge graph.',
  },
  {
    tag: 'AUDIENCE-SPECIFIC',
    title: 'Personalized Strategy',
    description:
      'Moves beyond generic LLM prompts by recalling past winner hooks, format patterns, and optimal posting times for your niche.',
  },
  {
    tag: 'INTELLIGENT SCOUTING',
    title: 'Trend Scout & Research',
    description:
      'Scouts real-time YouTube virality patterns and Google News RSS updates, automatically saving high-converting trends to memory.',
  },
  {
    tag: 'GROQ SPEED',
    title: 'Ultra-Fast Inference',
    description:
      'Powered by Groq Llama 3 70B & 120B models for instant, zero-wait post generation and side-by-side agent benchmarking.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Log Performance Data', desc: 'Input your past posts and engagement metrics into Creatorly.' },
  { step: '02', title: 'Hindsight Processing', desc: 'Memories are indexed and converted into contextual knowledge embeddings.' },
  { step: '03', title: 'Recall & Generate', desc: 'High-performing hooks and format patterns are injected into AI prompts.' },
  { step: '04', title: 'Continuous Learning', desc: 'Every post logged refines future caption quality and audience precision.' },
];

export default function HomePage() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-12 max-w-3xl mx-auto space-y-6">
        <span className="eyebrow">CREATORLY MEMORY & REASONING ENGINE</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          An AI agent that learns what your <span className="text-teal-400">audience loves</span>.
        </h1>
        <p className="page-desc text-base sm:text-lg mx-auto">
          Creatorly remembers your past posts, spots what resonated, and generates ideas tailored specifically to your audience — getting sharper with every post you log.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/generate" id="cta-generate" className="btn-primary text-sm px-6 py-3">
            Generate Post Idea
          </Link>
          <Link href="/demo" id="cta-demo" className="btn-secondary text-sm px-6 py-3">
            Compare Agents in Demo Mode
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricDisplay label="MEMORY DEPTH" value="130+" subtext="Structured creator memories active" accent />
        <MetricDisplay label="PLATFORMS SUPPORTED" value="4x" subtext="Instagram, YouTube, X, LinkedIn" />
        <MetricDisplay label="AUDIENCE RECALL" value="100%" subtext="Dynamic Hindsight memory injection" />
      </div>

      {/* Features Grid */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="eyebrow">CORE CAPABILITIES</span>
          <h2 className="text-2xl font-bold tracking-tight text-white">Built for content creators who demand precision</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map(({ tag, title, description }) => (
            <div key={title} className="card-interactive space-y-2">
              <span className="text-xs font-semibold text-teal-400 tracking-wider">{tag}</span>
              <h3 className="font-bold text-white text-base">{title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works Grid */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="eyebrow">SYSTEM WORKFLOW</span>
          <h2 className="text-2xl font-bold tracking-tight text-white">How Creatorly learns over time</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="card-base space-y-3 relative">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">STEP {step}</span>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Callout */}
      <div className="card-base border-teal-500/30 bg-teal-950/10 p-8 text-center space-y-4">
        <span className="eyebrow">SIDE-BY-SIDE BENCHMARK</span>
        <h2 className="text-2xl font-bold tracking-tight text-white">See Fresh Agent vs Trained Agent</h2>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Experience the difference between generic AI output and Creatorly memory-informed generation in our side-by-side Demo Mode.
        </p>
        <div>
          <Link href="/demo" className="btn-primary inline-flex">
            Open Demo Mode
          </Link>
        </div>
      </div>
    </div>
  );
}
