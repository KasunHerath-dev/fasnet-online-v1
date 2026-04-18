import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

/**
 * Main scraper function — handles fallback between Cheerio and Playwright
 */
export async function scrape(url, selectors = {}) {
    console.log(`[scraper] Fetching list from ${url}`);
    
    // Default selectors if none provided
    const s = {
        item:    selectors.item    || 'article.elementor-post',
        title:   selectors.title   || 'h3.elementor-post__title a, h2, h3, .title',
        excerpt: selectors.excerpt || '.elementor-post__excerpt p, .elementor-post__excerpt, p, .content, .description',
        date:    selectors.date    || '.elementor-post-date, .date, time, .post-date',
        link:    selectors.link    || '.elementor-post__read-more, h3.elementor-post__title a, a',
        ...selectors
    };

    try {
        const { data: html } = await axios.get(url, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0 FASNet-Scraper/1.0' }
        });
        const items = parseListHtml(html, url, s);
        if (items.length > 0) return items;
    } catch (err) {
        console.warn(`[scraper] Cheerio list fetch failed: ${err.message}`);
    }

    // Fallback to Playwright
    return await scrapeListWithPlaywright(url, s);
}

/**
 * Scrape individual notice page for full content and attachments
 */
export async function scrapeDetail(url, selectors = {}) {
    console.log(`[scraper] Deep scraping ${url}`);
    
    const s = {
        title: selectors.title || 'h1.elementor-heading-title, h1',
        body: selectors.body || '.elementor-widget-theme-post-content .elementor-widget-container, .elementor-widget-theme-post-content, .content',
        attachments: selectors.attachments || 'a.elementor-button-link[href$=".pdf"], a[href$=".pdf"]',
        ...selectors
    };

    try {
        const { data: html } = await axios.get(url, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0 FASNet-Scraper/1.0' }
        });
        return parseDetailHtml(html, url, s);
    } catch (err) {
        console.log(`[scraper] Detail fetch failed for ${url}: ${err.message}`);
        return null;
    }
}

function parseListHtml(html, baseUrl, s) {
    const $ = cheerio.load(html);
    const items = [];

    $(s.item).each((_, el) => {
        const $el = $(el);
        const title   = $el.find(s.title).first().text().trim();
        const excerpt = $el.find(s.excerpt).first().text().trim();

        // Extract original publish date from the list page
        let dateText = '';
        if (s.date) {
            const $dateEl = $el.find(s.date).first();
            // Try datetime attribute first (e.g. <time datetime="2024-03-15">)
            dateText = $dateEl.attr('datetime') || $dateEl.text().trim();
        }

        // Find the "Read More" or title link
        let detailUrl = null;
        $el.find(s.link).each((_, a) => {
            const href = $(a).attr('href');
            const text = $(a).text().toLowerCase();
            if (href && (text.includes('read') || text.includes('more') || !detailUrl)) {
                detailUrl = resolveUrl(href, baseUrl);
            }
        });

        if (!title) return;

        items.push({
            title,
            excerpt,
            detailUrl,
            date: dateText || null,
            sourceHash: crypto.createHash('md5').update(title + (detailUrl || excerpt)).digest('hex')
        });
    });

    return items;
}

function parseDetailHtml(html, baseUrl, s) {
    const $ = cheerio.load(html);
    const title = $(s.title).first().text().trim();
    const body  = $(s.body).text().trim();

    // Try to extract publish date from the detail page
    let date = '';
    const dateSel = s.date || 'time, .date, .post-date, [class*="date"], .elementor-post-date';
    const $dateEl = $(dateSel).first();
    date = $dateEl.attr('datetime') || $dateEl.text().trim();

    const attachments = [];
    $(s.attachments).each((_, a) => {
        const href = $(a).attr('href');
        const text = $(a).text().trim();
        if (href) {
            attachments.push({
                url:  resolveUrl(href, baseUrl),
                text: text || 'Download'
            });
        }
    });

    return { title, body, date, attachments };
}

async function scrapeListWithPlaywright(url, s) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForSelector(s.item, { timeout: 5000 }).catch(() => {});
        const html = await page.content();
        return parseListHtml(html, url, s);
    } finally {
        await browser.close();
    }
}

function resolveUrl(href, base) {
    try {
        return new URL(href, base).href;
    } catch {
        return href;
    }
}

export function extractAttachmentLinks(links) {
    const attachmentExts = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|csv|txt)$/i;
    return links.filter(link => attachmentExts.test(link.url || link.href || ''));
}
