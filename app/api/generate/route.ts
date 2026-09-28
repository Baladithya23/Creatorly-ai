/**
 * app/api/generate/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/generate
 *
 * Flow:
 *  1. Parse { niche, platform, format } from request body
 *  2. Query Hindsight for relevant past-post memories for this user
 *  3. Build a prompt that includes those memories as context
 *  4. Call Groq (temperature 0.8) to generate: caption, hashtags, best time
 *  5. Return structured JSON result
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from 'next/server';
import { recall } from '@/lib/hindsight';
import { callGroq } from '@/lib/groq';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { niche, platform, format } = await req.json();

    if (!niche || !platform || !format) {
      return NextResponse.json({ error: 'Missing required fields: niche, platform, format' }, { status: 400 });
    }

    console.log(`\n======================================================`);
    console.log(`🚀 [/api/generate] Incoming request: niche="${niche}", platform="${platform}", format="${format}"`);

    // ── Step 1: Recall relevant memories from Hindsight ──────────────────────
    const query = `${platform} ${format} ${niche} post performance engagement`;
    console.log(`🔍 [/api/generate] Calling Hindsight recall for query: "${query}"...`);

    const { rawContext, memories } = await recall(query, 10);
    const hasMemories = memories.length > 0;

    console.log(`🧠 [/api/generate] Hindsight recall complete. Found ${memories.length} memories.`);
    if (hasMemories) {
      console.log(`🧠 [/api/generate] Recalled Memories Context:\n${rawContext}`);
    } else {
      console.log(`🧠 [/api/generate] No memories retrieved (using general prompt context).`);
    }

    // ── Step 2: Build the system prompt ──────────────────────────────────────
    const systemPrompt = hasMemories
      ? `You are Creatorly, an expert social media strategist with access to a creator's specific audience data.
         
IMPORTANT — You have been given the creator's past post performance memories below. Use them to personalise your suggestions. Reference specific patterns you notice (e.g. "question-based hooks work for you", "reels outperform carousels for your audience").

PAST POST MEMORIES:
${rawContext}

Always tailor your suggestion based on what has historically worked for THIS creator's specific audience.`
      : `You are Creatorly, an expert social media strategist. You are giving general advice since the creator has not yet logged any past posts.`;

    const userPrompt = `Generate a ${platform} ${format} post idea for the "${niche}" niche.

Return a JSON object with exactly these fields:
{
  "caption": "full caption text ready to copy-paste (include emojis, line breaks, call to action)",
  "hashtags": ["array", "of", "5-10", "relevant", "hashtags"],
  "bestTime": "specific best posting time with day and hour (e.g. Tuesday 7pm EST)",
  "hook": "an attention-grabbing first line/hook for the post",
  "insight": "one sentence explaining WHY this will work for this audience${hasMemories ? ' based on past memory patterns' : ''}"
}

Return only the JSON object, no other text.`;

    // ── Step 3: Call Groq ────────────────────────────────────────────────────
    console.log(`🤖 [/api/generate] Invoking Groq LLM with temperature 0.8...`);
    const rawResponse = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // ── Step 4: Parse the JSON from Groq ─────────────────────────────────────
    let parsed: Record<string, unknown>;
    try {
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        caption: rawResponse,
        hashtags: [],
        bestTime: 'Check platform analytics for your specific audience',
        hook: '',
        insight: '',
      };
    }

    console.log(`✨ [/api/generate] Final Result:\n`, JSON.stringify(parsed, null, 2));
    console.log(`======================================================\n`);

    return NextResponse.json({
      ...parsed,
      memoryUsed: hasMemories,
      memoriesCount: memories.length,
    });
  } catch (error: unknown) {
    console.error('[/api/generate] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
