import UnifiedPageLoader from '../../components/loaders/UnifiedPageLoader';

// ... (imports)

export default function StudentProfile() {
    // ... (state)

    if (loading) return <UnifiedPageLoader />;
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
        <div className="font-sans">

            {/* WELCOME BANNER (Glassmorphism) */}
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-white/50 relative overflow-hidden mb-6">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-sm w-fit">
                            <User className="w-4 h-4 text-moccaccino-600" />
                            <span className="text-slate-600 text-xs font-bold tracking-wide uppercase">Profile</span>
                        </div>

                        <div>
                            <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-moccaccino-500 to-orange-500">Profile</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg mt-2 max-w-xl">
                                View and manage your personal information
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/50">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-slate-600 text-xs sm:text-sm font-bold">Live System</span>
                            </div>
                            <button
                                onClick={handleEditClick}
                                disabled={!!pendingRequest}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${pendingRequest
                                    ? 'bg-amber-100 text-amber-600 cursor-not-allowed border border-amber-200'
                                    : 'bg-white/50 text-slate-700 hover:bg-white hover:shadow-md border border-white/50'
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

            {/* Main Content */}
            <div className="space-y-6 pb-12">

                {/* Pending Request Alert */}
                {pendingRequest && (
                    <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 md:p-5 flex items-start gap-3 md:gap-4">
                        <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-black text-base text-amber-800">Profile Update Pending</p>
                            <p className="text-sm text-amber-700 mt-1 font-medium">Your profile change request is awaiting admin approval. You'll be notified once it's reviewed.</p>
                        </div>
                    </div>
                )}

                {/* Profile Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Level Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            Level {student?.level || '-'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Current Level
                        </p>
                    </div>

                    {/* Batch Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            {student?.batchYear}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Batch Year
                        </p>
                    </div>

                    {/* Degree Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Award className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            {student?.degreeType === 'special' ? 'Special' : 'General'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Degree Type
                        </p>
                    </div>

                    {/* Combination Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            {student?.combination?.replace('COMB', '') || '-'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Combination
                        </p>
                    </div>

                    {/* GPA Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Award className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            {student?.cumulativeGPA?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Cumulative GPA
                        </p>
                    </div>

                    {/* Credits Card */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Target className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-slate-800 mb-1">
                            {student?.totalCreditsEarned || 0}
                        </p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                            Credits Earned
                        </p>
                    </div>
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Personal Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-sm border border-white/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-moccaccino-100 rounded-lg">
                                    <User className="w-5 h-5 text-moccaccino-600" />
                                </div>
                                <h2 className="text-xl font-black text-slate-800">Personal Information</h2>
                            </div>

                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                <InfoField label="Full Name" value={student?.name} />
                                <InfoField label="Registration Number" value={student?.regNo} />
                                <InfoField label="Index Number" value={student?.indexNo} isMissing={!student?.indexNo} />
                                <InfoField label="Email Address" value={student?.email} />
                                <InfoField label="Contact Number" value={student?.contactNumber} isMissing={!student?.contactNumber} />
                                <InfoField label="NIC Number" value={student?.nic} isMissing={!student?.nic} />
                                <div className="sm:col-span-2">
                                    <InfoField label="Address" value={student?.address} isMissing={!student?.address} />
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right Column: Account & Settings */}
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/50 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Settings className="w-5 h-5 text-slate-600" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Account Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white border border-white/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 text-slate-400 group-hover:text-moccaccino-500 transition-colors" />
                                    <span className="font-bold text-slate-700">Change Password</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Edit className="w-4 h-4 text-slate-400" />
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white border border-white/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-moccaccino-500 transition-colors" />
                                    <span className="font-bold text-slate-700">Notifications</span>
                                </div>
                                <div className="px-2 py-1 bg-moccaccino-100 text-moccaccino-700 text-xs font-bold rounded-lg">
                                    Enabled
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white border border-white/50 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-slate-400 group-hover:text-moccaccino-500 transition-colors" />
                                    <span className="font-bold text-slate-700">Privacy Settings</span>
                                </div>
                            </button>
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
                                <div className="w-10 h-10 rounded-xl bg-moccaccino-50 dark:bg-moccaccino-900/20 flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-moccaccino-600 dark:text-moccaccino-400" />
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
                            <div className="bg-moccaccino-50 dark:bg-moccaccino-900/20 border border-moccaccino-200 dark:border-moccaccino-800 p-4 rounded-xl flex items-start gap-3">
                                <Info className="w-5 h-5 text-moccaccino-600 dark:text-moccaccino-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-moccaccino-800 dark:text-moccaccino-200">
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

