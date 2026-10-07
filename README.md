Problem Statemnt:-Social Media Engagement agent
Learns which post styles, topics,
and timing drive engagement for
your specific audience.
Remembers past conversations
and community sentiment.
# Creatorly 🧠

**Your AI agent that learns what your audience loves.**
Live Demo :- https://creatorly-ai-chi.vercel.app/

Creatorly is a Next.js 14 application that uses **Hindsight** (a persistent memory API by Vectorize) to give an AI agent real, long-term memory of your social media performance. The more posts you log, the better the suggestions become — because the agent actually *remembers* what worked for your specific audience.

---

## What This App Does

| Feature | Description |
|---|---|
| **Generate Post Ideas** | AI generates captions + hashtags + posting time, personalised to your past performance memories |
| **Log Past Posts** | Store any past post + its engagement numbers as a persistent Hindsight memory |
| **Performance Analytics** | Engagement timeline & format breakdown charts computed directly from Hindsight post memories |
| **Niche Research Feed** | Google News RSS feed for breaking niche trends — automatically stored to Hindsight memory |
| **Viral Trend Scout** | YouTube Data API v3 virality scoring (0-100) and optimal posting window discovery |
| **Insights Page** | AI synthesises actionable audience patterns from your stored memories |
| **Demo Mode** | Split-screen: Fresh Agent (no memory) vs Trained Agent (with Hindsight memories) — side-by-side comparison |

---

## Performance Analytics Note



---

## How Hindsight Memory is Used

Hindsight is a cloud memory API that lets AI agents retain, recall, and learn from past interactions. This is different from RAG — Hindsight understands relationships, synthesises observations, and retrieves contextually-relevant memories even when phrased differently.

**In Creatorly:**

1. **`retain()`** — When you log a past post, perform niche research, or scout viral trends, we store natural-language summary memory objects in Hindsight.

2. **`recall(query, topK)`** — Before generating a new post idea or running demo comparisons, we query Hindsight with contextual queries (e.g. `"Instagram Reel fitness performance"`). Hindsight returns the most relevant memories.

3. **Prompt injection** — Recalled memories are injected into the Groq system prompt as context, enabling laser-targeted personalization.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS & Vanilla CSS (dark mode, glassmorphism)
- **Charts:** Recharts (`LineChart`, `BarChart`)
- **RSS Parser:** `fast-xml-parser`
- **LLM:** [Groq API](https://console.groq.com) — model `openai/gpt-oss-120b` (temperature `0.8`)
- **Memory:** [Hindsight Cloud](https://ui.hindsight.vectorize.io) by Vectorize
- **Deployment:** Vercel (zero-config)

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Groq API Key — https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# Hindsight Cloud API Key — https://ui.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here

# Hindsight Memory Bank ID — from your Hindsight project dashboard
HINDSIGHT_BANK_ID=your_hindsight_bank_id_here

# YouTube Data API v3 Key — https://console.cloud.google.com
YOUTUBE_API_KEY=your_youtube_api_key_here
```

---

## Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/Creatorly.git
cd Creatorly

# 2. Install dependencies
npm install

# 3. Create your .env.local (copy from example)
cp .env.example .env.local

# 4. Run automated tests
npm run test

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're ready to go!
