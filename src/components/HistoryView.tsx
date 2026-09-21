import React from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Building,
  Store,
  ShieldAlert,
  FileSpreadsheet,
  Database,
  Sparkles,
} from 'lucide-react';
import { AnalysisHistoryItem, AnalysisResult } from '../types';
import { exportAnalysisToExcel } from '../utils/exportUtils';

interface HistoryViewProps {
  history: AnalysisHistoryItem[];
  onSelectHistoryItem: (analysis: AnalysisResult) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onNewAnalysis: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectHistoryItem,
  onDeleteItem,
  onClearAll,
  onNewAnalysis,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-slate-900">
              Audit Database & History
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Commercial document audits persisted to database with enterprise tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              Clear Local Cache
            </button>
          )}
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-pink-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-blue-100 shadow-sm mt-6 p-8">
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Past Analyses in Database</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Compare two commercial documents to automatically record and persist audit findings here.
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistoryItem(item.data)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-pink-300 hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {item.client} &bull; {item.retailer}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-pink-500" />
                    <span>{item.analysisDate}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-600 transition-colors leading-snug">
                  {item.documentName}
                </h3>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-blue-900 text-sm">
                      {item.totalChanges}
                    </span>
                    <span className="text-slate-500 font-medium">changes</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-pink-700 font-semibold">
                    <ShieldAlert className="w-4 h-4 text-pink-600" />
                    <span className="font-extrabold text-sm">{item.highImpactCount}</span>
                    <span className="text-[11px] uppercase">high impact</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportAnalysisToExcel(item.data);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 font-medium py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Download Excel spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Excel</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-bold text-pink-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
