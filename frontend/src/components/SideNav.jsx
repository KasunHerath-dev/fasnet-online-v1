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
  Menu,
  X,
  BookOpen
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-[100]
        ${isCollapsed ? 'w-20' : 'w-64 lg:w-72'}
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
        shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        overflow-hidden
      `}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 pointer-events-none"></div>

        {/* Content wrapper */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="relative group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                    F
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                </div>
                {!isCollapsed && (
                  <div className="animate-fadeIn">
                    <h1 className="text-white font-black text-xl tracking-tight">fasnet.online</h1>
                    <p className="text-indigo-300 text-xs font-medium">Student Management</p>
                  </div>
                )}
              </div>

              {/* Mobile close button */}
              <button
                onClick={onClose}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
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
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-105'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  onClick={() => onClose && onClose()}
                  title={isCollapsed ? link.label : ''}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}

                  {/* Icon */}
                  <div className={`flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span className="font-semibold text-sm truncate animate-fadeIn">
                      {link.label}
                    </span>
                  )}

                  {/* Hover glow effect */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            {!isCollapsed && (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3 animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {user?.username || 'User'}
                    </p>
                    <p className="text-indigo-300 text-xs truncate">
                      {isStudent ? 'Student' : isSuperAdminUser ? 'Super Admin' : 'Administrator'}
                    </p>
                  </div>
                </div>

                {/* User Actions */}
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
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

            {/* Copyright */}
            {!isCollapsed && (
              <p className="text-gray-500 text-xs text-center mt-3 animate-fadeIn">
                Developed by Kasun Herath
              </p>
            )}
          </div>
        </div>

        {/* Decorative side accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-600 to-pink-600"></div>
      </aside>

    </>
  )
}
