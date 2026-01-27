import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Cake,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Settings,
  User,
  GraduationCap,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Sparkles,
  Zap
} from 'lucide-react'
import { hasPermission, isRegularUser, isSuperAdmin, PERMISSIONS } from '../utils/permissions'

export default function SideNav({ isOpen, onClose }) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const user = authService.getUser()
  const isStudent = isRegularUser(user)
  const isSuperAdminUser = isSuperAdmin(user)

  // Icon mapping
  const iconMap = {
    'Dashboard': LayoutDashboard,
    'My Profile': User,
    'Academic': GraduationCap,
    'Analytics': TrendingUp,
    'Students': Users,
    'Birthdays': Cake,
    'Register': UserPlus,
    'Update Data': RefreshCw,
    'Missing': AlertTriangle,
    'Admin': Settings,
    'Settings': Settings,
    'Resources': BookOpen
  }

  // Build navigation links based on user permissions
  const links = []

  // Dashboard is always visible
  links.push({ label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' })

  if (isStudent) {
    // Student-specific links
    links.push(
      { label: 'My Profile', path: '/profile', icon: 'My Profile' },
      { label: 'Academic', path: '/academic', icon: 'Academic' },
      { label: 'Resources', path: '/resources', icon: 'Resources' },
      { label: 'Analytics', path: '/analytics', icon: 'Analytics' },
      { label: 'Settings', path: '/settings', icon: 'Settings' }
    )
  } else {
    // Admin/Promoted user links - filtered by permissions

    // If promoted user has studentRef, show student menu items first
    if (!isSuperAdminUser && user?.studentRef) {
      links.push(
        { label: 'My Profile', path: '/profile', icon: 'My Profile' },
        { label: 'Academic', path: '/academic', icon: 'Academic' },
        { label: 'Resources', path: '/resources', icon: 'Resources' },
        { label: 'Settings', path: '/settings', icon: 'Settings' }
      )
    }

    // Analytics - requires view_analytics permission (or shown for dual-role users)
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) || user?.studentRef) {
      links.push({ label: 'Analytics', path: '/analytics', icon: 'Analytics' })
    }

    // Students - requires view_students permission
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
      links.push({ label: 'Students', path: '/students', icon: 'Students' })
    }

    // Birthdays - requires view_birthdays permission
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
      links.push({ label: 'Birthdays', path: '/birthdays', icon: 'Birthdays' })
    }

    // Register (Bulk Import) - requires bulk_import permission
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
      links.push({ label: 'Register', path: '/register-students', icon: 'Register' })
    }

    // Update Data - requires bulk_update permission
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
      links.push({ label: 'Update Data', path: '/update-students', icon: 'Update Data' })
    }

    // Resource Manager - for admins only (Hidden for Super Admin as per request)
    if (!isSuperAdminUser && user?.roles?.includes('admin')) {
      links.push({ label: 'Resource Manager', path: '/admin/resources', icon: 'Resources' })
    }

    // Admin Settings - requires system_settings permission
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
      links.push({ label: 'Admin', path: '/admin', icon: 'Admin' })
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Enhanced Mobile Overlay with Glassmorphism */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/70 via-slate-900/80 to-black/70 backdrop-blur-md z-[90] md:hidden transition-all duration-300 animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-[100]
        ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}
        bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
        shadow-2xl shadow-slate-950/50
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        overflow-hidden
        border-r border-slate-800/50
      `}>
        {/* Animated gradient overlay - Command Center style */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-pink-600/20 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none"></div>

        {/* Content wrapper */}
        <div className="relative h-full flex flex-col">
          {/* Enhanced Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="relative group">
                  {/* Logo with enhanced gradient and glow */}
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-purple-600/50 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-purple-600/70">
                    <span className="relative z-10">F</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity blur-sm"></div>
                  </div>
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse"></div>
                  {/* Sparkle indicator */}
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="animate-fadeIn">
                    <h1 className="text-white font-black text-xl tracking-tight drop-shadow-lg">fasnet.online</h1>
                    <p className="text-indigo-300 text-xs font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Student Management
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile close button with gradient */}
              <button
                onClick={onClose}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 rounded-xl transition-all shadow-lg hover:shadow-red-500/50 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation with enhanced styling */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {links.map((link) => {
              const Icon = iconMap[link.icon]
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-300 ease-out
                    ${active
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-indigo-500/50 scale-105 border border-white/20'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:text-white hover:scale-105 hover:shadow-xl hover:shadow-white/10'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onClick={() => onClose && onClose()}
                  title={isCollapsed ? link.label : ''}
                >
                  {/* Active indicator with gradient */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-cyan-400 via-white to-pink-400 rounded-r-full shadow-lg shadow-white/50"></div>
                  )}

                  {/* Icon with enhanced animation */}
                  <div className={`relative flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                    {active && (
                      <div className="absolute inset-0 blur-lg opacity-75">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span className="font-semibold text-sm truncate animate-fadeIn">
                      {link.label}
                    </span>
                  )}

                  {/* Enhanced hover glow effect */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${active
                      ? 'bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 opacity-0 blur-2xl'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-30 blur-xl'
                    }`}></div>
                </Link>
              )
            })}
          </nav>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
            {!isCollapsed && (
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-4 mb-3 animate-fadeIn border border-white/10 shadow-xl">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl"></div>

                <div className="relative flex items-center gap-3 mb-2">
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <User className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-600 blur-md opacity-50"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {(user?.studentRef?.firstName && user?.studentRef?.lastName)
                        ? `${user.studentRef.firstName} ${user.studentRef.lastName}`
                        : (user?.username || 'User')}
                    </p>
                    <p className="text-indigo-300 text-xs truncate font-medium">
                      {isStudent ? 'Student' : isSuperAdminUser ? 'Super Admin' : 'Administrator'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm shadow-2xl shadow-purple-600/50 hover:shadow-purple-600/70 transition-all hover:scale-105 group border border-white/20"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Collapse</span>
                </>
              )}
            </button>

            {/* Copyright with gradient accent */}
            {!isCollapsed && (
              <p className="text-gray-500 text-xs text-center mt-3 animate-fadeIn font-medium">
                Developed by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">Kasun Herath</span>
              </p>
            )}
          </div>
        </div>

        {/* Enhanced decorative side accent with gradient animation */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-600 to-pink-600 shadow-lg shadow-purple-600/50"></div>

        {/* Floating orbs for depth */}
        <div className="absolute top-20 right-4 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-4 w-24 h-24 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #9333ea, #db2777);
        }
      `}</style>
    </>
  )
}
