/**
 * Candidate Details Flyout Drawer
 * Clean white and blue styling with font Lora and AccordionMotion.
 * Full transparency inspection of business summary, official-source evidence,
 * service-fit scoring, direct contact routes, and verification signals.
 */

import React, { useEffect } from 'react';
import { CandidateStaging } from '../types/leadDiscovery.ts';
import { AccordionMotion } from './AccordionMotion.tsx';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2,
  MessageCircle,
  Building2,
  Globe
} from 'lucide-react';

interface CandidateDrawerProps {
  candidate: CandidateStaging | null;
  onClose: () => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const rawPhoneDigits = candidate.phone ? candidate.phone.replace(/\D/g, '') : null;
  const isMobile = candidate.phone && (/^\+91\s*[6-9]/.test(candidate.phone) || candidate.phone.startsWith('+91 9') || candidate.phone.startsWith('+91 8') || candidate.phone.startsWith('+91 7'));
  const whatsappUrl = isMobile && rawPhoneDigits ? `https://wa.me/${rawPhoneDigits.startsWith('91') ? rawPhoneDigits : '91' + rawPhoneDigits}` : null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(candidate.business_name + ' ' + (candidate.address || candidate.city))}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs font-serif">
      <div 
        className="w-full max-w-xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Verified Pipeline Lead
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{candidate.ai_selection_rank || 1}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                {candidate.business_name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{candidate.address || `${candidate.area}, ${candidate.city}`}</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1 underline"
                >
                  Map
                </a>
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scores Matrix */}
          <div className="my-5 grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Service Fit
              </span>
              <span className="text-xl font-bold text-blue-600 font-mono tabular-nums">
                {candidate.service_fit_score}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 capitalize">
                {candidate.service_line_primary}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Intent Score
              </span>
              <span className="text-xl font-bold text-slate-800 font-mono tabular-nums">
                {candidate.intent_score}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                B2B Purchase
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                Confidence
              </span>
              <span className="text-xl font-bold text-slate-800 font-mono tabular-nums">
                {candidate.data_confidence}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Multi-Verified
              </span>
            </div>
          </div>

          {/* AI Reason */}
          <div className="mb-5 bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Verified Commercial Evidence
            </h3>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              {candidate.evidence_summary || candidate.ai_selection_reason}
            </p>
          </div>

          {/* Accordion in Motion: Contact Route */}
          <div className="space-y-3 mb-5">
            <AccordionMotion
              title="Direct Contact Routing"
              subtitle={isMobile ? "Direct Mobile Line Available" : "Desk Contact Available"}
              defaultOpen={true}
              badge={
                isMobile ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-sans">
                    WhatsApp Ready
                  </span>
                ) : null
              }
            >
              <div className="space-y-3 text-xs">
                {/* Phone */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900">{candidate.phone || 'Not Listed'}</div>
                      <div className="text-[10px] text-slate-400">
                        {isMobile ? 'Direct 10-Digit Mobile Contact' : 'Reception Landline'}
                      </div>
                    </div>
                  </div>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-sans hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900">{candidate.email || 'Not Listed'}</div>
                      <div className="text-[10px] text-slate-400">Official Corporate Email</div>
                    </div>
                  </div>
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-sans hover:bg-blue-100 transition-colors"
                    >
                      Compose
                    </a>
                  )}
                </div>

                {/* Website */}
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-900 truncate max-w-[240px]">
                        {candidate.website || 'Not Listed'}
                      </div>
                      <div className="text-[10px] text-slate-400">Live Web Domain</div>
                    </div>
                  </div>
                  {candidate.website && (
                    <a
                      href={candidate.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-sans hover:bg-slate-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit</span>
                    </a>
                  )}
                </div>
              </div>
            </AccordionMotion>

            {/* Accordion in Motion: Evidence & Provenance */}
            <AccordionMotion
              title="Provenance & Source Facts"
              subtitle="Truthful Missing Protocol Applied"
              defaultOpen={false}
            >
              <div className="space-y-2 text-xs">
                {candidate.evidence_items?.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">{item.fact}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="truncate max-w-[240px]">
                        URL: {item.source_url}
                      </span>
                      <span className="text-blue-600 font-semibold">{item.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionMotion>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Deduplicated & Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
