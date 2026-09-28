import { useState, useRef } from "react";
import api from "../api/client";

export default function UploadForm({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  async function uploadFile(file) {
    if (!file) return;

    const validExt = /\.(csv|pdf)$/i.test(file.name);
    if (!validExt) {
      setStatus("error");
      setErrorMsg("Only CSV and PDF files are supported.");
      return;
    }

    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData);
      setStatus("idle");
      onUploadSuccess(res.data);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.response?.data?.error || "Upload failed. Please try again.");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-line bg-white hover:border-ink/30"}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.pdf"
        className="hidden"
        onChange={(e) => uploadFile(e.target.files[0])}
      />

      {status === "uploading" ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
          <p className="text-sm text-muted">Reading and categorizing your statement…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-ink font-medium">Drop a bank statement here, or click to browse</p>
          <p className="text-sm text-muted">CSV or PDF</p>
        </div>
      )}

      {status === "error" && (
        <p className="mt-4 text-sm text-accent">{errorMsg}</p>
      )}
    </div>
  );
}