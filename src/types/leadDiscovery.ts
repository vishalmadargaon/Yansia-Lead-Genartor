/**
 * Shared Type Definitions for Yanisa AI-SDR Lead Discovery Engine
 * Implements strict data contracts between Vishal (Planner & Policy),
 * Nilesh (OSM & Scoring), and Daksh (CRM UI & Import).
 */

export type YanisaServiceLine = 'gaas' | 'tech' | 'media' | 'coworking' | 'studios';

export type TargetMode = 
  | 'studio_partners' 
  | 'studio_demand' 
  | 'growth_clients' 
  | 'tech_clients' 
  | 'media_clients' 
  | 'coworking_clients';

export type ProviderKey = 'osm_overpass' | 'google_places' | 'synthetic_fixture' | 'live_web' | 'gemini_search';

export type ResultMode = 'persistent_candidate' | 'restricted_preview' | 'test_fixture';

export type RunStage = 
  | 'QUEUED' 
  | 'PLANNING' 
  | 'DISCOVERING' 
  | 'ENRICHING' 
  | 'SCORING' 
  | 'REVIEW_READY' 
  | 'IMPORTING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface CampaignConfig {
  campaign_id: string;
  user_prompt: string;
  service_line: YanisaServiceLine;
  target_mode: TargetMode;
  target_business_type: string;
  geography: string;
  target_count: number;
  quality_goal: 'high' | 'good' | 'broad';
  providers: ProviderKey[];
  query_variants: string[];
  created_at: string;
  status: RunStage;
  clarification_needed?: boolean;
  clarification_question?: string;
  clarification_options?: { label: string; mode: TargetMode }[];
}

export interface EvidenceItem {
  fact: string;
  source_url: string;
  verified_at: string;
  confidence: number; // 0-100
}

export interface CandidateStaging {
  candidate_id: string;
  campaign_id: string;
  source_provider: ProviderKey;
  source_reference: string; // OSM Node ID, Place ID, or Domain
  source_url: string;
  source_collected_at: string;
  source_policy_profile: string;
  result_mode: ResultMode;
  allowed_fields: string[];
  import_eligible: boolean; // false for Google Places restricted preview!
  
  business_name: string;
  city: string;
  area: string;
  address: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  
  service_line_primary: YanisaServiceLine;
  service_fit_score: number; // 0-100
  intent_score: number;      // 0-100 (separate from category match!)
  data_confidence: number;   // 0-100
  contactability_status: 'verified' | 'partially_verified' | 'unverified' | 'missing';
  
  evidence_summary: string;
  evidence_items: EvidenceItem[];
  
  duplicate_status: 'unique' | 'duplicate_domain' | 'duplicate_phone' | 'duplicate_name';
  ai_selected: boolean;
  ai_selection_rank: number;
  ai_selection_reason: string;
  exclusion_reason?: string;
  
  batch_confirmation_id?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  imported_lead_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmLead {
  lead_id: string;
  campaign_id: string;
  source_provider: ProviderKey;
  source_reference: string;
  business_name: string;
  city: string;
  area: string;
  address: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  service_line: YanisaServiceLine;
  fit_score: number;
  intent_score: number;
  data_confidence: number;
  evidence_summary: string;
  evidence_url: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'CONVERTED';
  imported_at: string;
  imported_by: string;
  provenance_note: string;
  google_maps_url: string;
  whatsapp_url?: string;
}

export interface AuditEvent {
  event_id: string;
  campaign_id: string;
  event_type: 
    | 'CAMPAIGN_PLAN_GENERATED' 
    | 'DISCOVERY_HARVEST_STARTED' 
    | 'DISCOVERY_HARVEST_COMPLETED' 
    | 'ENRICHMENT_COMPLETED' 
    | 'AI_BATCH_SELECTED' 
    | 'BATCH_IMPORT_CONFIRMED' 
    | 'LEADS_PERSISTED_TO_CRM' 
    | 'POLICY_RESTRICTION_ENFORCED'
    | 'DUPLICATE_PURGED'
    | 'LEAD_STATUS_UPDATED'
    | 'LEAD_DELETED';
  message: string;
  timestamp: string;
  counts?: {
    discovered?: number;
    unique?: number;
    enriched?: number;
    eligible?: number;
    rejected?: number;
    blocked?: number;
    imported?: number;
  };
  metadata?: Record<string, any>;
}

export interface RunProgress {
  campaign_id: string;
  stage: RunStage;
  progress_percent: number;
  message: string;
  active_query?: string;
  counts: {
    discovered: number;
    unique: number;
    enriched: number;
    eligible: number;
    rejected_quality: number;
    rejected_duplicate: number;
    blocked_policy: number;
    imported: number;
  };
}

export interface ProviderPolicyProfile {
  provider_key: ProviderKey;
  name: string;
  license: string;
  result_mode: ResultMode;
  import_eligible_by_default: boolean;
  attribution_required: boolean;
  attribution_text: string;
  attribution_url: string;
  retention_rule: string;
  storage_policy: string;
}
