/**
 * notices.routes.js
 *
 * Add to your backend Express app:
 *   import noticesRouter from './routes/notices.routes.js';
 *   app.use('/api/notices', noticesRouter);
 *
 * Also serve attachments (if using local storage):
 *   import path from 'path';
 *   app.use('/attachments', express.static(path.join(process.cwd(), '../scraper/attachments')));
 */

import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// ── Lazy-load Notice model (same DB, same collection) ─────────────────────────
// If your backend already has this model, import it from there instead.
import Notice from '../../scraper/src/models/Notice.js';

// ── GET /api/notices ──────────────────────────────────────────────────────────
// Query params:
//   ?status=published|draft   (default: published)
//   ?page=1&limit=10
//   ?tag=tagname
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || 'published';
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 10);
    const skip   = (page - 1) * limit;

    const filter = { status };
    if (req.query.tag) filter.tags = req.query.tag;

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    res.json({
      notices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/notices/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).lean();
    if (!notice) return res.status(404).json({ error: 'Not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/notices/:id/publish ───────────────────────────────────────────
// Publish a draft (for the human review flow)
router.patch('/:id/publish', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    if (!notice) return res.status(404).json({ error: 'Not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/notices/:id/unpublish ─────────────────────────────────────────
router.patch('/:id/unpublish', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { status: 'draft', $unset: { publishedAt: '' } },
      { new: true }
    );
    if (!notice) return res.status(404).json({ error: 'Not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/notices/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
