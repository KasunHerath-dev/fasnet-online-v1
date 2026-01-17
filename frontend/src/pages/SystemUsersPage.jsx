import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, studentService } from '../services/authService'
import { useToast } from '../context/ToastContext'
import PageHeader from '../components/PageHeader'
import PermissionModal from '../components/PermissionModal'
import { Shield, ShieldOff, Edit, Trash2, MoreVertical, ChevronDown, Key } from 'lucide-react'
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
        <div className="p-8 animate-fadeIn max-w-[1600px] mx-auto min-h-screen">
            <PageHeader
                title="System Users"
                subtitle="Manage and view all system accounts."
                actions={
                    <div className="flex gap-3">
                        <button
                            onClick={handleSync}
                            className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <span>🔄</span> Sync Accounts
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
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
                                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-2"
                                title="Lock all non-admin users"
                            >
                                🔒 Lock All
                            </button>
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
                                className="px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-white hover:shadow-sm rounded-md transition-all flex items-center gap-2"
                                title="Unlock all users"
                            >
                                🔓 Unlock All
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <span>←</span> Dashboard
                        </button>
                    </div>
                }
            />

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-96">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by username..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-medium text-gray-500">Filters:</span>
                        <Dropdown
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            options={[
                                { value: 'all', label: 'All Roles' },
                                { value: 'admin', label: 'Admins' },
                                { value: 'user', label: 'Users' }
                            ]}
                            variant="default"
                            className="w-40"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">User Identity</th>
                                <th className="px-6 py-4">Access Roles</th>
                                <th className="px-6 py-4">Permissions</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                                        <p className="mt-2 text-sm">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <div className="text-4xl mb-2">👤</div>
                                        <p>No users found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.username}</p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${role === 'admin' || role === 'superadmin'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.permissions && user.permissions.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-indigo-600">
                                                        {user.permissions.length} permissions
                                                    </span>
                                                    {isAdmin(user) && (
                                                        <button
                                                            onClick={() => handleEditPermissions(user)}
                                                            className="text-xs text-gray-500 hover:text-indigo-600 underline"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">No permissions</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></div>
                                                <span className={`text-sm font-medium ${user.isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {openMenuId === user._id && (
                                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-10 overflow-hidden">
                                                        {/* Toggle Active Status */}
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Are you sure you want to ${user.isActive ? 'lock' : 'unlock'} ${user.username}?`)) {
                                                                    try {
                                                                        await authService.updateUser(user._id, { isActive: !user.isActive })
                                                                        fetchUsers()
                                                                    } catch (e) { toast.error(e.message) }
                                                                }
                                                            }}
                                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-all flex items-center gap-3 text-sm font-semibold ${user.isActive ? 'text-red-600' : 'text-emerald-600'}`}
                                                        >
                                                            <span>{user.isActive ? '🔒 Lock Account' : '🔓 Unlock Account'}</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleResetPassword(user)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-indigo-600"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                            Reset Password
                                                        </button>

                                                        {!isAdmin(user) ? (
                                                            <button
                                                                onClick={() => handlePromote(user)}
                                                                className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-all flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-indigo-600"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                                Promote to Admin
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditPermissions(user)}
                                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-all flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-blue-600"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                    Edit Permissions
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDemote(user)}
                                                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-all flex items-center gap-3 text-sm font-semibold text-gray-700 hover:text-orange-600"
                                                                >
                                                                    <ShieldOff className="w-4 h-4" />
                                                                    Demote to User
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm text-gray-500">
                    <p>Showing <strong>{filteredUsers.length}</strong> users</p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 rounded-lg border border-gray-200 bg-white opacity-50 cursor-not-allowed">Previous</button>
                        <button disabled className="px-3 py-1 rounded-lg border border-gray-200 bg-white opacity-50 cursor-not-allowed">Next</button>
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
    )
}
