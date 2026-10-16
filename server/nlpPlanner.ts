/**
 * Zero-Cost Deterministic Semantic NLP Planner
 * Parses natural language campaign prompts into validated CampaignConfig
 * with high accuracy, city detection across India/global, and target quota extraction.
 */

import type { CampaignConfig, TargetMode, YanisaServiceLine } from '../src/types/leadDiscovery.ts';

export class NlpPlanner {
  static parsePrompt(prompt: string): CampaignConfig {
    const text = prompt.toLowerCase();
    const campaignId = 'camp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    // 1. Detect Yanisa Service Line
    let serviceLine: YanisaServiceLine = 'coworking';
    let targetMode: TargetMode = 'coworking_clients';
    let targetBusinessType = 'co-working & flexible workspaces';

    if (text.includes('studio') || text.includes('podcast') || text.includes('audio') || text.includes('recording') || text.includes('sound') || text.includes('voiceover') || text.includes('dubbing')) {
      serviceLine = 'studios';
      targetBusinessType = 'podcast, audio & video recording studios';
      if (text.includes('creator') || text.includes('brand that needs') || text.includes('booking') || text.includes('book studio')) {
        targetMode = 'studio_demand';
      } else {
        targetMode = 'studio_partners';
      }
    } else if (text.includes('gaas') || text.includes('growth') || text.includes('collaboration') || text.includes('collab') || text.includes('partner') || text.includes('sales execution') || text.includes('outbound pipeline') || text.includes('b2b') || text.includes('revenue') || text.includes('sdr')) {
      serviceLine = 'gaas';
      targetMode = 'growth_clients';
      targetBusinessType = 'high-growth B2B firms, startups & collaboration partners';
    } else if (text.includes('tech') || text.includes('crm') || text.includes('automation') || text.includes('software') || text.includes('internal tools') || text.includes('it services') || text.includes('ai') || text.includes('saas development')) {
      serviceLine = 'tech';
      targetMode = 'tech_clients';
      targetBusinessType = 'technology, software & automation companies';
    } else if (text.includes('media') || text.includes('content') || text.includes('branding') || text.includes('marketing agency') || text.includes('production') || text.includes('video production') || text.includes('copywriting')) {
      serviceLine = 'media';
      targetMode = 'media_clients';
      targetBusinessType = 'content, branding & media production agencies';
    } else if (text.includes('coworking') || text.includes('co-working') || text.includes('co working') || text.includes('workspace') || text.includes('shared office') || text.includes('business center') || text.includes('desk') || text.includes('serviced office')) {
      serviceLine = 'coworking';
      targetMode = 'coworking_clients';
      targetBusinessType = 'co-working spaces & flexible business centers';
    }

    // 2. Ambiguity check: if user simply says "find studios" without any location or details
    let clarificationNeeded = false;
    let clarificationQuestion: string | undefined;
    let clarificationOptions: { label: string; mode: TargetMode }[] | undefined;

    const isBareStudioQuery = text.trim() === 'find studios' || text.trim() === 'studios';
    if (isBareStudioQuery) {
      clarificationNeeded = true;
      clarificationQuestion = 'Do you want studio facility owners to join the Yanisa Studios network (Supply), or creators and brands looking to book studio space (Demand)?';
      clarificationOptions = [
        { label: 'Studio Owners & Partners (Supply Network)', mode: 'studio_partners' },
        { label: 'Creators & Brands Needing Studios (Demand)', mode: 'studio_demand' }
      ];
    }

    // 3. Detect Geography
    let geography = 'Mumbai, India';
    const cityMatches = [
      { name: 'Mumbai, India', keywords: ['mumbai', 'bombay', 'andheri', 'bandra', 'bkc', 'malad', 'juhu', 'powai', 'lower parel', 'goregaon', 'worli', 'thane', 'navi mumbai'] },
      { name: 'Bengaluru, India', keywords: ['bengaluru', 'bangalore', 'koramangala', 'indiranagar', 'hsr', 'whitefield', 'electronic city', 'bellandur', 'mg road'] },
      { name: 'Delhi NCR, India', keywords: ['delhi', 'gurugram', 'gurgaon', 'noida', 'saket', 'nehru place', 'connaught place', 'cyber city'] },
      { name: 'Pune, India', keywords: ['pune', 'hinjawadi', 'baner', 'kalyani nagar', 'viman nagar', 'wakad', 'magarpatta', 'shivaji nagar', 'kothrud', 'aundh', 'balewadi'] },
      { name: 'Hyderabad, India', keywords: ['hyderabad', 'hitec city', 'gachibowli', 'madhapur', 'jubilee hills', 'kondapur', 'banjara hills'] },
      { name: 'Chennai, India', keywords: ['chennai', 'madras', 'omr', 'guindy', 't nagar', 'velachery', 'anna nagar'] },
      { name: 'Kolkata, India', keywords: ['kolkata', 'calcutta', 'salt lake', 'park street', 'new town'] },
      { name: 'Ahmedabad, India', keywords: ['ahmedabad', 'sg highway', 'prahlad nagar', 'navrangpura'] }
    ];

    let cityFound = false;
    for (const city of cityMatches) {
      if (city.keywords.some(kw => text.includes(kw))) {
        geography = city.name;
        cityFound = true;
        break;
      }
    }

    // If no keyword match, attempt extraction of "in <City>"
    if (!cityFound) {
      const inMatch = text.match(/\bin\s+([a-zA-Z\s]+?)(?:\s+for|\s+with|$)/i);
      if (inMatch && inMatch[1]) {
        const rawCity = inMatch[1].trim();
        if (rawCity.length >= 3 && rawCity.length <= 25) {
          geography = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
        }
      }
    }

    // 4. Robust Target Count Extraction
    // Priority order:
    // a) "number 50", "number: 50", "count 20"
    // b) "20 leads", "100 spaces", "10 studios"
    // c) "find 10", "find me 20", "give 50"
    // d) standalone valid count between 1 and 500
    let targetCount = 25; // Default fallback if no number provided
    let countFound = false;

    const countPatterns = [
      /(?:number|count|quota|target|qty)\s*(?:of|is|:)?\s*(\d{1,3})/i,
      /(\d{1,3})\s*(?:leads|results|spaces|studios|companies|partners|hubs|firms|contacts|records|candidates|businesses)/i,
      /(?:find|get|give|generate|search|return|fetch|show|scrape)\s*(?:me\s*)?(?:a\s*)?(\d{1,3})/i,
    ];

    for (const pattern of countPatterns) {
      const m = text.match(pattern);
      if (m && m[1]) {
        const parsed = parseInt(m[1], 10);
        if (parsed > 0 && parsed <= 500) {
          targetCount = parsed;
          countFound = true;
          break;
        }
      }
    }

    if (!countFound) {
      // Check for any standalone number not being part of pincode/year
      const numbers = text.match(/\b(\d{1,3})\b/g);
      if (numbers) {
        for (const numStr of numbers) {
          const parsed = parseInt(numStr, 10);
          if (parsed > 0 && parsed <= 500 && parsed !== 202 && parsed !== 203 && parsed !== 204 && parsed !== 205 && parsed !== 206) {
            targetCount = parsed;
            break;
          }
        }
      }
    }

    // 5. Quality Goal
    let qualityGoal: 'high' | 'good' | 'broad' = 'good';
    if (text.includes('best') || text.includes('top') || text.includes('high quality') || text.includes('verified only')) {
      qualityGoal = 'high';
    } else if (text.includes('broad') || text.includes('all') || text.includes('maximum')) {
      qualityGoal = 'broad';
    }

    // 6. Generate Query Variants for Search
    const cityNameShort = geography.split(',')[0].trim();
    let queryVariants: string[] = [];

    if (serviceLine === 'coworking') {
      queryVariants = [
        `coworking space in ${cityNameShort}`,
        `shared office space ${cityNameShort}`,
        `flexible workspace ${cityNameShort}`,
        `managed office space ${cityNameShort}`,
        `executive business center ${cityNameShort}`
      ];
    } else if (serviceLine === 'studios') {
      queryVariants = [
        `podcast recording studio ${cityNameShort}`,
        `audio production studio ${cityNameShort}`,
        `video podcast studio ${cityNameShort}`,
        `sound recording studio ${cityNameShort}`
      ];
    } else if (serviceLine === 'gaas') {
      queryVariants = [
        `b2b saas company ${cityNameShort}`,
        `growth marketing agency ${cityNameShort}`,
        `fast growing startups ${cityNameShort}`
      ];
    } else if (serviceLine === 'tech') {
      queryVariants = [
        `it software services ${cityNameShort}`,
        `custom software company ${cityNameShort}`,
        `cloud and automation agency ${cityNameShort}`
      ];
    } else {
      queryVariants = [
        `digital marketing agency ${cityNameShort}`,
        `content production studio ${cityNameShort}`
      ];
    }

    return {
      campaign_id: campaignId,
      user_prompt: prompt,
      service_line: serviceLine,
      target_mode: targetMode,
      target_business_type: targetBusinessType,
      geography: geography,
      target_count: targetCount,
      quality_goal: qualityGoal,
      providers: ['osm_overpass', 'live_web'],
      query_variants: queryVariants,
      created_at: new Date().toISOString(),
      status: 'PLANNING',
      clarification_needed: clarificationNeeded,
      clarification_question: clarificationQuestion,
      clarification_options: clarificationOptions
    };
  }
}
