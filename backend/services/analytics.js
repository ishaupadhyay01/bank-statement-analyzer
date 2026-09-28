// --- Total spend by category ---
// Only debits count as "spend" — income shouldn't dilute the category breakdown.
export function getSpendByCategory(transactions) {
  const debits = transactions.filter((tx) => tx.type === "debit");

  const totals = debits.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Turn { Food: 1000, Rent: 15000 } into a sorted array, easiest shape for a chart
  return Object.entries(totals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

// --- Monthly totals: income vs expense per month ---
export function getMonthlyTotals(transactions) {
  const months = transactions.reduce((acc, tx) => {
    const month = tx.date.toISOString().slice(0, 7); // "2026-08"
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };

    if (tx.type === "credit") acc[month].income += tx.amount;
    else acc[month].expense += tx.amount;

    return acc;
  }, {});

  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
}

// --- Top merchants ---
// Bank descriptions often carry a trailing order/reference number
// ("ZOMATO ORDER 88412"), which would otherwise split one merchant
// into many separate entries. Strip that off before grouping.
function normalizeMerchant(description) {
  return description
    .replace(/\s*(order|txn|ref|no|id)?\s*#?\d{3,}$/i, "") // trailing order/ref numbers
    .trim();
}

export function getTopMerchants(transactions, limit = 5) {
  const debits = transactions.filter((tx) => tx.type === "debit");

  const totals = debits.reduce((acc, tx) => {
    const merchant = normalizeMerchant(tx.description);
    if (!acc[merchant]) acc[merchant] = { merchant, total: 0, count: 0 };
    acc[merchant].total += tx.amount;
    acc[merchant].count += 1;
    return acc;
  }, {});

  return Object.values(totals)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// --- Income vs expense balance ---
export function getBalance(transactions) {
  const totalIncome = transactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return { totalIncome, totalExpense, net: totalIncome - totalExpense };
}
// --- Savings suggestion ---
// Compares this month's category spend to last month's. If one category
// jumped noticeably, flag it. Otherwise, just point out the biggest category overall.
export function getSavingsSuggestion(transactions) {
  const debits = transactions.filter((tx) => tx.type === "debit");
  if (debits.length === 0) return null;

  // Group spend by month, then by category within each month
  const byMonth = debits.reduce((acc, tx) => {
    const month = tx.date.toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = {};
    acc[month][tx.category] = (acc[month][tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const months = Object.keys(byMonth).sort(); // oldest -> newest

  if (months.length >= 2) {
    const lastMonth = byMonth[months[months.length - 2]];
    const thisMonth = byMonth[months[months.length - 1]];

    let biggest = null;
    for (const category of Object.keys(thisMonth)) {
      const lastAmt = lastMonth[category];
      if (!lastAmt) continue; // no baseline last month — nothing to compare against
      const percentChange = ((thisMonth[category] - lastAmt) / lastAmt) * 100;

      if (percentChange > 15 && (!biggest || percentChange > biggest.percentChange)) {
        biggest = { category, thisAmt: thisMonth[category], lastAmt, percentChange };
      }
    }

    if (biggest) {
      return {
        type: "increase",
        category: biggest.category,
        thisMonthTotal: biggest.thisAmt,
        lastMonthTotal: biggest.lastAmt,
        percentChange: Math.round(biggest.percentChange),
      };
    }
  }

  // Fallback: no significant month-over-month jump (or not enough history) —
  // just point at the single biggest category overall.
  const [topCategory] = getSpendByCategory(transactions);
  return topCategory ? { type: "top-category", category: topCategory.category, amount: topCategory.total } : null;
}