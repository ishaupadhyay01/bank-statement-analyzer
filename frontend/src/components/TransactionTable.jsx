import { useEffect, useState } from "react";
import api from "../api/client";
import { getCategoryHex } from "../utils/categoryColors";

export default function TransactionTable({ refreshKey }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [refreshKey]);

  if (loading) {
    return <p className="text-sm text-muted py-8 text-center">Loading transactions…</p>;
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted py-8 text-center">
        No transactions yet — upload a statement to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const hex = getCategoryHex(tx.category);
            const isCredit = tx.type === "credit";

            return (
              <tr key={tx._id} className="border-b border-line last:border-0 hover:bg-paper">
                <td className="px-4 py-3 text-muted whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-ink">{tx.description}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${hex}1A`, color: hex }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hex }} />
                    {tx.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted/70 text-xs">{tx.source}</td>
                <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${isCredit ? "text-primary" : "text-ink"}`}>
                  {isCredit ? "+" : "−"}₹{tx.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}