import { useState, useEffect } from 'react'
import { authService } from '../../services/authService'
import { Users, TrendingUp, Calendar, Shield } from 'lucide-react'

export default function PromotedUserDashboard() {
    const [user, setUser] = useState(null)
    const [greeting, setGreeting] = useState('')
    const [greetingEmoji, setGreetingEmoji] = useState('')

    useEffect(() => {
        const currentUser = authService.getUser()
        setUser(currentUser)

        // Set time-based greeting
        const hour = new Date().getHours()
        if (hour < 12) {
            setGreeting('Good Morning')
            setGreetingEmoji('🌅')
        } else if (hour < 17) {
            setGreeting('Good Afternoon')
            setGreetingEmoji('☀️')
        } else {
            setGreeting('Good Evening')
            setGreetingEmoji('🌙')
        }
    }, [])

    // Get user's permissions
    const permissions = user?.permissions || []
    const permissionLabels = {
        'view_students': 'View Students',
        'add_students': 'Add Students',
        'edit_students': 'Edit Students',
        'delete_students': 'Delete Students',
        'view_birthdays': 'View Birthdays',
        'view_analytics': 'View Analytics',
        'manage_users': 'Manage Users',
        'system_settings': 'System Settings',
        'bulk_import': 'Bulk Import',
        'bulk_update': 'Bulk Update'
    }

    return (
        <div className="p-4 md:p-8 animate-fadeIn max-w-[1400px] mx-auto space-y-8">
            {/* Greeting Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="hidden md:block absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl md:text-5xl">{greetingEmoji}</span>
                        <h1 className="text-2xl md:text-4xl font-bold">{greeting}!</h1>
                    </div>
                    <p className="text-lg md:text-2xl font-medium opacity-90 mb-4">
                        {user?.username || 'Administrator'}
                    </p>
                    <div className="flex flex-wrap gap-2 md:gap-3 text-sm">
                        <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Administrator
                        </span>
                        <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-full font-medium">
                            {permissions.length} Permissions
                        </span>
                    </div>
                </div>
            </div>

            {/* Your Permissions */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">🔐</span>
                    <h2 className="text-2xl font-bold text-gray-900">Your Permissions</h2>
                </div>

                {permissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permissions.map((perm, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        ✓
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {permissionLabels[perm] || perm}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔒</div>
                        <p className="text-gray-600 text-lg">No permissions assigned yet</p>
                        <p className="text-gray-500 text-sm mt-2">Contact a superadmin to grant you access</p>
                    </div>
                )}
            </div>

            {/* Quick Access */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {permissions.includes('view_students') && (
                        <a
                            href="/students"
                            className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                <Users className="w-10 h-10 mx-auto text-blue-600" />
                            </div>
                            <p className="font-bold text-gray-900">Students</p>
                        </a>
                    )}

                    {permissions.includes('view_birthdays') && (
                        <a
                            href="/birthdays"
                            className="p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎂</div>
                            <p className="font-bold text-gray-900">Birthdays</p>
                        </a>
                    )}

                    {permissions.includes('view_analytics') && (
                        <a
                            href="/analytics"
                            className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-10 h-10 mx-auto text-green-600" />
                            </div>
                            <p className="font-bold text-gray-900">Analytics</p>
                        </a>
                    )}

                    {permissions.includes('bulk_import') && (
                        <a
                            href="/register-students"
                            className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📥</div>
                            <p className="font-bold text-gray-900">Import</p>
                        </a>
                    )}

                    {permissions.includes('bulk_update') && (
                        <a
                            href="/update-students"
                            className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔄</div>
                            <p className="font-bold text-gray-900">Update</p>
                        </a>
                    )}

                    {permissions.includes('add_students') && (
                        <a
                            href="/students/new"
                            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">➕</div>
                            <p className="font-bold text-gray-900">Add Student</p>
                        </a>
                    )}

                    {permissions.includes('system_settings') && (
                        <a
                            href="/admin"
                            className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚙️</div>
                            <p className="font-bold text-gray-900">Settings</p>
                        </a>
                    )}
                </div>

                {permissions.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No quick access links available</p>
                    </div>
                )}
            </div>

            {/* Getting Started Guide */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Check Your Permissions</h3>
                            <p className="text-sm text-gray-600">Review the permissions granted to you above</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Use the Sidebar</h3>
                            <p className="text-sm text-gray-600">Navigate to features you have access to from the left sidebar</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Quick Access</h3>
                            <p className="text-sm text-gray-600">Use the quick access cards above for faster navigation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

