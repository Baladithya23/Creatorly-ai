/**
 * lib/hindsight.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper functions for interacting with the Hindsight Cloud memory API.
 *
 * Hindsight Cloud base: https://api.hindsight.vectorize.io
 * Auth: Authorization: Bearer <HINDSIGHT_API_KEY>
 * Bank: HINDSIGHT_BANK_ID (the memory bank / namespace ID)
 *
 * Operations used:
 *   POST /v1/default/banks/{bank_id}/memories         — store a memory
 *   POST /v1/default/banks/{bank_id}/memories/recall  — retrieve relevant memories
 * ─────────────────────────────────────────────────────────────────────────────
 */

const HINDSIGHT_BASE_URL = 'https://api.hindsight.vectorize.io';

/** Retrieve the bank ID from env, throw if missing */
function getBankId(): string {
  const id = process.env.HINDSIGHT_BANK_ID;
  if (!id) throw new Error('HINDSIGHT_BANK_ID env variable is not set');
  return id;
}

/** Build the standard auth header object */
function getHeaders(): Record<string, string> {
  const key = process.env.HINDSIGHT_API_KEY;
  if (!key) throw new Error('HINDSIGHT_API_KEY env variable is not set');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Memory {
  id: string;
  content: string;
  created_at?: string;
  score?: number;
}

export interface RecallResult {
  memories: Memory[];
  rawContext: string; // pre-formatted string suitable for pasting into a prompt
}

// ─── retain() ────────────────────────────────────────────────────────────────

/**
 * Store content as a new memory in Hindsight.
 * @param content  Plain-text content to store (can be JSON-serialised object)
 * @param bankId   Optional override for the bank ID (defaults to env var)
 */
export async function retain(content: string, bankId?: string): Promise<void> {
  try {
    const bank = bankId ?? getBankId();
    const url = `${HINDSIGHT_BASE_URL}/v1/default/banks/${bank}/memories`;
    console.log(`🧠 [Hindsight retain] Posting memory to ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items: [{ content }] }),
    });

    const resText = await res.text();
    console.log(`🧠 [Hindsight retain] Response (${res.status}): ${resText}`);

    if (!res.ok) {
      console.warn(`Hindsight retain failed (${res.status}): ${resText}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Hindsight retain unavailable: ${msg}`);
  }
}

// ─── recall() ────────────────────────────────────────────────────────────────

/**
 * Retrieve the most relevant memories for a given query.
 * @param query   Natural-language query (e.g. "fitness reels that performed well")
 * @param topK    Maximum number of memories to return (default: 10)
 * @param bankId  Optional override for the bank ID (defaults to env var)
 */
export async function recall(
  query: string,
  topK = 10,
  bankId?: string,
): Promise<RecallResult> {
  try {
    const bank = bankId ?? getBankId();
    const url = `${HINDSIGHT_BASE_URL}/v1/default/banks/${bank}/memories/recall`;
    console.log(`🧠 [Hindsight recall] Querying POST ${url} | query: "${query}"`);

    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, top_k: topK }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`Hindsight recall failed (${res.status}): ${errorText}`);
      return { memories: [], rawContext: '' };
    }

    const data = await res.json();
    console.log(`🧠 [Hindsight recall] Raw API Response:`, JSON.stringify(data, null, 2));

    const extractedTexts: string[] = [];

    // 1. If data.results is an array of memory objects
    if (Array.isArray(data.results)) {
      for (const m of data.results) {
        const txt = typeof m === 'string' ? m : (m.content || m.text || m.observation || JSON.stringify(m));
        if (txt) extractedTexts.push(txt);
      }
    }
    // 2. If data.results is an entity map object { "entityName": { observations: [...] } }
    else if (data.results && typeof data.results === 'object') {
      for (const entityKey of Object.keys(data.results)) {
        const entity = data.results[entityKey];
        if (entity && Array.isArray(entity.observations)) {
          for (const obs of entity.observations) {
            const txt = typeof obs === 'string' ? obs : (obs.text || obs.content || obs.observation);
            if (txt) extractedTexts.push(txt);
          }
        }
      }
    }

    // 3. Fallbacks for data.memories or data.items or data.facts
    if (extractedTexts.length === 0 && Array.isArray(data.memories)) {
      for (const m of data.memories) {
        const txt = typeof m === 'string' ? m : (m.content || m.text || m.observation);
        if (txt) extractedTexts.push(txt);
      }
    }
    if (extractedTexts.length === 0 && Array.isArray(data.items)) {
      for (const m of data.items) {
        const txt = typeof m === 'string' ? m : (m.content || m.text || m.observation);
        if (txt) extractedTexts.push(txt);
      }
    }

    const memories: Memory[] = extractedTexts.map((text, idx) => ({
      id: `mem-${idx + 1}`,
      content: text,
    }));

    // Build a human-readable string for direct injection into a system prompt
    const rawContext =
      memories.length > 0
        ? memories.map((m, i) => `Memory ${i + 1}: ${m.content}`).join('\n\n')
        : '';

    console.log(`🧠 [Hindsight recall] Processed ${memories.length} memories into rawContext (length: ${rawContext.length})`);

    return { memories, rawContext };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`Hindsight recall unavailable: ${msg}`);
    return { memories: [], rawContext: '' };
  }
}
