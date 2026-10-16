/**
 * Yanisa CRM Lead Database View
 * Redesigned in crisp white and royal blue with font Lora.
 * Shows all persisted leads in the main CRM, allows updating pipeline stage,
 * one-click communication (Direct Mobile, WhatsApp, Email, Maps), and multi-format exports.
 */

import React, { useState } from 'react';
import { CrmLead, YanisaServiceLine } from '../types/leadDiscovery.ts';
import { ExportUtils } from '../utils/exportUtils.ts';
import { 
  Database, 
  Download, 
  Search, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  MessageCircle,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

interface CrmLeadsViewProps {
  leads: CrmLead[];
  onUpdateStatus: (leadId: string, status: CrmLead['status']) => Promise<void>;
  onDeleteLead: (leadId: string) => Promise<void>;
}

export const CrmLeadsView: React.FC<CrmLeadsViewProps> = ({
  leads,
  onUpdateStatus,
  onDeleteLead
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const filtered = leads.filter(l => {
    const matchSearch = (l.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.area || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 font-serif">
      {/* Top Banner & Export Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              CRM Pipeline Database
            </h2>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full tabular-nums font-semibold">
              {leads.length} Active Leads
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Deduplicated commercial leads ready for outreach with verified Indian phone numbers and web domains.
          </p>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            disabled={leads.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Pipeline ({filtered.length})</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-30 divide-y divide-slate-100">
              <button
                onClick={() => {
                  ExportUtils.exportToCsv(filtered);
                  setExportMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Export as CSV (.csv)</span>
              </button>

              <button
                onClick={() => {
                  ExportUtils.exportToXlsx(filtered);
                  setExportMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Export as Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => {
                  ExportUtils.exportToPdf(filtered);
                  setExportMenuOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Export Executive PDF Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, city or phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 font-serif"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-slate-500">Pipeline Stage:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 text-xs focus:outline-hidden focus:border-blue-500 font-serif"
          >
            <option value="all">All Stages ({leads.length})</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="CONVERTED">CONVERTED</option>
          </select>
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium tracking-wider uppercase text-[10px]">
                <th className="py-3 px-4">Business / Micro-Market</th>
                <th className="py-3 px-3">Contact Phone</th>
                <th className="py-3 px-3">Email &amp; Domain</th>
                <th className="py-3 px-3">Fit Score</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.business_name + ' ' + (lead.address || lead.city))}`;
                  const rawPhoneDigits = lead.phone ? lead.phone.replace(/\D/g, '') : null;
                  const isMobile = lead.phone && (/^\+91\s*[6-9]/.test(lead.phone) || lead.phone.startsWith('+91 9') || lead.phone.startsWith('+91 8') || lead.phone.startsWith('+91 7'));
                  const whatsappUrl = isMobile && rawPhoneDigits ? `https://wa.me/${rawPhoneDigits.startsWith('91') ? rawPhoneDigits : '91' + rawPhoneDigits}` : null;

                  return (
                    <tr key={lead.lead_id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Business & Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-serif font-bold text-slate-900 text-sm">{lead.business_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                            {lead.area || 'Commercial'}
                          </span>
                          <span>{lead.city}</span>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 ml-1 inline-flex items-center gap-0.5 text-[10px]"
                            title="Open Google Maps"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Map</span>
                          </a>
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {lead.phone ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-900 font-mono tabular-nums font-semibold">
                              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                            {isMobile ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded">
                                  Direct Mobile
                                </span>
                                {whatsappUrl && (
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[9px] font-medium transition-colors"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded">
                                Reception Desk
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            -- Not Listed
                          </span>
                        )}
                      </td>

                      {/* Email & Website */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        {lead.email ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-800 truncate">
                            <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:underline text-blue-700 truncate">
                              {lead.email}
                            </a>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-mono">Email: --</div>
                        )}

                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 mt-1 truncate max-w-[160px]"
                          >
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <div className="text-[10px] text-slate-400">Website: --</div>
                        )}
                      </td>

                      {/* Fit Score */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-mono font-bold tabular-nums">
                          {lead.fit_score}%
                        </span>
                      </td>

                      {/* Pipeline Status Selector */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => onUpdateStatus(lead.lead_id, e.target.value as CrmLead['status'])}
                          className={`text-xs font-medium rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            lead.status === 'CONVERTED'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : lead.status === 'PROPOSAL' || lead.status === 'QUALIFIED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : lead.status === 'CONTACTED'
                              ? 'bg-slate-100 text-slate-800 border-slate-200'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="PROPOSAL">PROPOSAL</option>
                          <option value="CONVERTED">CONVERTED</option>
                        </select>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteLead(lead.lead_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
};
