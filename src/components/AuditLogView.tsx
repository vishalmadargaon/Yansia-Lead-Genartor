/**
 * Audit Trail & Event Ledger View
 * Provides auditable transparency across campaign planning, data harvesting,
 * duplicate filtering, policy gating, human confirmation, and CRM import events.
 */

import React from 'react';
import { AuditEvent } from '../types/leadDiscovery.ts';
import { History, ShieldCheck, Database, Sparkles, Compass, AlertTriangle } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              System Audit Trail & Provenance Ledger
            </h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {logs.length} Audit Events
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Immutable log tracking provider selection, AI scoring, deduplication, human confirmation, and CRM persistence.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="space-y-4">
          {logs.map((log) => {
            let icon = <Compass className="w-4 h-4 text-cyan-400" />;
            if (log.event_type === 'LEADS_PERSISTED_TO_CRM') icon = <Database className="w-4 h-4 text-emerald-400" />;
            if (log.event_type === 'AI_BATCH_SELECTED') icon = <Sparkles className="w-4 h-4 text-indigo-400" />;
            if (log.event_type === 'POLICY_RESTRICTION_ENFORCED') icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;

            return (
              <div
                key={log.event_id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white font-mono">
                      {log.event_type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {log.message}
                  </p>

                  {log.counts && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400">
                      {log.counts.discovered !== undefined && <span>Discovered: {log.counts.discovered}</span>}
                      {log.counts.unique !== undefined && <span>&bull; Unique: {log.counts.unique}</span>}
                      {log.counts.eligible !== undefined && (
                        <span className="text-indigo-400 font-bold">&bull; Eligible: {log.counts.eligible}</span>
                      )}
                      {log.counts.rejected !== undefined && <span>&bull; Rejected: {log.counts.rejected}</span>}
                      {log.counts.blocked !== undefined && (
                        <span className="text-rose-400">&bull; Blocked: {log.counts.blocked}</span>
                      )}
                      {log.counts.imported !== undefined && (
                        <span className="text-emerald-400 font-bold">&bull; Imported: {log.counts.imported}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
