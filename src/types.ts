export type ChangeType = 'added' | 'removed' | 'changed' | 'unchanged';

export type ChangeCategory =
  | 'Product'
  | 'Range'
  | 'Price'
  | 'Promotion'
  | 'Distribution'
  | 'Sales'
  | 'Supply Chain'
  | 'Commercial Terms'
  | 'Launch'
  | 'Packaging'
  | 'Marketing'
  | 'Compliance'
  | 'Timeline'
  | 'Other';

export type ImpactLevel = 'high' | 'medium' | 'low';

export interface ChangeItem {
  id: string;
  change_type: 'added' | 'removed' | 'changed';
  category: ChangeCategory;
  title: string;
  what_changed: string;
  previous_value: string;
  new_value: string;
  impact: ImpactLevel;
  why_it_matters: string;
  recommended_action: string;
  evidence_previous: string;
  evidence_new: string;
}

export interface ActionPlanItem {
  id: string;
  priority: ImpactLevel;
  action: string;
  reason: string;
  related_change: string;
  category?: ChangeCategory;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface DocumentMetadata {
  clientBrand: string;
  retailer: string;
  documentName: string;
  previousVersionDate: string;
  newVersionDate: string;
}

export interface UploadedFileState {
  file?: File;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  textContent?: string;
  base64?: string;
  status: 'idle' | 'reading' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ExecutiveSummary {
  totalChanges: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  narrativeSummary: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  metadata: DocumentMetadata;
  previousFileName: string;
  newFileName: string;
  executiveSummary: ExecutiveSummary;
  changes: ChangeItem[];
  unchangedNotes?: string[];
  actionPlan: ActionPlanItem[];
  noChangesDetected?: boolean;
  message?: string;
}

export interface AnalysisHistoryItem {
  id: string;
  client: string;
  retailer: string;
  documentName: string;
  analysisDate: string;
  timestamp: number;
  totalChanges: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  data: AnalysisResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatarColor?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface DatabaseStats {
  totalAnalyses: number;
  totalChangesTracked: number;
  highImpactTracked: number;
  pendingActions: number;
  completedActions: number;
  totalUsers: number;
  dbVersion: number;
  lastUpdated: number;
}

