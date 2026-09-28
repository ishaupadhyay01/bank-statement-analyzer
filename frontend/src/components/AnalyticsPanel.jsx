import { useEffect, useState } from "react";
import api from "../api/client";
import SpendByCategoryChart from "./SpendByCategoryChart";
import MonthlyTrendChart from "./MonthlyTrendChart";
import SavingsInsight from "./SavingsInsight";

export default function AnalyticsPanel({ refreshKey }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get("/analytics/summary");
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    }
    fetchAnalytics();
  }, [refreshKey]);

  if (!analytics) return null;

  return (
    <div className="space-y-4">
      <SavingsInsight suggestion={analytics.savingsSuggestion} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="font-serif text-base text-ink mb-2">Spend by category</h2>
          <SpendByCategoryChart data={analytics.spendByCategory} />
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <h2 className="font-serif text-base text-ink mb-2">Monthly trend</h2>
          <MonthlyTrendChart data={analytics.monthlyTotals} />
        </div>
      </div>
    </div>
  );
}