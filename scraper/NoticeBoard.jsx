/**
 * NoticeBoard.jsx
 * Drop this into your frontend/src/components/ folder.
 * Usage: <NoticeBoard />
 */

import { useEffect, useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ── File type icon (text-based, no extra dependency) ─────────────────────────
function FileIcon({ mimeType }) {
  const icons = {
    'application/pdf':  '📄',
    'application/zip':  '🗜️',
    'text/csv':         '📊',
    default:            '📎',
  };
  const key = Object.keys(icons).find(k => mimeType?.startsWith(k)) || 'default';
  return <span style={{ fontSize: 14 }}>{icons[key]}</span>;
}

// ── Single notice card ────────────────────────────────────────────────────────
function NoticeCard({ notice }) {
  const {
    title, summary, body, tags = [], attachments = [], publishedAt, createdAt,
  } = notice;

  const [expanded, setExpanded] = useState(false);
  const date = new Date(publishedAt || createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <span style={styles.date}>{date}</span>
        {tags.map(t => (
          <span key={t} style={styles.tag}>{t}</span>
        ))}
      </div>

      {/* Title */}
      <h3 style={styles.title}>{title}</h3>

      {/* Summary / expanded body */}
      <p style={styles.body}>
        {expanded ? body : (summary || body.slice(0, 200) + (body.length > 200 ? '…' : ''))}
      </p>

      {body.length > 200 && (
        <button style={styles.readMore} onClick={() => setExpanded(e => !e)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div style={styles.attachments}>
          <p style={styles.attachLabel}>Attachments</p>
          {attachments.map((att, i) => (
            <a
              key={i}
              href={att.storedUrl}
              download={att.originalName}
              target="_blank"
              rel="noreferrer"
              style={styles.downloadBtn}
            >
              <FileIcon mimeType={att.mimeType} />
              <span style={{ marginLeft: 6 }}>{att.originalName}</span>
              {att.sizeBytes && (
                <span style={styles.fileSize}>
                  {' '}({formatBytes(att.sizeBytes)})
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main NoticeBoard ──────────────────────────────────────────────────────────
export default function NoticeBoard() {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchNotices = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE}/notices?status=published&page=${p}&limit=10`);
      const data = await res.json();
      setNotices(data.notices);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotices(page); }, [page, fetchNotices]);

  if (loading) return <div style={styles.center}>Loading notices…</div>;
  if (error)   return <div style={styles.center}>{error}</div>;
  if (!notices.length) return <div style={styles.center}>No notices published yet.</div>;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Notices &amp; Announcements</h2>

      <div>
        {notices.map(n => <NoticeCard key={n._id} notice={n} />)}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Previous
          </button>
          <span style={{ color: '#6b7280', fontSize: 14 }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            style={styles.pageBtn}
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  wrapper:      { maxWidth: 760, margin: '0 auto', padding: '24px 16px' },
  heading:      { fontSize: 22, fontWeight: 600, marginBottom: 20, color: '#111827' },
  card:         { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                  padding: '20px 24px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,.05)' },
  cardHeader:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  date:         { fontSize: 12, color: '#6b7280' },
  tag:          { fontSize: 11, background: '#eff6ff', color: '#1d4ed8', borderRadius: 4,
                  padding: '2px 8px', fontWeight: 500 },
  title:        { margin: '0 0 8px', fontSize: 17, fontWeight: 600, color: '#111827', lineHeight: 1.4 },
  body:         { margin: '0 0 8px', fontSize: 14, color: '#374151', lineHeight: 1.7 },
  readMore:     { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
                  fontSize: 13, padding: 0, marginBottom: 8 },
  attachments:  { borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 12 },
  attachLabel:  { fontSize: 12, color: '#6b7280', margin: '0 0 8px', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.05em' },
  downloadBtn:  { display: 'inline-flex', alignItems: 'center', background: '#f9fafb',
                  border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 12px',
                  marginRight: 8, marginBottom: 8, fontSize: 13, color: '#374151',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'background 0.15s' },
  fileSize:     { color: '#9ca3af', fontSize: 12 },
  pagination:   { display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: 16, marginTop: 24 },
  pageBtn:      { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
                  padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#374151' },
  center:       { textAlign: 'center', padding: 48, color: '#6b7280' },
};

// ── Utility ───────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
