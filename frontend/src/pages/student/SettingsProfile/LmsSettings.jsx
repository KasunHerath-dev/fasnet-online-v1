// pages/student/SettingsProfile/LmsSettings.jsx
// LMS account connection panel — drop-in card for the profile settings page.

import React, { useState, useEffect } from 'react';
import {
  Link2, Unlink, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff, Info, Clock
} from 'lucide-react';
import lmsService from '../../../services/lmsService';
import { authService } from '../../../services/authService';

export default function LmsSettings() {
  const [lmsLinked, setLmsLinked]     = useState(false);
  const [lmsUsername, setLmsUsername] = useState('');
  const [lmsLastSync, setLmsLastSync] = useState(null);
  const [lmsLoading, setLmsLoading]   = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [inputUser, setInputUser]     = useState('');
  const [inputPass, setInputPass]     = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [syncing, setSyncing]         = useState(false);
  const [msg, setMsg]                 = useState(null); // { type, text }

  useEffect(() => {
    lmsService.getAssignments().then(res => {
      setLmsLinked(res.data.lmsLinked);
      setLmsUsername(res.data.lmsUsername || '');
      setLmsLastSync(res.data.lastSync);
    }).catch(() => {}).finally(() => setLmsLoading(false));
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const regNo = authService.getUser()?.username || '';
      await lmsService.saveCredentials(inputUser || regNo, inputPass);
      setLmsLinked(true);
      setLmsUsername(inputUser || regNo);
      setInputPass('');
      setShowForm(false);
      setMsg({ type: 'success', text: 'LMS account linked! Syncing your deadlines...' });
      lmsService.triggerSync().then(() => {
        lmsService.getAssignments().then(r => setLmsLastSync(r.data.lastSync));
      }).catch(() => {});
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || 'Failed to save credentials.' });
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Remove LMS credentials? Synced deadlines will also be deleted.')) return;
    try {
      await lmsService.removeCredentials();
      setLmsLinked(false); setLmsUsername(''); setLmsLastSync(null);
      setMsg({ type: 'success', text: 'LMS account unlinked.' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to unlink account.' });
    }
  };

  const handleSync = async () => {
    setSyncing(true); setMsg(null);
    try {
      await lmsService.triggerSync();
      setMsg({ type: 'success', text: 'Sync started! Your deadlines will update in a moment.' });
      setTimeout(() => {
        lmsService.getAssignments().then(r => setLmsLastSync(r.data.lastSync));
      }, 4000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error?.message || 'Sync failed.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">LMS Account</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sync Moodle deadlines to your dashboard</p>
        </div>
        {lmsLinked && !lmsLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Feedback */}
        {msg && (
          <div className={`flex items-start gap-2 p-3 rounded-2xl text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{msg.text}</span>
          </div>
        )}

        {lmsLoading ? (
          <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ) : lmsLinked ? (
          <div className="space-y-3">
            {/* Status row */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Moodle Account</p>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{lmsUsername}</p>
              </div>
              {lmsLastSync && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(lmsLastSync).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={handleUnlink}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all"
              >
                <Unlink className="w-4 h-4" />
                Unlink
              </button>
            </div>
          </div>
        ) : showForm ? (
          <form onSubmit={handleLink} className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Your LMS username matches your registration number (lowercase, e.g. <span className="font-mono font-bold ml-1">{authService.getUser()?.username}</span>)
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Username</label>
                <input
                  type="text"
                  value={inputUser}
                  onChange={e => setInputUser(e.target.value)}
                  placeholder={authService.getUser()?.username || 'e.g. s242074'}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={inputPass}
                  onChange={e => setInputPass(e.target.value)}
                  placeholder="Your Moodle password"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              🔒 Passwords are encrypted with AES-256 before storage and never readable by administrators.
            </p>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-3 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-700 transition-all">
                Link Account
              </button>
              <button type="button" onClick={() => { setShowForm(false); setMsg(null); }} className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mx-auto">
              <Link2 className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">Not Connected</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Link your Moodle account to automatically sync assignment deadlines to your dashboard.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900"
            >
              Connect LMS Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
