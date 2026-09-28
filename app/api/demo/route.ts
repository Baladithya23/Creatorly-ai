/**
 * app/api/demo/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/demo
 *
 * Runs two Groq calls for the user's free-text topic input:
 *  1. Fresh Agent: Groq called without any Hindsight memory context.
 *  2. Trained Agent: Groq called with Hindsight memories retrieved for the topic.
 *
 * Uses the exact free-text topic string passed in request body for both calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from 'next/server';
import { recall } from '@/lib/hindsight';
import { callGroq } from '@/lib/groq';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Missing or invalid topic field' }, { status: 400 });
    }

    const cleanTopic = topic.trim();
    console.log(`\n======================================================`);
    console.log(`🎬 [/api/demo] Received Demo Request for dynamic topic: "${cleanTopic}"`);

    // 1. Fetch Hindsight memories dynamically for the user's free-text topic
    const { rawContext, memories } = await recall(cleanTopic, 10);
    console.log(`🧠 [/api/demo] Hindsight recall found ${memories.length} memories for "${cleanTopic}"`);

    // 2. Fresh Agent Prompt (No Memory)
    const freshSystemPrompt = `You are a generic AI social media assistant. You have NO access to creator memory or past post history. Give standard generic social media post advice for the given topic.`;
    const freshUserPrompt = `Generate a social media post idea about "${cleanTopic}".
Return a JSON object with:
{
  "caption": "generic caption text with emojis",
  "hashtags": ["generic", "hashtags"],
  "insight": "generic reason why this post is okay"
}
Return only the JSON object, no other text.`;

    // 3. Trained Agent Prompt (With Hindsight Memory Context)
    const trainedSystemPrompt = `You are Creatorly, an advanced social media AI agent with deep long-term memory of this creator's audience engagement patterns.
You MUST analyze and apply the creator's past post memories below:

PAST POST MEMORIES:
${rawContext || 'No past post data logged yet for this query.'}

Use these specific historical insights to tailor the hook, tone, CTA, and engagement tactics for the topic. Explicitly mention what historical audience preference influenced this post.`;

    const trainedUserPrompt = `Generate a social media post idea about "${cleanTopic}" tailored specifically to this creator's audience history.
Return a JSON object with:
{
  "caption": "highly targeted caption incorporating audience preferences and proven hook style",
  "hashtags": ["targeted", "niche", "hashtags"],
  "insight": "specific explanation referencing past performance patterns (e.g. question hooks, save rates, visual breakdown)"
}
Return only the JSON object, no other text.`;

    // 4. Execute both Groq calls in parallel
    console.log(`🤖 [/api/demo] Invoking parallel Fresh & Trained Groq completions...`);
    const [freshRaw, trainedRaw] = await Promise.all([
      callGroq([
        { role: 'system', content: freshSystemPrompt },
        { role: 'user', content: freshUserPrompt },
      ]),
      callGroq([
        { role: 'system', content: trainedSystemPrompt },
        { role: 'user', content: trainedUserPrompt },
      ]),
    ]);

    // Helper to safely parse JSON from Groq response
    const parseAgentJson = (raw: string, fallbackCaption: string) => {
      try {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
      } catch {
        return {
          caption: raw || fallbackCaption,
          hashtags: ['#socialmedia', '#content'],
          insight: 'Standard suggestion generated.',
        };
      }
    };

    const freshResult = parseAgentJson(freshRaw, `Here is a post idea for ${cleanTopic}! Stay consistent!`);
    const trainedResult = parseAgentJson(trainedRaw, `Targeted post idea for ${cleanTopic} based on audience analytics.`);

    console.log(`✨ [/api/demo] Demo comparison complete for topic: "${cleanTopic}"`);
    console.log(`======================================================\n`);

    return NextResponse.json({
      fresh: freshResult,
      trained: trainedResult,
      memoriesCount: memories.length,
    });
  } catch (error: unknown) {
    console.error('[/api/demo] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
