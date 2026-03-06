import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, Search, Layers, Calendar, FileText, CloudIcon, ArrowRight } from 'lucide-react';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';

const MegaMigrationModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [megaFiles, setMegaFiles] = useState([]);
    const [migratingIds, setMigratingIds] = useState(new Set());
    const [completedIds, setCompletedIds] = useState(new Set());
    const [errorIds, setErrorIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // pending, completed

    useEffect(() => {
        if (isOpen) {
            fetchPending();
        } else {
            // Reset state
            setMegaFiles([]);
            setMigratingIds(new Set());
            setCompletedIds(new Set());
            setErrorIds(new Set());
        }
    }, [isOpen]);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const response = await resourceService.getPendingMega();
            if (response.data.success) {
                setMegaFiles(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch legacy Mega files');
        } finally {
            setLoading(false);
        }
    };

    const handleMigrateSingle = async (file) => {
        const id = file._id;
        if (migratingIds.has(id) || completedIds.has(id)) return;

        setMigratingIds(prev => new Set(prev).add(id));

        try {
            await resourceService.migrateSingleMega(id);
            setCompletedIds(prev => new Set(prev).add(id));
            setMigratingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.success(`Migrated: ${file.title}`);
        } catch (error) {
            setErrorIds(prev => new Set(prev).add(id));
            setMigratingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            toast.error(`Migration failed for ${file.title}`);
        }
    };

    const migrateAll = async () => {
        const toMigrate = filteredFiles.filter(f => !completedIds.has(f._id));
        if (toMigrate.length === 0) return;

        if (!window.confirm(`Start streaming ${toMigrate.length} files from Mega to Cloudinary? This happens sequentially to avoid server load.`)) return;

        for (const file of toMigrate) {
            await handleMigrateSingle(file);
        }

        toast.success('Batch migration complete!', { duration: 5000 });
    };

    if (!isOpen) return null;

    const filteredFiles = megaFiles.filter(file => {
        const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (file.module?.code || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'pending') return matchesSearch && !completedIds.has(file._id);
        return matchesSearch && completedIds.has(file._id);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-rose-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Mega → Cloudinary Migration</h2>
                            <p className="text-sm text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Stream legacy files into the new Cloudinary structure</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'pending' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            PENDING ({megaFiles.filter(f => !completedIds.has(f._id)).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            MIGRATED ({completedIds.size})
                        </button>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={migrateAll}
                        disabled={loading || activeTab !== 'pending' || filteredFiles.length === 0}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-rose-600 rounded-xl text-white font-bold text-xs hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Migrate {filteredFiles.length} Selections
                    </button>
                </div>

                {/* Content Table */}
                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                    {loading && megaFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Fetching legacy file registry...</p>
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">
                                {activeTab === 'pending' ? 'All Mega Files Migrated!' : 'No Migrated Files Yet'}
                            </h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                {activeTab === 'pending'
                                    ? 'Great job! Your entire resource library is now powered by Cloudinary.'
                                    : 'Use the PENDING tab to start moving files over.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFiles.map((file) => (
                                <div key={file._id} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-white hover:border-rose-100 hover:shadow-lg">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 group-hover:text-rose-500 transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 overflow-hidden">
                                            <h4 className="font-bold text-slate-800 truncate text-sm">
                                                {file.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] md:text-xs text-slate-500 font-medium">
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg whitespace-nowrap">
                                                    {file.module?.code || 'Gen'}
                                                </span>
                                                <span className="capitalize">{file.type}</span>
                                                <span>{file.academicYear || 'General'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">From</p>
                                            <p className="text-xs font-bold text-slate-600">MEGA.NZ</p>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 font-black uppercase">To</p>
                                            <p className="text-xs font-bold text-rose-600">CLOUDINARY</p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-full md:w-auto">
                                        {completedIds.has(file._id) ? (
                                            <div className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 font-black text-[10px] rounded-xl border border-emerald-100">
                                                <CheckCircle2 className="w-3 h-3" />
                                                DONE
                                            </div>
                                        ) : migratingIds.has(file._id) ? (
                                            <div className="flex items-center justify-center gap-2 px-6 py-2 bg-rose-50 text-rose-600 font-black text-[10px] rounded-xl border border-rose-100">
                                                <RefreshCw className="w-3 h-3 animate-spin" />
                                                STREAMING
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleMigrateSingle(file)}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white font-black text-[10px] rounded-xl hover:bg-rose-600 transition-all active:scale-95"
                                            >
                                                START TRANSFER
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-black">
                    <div className="flex items-center gap-6">
                        <span>Database Registry: {megaFiles.length} files</span>
                        <span className="text-rose-400 animate-pulse">Pending Migration: {megaFiles.length - completedIds.size}</span>
                    </div>
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

export default MegaMigrationModal;
