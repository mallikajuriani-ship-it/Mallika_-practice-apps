import React, { useState } from 'react';
import {
  Layers,
  History,
  PlusCircle,
  Database,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  Activity,
  HardDrive,
} from 'lucide-react';
import { User, DatabaseStats } from '../types';

interface NavbarProps {
  currentTab: 'new' | 'history';
  setCurrentTab: (tab: 'new' | 'history') => void;
  hasActiveAnalysis: boolean;
  historyCount: number;
  onResetNew: () => void;
  user: User | null;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'demo') => void;
  onLogout: () => void;
  dbStats: DatabaseStats | null;
  onOpenDbModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  hasActiveAnalysis,
  historyCount,
  onResetNew,
  user,
  onOpenAuth,
  onLogout,
  dbStats,
  onOpenDbModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-950 via-[#0d1829] to-[#160e22] text-white border-b border-pink-900/30 sticky top-0 z-30 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onResetNew();
                setCurrentTab('new');
              }}
              className="flex items-center gap-3 group text-left focus:outline-none cursor-pointer"
            >
              {/* Dual Pink & Blue Glow Icon */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-pink-200 bg-clip-text text-transparent">
                    CPG CHANGE RADAR
                  </span>
                  <span className="bg-gradient-to-r from-blue-600 to-pink-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Pink & Blue
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 hidden sm:block">
                  Commercial Change Detection & Database
                </p>
              </div>
            </button>
          </div>

          {/* Center / Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database Status Indicator */}
            <button
              onClick={onOpenDbModal}
              title="Database Persistence Status"
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/40 hover:border-pink-500/50 text-xs text-blue-200 hover:text-white transition-all cursor-pointer group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <Database className="w-3.5 h-3.5 text-blue-400 group-hover:text-pink-400 transition-colors" />
              <span className="font-medium text-[11px]">
                DB: {dbStats ? `${dbStats.totalAnalyses} Audits` : 'Active'}
              </span>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button
                id="nav-new-analysis-btn"
                onClick={() => setCurrentTab('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'new'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-300" />
                <span>New Audit</span>
              </button>

              <button
                id="nav-history-btn"
                onClick={() => setCurrentTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'history'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <History className="w-3.5 h-3.5 text-pink-300" />
                <span>Saved Audits</span>
                {historyCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      currentTab === 'history'
                        ? 'bg-white text-pink-900'
                        : 'bg-pink-900/60 text-pink-200 border border-pink-700/50'
                    }`}
                  >
                    {historyCount}
                  </span>
                )}
              </button>
            </div>

            {/* Authentication Controls */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 text-left transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {user.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'CPG'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-pink-300/90 truncate max-w-[120px]">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-pink-900/40 shadow-2xl p-2 z-50 text-slate-200 animate-fadeIn"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="p-3 border-b border-slate-800 bg-slate-950/60 rounded-xl mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Authenticated Session
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-xs text-blue-300 truncate">{user.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {user.role} • {user.department}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenDbModal) onOpenDbModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-blue-200 transition-colors cursor-pointer"
                    >
                      <Database className="w-4 h-4 text-blue-400" />
                      <span>Database Storage Metrics</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuth('demo');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-pink-300 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>Switch Demo Profile</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-pink-950/40 text-pink-400 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  Connect DB
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
