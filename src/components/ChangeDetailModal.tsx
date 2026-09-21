import React from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, FileText, ArrowRight, Quote, Sparkles } from 'lucide-react';
import { ChangeItem } from '../types';

interface ChangeDetailModalProps {
  change: ChangeItem | null;
  onClose: () => void;
  previousFileName: string;
  newFileName: string;
}

export const ChangeDetailModal: React.FC<ChangeDetailModalProps> = ({
  change,
  onClose,
  previousFileName,
  newFileName,
}) => {
  if (!change) return null;

  const isHigh = change.impact === 'high';
  const isMed = change.impact === 'medium';

  const impactBg = isHigh
    ? 'bg-pink-100 text-pink-800 border-pink-300'
    : isMed
    ? 'bg-blue-100 text-blue-800 border-blue-300'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  const impactIcon = isHigh ? (
    <ShieldAlert className="w-4 h-4 text-pink-600" />
  ) : isMed ? (
    <AlertTriangle className="w-4 h-4 text-blue-600" />
  ) : (
    <CheckCircle2 className="w-4 h-4 text-slate-500" />
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-blue-100 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500" />

        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-50/40 via-white to-pink-50/40 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${impactBg}`}
              >
                {impactIcon}
                {change.impact} Impact
              </span>
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                {change.category}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold uppercase tracking-wider border border-pink-200">
                {change.change_type}
              </span>
            </div>
            <h3 className="text-xl font-display font-extrabold text-slate-900 leading-tight">
              {change.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* What Changed */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              What Changed?
            </h4>
            <p className="text-sm text-slate-800 leading-relaxed font-normal bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
              {change.what_changed}
            </p>
          </div>

          {/* Previous vs New Values (Blue vs Pink) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                Previous Version Value (Blue)
              </span>
              <p className="text-sm font-semibold text-slate-800 break-words">
                {change.previous_value}
              </p>
              <span className="text-[10px] text-blue-600 font-medium mt-2 block truncate">
                File: {previousFileName}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-800 block mb-1">
                New Version Value (Pink)
              </span>
              <p className="text-sm font-extrabold text-slate-900 break-words">
                {change.new_value}
              </p>
              <span className="text-[10px] text-pink-600 font-medium mt-2 block truncate">
                File: {newFileName}
              </span>
            </div>
          </div>

          {/* Why it Matters (AI Commercial Explanation) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Commercial Significance & Impact</span>
            </h4>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/30 to-pink-50/30 border border-pink-200/80 text-sm text-slate-800 leading-relaxed">
              {change.why_it_matters}
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Recommended Action Plan
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-sm font-semibold text-slate-900 leading-relaxed flex items-start gap-2.5">
              <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{change.recommended_action}</span>
            </div>
          </div>

          {/* Grounding Evidence / Source Citations */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Quote className="w-4 h-4 text-pink-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Grounded Source Evidence
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Direct excerpts extracted from both uploaded files verifying this difference.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 text-blue-200 font-mono text-xs overflow-x-auto border-l-4 border-blue-500">
                <span className="text-[10px] text-blue-400 uppercase tracking-wider font-sans font-bold block mb-1">
                  Previous Document Excerpt:
                </span>
                <span className="whitespace-pre-wrap">{change.evidence_previous}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-pink-200 font-mono text-xs overflow-x-auto border-l-4 border-pink-500">
                <span className="text-[10px] text-pink-400 uppercase tracking-wider font-sans font-bold block mb-1">
                  New Document Excerpt:
                </span>
                <span className="whitespace-pre-wrap">{change.evidence_new}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-pink-500/20"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
