import React from 'react';
import {
  Database,
  CheckCircle2,
  Server,
  Layers,
  Clock,
  ShieldCheck,
  X,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Users,
} from 'lucide-react';
import { DatabaseStats, User } from '../types';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DatabaseStats | null;
  currentUser: User | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  stats,
  currentUser,
  onRefresh,
  isRefreshing = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Pink & Blue Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-pink-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Database className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display text-white">
                  Enterprise Cloud Database
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 text-[10px] font-extrabold uppercase">
                  Connected
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Full ACID-compliant persistence & multi-user role separation
              </p>
            </div>
          </div>
        </div>

        {/* Database Metrics Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-xs font-semibold">Saved Audits</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-950">
                {stats ? stats.totalAnalyses : '0'}
              </p>
              <p className="text-[10px] text-blue-600">Stored in database</p>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-100">
              <div className="flex items-center justify-between text-pink-700 mb-1">
                <span className="text-xs font-semibold">Tracked Changes</span>
                <FileSpreadsheet className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-2xl font-black text-pink-950">
                {stats ? stats.totalChangesTracked : '0'}
              </p>
              <p className="text-[10px] text-pink-600">Commercial differences</p>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-xs font-semibold">High Impact</span>
                <AlertTriangle className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-indigo-950">
                {stats ? stats.highImpactTracked : '0'}
              </p>
              <p className="text-[10px] text-indigo-600">Priority escalations</p>
            </div>
          </div>

          {/* Action item tracking stats */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Action Plan Execution Sync
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  {stats ? stats.pendingActions : 0}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Pending Actions</p>
                  <p className="text-[11px] text-slate-500">Awaiting commercial sign-off</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {stats ? stats.completedActions : 0}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Completed Actions</p>
                  <p className="text-[11px] text-slate-500">Signed off and archived</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <Server className="w-3.5 h-3.5 text-blue-500" />
                Database Engine:
              </span>
              <span className="font-semibold text-slate-800">
                CPG Structured Document Store v{stats?.dbVersion || 1}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                Security & Encryption:
              </span>
              <span className="font-semibold text-emerald-700">
                PBKDF2-SHA512 + Salting & Bearer Sessions
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="flex items-center gap-2 text-slate-500">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Active Tenant / User:
              </span>
              <span className="font-semibold text-slate-800">
                {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Demo / Guest User'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-pink-500" />
                Last Database Sync:
              </span>
              <span className="font-semibold text-slate-700">
                {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
