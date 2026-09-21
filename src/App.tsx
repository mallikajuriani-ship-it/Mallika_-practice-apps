import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentUploadSection } from './components/DocumentUploadSection';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { HistoryView } from './components/HistoryView';
import { AuthModal } from './components/AuthModal';
import { DatabaseModal } from './components/DatabaseModal';
import {
  AnalysisHistoryItem,
  AnalysisResult,
  DatabaseStats,
  DocumentMetadata,
  UploadedFileState,
  User,
} from './types';
import { SamplePair } from './data/sampleDocuments';
import {
  getStoredHistory,
  saveAnalysisToHistory,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/storage';
import {
  createDatabaseAnalysis,
  fetchDatabaseAnalyses,
  deleteDatabaseAnalysis,
  getAuthToken,
  getCurrentUser,
  logoutUser,
  fetchDatabaseStats,
} from './utils/apiClient';
import { AlertCircle, CheckCircle2, Database, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'new' | 'history'>('new');
  const [previousDoc, setPreviousDoc] = useState<UploadedFileState | null>(null);
  const [newDoc, setNewDoc] = useState<UploadedFileState | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    clientBrand: '',
    retailer: '',
    documentName: '',
    previousVersionDate: '',
    newVersionDate: '',
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [dbNotification, setDbNotification] = useState<string | null>(null);

  // Authentication & Database stats state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Check auth user and DB stats on mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
    refreshDbStats();
  }, []);

  const refreshDbStats = async () => {
    setIsRefreshingStats(true);
    try {
      const stats = await fetchDatabaseStats();
      if (stats) setDbStats(stats);
    } catch (err) {
      console.warn('Failed to refresh stats:', err);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  // Load history from database + local storage on mount
  const refreshHistory = async () => {
    const local = getStoredHistory();
    setHistory(local);

    try {
      const dbAnalyses = await fetchDatabaseAnalyses();
      if (dbAnalyses && dbAnalyses.length > 0) {
        const combinedMap = new Map<string, AnalysisHistoryItem>();
        local.forEach((item) => combinedMap.set(item.id, item));
        dbAnalyses.forEach((item) => combinedMap.set(item.id, item));

        const merged = Array.from(combinedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
        setHistory(merged);
      }
    } catch (err) {
      console.warn('Database fetch fallback note:', err);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Handle Load Sample
  const handleLoadSample = (sample: SamplePair) => {
    setMetadata({
      clientBrand: sample.clientBrand,
      retailer: sample.retailer,
      documentName: sample.documentName,
      previousVersionDate: sample.prevDate,
      newVersionDate: sample.newDate,
    });

    setPreviousDoc({
      name: sample.prevFileName,
      size: sample.prevContent.length,
      type: 'CSV',
      mimeType: 'text/csv',
      textContent: sample.prevContent,
      status: 'ready',
    });

    setNewDoc({
      name: sample.newFileName,
      size: sample.newContent.length,
      type: 'CSV',
      mimeType: 'text/csv',
      textContent: sample.newContent,
      status: 'ready',
    });

    setAnalysisError(null);
  };

  // Reset for new upload
  const handleReset = () => {
    setPreviousDoc(null);
    setNewDoc(null);
    setMetadata({
      clientBrand: '',
      retailer: '',
      documentName: '',
      previousVersionDate: '',
      newVersionDate: '',
    });
    setCurrentAnalysis(null);
    setAnalysisError(null);
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    if (!previousDoc || !newDoc) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          metadata,
          previousDoc: {
            name: previousDoc.name,
            mimeType: previousDoc.mimeType,
            textContent: previousDoc.textContent,
            base64: previousDoc.base64,
          },
          newDoc: {
            name: newDoc.name,
            mimeType: newDoc.mimeType,
            textContent: newDoc.textContent,
            base64: newDoc.base64,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete commercial change analysis.');
      }

      const result: AnalysisResult = data;
      setCurrentAnalysis(result);

      // Save to local storage for quick access
      saveAnalysisToHistory(result);

      // Save directly to database backend
      try {
        await createDatabaseAnalysis(result);
        setDbNotification('Analysis saved to Database with full audit history');
        setTimeout(() => setDbNotification(null), 5000);
        refreshDbStats();
      } catch (dbErr) {
        console.warn('DB persistence note:', dbErr);
      }

      refreshHistory();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(
        err.message || 'An error occurred during analysis. Please check documents and retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Delete item from history
  const handleDeleteHistory = async (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);

    try {
      await deleteDatabaseAnalysis(id);
      refreshDbStats();
    } catch (err) {
      console.warn('DB delete note:', err);
    }

    if (currentAnalysis?.id === id) {
      setCurrentAnalysis(null);
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history?')) {
      clearAllHistory();
      setHistory([]);
    }
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'demo' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    refreshDbStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-pink-100 selection:text-pink-900">
      {/* Navigation with Pink & Blue theme */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        hasActiveAnalysis={!!currentAnalysis}
        historyCount={history.length}
        onResetNew={handleReset}
        user={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        dbStats={dbStats}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {/* Database notification toast */}
        {dbNotification && (
          <div className="max-w-md mx-auto mt-4 px-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-pink-50 border border-pink-200 rounded-2xl shadow-sm text-xs text-slate-800 flex items-center gap-2.5">
              <Database className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="font-semibold">{dbNotification}</span>
            </div>
          </div>
        )}

        {currentTab === 'history' ? (
          <HistoryView
            history={history}
            onSelectHistoryItem={(analysis) => {
              setCurrentAnalysis(analysis);
              setCurrentTab('new');
            }}
            onDeleteItem={handleDeleteHistory}
            onClearAll={handleClearHistory}
            onNewAnalysis={() => {
              handleReset();
              setCurrentTab('new');
            }}
          />
        ) : currentAnalysis ? (
          <AnalysisResultsView
            analysis={currentAnalysis}
            onBackToUpload={() => setCurrentAnalysis(null)}
          />
        ) : (
          <div className="py-4">
            {/* Error Banner if any */}
            {analysisError && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-900 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Analysis Notice</p>
                    <p className="text-xs text-pink-700 mt-0.5 leading-relaxed">{analysisError}</p>
                  </div>
                  <button
                    onClick={() => setAnalysisError(null)}
                    className="text-xs font-semibold text-pink-800 hover:text-pink-950 underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <DocumentUploadSection
              previousDoc={previousDoc}
              newDoc={newDoc}
              setPreviousDoc={setPreviousDoc}
              setNewDoc={setNewDoc}
              metadata={metadata}
              setMetadata={setMetadata}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              onLoadSample={handleLoadSample}
            />
          </div>
        )}
      </main>

      {/* Footer in Pink & Blue theme */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 no-print relative">
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 absolute top-0 left-0 right-0" />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CPG Change Radar</span>
            <span>&bull;</span>
            <span className="text-blue-700 font-semibold">Database & Auth Protected</span>
          </div>
          <span className="text-pink-600 font-semibold">
            "Know what changed. Know what matters. Know what to do."
          </span>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          refreshDbStats();
          refreshHistory();
        }}
        initialMode={authModalMode}
      />

      {/* Database Diagnostics Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        stats={dbStats}
        currentUser={currentUser}
        onRefresh={refreshDbStats}
        isRefreshing={isRefreshingStats}
      />
    </div>
  );
}
