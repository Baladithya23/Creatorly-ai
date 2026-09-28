/**
 * scripts/test-pipeline.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * End-to-End Pipeline Test Script (Fresh vs Trained Comparison)
 *
 * Runs two requests:
 *   1. Fresh Agent: Groq called WITHOUT any memory inserted
 *   2. Trained Agent: Groq called WITH Hindsight recalled memories inserted
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import { recall } from '../lib/hindsight';
import { callGroq } from '../lib/groq';

async function testPipeline() {
  console.log('======================================================');
  console.log('🧪 Creatorly PIPELINE TEST: FRESH VS TRAINED (MEMORY VS NO MEMORY)');
  console.log('======================================================\n');

  const niche = 'fitness & workout';
  const platform = 'Instagram';
  const format = 'Reel';
  const query = `${platform} ${format} ${niche} post performance engagement`;

  console.log(`📌 Input Parameters:`);
  console.log(`   - Niche: ${niche}`);
  console.log(`   - Platform: ${platform}`);
  console.log(`   - Format: ${format}\n`);

  // ---------------------------------------------------------------------------
  // RUN 1: FRESH AGENT (WITHOUT MEMORY INSERTED)
  // ---------------------------------------------------------------------------
  console.log('======================================================');
  console.log('🤖 RUN 1: FRESH AGENT (WITHOUT ANY MEMORY INSERTED)');
  console.log('======================================================\n');

  const freshSystemPrompt = `You are Creatorly, an expert social media strategist. You are giving general advice since the creator has not yet logged any past posts.`;
  const userPrompt = `Generate a ${platform} ${format} post idea for the "${niche}" niche.

Return a JSON object with exactly these fields:
{
  "caption": "full caption text ready to copy-paste (include emojis, line breaks, call to action)",
  "hashtags": ["array", "of", "5-10", "relevant", "hashtags"],
  "bestTime": "specific best posting time with day and hour (e.g. Tuesday 7pm EST)",
  "hook": "an attention-grabbing first line/hook for the post",
  "insight": "one sentence explaining WHY this will work for this audience"
}

Return only the JSON object, no other text.`;

  console.log(`🤖 Invoking Groq WITHOUT memory context...`);
  const freshGroqResponse = await callGroq([
    { role: 'system', content: freshSystemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  console.log(`\n✨ [Fresh Agent Output (NO MEMORY)]`);
  console.log(freshGroqResponse);
  console.log('\n------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // RUN 2: TRAINED AGENT (WITH HINDSIGHT MEMORY INSERTED)
  // ---------------------------------------------------------------------------
  console.log('======================================================');
  console.log('🧠 RUN 2: TRAINED AGENT (WITH HINDSIGHT MEMORY INSERTED)');
  console.log('======================================================\n');

  console.log(`🔍 Querying Hindsight recall endpoint...`);
  const { memories, rawContext } = await recall(query, 10);
  console.log(`📊 Retained memories count: ${memories.length}`);

  const trainedSystemPrompt = `You are Creatorly, an expert social media strategist with access to a creator's specific audience data.
         
IMPORTANT — You have been given the creator's past post performance memories below. Use them to personalise your suggestions. Reference specific patterns you notice (e.g. "question-based hooks work for you", "reels outperform carousels for your audience").

PAST POST MEMORIES:
${rawContext}

Always tailor your suggestion based on what has historically worked for THIS creator's specific audience.`;

  console.log(`🤖 Invoking Groq WITH memory context...`);
  const trainedGroqResponse = await callGroq([
    { role: 'system', content: trainedSystemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  console.log(`\n✨ [Trained Agent Output (WITH HINDSIGHT MEMORY)]`);
  console.log(trainedGroqResponse);

  console.log('\n======================================================');
  console.log('✅ Comparison Complete!');
  console.log('======================================================');
}

testPipeline().catch(err => {
  console.error('❌ Pipeline Test Error:', err);
  process.exit(1);
});
