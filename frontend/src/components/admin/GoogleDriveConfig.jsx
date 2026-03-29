import React, { useState } from 'react'
import {
  CloudArrowUp, Folder, HardDrive, CheckCircle, WarningCircle,
  CaretRight, FloppyDisk, Spinner, Cloud, UploadSimple, Key,
  ShieldCheck, ArrowClockwise, IdentificationBadge, Keyhole
} from '@phosphor-icons/react'
import api from '../../services/api'

const T = {
  bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0',
  text: '#0f172a', textMid: '#334155', textSub: '#64748b', textMuted: '#94a3b8',
}

const Step = ({ num, label, active, done }) => (
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all"
      style={{
        background: done ? '#10b981' : active ? '#6366f1' : '#e2e8f0',
        color: done || active ? '#fff' : T.textMuted,
        boxShadow: active ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
      }}>
      {done ? <CheckCircle size={13} weight="fill" /> : num}
    </div>
    <span className="text-xs font-semibold" style={{ color: done || active ? T.text : T.textMuted }}>{label}</span>
  </div>
)

const Divider = () => <div className="flex-1 h-px mx-1" style={{ background: T.border }} />

/* ─── FolderItem ─── */
const FolderItem = ({ item, selected, onSelect }) => {
  const isShared = item.isSharedDrive
  const color = isShared ? '#7c3aed' : '#6366f1'
  const isSelected = selected?.id === item.id

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
      style={{
        background: isSelected ? `${color}10` : T.card,
        border: `1px solid ${isSelected ? `${color}40` : T.border}`,
        boxShadow: isSelected ? `0 2px 12px ${color}15` : 'none',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isSelected ? `${color}15` : '#f8fafc',
          border: `1px solid ${isSelected ? `${color}30` : T.border}`,
        }}
      >
        {isShared
          ? <HardDrive size={18} weight="duotone" style={{ color }} />
          : <Folder size={18} weight="duotone" style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: isSelected ? T.text : T.textMid }}>
          {item.name}
        </p>
        <p className="text-[10px] font-mono truncate" style={{ color: isSelected ? color : T.textMuted }}>
          {item.id}
        </p>
      </div>
      {isShared && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          Shared
        </span>
      )}
      {isSelected && <CheckCircle size={18} weight="fill" style={{ color }} className="flex-shrink-0" />}
    </button>
  )
}

/* ─── Main Component ─── */
const GoogleDriveConfig = () => {
  const [jsonFile, setJsonFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  
  // Auth Modes
  const [authMode, setAuthMode] = useState('oauth2') // 'oauth2' or 'service_account'
  const [oauthData, setOauthData] = useState({ clientId: '', clientSecret: '', refreshToken: '' })

  const isReadyToScan = authMode === 'oauth2' 
    ? (oauthData.clientId && oauthData.clientSecret && oauthData.refreshToken)
    : !!jsonFile;

  const currentStep = success ? 4 : scanResult ? 3 : isReadyToScan ? 2 : 1

  const handleFileSelect = (file) => {
    if (!file?.name.endsWith('.json')) {
      setError('Please select a valid .json file.')
      return
    }
    setJsonFile(file)
    setScanResult(null)
    setSelectedFolder(null)
    setError(null)
    setSuccess(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleScan = async () => {
    if (!isReadyToScan) return
    setScanning(true)
    setError(null)
    const form = new FormData()
    
    if (authMode === 'service_account') {
      form.append('credentials', jsonFile)
    } else {
      form.append('clientId', oauthData.clientId)
      form.append('clientSecret', oauthData.clientSecret)
      form.append('refreshToken', oauthData.refreshToken)
    }

    try {
      const res = await api.post('/settings/drive/scan', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.success) {
        setScanResult(res.data)
      } else {
        setError(res.data.message || 'Scan failed.')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Could not connect to Google Drive API.')
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async () => {
    if (!scanResult || !selectedFolder) return
    setSaving(true)
    setError(null)
    try {
      const res = await api.post('/settings/drive/save', {
        credentialsRaw: scanResult.credentialsRaw,
        folderId: selectedFolder.id,
        sharedDriveId: selectedFolder.isSharedDrive ? selectedFolder.id : null
      })
      if (res.data.success) {
        setSuccess('Google Drive configuration saved! The backend will apply changes on next restart.')
      } else {
        setError(res.data.message || 'Save failed.')
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setJsonFile(null)
    setOauthData({ clientId: '', clientSecret: '', refreshToken: '' })
    setScanResult(null)
    setSelectedFolder(null)
    setError(null)
    setSuccess(null)
  }

  const allFolders = [
    ...(scanResult?.drives || []),
    ...(scanResult?.folders || []),
  ]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        className="p-5 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
          >
            <Cloud size={18} weight="duotone" className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: T.text }}>Google Drive Configuration</h3>
            <p className="text-[10px]" style={{ color: T.textSub }}>Connect an OAuth Token or Service Account</p>
          </div>
        </div>
        {(isReadyToScan || scanResult) && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
            style={{ color: T.textSub }}
          >
            <ArrowClockwise size={13} />
            Reset
          </button>
        )}
      </div>

      {/* Step Progress */}
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#f8fafc', borderBottom: `1px solid ${T.border}` }}>
        <Step num={1} label="Credentials" active={currentStep === 1} done={currentStep > 1} />
        <Divider />
        <Step num={2} label="Connect & Scan" active={currentStep === 2} done={currentStep > 2} />
        <Divider />
        <Step num={3} label="Select Folder" active={currentStep === 3} done={currentStep > 3} />
        <Divider />
        <Step num={4} label="Save Config" active={false} done={currentStep >= 4} />
      </div>

      <div className="p-5 space-y-5">
        {/* Alert: Error */}
        {error && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-xl"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <WarningCircle size={16} weight="fill" className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-snug">{error}</p>
          </div>
        )}

        {/* Alert: Success */}
        {success && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-xl"
            style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
          >
            <ShieldCheck size={16} weight="fill" className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 leading-snug">{success}</p>
          </div>
        )}

        {/* Step 1: Credentials Input */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1 border-b pb-2" style={{ borderColor: T.border }}>
            Step 1 — Authentication Method
          </label>
          
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => { setAuthMode('oauth2'); reset(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${authMode === 'oauth2' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              OAuth 2.0 (Personal Drive)
            </button>
            <button 
              onClick={() => { setAuthMode('service_account'); reset(); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${authMode === 'service_account' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
            >
              Service Account (Shared Drive)
            </button>
          </div>

          {authMode === 'oauth2' ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-start gap-2 mb-2">
                <IdentificationBadge size={16} weight="duotone" className="text-indigo-500 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-medium">Bypass Google's 0GB limit by delegating access directly to your personal Drive using an OAuth Refresh Token.</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Client ID</label>
                <input 
                  type="text" 
                  value={oauthData.clientId}
                  onChange={e => setOauthData({...oauthData, clientId: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-400 outline-none transition-colors"
                  placeholder="e.g. 8342...apps.googleusercontent.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Client Secret</label>
                <input 
                  type="password" 
                  value={oauthData.clientSecret}
                  onChange={e => setOauthData({...oauthData, clientSecret: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-400 outline-none transition-colors"
                  placeholder="GOCSPX-..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Refresh Token</label>
                <input 
                  type="password" 
                  value={oauthData.refreshToken}
                  onChange={e => setOauthData({...oauthData, refreshToken: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-indigo-400 outline-none transition-colors"
                  placeholder="1//04rhq..."
                />
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-xl p-6 text-center transition-all cursor-pointer mt-2"
              style={{
                border: `2px dashed ${dragOver ? '#6366f1' : jsonFile ? '#10b981' : T.border}`,
                background: dragOver
                  ? '#6366f108'
                  : jsonFile
                  ? '#10b98105'
                  : '#f8fafc',
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".json"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {jsonFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
                  >
                    <Key size={22} weight="duotone" className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#059669' }}>{jsonFile.name}</p>
                  <p className="text-[10px]" style={{ color: T.textSub }}>
                    {(jsonFile.size / 1024).toFixed(1)} KB · Ready to scan
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center opacity-60"
                    style={{ background: '#eef2ff' }}
                  >
                    <UploadSimple size={22} weight="duotone" className="text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: T.textMid }}>
                    Drop your Service Account JSON here
                  </p>
                  <p className="text-[10px]" style={{ color: T.textMuted }}>or click to browse · .json files only</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Scan Button */}
        {isReadyToScan && !scanResult && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
              Step 2 — Authenticate & Discover
            </label>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: scanning ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
              }}
            >
              {scanning
                ? <><Spinner size={16} className="animate-spin" /> Connecting to Google Drive…</>
                : <><Cloud size={16} weight="fill" /> Connect & Scan Drive</>}
            </button>
          </div>
        )}

        {/* Step 3: Folder Selection */}
        {scanResult && !success && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            {/* Auth Badge */}
            <div
              className="flex items-center gap-2 p-3 rounded-xl mb-4"
              style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-xs font-medium" style={{ color: '#065f46' }}>
                Authenticated as <span className="font-mono font-bold">{scanResult.account?.email}</span>
              </p>
            </div>

            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">
              Step 3 — Select Target Folder
            </label>
            
            {/* Quota Warning Badge */}
            <div className="mb-4 p-3 rounded-xl flex items-start gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <WarningCircle size={18} weight="fill" className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-amber-900">Quota Limitation Warning</p>
                <p className="text-[10px] text-amber-800 leading-relaxed mt-0.5">
                  Service Accounts have <b>0GB storage</b> on "My Drive". For large migrations, you MUST select a <b>Shared Drive</b> (Team Drive) or a folder inside one where the service account has member access.
                </p>
              </div>
            </div>

            <p className="text-[11px] mb-3" style={{ color: T.textSub }}>
              Choose the root folder where FASNet will create the Level/Semester/Module hierarchy.
            </p>

            {allFolders.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed text-sm" style={{ border: `1px dashed ${T.border}`, color: T.textMuted }}>
                No accessible folders or Shared Drives found for this service account.
              </div>
            ) : (
              <div
                className="space-y-2 max-h-60 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
              >
                {allFolders.map((item) => (
                  <FolderItem
                    key={item.id}
                    item={item}
                    selected={selectedFolder}
                    onSelect={setSelectedFolder}
                  />
                ))}
              </div>
            )}

            {selectedFolder && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                <div className="p-3 rounded-xl text-xs flex flex-col gap-0.5" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold" style={{ color: '#4338ca' }}>
                      Selected: <span className="font-normal">{selectedFolder.name}</span>
                    </p>
                    {selectedFolder.isSharedDrive && (
                      <span className="text-[9px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">SHARED DRIVE ACTIVE</span>
                    )}
                  </div>
                  <p className="font-mono mt-1" style={{ color: T.textSub }}>ID: {selectedFolder.id}</p>
                </div>
                
                {!selectedFolder.isSharedDrive && (
                  <p className="text-[9px] mt-2 px-1 leading-relaxed" style={{ color: T.textMuted }}>
                    💡 <b>Tip:</b> If this folder is inside a Shared Drive, the system will use the Shared Drive's quota automatically if permissions are set.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!selectedFolder || saving}
              className="w-full mt-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{
                background: selectedFolder ? 'linear-gradient(135deg, #10b881, #059669)' : '#f1f5f9',
                color: selectedFolder ? '#fff' : T.textMuted,
                boxShadow: selectedFolder ? '0 4px 15px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {saving
                ? <><Spinner size={16} className="animate-spin text-white" /> Saving Configuration…</>
                : <><FloppyDisk size={16} weight="fill" /> Save Configuration</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoogleDriveConfig
