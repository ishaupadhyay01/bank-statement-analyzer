import { useState } from "react";
import UploadForm from "./components/UploadForm";
import TransactionTable from "./components/TransactionTable";
import AnalyticsPanel from "./components/AnalyticsPanel";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpload, setLastUpload] = useState(null);

  function handleUploadSuccess(data) {
    setLastUpload(data);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-ink px-6 py-5">
        <h1 className="font-serif text-2xl text-paper tracking-tight">Statement Analyzer</h1>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <UploadForm onUploadSuccess={handleUploadSuccess} />

        {lastUpload && (
          <p className="text-sm text-muted">
            Added {lastUpload.count} transactions from {lastUpload.source.toUpperCase()}
            {lastUpload.skipped > 0 && ` (${lastUpload.skipped} rows skipped)`}
          </p>
        )}

        <AnalyticsPanel refreshKey={refreshKey} />
        <TransactionTable refreshKey={refreshKey} />
      </main>
    </div>
  );
}