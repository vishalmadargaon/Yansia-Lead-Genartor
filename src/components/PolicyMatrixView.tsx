/**
 * Provider Policy Matrix & License Compliance View
 * Explains the legal boundaries between OpenStreetMap (ODbL) and Google Places (ToS),
 * clarifying why Google listing content cannot be saved to CRM under standard terms.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { PROVIDER_POLICIES } from '../../server/policyGateService.ts';

export const PolicyMatrixView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">
            Provider Legal Governance & Policy Gate
          </h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Every adapter declares what the system may display, process, retain, and import.
          Human approval cannot make restricted data export permissible. Data sources are kept strictly separate.
        </p>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* OpenStreetMap Card */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                OpenStreetMap (Overpass API)
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                CRM IMPORT ELIGIBLE
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              OpenStreetMap data is licensed under the <strong>Open Database License (ODbL) 1.0</strong>.
              Commercial lead discovery and persistent candidate storage are permitted subject to attribution obligations.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Permanent storage of POI names, coordinates, and tags allowed.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero billing, no API quotas, 100% free unmetered infrastructure.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Required attribution: &ldquo;&copy; OpenStreetMap contributors&rdquo;.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">License: ODbL 1.0</span>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View ODbL Terms</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Google Places Card */}
        <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Google Places API (New)
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                RESTRICTED PREVIEW ONLY
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Google Maps Platform Terms of Service strictly prohibit copying, caching, or exporting
              business listing content into a separate CRM lead database.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Storing business names, addresses, or ratings in CRM is prohibited.</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Cannot be fed into AI candidate training or persistent scoring models.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Allowed: Ephemeral in-session preview & Place ID caching only.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Terms: Google Maps Platform ToS</span>
            <a
              href="https://cloud.google.com/maps-platform/terms"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View Google ToS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
