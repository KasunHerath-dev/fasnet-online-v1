import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import StudentForm from '../components/StudentForm'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import AcademicProfile from '../components/AcademicProfile'
import { authService } from '../services/authService'
import Loader from '../components/Loader'

export default function StudentDetailPage() {
  const { registrationNumber } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    setCurrentUser(authService.getUser())
  }, [])

  const handleUnlockCombination = async () => {
    if (!window.confirm("Are you sure you want to unlock this student's combination?")) return
    try {
      await authService.unlockCombination({ studentId: student._id })
      alert('Combination unlocked successfully')
      fetchStudent()
    } catch (err) {
      alert('Failed to unlock: ' + (err.response?.data?.message || err.message))
    }
  }

  const isAdmin = currentUser?.roles?.includes('admin') || currentUser?.roles?.includes('superadmin')

  useEffect(() => {
    fetchStudent()
  }, [registrationNumber])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/students/${registrationNumber}`)
      setStudent(response.data.student)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch student details')
    } finally {
      setLoading(false)
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${registrationNumber}`)
      navigate('/students')
    } catch (err) {
      alert('Failed to delete student')
    }
  }

  if (loading) return <Loader />
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!student) return <div className="p-6">Student not found</div>

  if (isEditing) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={() => setIsEditing(false)}
            className="text-blue-600 hover:underline mb-4"
          >
            &larr; Back to Details
          </button>
          <StudentForm
            initialData={student}
            onSuccess={() => {
              setIsEditing(false)
              fetchStudent()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
          <p className="text-gray-500">{student.registrationNumber} • {student.batchYear}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && student.isCombinationLocked && (
            <button
              onClick={handleUnlockCombination}
              className="px-4 py-2 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 font-medium flex items-center gap-2"
              title="Unlock Subject Combination"
            >
              <span className="text-lg">🔓</span> Unlock
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['personal', 'academic', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">NIC Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.nicNumber || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.gender || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Birthday</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {student.birthday ? new Date(student.birthday).toLocaleDateString() : '-'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.whatsapp || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{student.address || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {[student.nearestCity, student.district].filter(Boolean).join(', ')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-2 border-t pt-6 mt-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.guardianName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.guardianRelationship || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{student.guardianPhone || '-'}</dd>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <AcademicProfile studentId={student._id} />
        )}

        {activeTab === 'activity' && (
          <div className="text-center py-12 text-gray-500">
            <p>Activity logs coming soon</p>
            <p className="text-sm mt-2">Imported on: {new Date(student.importedAt).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}
