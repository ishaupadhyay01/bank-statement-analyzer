import { buildCategorizePrompt, buildBatchCategorizePrompt, CATEGORIES } from "../prompts/categorize.js";

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-3.5-flash-lite"; // higher free-tier quota than 3.6-flash
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

async function callGemini(promptText) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "API error");
  return data.candidates[0].content.parts[0].text;
}

// ---------- LOOP APPROACH ----------
// One request per transaction. Simple, but slow and rate-limit-heavy.
export async function categorizeLoop(transactions, delayMs = 4200) {
  const results = [];
  for (const tx of transactions) {
    try {
      const raw = await callGemini(buildCategorizePrompt(tx.description));
      const parsed = JSON.parse(extractJson(raw));
      const category = CATEGORIES.includes(parsed.category) ? parsed.category : "Uncategorized";
      results.push({ ...tx, category });
    } catch (err) {
      console.error(`Categorization failed for "${tx.description}":`, err.message);
      results.push({ ...tx, category: "Uncategorized" }); // fallback, never crash
    }
    await sleep(delayMs);
  }
  return results;
}

// ---------- BATCH APPROACH ----------
// Many transactions per request. Fast, fewer calls, but a bit more parsing logic.
export async function categorizeBatch(transactions, batchSize = 10, delayMs = 4200) {
  const results = [];

  for (let i = 0; i < transactions.length; i += batchSize) {
    const chunk = transactions.slice(i, i + batchSize);
    const descriptions = chunk.map((tx) => tx.description);

    let categoriesByIndex = {};
    try {
      const raw = await callGemini(buildBatchCategorizePrompt(descriptions));
      const parsed = JSON.parse(extractJson(raw));
      for (const item of parsed) {
        if (Number.isInteger(item.index) && CATEGORIES.includes(item.category)) {
          categoriesByIndex[item.index] = item.category;
        }
      }
    } catch (err) {
      console.error(`Batch categorization failed for items ${i + 1}-${i + chunk.length}:`, err.message);
      // categoriesByIndex stays empty — every item in this chunk falls back below
    }

    chunk.forEach((tx, j) => {
      const category = categoriesByIndex[j + 1] || "Uncategorized"; // 1-based index, matches the prompt
      results.push({ ...tx, category });
    });

    if (i + batchSize < transactions.length) await sleep(delayMs);
  }

  return results;
}