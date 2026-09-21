import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Info,
  Calendar,
  Building,
  Store,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentMetadata, UploadedFileState } from '../types';
import { parseUploadedFile, formatFileSize } from '../utils/fileParser';
import { SAMPLE_PAIRS, SamplePair } from '../data/sampleDocuments';

interface DocumentUploadSectionProps {
  previousDoc: UploadedFileState | null;
  newDoc: UploadedFileState | null;
  setPreviousDoc: React.Dispatch<React.SetStateAction<UploadedFileState | null>>;
  setNewDoc: React.Dispatch<React.SetStateAction<UploadedFileState | null>>;
  metadata: DocumentMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<DocumentMetadata>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onLoadSample: (sample: SamplePair) => void;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  previousDoc,
  newDoc,
  setPreviousDoc,
  setNewDoc,
  metadata,
  setMetadata,
  onAnalyze,
  isAnalyzing,
  onLoadSample,
}) => {
  const [showMetadata, setShowMetadata] = useState(true);
  const prevInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'previous' | 'new'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'previous') {
      setPreviousDoc({
        name: file.name,
        size: file.size,
        type: 'Reading...',
        mimeType: file.type,
        status: 'reading',
      });
      const parsed = await parseUploadedFile(file);
      setPreviousDoc(parsed);
    } else {
      setNewDoc({
        name: file.name,
        size: file.size,
        type: 'Reading...',
        mimeType: file.type,
        status: 'reading',
      });
      const parsed = await parseUploadedFile(file);
      setNewDoc(parsed);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, target: 'previous' | 'new') => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (target === 'previous') {
      setPreviousDoc({
        name: file.name,
        size: file.size,
        type: 'Reading...',
        mimeType: file.type,
        status: 'reading',
      });
      const parsed = await parseUploadedFile(file);
      setPreviousDoc(parsed);
    } else {
      setNewDoc({
        name: file.name,
        size: file.size,
        type: 'Reading...',
        mimeType: file.type,
        status: 'reading',
      });
      const parsed = await parseUploadedFile(file);
      setNewDoc(parsed);
    }
  };

  const canAnalyze =
    previousDoc &&
    newDoc &&
    previousDoc.status === 'ready' &&
    newDoc.status === 'ready' &&
    !isAnalyzing;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner with Pink and Blue styling */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 via-pink-50 to-blue-50 text-slate-800 text-xs font-semibold mb-4 border border-pink-200/80 shadow-xs">
          <span className="text-blue-700 font-bold">AI Commercial Decision Support</span>
          <span className="text-pink-500 font-bold">•</span>
          <span className="text-pink-700 font-bold">Pink & Blue Theme</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          CPG CHANGE RADAR
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          Compare retailer and commercial documents with automated database persistence and enterprise access control.
        </p>
        <p className="mt-1 text-xs text-pink-600 font-semibold italic">
          "Know what changed. Know what matters. Know what to do."
        </p>
      </div>

      {/* Preset CPG Scenarios Card */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 pt-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pre-loaded CPG Retailer Scenarios
            </span>
          </div>
          <span className="text-xs text-slate-500">Click to instantly populate realistic retailer files</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {SAMPLE_PAIRS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-slate-200 hover:border-pink-300 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-pink-50/40 transition-all text-sm group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-pink-100 text-blue-700 group-hover:text-pink-700 transition-colors shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 group-hover:text-pink-600 flex items-center justify-between">
                  <span>{sample.name}</span>
                  <span className="text-[11px] font-bold text-blue-600 group-hover:text-pink-600">
                    Load &rarr;
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {sample.clientBrand} &bull; {sample.retailer}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {sample.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Document Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PREVIOUS VERSION CARD (BLUE THEME) */}
        <div className="bg-white rounded-2xl border-2 border-blue-100/90 hover:border-blue-300 shadow-sm p-5 flex flex-col transition-all">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                1. BASELINE VERSION (BLUE)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Previous version</h3>
              <p className="text-xs text-slate-500">Upload the baseline / older document</p>
            </div>
            {previousDoc && previousDoc.status === 'ready' && (
              <span className="flex items-center gap-1 text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Ready
              </span>
            )}
          </div>

          <input
            type="file"
            ref={prevInputRef}
            onChange={(e) => handleFileSelection(e, 'previous')}
            accept=".csv,.xlsx,.xls,.pdf,.docx,.txt,.png,.jpg,.jpeg"
            className="hidden"
          />

          {!previousDoc ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'previous')}
              onClick={() => prevInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/20 hover:bg-blue-50/50 rounded-xl p-8 text-center cursor-pointer transition-colors flex-1 flex flex-col items-center justify-center min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your previous document here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or <span className="text-blue-600 font-semibold underline">browse from computer</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-3">
                Supports: PDF, XLSX, XLS, CSV, DOCX, JPG, PNG, TXT
              </p>
            </div>
          ) : (
            <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate" title={previousDoc.name}>
                    {previousDoc.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(previousDoc.size)} &bull; {previousDoc.type}
                  </p>
                  {previousDoc.status === 'reading' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-700">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reading file...</span>
                    </div>
                  )}
                  {previousDoc.status === 'ready' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for commercial analysis</span>
                    </div>
                  )}
                  {previousDoc.status === 'error' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{previousDoc.errorMessage || 'Error reading file'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-blue-100 mt-3">
                <button
                  type="button"
                  onClick={() => prevInputRef.current?.click()}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                >
                  Change file
                </button>
                <button
                  type="button"
                  onClick={() => setPreviousDoc(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* NEW VERSION CARD (PINK THEME) */}
        <div className="bg-white rounded-2xl border-2 border-pink-100/90 hover:border-pink-300 shadow-sm p-5 flex flex-col transition-all">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-800 bg-pink-100/80 px-2.5 py-0.5 rounded-full">
                2. NEW REVISION (PINK)
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">New version</h3>
              <p className="text-xs text-slate-500">Upload the updated / new document</p>
            </div>
            {newDoc && newDoc.status === 'ready' && (
              <span className="flex items-center gap-1 text-xs text-pink-700 font-semibold bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-600" />
                Ready
              </span>
            )}
          </div>

          <input
            type="file"
            ref={newInputRef}
            onChange={(e) => handleFileSelection(e, 'new')}
            accept=".csv,.xlsx,.xls,.pdf,.docx,.txt,.png,.jpg,.jpeg"
            className="hidden"
          />

          {!newDoc ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'new')}
              onClick={() => newInputRef.current?.click()}
              className="border-2 border-dashed border-pink-200 hover:border-pink-500 bg-pink-50/20 hover:bg-pink-50/50 rounded-xl p-8 text-center cursor-pointer transition-colors flex-1 flex flex-col items-center justify-center min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your new document here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                or <span className="text-pink-600 font-semibold underline">browse from computer</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-3">
                Supports: PDF, XLSX, XLS, CSV, DOCX, JPG, PNG, TXT
              </p>
            </div>
          ) : (
            <div className="bg-pink-50/40 border border-pink-200 rounded-xl p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate" title={newDoc.name}>
                    {newDoc.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatFileSize(newDoc.size)} &bull; {newDoc.type}
                  </p>
                  {newDoc.status === 'reading' && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-pink-700">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reading file...</span>
                    </div>
                  )}
                  {newDoc.status === 'ready' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for commercial analysis</span>
                    </div>
                  )}
                  {newDoc.status === 'error' && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{newDoc.errorMessage || 'Error reading file'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-pink-100 mt-3">
                <button
                  type="button"
                  onClick={() => newInputRef.current?.click()}
                  className="text-xs text-pink-700 hover:text-pink-900 font-semibold cursor-pointer"
                >
                  Change file
                </button>
                <button
                  type="button"
                  onClick={() => setNewDoc(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional Metadata Drawer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div
          onClick={() => setShowMetadata(!showMetadata)}
          className="p-4 bg-gradient-to-r from-blue-50/50 to-pink-50/50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition-colors border-b border-slate-100"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-pink-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Document Metadata & Audit Tagging
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {showMetadata ? 'Hide fields' : 'Click to add Client, Retailer or Version Dates'}
          </span>
        </div>

        {showMetadata && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client / Brand</label>
              <div className="relative">
                <Building className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. BrandCo Snacking"
                  value={metadata.clientBrand}
                  onChange={(e) => setMetadata({ ...metadata, clientBrand: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Retailer</label>
              <div className="relative">
                <Store className="w-4 h-4 text-pink-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Tesco, Sainsbury's, Asda"
                  value={metadata.retailer}
                  onChange={(e) => setMetadata({ ...metadata, retailer: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Autumn Range Review Final"
                value={metadata.documentName}
                onChange={(e) => setMetadata({ ...metadata, documentName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Previous Version Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={metadata.previousVersionDate}
                  onChange={(e) =>
                    setMetadata({ ...metadata, previousVersionDate: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Version Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-pink-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={metadata.newVersionDate}
                  onChange={(e) => setMetadata({ ...metadata, newVersionDate: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prominent ANALYSE CHANGES Button in Pink & Blue Gradient */}
      <div className="flex flex-col items-center justify-center">
        <button
          id="btn-analyse-changes"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className={`w-full sm:w-auto min-w-[340px] px-8 py-4 rounded-2xl text-base font-bold tracking-wide transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg ${
            canAnalyze
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-pink-500/25 active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-pink-200" />
              <span>DETECTING & PERSISTING CHANGES...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-pink-300" />
              <span>ANALYSE CHANGES & SAVE TO DATABASE</span>
              <ArrowRight className="w-5 h-5 text-blue-200" />
            </>
          )}
        </button>

        {!canAnalyze && !isAnalyzing && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Upload both baseline and new revision documents to initiate audit detection.
          </p>
        )}
      </div>
    </div>
  );
};
