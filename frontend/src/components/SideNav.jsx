import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useState, useEffect } from 'react'
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
  const [isHovered, setIsHovered] = useState(false)

  // Determine if the sidebar is effectively open (visually expanded)
  // Expanded if: Not collapsed (Pinned Open) OR Hovered (Temporarily Open)
  const effectiveOpen = !isCollapsed || isHovered

  // Default to collapsed on desktop on initial load
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(true)
    }
  }, [])

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
      {/* Monochrome Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[90] md:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
        fixed md:static inset-y-0 left-0 z-[100]
        ${effectiveOpen ? 'w-64 lg:w-72' : 'w-20'}
        bg-black
        shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        overflow-hidden
        border-r border-mono-border
      `}>

        {/* Content wrapper */}
        <div className="relative h-full flex flex-col">
          {/* Header - Monochrome */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-all duration-300 ${!effectiveOpen ? 'justify-center w-full' : ''}`}>
                <div className="relative group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-lg transition-all duration-300">
                    F
                  </div>
                </div>

                {effectiveOpen && (
                  <div className="animate-fadeIn">
                    <h1 className="text-white font-black text-xl tracking-tight drop-shadow-lg">fasnet.online</h1>
                    <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
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

          {/* Navigation Links - Monochrome */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {links.map((link) => {
              const Icon = iconMap[link.icon] || LayoutDashboard
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${active
                      ? 'bg-mono-hover text-white'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }
                    ${!effectiveOpen ? 'justify-center' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />

                  {effectiveOpen && (
                    <>
                      <span className="font-semibold text-sm truncate animate-fadeIn">{link.label}</span>
                      {active && (
                        <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state - Only show if effectively closed (not hovered) */}
                  {!effectiveOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity border border-gray-700 z-50">
                      {link.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer - Monochrome */}
          <div className="p-4 border-t border-slate-800 dark:border-white/5">
            {effectiveOpen && (
              <div className="bg-gray-900 rounded-xl p-4 mb-3 border border-gray-800 animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {(user?.studentRef?.firstName && user?.studentRef?.lastName)
                        ? `${user.studentRef.firstName} ${user.studentRef.lastName}`
                        : (user?.username || 'User')}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {isStudent ? 'Student' : isSuperAdminUser ? 'Super Admin' : 'Administrator'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Collapse Toggle Button - Monochrome */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-mono-hover text-white rounded-xl font-semibold text-sm transition-all"
              title={isCollapsed ? 'Pin Sidebar Open' : 'Unpin Sidebar'}
            >
              {isCollapsed ? (
                /* Collapsed (Pinned Closed) -> Show Expand Icon */
                <ChevronRight className="w-5 h-5" />
              ) : (
                /* Expanded (Pinned Open) -> Show Collapse Icon */
                <>
                  <ChevronLeft className="w-5 h-5" />
                  {effectiveOpen && <span>Collapse</span>}
                </>
              )}
            </button>

            {/* Copyright */}
            {effectiveOpen && (
              <p className="text-gray-500 text-xs text-center mt-3 animate-fadeIn">
                Developed by <span className="text-gray-300 font-bold">Kasun Herath</span>
              </p>
            )}
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569; /* Slate-600 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155; /* Slate-700 */
        }
      `}</style>
    </>
  )
}
