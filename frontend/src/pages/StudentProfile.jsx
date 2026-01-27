import { useState, useEffect } from 'react'
import { authService, studentService } from '../services/authService'
import { User, Mail, Phone, MapPin, GraduationCap, Award, Target, Edit, Clock, X, Info, AlertCircle, TrendingUp, BookOpen } from 'lucide-react'

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
            const nameUpdates = {}
            if (formData.firstName !== student.firstName) nameUpdates.firstName = formData.firstName
            if (formData.lastName !== student.lastName) nameUpdates.lastName = formData.lastName

            let nameUpdated = false
            if (Object.keys(nameUpdates).length > 0) {
                await studentService.updateMyProfile(nameUpdates)
                nameUpdated = true

                const user = authService.getUser()
                if (user.studentRef) {
                    user.studentRef.firstName = formData.firstName
                    user.studentRef.lastName = formData.lastName
                    authService.setUser(user)
                }
            }

            const otherUpdates = { ...formData }
            delete otherUpdates.firstName
            delete otherUpdates.lastName

            const hasOtherChanges = Object.keys(otherUpdates).some(key => {
                const original = student[key] || ''
                const current = otherUpdates[key] || ''
                return original !== current
            })

            if (hasOtherChanges) {
                if (!requestReason) {
                    alert('Please provide a reason for the contact details change.')
                    return
                }

                await studentService.createProfileRequest({
                    studentId: student._id,
                    changes: otherUpdates,
                    reason: requestReason
                })
                alert(nameUpdated
                    ? 'Name updated successfully! Contact details request submitted for approval.'
                    : 'Change request submitted for approval!')
            } else if (nameUpdated) {
                alert('Name updated successfully!')
            } else {
                alert('No changes detected.')
                return
            }

            setShowEditModal(false)
            setRequestReason('')
            fetchProfile()
        } catch (err) {
            alert('Failed to submit: ' + (err.response?.data?.error || err.message))
        }
    }

    if (loading) return <div className="p-8 text-center">Loading profile...</div>
    if (!student) return <div className="p-8 text-center">Student record not found.</div>

    const InfoField = ({ label, value, isMissing }) => (
        <div className="group">
            <dt className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</dt>
            <dd className={`text-sm font-medium ${isMissing ? 'text-red-500 dark:text-red-400 italic' : 'text-slate-900 dark:text-white'}`}>
                {value || 'Not Provided'}
                {isMissing && <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-lg">Missing</span>}
            </dd>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-display text-slate-900 dark:text-white transition-colors duration-500">

            {/* Enhanced Hero Section - Command Center Style */}
            <div className="relative w-full overflow-hidden pb-32 sm:pb-20 lg:pb-24">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700 opacity-10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-slate-600 opacity-5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-10">
                        <div className="flex-1 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-lg w-fit">
                                <User className="w-4 h-4 text-blue-300" />
                                <span className="text-white text-xs font-bold tracking-wide uppercase">Profile</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
                                    My
                                    <span className="block mt-1 text-slate-500">
                                        Profile
                                    </span>
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed">
                                    View and manage your personal information
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-white text-xs sm:text-sm font-bold">Live System</span>
                                </div>
                                <button
                                    onClick={handleEditClick}
                                    disabled={!!pendingRequest}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${pendingRequest
                                            ? 'bg-yellow-500/20 text-yellow-300 cursor-not-allowed border border-yellow-500/30'
                                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {pendingRequest ? (
                                        <>
                                            <Clock className="w-4 h-4" />
                                            Update Pending
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4" />
                                            Request Edit
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 pb-12 sm:pb-20">

                {/* Pending Request Alert */}
                {pendingRequest && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4 mb-6 sm:mb-8">
                        <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-black text-base text-yellow-800 dark:text-yellow-200">Profile Update Pending</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 font-medium">Your profile change request is awaiting admin approval. You'll be notified once it's reviewed.</p>
                        </div>
                    </div>
                )}

                {/* Profile Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Level Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            Level {student?.level || '-'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Current Level
                        </p>
                    </div>

                    {/* Batch Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {student?.batchYear}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Batch Year
                        </p>
                    </div>

                    {/* GPA Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {student?.cumulativeGPA?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Cumulative GPA
                        </p>
                    </div>

                    {/* Credits Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {student?.totalCreditsEarned || 0}
                        </p>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Credits Earned
                        </p>
                    </div>
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* Personal Information */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InfoField label="Full Name (Official)" value={student.fullName} />
                            <InfoField label="First Name" value={student.firstName} isMissing={!student.firstName} />
                            <InfoField label="Last Name" value={student.lastName} isMissing={!student.lastName} />
                            <InfoField label="Registration Number" value={student.registrationNumber} />
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
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Contact Details</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <InfoField label="Email" value={student.email} isMissing={!student.email} />
                            <InfoField label="Phone Number" value={student.contactNumber} isMissing={!student.contactNumber} />
                            <InfoField label="WhatsApp" value={student.whatsapp} isMissing={!student.whatsapp} />
                            <InfoField label="Address" value={student.address} isMissing={!student.address} />
                            <InfoField label="Nearest City" value={student.nearestCity} isMissing={!student.nearestCity} />
                            <InfoField label="District" value={student.district} isMissing={!student.district} />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Academic Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Request Profile Update</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Submit changes for admin approval</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-6 overflow-y-auto flex-1">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Note:</strong> All changes require administrator approval before they appear on your profile.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Personal Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">WhatsApp</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.whatsapp}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Address</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nearest City</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.nearestCity}
                                            onChange={(e) => setFormData({ ...formData, nearestCity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">District</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Reason for Change <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                                    rows="3"
                                    placeholder="e.g., Updated contact information, moved to new address, etc."
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-black dark:hover:bg-slate-100 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
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
