import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ListTodo,
  Database,
  Sparkles,
} from 'lucide-react';
import { ActionPlanItem, ImpactLevel } from '../types';
import { updateDatabaseActionStatus } from '../utils/apiClient';

interface ActionPlanSectionProps {
  actionPlan: ActionPlanItem[];
  analysisId?: string;
  onActionStatusChange?: (actionId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}

export const ActionPlanSection: React.FC<ActionPlanSectionProps> = ({
  actionPlan: initialPlan,
  analysisId,
  onActionStatusChange,
}) => {
  const [items, setItems] = useState<ActionPlanItem[]>(initialPlan);
  const [filterPriority, setFilterPriority] = useState<'All' | ImpactLevel>('All');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const toggleStatus = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    const nextStatus = target.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    if (onActionStatusChange) {
      onActionStatusChange(id, nextStatus);
    }

    if (analysisId) {
      setSyncingId(id);
      try {
        await updateDatabaseActionStatus(analysisId, id, nextStatus);
      } catch (err) {
        console.warn('Failed to sync action status with database:', err);
      } finally {
        setSyncingId(null);
      }
    }
  };

  const filtered = items.filter((item) => {
    if (filterPriority === 'All') return true;
    return item.priority === filterPriority;
  });

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/30 via-white to-pink-50/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 rounded-lg bg-pink-100 text-pink-700">
              <ListTodo className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Commercial Action Plan & Governance
            </h3>
            {analysisId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                <Database className="w-3 h-3" />
                DB Synced
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Practical recommendations derived from high- and medium-impact commercial changes
          </p>
        </div>

        {/* Priority Filter & Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  filterPriority === p
                    ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'All' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-xs text-pink-700 font-bold px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200">
            {completedCount}/{items.length} completed
          </div>
        </div>
      </div>

      {/* Action Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-blue-50/40 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Status</th>
              <th className="py-3 px-4 w-28">Priority</th>
              <th className="py-3 px-4 min-w-[240px]">Action Item</th>
              <th className="py-3 px-4 min-w-[200px]">Commercial Driver</th>
              <th className="py-3 px-4 min-w-[180px]">Related Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                  No action items for the selected priority.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isCompleted = item.status === 'completed';
                const isHigh = item.priority === 'high';
                const isMed = item.priority === 'medium';

                const priorityBadge = isHigh ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-300">
                    <ShieldAlert className="w-3 h-3" />
                    High
                  </span>
                ) : isMed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                    <AlertTriangle className="w-3 h-3" />
                    Medium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Low
                  </span>
                );

                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleStatus(item.id)}
                    className={`hover:bg-pink-50/30 cursor-pointer transition-colors ${
                      isCompleted ? 'bg-slate-50/60 opacity-70' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 align-top text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(item.id);
                        }}
                        className="text-slate-400 hover:text-pink-600 transition-colors cursor-pointer"
                        title={isCompleted ? 'Mark pending' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 align-top">{priorityBadge}</td>
                    <td className="py-3.5 px-4 align-top">
                      <div
                        className={`font-semibold text-slate-900 leading-snug ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.action}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                        {item.related_change}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Click checkbox to update and commit action execution status</span>
        <span className="font-semibold text-blue-700">Enterprise Audit Logged</span>
      </div>
    </div>
  );
};
