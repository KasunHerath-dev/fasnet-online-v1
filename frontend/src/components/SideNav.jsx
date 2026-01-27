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

    // Analytics
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) || user?.studentRef) {
      links.push({ label: 'Analytics', path: '/analytics', icon: 'Analytics' })
    }

    // Students
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
      links.push({ label: 'Students', path: '/students', icon: 'Students' })
    }

    // Birthdays
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
      links.push({ label: 'Birthdays', path: '/birthdays', icon: 'Birthdays' })
    }

    // Register (Bulk Import)
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
      links.push({ label: 'Register', path: '/register-students', icon: 'Register' })
    }

    // Update Data
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
      links.push({ label: 'Update Data', path: '/update-students', icon: 'Update Data' })
    }

    // Resource Manager
    if (!isSuperAdminUser && user?.roles?.includes('admin')) {
      links.push({ label: 'Resource Manager', path: '/admin/resources', icon: 'Resources' })
    }

    // Admin Settings
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ease-out"
          onClick={onClose}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        />
      )}

      <aside
        onMouseEnter={() => window.innerWidth >= 768 && setIsHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setIsHovered(false)}
        className={`
        fixed md:static inset-y-0 left-0 z-[100]
        ${effectiveOpen ? 'w-72' : 'w-20'}
        bg-black md:bg-black
        shadow-2xl shadow-black/50
        transform transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        overflow-hidden
        border-r border-slate-800
      `}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like easing
        }}
      >

        {/* Content wrapper */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 transition-all duration-500 ease-in-out ${!effectiveOpen ? 'justify-center w-full' : ''}`}>
                <div className="relative group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-black text-lg transition-all duration-300 group-hover:scale-110">
                    F
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${effectiveOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                    }`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <h1 className="text-white font-black text-xl tracking-tight drop-shadow-lg whitespace-nowrap">fasnet.online</h1>
                  <p className="text-slate-400 text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                    <Zap className="w-3 h-3" />
                    Student Management
                  </p>
                </div>
              </div>

              {/* Mobile close button */}
              <button
                onClick={onClose}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {links.map((link) => {
              const Icon = iconMap[link.icon] || LayoutDashboard
              const active = isActive(link.path)

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => window.innerWidth < 768 && onClose()}
                  className={`
                    group relative flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-300 ease-in-out
                    ${active
                      ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }
                    ${!effectiveOpen ? 'justify-center' : ''}
                    hover:scale-105 hover:shadow-md
                  `}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-gray-400 group-hover:text-white group-hover:scale-110'
                    }`} />

                  <span
                    className={`font-semibold text-sm truncate whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${effectiveOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                      }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {link.label}
                  </span>

                  {/* Active indicator dot */}
                  {active && effectiveOpen && (
                    <div
                      className="absolute right-3 w-2 h-2 bg-white rounded-full transition-all duration-300"
                      style={{
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    ></div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!effectiveOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-300 border border-gray-700 shadow-xl z-50 group-hover:translate-x-1">
                      {link.label}
                      {/* Arrow */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            {/* User Info Card */}
            <div
              className={`bg-gray-900 rounded-xl p-4 mb-3 border border-gray-800 overflow-hidden transition-all duration-500 ease-in-out ${effectiveOpen ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 p-0 mb-0'
                }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
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

            {/* Collapse Toggle Button */}
            <button
              onClick={toggleCollapse}
              className={`
                hidden md:flex w-full items-center justify-center gap-2 px-4 py-3 
                bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm 
                transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg
                ${!effectiveOpen ? 'px-3' : ''}
              `}
              title={isCollapsed ? 'Pin Sidebar Open' : 'Unpin Sidebar'}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className={`transition-transform duration-300 ${isCollapsed && isHovered ? 'rotate-180' : ''}`}>
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </div>
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${effectiveOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                  }`}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                Collapse
              </span>
            </button>

            {/* Copyright */}
            <p
              className={`text-gray-500 text-xs text-center mt-3 transition-all duration-500 ease-in-out overflow-hidden ${effectiveOpen ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0 mt-0'
                }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              Developed by <span className="text-gray-300 font-bold">Kasun Herath</span>
            </p>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #475569 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }

        /* Smooth transitions for all interactive elements */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  )
}
