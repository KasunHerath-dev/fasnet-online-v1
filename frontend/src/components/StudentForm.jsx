import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { batchYearService, authService } from '../services/authService'
import BatchYearModal from './BatchYearModal'
import Dropdown from './Dropdown'
import {
  User,
  Calendar,
  MapPin,
  Users,
  Save,
  X,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Hash,
  Plus
} from 'lucide-react'

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
    alZScore: '', // Added missing field init
    admissionYear: '', // Added missing field init
    contactNumber: '', // Added missing field init
    status: 'Active' // Added missing field init
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

  // Helper for input classes
  const inputParams = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-stitch-blue/50 focus:border-stitch-blue transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-400"
  const labelParams = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1"

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, !!initialData)} className="bg-white dark:bg-stitch-card-dark rounded-[2rem] shadow-xl p-8 border border-white/20 animate-fadeIn relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-stitch-blue/5 dark:bg-stitch-blue/10 rounded-bl-[4rem] pointer-events-none"></div>

        <div className="relative border-b border-slate-100 dark:border-white/10 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              {initialData ? (
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FileText className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-stitch-blue/10 dark:bg-stitch-blue/20 rounded-xl flex items-center justify-center text-stitch-blue">
                  <Plus className="w-6 h-6" />
                </div>
              )}
              {initialData ? 'Edit Student Details' : 'Registration Form'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-[3.25rem]">
              {initialData ? 'Update the students information below' : 'Please fill in the details to register a new student'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl mb-8 flex items-center gap-3 font-medium animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <div className="space-y-10">
          {/* Academic Info */}
          <div className="relative">
            <h3 className="text-lg font-black text-stitch-blue uppercase tracking-wide mb-6 flex items-center gap-3">
              <div className="p-2 bg-stitch-blue/10 rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelParams}>Registration Number *</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    disabled={!!initialData}
                    className={`${inputParams} pl-12 disabled:opacity-60 disabled:cursor-not-allowed`}
                    placeholder="e.g. 242001"
                  />
                </div>
              </div>
              <div>
                <label className={labelParams}>Batch Year</label>
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
                      className="px-4 bg-stitch-blue/10 text-stitch-blue dark:bg-stitch-blue/20 hover:bg-stitch-blue hover:text-white rounded-xl transition-all duration-200 font-bold text-xl h-[50px] w-[50px] flex items-center justify-center shadow-sm hover:shadow-md"
                      title="Add New Batch Year"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className={labelParams}>Degree Programme</label>
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
                <label className={labelParams}>Combination</label>
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
                <label className={labelParams}>Current Level</label>
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
                <label className={labelParams}>A/L Z-Score</label>
                <input
                  type="number"
                  step="0.0001"
                  name="alZScore"
                  value={formData.alZScore || ''}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. 1.8543"
                />
              </div>
              <div>
                <label className={labelParams}>Admission Year</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    name="admissionYear"
                    value={formData.admissionYear || ''}
                    onChange={handleChange}
                    className={`${inputParams} pl-12`}
                    placeholder="e.g. 2023"
                  />
                </div>
              </div>
              <div>
                <label className={labelParams}>Status</label>
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

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

          {/* Personal Info */}
          <div className="relative">
            <h3 className="text-lg font-black text-stitch-blue uppercase tracking-wide mb-6 flex items-center gap-3">
              <div className="p-2 bg-stitch-blue/10 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelParams}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={inputParams}
                  placeholder="Full name with initials"
                />
              </div>
              <div>
                <label className={labelParams}>NIC Number</label>
                <input
                  type="text"
                  name="nicNumber"
                  value={formData.nicNumber}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. 200123456789"
                />
              </div>
              <div>
                <label className={labelParams}>Gender</label>
                <Dropdown
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={['Male', 'Female', 'Other']}
                  variant="default"
                />
              </div>
              <div>
                <label className={labelParams}>Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className={inputParams}
                />
              </div>
              <div>
                <label className={labelParams}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputParams} pl-12`}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className={labelParams}>WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className={`${inputParams} pl-12`}
                    placeholder="e.g. 0771234567"
                  />
                </div>
              </div>
              <div>
                <label className={labelParams}>Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber || ''}
                    onChange={handleChange}
                    className={`${inputParams} pl-12`}
                    placeholder="e.g. 0711234567"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

          {/* Location Info */}
          <div className="relative">
            <h3 className="text-lg font-black text-stitch-blue uppercase tracking-wide mb-6 flex items-center gap-3">
              <div className="p-2 bg-stitch-blue/10 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelParams}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className={inputParams}
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className={labelParams}>District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. Colombo"
                />
              </div>
              <div>
                <label className={labelParams}>Nearest City</label>
                <input
                  type="text"
                  name="nearestCity"
                  value={formData.nearestCity}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. Nugegoda"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

          {/* Guardian Info */}
          <div className="relative">
            <h3 className="text-lg font-black text-stitch-blue uppercase tracking-wide mb-6 flex items-center gap-3">
              <div className="p-2 bg-stitch-blue/10 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelParams}>Guardian Name</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className={labelParams}>Relationship</label>
                <input
                  type="text"
                  name="guardianRelationship"
                  value={formData.guardianRelationship}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. Father"
                />
              </div>
              <div>
                <label className={labelParams}>Guardian Phone</label>
                <input
                  type="text"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  className={inputParams}
                  placeholder="e.g. 0771234567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-4 mt-10 pt-8 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-stitch-blue to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {initialData ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {initialData ? 'Update Student' : 'Register Student'}
              </>
            )}
          </button>
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
