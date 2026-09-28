import "dotenv/config";
import { buildCategorizePrompt, CATEGORIES } from "../prompts/categorize.js";

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-3.5-flash-lite";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const testDescriptions = [
  "SWIGGY ORDER 51230",
  "RENT PAYMENT TO LANDLORD",
  "ZERODHA MUTUAL FUND SIP",
  "NETFLIX SUBSCRIPTION",
  "AMAZON PAY INDIA",
  "SALARY ACME TECH PVT LTD",
  "BESCOM ELECTRICITY BILL",
  "UBER TRIP",
  "FREELANCE PAYMENT RECEIVED",
  "ZOMATO ORDER 88412",
  "PVR CINEMAS TICKET",
  "UPI/DR/3341/RAHUL SHARMA",       // vague, no merchant hint
  "NEFT-SALARY-ACME TECH",          // messy real-bank style
  "IRCTC TICKET BOOKING",
  "ATM WITHDRAWAL",                 // ambiguous by nature
];

// Strips ```json fences if the model adds them despite instructions
function extractJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
  return cleaned;
}

async function categorize(description) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildCategorizePrompt(description) }] }],
    }),
  });

  const data = await response.json();
  if (!response.ok) return { description, ok: false, error: data.error?.message };

  const rawText = data.candidates[0].content.parts[0].text;
  const jsonText = extractJson(rawText);

  try {
    const parsed = JSON.parse(jsonText);
    const valid = CATEGORIES.includes(parsed.category);
    return { description, ok: true, valid, category: parsed.category, rawText };
  } catch {
    return { description, ok: true, valid: false, category: null, rawText };
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const results = [];
for (const desc of testDescriptions) {
  const result = await categorize(desc);
  results.push(result);
 
  console.log(
    result.valid
      ? `✅ "${desc}" → ${result.category}`
      : `❌ "${desc}" → FAILED. Raw: ${result.rawText ?? result.error}`
  );
    await sleep(13000);
}

const successCount = results.filter((r) => r.valid).length;
console.log(`\n${successCount}/${results.length} produced valid, parseable JSON with a known category`);