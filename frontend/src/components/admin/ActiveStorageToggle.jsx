import React, { useState, useEffect } from 'react';
import { Database, Cloud, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import api from '../../services/api';

const ActiveStorageToggle = () => {
  const [activeProvider, setActiveProvider] = useState('mega');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch current active storage on mount
  useEffect(() => {
    fetchActiveStorage();
  }, []);

  const fetchActiveStorage = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/settings/storage/active');
      if (res.data.success) {
        setActiveProvider(res.data.activeStorage || 'mega');
      }
    } catch (err) {
      console.error("Failed to fetch active storage provider", err);
      // Fail silently and default to mega
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (provider) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post('/settings/storage/active', { provider });
      
      if (res.data.success) {
        setSuccess(res.data.message);
        setActiveProvider(provider);
      } else {
        setError(res.data.message || 'Failed to update active storage.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while switching storage.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Active Storage Provider</h3>
            <p className="text-xs text-slate-600">Select the primary platform used to host all new file uploads.</p>
          </div>
        </div>
        
        {isLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Toggle Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Mega Drive Option */}
        <div 
          onClick={() => !isSaving && handleSave('mega')}
          className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
            activeProvider === 'mega' 
              ? 'border-red-500 bg-red-50/30 shadow-md transform scale-[1.02]' 
              : 'border-slate-200 bg-white hover:border-red-200 hover:bg-slate-50'
          } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {activeProvider === 'mega' && (
            <div className="absolute top-4 right-4 text-red-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              activeProvider === 'mega' ? 'bg-red-100' : 'bg-slate-100'
            }`}>
              <Database className={`w-6 h-6 ${activeProvider === 'mega' ? 'text-red-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h4 className={`font-bold text-lg ${activeProvider === 'mega' ? 'text-red-700' : 'text-slate-800'}`}>
                Mega Drive
              </h4>
              <p className="text-xs text-slate-500 font-medium tracking-wide">(Default)</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Highly anonymous European storage. Offers up to 20GB free per account. Reliable for heavy PDF storage without billing friction.
          </p>
        </div>

        {/* Google Drive Option */}
        <div 
          onClick={() => !isSaving && handleSave('google_drive')}
          className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
            activeProvider === 'google_drive' 
              ? 'border-blue-500 bg-blue-50/30 shadow-md transform scale-[1.02]' 
              : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
          } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {activeProvider === 'google_drive' && (
            <div className="absolute top-4 right-4 text-blue-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              activeProvider === 'google_drive' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <Cloud className={`w-6 h-6 ${activeProvider === 'google_drive' ? 'text-blue-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h4 className={`font-bold text-lg ${activeProvider === 'google_drive' ? 'text-blue-700' : 'text-slate-800'}`}>
                Google Drive
              </h4>
               <p className="text-xs text-slate-500 font-medium tracking-wide">Enterprise Setup</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Enterprise class cloud storage. Superior uptime and streaming capabilities, but demands a strictly properly configured API Service Account.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ActiveStorageToggle;
