import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { batchYearService, authService } from '../services/authService'
import BatchYearModal from './BatchYearModal'
import Dropdown from './Dropdown'

export default function StudentForm({ initialData = null, onSuccess }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [batchYears, setBatchYears] = useState([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [formData, setFormData] = useState({
    registrationNumber: '',
    fullName: '',
    nicNumber: '',
    gender: 'Male',
    birthday: '',
    whatsapp: '',
    email: '',
    address: '',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    district: '',
    nearestCity: '',
    homeTown: '',
    batchYear: new Date().getFullYear().toString(),
    course: '',
    level: 1,
    combination: '',
    degreeProgramme: '',
  })

  useEffect(() => {
    const user = authService.getCurrentUser()
    setIsSuperAdmin(user?.roles?.includes('superadmin'))
    fetchBatchYears()
    if (initialData) {
      const formattedData = { ...initialData }
      if (formattedData.birthday) {
        formattedData.birthday = new Date(formattedData.birthday).toISOString().split('T')[0]
      }
      setFormData(formattedData)
    }
  }, [initialData])

  const fetchBatchYears = async () => {
    try {
      const res = await batchYearService.getAll()
      setBatchYears(res.data.batchYears || [])
    } catch (err) {
      console.error('Failed to fetch batch years', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBatchYearCreated = (year) => {
    fetchBatchYears()
    setFormData(prev => ({ ...prev, batchYear: year }))
  }

  const handleSubmit = async (e, isUpdate = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isUpdate || initialData) {
        await api.put(`/students/${formData.registrationNumber}`, formData)
      } else {
        await api.post('/students', formData)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/students')
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, !!initialData)} className="card animate-fadeIn">
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? '✏️ Edit Student' : '➕ Add New Student'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {initialData ? 'Update student information' : 'Register a new student'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Academic Info */}
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🎓</span> Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Registration Number *</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  disabled={!!initialData}
                  className="input disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="e.g. 242001"
                />
              </div>
              <div>
                <label className="input-label">Batch Year</label>
                <div className="flex gap-2">
                  <Dropdown
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Batch' },
                      ...batchYears.map(b => ({
                        value: b.year,
                        label: `${b.name || b.year} ${b.relatedCourse ? `(${b.relatedCourse})` : ''}`
                      })),
                      // Add current value if not in list (legacy support)
                      ...(!batchYears.find(b => b.year === formData.batchYear) && formData.batchYear
                        ? [{ value: formData.batchYear, label: formData.batchYear }]
                        : [])
                    ]}
                    placeholder="Select Batch"
                    variant="default"
                    className="flex-1"
                  />
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowBatchModal(true)}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors font-bold text-xl"
                      title="Add New Batch Year"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="input-label">Degree Programme</label>
                <Dropdown
                  name="degreeProgramme"
                  value={formData.degreeProgramme}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Programme' },
                    'B.Sc. (General) Degree',
                    'B.Sc. (Joint Major) Degree',
                    'B.Sc. (Special) in Computer Science',
                    'B.Sc. (Special) in Applied Electronics',
                    'B.Sc. (Special) in Industrial Management',
                    'B.Sc. (Special) in Mathematics with Statistics'
                  ]}
                  placeholder="Select Programme"
                  variant="default"
                />
              </div>
              <div>
                <label className="input-label">Combination</label>
                <Dropdown
                  name="combination"
                  value={formData.combination}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Combination' },
                    { value: 'COMB1', label: 'COMB1: MATH & STAT + CMIS + ELTN' },
                    { value: 'COMB2', label: 'COMB2: MATH & STAT + ELTN + IMGT' },
                    { value: 'COMB3', label: 'COMB3: MATH & STAT + IMGT + CMIS' }
                  ]}
                  placeholder="Select Combination"
                  variant="default"
                />
              </div>
              <div>
                <label className="input-label">Current Level</label>
                <Dropdown
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  options={[
                    { value: 1, label: 'Level 1' },
                    { value: 2, label: 'Level 2' },
                    { value: 3, label: 'Level 3' },
                    { value: 4, label: 'Level 4' }
                  ]}
                  placeholder="Select Level"
                  variant="default"
                />
              </div>
              <div>
                <label className="input-label">A/L Z-Score</label>
                <input
                  type="number"
                  step="0.0001"
                  name="alZScore"
                  value={formData.alZScore || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 1.8543"
                />
              </div>
              <div>
                <label className="input-label">Admission Year</label>
                <input
                  type="number"
                  name="admissionYear"
                  value={formData.admissionYear || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 2023"
                />
              </div>
              <div>
                <label className="input-label">Status</label>
                <Dropdown
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={['Active', 'Graduated', 'Suspended', 'Inactive']}
                  variant="default"
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Full name with initials"
                />
              </div>
              <div>
                <label className="input-label">NIC Number</label>
                <input
                  type="text"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 200123456789"
                />
              </div>
              <div>
                <label className="input-label">Gender</label>
                <Dropdown
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={['Male', 'Female', 'Other']}
                  variant="default"
                />
              </div>
              <div>
                <label className="input-label">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="input-label">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 0771234567"
                />
              </div>
              <div>
                <label className="input-label">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 0711234567"
                />
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📍</span> Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="input"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="input-label">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Colombo"
                />
              </div>
              <div>
                <label className="input-label">Nearest City</label>
                <input
                  type="text"
                  name="nearestCity"
                  value={formData.nearestCity}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Nugegoda"
                />
              </div>
            </div>
          </div>

          {/* Guardian Info */}
          <div>
            <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👨‍👩‍👧</span> Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Guardian Name</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="input-label">Relationship</label>
                <input
                  type="text"
                  name="guardianRelationship"
                  value={formData.guardianRelationship}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Father"
                />
              </div>
              <div>
                <label className="input-label">Guardian Phone</label>
                <input
                  type="text"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 0771234567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-wrap justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          {initialData ? (
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : '💾 Update Student'}
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Registering...' : '➕ Register Student'}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Batch Year Modal */}
      {showBatchModal && (
        <BatchYearModal
          onClose={() => setShowBatchModal(false)}
          onSuccess={handleBatchYearCreated}
        />
      )}
    </>
  )
}
