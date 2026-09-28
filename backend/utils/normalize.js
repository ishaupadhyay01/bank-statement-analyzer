const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Accepts 2026-08-01, 01/08/2026, 01-08-2026 (day first), and 01 Aug 2026
export function parseDate(value) {
  const s = String(value ?? "").trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dmy = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  const dMonY = s.match(/^(\d{2})[ -]([A-Za-z]{3})[ -](\d{4})$/);

  let day, month, year;
  if (iso) {
    [year, month, day] = [+iso[1], +iso[2] - 1, +iso[3]];
  } else if (dmy) {
    [day, month, year] = [+dmy[1], +dmy[2] - 1, +dmy[3]];
  } else if (dMonY) {
    [day, month, year] = [+dMonY[1], MONTHS[dMonY[2].toLowerCase()], +dMonY[3]];
  } else {
    return null;
  }

  if (month === undefined) return null;

  // Use UTC so the date doesn't shift by a day depending on timezone
  const d = new Date(Date.UTC(year, month, day));
  // Reject impossible dates like 31 Feb (JS would silently roll them over)
  return d.getUTCDate() === day ? d : null;
}

// "1,299.00" or "₹1299" -> 1299
export function parseAmount(value) {
  const n = parseFloat(String(value ?? "").replace(/[₹$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

// Takes a raw row from ANY parser, returns a clean transaction or null if unusable
export function normalizeTransaction(row) {
  const date = parseDate(row.date);
  const description = String(row.description ?? "").trim();
  const amount = parseAmount(row.amount);
  if (!date || !description || amount === null) return null;

  let type = String(row.type ?? "").trim().toLowerCase();
  if (type === "cr" || type === "credit") type = "credit";
  else if (type === "dr" || type === "debit") type = "debit";
  else if (type === "") type = amount < 0 ? "debit" : "credit"; // no type column: use the sign
  else return null;

  return { date, description, amount: Math.abs(amount), type };
}