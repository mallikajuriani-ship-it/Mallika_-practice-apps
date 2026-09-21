import React from 'react';
import { Printer, Download, X, Layers, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface PrintableReportModalProps {
  analysis: AnalysisResult | null;
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({ analysis, onClose }) => {
  if (!analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  const highImpactChanges = analysis.changes.filter((c) => c.impact === 'high');
  const otherChanges = analysis.changes.filter((c) => c.impact !== 'high');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Action Header bar (hidden when printed) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span className="font-display font-bold text-sm tracking-wide">
              CPG Change Radar — Commercial Intelligence Report
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto print:p-0 print:overflow-visible space-y-8 bg-white text-slate-900 text-sm">
          {/* Header Title Section */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-700 block mb-1">
                  COMMERCIAL CHANGE INTELLIGENCE REPORT
                </span>
                <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                  CPG Change Radar Audit
                </h1>
                <p className="text-sm text-slate-700 mt-1 italic">
                  "Know what changed. Know what matters. Know what to do."
                </p>
              </div>
              <div className="text-right text-xs text-slate-700">
                <p className="font-bold text-slate-700">Generated Date:</p>
                <p>{new Date(analysis.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-[11px] text-slate-700 mt-0.5">Report ID: {analysis.id}</p>
              </div>
            </div>
          </div>

          {/* Section 1: Document Information */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
              1. Document Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-700 font-semibold block mb-0.5">Client / Brand:</span>
                <span className="font-bold text-slate-900">{analysis.metadata.clientBrand || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-700 font-semibold block mb-0.5">Retailer:</span>
                <span className="font-bold text-slate-900">{analysis.metadata.retailer || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-700 font-semibold block mb-0.5">Document Name:</span>
                <span className="font-bold text-slate-900">{analysis.metadata.documentName || 'Commercial Comparison'}</span>
              </div>
              <div>
                <span className="text-slate-700 font-semibold block mb-0.5">Total Changes:</span>
                <span className="font-bold text-slate-900">{analysis.executiveSummary.totalChanges} detected</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-700 font-semibold block">Previous Version File:</span>
                <span className="font-medium text-slate-800">{analysis.previousFileName}</span>
                {analysis.metadata.previousVersionDate && (
                  <span className="text-slate-700 ml-2">({analysis.metadata.previousVersionDate})</span>
                )}
              </div>
              <div>
                <span className="text-slate-700 font-semibold block">New Version File:</span>
                <span className="font-medium text-slate-800">{analysis.newFileName}</span>
                {analysis.metadata.newVersionDate && (
                  <span className="text-slate-700 ml-2">({analysis.metadata.newVersionDate})</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
              2. Executive Summary
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="text-2xl font-bold font-display text-rose-700 block">
                  {analysis.executiveSummary.highImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  High Impact
                </span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-2xl font-bold font-display text-amber-700 block">
                  {analysis.executiveSummary.mediumImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Medium Impact
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-2xl font-bold font-display text-emerald-700 block">
                  {analysis.executiveSummary.lowImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Low Impact
                </span>
              </div>
            </div>
            {analysis.executiveSummary.narrativeSummary && (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                {analysis.executiveSummary.narrativeSummary}
              </p>
            )}
          </div>

          {/* Section 3: Key High-Impact Changes */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
              3. Key Commercial Changes
            </h2>
            <div className="space-y-4">
              {highImpactChanges.length === 0 ? (
                <p className="text-xs text-slate-700 italic">No high impact changes were detected.</p>
              ) : (
                highImpactChanges.map((change, idx) => (
                  <div key={change.id || idx} className="p-4 rounded-lg border border-rose-200 bg-rose-50/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-sm">{change.title}</span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {change.category} &bull; HIGH
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mb-2">{change.what_changed}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded border border-rose-100 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-700 block">Previous:</span>
                        <span className="text-slate-800">{change.previous_value}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-rose-700 block">New:</span>
                        <span className="font-bold text-slate-900">{change.new_value}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 mb-1.5">
                      <strong className="text-slate-800">Why it matters:</strong> {change.why_it_matters}
                    </div>
                    <div className="text-xs text-slate-900 font-semibold bg-white p-2 rounded border border-rose-200">
                      <strong>Action:</strong> {change.recommended_action}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Detailed Changes Table */}
          <div className="page-break">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
              4. Detailed Changes Register
            </h2>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                  <th className="py-2 px-2.5 w-16">Impact</th>
                  <th className="py-2 px-2.5 w-20">Type</th>
                  <th className="py-2 px-2.5 w-24">Category</th>
                  <th className="py-2 px-2.5">Change & Values</th>
                  <th className="py-2 px-2.5">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analysis.changes.map((c, i) => (
                  <tr key={c.id || i} className="align-top">
                    <td className="py-2 px-2.5 font-bold uppercase text-[10px]">
                      {c.impact}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 uppercase text-[10px] font-semibold">
                      {c.change_type}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700 font-medium">
                      {c.category}
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-slate-700 mt-0.5">{c.what_changed}</div>
                      <div className="text-[11px] text-slate-700 mt-1">
                        <span className="font-semibold">Prev:</span> {c.previous_value} &bull;{' '}
                        <span className="font-semibold">New:</span> {c.new_value}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {c.why_it_matters}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: Recommended Actions */}
          <div className="pt-4 border-t border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b border-slate-200 pb-1">
              5. Recommended Commercial Action Plan
            </h2>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                  <th className="py-2 px-2.5 w-20">Priority</th>
                  <th className="py-2 px-2.5">Recommended Action</th>
                  <th className="py-2 px-2.5">Reason / Commercial Driver</th>
                  <th className="py-2 px-2.5">Related Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analysis.actionPlan.map((act, i) => (
                  <tr key={act.id || i} className="align-top">
                    <td className="py-2 px-2.5 font-bold uppercase text-[10px]">
                      {act.priority}
                    </td>
                    <td className="py-2 px-2.5 font-bold text-slate-900">
                      {act.action}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {act.reason}
                    </td>
                    <td className="py-2 px-2.5 text-slate-700">
                      {act.related_change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
