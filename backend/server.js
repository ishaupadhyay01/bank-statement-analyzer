import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

import Transaction from "./models/Transaction.js";
import { parseCsv } from "./parsers/csvParser.js";
import { parsePdf } from "./parsers/pdfParser.js";
import { normalizeTransaction } from "./utils/normalize.js";
import { categorizeBatch } from "./services/categorizer.js";
import { getSpendByCategory, getMonthlyTotals, getTopMerchants, getBalance, getSavingsSuggestion } from "./services/analytics.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => res.send("Statement Analyzer API running"));
app.get("/analytics/summary", async (req, res) => {
  try {
    const transactions = await Transaction.find();

    res.json({
      spendByCategory: getSpendByCategory(transactions),
      monthlyTotals: getMonthlyTotals(transactions),
      topMerchants: getTopMerchants(transactions),
      balance: getBalance(transactions),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});


app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const name = req.file.originalname.toLowerCase();
    let source, rawRows;

    if (name.endsWith(".csv")) {
      source = "csv";
      rawRows = await parseCsv(req.file.buffer);
    } else if (name.endsWith(".pdf")) {
      source = "pdf";
      rawRows = await parsePdf(req.file.buffer);
    } else {
      return res.status(400).json({ error: "Only CSV and PDF files are supported" });
    }

    const uploadId = randomUUID();
    const transactions = [];
    let skipped = 0;

    for (const row of rawRows) {
      const tx = normalizeTransaction(row);
      if (tx) {
        transactions.push({ ...tx, source, uploadId, fileName: req.file.originalname });
      } else {
        skipped++;
      }
    }

   if (transactions.length === 0) {
  return res.status(422).json({
    error:
      rawRows.length === 0
        ? "Couldn't find any transaction rows in this file. Check that it's a real bank statement export."
        : `Found ${rawRows.length} row(s) in the file, but none matched the expected format. This statement's layout may not be supported yet.`,
  });
}

    const categorized = await categorizeBatch(transactions);

    const saved = await Transaction.insertMany(categorized);
    res.json({ uploadId, source, count: saved.length, skipped, transactions: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process file" });
  }
});

// Quick way to check what's stored
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).limit(100);
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));