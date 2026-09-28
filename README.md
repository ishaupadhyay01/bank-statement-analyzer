# Bank Statement Analyzer

A full-stack app that parses bank statements (CSV or PDF), uses an LLM to
categorize each transaction, and displays spending analytics on a dashboard.

## Architecture

| Stage | What happens | Where |
|---|---|---|
| **Upload** | User drops a CSV/PDF onto the frontend; the file is sent to the backend and held in memory (no disk writes) | `UploadForm.jsx` → `POST /upload` |
| **Parse** | The file is read into raw `{date, description, amount, type}` rows — a dedicated parser per file type | `parsers/csvParser.js`, `parsers/pdfParser.js` |
| **Normalize** | Raw rows (still strings) are cleaned into real dates, numeric amounts, and standardized credit/debit types | `utils/normalize.js` |
| **LLM Categorize** | Transactions are batched into a single prompt and sent to Google's Gemini API, which returns a category per transaction from a fixed list. Failures (network errors, malformed responses) fall back to `"Uncategorized"` rather than blocking the upload | `services/categorizer.js` |
| **Store** | Categorized transactions are saved to MongoDB in one shared schema, regardless of whether they came from a CSV or a PDF | `models/Transaction.js` |
| **Analyze** | On request, all transactions are aggregated into spend-by-category, monthly income/expense, top merchants, and a rule-based savings suggestion | `services/analytics.js` → `GET /analytics/summary` |
| **Display** | A React dashboard shows the transaction table (color-coded by category), a spend-by-category donut chart, a monthly trend line chart, and the savings insight | `App.jsx` and `components/` |

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **LLM:** Google Gemini API (free tier)
- **File parsing:** `csv-parser`, `pdf-parse`

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas connection string)
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`: