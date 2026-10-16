/**
 * Candidate Table View (Lead Discovery Pipeline)
 * Redesigned in crisp white and royal blue with font Lora.
 * Displays AI-selected candidates with evidence, contactability, confidence,
 * direct exports (CSV, XLSX, PDF), WhatsApp & Maps integration,
 * and one-click Confirm & Import into Yanisa CRM.
 */

import React, { useState } from 'react';
import { CandidateStaging } from '../types/leadDiscovery.ts';
import { 
  Sparkles, 
  ExternalLink, 
  Info, 
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Download,
  MapPin,
  MessageCircle,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { ExportUtils } from '../utils/exportUtils.ts';

interface CandidateTableViewProps {
  candidates: CandidateStaging[];
  onInspectCandidate: (candidate: CandidateStaging) => void;
  onOpenConfirmModal: () => void;
  isImporting: boolean;
  initialAreaFilter?: string;
}

export const CandidateTableView: React.FC<CandidateTableViewProps> = ({
  candidates,
  onInspectCandidate,
  onOpenConfirmModal,
  isImporting,
  initialAreaFilter = 'all'
}) => {
  const [tab, setTab] = useState<'selected' | 'excluded' | 'google_preview'>('selected');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>(initialAreaFilter);
  const [filterVertical, setFilterVertical] = useState<string>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sync if initialAreaFilter changes externally
  React.useEffect(() => {
    if (initialAreaFilter) {
      setFilterArea(initialAreaFilter);
    }
  }, [initialAreaFilter]);

  const selectedCandidates = candidates.filter(c => c.ai_selected && c.import_eligible);
  const excludedCandidates = candidates.filter(c => !c.ai_selected && c.source_provider !== 'google_places');
  const googlePreviewCandidates = candidates.filter(c => c.source_provider === 'google_places');

  const currentPool = tab === 'selected'
    ? selectedCandidates
    : tab === 'excluded'
    ? excludedCandidates
    : googlePreviewCandidates;

  // Extract distinct cities and areas for easy dropdown filter
  const availableCities = Array.from(new Set(candidates.map(c => c.city).filter(Boolean))).sort();
  const availableAreas = Array.from(new Set(
    candidates
      .filter(c => filterCity === 'all' || (c.city || '').toLowerCase() === filterCity.toLowerCase())
      .map(c => c.area)
      .filter(Boolean)
  )).sort();

  const filtered = currentPool.filter(c => {
    const matchSearch = (c.business_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.area || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery);
    const matchCity = filterCity === 'all' || (c.city || '').toLowerCase() === filterCity.toLowerCase();
    const matchArea = filterArea === 'all' || c.area === filterArea;
    const matchVertical = filterVertical === 'all' || (c.service_line_primary || '').toLowerCase() === filterVertical.toLowerCase();
    return matchSearch && matchCity && matchArea && matchVertical;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs font-serif">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        {/* Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
          <button
            onClick={() => setTab('selected')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'selected'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Pipeline</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[11px] font-mono tabular-nums font-bold ${
              tab === 'selected' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {selectedCandidates.length}
            </span>
          </button>

          <button
            onClick={() => setTab('excluded')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'excluded'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Duplicates Prevented</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[11px] font-mono tabular-nums ${
              tab === 'excluded' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {excludedCandidates.length}
            </span>
          </button>
        </div>

        {/* Action Controls & Export Dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export Pipeline ({filtered.length})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 divide-y divide-slate-100">
                <button
                  onClick={() => {
                    ExportUtils.exportCandidatesToCsv(filtered, 'yanisa_leads_pipeline.csv');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-serif"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => {
                    ExportUtils.exportCandidatesToXlsx(filtered, 'yanisa_leads_pipeline.xlsx');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-serif"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => {
                    ExportUtils.exportCandidatesToPdf(filtered, 'yanisa_leads_pipeline.pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-serif"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download PDF Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary One-Click Confirm & Import Action */}
          {tab === 'selected' && (
            <button
              onClick={onOpenConfirmModal}
              disabled={selectedCandidates.length === 0 || isImporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Import {selectedCandidates.length} Leads to CRM</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Area Filter Row */}
      <div className="p-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business, area, or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-serif"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Vertical Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 whitespace-nowrap font-medium">Vertical:</span>
            <select
              value={filterVertical}
              onChange={(e) => setFilterVertical(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500 font-serif"
            >
              <option value="all">All Verticals</option>
              <option value="coworking">Coworking Spaces</option>
              <option value="studios">Podcast &amp; Audio Studios</option>
              <option value="gaas">Growth &amp; Collaboration (GaaS)</option>
              <option value="tech">Tech, AI &amp; Software</option>
              <option value="media">Media &amp; Creative Agencies</option>
            </select>
          </div>

          {/* City Filter */}
          {availableCities.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 whitespace-nowrap font-medium">City:</span>
              <select
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setFilterArea('all');
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500 font-serif"
              >
                <option value="all">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Area Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 whitespace-nowrap font-medium">Area:</span>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500 font-serif"
            >
              <option value="all">All Micro-Markets ({candidates.length})</option>
              {availableAreas.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="overflow-x-auto max-h-[640px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium tracking-wider uppercase text-[10px]">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-4">Business &amp; Micro-Market</th>
              <th className="py-3 px-3">Contact Number</th>
              <th className="py-3 px-3">Email &amp; Official Web</th>
              <th className="py-3 px-3">Fit &amp; Confidence</th>
              <th className="py-3 px-3">Source Registry</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <span>No leads match your current search criteria.</span>
                </td>
              </tr>
            ) : (
              filtered.map((candidate, idx) => {
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate.business_name + ' ' + (candidate.address || candidate.city))}`;
                const rawPhoneDigits = candidate.phone ? candidate.phone.replace(/\D/g, '') : null;
                const isMobile = candidate.phone && (/^\+91\s*[6-9]/.test(candidate.phone) || candidate.phone.startsWith('+91 9') || candidate.phone.startsWith('+91 8') || candidate.phone.startsWith('+91 7'));
                const whatsappUrl = isMobile && rawPhoneDigits ? `https://wa.me/${rawPhoneDigits.startsWith('91') ? rawPhoneDigits : '91' + rawPhoneDigits}` : null;

                return (
                  <tr
                    key={candidate.candidate_id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onInspectCandidate(candidate)}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px] tabular-nums font-semibold">
                      {candidate.ai_selection_rank || idx + 1}
                    </td>

                    {/* 1. Business & Location */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
                          {candidate.service_line_primary || 'Lead'}
                        </span>
                        <span className="font-serif font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-sm truncate">
                          {candidate.business_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="inline-block px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                          {candidate.area || 'Commercial'}
                        </span>
                        <span>{candidate.city}</span>
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-0.5 text-[10px]"
                          title="Open in Google Maps"
                        >
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Map</span>
                        </a>
                      </div>
                      <div className="text-[10px] font-serif text-slate-400 truncate max-w-[260px] mt-0.5">
                        {candidate.address}
                      </div>
                    </td>

                    {/* 2. Contact Phone (Strict Truth Protocol) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {candidate.phone ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-mono tabular-nums font-semibold">
                            <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{candidate.phone}</span>
                          </div>
                          {isMobile ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-serif bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                                Direct Mobile
                              </span>
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[9px] font-medium transition-colors"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[9px] font-serif bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">
                              Desk Landline
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          -- Not Listed
                        </span>
                      )}
                    </td>

                    {/* 3. Email & Website */}
                    <td className="py-3 px-3 max-w-[200px]">
                      {candidate.email ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-800 truncate">
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <a
                            href={`mailto:${candidate.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline text-blue-700 truncate"
                          >
                            {candidate.email}
                          </a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Email: <span className="text-slate-400">--</span>
                        </div>
                      )}

                      {candidate.website ? (
                        <a
                          href={candidate.website}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 mt-1 truncate max-w-[180px]"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{candidate.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <div className="text-[10px] text-slate-400">Website: --</div>
                      )}
                    </td>

                    {/* 4. Fit & Confidence */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">
                          {candidate.service_line_primary}
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-mono font-bold tabular-nums">
                          {candidate.service_fit_score}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Confidence: <span className="font-mono text-slate-600">{candidate.data_confidence}%</span>
                      </div>
                    </td>

                    {/* 5. Source Provenance */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-block px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[10px] font-mono">
                        {candidate.source_provider === 'osm_overpass'
                          ? 'Commercial Registry'
                          : candidate.source_provider === 'gemini_search'
                          ? 'Gemini Search'
                          : 'Public Directory'}
                      </div>
                    </td>

                    {/* 6. Inspect Action */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectCandidate(candidate);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-[11px] transition-colors border border-slate-200 hover:border-blue-300 cursor-pointer font-serif"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
