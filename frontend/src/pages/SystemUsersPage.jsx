import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, studentService } from '../services/authService'
import { useToast } from '../context/ToastContext'
import PermissionModal from '../components/PermissionModal'
import { Shield, ShieldOff, Edit, Trash2, MoreVertical, ChevronDown, Key, Search, Filter, Lock, Unlock, RefreshCw, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import Dropdown from '../components/Dropdown'

export default function SystemUsersPage() {
    const toast = useToast()
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [modalMode, setModalMode] = useState('promote')
    const [openMenuId, setOpenMenuId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [users, searchTerm, roleFilter])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await authService.getAllUsers()
            setUsers(response.data.users || [])
        } catch (err) {
            const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to fetch users'
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const filterUsers = () => {
        let result = [...users]

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase()
            result = result.filter(u => u.username.toLowerCase().includes(lowerTerm))
        }

        if (roleFilter !== 'all') {
            result = result.filter(u => u.roles.includes(roleFilter))
        }

        setFilteredUsers(result)
    }

    const handleSync = async () => {
        if (!window.confirm('This will create user accounts for all students who do not have one. Continue?')) return;
        try {
            const res = await studentService.createMissingUsers();
            toast.success(res.data.message);
            fetchUsers();
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.error?.message || err.message));
        }
    }

    const handlePromote = (user) => {
        setSelectedUser(user)
        setModalMode('promote')
        setShowPermissionModal(true)
        setOpenMenuId(null)
    }

    const handleEditPermissions = (user) => {
        setSelectedUser(user)
        setModalMode('edit')
        setShowPermissionModal(true)
        setOpenMenuId(null)
    }

    const handleDemote = async (user) => {
        if (!window.confirm(`Are you sure you want to demote ${user.username} to regular user? This will remove all admin permissions.`)) return

        try {
            await api.post(`/users/${user._id}/demote`)
            toast.success('User demoted successfully')
            fetchUsers()
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.error?.message || err.message))
        }
        setOpenMenuId(null)
    }

    const handleResetPassword = async (user) => {
        const newPassword = window.prompt(`Enter new password for ${user.username}:`, 'fas1234');
        if (newPassword === null) return; // Cancelled
        if (!newPassword.trim()) return toast.warning('Password cannot be empty');

        try {
            await authService.updateUser(user._id, { password: newPassword });
            toast.success(`Password for ${user.username} has been updated.`);
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.error?.message || err.message));
        }
        setOpenMenuId(null);
    }

    const handleConfirmPermissions = async (permissions, batchScope) => {
        try {
            if (modalMode === 'promote') {
                await api.post(`/users/${selectedUser._id}/promote`, {
                    permissions,
                    batchScope: batchScope ? parseInt(batchScope) : null
                })
                toast.success('User promoted successfully')
            } else {
                await api.put(`/users/${selectedUser._id}/permissions`, {
                    permissions,
                    batchScope: batchScope ? parseInt(batchScope) : null
                })
                toast.success('Permissions updated successfully')
            }
            setShowPermissionModal(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (err) {
            toast.error('Error: ' + (err.response?.data?.error?.message || err.message))
        }
    }

    const isAdmin = (user) => user.roles.includes('admin') || user.roles.includes('superadmin')

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    {/* Background Visuals */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-stitch-blue/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                        <div>
                            <button
                                onClick={() => navigate('/admin')}
                                className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 font-medium"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                Back to Dashboard
                            </button>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">System Users</h1>
                            <p className="text-slate-400 text-lg font-medium max-w-2xl">Manage user accounts, roles, and system access permissions.</p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleSync}
                                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Sync Accounts
                            </button>

                            <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Lock ALL non-admin users? They will not be able to login.')) {
                                            try {
                                                const res = await authService.lockAllUsers()
                                                toast.success(res.data.message)
                                                fetchUsers()
                                            } catch (e) { toast.error('Error: ' + e.message) }
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
                                    title="Lock all non-admin users"
                                >
                                    <Lock className="w-4 h-4" />
                                    Lock All
                                </button>
                                <div className="w-px bg-white/10 my-1 mx-1"></div>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Unlock ALL users?')) {
                                            try {
                                                const res = await authService.unlockAllUsers()
                                                toast.success(res.data.message)
                                                fetchUsers()
                                            } catch (e) { toast.error('Error: ' + e.message) }
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-2"
                                    title="Unlock all users"
                                >
                                    <Unlock className="w-4 h-4" />
                                    Unlock All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 animate-fadeIn">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <ShieldOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="font-bold text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/50 dark:bg-white/5">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-stitch-blue transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by username..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-black/20 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-stitch-blue dark:focus:border-stitch-blue text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400 font-bold text-sm">
                                <Filter className="w-4 h-4" />
                                Filters:
                            </div>
                            <Dropdown
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Roles' },
                                    { value: 'admin', label: 'Admins' },
                                    { value: 'user', label: 'Users' }
                                ]}
                                variant="default"
                                className="w-48"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-8 py-6 first:pl-10">User Identity</th>
                                    <th className="px-8 py-6">Access Roles</th>
                                    <th className="px-8 py-6">Permissions</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6">Created</th>
                                    <th className="px-8 py-6 text-right last:pr-10">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 border-4 border-stitch-blue/30 border-t-stitch-blue rounded-full animate-spin"></div>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium">Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-bold text-lg">No users found</p>
                                            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6 first:pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                                                        {user.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-base">{user.username}</p>
                                                        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">ID: {user._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {user.roles.map((role) => (
                                                        <span
                                                            key={role}
                                                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg border ${role === 'admin' || role === 'superadmin'
                                                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-500/20'
                                                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-500/20'
                                                                }`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {user.permissions && user.permissions.length > 0 ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                            {user.permissions.length}
                                                        </span>
                                                        {isAdmin(user) && (
                                                            <button
                                                                onClick={() => handleEditPermissions(user)}
                                                                className="text-xs font-bold text-slate-400 hover:text-stitch-blue transition-colors underline decoration-2 decoration-transparent hover:decoration-stitch-blue/30"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400 dark:text-slate-600 italic">No permissions</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${user.isActive
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                        : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                                    <span className="text-xs font-bold uppercase tracking-wide">
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 text-right last:pr-10">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                                                        className={`p-2 rounded-xl transition-all ${openMenuId === user._id
                                                                ? 'bg-stitch-blue text-white shadow-lg shadow-stitch-blue/30'
                                                                : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-stitch-blue hover:border-stitch-blue'
                                                            }`}
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {openMenuId === user._id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-20 cursor-default"
                                                                onClick={() => setOpenMenuId(null)}
                                                            ></div>
                                                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 z-30 overflow-hidden animate-fadeIn pb-1">
                                                                <div className="bg-slate-50 dark:bg-black/20 p-3 border-b border-slate-100 dark:border-white/5 mb-1">
                                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Actions</p>
                                                                </div>

                                                                {/* Toggle Active Status */}
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm(`Are you sure you want to ${user.isActive ? 'lock' : 'unlock'} ${user.username}?`)) {
                                                                            try {
                                                                                await authService.updateUser(user._id, { isActive: !user.isActive })
                                                                                fetchUsers()
                                                                            } catch (e) { toast.error(e.message) }
                                                                        }
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-3 text-sm font-bold ${user.isActive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                                                >
                                                                    {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                                    <span>{user.isActive ? 'Lock Account' : 'Unlock Account'}</span>
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        handleResetPassword(user);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-stitch-blue dark:hover:text-stitch-blue"
                                                                >
                                                                    <Key className="w-4 h-4" />
                                                                    Reset Password
                                                                </button>

                                                                <div className="my-1 border-t border-slate-100 dark:border-white/5"></div>

                                                                {!isAdmin(user) ? (
                                                                    <button
                                                                        onClick={() => handlePromote(user)}
                                                                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                                                                    >
                                                                        <Shield className="w-4 h-4" />
                                                                        Promote to Admin
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleEditPermissions(user)}
                                                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                            Edit Permissions
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDemote(user)}
                                                                            className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400"
                                                                        >
                                                                            <ShieldOff className="w-4 h-4" />
                                                                            Demote to User
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - Static for now but styled */}
                    <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                        <p>Showing <strong className="text-slate-900 dark:text-white">{filteredUsers.length}</strong> users</p>
                        <div className="flex gap-2">
                            <button disabled className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-transparent opacity-50 cursor-not-allowed">Previous</button>
                            <button disabled className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-transparent opacity-50 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>

                {/* Permission Modal */}
                <PermissionModal
                    isOpen={showPermissionModal}
                    onClose={() => {
                        setShowPermissionModal(false)
                        setSelectedUser(null)
                    }}
                    onConfirm={handleConfirmPermissions}
                    user={selectedUser}
                    mode={modalMode}
                />
            </div >
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    )
}
