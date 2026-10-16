# Yanisa AI-SDR | Lead Discovery & Pipeline Engine

Production-grade, zero-cost AI-SDR Lead Discovery Engine for discovering authentic B2B leads across Indian commercial corridors (Mumbai, Pune, Bengaluru, Delhi NCR, Hyderabad, and more).

Combines Google Gemini AI reasoning, OpenStreetMap Overpass harvesting, live domain web crawling, policy-governed data isolation, and one-click CRM import with multi-format export capabilities (CSV, Excel, and PDF).

---

## Architecture Overview

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, jsPDF, and XLSX.
- **Backend**: Node.js & Express server running on port 3000 with Vite middleware in development and serving static production assets from `dist/` in production.
- **AI Engine**: Google GenAI SDK (`gemini-3.1-flash-lite` / `gemini-3.8-flash`) with automatic fallback to deterministic NLP extraction.
- **Geospatial & Registry**: OpenStreetMap Overpass nodes & curated commercial registries for all 5 Yanisa verticals.
- **Data Governance**: Strict Policy Gate enforcing provider compliance, Truthful Missing Protocol (zero fabricated numbers, null placeholders for unverified data), and anti-duplication guards across phone lines, web domains, and business entities.

---

## Key Features

1. **Exact Quota Matching on Every Query**
   - Natural language prompt parsing automatically extracts the user's requested lead count (e.g., `10`, `20`, `50`, `100`).
   - The harvest engine guarantees that the exact quantity of verified, eligible leads requested is returned every time.

2. **5 Specialized B2B Verticals**
   - **Coworking Spaces**: Grade-A hubs, managed workspaces, enterprise executive centers.
   - **Podcast & Audio/Video Studios**: Acoustically treated recording stages, podcast suites, Dolby Atmos facilities.
   - **GaaS (Growth as a Service & Collaboration)**: High-growth B2B firms, SDR-as-a-service, outbound pipeline execution.
   - **Tech & Software**: CRM automation, cloud modernizers, custom software engineering, AI workflow builders.
   - **Media & Creative**: Content agencies, brand authority houses, video production, executive storytelling.

3. **Persistent Cumulative Pipeline History**
   - **Lead Discovery Tab**: Displays recent results from the latest search query.
   - **Pipeline Tab**: Keeps all leads accumulated across all searches (Pune, Mumbai, Bengaluru, etc.). Prior searches are never erased.
   - Multi-dimensional filters by Vertical, City, Area, and search keyword.

4. **Interactive SVG Analytics Dashboard**
   - Micro-Market Geographic Bar Chart with click-to-filter capability.
   - Contact Verification Split Donut Ring (Direct Mobile vs. Landline vs. Missing).
   - Pipeline Conversion Funnel Graph.
   - Lead Fit Score Distribution Histogram.
   - Animated KPI cards counting up from 0 on load.

5. **CRM & Multi-Format Exports**
   - One-click batch confirm and import into the Yanisa CRM.
   - Direct communication triggers: WhatsApp web redirect with authentic Indian mobile numbers (+91 9/8/7), Google Maps routing, and email.
   - Instant export of any filtered slice or entire cohort to CSV, Microsoft Excel (`.xlsx`), or PDF report.

---

## End-to-End Setup Instructions

### Prerequisites
- Node.js version 18.0.0 or higher
- npm (Node Package Manager)

### 1. Clone & Install Dependencies
```bash
git clone <repository_url>
cd yanisa-lead-discovery

npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env` or set your environment variables:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, the application automatically uses its local deterministic NLP and commercial harvest engine).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Express server serves both the backend API and the hot-reloading Vite frontend.

### 4. Build for Production
```bash
npm run build
```
This compiles the TypeScript code and produces production assets in `dist/`.

### 5. Start Production Server
```bash
npm start
```
The server will boot on port 3000 (or `process.env.PORT`) serving the compiled single-page application and backend API routes.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai-sdr/campaigns` | `POST` | Parses natural language brief and creates a new discovery campaign |
| `/api/ai-sdr/campaigns` | `GET` | Returns list of recent discovery campaigns |
| `/api/ai-sdr/campaigns/:id` | `GET` | Returns campaign status and real-time progress |
| `/api/ai-sdr/campaigns/:id/run` | `POST` | Executes async harvest, deduplication, and scoring |
| `/api/ai-sdr/campaigns/:id/cancel` | `POST` | Cancels an active discovery job |
| `/api/ai-sdr/campaigns/:id/candidates` | `GET` | Retrieves staging candidate leads for a specific campaign |
| `/api/ai-sdr/pipeline/candidates` | `GET` | Retrieves all cumulative pipeline candidates across all searches |
| `/api/ai-sdr/campaigns/:id/confirm-import` | `POST` | Transactionally imports candidates into persistent CRM |
| `/api/ai-sdr/leads` | `GET` | Fetches active CRM leads database |
| `/api/ai-sdr/leads/:id/status` | `PATCH` | Updates CRM lead pipeline stage (NEW, CONTACTED, QUALIFIED, WON, ARCHIVED) |
| `/api/ai-sdr/leads/:id` | `DELETE` | Removes a lead from the CRM |
| `/api/ai-sdr/policy-profiles` | `GET` | Inspects active provider data licensing terms and policy rules |

---

## License
Proprietary & Confidential - Yanisa AI-SDR.
