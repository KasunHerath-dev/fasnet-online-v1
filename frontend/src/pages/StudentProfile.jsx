import { useState, useEffect } from 'react'
import { authService, studentService } from '../services/authService'

export default function StudentProfile() {
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [pendingRequest, setPendingRequest] = useState(null)
    const [formData, setFormData] = useState({})
    const [requestReason, setRequestReason] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const user = authService.getUser()
            if (user.studentRef) {
                setStudent(user.studentRef)

                const res = await studentService.getProfileRequests({
                    studentId: user.studentRef._id,
                    status: 'Pending'
                })
                if (res.data.data && res.data.data.length > 0) {
                    setPendingRequest(res.data.data[0])
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = () => {
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            address: student.address || '',
            contactNumber: student.contactNumber || '',
            email: student.email || '',
            whatsapp: student.whatsapp || '',
            nearestCity: student.nearestCity || '',
            district: student.district || ''
        })
        setShowEditModal(true)
    }

    const handleSubmitRequest = async (e) => {
        e.preventDefault()
        try {
            if (!requestReason) {
                alert('Please provide a reason for the change.')
                return
            }

            await studentService.createProfileRequest({
                studentId: student._id,
                changes: formData,
                reason: requestReason
            })

            alert('Change request submitted for approval!')
            setShowEditModal(false)
            setRequestReason('')
            fetchProfile()
        } catch (err) {
            alert('Failed to submit request: ' + (err.response?.data?.error || err.message))
        }
    }

    if (loading) return <div className="p-8 text-center">Loading profile...</div>
    if (!student) return <div className="p-8 text-center">Student record not found.</div>

    const InfoField = ({ label, value, isMissing }) => (
        <div className="group">
            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</dt>
            <dd className={`text-base ${isMissing ? 'text-red-500 italic' : 'text-gray-900'}`}>
                {value || 'Not Provided'}
                {isMissing && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Missing</span>}
            </dd>
        </div>
    )

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage your personal information</p>
                    </div>
                    <button
                        onClick={handleEditClick}
                        disabled={!!pendingRequest}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${pendingRequest
                            ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed dark:bg-yellow-900/50 dark:text-yellow-400'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {pendingRequest ? '⏳ Update Pending' : '✏️ Request Edit'}
                    </button>
                </div>
            </div>

            {/* Pending Request Alert */}
            {pendingRequest && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-5 rounded-2xl flex items-start gap-4 animate-fadeIn">
                    <span className="text-3xl">⏳</span>
                    <div className="flex-1">
                        <p className="font-bold text-lg">Profile Update Pending</p>
                        <p className="text-sm mt-1">Your profile change request is awaiting admin approval. You'll be notified once it's reviewed.</p>
                    </div>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="md:flex">
                    {/* Sidebar - Full Area Design */}
                    <div className="md:w-1/3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[600px]">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>

                        {/* Top Section - Initial */}
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-5xl font-bold border-2 border-white/30 shadow-xl mb-4">
                                {student?.fullName?.charAt(0) || 'S'}
                            </div>
                        </div>

                        {/* Middle Section - Student Info */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 leading-tight">
                                    {(student.firstName && student.lastName)
                                        ? `${student.firstName} ${student.lastName}`
                                        : student.fullName}
                                </h2>
                                <p className="text-white/90 text-lg font-medium">{student?.registrationNumber}</p>
                            </div>

                            <div className="h-px bg-white/20 my-2"></div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎓</span>
                                    <div className="text-left">
                                        <p className="text-xs text-white/70 uppercase tracking-wide">Batch Year</p>
                                        <p className="font-semibold">{student?.batchYear}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📚</span>
                                    <div className="text-left">
                                        <p className="text-xs text-white/70 uppercase tracking-wide">Current Level</p>
                                        <p className="font-semibold">Level {student?.level}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🎯</span>
                                    <div className="text-left">
                                        <p className="text-xs text-white/70 uppercase tracking-wide">Programme</p>
                                        <p className="font-semibold text-sm">{student?.course || 'B.Sc. Applied Sciences'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Stats */}
                        <div className="relative z-10 grid grid-cols-2 gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">GPA</p>
                                <p className="text-2xl font-bold">{student?.cumulativeGPA?.toFixed(2) || '0.00'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Credits</p>
                                <p className="text-2xl font-bold">{student?.totalCreditsEarned || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Area */}
                    <div className="md:w-2/3 p-8">
                        {/* Personal Details */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-gray-100 dark:border-slate-700 flex items-center gap-2">
                                <span>👤</span> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="First Name" value={student.firstName} isMissing={!student.firstName} />
                                <InfoField label="Last Name" value={student.lastName} isMissing={!student.lastName} />
                                <InfoField label="Full Name (Official)" value={student.fullName} />
                                <InfoField label="NIC Number" value={student.nicNumber} isMissing={!student.nicNumber} />
                                <InfoField label="Gender" value={student.gender} isMissing={!student.gender} />
                                <InfoField
                                    label="Birthday"
                                    value={student.birthday ? new Date(student.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null}
                                    isMissing={!student.birthday}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-gray-100 dark:border-slate-700 flex items-center gap-2">
                                <span>📞</span> Contact Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Email" value={student.email} isMissing={!student.email} />
                                <InfoField label="Phone Number" value={student.contactNumber} isMissing={!student.contactNumber} />
                                <InfoField label="WhatsApp" value={student.whatsapp} isMissing={!student.whatsapp} />
                                <InfoField label="Address" value={student.address} isMissing={!student.address} />
                                <InfoField label="Nearest City" value={student.nearestCity} isMissing={!student.nearestCity} />
                                <InfoField label="District" value={student.district} isMissing={!student.district} />
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b-2 border-gray-100 dark:border-slate-700 flex items-center gap-2">
                                <span>🎓</span> Academic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Degree Programme" value={student.degreeProgramme} isMissing={!student.degreeProgramme} />
                                <InfoField label="Combination" value={student.combination} isMissing={!student.combination} />
                                <InfoField label="Academic Status" value={student.academicStatus || 'Regular'} />
                                <InfoField label="Cumulative GPA" value={student.cumulativeGPA?.toFixed(2)} />
                                <InfoField label="Credits Earned" value={student.totalCreditsEarned?.toString()} />
                                <InfoField label="AL Z-Score" value={student.alZScore?.toString()} isMissing={!student.alZScore} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl animate-scaleIn overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request Profile Update</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submit changes for admin approval</p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-6 overflow-y-auto flex-1">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                                <span className="text-2xl">ℹ️</span>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Note:</strong> All changes require administrator approval before they appear on your profile.
                                </p>
                            </div>

                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Contact Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nearest City</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.nearestCity}
                                        onChange={(e) => setFormData({ ...formData, nearestCity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for Change <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    rows="3"
                                    placeholder="e.g., Updated contact information, moved to new address, etc."
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
