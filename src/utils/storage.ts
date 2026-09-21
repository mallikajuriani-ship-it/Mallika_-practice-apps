import { AnalysisHistoryItem, AnalysisResult } from '../types';

const STORAGE_KEY = 'cpg_change_radar_history_v1';

export function getStoredHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
}

export function saveAnalysisToHistory(analysis: AnalysisResult): AnalysisHistoryItem[] {
  try {
    const history = getStoredHistory();
    const newItem: AnalysisHistoryItem = {
      id: analysis.id,
      client: analysis.metadata.clientBrand || 'Unspecified Brand',
      retailer: analysis.metadata.retailer || 'Unspecified Retailer',
      documentName: analysis.metadata.documentName || analysis.newFileName || 'Document Comparison',
      analysisDate: new Date(analysis.timestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: analysis.timestamp,
      totalChanges: analysis.executiveSummary.totalChanges,
      highImpactCount: analysis.executiveSummary.highImpactCount,
      mediumImpactCount: analysis.executiveSummary.mediumImpactCount,
      lowImpactCount: analysis.executiveSummary.lowImpactCount,
      data: analysis,
    };

    // Filter out if existing id
    const filtered = history.filter((item) => item.id !== analysis.id);
    const updated = [newItem, ...filtered].slice(0, 30); // keep last 30 analyses
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
    return getStoredHistory();
  }
}

export function deleteHistoryItem(id: string): AnalysisHistoryItem[] {
  try {
    const history = getStoredHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return getStoredHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
