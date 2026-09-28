import pdf from "pdf-parse/lib/pdf-parse.js";

// Matches lines like: "02 Sep 2026 SALARY ACME TECH PVT LTD 65,000.00 CR"
const LINE_REGEX =
  /^(\d{2}[ \/-](?:\d{2}|[A-Za-z]{3})[ \/-]\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)$/i;

export async function parsePdf(buffer) {
  const data = await pdf(buffer);
  const lines = data.text.split("\n").map((l) => l.trim()).filter(Boolean);

  const rows = [];
  for (const line of lines) {
    const m = line.match(LINE_REGEX);
    if (m) {
      rows.push({ date: m[1], description: m[2], amount: m[3], type: m[4] });
    }
  }
  return rows;
}