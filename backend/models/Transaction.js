import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true }, // always positive
    type: { type: String, enum: ["credit", "debit"], required: true },
    category: { type: String, default: "Uncategorized" }, // filled by the LLM on Day 5
    source: { type: String, enum: ["csv", "pdf"], required: true },
    uploadId: { type: String, required: true }, // groups all rows from one upload
    fileName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);