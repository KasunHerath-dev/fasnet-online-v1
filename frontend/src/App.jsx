import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authService } from './services/authService'
import { ToastProvider } from './context/ToastContext'
import { IdleTimerProvider } from './context/IdleTimerContext'
import IdleWarningModal from './components/IdleWarningModal'
import TopNav from './components/TopNav'
import SideNav from './components/SideNav'
import Loader from './components/Loader'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentDashboard from './pages/StudentDashboard'
import StudentsPage from './pages/StudentsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import StudentCreatePage from './pages/StudentCreatePage'
import BirthdaysPage from './pages/BirthdaysPage'
import RegisterStudentsPage from './pages/RegisterStudentsPage'
import UpdateStudentsPage from './pages/UpdateStudentsPage'
import AdminPage from './pages/AdminPage'
import SystemUsersPage from './pages/SystemUsersPage'
import MissingStudentsPage from './pages/MissingStudentsPage'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminResourcesPage from './pages/AdminResourcesPage'
import BulkCombinationPage from './pages/BulkCombinationPage'
import StudentProfile from './pages/StudentProfile'
import StudentAcademic from './pages/StudentAcademic'
import StudentAnalytics from './pages/StudentAnalytics'
import StudentSettings from './pages/StudentSettings'
import StudentResources from './pages/StudentResources'
import PromotedUserDashboard from './pages/PromotedUserDashboard'
import ProfileRequestsPage from './pages/ProfileRequestsPage'
import ExamTimeTablePage from './pages/ExamTimeTablePage'
import { socketService } from './services/socketService'
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

// Role Protection Wrapper
function AdminRoute({ children, user }) {
  const isStudent = user?.roles?.includes('user') && !user?.roles?.includes('admin') && !user?.roles?.includes('superadmin')
  return isStudent ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Initial load
    const token = authService.getToken()
    if (token) {
      const storedUser = authService.getUser()
      setUser(storedUser)
    }
    setLoading(false)

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
    if (token) {
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
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen">
                <SideNav
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col">
                  <TopNav
                    user={user}
                    onLogout={handleLogout}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      {/* Student Routes */}
                      {isStudent && (
                        <>
                          <Route path="/dashboard" element={<StudentDashboard />} />
                          <Route path="/profile" element={<StudentProfile />} />
                          <Route path="/academic" element={<StudentAcademic />} />
                          <Route path="/resources" element={<StudentResources />} />
                          <Route path="/analytics" element={<StudentAnalytics />} />
                          <Route path="/settings" element={<StudentSettings />} />
                          <Route path="/exams" element={<ExamTimeTablePage />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          {/* Redirect any admin routes to student dashboard */}
                          <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/students/*" element={<Navigate to="/dashboard" replace />} />
                        </>
                      )}

                      {/* Promoted User Routes - See student dashboard but can access permitted admin features */}
                      {isPromotedUser && (
                        <>
                          {/* Dashboard - shows student view if they have studentRef, otherwise promoted user view */}
                          <Route
                            path="/dashboard"
                            element={user?.studentRef ? <StudentDashboard /> : <PromotedUserDashboard />}
                          />

                          {/* Student pages - only if user has studentRef */}
                          {user?.studentRef && (
                            <>
                              <Route path="/profile" element={<StudentProfile />} />
                              <Route path="/academic" element={<StudentAcademic />} />
                              <Route path="/resources" element={<StudentResources />} />
                              <Route path="/analytics" element={<StudentAnalytics />} />
                              <Route path="/settings" element={<StudentSettings />} />
                              <Route path="/exams" element={<ExamTimeTablePage />} />
                            </>
                          )}

                          {/* Admin features - accessible based on permissions */}
                          <Route path="/students" element={<StudentsPage />} />
                          <Route path="/students/new" element={<StudentCreatePage />} />
                          <Route path="/students/:registrationNumber" element={<StudentDetailPage />} />
                          <Route path="/birthdays" element={<BirthdaysPage />} />
                          <Route path="/profile-requests" element={<ProfileRequestsPage />} />
                          <Route path="/register-students" element={<RegisterStudentsPage />} />
                          <Route path="/update-students" element={<UpdateStudentsPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/admin/users" element={<SystemUsersPage />} />
                          <Route path="/admin/resources" element={<AdminResourcesPage />} />
                          <Route path="/admin/bulk-combination" element={<BulkCombinationPage />} />
                          <Route path="/admin/analytics" element={<AdminAnalytics />} />

                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </>
                      )}

                      {/* Superadmin Routes - Full admin dashboard */}
                      {isSuperAdmin && (
                        <>
                          <Route path="/dashboard" element={<DashboardPage />} />
                          <Route path="/analytics" element={<AdminAnalytics />} />
                          <Route path="/students" element={<StudentsPage />} />
                          <Route path="/students/new" element={<StudentCreatePage />} />
                          <Route path="/students/:registrationNumber" element={<StudentDetailPage />} />
                          <Route path="/birthdays" element={<BirthdaysPage />} />
                          <Route path="/profile-requests" element={<ProfileRequestsPage />} />
                          <Route path="/register-students" element={<RegisterStudentsPage />} />
                          <Route path="/update-students" element={<UpdateStudentsPage />} />
                          <Route path="/missing-students" element={<MissingStudentsPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/admin/users" element={<SystemUsersPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/admin/resources" element={<AdminResourcesPage />} />
                          <Route path="/admin/users" element={<SystemUsersPage />} />
                          <Route path="/admin/analytics" element={<AdminAnalytics />} />
                          <Route path="/admin/bulk-combination" element={<BulkCombinationPage />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          {/* Redirect any student-only routes to admin dashboard */}
                          <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/academic" element={<Navigate to="/dashboard" replace />} />
                        </>
                      )}
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
