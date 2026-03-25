import React, { useState } from 'react';
import { X, Trash2, FolderMinus, FileMinus, CheckCircle2 } from 'lucide-react';

const CloudinaryClearPreviewModal = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState('files'); // 'files' or 'folders'

    if (!isOpen || !data) return null;

    const { files = [], folders = [] } = data.preview || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-red-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-100 px-2 py-0.5 rounded-md">DELETION LOG</span>
                                <span className="text-[10px] font-bold text-slate-500">{data.stats?.dbRecordsReset || 0} DB Records Reset</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Cloudinary Wipe Report</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex gap-4">
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            activeTab === 'files' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        <FileMinus className="w-4 h-4" />
                        DELETED FILES ({files.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('folders')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            activeTab === 'folders' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                    >
                        <FolderMinus className="w-4 h-4" />
                        DELETED FOLDERS ({folders.length})
                    </button>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50 scrollbar-hide">
                    {activeTab === 'files' ? (
                        files.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex flex-col p-3 bg-white border border-slate-200 rounded-xl group hover:border-red-200 hover:shadow-md transition-all">
                                        <div className="flex items-start gap-3 w-full overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                                                <FileMinus className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate" title={file.split('/').pop()}>
                                                    {file.split('/').pop()}
                                                </p>
                                                <p className="text-[10px] text-slate-400 truncate mt-0.5" title={file}>
                                                    {file}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No files were deleted. Cloudinary might have already been empty." />
                        )
                    ) : (
                        folders.length > 0 ? (
                            <div className="space-y-2 max-w-3xl mx-auto">
                                {folders.map((folder, idx) => {
                                    const parts = folder.split('/');
                                    const depth = parts.length;
                                    const folderName = parts.pop();
                                    const parentPath = parts.join('/') + '/';

                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl group hover:border-red-200 hover:shadow-md transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center shrink-0">
                                                <FolderMinus className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-800 truncate">{folderName}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black whitespace-nowrap">Depth: {depth}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                                                    {parentPath}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState message="No folders were fully deleted. Note: Cloudinary deletes non-empty folders silently in the background over time." />
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Acknowledge & Close
                    </button>
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

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center h-full">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Nothing to show</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">{message}</p>
    </div>
);

export default CloudinaryClearPreviewModal;
