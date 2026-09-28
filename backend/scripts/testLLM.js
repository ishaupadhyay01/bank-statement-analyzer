import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-3.6-flash";
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const description = "SWIGGY ORDER 51230";

const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          { text: `Categorize this bank transaction: "${description}"` },
        ],
      },
    ],
  }),
});

const data = await response.json();

if (!response.ok) {
  console.error("API error:", data);
} else {
  const reply = data.candidates[0].content.parts[0].text;
  console.log("Model replied:\n", reply);
}