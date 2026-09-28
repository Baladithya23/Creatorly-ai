/**
 * scripts/seed-data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Data seeding script — pushes 18 realistic synthetic past posts into Hindsight
 * so the Demo Mode page has a "trained" agent to compare against immediately.
 *
 * Usage:
 *   npx ts-node --project tsconfig.seed.json scripts/seed-data.ts
 *
 * Make sure .env.local is populated with HINDSIGHT_API_KEY and HINDSIGHT_BANK_ID.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local manually since we're not in Next.js runtime
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // fall back to .env
}

// ── Hindsight API helpers (inline to avoid Next.js module issues in scripts) ─

const HINDSIGHT_BASE_URL = 'https://api.hindsight.vectorize.io';

async function retainMemory(content: string): Promise<string> {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  const bankId = process.env.HINDSIGHT_BANK_ID;

  if (!apiKey || !bankId) {
    throw new Error('Missing HINDSIGHT_API_KEY or HINDSIGHT_BANK_ID in environment variables.');
  }

  const url = `${HINDSIGHT_BASE_URL}/v1/default/banks/${bankId}/memories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ items: [{ content }] }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`Hindsight retain failed (${res.status}): ${responseText}`);
  }
  return `Status ${res.status} — ${responseText.slice(0, 100)}`;
}

// ── Synthetic past post data ──────────────────────────────────────────────────
// 18 realistic fitness/lifestyle creator posts across different formats and platforms.
// Designed to show clear patterns: Reels outperform carousels, question hooks drive comments, etc.

interface SyntheticPost {
  platform: string;
  format: string;
  caption: string;
  likes: number;
  comments: number;
  saves: number;
  engagementLabel: string;
  insight: string;
}

const SYNTHETIC_POSTS: SyntheticPost[] = [
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'POV: You decided to change your life at 6am this morning 🌅💪 Drop a 1️⃣ if you made it to the gym today!',
    likes: 4200, comments: 312, saves: 890,
    engagementLabel: 'very high engagement',
    insight: 'POV-style hooks + direct CTAs (drop a number) drove extremely high comment and save rates for Reels.',
  },
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'The workout that changed my physique in 90 days (no fancy equipment needed) 🔥 Save this for your next session!',
    likes: 3800, comments: 198, saves: 1200,
    engagementLabel: 'very high engagement',
    insight: 'Educational Reels with "save this" CTAs generate disproportionately high save counts — ideal for reach.',
  },
  {
    platform: 'Instagram',
    format: 'Carousel',
    caption: '7 gym mistakes I made for 3 years (and how to fix them) 👇 Swipe to save yourself the embarrassment',
    likes: 2100, comments: 87, saves: 640,
    engagementLabel: 'high engagement',
    insight: 'List-based carousel with numbered mistakes gets high swipe-through and saves but fewer comments than Reels.',
  },
  {
    platform: 'Instagram',
    format: 'Static Post',
    caption: 'Consistency > Perfection. Show up even when you don\'t feel like it. 💯',
    likes: 890, comments: 34, saves: 45,
    engagementLabel: 'low engagement',
    insight: 'Generic motivational static posts underperform significantly compared to Reels for this audience.',
  },
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'What I eat in a day as a fitness creator 🥗 (realistic, not perfect) Full day of eating 👇',
    likes: 5100, comments: 423, saves: 780,
    engagementLabel: 'very high engagement',
    insight: '"What I eat" day-in-the-life Reels drive the highest overall engagement — authenticity resonates.',
  },
  {
    platform: 'Instagram',
    format: 'Carousel',
    caption: 'Full upper body workout you can do at home in 20 minutes 💪 Save this!',
    likes: 1800, comments: 65, saves: 920,
    engagementLabel: 'high engagement',
    insight: 'Workout-plan carousels get very high saves (bookmark intent) even when likes are moderate.',
  },
  {
    platform: 'X (Twitter)',
    format: 'Thread',
    caption: 'I lost 20kg in 8 months. Here\'s the actual framework I used (no bs, no supplements): 🧵',
    likes: 2300, comments: 445, saves: 560,
    engagementLabel: 'very high engagement',
    insight: 'X threads with honest transformation frameworks outperform any other format — questions flood in.',
  },
  {
    platform: 'X (Twitter)',
    format: 'Thread',
    caption: 'Hot take: Most fitness advice on the internet is actively harmful. Here\'s what the science actually says 👇',
    likes: 1900, comments: 389, saves: 310,
    engagementLabel: 'high engagement',
    insight: 'Contrarian takes on X drive massive comment/debate engagement — highest comment-to-like ratio.',
  },
  {
    platform: 'X (Twitter)',
    format: 'Static Post',
    caption: 'Meal prep Sunday ✅',
    likes: 120, comments: 8, saves: 12,
    engagementLabel: 'low engagement',
    insight: 'Single-line posts without a hook or question perform very poorly on X for this audience.',
  },
  {
    platform: 'LinkedIn',
    format: 'Static Post',
    caption: 'I used to skip workouts because I was "too busy". Then I realised: I wasn\'t too busy. I was too undisciplined. Hard truth, but the gym made me a better professional. Anyone else found fitness improved their work performance?',
    likes: 1240, comments: 187, saves: 89,
    engagementLabel: 'high engagement',
    insight: 'LinkedIn posts connecting fitness to professional growth get exceptional comment rates from professional audience.',
  },
  {
    platform: 'LinkedIn',
    format: 'Carousel',
    caption: '5 lessons from 5 years of gym training that made me a better entrepreneur 👇',
    likes: 980, comments: 134, saves: 67,
    engagementLabel: 'high engagement',
    insight: 'Career/fitness crossover content performs uniquely well on LinkedIn — high-quality professional engagement.',
  },
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'This simple morning habit added 10kg to my deadlift in 6 weeks 😳 (no, it\'s not what you think)',
    likes: 4800, comments: 289, saves: 670,
    engagementLabel: 'very high engagement',
    insight: 'Mystery/curiosity hooks ("it\'s not what you think") drive very high view-to-engagement ratios on Reels.',
  },
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'Rating my old workout videos so you don\'t have to 😂💀 #throwback #fitnessfail',
    likes: 6200, comments: 534, saves: 230,
    engagementLabel: 'very high engagement',
    insight: 'Humour/self-deprecating Reels hit the highest like and comment counts — shareable and relatable.',
  },
  {
    platform: 'Instagram',
    format: 'Story',
    caption: 'Quick poll: Do you prefer morning or evening workouts? 🌅 vs 🌙',
    likes: 45, comments: 12, saves: 3,
    engagementLabel: 'low engagement',
    insight: 'Stories have much lower quantitative engagement metrics but high poll-response rates not captured here.',
  },
  {
    platform: 'Instagram',
    format: 'Carousel',
    caption: 'My exact cutting diet for summer (with macros) 📊 Save for reference!',
    likes: 2400, comments: 98, saves: 1450,
    engagementLabel: 'very high engagement',
    insight: 'Macro/diet detail carousels generate the HIGHEST save counts of any format — maximum bookmark intent.',
  },
  {
    platform: 'X (Twitter)',
    format: 'Thread',
    caption: 'The biggest fitness myth destroying your gains (backed by 3 studies): Thread 🧵',
    likes: 1600, comments: 298, saves: 430,
    engagementLabel: 'high engagement',
    insight: 'Science-backed threads citing studies get high credibility engagement and saves on X.',
  },
  {
    platform: 'Instagram',
    format: 'Reel',
    caption: 'Do you even know your maintenance calories? Let me help 👇 (most people are way off)',
    likes: 3200, comments: 412, saves: 560,
    engagementLabel: 'very high engagement',
    insight: 'Question-as-hook Reels ("Do you even know...") drive above-average comments — they invite response.',
  },
  {
    platform: 'LinkedIn',
    format: 'Static Post',
    caption: 'Just hit 100 workouts this year. Here\'s what I learned about discipline, consistency, and why showing up matters more than motivation.',
    likes: 1560, comments: 203, saves: 112,
    engagementLabel: 'high engagement',
    insight: 'Milestone posts with personal lessons outperform product/service posts on LinkedIn by 3-4×.',
  },
];

// ── Main seeding function ─────────────────────────────────────────────────────

async function seedData(): Promise<void> {
  console.log('🌱 Creatorly — Seeding Hindsight with synthetic post data...\n');

  const apiKey = process.env.HINDSIGHT_API_KEY;
  const bankId = process.env.HINDSIGHT_BANK_ID;

  if (!apiKey || !bankId) {
    console.error('❌ Error: Missing HINDSIGHT_API_KEY or HINDSIGHT_BANK_ID');
    console.error('   Create a .env.local file with these values first.\n');
    process.exit(1);
  }

  console.log(`   API Key: ${apiKey.slice(0, 8)}...`);
  console.log(`   Bank ID: ${bankId}`);
  console.log(`   Posts to seed: ${SYNTHETIC_POSTS.length}\n`);

  let successCount = 0;
  let failCount    = 0;

  for (let i = 0; i < SYNTHETIC_POSTS.length; i++) {
    const post = SYNTHETIC_POSTS[i];
    const memoryContent = [
      `Platform: ${post.platform}`,
      `Format: ${post.format}`,
      `Performance: ${post.engagementLabel}`,
      `Likes: ${post.likes} | Comments: ${post.comments} | Saves: ${post.saves}`,
      `Caption: "${post.caption}"`,
      `Insight: ${post.insight}`,
    ].join('\n');

    try {
      const resInfo = await retainMemory(memoryContent);
      successCount++;
      process.stdout.write(`   [${i + 1}/${SYNTHETIC_POSTS.length}] ✅ ${post.platform} ${post.format} — ${resInfo}\n`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err: unknown) {
      failCount++;
      const message = err instanceof Error ? err.message : String(err);
      process.stdout.write(`   [${i + 1}/${SYNTHETIC_POSTS.length}] ❌ Failed: ${message}\n`);
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`✅ Seeding complete: ${successCount} stored, ${failCount} failed`);
  console.log('   Demo Mode is now ready — go to /demo to see the difference!\n');
}

// Run the seeder
seedData().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
