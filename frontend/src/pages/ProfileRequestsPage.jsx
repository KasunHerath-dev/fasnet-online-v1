import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Filter, Search, User, Calendar, ArrowRight, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function ProfileRequestsPage() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, Pending, Approved, Rejected
    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchRequests()
    }, [filter])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const url = filter === 'all' ? '/profile-requests' : `/profile-requests?status=${filter}`
            const response = await api.get(url)

            // Handle different possible response structures
            const requestData = response.data.data || response.data || []

            if (Array.isArray(requestData)) {
                setRequests(requestData)
            } else {
                setRequests([])
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId) => {
        if (!window.confirm('Are you sure you want to approve this request?')) return

        try {
            setProcessingId(requestId)
            await api.put(`/profile-requests/${requestId}/approve`, {
                comments: 'Approved by admin'
            })
            fetchRequests()
        } catch (error) {
            console.error('Error approving request:', error)
            alert(error.response?.data?.error || 'Failed to approve request')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId) => {
        const reason = window.prompt('Please provide a reason for rejection:')
        if (!reason) return

        try {
            setProcessingId(requestId)
            await api.put(`/profile-requests/${requestId}/reject`, {
                comments: reason
            })
            fetchRequests()
        } catch (error) {
            console.error('Error rejecting request:', error)
            alert(error.response?.data?.error || 'Failed to reject request')
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
            Approved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
            Rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        }
        return styles[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatChanges = (changes, student) => {
        if (!changes || Object.keys(changes).length === 0) return 'No changes specified'

        const changedKeys = Object.entries(changes)
            .filter(([key, value]) => {
                const currentValue = student ? student[key] : null
                if (!currentValue && !value) return false
                return String(currentValue).trim() !== String(value).trim()
            })
            .map(([key]) => {
                const spaced = key.replace(/([A-Z])/g, ' $1').trim()
                return spaced.charAt(0).toUpperCase() + spaced.slice(1)
            })

        return changedKeys.length > 0 ? changedKeys.join(', ') : 'No effective changes'
    }

    const [selectedRequest, setSelectedRequest] = useState(null)

    // Modal Component
    const RequestDetailsModal = ({ request, onClose }) => {
        if (!request) return null

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10 animate-scaleIn">
                    {/* Header */}
                    <div className="bg-black p-8 flex items-start justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10 text-white">
                            <h2 className="text-2xl font-black">Request Details</h2>
                            <p className="text-slate-300 font-medium opacity-80 mt-1">Review the requested profile changes</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="relative z-10 text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto flex-1 space-y-8">
                        {/* Student Info */}
                        <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/10 rounded-[2rem] border border-slate-200 dark:border-slate-500/20">
                            <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-900 dark:text-slate-300 font-black text-2xl shadow-sm">
                                {request.student?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{request.student?.fullName}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold font-mono">{request.student?.registrationNumber}</p>
                            </div>
                        </div>

                        {/* Changes List */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Requested Changes</h4>
                            <div className="bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Field</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Requested</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {Object.entries(request.requestedChanges || {}).map(([key, value]) => {
                                            const currentValue = request.student ? request.student[key] : 'N/A'
                                            const isDifferent = String(currentValue) !== String(value)

                                            return (
                                                <tr key={key} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm break-all">
                                                        {currentValue || <span className="text-slate-400 italic">Empty</span>}
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold text-sm w-1/3 break-all ${isDifferent ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {value}
                                                        {isDifferent && <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Request</h4>
                            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-200 italic font-medium">
                                "{request.reason}"
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(request.createdAt)}</span>
                            </div>
                            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold ${getStatusBadge(request.status)}`}>
                                {request.status}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 font-bold transition-colors shadow-sm"
                        >
                            Close
                        </button>
                        {request.status === 'Pending' && (
                            <>
                                <button
                                    onClick={() => {
                                        handleReject(request._id)
                                        onClose()
                                    }}
                                    className="px-6 py-3 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-500/30 font-bold transition-colors flex items-center gap-2"
                                >
                                    <XCircle className="w-5 h-5" /> Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(request._id)
                                        onClose()
                                    }}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow-lg shadow-green-500/30 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Approve
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const filteredRequests = requests.filter(request => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            request.student?.fullName?.toLowerCase().includes(query) ||
            request.student?.registrationNumber?.toLowerCase().includes(query)
        )
    })

    return (
        <div className="min-h-screen bg-stitch-bg-light dark:bg-stitch-bg-dark font-display text-slate-900 dark:text-white pb-20 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto space-y-8 animate-fadeIn p-4 md:p-8">

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-black dark:bg-black rounded-[2.5rem] p-8 md:p-12 shadow-2xl z-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/admin')}
                            className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 font-medium"
                        >
                            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </div>
                            Back to Dashboard
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner border border-white/20">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Profile Requests</h1>
                                <p className="text-slate-300 text-lg font-medium max-w-2xl">Review and manage student profile update requests.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-stitch-card-dark rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 p-6 md:p-8 space-y-8">

                    {/* Controls */}
                    <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                        {/* Stats */}
                        <div className="flex gap-4 w-full xl:w-auto">
                            <StatBadge
                                icon={<Clock className="w-4 h-4" />}
                                label="Pending"
                                count={requests.filter(r => r.status === 'Pending').length}
                                color="bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                            />
                            <StatBadge
                                icon={<CheckCircle className="w-4 h-4" />}
                                label="Approved"
                                count={requests.filter(r => r.status === 'Approved').length}
                                color="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            />
                            <StatBadge
                                icon={<XCircle className="w-4 h-4" />}
                                label="Rejected"
                                count={requests.filter(r => r.status === 'Rejected').length}
                                color="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                            />
                        </div>

                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                            <div className="bg-slate-100 dark:bg-black/20 p-1 rounded-xl flex gap-1">
                                {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all whitespace-nowrap ${filter === status
                                            ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 shadow-md transform scale-105'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status}
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 font-medium transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-slate-50 dark:bg-black/20 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-slate-500 dark:text-slate-400 font-bold mt-4">Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Requests Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {searchQuery ? 'Try adjusting your search criteria.' : 'No profile change requests match the current filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Changes</th>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-8 py-5 text-left font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-5 text-right font-black text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {filteredRequests.map((request) => (
                                            <tr
                                                key={request._id}
                                                className="group hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => setSelectedRequest(request)}
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                                                            {request.student?.fullName?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[150px]">
                                                                {request.student?.fullName || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-400 font-mono">
                                                                {request.student?.registrationNumber || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium line-clamp-1 max-w-xs">
                                                        {formatChanges(request.requestedChanges, request.student)}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm italic line-clamp-1 max-w-xs opacity-80">
                                                        "{request.reason || 'No reason provided'}"
                                                    </p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide border ${getStatusBadge(request.status)} border-current bg-opacity-10`}>
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    {request.status === 'Pending' ? (
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleApprove(request._id)}
                                                                disabled={processingId === request._id}
                                                                className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(request._id)}
                                                                disabled={processingId === request._id}
                                                                className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Render Modal */}
                {selectedRequest && (
                    <RequestDetailsModal
                        request={selectedRequest}
                        onClose={() => setSelectedRequest(null)}
                    />
                )}
            </div>
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn {
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
        </div>
    )
}

function StatBadge({ icon, label, count, color }) {
    return (
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border border-transparent ${color} bg-opacity-20`}>
            {icon}
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</span>
                <span className="text-xl font-black leading-none">{count}</span>
            </div>
        </div>
    )
}
