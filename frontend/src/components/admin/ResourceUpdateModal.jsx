import { useState, useEffect } from 'react';
import { X, Upload, Save, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import resourceService from '../../services/resourceService';
import { toast } from 'react-hot-toast';

const TYPES = [
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'past_paper', label: 'Past Paper' },
    { value: 'marking_scheme', label: 'Marking Scheme' },
    { value: 'book', label: 'Book / Reading' },
    { value: 'other', label: 'Other' },
];

const ANSWER_FOR = [
    { value: '', label: 'N/A' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'past_paper', label: 'Past Paper' },
];

export default function ResourceUpdateModal({ isOpen, resource, onClose, onSuccess }) {
    const [saving, setSaving] = useState(false);
    const [newFile, setNewFile] = useState(null);
    const [form, setForm] = useState({ title: '', type: '', answerFor: '', academicYear: '' });

    useEffect(() => {
        if (resource) {
            setForm({
                title: resource.title || '',
                type: resource.type || 'other',
                answerFor: resource.answerFor || '',
                academicYear: resource.academicYear || '',
            });
            setNewFile(null);
        }
    }, [resource]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resource) return;
        setSaving(true);

        const data = new FormData();
        data.append('title', form.title);
        data.append('type', form.type);
        data.append('answerFor', form.answerFor);
        data.append('academicYear', form.academicYear);
        if (newFile) data.append('file', newFile);

        const toastId = toast.loading('Saving changes...');
        try {
            await resourceService.update(resource._id, data);
            toast.success('Resource updated!', { id: toastId });
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !resource) return null;

    const isSupabase = resource.storageType === 'supabase' || resource.webViewLink?.includes('supabase.co');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-blue-400">Edit Resource</span>
                            <h2 className="text-base font-bold text-slate-900 truncate max-w-xs">{resource.title}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Storage badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                        isSupabase 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                        {isSupabase ? '⚡ Supabase Storage' : '🔵 Mega Drive'}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                            required
                            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-medium text-slate-900 transition-all"
                            placeholder="Resource title"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Resource Type</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-medium text-slate-900 transition-all bg-white"
                        >
                            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* Answer For (only for marking schemes) */}
                    {form.type === 'marking_scheme' && (
                        <div className="animate-fadeIn">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Answer For</label>
                            <select
                                value={form.answerFor}
                                onChange={e => setForm(p => ({ ...p, answerFor: e.target.value }))}
                                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-medium text-slate-900 transition-all bg-white"
                            >
                                {ANSWER_FOR.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Academic Year */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Academic Year (optional)</label>
                        <input
                            type="text"
                            value={form.academicYear}
                            onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
                            className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none font-medium text-slate-900 transition-all"
                            placeholder="e.g. 2023/2024"
                        />
                    </div>

                    {/* File replacement */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer relative">
                        <input
                            type="file"
                            onChange={e => setNewFile(e.target.files[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {newFile ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{newFile.name}</p>
                                    <p className="text-xs text-slate-500">{(newFile.size / 1024 / 1024).toFixed(2)} MB — will replace existing file</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-slate-400">
                                <Upload className="w-5 h-5" />
                                <div>
                                    <p className="text-sm font-bold">Replace file (optional)</p>
                                    <p className="text-xs">Leave empty to keep the existing file</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex-1 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all ${
                                saving ? 'bg-blue-300 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                            }`}
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.2s ease; }
            `}</style>
        </div>
    );
}
