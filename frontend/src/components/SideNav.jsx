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
  X,
  BookOpen,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { hasPermission, isRegularUser, isSuperAdmin, PERMISSIONS } from '../utils/permissions'

export default function SideNav({ isOpen, onClose }) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const user = authService.getUser()
  const isStudent = isRegularUser(user)
  const isSuperAdminUser = isSuperAdmin(user)

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

  const links = []
  links.push({ label: 'Dashboard', path: '/dashboard', icon: 'Dashboard' })

  if (isStudent) {
    links.push(
      { label: 'My Profile', path: '/profile', icon: 'My Profile' },
      { label: 'Academic', path: '/academic', icon: 'Academic' },
      { label: 'Resources', path: '/resources', icon: 'Resources' },
      { label: 'Analytics', path: '/analytics', icon: 'Analytics' }
    )
  } else {
    if (!isSuperAdminUser && user?.studentRef) {
      links.push(
        { label: 'My Profile', path: '/profile', icon: 'My Profile' },
        { label: 'Academic', path: '/academic', icon: 'Academic' },
        { label: 'Resources', path: '/resources', icon: 'Resources' }
      )
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) || user?.studentRef) {
      links.push({ label: 'Analytics', path: '/analytics', icon: 'Analytics' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_STUDENTS)) {
      links.push({ label: 'Students', path: '/students', icon: 'Students' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.VIEW_BIRTHDAYS)) {
      links.push({ label: 'Birthdays', path: '/birthdays', icon: 'Birthdays' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_IMPORT)) {
      links.push({ label: 'Register', path: '/register-students', icon: 'Register' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.BULK_UPDATE)) {
      links.push({ label: 'Update Data', path: '/update-students', icon: 'Update Data' })
    }
    if (!isSuperAdminUser && user?.roles?.includes('admin')) {
      links.push({ label: 'Resource Manager', path: '/admin/resources', icon: 'Resources' })
    }
    if (isSuperAdminUser || hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
      links.push({ label: 'Admin', path: '/admin', icon: 'Admin' })
    }
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

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[100] h-screen
          bg-[#0a0a0a] text-white
          transition-all duration-300 ease-out
          flex flex-col border-r border-white/5
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-20'}
          md:w-20 hover:md:w-72
          group shadow-2xl shadow-black/50
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-5 border-b border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
              <span className="text-white font-black text-xl">F</span>
            </div>

            <div className="overflow-hidden w-0 group-hover:w-auto transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">fasnet</span>
              <span className="text-xs font-bold text-gray-500 block -mt-1">Student Portal</span>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="md:hidden absolute right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {links.map((link, idx) => {
            const Icon = iconMap[link.icon] || LayoutDashboard
            const active = isActive(link.path)

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 768 && onClose()}
                onMouseEnter={() => setHoveredItem(idx)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative flex items-center h-12 px-3 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}

                <div className="w-8 flex justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${active || hoveredItem === idx ? 'scale-110' : ''}`} />
                </div>

                <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  {link.label}
                </span>

                {/* Hover Arrow */}
                <ChevronRight className={`ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${hoveredItem === idx ? 'translate-x-1' : ''}`} />
              </Link>
            )
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-3 border-t border-white/5 space-y-2">

          {/* User Info (Expanded) */}
          <div className="overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 mb-3">
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {(user?.username?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {isStudent ? 'Student' : isSuperAdminUser ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            className={`
              relative flex items-center h-12 px-3 rounded-xl transition-all duration-200
              ${isActive('/settings') ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
          >
            <div className="w-8 flex justify-center flex-shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
              Settings
            </span>
          </Link>

          {/* Logout */}
          <button
            className="w-full relative flex items-center h-12 px-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-rose-500/10 hover:text-rose-400"
            onClick={() => authService.logout()}
          >
            <div className="w-8 flex justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="ml-3 font-semibold text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}
