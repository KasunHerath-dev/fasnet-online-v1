import mongoose from 'mongoose';
import Notice from './Notice.js';
import SystemSetting from './SystemSetting.js';
import { scrape, scrapeDetail, extractAttachmentLinks } from './scraper.js';
import { rewriteNotice } from './rewriter.js';
import { downloadAttachment } from './attachments.js';

// ── Credit-saving thresholds ────────────────────────────────────────────────
const MIN_CONTENT_LENGTH = 10;    // chars — even just "Level 1" should trigger AI expansion
const MAX_CACHED_AGE_MS   = 0;    // built-in: hash dedup already prevents re-processing

/**
 * Decide whether this content is worth sending to the AI.
 * Returns true if we should call the AI, false if we should use the fallback.
 *
 * Conditions that SKIP the AI call (save credits):
 *   - No API key configured
 *   - Content is too short (stub / date-only notice)
 *   - Content is identical to the original title (nothing useful scraped)
 */
function shouldRewrite(title, body, apiKey) {
    if (!apiKey) {
        console.log('[pipeline] ⏭  AI skip — no API key configured');
        return false;
    }
    const bodyLen = (body || '').trim().length;
    if (bodyLen < MIN_CONTENT_LENGTH) {
        console.log(`[pipeline] ⏭  AI skip — content too short (${bodyLen} chars < ${MIN_CONTENT_LENGTH})`);
        return false;
    }
    const bodyIsJustTitle = body.trim().toLowerCase() === title.trim().toLowerCase();
    if (bodyIsJustTitle) {
        console.log('[pipeline] ⏭  AI skip — body is identical to title, nothing to rewrite');
        return false;
    }
    return true;
}

/**
 * Build a lightweight fallback when AI is skipped.
 * Just formats the original content cleanly.
 */
function buildFallback(title, body) {
    const clean = (body || '').replace(/\s+/g, ' ').trim();
    return {
        title,
        body: clean,
        summary: clean.substring(0, 160) + (clean.length > 160 ? '...' : ''),
        tags: []
    };
}

/**
 * Helper to update the running status in the background
 */
async function setProgress(message) {
    try {
        const statusDoc = await SystemSetting.findOne({ key: 'SCRAPER_STATUS' });
        const val = statusDoc?.value || {};
        await SystemSetting.findOneAndUpdate(
            { key: 'SCRAPER_STATUS' },
            { 
                value: { ...val, status: 'running', message, lastUpdate: new Date() }
            },
            { upsert: true }
        );
    } catch (err) {
        // Silently fail status updates to not break the pipeline
    }
}

/**
 * Full pipeline: fetch settings → scrape list → scrape details → (smart) rewrite → save
 *
 * Credit-saving strategy:
 *   1. Hash dedup  — never re-process a notice we already have in DB
 *   2. Length gate — skip AI for stub notices (< MIN_CONTENT_LENGTH chars)
 *   3. Key guard   — if admin hasn't provided an API key yet, use original content
 *   4. DB cache    — rewritten content lives in the Notice document forever;
 *                    scraper won't touch the same hash again (dedup at step 1)
 */
export async function runPipeline() {
    console.log('\n[pipeline] ── Starting run ──────────────────────────────────');
    let created  = 0;
    let skippedDup  = 0;
    let skippedAI   = 0;
    let aiCalls     = 0;

    // ── 0. Fetch Settings from DB ───────────────────────────────────────────
    const configDoc = await SystemSetting.findOne({ key: 'SCRAPER_CONFIG' });
    const geminiKeyDoc = await SystemSetting.findOne({ key: 'GEMINI_API_KEY' });
    
    // Master Gemini Key override
    const masterGeminiKey = geminiKeyDoc ? geminiKeyDoc.value : null;

    const config = configDoc ? configDoc.value : {
        targetUrl: process.env.TARGET_URL || 'https://fas.wyb.ac.lk/notices/',
        selectors: {
            item: 'article.elementor-post',
            title: 'h3.elementor-post__title a',
            excerpt: '.elementor-post__excerpt p',
            date: '.elementor-post-date',
            deep: {
                title: 'h1.elementor-heading-title',
                body: '.elementor-widget-theme-post-content .elementor-widget-container',
                attachments: 'a.elementor-button-link[href$=".pdf"]'
            }
        },
        aiModel:   process.env.AI_MODEL || 'gemini',
        apiKey:    masterGeminiKey || process.env.GEMINI_API_KEY,
        autoPublish: process.env.AUTO_PUBLISH === 'true' || true
    };

    // Ensure we use the latest master key if one exists in the DB
    if (masterGeminiKey) {
        config.apiKey = masterGeminiKey;
    }

    if (!config.targetUrl) {
        console.error('[pipeline] Target URL is missing. Check .env or Admin UI.');
        return 0;
    }

    // ── 1. Scrape the notice list ───────────────────────────────────────────
    await setProgress('Fetching notices from faculty website...');
    const items = await scrape(config.targetUrl, config.selectors);
    console.log(`[pipeline] Found ${items.length} notice items on list page`);
    await setProgress(`Found ${items.length} items. Starting deep scan...`);

    const processedHashes = new Set();

    // Reverse to process oldest items first (giving newest items a more recent createdAt)
    for (const item of items.reverse()) {
        // Skip if we already touched this hash in THIS RUN (local dedup)
        if (processedHashes.has(item.sourceHash)) {
            continue;
        }
        processedHashes.add(item.sourceHash);

        // ── 2. DEDUP — never re-process (DB cache) ─────────────────────
        try {
            const exists = await Notice.exists({ hash: item.sourceHash });
            if (exists) {
                skippedDup++;
                continue;
            }
        } catch (err) {
            console.error(`[pipeline] DB check failed for "${item.title}": ${err.message}`);
            continue;
        }
        
        const shortTitle = item.title?.slice(0, 30) + '...';
        await setProgress(`Processing: ${shortTitle}`);
        console.log(`[pipeline] 🆕 Processing: "${item.title?.slice(0, 50)}"`);

        // ── 3. Deep Scrape ───────────────────────────────────────────────
        let fullContent  = (item.excerpt || '').replace(/\s+/g, ' ').trim();
        let attachments  = [];

        if (item.detailUrl) {
            try {
                const detail = await scrapeDetail(item.detailUrl, config.selectors?.deep);
                if (detail) {
                    const deepBody    = (detail.body || '').replace(/\s+/g, ' ').trim();
                    const listExcerpt = (item.excerpt || '').replace(/\s+/g, ' ').trim();
                    fullContent = deepBody
                        ? deepBody + (listExcerpt && !deepBody.includes(listExcerpt) ? '\n\n' + listExcerpt : '')
                        : listExcerpt;
                    attachments = detail.attachments || [];
                    if (detail.date) item.date = detail.date;
                }
            } catch (deepErr) {
                console.warn(`[pipeline] Deep scrape failed: ${deepErr.message}`);
            }
        }

        // ── 4. SMART AI CALL ─────────────────────────────────────────────
        let rewritten;
        let isAI = false;
        if (shouldRewrite(item.title, fullContent, config.apiKey)) {
            try {
                await setProgress(`🤖 AI rewriting: ${shortTitle}`);
                console.log(`[pipeline] 🤖 AI rewriting...`);
                rewritten = await rewriteNotice({
                    title: item.title,
                    body:  fullContent,
                    config: {
                        model:  config.aiModel,
                        apiKey: config.apiKey
                    }
                });
                aiCalls++;
                isAI = true;
            } catch (err) {
                console.error(`[pipeline] AI failed: ${err.message}`);
                rewritten = buildFallback(item.title, fullContent);
                skippedAI++;
            }
        } else {
            rewritten = buildFallback(item.title, fullContent);
            skippedAI++;
        }

        // ── 5. Attachments (Mirroring) ──────────────────────────────────
        const savedAttachments = [];
        if (attachments.length > 0) {
            await setProgress(`📥 Downloading ${attachments.length} attachments...`);
            for (const att of attachments) {
                const downloaded = await downloadAttachment({ href: att.url, text: att.text });
                if (downloaded) {
                    savedAttachments.push({
                        filename:  downloaded.originalName,
                        url:       downloaded.originalUrl,
                        localPath: downloaded.storedUrl,
                        mimeType:  downloaded.mimeType,
                        sizeBytes: downloaded.sizeBytes
                    });
                } else {
                    // Fallback to external URL if download fails
                    savedAttachments.push({
                        filename: att.text || 'Document',
                        url: att.url,
                        localPath: null
                    });
                }
            }
        }

        // ── 6. Persist ────────────────────────────────────────────────────
        try {
            const status      = config.autoPublish ? 'published' : 'draft';
            const publishedAt = config.autoPublish ? new Date() : undefined;
            const displayDate = item.date || new Date().toLocaleDateString();

            await Notice.create({
                title:         rewritten.title || item.title,
                originalTitle: item.title,
                content:       rewritten.body || fullContent || 'No content provided',
                subtext:       rewritten.summary || '',
                date:          displayDate,
                sourceUrl:     item.detailUrl || config.targetUrl,
                hash:          item.sourceHash,
                attachments:   savedAttachments,
                status,
                publishedAt,
                tags:          rewritten.tags || [],
                isActive:      config.autoPublish,
                aiProcessed:   isAI
            });

            console.log(`[pipeline] 💾 Saved: "${rewritten.title?.slice(0, 50)}"`);
            created++;
        } catch (saveErr) {
            if (saveErr.code === 11000) {
                console.log(`[pipeline] ⏩ Skipping duplicate hash (E11000)`);
                skippedDup++;
            } else {
                console.error(`[pipeline] Save failed: ${saveErr.message}`);
            }
        }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const summary = `Done! Saved ${created}, cached ${skippedDup}.`;
    console.log(`[pipeline] ── Summary ───────────────────────────────────────`);
    console.log(`[pipeline]    New notices saved : ${created}`);
    console.log(`[pipeline]    Skipped (cached)  : ${skippedDup}`);
    console.log(`[pipeline]    AI calls made     : ${aiCalls}`);
    console.log(`[pipeline]    AI calls saved    : ${skippedAI}`);
    console.log(`[pipeline] ── Done ──────────────────────────────────────────\n`);
    
    // We don't set status to idle here because the caller (index.js) does that with refreshStatus
    await setProgress(summary);

    return created;
}
