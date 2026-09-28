/**
 * app/api/log-performance/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/log-performance
 *
 * Flow:
 *  1. Parse post data (caption, platform, format, likes, comments, saves)
 *  2. Compute a simple engagement label (high / medium / low)
 *  3. Serialize all of this into a natural-language string
 *  4. Send to Hindsight via retain() to store as a persistent memory
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from 'next/server';
import { retain } from '@/lib/hindsight';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Simple engagement classifier based on combined metric totals */
function classifyEngagement(likes: number, comments: number, saves: number): string {
  const total = likes + comments * 3 + saves * 2; // weight interactions by depth
  if (total >= 500) return 'very high engagement';
  if (total >= 150) return 'high engagement';
  if (total >= 50)  return 'medium engagement';
  return 'low engagement';
}

export async function POST(req: NextRequest) {
  try {
    const { caption, platform, format, likes, comments, saves } = await req.json();

    if (!caption || !platform || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: caption, platform, format' },
        { status: 400 },
      );
    }

    const likesNum    = Number(likes)    || 0;
    const commentsNum = Number(comments) || 0;
    const savesNum    = Number(saves)    || 0;

    const engagementLabel = classifyEngagement(likesNum, commentsNum, savesNum);

    // Build a rich natural-language memory string for Hindsight to index
    const memoryContent = [
      `Platform: ${platform}`,
      `Format: ${format}`,
      `Performance: ${engagementLabel}`,
      `Likes: ${likesNum} | Comments: ${commentsNum} | Saves/Shares: ${savesNum}`,
      `Caption: "${caption}"`,
      `Insight: This ${format} on ${platform} received ${engagementLabel} — ` +
        (likesNum > commentsNum * 2
          ? 'the audience liked but did not heavily comment, suggesting visual appeal over conversation.'
          : commentsNum > likesNum / 10
          ? 'strong comment ratio suggests this sparked conversation and emotional resonance.'
          : savesNum > likesNum / 10
          ? 'high save rate suggests this was educational or bookmark-worthy content.'
          : 'balanced engagement across metrics.'),
    ].join('\n');

    // Store as a persistent memory in Hindsight
    await retain(memoryContent);

    return NextResponse.json({
      success: true,
      engagementLabel,
      message: 'Memory stored successfully',
    });
  } catch (error: unknown) {
    console.error('[/api/log-performance] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
