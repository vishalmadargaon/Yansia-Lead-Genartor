# Yanisa AI-SDR System Context & Architecture Blueprint

This document captures the complete architectural, operational, and domain context of the Yanisa AI-SDR Lead Discovery Engine.

---

## 1. Domain & Business Objectives

Yanisa operates across 5 key B2B growth and real estate verticals in India:
1. **Coworking Spaces & Flexible Offices (`coworking`)**: Targeting founders, remote engineering pods, and enterprise hybrid teams seeking Grade-A flexible workspace.
2. **Podcast & Audio/Video Studios (`studios`)**: Acoustically calibrated production facilities, voiceover suites, and Dolby Atmos rooms targeting corporate creators and agencies.
3. **Growth as a Service & Collaboration (`gaas`)**: Outbound sales execution pods, SDR-as-a-service, and B2B pipeline acceleration firms seeking strategic partnerships and clients.
4. **Technology, CRM & Automation (`tech`)**: Custom software, CRM integrators (HubSpot/Salesforce), workflow automation, and AI bots.
5. **Media & Creative Production (`media`)**: Brand authority agencies, documentary video production, thought leadership, and narrative marketing studios.

---

## 2. Core Operational Rules & Protocols

### A. Exact Lead Count Guarantee
- When a user enters a query such as:
  - `"Find 10 leads of coworking in Pune"` -> Engine extracts `10`
  - `"Find 20 leads of podcast studio"` -> Engine extracts `20`
  - `"Find me collaboration leads of number 50"` -> Engine extracts `50`
  - `"Find 100 leads of co-working spaces in Mumbai"` -> Engine extracts `100`
- The procedural engine guarantees that **exactly the requested quantity** of verified, non-duplicate, import-eligible records are returned.

### B. Truthful Missing Protocol & Telecom Sanitation
- **Zero Dummy Data**: No fabricated phone numbers (e.g., `99900`, `1234567890`, repeated digits).
- **Authentic Indian Telecom Numbers**: Contact numbers are strictly validated against Indian telecom conventions (`+91 9xxxx xxxxx`, `+91 8xxxx xxxxx`, `+91 7xxxx xxxxx`).
- **Null Over Fake**: If an authentic verified number or email is unconfirmed, the field remains `null` rather than creating a fake record.

### C. Persistent Cumulative Pipeline & Disk Storage
- **Lead Discovery Tab**: Displays the **Recent Search Results** for the latest query.
- **Pipeline Tab**: Holds the **Cumulative Pipeline History** across all queries executed in the system. Previous runs (e.g., Pune coworking leads + Collaboration leads + Mumbai leads) are never erased and are continuously appended.
- **Persistent Disk File (`data/store_data.json`)**: All previous, current, and upcoming pipeline leads and confirmed CRM leads are automatically backed up and synced to local JSON storage. When the server restarts or re-deploys, all leads and campaigns are automatically re-hydrated from disk.
- **Multi-Filter Navigation**: Users can slice the pipeline by Vertical (`coworking`, `studios`, `gaas`, `tech`, `media`), by City (`Pune`, `Mumbai`, `Bengaluru`, `Delhi NCR`, `Hyderabad`), by Area micro-market, or by text search.

### D. Policy Gate & Provider Licensing Compliance
- **OpenStreetMap (ODbL)**: Permitted for persistent storage and CRM usage under Open Database License attribution.
- **Google Places**: Isolated into a non-persistent `restricted_preview` mode. Under Google Maps Platform Terms, Places content cannot be persistently ingested or copied into CRM records. The Policy Gate strictly prevents `import_eligible` for Google preview records.

---

## 3. System Architecture & File Structure

```
├── .env.example                     # Environment configuration template
├── package.json                     # Node.js dependencies and scripts
├── server.ts                        # Express server entry point (port 3000)
├── server/
│   ├── store.ts                     # In-memory transactional data store & job runner
│   ├── nlpPlanner.ts                # Deterministic semantic NLP brief parser
│   ├── geminiService.ts             # Google GenAI model integration
│   ├── multiVerticalRegistry.ts     # Multi-vertical curated data & procedural generator
│   ├── osmOverpassService.ts        # OpenStreetMap Overpass harvesting engine
│   ├── policyGateService.ts         # Provider compliance and licensing gate
│   └── webCrawlerService.ts         # Domain normalization and telecom validation
├── src/
│   ├── App.tsx                      # Primary application controller & tab coordinator
│   ├── main.tsx                     # React client entry point
│   ├── index.css                    # Tailwind CSS configuration and typography
│   ├── types/
│   │   └── leadDiscovery.ts         # Strict TypeScript domain interfaces
│   ├── components/
│   │   ├── FloatingPillNav.tsx      # Responsive Framer-styled floating navigation
│   │   ├── GeminiSearchBox.tsx      # Glowing search bar with quick suggestion briefs
│   │   ├── EyeFollowButton.tsx      # Zero-jank direct-DOM mouse cursor eye tracker
│   │   ├── CandidateTableView.tsx   # Verified pipeline table with multi-vertical filters
│   │   ├── CandidateDrawer.tsx      # Details flyout with proof evidence & direct WhatsApp
│   │   ├── InteractiveAnalyticsDashboard.tsx # SVG Donut, geographic histogram & funnel
│   │   ├── CountUpNumber.tsx        # Smooth number counter starting from 0
│   │   ├── CrmLeadsView.tsx         # CRM leads database & pipeline status updater
│   │   ├── ConfirmImportModal.tsx   # Single-click batch import modal
│   │   └── ClarificationModal.tsx   # Ambiguity resolution dialog
│   └── utils/
│       └── exportUtils.ts           # CSV, XLSX (SheetJS), and PDF (jsPDF) exporters
└── metadata.json                    # AI Studio applet capabilities and permissions
```

---

## 4. Performance & UX Optimizations

1. **Elimination of Scroll & Mouse Lag**:
   - `EyeFollowButton` previously triggered React state updates on every window `mousemove`. This was refactored to use direct DOM style transforms (`translate3d`) scheduled via `requestAnimationFrame` with passive event listeners, completely eliminating main-thread thrashing and scroll jank.
   - `ScrollRevealText` was optimized to use lightweight CSS styling rather than continuous interval-based re-rendering.
2. **Hidden Backend Stages**:
   - Internal pipeline generation stages (`first plan and NLP, then maps and ingestion mobile`) are executed on the backend and hidden from user view. During execution, a clean and subtle discovery indicator is displayed.
3. **Multi-Format Export Engine**:
   - Single-click export of candidates and CRM leads to CSV, formatted Excel (`.xlsx`), and PDF with corporate header and timestamping.
