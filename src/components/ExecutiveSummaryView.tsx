import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ChangeItem, ExecutiveSummary } from '../types';

interface ExecutiveSummaryViewProps {
  summary: ExecutiveSummary;
  topChanges: ChangeItem[];
  onSelectChange: (change: ChangeItem) => void;
  metadataClient?: string;
  metadataRetailer?: string;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  summary,
  topChanges,
  onSelectChange,
  metadataClient,
  metadataRetailer,
}) => {
  return (
    <div className="space-y-6">
      {/* Executive KPI Banner with Pink & Blue styling */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-700">
                AI Commercial Audit & Database Synced
              </span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900">
              Audit Complete
            </h2>
            {(metadataClient || metadataRetailer) && (
              <p className="text-xs text-slate-500 mt-1">
                Context:{' '}
                <span className="font-semibold text-blue-800">{metadataClient || 'Brand'}</span> &bull;{' '}
                <span className="font-semibold text-pink-700">{metadataRetailer || 'Retailer'}</span>
              </p>
            )}
          </div>

          <div className="text-left sm:text-right bg-gradient-to-r from-blue-50 to-pink-50 px-4 py-2 rounded-xl border border-pink-100">
            <span className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-pink-600 tracking-tight">
              {summary.totalChanges}
            </span>
            <span className="text-sm font-bold text-slate-700 ml-2">changes detected</span>
          </div>
        </div>

        {/* 3 Impact Level Badges (Pink, Blue, Slate) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {/* High Impact - Pink Theme */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-50/70 border border-pink-200/80">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-pink-800">
                  {summary.highImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-700">
                  High Impact
                </span>
              </div>
              <p className="text-[11px] text-pink-600 font-medium">Requires immediate commercial sign-off</p>
            </div>
          </div>

          {/* Medium Impact - Blue Theme */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-blue-800">
                  {summary.mediumImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Medium Impact
                </span>
              </div>
              <p className="text-[11px] text-blue-600 font-medium">Commercial terms to investigate</p>
            </div>
          </div>

          {/* Low Impact */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-display font-black text-slate-800">
                  {summary.lowImpactCount}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Low Impact
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Informational; low urgency</p>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        {summary.narrativeSummary && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-50/40 via-white to-pink-50/40 border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Commercial Narrative</span>
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {summary.narrativeSummary}
            </p>
          </div>
        )}
      </div>

      {/* Top Changes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Top Commercial Changes
            </h3>
            <p className="text-xs text-slate-500">
              Highest-priority changes requiring cross-functional attention
            </p>
          </div>
          <span className="text-xs text-pink-700 font-bold bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
            Showing top {topChanges.length} priority items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topChanges.map((change) => {
            const isHigh = change.impact === 'high';
            const isMed = change.impact === 'medium';

            const impactBg = isHigh
              ? 'bg-pink-100 text-pink-800 border-pink-300'
              : isMed
              ? 'bg-blue-100 text-blue-800 border-blue-300'
              : 'bg-slate-100 text-slate-700 border-slate-300';

            const impactDot = isHigh
              ? 'bg-pink-500'
              : isMed
              ? 'bg-blue-500'
              : 'bg-slate-400';

            return (
              <div
                key={change.id}
                onClick={() => onSelectChange(change)}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-pink-300 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top metadata tags */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${impactBg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${impactDot}`} />
                        {change.impact}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                        {change.category}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        {change.change_type}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 transition-colors leading-snug">
                    {change.title}
                  </h4>

                  {/* What Changed */}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {change.what_changed}
                  </p>

                  {/* Previous vs New Comparison Box (Blue and Pink) */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                        Previous (Blue)
                      </span>
                      <span className="font-medium text-slate-800 break-words">
                        {change.previous_value}
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block mb-0.5">
                        New (Pink)
                      </span>
                      <span className="font-semibold text-slate-900 break-words">
                        {change.new_value}
                      </span>
                    </div>
                  </div>

                  {/* Why it matters */}
                  <div className="mt-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                      Why it matters:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {change.why_it_matters}
                    </p>
                  </div>
                </div>

                {/* Recommended Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block">
                      Recommended Action:
                    </span>
                    <span className="font-medium text-slate-800 line-clamp-1">
                      {change.recommended_action}
                    </span>
                  </div>
                  <span className="text-pink-600 font-bold flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                    Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
