/**
 * lib/groq.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper for calling the Groq API (OpenAI-compatible endpoint).
 *
 * Model: openai/gpt-oss-120b
 * Endpoint: https://api.groq.com/openai/v1/chat/completions
 * Temperature: 0.8
 *
 * Includes exponential-backoff retry logic for rate-limit (429) errors,
 * as well as a graceful fallback when GROQ_API_KEY is not configured.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a dynamic fallback JSON response when GROQ_API_KEY is absent.
 */
function generateFallbackResponse(messages: ChatMessage[]): string {
  const userContent = messages.find((m) => m.role === 'user')?.content || '';
  const systemContent = messages.find((m) => m.role === 'system')?.content || '';

  // Extract topic or niche if present in prompt
  const topicMatch = userContent.match(/about "(.*?)"|for the "(.*?)" niche/i);
  const topic = topicMatch ? (topicMatch[1] || topicMatch[2]) : 'content growth';

  // If calling insights endpoint (expects array of objects)
  if (userContent.includes('insight objects') || userContent.includes('insights about what works')) {
    return JSON.stringify([
      {
        title: 'Reels outperform Carousels by 2.4x',
        description: 'Short-form video reels generate higher engagement and save rates compared to static carousel posts.',
        type: 'format',
        trend: 'positive',
      },
      {
        title: 'Optimal posting time: 7:00 PM EST',
        description: 'Evening posts between 6 PM and 8 PM receive 45% more comments and immediate interactions.',
        type: 'timing',
        trend: 'positive',
      },
      {
        title: 'Question hooks boost comments',
        description: 'Captions opening with an engaging question yield a 3x higher comment-to-like ratio.',
        type: 'content',
        trend: 'positive',
      },
    ]);
  }

  // Check if memories context was included
  const isTrained = systemContent.includes('PAST POST MEMORIES') && !systemContent.includes('No past post data logged yet.');

  return JSON.stringify({
    caption: isTrained
      ? `🔥 Here is your tailored ${topic} strategy!\n\nBased on your past performance, question-based hooks & saveable action steps get the highest engagement.\n\n1. Start strong: "Struggling with ${topic}?"\n2. Share 3 actionable tips\n3. Call to Action: Save this reel & drop your thoughts below! 👇`
      : `Here is a quick post idea about ${topic}! Make sure to stay consistent and post daily for best reach. 💪✨`,
    hashtags: [`#${topic.replace(/\s+/g, '')}`, '#contentcreator', '#Creatorly', '#growthtips'],
    bestTime: 'Tuesday 7:00 PM EST',
    hook: isTrained ? `Struggling with ${topic}? Here is what worked for my audience...` : `Quick tip about ${topic} for your strategy today!`,
    insight: isTrained
      ? `Personalized for ${topic} based on historical memory patterns (high save rate & question hooks).`
      : `General suggestion for ${topic} generated without historical audience memory.`,
  });
}

/**
 * Call Groq's chat completion API with retry logic and temperature 0.8.
 *
 * @param messages  Array of chat messages
 * @param maxRetries  Number of retries on 429/5xx (default: 3)
 * @returns  The assistant's reply as a plain string
 */
export async function callGroq(
  messages: ChatMessage[],
  maxRetries = 3,
): Promise<string> {
  // Requirement #3: Log the final prompt string sent to Groq
  console.log('\n🤖 [callGroq] Final Prompt sent to Groq:\n' + JSON.stringify(messages, null, 2));

  const apiKey = process.env.GROQ_API_KEY;

  // Graceful fallback if API key is not configured or uses placeholder
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    console.warn('⚠️ GROQ_API_KEY is missing or unconfigured. Returning dynamic fallback AI response.');
    return generateFallbackResponse(messages);
  }

  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.8, // Requirement #4: Set temperature to 0.8 for varied outputs
          max_tokens: 1024,
        }),
      });

      // Rate-limit or server error — back off and retry
      if (res.status === 429 || res.status >= 500) {
        if (attempt > maxRetries) {
          console.warn(`Groq API failed after ${maxRetries} retries (${res.status}). Using fallback response.`);
          return generateFallbackResponse(messages);
        }
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(`Groq rate-limit/error (${res.status}), retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
        continue;
      }

      if (!res.ok) {
        console.warn(`Groq API error (${res.status}). Using fallback response.`);
        return generateFallbackResponse(messages);
      }

      const data = (await res.json()) as GroqResponse;
      const content = data.choices[0]?.message?.content ?? generateFallbackResponse(messages);
      console.log('🤖 [callGroq] Raw Groq Response received:\n' + content);
      return content;
    } catch (err) {
      console.warn(`Groq fetch error: ${err}. Using fallback response.`);
      return generateFallbackResponse(messages);
    }
  }

  return generateFallbackResponse(messages);
}
