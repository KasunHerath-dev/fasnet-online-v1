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
  PieChart,
  LogOut,
  HelpCircle,
  Calendar
} from 'lucide-react'
import { hasPermission, isRegularUser, isSuperAdmin, PERMISSIONS } from '../utils/permissions'

export default function SideNav({ isOpen, onClose }) {
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true) // Default to collapsed for the "icon-only" look

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
    links.push(
      { label: 'My Profile', path: '/profile', icon: 'My Profile' },
      { label: 'Academic', path: '/academic', icon: 'Academic' },
      { label: 'Resources', path: '/resources', icon: 'Resources' },
      { label: 'Analytics', path: '/analytics', icon: 'Analytics' },
      // { label: 'Settings', path: '/settings', icon: 'Settings' } // Move Settings to bottom
    )
  } else {
    // Admin links...
    if (!isSuperAdminUser && user?.studentRef) {
      links.push(
        { label: 'My Profile', path: '/profile', icon: 'My Profile' },
        { label: 'Academic', path: '/academic', icon: 'Academic' },
        { label: 'Resources', path: '/resources', icon: 'Resources' },
        // { label: 'Settings', path: '/settings', icon: 'Settings' }
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
          bg-[#121212] text-white
          transition-all duration-300 ease-in-out
          flex flex-col border-r border-[#222]
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-20'}
          md:w-20 hover:md:w-64
          group
        `}
      >
        {/* Logo / Brand */}
        <div className="h-20 flex items-center justify-center border-b border-[#222]">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xl">F.</span>
          </div>

          <div className="ml-3 overflow-hidden w-0 group-hover:w-auto transition-all duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            <span className="font-bold text-lg tracking-tight">fasnet.</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const Icon = iconMap[link.icon] || LayoutDashboard
            const active = isActive(link.path)

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={`
                  relative flex items-center h-12 px-3 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                    : 'text-gray-400 hover:bg-[#222] hover:text-white'
                  }
                `}
              >
                <div className="w-8 flex justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>

                <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                  {link.label}
                </span>

                {/* Tooltip for collapsed mode (only shows if NOT hovering sidebar) */}
                <div className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-0 peer-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {link.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#222] space-y-2">

          {/* Settings (Fixed position at bottom) */}
          <Link
            to="/settings"
            className={`
                  relative flex items-center h-12 px-3 rounded-xl transition-all duration-200
                  ${isActive('/settings') ? 'bg-[#222] text-white' : 'text-gray-400 hover:bg-[#222] hover:text-white'}
                `}
          >
            <div className="w-8 flex justify-center flex-shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
              Settings
            </span>
          </Link>

          {/* Logout (Red hover) */}
          <button
            className="w-full relative flex items-center h-12 px-3 rounded-xl transition-all duration-200 text-gray-400 hover:bg-rose-500/10 hover:text-rose-500"
            onClick={() => authService.logout()}
          >
            <div className="w-8 flex justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 transition-all duration-300">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
