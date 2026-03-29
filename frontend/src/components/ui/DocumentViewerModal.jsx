import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, FileText, Loader2 } from 'lucide-react';

const DocumentViewerModal = ({ isOpen, onClose, resource }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsLoading(true); // Reset loading state when opened
        } else {
            document.body.style.overflow = 'unset';
            setIsLoading(false);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !resource) return null;

    const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/resources/stream/${resource._id}?inline=true`;
    const downloadUrl = streamUrl.replace('?inline=true', '');
    
    // Most browsers natively support PDF preview, but not all Word/Excel docs.
    const isPDF = resource.mimeType === 'application/pdf' || resource.title.toLowerCase().endsWith('.pdf');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all border border-slate-200 dark:border-slate-800">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {resource.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5 fade">
                                {resource.type.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                            onClick={() => window.open(downloadUrl, '_blank')}
                            className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors"
                            title="Download File"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        {resource.webViewLink && (
                            <button 
                                onClick={() => window.open(resource.webViewLink, '_blank')}
                                className="hidden sm:flex p-2 sm:px-4 sm:py-2 items-center gap-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors"
                                title="Open Original Link"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>External</span>
                            </button>
                        )}
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative flex-1 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
                    {/* Loading State Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 z-10 pointer-events-none">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                            <p className="text-sm font-bold text-slate-500 animate-pulse">Loading Document...</p>
                        </div>
                    )}
                    
                    {isPDF ? (
                        <iframe 
                            src={streamUrl} 
                            className="w-full h-full border-none"
                            onLoad={() => setIsLoading(false)}
                            title={resource.title}
                        />
                    ) : (
                        <div className="text-center p-8 w-full h-full flex flex-col items-center justify-center" onLoad={() => setIsLoading(false)}>
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-slate-400" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Preview Available</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                                Browsers cannot natively preview this file type. Please download the file to view it securely on your device.
                            </p>
                            <button
                                onClick={() => window.open(downloadUrl, '_blank')}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download File
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;
