export const CATEGORIES = [
  "Rent",
  "Food",
  "Investments",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Income",
  "Other",
];

export function buildCategorizePrompt(description) {
  return `You are a bank transaction categorizer.

Categories (choose exactly one): ${CATEGORIES.join(", ")}

Transaction description: "${description}"

Respond with ONLY a JSON object in this exact format, with no explanation, no markdown, no extra text:
{"category": "Food"}

Your response:`;
}
export function buildBatchCategorizePrompt(descriptions) {
  const list = descriptions
    .map((desc, i) => `${i + 1}. "${desc}"`)
    .join("\n");

  return `You are a bank transaction categorizer.

Categories (choose exactly one per transaction): ${CATEGORIES.join(", ")}

Below is a numbered list of transaction descriptions. Categorize each one.

${list}

Respond with ONLY a JSON array, one object per transaction, in this exact format, with no explanation, no markdown, no extra text. The array must have exactly ${descriptions.length} items, in the same order as the list above:
[{"index": 1, "category": "Food"}, {"index": 2, "category": "Rent"}]

Your response:`;
}