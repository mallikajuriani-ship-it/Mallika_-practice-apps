import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { ChangeCategory, ChangeItem, ChangeType, ImpactLevel } from '../types';

interface ChangesTableProps {
  changes: ChangeItem[];
  onSelectChange: (change: ChangeItem) => void;
}

const CATEGORIES: ChangeCategory[] = [
  'Product',
  'Range',
  'Price',
  'Promotion',
  'Distribution',
  'Sales',
  'Supply Chain',
  'Commercial Terms',
  'Launch',
  'Packaging',
  'Marketing',
  'Compliance',
  'Timeline',
  'Other',
];

export const ChangesTable: React.FC<ChangesTableProps> = ({ changes, onSelectChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState<'All' | ImpactLevel>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | ChangeCategory>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'added' | 'removed' | 'changed'>('All');
  const [sortBy, setSortBy] = useState<'impact' | 'title' | 'category' | 'type'>('impact');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter & Search logic
  const filteredChanges = useMemo(() => {
    return changes.filter((item) => {
      // 1. Impact filter
      if (impactFilter !== 'All' && item.impact !== impactFilter) return false;
      // 2. Category filter
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      // 3. Type filter
      if (typeFilter !== 'All' && item.change_type !== typeFilter) return false;

      // 4. Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesWhat = item.what_changed.toLowerCase().includes(query);
        const matchesPrev = item.previous_value.toLowerCase().includes(query);
        const matchesNew = item.new_value.toLowerCase().includes(query);
        const matchesWhy = item.why_it_matters.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesType = item.change_type.toLowerCase().includes(query);
        const matchesAction = item.recommended_action.toLowerCase().includes(query);

        return (
          matchesTitle ||
          matchesWhat ||
          matchesPrev ||
          matchesNew ||
          matchesWhy ||
          matchesCat ||
          matchesType ||
          matchesAction
        );
      }

      return true;
    });
  }, [changes, impactFilter, categoryFilter, typeFilter, searchTerm]);

  // Sorting logic
  const sortedChanges = useMemo(() => {
    const sorted = [...filteredChanges];

    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'impact') {
        const score = { high: 3, medium: 2, low: 1 };
        comparison = (score[a.impact] || 0) - (score[b.impact] || 0);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'type') {
        comparison = a.change_type.localeCompare(b.change_type);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredChanges, sortBy, sortOrder]);

  const toggleSort = (col: 'impact' | 'title' | 'category' | 'type') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      {/* Table Controls & Filters Header */}
      <div className="p-5 border-b border-slate-200 space-y-4 bg-gradient-to-r from-blue-50/20 via-white to-pink-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Commercial Changes Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Comprehensive list of detected differences with potential business impact
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
            <input
              type="text"
              id="search-changes-input"
              placeholder="Search SKU, product, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-slate-400 bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Impact Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Impact:</span>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value as any)}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xs text-slate-800"
            >
              <option value="All">All Impacts</option>
              <option value="high">High (Pink)</option>
              <option value="medium">Medium (Blue)</option>
              <option value="low">Low (Slate)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-800"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Change Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-xs text-slate-800"
            >
              <option value="All">All Types</option>
              <option value="added">Added</option>
              <option value="removed">Removed</option>
              <option value="changed">Changed</option>
            </select>
          </div>

          {/* Active Filter Clear */}
          {(searchTerm || impactFilter !== 'All' || categoryFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setImpactFilter('All');
                setCategoryFilter('All');
                setTypeFilter('All');
              }}
              className="text-xs text-pink-600 hover:text-pink-800 font-bold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Elements */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-blue-50/50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <th
                onClick={() => toggleSort('impact')}
                className="py-3 px-4 cursor-pointer hover:bg-blue-100/60 transition-colors w-24"
              >
                <div className="flex items-center gap-1">
                  <span>Impact</span>
                  <ArrowUpDown className="w-3 h-3 text-pink-600" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('title')}
                className="py-3 px-4 cursor-pointer hover:bg-blue-100/60 transition-colors min-w-[200px]"
              >
                <div className="flex items-center gap-1">
                  <span>Change Detail</span>
                  <ArrowUpDown className="w-3 h-3 text-blue-600" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('category')}
                className="py-3 px-4 cursor-pointer hover:bg-blue-100/60 transition-colors w-32"
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  <ArrowUpDown className="w-3 h-3 text-pink-600" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[140px] text-blue-900 font-extrabold">Previous (Blue)</th>
              <th className="py-3 px-4 min-w-[140px] text-pink-900 font-extrabold">New (Pink)</th>
              <th className="py-3 px-4 min-w-[240px]">Why It Matters</th>
              <th className="py-3 px-4 text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedChanges.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-semibold">No changes matched the current filter.</p>
                  <p className="text-xs mt-1">Try clearing filters or search terms.</p>
                </td>
              </tr>
            ) : (
              sortedChanges.map((change) => {
                const isHigh = change.impact === 'high';
                const isMed = change.impact === 'medium';

                const impactBadge = isHigh ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-300 shadow-xs">
                    <ShieldAlert className="w-3 h-3" />
                    High
                  </span>
                ) : isMed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 shadow-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Med
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Low
                  </span>
                );

                return (
                  <tr
                    key={change.id}
                    onClick={() => onSelectChange(change)}
                    className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-pink-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 align-top">{impactBadge}</td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors leading-snug">
                        {change.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {change.what_changed}
                      </div>
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 uppercase">
                        {change.change_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                        {change.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-xs font-medium text-slate-800 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-200 break-words line-clamp-3">
                        {change.previous_value}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <div className="text-xs font-semibold text-slate-900 bg-pink-50/50 px-2.5 py-1 rounded-lg border border-pink-200 break-words line-clamp-3">
                        {change.new_value}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {change.why_it_matters}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectChange(change);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-pink-600 hover:bg-pink-100 transition-colors"
                        title="View detail & evidence"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {sortedChanges.length} of {changes.length} changes
        </span>
        <span className="font-semibold text-pink-600">
          Click any row to open source quote evidence & impact breakdown
        </span>
      </div>
    </div>
  );
};
