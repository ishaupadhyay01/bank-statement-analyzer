export default function SavingsInsight({ suggestion }) {
  if (!suggestion) return null;

  const message =
    suggestion.type === "increase" ? (
      <>
        You spent <strong>{suggestion.percentChange}% more</strong> on <strong>{suggestion.category}</strong> this
        month (₹{suggestion.thisMonthTotal.toLocaleString("en-IN")}) than last month (₹
        {suggestion.lastMonthTotal.toLocaleString("en-IN")}).
      </>
    ) : (
      <>
        Your top spending category is <strong>{suggestion.category}</strong>, at ₹
        {suggestion.amount.toLocaleString("en-IN")}. Worth a second look if you're trying to cut back.
      </>
    );

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
      {message}
    </div>
  );
}