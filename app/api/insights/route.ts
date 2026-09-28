/**
 * app/api/insights/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/insights
 *
 * Flow:
 *  1. Recall all relevant memories from Hindsight (broad query)
 *  2. Feed them to Groq to synthesise a list of audience insights
 *  3. Return structured insight cards
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from 'next/server';
import { recall } from '@/lib/hindsight';
import { callGroq } from '@/lib/groq';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Recall broad memories covering all past posts
    const { rawContext, memories } = await recall(
      'social media post engagement performance results format platform',
      20, // fetch up to 20 memories for a comprehensive summary
    );

    if (memories.length === 0) {
      return NextResponse.json({
        insights: [],
        memoriesCount: 0,
        message: 'No memories found yet. Log some past posts first to see insights.',
      });
    }

    // Ask Groq to synthesise insights from the memories
    const systemPrompt = `You are a data analyst for a social media creator. You have access to their past post performance data.
Analyze the patterns and extract actionable insights. Be specific and data-driven, not generic.`;

    const userPrompt = `Based on these past post performance memories, generate 4-6 specific, actionable insights about what works for this creator's audience:

${rawContext}

Return a JSON array of insight objects with exactly this shape:
[
  {
    "title": "Short insight title (max 8 words)",
    "description": "1-2 sentence explanation with specific details from the data",
    "type": "one of: format | timing | content | platform | engagement",
    "trend": "one of: positive | negative | neutral"
  }
]

Return only the JSON array, no other text.`;

    const rawResponse = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Parse the JSON array from Groq
    let insights: unknown[] = [];
    try {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleaned);
      if (!Array.isArray(insights)) insights = [];
    } catch {
      // Graceful fallback
      insights = [{
        title: 'Analysis in progress',
        description: rawResponse.slice(0, 200),
        type: 'content',
        trend: 'neutral',
      }];
    }

    return NextResponse.json({ insights, memoriesCount: memories.length });
  } catch (error: unknown) {
    console.error('[/api/insights] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
