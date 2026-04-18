import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/authService'
import { ToastProvider } from './context/ToastContext'
import { IdleTimerProvider } from './context/IdleTimerContext'
import IdleWarningModal from './components/IdleWarningModal'
import Loader from './components/Loader'
import UnifiedPageLoader from './components/loaders/UnifiedPageLoader'
import LoginPage from './pages/LoginPage'
import AdminLayout from './layouts/AdminLayout'

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'
import AdminResources from './pages/admin/AdminResources'
import StorageManagement from './pages/admin/StorageManagement'
import PromotedUserDashboard from './pages/admin/PromotedUserDashboard'
import ExamTimeTablePage from './pages/admin/ExamTimeTablePage'
import AdminNoticesPage from './pages/admin/AdminNoticesPage'
import LmsAdminPage from './pages/admin/LmsAdminPage'
// Admin > Student Management
import StudentsPage from './pages/admin/Students/StudentsPage'
import StudentDetailPage from './pages/admin/Students/StudentDetailPage'
import StudentCreatePage from './pages/admin/Students/StudentCreatePage'
import BirthdaysPage from './pages/admin/Students/BirthdaysPage'
import RegisterStudentsPage from './pages/admin/Students/RegisterStudentsPage'
import UpdateStudentsPage from './pages/admin/Students/UpdateStudentsPage'
import MissingStudentsPage from './pages/admin/Students/MissingStudentsPage'
import ProfileRequestsPage from './pages/admin/Students/ProfileRequestsPage'
import BulkCombinationPage from './pages/admin/Students/BulkCombinationPage'

// Student Portal
import { socketService } from './services/socketService'
import LayoutWrapper from './components/student/layout/LayoutWrapper'

// Lazy Load Student Pages
// Student Portal — Direct Imports (Fix for lazy load redirect issues)
import Dashboard from './pages/student/StudentDashboard'
import AcademicGrowth from './pages/student/AcademicGrowth'
import StudentLearning from './pages/student/StudentLearning'
import SettingsProfile from './pages/student/SettingsProfile'
import StudentSchedule from './pages/student/StudentSchedule'
import NoticesPage from './pages/student/NoticesPage'
import './styles/globals.css'

function ProtectedRoute({ children }) {
  const token = authService.getToken()
  const storedUser = authService.getUser()
  if (token) {
    // Validation check if needed
  }
  return token ? (
    <ToastProvider>
      <IdleTimerProvider>
        <IdleWarningModal />
        {children}
      </IdleTimerProvider>
    </ToastProvider>
  ) : <Navigate to="/login" />
}

// Role-based protection wrapper
function RoleProtectedRoute({ children, roles, user }) {
  if (!user) return <div className="h-screen w-screen flex items-center justify-center bg-[#f7f7f5]"><UnifiedPageLoader /></div>
  
  const hasAccess = roles.some(role => user.roles?.includes(role))
  if (hasAccess) return children

  // If unauthorized, redirect to their primary dashboard
  if (user.roles?.includes('superadmin')) {
    return <Navigate to="/dashboard" replace />
  }
  
  const regNum = user.studentRef?.registrationNumber || user.username || 'user'
  return <Navigate to={`/${regNum}/dashboard`} replace />
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Initial load
    const initAuth = async () => {
      const token = authService.getToken()
      if (token) {
        // Load from local storage first for fast response
        const storedUser = authService.getUser()
        setUser(storedUser)

        // Then refresh from backend to ensure data (like profile setup flag) is accurate
        try {
          const res = await authService.getCurrentUser()
          if (res.data && res.data.user) {
            authService.setUser(res.data.user)
          }
        } catch (err) {
          console.error('Failed to refresh user session', err)
          if (err.response?.status === 401) {
            authService.logout()
            setUser(null)
          }
        }
      }
      setLoading(false)
    }

    initAuth()

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((updatedUser) => {
      setUser(updatedUser)
      if (updatedUser) {
        socketService.connect()
      } else {
        socketService.disconnect()
      }
    })

    // Connect if already logged in
    if (authService.getToken()) {
      socketService.connect()
    }

    return () => {
      unsubscribe()
      socketService.disconnect()
    }
  }, [])

  // Handle Dark Mode
  useEffect(() => {
    if (user?.preferences?.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [user?.preferences?.darkMode])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    socketService.disconnect()
  }

  if (loading) {
    return <Loader />
  }

  const isStudent = user?.roles?.includes('user') && !user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')
  const isSuperAdmin = user?.roles?.includes('superadmin')
  const isPromotedUser = user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <IdleTimerProvider>
          <IdleWarningModal />
          <Suspense fallback={<UnifiedPageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* ── Student Routes ── */}
              <Route element={<ProtectedRoute><LayoutWrapper /></ProtectedRoute>}>
                <Route path="/:id/dashboard" element={<Dashboard />} />
                <Route path="/:id/academics" element={<AcademicGrowth />} />
                <Route path="/:id/learning" element={<StudentLearning />} />
                <Route path="/:id/schedule" element={<StudentSchedule />} />
                <Route path="/:id/profile" element={<SettingsProfile />} />
                <Route path="/:id/notices" element={<NoticesPage />} />
                {/* Root Redirect Logic */}
                <Route path="/" element={<Navigate to={isSuperAdmin ? "/dashboard" : `/${user?.studentRef?.registrationNumber || user?.username || 'user'}/dashboard`} replace />} />
              </Route>

              {/* ── Admin / Superadmin Shared UI ── */}
              <Route element={<ProtectedRoute><RoleProtectedRoute roles={['admin', 'superadmin']} user={user}><AdminLayout user={user} onLogout={handleLogout} /></RoleProtectedRoute></ProtectedRoute>}>
                {/* Dashboard & Analytics */}
                <Route path="/dashboard" element={<RoleProtectedRoute roles={['superadmin']} user={user}><AdminDashboard /></RoleProtectedRoute>} />
                <Route path="/analytics" element={<RoleProtectedRoute roles={['superadmin']} user={user}><AdminAnalytics /></RoleProtectedRoute>} />

                {/* Student Management */}
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/new" element={<StudentCreatePage />} />
                <Route path="/students/:regNum" element={<StudentDetailPage />} />
                <Route path="/register-students" element={<RegisterStudentsPage />} />
                <Route path="/update-students" element={<UpdateStudentsPage />} />
                <Route path="/birthdays" element={<BirthdaysPage />} />
                <Route path="/missing-students" element={<MissingStudentsPage />} />
                <Route path="/profile-requests" element={<ProfileRequestsPage />} />
                
                {/* Admin Tools */}
                <Route path="/admin" element={<AdminSettings />} />
                <Route path="/admin/notices" element={<AdminNoticesPage />} />
                <Route path="/admin/lms" element={<RoleProtectedRoute roles={['superadmin']} user={user}><LmsAdminPage /></RoleProtectedRoute>} />
                <Route path="/admin/storage" element={<RoleProtectedRoute roles={['superadmin']} user={user}><StorageManagement /></RoleProtectedRoute>} />
                <Route path="/admin/users" element={<RoleProtectedRoute roles={['superadmin']} user={user}><AdminUsers /></RoleProtectedRoute>} />
                <Route path="/admin/bulk-combination" element={<BulkCombinationPage />} />
                <Route path="/admin/resources" element={<AdminResources />} />
                <Route path="/admin/exams" element={<ExamTimeTablePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </IdleTimerProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
