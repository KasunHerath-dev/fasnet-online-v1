import { useState } from 'react'
import { X, Shield, Check } from 'lucide-react'

const AVAILABLE_PERMISSIONS = [
    { id: 'view_students', label: 'View Students', description: 'Can view student list and details', category: 'Students' },
    { id: 'add_students', label: 'Add Students', description: 'Can add new students', category: 'Students' },
    { id: 'edit_students', label: 'Edit Students', description: 'Can modify student information', category: 'Students' },
    { id: 'delete_students', label: 'Delete Students', description: 'Can remove students from system', category: 'Students' },

    { id: 'bulk_import', label: 'Bulk Import', description: 'Can import students via CSV/Excel', category: 'Data Management' },
    { id: 'bulk_update', label: 'Bulk Update', description: 'Can update multiple students at once', category: 'Data Management' },

    { id: 'manage_resources', label: 'Document Uploads', description: 'Can upload and manage learning resources', category: 'Resource Management' },
    { id: 'manage_assessments', label: 'Assessments', description: 'Can manage exams and results', category: 'Academic' },

    { id: 'view_birthdays', label: 'View Birthdays', description: 'Can access birthday calendar', category: 'Features' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Can view analytics and reports', category: 'Features' },

    { id: 'manage_users', label: 'Manage Users', description: 'Can manage system users', category: 'Administration' },
    { id: 'system_settings', label: 'System Settings', description: 'Can access system configuration', category: 'Administration' },
]

export default function PermissionModal({ isOpen, onClose, onConfirm, user, mode = 'promote' }) {
    const [selectedPermissions, setSelectedPermissions] = useState(user?.permissions || [])
    const [batchScope, setBatchScope] = useState(user?.batchScope || '') // Initialize with existing scope if any
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const togglePermission = (permissionId) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        )
    }

    const selectAll = () => {
        setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.id))
    }

    const deselectAll = () => {
        setSelectedPermissions([])
    }

    const handleSubmit = async () => {
        setLoading(true)
        // Pass both permissions and batchScope
        await onConfirm(selectedPermissions, batchScope)
        setLoading(false)
    }

    const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = []
        }
        acc[perm.category].push(perm)
        return acc
    }, {})

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">
                                    {mode === 'promote' ? 'Promote User to Admin' : 'Edit Permissions'}
                                </h2>
                                <p className="text-indigo-100 text-sm">
                                    {user?.username} - Select features they can access
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Quick Actions */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-all"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                        >
                            Deselect All
                        </button>
                    </div>

                    {/* Batch Scope Configuration */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            📚 Batch Scope (Optional)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Restrict this admin to only manage a specific batch. Leave empty for global access (Superadmin).
                        </p>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                placeholder="Enter Batch Year (e.g. 2024)"
                                className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full max-w-xs"
                                value={batchScope || ''}
                                onChange={(e) => setBatchScope(e.target.value)}
                            />
                            {batchScope && (
                                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Restricted to Batch {batchScope}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Permissions</h3>
                        <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold text-sm">
                            {selectedPermissions.length} / {AVAILABLE_PERMISSIONS.length} Selected
                        </div>
                    </div>

                    {/* Permissions by Category */}
                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([category, permissions]) => (
                            <div key={category} className="bg-gray-50 rounded-2xl p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {permissions.map((permission) => {
                                        const isSelected = selectedPermissions.includes(permission.id)
                                        return (
                                            <div
                                                key={permission.id}
                                                onClick={() => togglePermission(permission.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                    ? 'bg-indigo-50 border-indigo-500 shadow-md'
                                                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {isSelected && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`font-bold mb-1 ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                            {permission.label}
                                                        </h4>
                                                        <p className="text-xs text-gray-600">{permission.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-100 p-6 bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedPermissions.length === 0}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                {mode === 'promote' ? 'Promote to Admin' : 'Update Permissions'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}
