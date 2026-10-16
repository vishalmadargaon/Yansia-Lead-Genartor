/**
 * Yanisa AI-SDR Full-Stack Server
 * Express Server mounting API routes and Vite middleware on port 3000.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { dataStore } from './server/store.ts';
import { PROVIDER_POLICIES } from './server/policyGateService.ts';
import { WebCrawlerService } from './server/webCrawlerService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes for AI-SDR Lead Discovery

// 1. Create campaign from prompt
app.post('/api/ai-sdr/campaigns', async (req, res) => {
  try {
    const { prompt, overrides } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }
    const campaign = await dataStore.createCampaign(prompt, overrides);
    res.json(campaign);
  } catch (err: any) {
    console.error('Failed to create campaign:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. List recent campaigns
app.get('/api/ai-sdr/campaigns', (req, res) => {
  res.json(dataStore.getAllCampaigns());
});

// 3. Get campaign details & progress
app.get('/api/ai-sdr/campaigns/:id', (req, res) => {
  const campaign = dataStore.getCampaign(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  const progress = dataStore.getProgress(req.params.id);
  res.json({ campaign, progress });
});

// 4. Run discovery job asynchronously
app.post('/api/ai-sdr/campaigns/:id/run', (req, res) => {
  const campaign = dataStore.getCampaign(req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  // Start job asynchronously in background
  dataStore.runDiscoveryJob(req.params.id).catch(err => {
    console.error(`Background discovery job error for ${req.params.id}:`, err);
  });

  res.json({ message: 'Discovery job initiated', status: 'RUNNING' });
});

// 5. Cancel running job
app.post('/api/ai-sdr/campaigns/:id/cancel', (req, res) => {
  const success = dataStore.cancelJob(req.params.id);
  res.json({ success, message: success ? 'Job cancelled' : 'No active job found' });
});

// 6. Get candidates for a campaign
app.get('/api/ai-sdr/campaigns/:id/candidates', (req, res) => {
  const candidates = dataStore.getCandidates(req.params.id);
  res.json(candidates);
});

// 6b. Get all cumulative pipeline candidates across searches
app.get('/api/ai-sdr/pipeline/candidates', (req, res) => {
  res.json(dataStore.getAllPipelineCandidates());
});

// 7. One-click batch confirm & import into CRM (Atomic transaction)
app.post('/api/ai-sdr/campaigns/:id/confirm-import', (req, res) => {
  try {
    const { confirmed_by } = req.body;
    const result = dataStore.confirmImport(req.params.id, confirmed_by || 'Campaign User');
    res.json(result);
  } catch (err: any) {
    console.error('Batch import transaction failed:', err);
    res.status(500).json({ error: err.message || 'Import failed' });
  }
});

// 8. CRM Leads endpoints
app.get('/api/ai-sdr/leads', (req, res) => {
  res.json(dataStore.getCrmLeads());
});

app.patch('/api/ai-sdr/leads/:id/status', (req, res) => {
  const { status } = req.body;
  const lead = dataStore.updateLeadStatus(req.params.id, status);
  if (!lead) {
    res.status(404).json({ error: 'Lead not found' });
    return;
  }
  res.json(lead);
});

app.delete('/api/ai-sdr/leads/:id', (req, res) => {
  const success = dataStore.deleteLead(req.params.id);
  res.json({ success });
});

// 9. Audit event logs
app.get('/api/ai-sdr/audit-logs', (req, res) => {
  res.json(dataStore.getAuditLogs());
});

// 10. Provider policy registry
app.get('/api/ai-sdr/policy-profiles', (req, res) => {
  res.json(PROVIDER_POLICIES);
});

// 11. Live HTTP Domain Web Scraper Test
app.post('/api/ai-sdr/scrape-preview', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    const crawlResult = await WebCrawlerService.crawlDomain(url);
    res.json(crawlResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scrape failed' });
  }
});

// Mount Vite or serve static production build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yanisa AI-SDR server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
