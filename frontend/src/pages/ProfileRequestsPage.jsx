import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User, Calendar, FileText, Filter, Search } from 'lucide-react'
import api from '../services/api'

export default function ProfileRequestsPage() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, Pending, Approved, Rejected
    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        fetchRequests()
    }, [filter])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const url = filter === 'all' ? '/profile-requests' : `/profile-requests?status=${filter}`
            console.log('Fetching requests from:', url)
            const response = await api.get(url)
            console.log('API Response:', response)
            console.log('API Data:', response.data)

            // Handle different possible response structures
            const requestData = response.data.data || response.data || []
            console.log('Parsed Requests:', requestData)

            if (Array.isArray(requestData)) {
                setRequests(requestData)
            } else {
                console.error('Data is not an array:', requestData)
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
            Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            Approved: 'bg-green-100 text-green-700 border-green-200',
            Rejected: 'bg-red-100 text-red-700 border-red-200'
        }
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
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
                // Loose equality check to handle number/string differences, 
                // but handle empty/null cases carefully
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-start justify-between">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">Request Details</h2>
                            <p className="text-indigo-100 mt-1">Review the requested profile changes</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        {/* Student Info */}
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
                                {request.student?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{request.student?.fullName}</h3>
                                <p className="text-indigo-600 font-medium">{request.student?.registrationNumber}</p>
                            </div>
                        </div>

                        {/* Changes List */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Requested Changes</h4>
                            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Field</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase text-red-600">Current Value</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase text-green-600">Requested Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {Object.entries(request.requestedChanges || {}).map(([key, value]) => {
                                            const currentValue = request.student ? request.student[key] : 'N/A'
                                            const isDifferent = String(currentValue) !== String(value)

                                            return (
                                                <tr key={key} className="hover:bg-white transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-700 capitalize border-r border-gray-200 w-1/4">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 border-r border-gray-200 w-1/3 break-all">
                                                        {currentValue || <span className="text-gray-400 italic">Empty</span>}
                                                    </td>
                                                    <td className={`px-4 py-3 font-semibold w-1/3 break-all ${isDifferent ? 'text-green-700 bg-green-50' : 'text-gray-900'}`}>
                                                        {value}
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
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Reason for Request</h4>
                            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 italic">
                                "{request.reason}"
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Requested: {formatDate(request.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => {
                                        handleApprove(request._id)
                                        onClose()
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
                            <FileText className="w-5 h-5 md:w-9 md:h-9 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-4xl font-black text-white mb-1">Profile Change Requests</h1>
                            <p className="text-xs md:text-base text-indigo-100 font-medium">Review and manage student profile update requests</p>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-2 border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div className="flex gap-2">
                                {['all', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-xs md:text-sm transition-all whitespace-nowrap ${filter === status
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 md:pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-xs md:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-white rounded-xl p-2 md:p-4 shadow-lg border-2 border-yellow-100">
                        <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-1 md:mb-0">
                                <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Pending</p>
                                <p className="text-lg md:text-2xl font-black text-gray-900">
                                    {requests.filter(r => r.status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-2 md:p-4 shadow-lg border-2 border-green-100">
                        <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center mb-1 md:mb-0">
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Approved</p>
                                <p className="text-lg md:text-2xl font-black text-gray-900">
                                    {requests.filter(r => r.status === 'Approved').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-2 md:p-4 shadow-lg border-2 border-red-100">
                        <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg flex items-center justify-center mb-1 md:mb-0">
                                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs text-gray-500 font-medium">Rejected</p>
                                <p className="text-lg md:text-2xl font-black text-gray-900">
                                    {requests.filter(r => r.status === 'Rejected').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requests List (Mobile Cards + Desktop Table) */}
                <div className="space-y-4">
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 md:hidden gap-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request._id}
                                onClick={() => setSelectedRequest(request)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {request.student?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{request.student?.fullName}</h3>
                                            <p className="text-xs text-indigo-600 font-medium">{request.student?.registrationNumber}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusBadge(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">Changes:</span> {formatChanges(request.requestedChanges, request.student)}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-2">
                                        <span className="font-semibold text-gray-700">Reason:</span> "{request.reason}"
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(request.createdAt)}
                                    </div>
                                </div>

                                <button className="w-full py-2 bg-gray-50 text-indigo-600 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-gray-600 font-medium mt-4">Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
                                <p className="text-gray-600">
                                    {searchQuery ? 'Try adjusting your search' : 'No profile change requests available'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                            <th className="px-6 py-4 text-left font-bold text-sm">Student</th>
                                            <th className="px-6 py-4 text-left font-bold text-sm">Requested Changes</th>
                                            <th className="px-6 py-4 text-left font-bold text-sm">Reason</th>
                                            <th className="px-6 py-4 text-left font-bold text-sm">Date</th>
                                            <th className="px-6 py-4 text-left font-bold text-sm">Status</th>
                                            <th className="px-6 py-4 text-left font-bold text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRequests.map((request) => (
                                            <tr
                                                key={request._id}
                                                className="hover:bg-indigo-50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedRequest(request)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {request.student?.fullName?.charAt(0) || '?'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                                {request.student?.fullName || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {request.student?.registrationNumber || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-700 line-clamp-2">
                                                        {formatChanges(request.requestedChanges, request.student)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                                                        {request.reason || 'No reason provided'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                                        <span>{formatDate(request.createdAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-xs border-2 ${getStatusBadge(request.status)}`}>
                                                        {request.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                        {request.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                                                        {request.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    {request.status === 'Pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleApprove(request._id)}
                                                                disabled={processingId === request._id}
                                                                className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>Approve</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(request._id)}
                                                                disabled={processingId === request._id}
                                                                className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                <span>Reject</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500">
                                                            {request.reviewedBy?.username && `By ${request.reviewedBy.username}`}
                                                        </div>
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
        </div>
    )
}
