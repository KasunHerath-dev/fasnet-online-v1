import React, { useState, useEffect } from 'react'
import {
  Folder, FileText, MagnifyingGlass,
  CaretRight, ArrowLeft, Spinner, ArrowClockwise,
  WarningCircle, Cloud, Database, FolderOpen
} from '@phosphor-icons/react'
import api from '../../services/api'

const T = {
  bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0',
  text: '#0f172a', textMid: '#334155', textSub: '#64748b', textMuted: '#94a3b8',
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '—'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const getFileMeta = (mimeType) => {
  if (!mimeType) return { color: '#64748b' }
  if (mimeType.includes('image')) return { color: '#8b5cf6' }
  if (mimeType.includes('pdf')) return { color: '#ef4444' }
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) return { color: '#10b981' }
  if (mimeType.includes('document') || mimeType.includes('word')) return { color: '#3b82f6' }
  return { color: '#6366f1' }
}

const FileCard = ({ file, isFolder, onClick, provider }) => {
  const meta = getFileMeta(file.mimeType)
  const folderColor = provider === 'mega' ? '#f97316' : '#6366f1'
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center p-4 rounded-2xl text-center transition-all duration-200 w-full"
      style={{
        background: hovered && isFolder ? `${folderColor}08` : T.card,
        border: `1px solid ${hovered && isFolder ? `${folderColor}40` : T.border}`,
        cursor: isFolder ? 'pointer' : 'default',
        transform: hovered && isFolder ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && isFolder ? `0 4px 16px ${folderColor}15` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {isFolder ? (
        <div className="mb-3 relative">
          <Folder size={44} weight="duotone" style={{ color: folderColor }} />
          {file.isSharedDrive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: folderColor }}>
              <Cloud size={9} weight="fill" className="text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
          <FileText size={22} weight="duotone" style={{ color: meta.color }} />
        </div>
      )}
      <p className="text-xs font-semibold line-clamp-2 w-full leading-snug mb-1" style={{ color: T.textMid }}>{file.name}</p>
      {!isFolder && <p className="text-[10px] font-medium" style={{ color: meta.color }}>{formatSize(file.size)}</p>}
      {isFolder && file.isSharedDrive && <p className="text-[9px] mt-0.5" style={{ color: T.textMuted }}>Shared Drive</p>}
    </button>
  )
}

const StorageExplorer = () => {
  const [provider, setProvider] = useState('google')
  const [currentFolder, setCurrentFolder] = useState({ id: 'root_drives', name: 'Root' })
  const [folderStack, setFolderStack] = useState([{ id: 'root_drives', name: 'Root' }])
  const [items, setItems] = useState({ folders: [], files: [] })
  const [availableDrives, setAvailableDrives] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const switchProvider = (p) => {
    if (p === provider) return
    setProvider(p)
    const root = p === 'google' ? { id: 'root_drives', name: 'Google Drive' } : { id: 'root_drives', name: 'Mega Cloud' }
    setFolderStack([root]); setCurrentFolder(root); setAvailableDrives([])
  }

  useEffect(() => {
    if (provider !== 'google') return
    api.get('/settings/drive/explore?folderId=root_drives').then((res) => {
      if (res.data.success) {
        setAvailableDrives([{ id: 'root_drives', name: 'My Drive (Service Account)' }, ...res.data.folders.filter(f => f.isSharedDrive)])
      }
    }).catch(() => {})
  }, [provider])

  const fetchContents = async (folderId) => {
    setLoading(true); setError(null)
    try {
      const id = folderId === 'root_drives' ? '' : folderId
      const url = provider === 'google' ? `/settings/drive/explore?folderId=${id}` : `/settings/drive/explore-mega?folderId=${id}`
      const res = await api.get(url)
      if (res.data.success) {
        let folders = res.data.folders || []
        if (provider === 'google' && folderId === 'root_drives') folders = folders.filter(f => !f.isSharedDrive)
        setItems({ folders, files: res.data.files || [] })
      }
    } catch (e) {
      setError(e.response?.data?.message || `Failed to load ${provider} drive contents`)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchContents(currentFolder.id) }, [currentFolder.id, provider])

  const openFolder = (folder) => {
    const next = { id: folder.id, name: folder.name }
    setFolderStack([...folderStack, next]); setCurrentFolder(next)
  }

  const goBack = () => {
    if (folderStack.length <= 1) return
    const stack = [...folderStack]; stack.pop()
    setFolderStack(stack); setCurrentFolder(stack[stack.length - 1])
  }

  const jumpTo = (index) => {
    const stack = folderStack.slice(0, index + 1)
    setFolderStack(stack); setCurrentFolder(stack[stack.length - 1])
  }

  const totalItems = items.folders.length + items.files.length

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ borderBottom: `1px solid ${T.border}`, background: T.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <FolderOpen size={18} weight="duotone" className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: T.text }}>Universal Cloud Explorer</h3>
            <p className="text-[10px]" style={{ color: T.textSub }}>Browse your connected cloud file systems</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-0.5 rounded-lg" style={{ background: '#f1f5f9', border: `1px solid ${T.border}` }}>
            {[{ id: 'google', label: 'Google', icon: Cloud, color: '#6366f1' }, { id: 'mega', label: 'Mega', icon: Database, color: '#f97316' }].map(p => {
              const active = provider === p.id
              return (
                <button key={p.id} onClick={() => switchProvider(p.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                  style={{ background: active ? p.color : 'transparent', color: active ? '#fff' : T.textSub, boxShadow: active ? `0 2px 8px ${p.color}35` : 'none' }}>
                  <p.icon size={13} weight={active ? 'fill' : 'regular'} />
                  {p.label}
                </button>
              )
            })}
          </div>
          {provider === 'google' && availableDrives.length > 1 && (
            <select value={folderStack[0].id}
              onChange={e => { const d = availableDrives.find(d => d.id === e.target.value); if (d) { setFolderStack([d]); setCurrentFolder(d) } }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg outline-none"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.textMid }}>
              {availableDrives.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          <button onClick={() => fetchContents(currentFolder.id)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} style={{ color: T.textSub }} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 overflow-x-auto" style={{ borderBottom: `1px solid ${T.border}`, background: '#fafbfc' }}>
        <button onClick={goBack} disabled={folderStack.length <= 1} className="p-1 rounded-lg mr-1 flex-shrink-0 disabled:opacity-30 hover:bg-slate-100 transition-colors" style={{ color: T.textSub }}>
          <ArrowLeft size={15} />
        </button>
        {folderStack.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            <button onClick={() => jumpTo(idx)} className="text-xs whitespace-nowrap px-1 py-0.5 rounded hover:text-indigo-600 transition-colors"
              style={{ color: idx === folderStack.length - 1 ? T.text : T.textSub, fontWeight: idx === folderStack.length - 1 ? 700 : 500 }}>
              {crumb.name}
            </button>
            {idx < folderStack.length - 1 && <CaretRight size={11} style={{ color: T.textMuted }} className="flex-shrink-0" />}
          </React.Fragment>
        ))}
        <div className="ml-auto flex-shrink-0"><span className="text-[10px]" style={{ color: T.textMuted }}>{totalItems} items</span></div>
      </div>

      {/* Content */}
      <div className="p-5 min-h-[380px]">
        {error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <WarningCircle size={18} weight="fill" className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <Spinner size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium" style={{ color: T.textSub }}>Fetching cloud contents…</p>
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-3">
            <Folder size={48} weight="duotone" className="text-slate-300" />
            <p className="text-sm font-semibold" style={{ color: T.textSub }}>This folder is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {items.folders.map(f => <FileCard key={f.id} file={f} isFolder provider={provider} onClick={() => openFolder(f)} />)}
            {items.files.map(f => <FileCard key={f.id} file={f} isFolder={false} provider={provider} onClick={() => {}} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default StorageExplorer
