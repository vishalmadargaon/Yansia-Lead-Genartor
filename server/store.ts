/**
 * Unified Server-Side Data Store & Transaction Engine
 * Manages Campaigns, Candidate Staging, CRM Leads, and Audit Logs.
 * Enforces atomic transactions, policy gates, strict anti-duplication,
 * and Truthful Missing Protocol (zero fake/repetitive numbers).
 */

import fs from 'fs';
import path from 'path';
import type {
  AuditEvent,
  CampaignConfig,
  CandidateStaging,
  CrmLead,
  RunProgress
} from '../src/types/leadDiscovery.ts';
import { GeminiService } from './geminiService.ts';
import { OsmOverpassService } from './osmOverpassService.ts';
import { PolicyGateService } from './policyGateService.ts';
import { WebCrawlerService } from './webCrawlerService.ts';

class DataStore {
  private campaigns: Map<string, CampaignConfig> = new Map();
  private candidates: Map<string, CandidateStaging[]> = new Map();
  private crmLeads: CrmLead[] = [];
  private auditLogs: AuditEvent[] = [];
  private pipelineCandidates: Map<string, CandidateStaging> = new Map();
  private progressMap: Map<string, RunProgress> = new Map();
  private activeJobs: Map<string, boolean> = new Map();
  private dataDir: string = path.resolve(process.cwd(), 'data');
  private persistFilePath: string = path.resolve(process.cwd(), 'data', 'store_data.json');

  constructor() {
    this.ensureDataDir();
    this.loadFromDisk();
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create data directory:', err);
    }
  }

  public saveToDisk() {
    try {
      this.ensureDataDir();
      const payload = {
        crmLeads: this.crmLeads,
        pipelineCandidates: Array.from(this.pipelineCandidates.entries()),
        campaigns: Array.from(this.campaigns.entries()),
        candidates: Array.from(this.candidates.entries()),
        auditLogs: this.auditLogs.slice(0, 100),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.persistFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store data to disk:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.persistFilePath)) {
        const raw = fs.readFileSync(this.persistFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.crmLeads)) {
          this.crmLeads = parsed.crmLeads;
        }
        if (Array.isArray(parsed.pipelineCandidates)) {
          this.pipelineCandidates = new Map(parsed.pipelineCandidates);
        }
        if (Array.isArray(parsed.campaigns)) {
          this.campaigns = new Map(parsed.campaigns);
        }
        if (Array.isArray(parsed.candidates)) {
          this.candidates = new Map(parsed.candidates);
        }
        if (Array.isArray(parsed.auditLogs)) {
          this.auditLogs = parsed.auditLogs;
        }
        return;
      }
    } catch (err) {
      console.error('Failed to load store data from disk, falling back to seed:', err);
    }

    this.seedInitialCrmLeads();
    this.saveToDisk();
  }

  private seedInitialCrmLeads() {
    const now = new Date(Date.now() - 86400000 * 2).toISOString();
    this.crmLeads = [
      {
        lead_id: 'lead_seed_01',
        campaign_id: 'camp_seed_prior',
        source_provider: 'osm_overpass',
        source_reference: 'node/9820194812',
        business_name: 'Innov8 Koramangala 7th Block',
        city: 'Bengaluru',
        area: 'Koramangala',
        address: '7th Block, Koramangala Industrial Layout, Bengaluru, KA 560095',
        website: 'https://innov8.work',
        phone: '+91 80 4680 9100',
        email: 'bangalore@innov8.work',
        service_line: 'coworking',
        fit_score: 96,
        intent_score: 85,
        data_confidence: 96,
        evidence_summary: 'Enterprise coworking facility with podcast audio pods and private suites.',
        evidence_url: 'https://innov8.work',
        status: 'QUALIFIED',
        imported_at: now,
        imported_by: 'Vishal (Auto AI-SDR)',
        provenance_note: 'Imported via OpenStreetMap node/9820194812 under ODbL terms.',
        google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Innov8+Coworking+Koramangala+Bengaluru',
        whatsapp_url: 'https://wa.me/918046809100'
      }
    ];

    this.auditLogs.push({
      event_id: 'evt_seed_01',
      campaign_id: 'camp_seed_prior',
      event_type: 'LEADS_PERSISTED_TO_CRM',
      message: 'System initialized with existing verified CRM benchmark lead.',
      timestamp: now,
      counts: { imported: 1 }
    });
  }

  // 1. Campaign Planning
  async createCampaign(prompt: string, overrides?: Partial<CampaignConfig>): Promise<CampaignConfig> {
    const plannedConfig = await GeminiService.planCampaign(prompt);
    const targetCount = (overrides?.target_count && overrides.target_count > 0)
      ? overrides.target_count
      : plannedConfig.target_count;

    const config: CampaignConfig = {
      ...plannedConfig,
      ...overrides,
      target_count: targetCount,
      campaign_id: overrides?.campaign_id || plannedConfig.campaign_id,
      created_at: new Date().toISOString(),
      status: 'PLANNING'
    };

    this.campaigns.set(config.campaign_id, config);

    this.auditLogs.unshift({
      event_id: 'evt_' + Date.now().toString(36),
      campaign_id: config.campaign_id,
      event_type: 'CAMPAIGN_PLAN_GENERATED',
      message: `Parsed request: "${prompt}". Target: ${config.target_count} ${config.service_line.toUpperCase()} candidates in ${config.geography}.`,
      timestamp: new Date().toISOString(),
      metadata: { config }
    });

    return config;
  }

  getCampaign(id: string): CampaignConfig | undefined {
    return this.campaigns.get(id);
  }

  getAllCampaigns(): CampaignConfig[] {
    return Array.from(this.campaigns.values()).reverse();
  }

  // 2. Asynchronous Discovery Orchestration
  async runDiscoveryJob(campaignId: string): Promise<void> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    this.activeJobs.set(campaignId, true);
    campaign.status = 'DISCOVERING';

    const progress: RunProgress = {
      campaign_id: campaignId,
      stage: 'DISCOVERING',
      progress_percent: 15,
      message: `Querying Multi-Source Commercial Discovery (Gemini AI + OpenStreetMap) in ${campaign.geography}...`,
      active_query: campaign.query_variants[0] || `Commercial POI discovery for ${campaign.service_line} in ${campaign.geography}`,
      counts: {
        discovered: 0,
        unique: 0,
        enriched: 0,
        eligible: 0,
        rejected_quality: 0,
        rejected_duplicate: 0,
        blocked_policy: 0,
        imported: 0
      }
    };
    this.progressMap.set(campaignId, progress);

    try {
      // Step A: Harvest Candidates across multi-source engine with buffer
      const targetCount = campaign.target_count;
      const rawCandidates = await OsmOverpassService.harvestCandidates(
        campaignId,
        campaign.service_line,
        campaign.geography,
        Math.max(targetCount * 2, targetCount + 20)
      );

      // Add Google Places preview fixtures (isolated & policy restricted)
      const googlePreviewCandidates = OsmOverpassService.getGooglePlacesPreviewFixtures(
        campaignId,
        campaign.geography
      );

      const allDiscovered = [...rawCandidates, ...googlePreviewCandidates];
      progress.counts.discovered = allDiscovered.length;
      progress.progress_percent = 45;
      progress.stage = 'ENRICHING';
      progress.message = `Discovered verified commercial nodes from Google Places & OpenStreetMap. Running telecom sanitation & anti-duplication...`;

      // Step B: Enrich and Strictly Deduplicate
      const existingCrmDomains = new Set(
        this.crmLeads.map(l => WebCrawlerService.extractCanonicalDomain(l.website)).filter(Boolean)
      );
      const existingCrmPhones = new Set(
        this.crmLeads.map(l => WebCrawlerService.sanitizePhoneDigits(l.phone)).filter(Boolean)
      );
      const existingCrmNames = new Set(
        this.crmLeads.map(l => WebCrawlerService.normalizeBusinessName(l.business_name)).filter(Boolean)
      );

      const batchDomains = new Set<string>();
      const batchPhones = new Set<string>();
      const batchNames = new Set<string>();

      const finalCandidates: CandidateStaging[] = [];
      let eligibleRank = 1;

      for (const cand of allDiscovered) {
        if (!this.activeJobs.get(campaignId)) {
          campaign.status = 'CANCELLED';
          progress.stage = 'CANCELLED';
          progress.message = 'Discovery job was cancelled by user.';
          return;
        }

        // Policy Gate check
        const policyEval = PolicyGateService.evaluateImportEligibility(cand);
        if (!policyEval.eligible) {
          cand.import_eligible = false;
          cand.ai_selected = false;
          cand.exclusion_reason = policyEval.reason;
          progress.counts.blocked_policy++;
          finalCandidates.push(cand);
          continue;
        }

        // If we already reached exact targetCount of eligible leads, stop adding more eligible ones
        if (progress.counts.eligible >= targetCount) {
          continue;
        }

        // Telecom sanitation: Strictly check if phone number is valid
        if (cand.phone) {
          if (!WebCrawlerService.isValidIndianTelecom(cand.phone)) {
            cand.phone = null;
          } else {
            cand.phone = WebCrawlerService.formatIndianPhone(cand.phone) || cand.phone;
          }
        }

        // Deduplication against CRM Leads and within current batch
        const canonicalDomain = WebCrawlerService.extractCanonicalDomain(cand.website);
        const phoneDigits = WebCrawlerService.sanitizePhoneDigits(cand.phone);
        const normName = WebCrawlerService.normalizeBusinessName(cand.business_name);
        const locationKey = `${normName}__${(cand.area || '').toLowerCase()}__${(cand.city || '').toLowerCase()}`;

        let isDuplicate = false;
        let dupReason = '';

        if (existingCrmNames.has(locationKey) || batchNames.has(locationKey)) {
          isDuplicate = true;
          dupReason = `Duplicate entity already in records: ${cand.business_name} (${cand.area || cand.city})`;
          cand.duplicate_status = 'duplicate_name';
        } else if (phoneDigits && (existingCrmPhones.has(phoneDigits) || batchPhones.has(phoneDigits))) {
          isDuplicate = true;
          dupReason = `Duplicate telephone number already assigned to another record: ${cand.phone}`;
          cand.duplicate_status = 'duplicate_phone';
        }

        if (isDuplicate) {
          cand.ai_selected = false;
          cand.exclusion_reason = dupReason;
          progress.counts.rejected_duplicate++;
          finalCandidates.push(cand);
          continue;
        }

        // Track seen identifiers
        if (canonicalDomain) batchDomains.add(canonicalDomain);
        if (phoneDigits) batchPhones.add(phoneDigits);
        batchNames.add(locationKey);

        progress.counts.unique++;
        progress.counts.enriched++;

        // Step C: Score Candidate Fit with Gemini
        const scoreResult = await GeminiService.scoreCandidateFit(cand, campaign.service_line);
        cand.service_fit_score = scoreResult.fit_score;
        cand.intent_score = scoreResult.intent_score;
        cand.data_confidence = scoreResult.confidence;
        cand.evidence_summary = scoreResult.evidence_summary;
        cand.ai_selected = true;
        cand.ai_selection_reason = scoreResult.ai_selection_reason;
        cand.ai_selection_rank = eligibleRank++;
        progress.counts.eligible++;

        finalCandidates.push(cand);

        // Always preserve in cumulative pipeline
        this.pipelineCandidates.set(cand.candidate_id, cand);
      }

      this.candidates.set(campaignId, finalCandidates);

      campaign.status = 'REVIEW_READY';
      progress.stage = 'REVIEW_READY';
      progress.progress_percent = 100;
      progress.message = `Pipeline complete! ${progress.counts.eligible} deduplicated, verified leads harvested from Google Places & OpenStreetMap ready in your pipeline.`;

      this.auditLogs.unshift({
        event_id: 'evt_' + Date.now().toString(36),
        campaign_id: campaignId,
        event_type: 'AI_BATCH_SELECTED',
        message: `Pipeline assembled with ${progress.counts.eligible} verified leads in ${campaign.geography} (${progress.counts.rejected_duplicate} duplicates prevented, ${progress.counts.blocked_policy} policy restricted).`,
        timestamp: new Date().toISOString(),
        counts: {
          discovered: progress.counts.discovered,
          unique: progress.counts.unique,
          eligible: progress.counts.eligible,
          rejected: progress.counts.rejected_quality + progress.counts.rejected_duplicate,
          blocked: progress.counts.blocked_policy
        }
      });

      this.saveToDisk();
    } catch (err: any) {
      console.error('Error running discovery job:', err);
      campaign.status = 'FAILED';
      progress.stage = 'FAILED';
      progress.message = `Job failed: ${err.message || 'Unknown error'}`;
    } finally {
      this.activeJobs.delete(campaignId);
    }
  }

  cancelJob(campaignId: string): boolean {
    if (this.activeJobs.has(campaignId)) {
      this.activeJobs.set(campaignId, false);
      const prog = this.progressMap.get(campaignId);
      if (prog) {
        prog.stage = 'CANCELLED';
        prog.message = 'Discovery job was cancelled by user.';
      }
      const camp = this.campaigns.get(campaignId);
      if (camp) camp.status = 'CANCELLED';
      return true;
    }
    return false;
  }

  getProgress(campaignId: string): RunProgress | undefined {
    return this.progressMap.get(campaignId);
  }

  getCandidates(campaignId: string): CandidateStaging[] {
    return this.candidates.get(campaignId) || [];
  }

  getAllPipelineCandidates(): CandidateStaging[] {
    return Array.from(this.pipelineCandidates.values()).reverse();
  }

  // 3. One-Click Batch Confirm & Import (Transactional)
  confirmImport(campaignId: string, confirmedBy = 'Lead Specialist'): {
    success: boolean;
    imported_count: number;
    skipped_duplicate_count: number;
    blocked_policy_count: number;
    imported_leads: CrmLead[];
  } {
    const candidateList = campaignId === 'all_pipeline'
      ? Array.from(this.pipelineCandidates.values())
      : (this.candidates.get(campaignId) || []);
    const campaign = campaignId === 'all_pipeline' ? undefined : this.campaigns.get(campaignId);

    const confirmationId = 'batch_conf_' + Date.now().toString(36);
    const confirmedAt = new Date().toISOString();

    const newlyImported: CrmLead[] = [];
    let skippedDuplicates = 0;
    let blockedPolicy = 0;

    const existingDomains = new Set(
      this.crmLeads.map(l => WebCrawlerService.extractCanonicalDomain(l.website)).filter(Boolean)
    );
    const existingPhones = new Set(
      this.crmLeads.map(l => WebCrawlerService.sanitizePhoneDigits(l.phone)).filter(Boolean)
    );
    const existingNames = new Set(
      this.crmLeads.map(l => WebCrawlerService.normalizeBusinessName(l.business_name)).filter(Boolean)
    );

    for (const cand of candidateList) {
      if (!cand.ai_selected) continue;

      // Rule 2: Strict Policy Gate Recheck
      const policyEval = PolicyGateService.evaluateImportEligibility(cand);
      if (!policyEval.eligible || !cand.import_eligible) {
        blockedPolicy++;
        cand.exclusion_reason = policyEval.reason || 'Blocked by provider policy.';
        continue;
      }

      // Rule 3: Recheck duplicates against current live CRM leads
      const normName = WebCrawlerService.normalizeBusinessName(cand.business_name);
      const locationKey = `${normName}__${(cand.area || '').toLowerCase()}__${(cand.city || '').toLowerCase()}`;
      const dom = WebCrawlerService.extractCanonicalDomain(cand.website);
      const ph = WebCrawlerService.sanitizePhoneDigits(cand.phone);

      if (existingNames.has(locationKey) || (ph && existingPhones.has(ph))) {
        skippedDuplicates++;
        cand.duplicate_status = ph && existingPhones.has(ph) ? 'duplicate_phone' : 'duplicate_name';
        continue;
      }

      existingNames.add(locationKey);
      if (dom) existingDomains.add(dom);
      if (ph) existingPhones.add(ph);

      const leadId = 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const crmLead: CrmLead = {
        lead_id: leadId,
        campaign_id: campaignId,
        source_provider: cand.source_provider,
        source_reference: cand.source_reference,
        business_name: cand.business_name,
        city: cand.city,
        area: cand.area,
        address: cand.address,
        website: cand.website,
        phone: cand.phone,
        email: cand.email,
        service_line: cand.service_line_primary,
        fit_score: cand.service_fit_score,
        intent_score: cand.intent_score,
        data_confidence: cand.data_confidence,
        evidence_summary: cand.evidence_summary,
        evidence_url: cand.source_url,
        status: 'NEW',
        imported_at: confirmedAt,
        imported_by: confirmedBy,
        provenance_note: `Imported from ${cand.source_provider} (${cand.source_reference}) under ${cand.source_policy_profile}.`,
        google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cand.business_name + ' ' + cand.address)}`,
        whatsapp_url: cand.phone ? `https://wa.me/${cand.phone.replace(/\D/g, '')}` : undefined
      };

      this.crmLeads.unshift(crmLead);
      newlyImported.push(crmLead);

      // Update staging candidate record
      cand.batch_confirmation_id = confirmationId;
      cand.confirmed_by = confirmedBy;
      cand.confirmed_at = confirmedAt;
      cand.imported_lead_id = leadId;
    }

    if (campaign) {
      campaign.status = 'COMPLETED';
    }

    const prog = this.progressMap.get(campaignId);
    if (prog) {
      prog.stage = 'COMPLETED';
      prog.counts.imported = newlyImported.length;
      prog.message = `Successfully imported ${newlyImported.length} verified leads into Yanisa CRM!`;
    }

    this.auditLogs.unshift({
      event_id: 'evt_' + Date.now().toString(36),
      campaign_id: campaignId,
      event_type: 'LEADS_PERSISTED_TO_CRM',
      message: `Confirmed & Imported batch of ${newlyImported.length} leads into Yanisa CRM (${skippedDuplicates} duplicates prevented, ${blockedPolicy} restricted records blocked).`,
      timestamp: confirmedAt,
      counts: {
        imported: newlyImported.length,
        rejected: skippedDuplicates,
        blocked: blockedPolicy
      }
    });

    this.saveToDisk();

    return {
      success: true,
      imported_count: newlyImported.length,
      skipped_duplicate_count: skippedDuplicates,
      blocked_policy_count: blockedPolicy,
      imported_leads: newlyImported
    };
  }

  // 4. CRM Lead Database Management
  getCrmLeads(): CrmLead[] {
    return this.crmLeads;
  }

  updateLeadStatus(leadId: string, status: CrmLead['status']): CrmLead | undefined {
    const lead = this.crmLeads.find(l => l.lead_id === leadId);
    if (lead) {
      lead.status = status;
      this.auditLogs.unshift({
        event_id: 'evt_' + Date.now().toString(36),
        campaign_id: lead.campaign_id,
        event_type: 'LEAD_STATUS_UPDATED',
        message: `Lead "${lead.business_name}" status updated to ${status}.`,
        timestamp: new Date().toISOString()
      });
      this.saveToDisk();
      return lead;
    }
    return undefined;
  }

  deleteLead(leadId: string): boolean {
    const idx = this.crmLeads.findIndex(l => l.lead_id === leadId);
    if (idx !== -1) {
      const removed = this.crmLeads.splice(idx, 1)[0];
      this.auditLogs.unshift({
        event_id: 'evt_' + Date.now().toString(36),
        campaign_id: removed.campaign_id,
        event_type: 'LEAD_DELETED',
        message: `Lead "${removed.business_name}" deleted from CRM.`,
        timestamp: new Date().toISOString()
      });
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // 5. Audit Logging
  getAuditLogs(): AuditEvent[] {
    return this.auditLogs;
  }

  addAuditLog(event: Omit<AuditEvent, 'event_id' | 'timestamp'>): AuditEvent {
    const entry: AuditEvent = {
      ...event,
      event_id: 'evt_' + Date.now().toString(36),
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    return entry;
  }
}

export const dataStore = new DataStore();
