/**
 * Yanisa AI Lead Discovery & Pipeline Engine
 * Orchestrates real-time commercial lead harvesting with Gemini AI reasoning,
 * live web crawling, deduplicated Indian mobile contact routes,
 * interactive analytics charts with animated number counting from 0,
 * and one-click CRM & multi-format exports (CSV, Excel, PDF).
 * Includes Dark & Light theme support with seamless toggle.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  CampaignConfig, 
  CandidateStaging, 
  CrmLead, 
  RunProgress,
  TargetMode 
} from './types/leadDiscovery.ts';
import { FloatingPillNav, NavTab } from './components/FloatingPillNav.tsx';
import { GeminiSearchBox } from './components/GeminiSearchBox.tsx';
import { CandidateTableView } from './components/CandidateTableView.tsx';
import { CandidateDrawer } from './components/CandidateDrawer.tsx';
import { InteractiveAnalyticsDashboard } from './components/InteractiveAnalyticsDashboard.tsx';
import { CrmLeadsView } from './components/CrmLeadsView.tsx';
import { ConfirmImportModal } from './components/ConfirmImportModal.tsx';
import { ClarificationModal } from './components/ClarificationModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('discover');
  
  // Dark/Light Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yanisa_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yanisa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yanisa_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Campaign & Candidates State
  const [currentCampaign, setCurrentCampaign] = useState<CampaignConfig | null>(null);
  // Recent search leads (shown on Lead Discovery tab)
  const [recentCandidates, setRecentCandidates] = useState<CandidateStaging[]>([]);
  // All cumulative pipeline leads across searches (shown on Pipeline tab)
  const [pipelineCandidates, setPipelineCandidates] = useState<CandidateStaging[]>([]);
  const [, setProgress] = useState<RunProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // CRM Leads State
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);

  // Selected filter state
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');

  // Modals & Drawers
  const [inspectCandidate, setInspectCandidate] = useState<CandidateStaging | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importTargetPool, setImportTargetPool] = useState<CandidateStaging[]>([]);
  const [clarificationData, setClarificationData] = useState<{
    question: string;
    options: { label: string; mode: TargetMode }[];
  } | null>(null);

  const pollIntervalRef = useRef<number | null>(null);

  // Fetch initial CRM leads and cumulative pipeline leads
  const fetchCrmData = async () => {
    try {
      const res = await fetch('/api/ai-sdr/leads');
      if (res.ok) setCrmLeads(await res.json());
    } catch (err) {
      console.error('Failed to fetch CRM data:', err);
    }
  };

  const fetchPipelineData = async () => {
    try {
      const res = await fetch('/api/ai-sdr/pipeline/candidates');
      if (res.ok) {
        const data: CandidateStaging[] = await res.json();
        setPipelineCandidates(data);
      }
    } catch (err) {
      console.error('Failed to fetch pipeline data:', err);
    }
  };

  useEffect(() => {
    fetchCrmData();
    fetchPipelineData();
    // Auto-launch initial discovery for 100 co-working spaces in Mumbai on first load
    handleStartCampaign('Find 100 leads of co-working spaces in Mumbai', 100);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll progress while job is running
  const startProgressPolling = (campaignId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const [campRes, candRes] = await Promise.all([
          fetch(`/api/ai-sdr/campaigns/${campaignId}`),
          fetch(`/api/ai-sdr/campaigns/${campaignId}/candidates`)
        ]);

        if (campRes.ok) {
          const data = await campRes.json();
          if (data.progress) setProgress(data.progress);
          if (data.campaign) setCurrentCampaign(data.campaign);

          if (data.campaign.status === 'REVIEW_READY' || data.campaign.status === 'COMPLETED' || data.campaign.status === 'FAILED' || data.campaign.status === 'CANCELLED') {
            setIsRunning(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            fetchCrmData();
            fetchPipelineData();
          }
        }

        if (candRes.ok) {
          const cands: CandidateStaging[] = await candRes.json();
          setRecentCandidates(cands);
          // Merge newly discovered unique candidates into pipelineCandidates state
          setPipelineCandidates(prev => {
            const seen = new Set(prev.map(p => p.candidate_id));
            const newOnes = cands.filter(c => c.ai_selected && c.import_eligible && !seen.has(c.candidate_id));
            return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 800);
  };

  // Start new campaign from user natural language search
  const handleStartCampaign = async (prompt: string, count?: number) => {
    setIsRunning(true);
    setRecentCandidates([]);
    setProgress({
      campaign_id: '',
      stage: 'PLANNING',
      progress_percent: 5,
      message: 'Synthesizing search parameters and verifying commercial registers...',
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
    });

    try {
      const payload: { prompt: string; overrides?: { target_count?: number } } = { prompt };
      if (typeof count === 'number' && count > 0) {
        payload.overrides = { target_count: count };
      }

      const createRes = await fetch('/api/ai-sdr/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!createRes.ok) throw new Error('Failed to create campaign');
      const campaign: CampaignConfig = await createRes.json();
      setCurrentCampaign(campaign);

      if (campaign.clarification_needed && campaign.clarification_question && campaign.clarification_options) {
        setIsRunning(false);
        setClarificationData({
          question: campaign.clarification_question,
          options: campaign.clarification_options
        });
        return;
      }

      await fetch(`/api/ai-sdr/campaigns/${campaign.campaign_id}/run`, { method: 'POST' });
      startProgressPolling(campaign.campaign_id);
    } catch (err) {
      console.error('Error starting campaign:', err);
      setIsRunning(false);
    }
  };

  // Resolve Ambiguity Modal
  const handleResolveClarification = async (selectedMode: TargetMode) => {
    if (!currentCampaign) return;
    setClarificationData(null);
    setIsRunning(true);

    try {
      await fetch(`/api/ai-sdr/campaigns/${currentCampaign.campaign_id}/resolve-ambiguity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_mode: selectedMode })
      });

      await fetch(`/api/ai-sdr/campaigns/${currentCampaign.campaign_id}/run`, { method: 'POST' });
      startProgressPolling(currentCampaign.campaign_id);
    } catch (err) {
      console.error('Failed to resolve ambiguity:', err);
      setIsRunning(false);
    }
  };

  // One-Click Batch Import to CRM
  const handleConfirmBatchImport = async (confirmedBy: string = 'Specialist') => {
    const targetCampaignId = currentCampaign?.campaign_id || 'all_pipeline';
    setIsImporting(true);

    try {
      const res = await fetch(`/api/ai-sdr/campaigns/${targetCampaignId}/confirm-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed_by: confirmedBy })
      });

      if (res.ok) {
        await fetchCrmData();
        await fetchPipelineData();
        setShowConfirmModal(false);
        setActiveTab('crm');
      }
    } catch (err) {
      console.error('Failed to confirm batch import:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // CRM lead status updates
  const handleUpdateLeadStatus = async (leadId: string, status: CrmLead['status']) => {
    try {
      const res = await fetch(`/api/ai-sdr/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setCrmLeads(prev => prev.map(l => l.lead_id === leadId ? updated : l));
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/ai-sdr/leads/${leadId}`, { method: 'DELETE' });
      if (res.ok) {
        setCrmLeads(prev => prev.filter(l => l.lead_id !== leadId));
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  // Total active pipeline pool (uses cumulative leads, or falls back to recent candidates)
  const activePipelinePool = pipelineCandidates.length > 0 ? pipelineCandidates : recentCandidates;

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-serif selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Floating Pill Navigation with Yanisa Brand & Theme Toggle */}
      <FloatingPillNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        candidateCount={activePipelinePool.length}
        crmCount={crmLeads.length}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* TAB 1: Lead Discovery (Gemini Search Box & Recent Results) */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Gemini glowing search box */}
            <GeminiSearchBox
              onSearch={handleStartCampaign}
              isRunning={isRunning}
              initialPrompt=""
            />

            {/* Subtle In-Progress Indicator (Backend architecture hidden from user) */}
            {isRunning && (
              <div className="flex items-center justify-center gap-2.5 py-3 px-4 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 rounded-2xl max-w-lg mx-auto text-blue-700 dark:text-blue-300 text-xs font-medium animate-pulse shadow-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Discovering verified commercial leads with clean Indian mobile numbers...</span>
              </div>
            )}

            {/* Recent Search Candidates Table */}
            {recentCandidates.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Recent Search Results ({recentCandidates.filter(c => c.ai_selected && c.import_eligible).length} Leads)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Discovered for your latest query with 10-digit Indian mobile numbers and verified physical locations.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer self-start sm:self-auto"
                  >
                    View All Leads in Pipeline ({activePipelinePool.length}) &rarr;
                  </button>
                </div>

                <CandidateTableView
                  candidates={recentCandidates}
                  onInspectCandidate={setInspectCandidate}
                  onOpenConfirmModal={() => {
                    setImportTargetPool(recentCandidates);
                    setShowConfirmModal(true);
                  }}
                  isImporting={isImporting}
                  initialAreaFilter={selectedAreaFilter}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Full Cumulative Pipeline Table */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Lead Pipeline History ({activePipelinePool.length} Leads)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete persistent records across all searches. Filter by vertical, city, and micro-market without losing prior leads.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                + Run New Discovery
              </button>
            </div>

            <CandidateTableView
              candidates={activePipelinePool}
              onInspectCandidate={setInspectCandidate}
              onOpenConfirmModal={() => {
                setImportTargetPool(activePipelinePool);
                setShowConfirmModal(true);
              }}
              isImporting={isImporting}
              initialAreaFilter={selectedAreaFilter}
            />
          </div>
        )}

        {/* TAB 3: Interactive Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Pipeline Analytics &amp; Geographic Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive real-time metrics with animated number counting from 0 across all {activePipelinePool.length} pipeline records.
              </p>
            </div>

            <InteractiveAnalyticsDashboard
              candidates={activePipelinePool}
              onFilterArea={area => {
                setSelectedAreaFilter(area || 'all');
                setActiveTab('pipeline');
              }}
            />
          </div>
        )}

        {/* TAB 4: CRM Leads & Multi-Format Exports */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <CrmLeadsView
              leads={crmLeads}
              onUpdateStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
            />
          </div>
        )}
      </main>

      {/* Flyout Details Drawer */}
      <CandidateDrawer
        candidate={inspectCandidate}
        onClose={() => setInspectCandidate(null)}
      />

      {/* One-Click Batch Import Modal */}
      {showConfirmModal && (
        <ConfirmImportModal
          candidates={importTargetPool.length > 0 ? importTargetPool : activePipelinePool}
          onConfirm={handleConfirmBatchImport}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {/* Clarification Dialog */}
      {clarificationData && (
        <ClarificationModal
          question={clarificationData.question}
          options={clarificationData.options}
          onSelectOption={handleResolveClarification}
          onCancel={() => setClarificationData(null)}
        />
      )}
    </div>
  );
}
