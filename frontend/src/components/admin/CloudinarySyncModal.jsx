import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Search, Layers, Calendar, FileText, CloudIcon } from 'lucide-react';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';

const CloudinarySyncModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [unsyncedFiles, setUnsyncedFiles] = useState([]);
    const [syncingIds, setSyncingIds] = useState(new Set());
    const [completedIds, setCompletedIds] = useState(new Set());
    const [errorIds, setErrorIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPreview();
        } else {
            // Reset state on close
            setUnsyncedFiles([]);
            setSyncingIds(new Set());
            setCompletedIds(new Set());
            setErrorIds(new Set());
        }
    }, [isOpen]);

    const fetchPreview = async () => {
        setLoading(true);
        try {
            const response = await resourceService.getSyncPreview();
            if (response.data.success) {
                setUnsyncedFiles(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to scan Cloudinary');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncSingle = async (file) => {
        const fileId = file.public_id;
        if (syncingIds.has(fileId) || completedIds.has(fileId)) return;

        setSyncingIds(prev => new Set(prev).add(fileId));

        try {
            // We use the same backend logic but it's now targeted
            // For now, we reuse the scanCloudinary which sweeps everything, 
            // but the improved way is to just call a single sync if we had the endpoint.
            // Since we only have the bulk sync backend for now, we'll run it and refresh.
            await resourceService.syncCloudinary();

            setCompletedIds(prev => new Set(prev).add(fileId));
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(fileId);
                return next;
            });

            toast.success(`Synced: ${file.filename}`);
        } catch (error) {
            setErrorIds(prev => new Set(prev).add(fileId));
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(fileId);
                return next;
            });
            toast.error(`Failed to sync ${file.filename}`);
        }
    };

    const syncAll = async () => {
        const toSync = unsyncedFiles.filter(f => !completedIds.has(f.public_id));
        if (toSync.length === 0) return;

        setLoading(true);
        toast.loading('Syncing all files...', { id: 'bulk-sync' });

        try {
            await resourceService.syncCloudinary();

            // Mark all as completed
            const allIds = toSync.map(f => f.public_id);
            setCompletedIds(prev => new Set([...prev, ...allIds]));

            toast.success('All files synced successfully!', { id: 'bulk-sync' });
        } catch (error) {
            toast.error('Bulk sync encountered errors', { id: 'bulk-sync' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredFiles = unsyncedFiles.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.moduleCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Cloudinary Sync Assistant</h2>
                            <p className="text-sm text-slate-500 font-medium">Detect and import manually uploaded files</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by filename or module..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={fetchPreview}
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Rescan
                        </button>
                        <button
                            onClick={syncAll}
                            disabled={loading || filteredFiles.length === 0}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Import All ({filteredFiles.length})
                        </button>
                    </div>
                </div>

                {/* Main Table Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                    {loading && unsyncedFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Scanning Cloudinary directory structure...</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Everything is Synced!</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                All files currently in Cloudinary folders are already registered in the website database.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFiles.map((file) => (
                                <div key={file.public_id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0 overflow-hidden">
                                            <h4 className="font-bold text-slate-800 truncate text-sm md:text-base group-hover:text-indigo-900 transition-colors">
                                                {file.filename}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <Layers className="w-3 h-3" />
                                                    {file.moduleCode}
                                                </span>
                                                <span className="flex items-center gap-1.5 capitalize">
                                                    <FileText className="w-3 h-3" />
                                                    {file.type.replace('_', ' ')}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {file.year}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <RefreshCw className="w-3 h-3" />
                                                    {file.size}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                                        {completedIds.has(file.public_id) ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl border border-emerald-100">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Synced Successfully
                                            </div>
                                        ) : syncingIds.has(file.public_id) ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl border border-indigo-100">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Importing...
                                            </div>
                                        ) : errorIds.has(file.public_id) ? (
                                            <button
                                                onClick={() => handleSyncSingle(file)}
                                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 hover:bg-rose-100 transition-all"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Retry Import
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSyncSingle(file)}
                                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 transition-all active:scale-95"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                Sync to Site
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] md:text-xs text-slate-400 uppercase tracking-widest font-black">
                    <div className="flex items-center gap-4">
                        <span>Total Detected: {unsyncedFiles.length}</span>
                        <span className="text-indigo-400">Synced: {completedIds.size}</span>
                    </div>
                    <span>Granular Fingerprint Scan Ready</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}</style>
        </div>
    );
};

export default CloudinarySyncModal;
