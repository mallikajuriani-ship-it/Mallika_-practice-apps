import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  Briefcase,
  Building2,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { User as UserType } from '../types';
import { loginUser, registerUser, quickDemoLogin } from '../utils/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
  initialMode?: 'signin' | 'signup' | 'demo';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Commercial Strategy Director');
  const [department, setDepartment] = useState('Sales & Category Strategy');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const { user } = await loginUser(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const { user } = await registerUser({
        email,
        password,
        name,
        role,
        department,
      });
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Account creation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (roleType: 'director' | 'category') => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const { user } = await quickDemoLogin(roleType);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden">
        {/* Pink and Blue Header Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-pink-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight text-white">
                Commercial Intelligence Access
              </h2>
              <div className="flex items-center gap-2 text-xs text-blue-100">
                <Database className="w-3.5 h-3.5 text-pink-300" />
                <span>Enterprise Database & Auth Enabled</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-100 mt-2">
            Secure cloud storage for commercial reviews, retail contracts, and audit trails.
          </p>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 p-1 mt-4 bg-black/20 rounded-xl backdrop-blur-md border border-white/10">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-white text-pink-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              New Account
            </button>
            <button
              onClick={() => {
                setTab('demo');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                tab === 'demo'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'text-pink-200 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚡ Fast Demo
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-pink-50 border border-pink-200 flex items-start gap-2.5 text-xs text-pink-800 animate-shake">
              <AlertCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN TAB */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah.jenkins@brandco.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setTab('demo')}
                    className="text-[11px] text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Use 1-click Demo credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Database</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-xs text-slate-500">Need instant access? </span>
                <button
                  type="button"
                  onClick={() => setTab('demo')}
                  className="text-xs font-semibold text-pink-600 hover:underline"
                >
                  Launch Demo Profile
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP TAB */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marcus Vance"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus.vance@brandco.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Title
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800"
                  >
                    <option value="Commercial Strategy Director">Commercial Director</option>
                    <option value="Senior Category Manager">Senior Category Manager</option>
                    <option value="Key Account Manager (Tesco/Sainsburys)">Key Account Manager</option>
                    <option value="Revenue Growth Lead (RGM)">RGM Lead</option>
                    <option value="Supply Chain Analyst">Supply Chain Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Sales & Trade"
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 mt-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 via-indigo-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 shadow-md shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account & Connect DB</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. DEMO PROFILES TAB */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
                <span className="font-semibold">Pre-configured Enterprise Access:</span> One-click
                authentication with full read/write database permissions and pre-loaded retail audits.
              </div>

              {/* Profile 1 */}
              <button
                type="button"
                onClick={() => handleDemoSelect('director')}
                disabled={loading}
                className="w-full p-3 rounded-xl border-2 border-blue-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    SJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        Sarah Jenkins
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Executive
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Commercial Strategy Director • BrandCo</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Profile 2 */}
              <button
                type="button"
                onClick={() => handleDemoSelect('category')}
                disabled={loading}
                className="w-full p-3 rounded-xl border-2 border-pink-200 hover:border-pink-500 bg-white hover:bg-pink-50/40 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                    MV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-pink-700">
                        Marcus Vance
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-pink-100 text-pink-800">
                        Category Lead
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Senior Category Manager • UK Modern Trade</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Database & Security Guarantee Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Database Live & Encrypted</span>
          </div>
          <span className="text-pink-600 font-semibold">Pink & Blue Enterprise Edition</span>
        </div>
      </div>
    </div>
  );
};
