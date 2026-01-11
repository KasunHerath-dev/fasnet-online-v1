import { X, User, Shield, Clock } from 'lucide-react'

export default function OnlineUsersModal({ isOpen, onClose, users }) {
    if (!isOpen) return null

    const formatTime = (dateString) => {
        if (!dateString) return 'Unknown'
        const date = new Date(dateString)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000) // seconds

        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Online Users</h2>
                            <p className="text-sm text-gray-500">
                                {users.length} active in the last 5 minutes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No active users found.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-900">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${role === 'admin' || role === 'superadmin'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        {role === 'admin' || role === 'superadmin' ? <Shield className="w-3 h-3 mr-1" /> : null}
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                {formatTime(user.lastActiveAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
