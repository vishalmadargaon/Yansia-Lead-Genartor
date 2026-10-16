/**
 * Web Crawler Test Modal
 * Live interactive testing tool allowing users to test the zero-cost
 * headless HTTP site scraper on any company domain to inspect extracted emails and phones.
 */

import React, { useState } from 'react';
import { Globe, Search, X, Loader2, CheckCircle2, Phone, Mail, Link } from 'lucide-react';
import { CrawlResult } from '../../server/webCrawlerService.ts';

interface WebCrawlerTestModalProps {
  onClose: () => void;
}

export const WebCrawlerTestModal: React.FC<WebCrawlerTestModalProps> = ({ onClose }) => {
  const [testUrl, setTestUrl] = useState('https://wework.co.in');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai-sdr/scrape-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl.trim() })
      });

      if (!res.ok) throw new Error('Failed to crawl domain');
      const data: CrawlResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Scrape request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Live HTTP Site Crawler Test
              </h3>
              <p className="text-xs text-slate-400">
                Zero-cost deep HTML scraper for corporate contact verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleTestScrape} className="space-y-3 my-4">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://company.com"
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !testUrl.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{isLoading ? 'Crawling...' : 'Crawl URL'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Canonical Domain:</span>
              <span className="font-mono text-cyan-300 font-semibold">{result.domain}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contact Page Detected:</span>
              <span className="font-mono text-emerald-400">
                {result.hasContactPage ? 'Yes (/contact)' : 'No'}
              </span>
            </div>

            <div className="border-t border-slate-900 pt-2.5">
              <span className="text-slate-400 block mb-1">Extracted Phone Numbers:</span>
              {result.phones.length > 0 ? (
                <div className="space-y-1">
                  {result.phones.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-200 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 font-mono">None found on public page</span>
              )}
            </div>

            <div className="border-t border-slate-900 pt-2.5">
              <span className="text-slate-400 block mb-1">Extracted Corporate Emails:</span>
              {result.emails.length > 0 ? (
                <div className="space-y-1">
                  {result.emails.map((e, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-200 font-mono">
                      <Mail className="w-3 h-3 text-cyan-400" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 font-mono">None found on public page</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
