import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  ArrowLeft,
  Share2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { AnalysisResult, ChangeItem } from '../types';
import { ExecutiveSummaryView } from './ExecutiveSummaryView';
import { ChangesTable } from './ChangesTable';
import { ActionPlanSection } from './ActionPlanSection';
import { AskAISection } from './AskAISection';
import { ChangeDetailModal } from './ChangeDetailModal';
import { PrintableReportModal } from './PrintableReportModal';
import { exportAnalysisToExcel } from '../utils/exportUtils';

interface AnalysisResultsViewProps {
  analysis: AnalysisResult;
  onBackToUpload: () => void;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  analysis,
  onBackToUpload,
}) => {
  const [selectedChange, setSelectedChange] = useState<ChangeItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'actions' | 'ask'>('overview');

  const topChanges = analysis.changes.slice(0, 6);

  // If no material changes detected
  if (analysis.noChangesDetected && analysis.changes.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900">
            Audit Complete
          </h2>
          <p className="text-base text-slate-600 font-medium mt-2 max-w-md mx-auto">
            {analysis.message || 'No material commercial changes were identified between these documents.'}
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 max-w-lg mx-auto text-left space-y-1.5">
            <div>
              <span className="font-bold text-blue-800">Baseline Document:</span>{' '}
              {analysis.previousFileName}
            </div>
            <div>
              <span className="font-bold text-pink-700">New Document:</span>{' '}
              {analysis.newFileName}
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              The AI compared commercial parameters including SKUs, prices, margins, store counts, promo mechanics, and clauses. All tracked items remain materially consistent.
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={onBackToUpload}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white font-bold text-sm transition-all shadow-md shadow-pink-500/20 cursor-pointer"
            >
              Compare Other Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToUpload}
            className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
            title="Upload new documents"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-extrabold text-slate-900">
                {analysis.metadata.documentName || 'Document Comparison'}
              </h1>
              <span className="text-xs bg-pink-50 text-pink-700 font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
                Audit Results
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {analysis.metadata.clientBrand && <span className="font-semibold text-blue-800">{analysis.metadata.clientBrand} &bull; </span>}
              {analysis.metadata.retailer && <span className="font-semibold text-pink-700">{analysis.metadata.retailer} &bull; </span>}
              Comparing <span className="text-blue-700 font-medium">{analysis.previousFileName}</span> &rarr; <span className="text-pink-700 font-medium">{analysis.newFileName}</span>
            </p>
          </div>
        </div>

        {/* Export & Print Buttons (Pink and Blue styled) */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-excel"
            onClick={() => exportAnalysisToExcel(analysis)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-800 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          <button
            id="btn-export-report"
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white text-xs font-bold shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-pink-200" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Segmented Section Tabs (Pink and Blue active states) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-pink-600 text-pink-700 bg-pink-50/40 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Executive Summary & Top Changes
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'table'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>All Changes</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
            {analysis.changes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'actions'
              ? 'border-pink-600 text-pink-700 bg-pink-50/40 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Action Plan</span>
          <span className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-[10px] font-bold">
            {analysis.actionPlan.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ask')}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ask'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <ExecutiveSummaryView
            summary={analysis.executiveSummary}
            topChanges={topChanges}
            onSelectChange={setSelectedChange}
            metadataClient={analysis.metadata.clientBrand}
            metadataRetailer={analysis.metadata.retailer}
          />

          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Want to see all {analysis.changes.length} changes with deep search and filters?
            </span>
            <button
              onClick={() => setActiveTab('table')}
              className="text-xs font-bold text-pink-600 hover:text-pink-800 cursor-pointer"
            >
              Open Changes Table &rarr;
            </button>
          </div>

          <ActionPlanSection actionPlan={analysis.actionPlan} analysisId={analysis.id} />

          <AskAISection analysis={analysis} />
        </div>
      )}

      {activeTab === 'table' && (
        <div className="space-y-6">
          <ChangesTable
            changes={analysis.changes}
            onSelectChange={setSelectedChange}
          />
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6">
          <ActionPlanSection actionPlan={analysis.actionPlan} analysisId={analysis.id} />
        </div>
      )}

      {activeTab === 'ask' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <AskAISection analysis={analysis} />
        </div>
      )}

      {/* Change Detail Modal */}
      {selectedChange && (
        <ChangeDetailModal
          change={selectedChange}
          onClose={() => setSelectedChange(null)}
          previousFileName={analysis.previousFileName}
          newFileName={analysis.newFileName}
        />
      )}

      {/* Printable Report Modal */}
      {showReportModal && (
        <PrintableReportModal
          analysis={analysis}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
