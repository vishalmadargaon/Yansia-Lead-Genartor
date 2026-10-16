/**
 * Policy Gate & Source Registry Service (Vishal's Workstream)
 * Defines provider rules, display rights, AI scoring permission,
 * retention policy, attribution obligations, and import eligibility.
 */

import type { ProviderKey, ProviderPolicyProfile, CandidateStaging } from '../src/types/leadDiscovery.ts';

export const PROVIDER_POLICIES: Record<ProviderKey, ProviderPolicyProfile> = {
  osm_overpass: {
    provider_key: 'osm_overpass',
    name: 'OpenStreetMap (Overpass API)',
    license: 'Open Database License (ODbL) 1.0',
    result_mode: 'persistent_candidate',
    import_eligible_by_default: true,
    attribution_required: true,
    attribution_text: '© OpenStreetMap contributors (ODbL)',
    attribution_url: 'https://www.openstreetmap.org/copyright',
    retention_rule: 'Permanent retention permitted for business candidates subject to ODbL share-alike attribution.',
    storage_policy: 'Full fields (Name, OSM Node/Way ID, Location coordinates, Tags, Website) permitted for storage & CRM import.'
  },
  live_web: {
    provider_key: 'live_web',
    name: 'Official Corporate Domain (Live HTTP Scraping)',
    license: 'Public Web / Fair Use for Business Contact Verification',
    result_mode: 'persistent_candidate',
    import_eligible_by_default: true,
    attribution_required: true,
    attribution_text: 'Source: Official Corporate Website & MCA Filings',
    attribution_url: 'https://www.mca.gov.in',
    retention_rule: 'Permitted for verified commercial contact routing (emails, telephone numbers, executive roles).',
    storage_policy: 'Stores exact source URL, collection timestamp, and verification confidence.'
  },
  google_places: {
    provider_key: 'google_places',
    name: 'Google Places API (New) - Restricted Preview Mode',
    license: 'Google Maps Platform Terms of Service',
    result_mode: 'restricted_preview',
    import_eligible_by_default: false, // STRICTLY FALSE: Cannot be imported into CRM!
    attribution_required: true,
    attribution_text: 'Powered by Google Maps Platform (Preview Only)',
    attribution_url: 'https://cloud.google.com/maps-platform/terms',
    retention_rule: 'STRICTLY RESTRICTED: No caching or storing of listing fields (names, addresses, ratings) outside Google services.',
    storage_policy: 'Place ID only exception. All other fields are ephemeral and blocked from the persistent Yanisa CRM Lead table.'
  },
  synthetic_fixture: {
    provider_key: 'synthetic_fixture',
    name: 'Synthetic Benchmark Suite (Deterministic Testing)',
    license: 'MIT / Internal Yanisa Benchmark Fixture',
    result_mode: 'test_fixture',
    import_eligible_by_default: true,
    attribution_required: false,
    attribution_text: 'Yanisa Internal Test Fixture',
    attribution_url: '',
    retention_rule: 'Permitted for regression tests, sandbox validation, and offline demos.',
    storage_policy: 'Full test records allowed for verification.'
  },
  gemini_search: {
    provider_key: 'gemini_search',
    name: 'Gemini AI Commercial Search & Synthesis',
    license: 'Google AI Studio Commercial API / Verified Public Domain',
    result_mode: 'persistent_candidate',
    import_eligible_by_default: true,
    attribution_required: true,
    attribution_text: 'Synthesized via Gemini AI & Verified Commercial Public Records',
    attribution_url: 'https://ai.google.dev',
    retention_rule: 'Permitted for commercial B2B contact discovery and sales pipeline import.',
    storage_policy: 'Full verified fields permitted for Yanisa CRM storage.'
  }
};

export class PolicyGateService {
  /**
   * Assesses candidate compliance before allowing entry into the AI-selected batch
   */
  static evaluateImportEligibility(candidate: Partial<CandidateStaging>): {
    eligible: boolean;
    reason?: string;
  } {
    const provider = candidate.source_provider;
    if (!provider || !PROVIDER_POLICIES[provider]) {
      return { eligible: false, reason: 'Unknown data provider: persistence denied by default.' };
    }

    const policy = PROVIDER_POLICIES[provider];

    // Core Policy Gate: Google Places listings cannot be imported under standard terms
    if (provider === 'google_places') {
      return {
        eligible: false,
        reason: 'Policy Gate Block: Google Places API terms prohibit exporting/saving listing fields into persistent CRM lead database. Human approval cannot override provider terms.'
      };
    }

    if (!policy.import_eligible_by_default) {
      return { eligible: false, reason: `Provider '${policy.name}' is not marked as import-eligible.` };
    }

    // Must have at least a business name and verified location
    if (!candidate.business_name || candidate.business_name.trim().length === 0) {
      return { eligible: false, reason: 'Missing business name: invalid candidate.' };
    }

    return { eligible: true };
  }
}
