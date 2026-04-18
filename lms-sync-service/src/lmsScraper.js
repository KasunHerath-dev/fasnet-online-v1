// src/lmsScraper.js
//
// Logs into the Moodle-based LMS using student credentials,
// navigates to the calendar export page, selects "All events"
// + "Recent and next 60 days", then downloads the .ics file.

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

const LMS_BASE_URL = process.env.LMS_BASE_URL || 'https://lmsk.wyb.ac.lk';
const CALENDAR_PATH = process.env.LMS_CALENDAR_EXPORT_PATH || '/calendar/export.php';
const DOWNLOAD_DIR = path.resolve(process.env.ICS_DOWNLOAD_DIR || './downloads');
const HEADLESS = process.env.PUPPETEER_HEADLESS !== 'false';

/**
 * Ensure the downloads directory exists.
 */
function ensureDownloadDir() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    logger.info(`Created download directory: ${DOWNLOAD_DIR}`);
  }
}

/**
 * Main function: logs in as the student and downloads their ICS file.
 *
 * @param {string} username  - Student's LMS username
 * @param {string} password  - Student's LMS password
 * @param {string} studentId - Used to name the downloaded file uniquely
 * @returns {Promise<string>} - Absolute path to the downloaded .ics file
 */
async function downloadStudentCalendar(username, password, studentId) {
  ensureDownloadDir();

  const browser = await puppeteer.launch({
    headless: HEADLESS,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  // Set up download behavior so Puppeteer saves the file to our directory
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  try {
    // ── Step 1: Navigate to login page ──────────────────────────
    logger.info(`[${studentId}] Navigating to LMS login page...`);
    await page.goto(`${LMS_BASE_URL}/login/index.php`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // ── Step 2: Fill in credentials ─────────────────────────────
    logger.info(`[${studentId}] Filling login credentials...`);
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', username, { delay: 50 });
    await page.type('#password', password, { delay: 50 });

    // ── Step 3: Submit login form ────────────────────────────────
    await Promise.all([
      page.click('#loginbtn'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    ]);

    // Check if login succeeded (Moodle redirects to dashboard)
    const currentUrl = page.url();
    if (currentUrl.includes('/login/') || currentUrl.includes('invalid')) {
      throw new Error(`Login failed for student ${studentId}. Check credentials.`);
    }
    logger.info(`[${studentId}] Login successful. Current URL: ${currentUrl}`);

    // ── Step 4: Navigate to calendar export page ─────────────────
    logger.info(`[${studentId}] Navigating to calendar export page...`);
    await page.goto(`${LMS_BASE_URL}${CALENDAR_PATH}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // ── Step 5: Select export options ───────────────────────────
    // Select "All events" radio button
    await page.waitForSelector('input[name="events[exportevents]"]', { timeout: 10000 });
    await page.evaluate(() => {
      const radios = document.querySelectorAll('input[name="events[exportevents]"]');
      // "All events" is the first option in Moodle's export form
      if (radios.length > 0) radios[0].click();
    });

    // Select "Recent and next 60 days" time period radio button
    await page.evaluate(() => {
      const timeRadios = document.querySelectorAll('input[name="period[timeperiod]"]');
      // Index 2 = "Recent and next 60 days" in standard Moodle
      // We find it by its value attribute to be safe
      timeRadios.forEach((radio) => {
        if (radio.value === 'recentupcoming') radio.click();
      });
    });

    logger.info(`[${studentId}] Export options selected. Clicking Export...`);

    // ── Step 6: Click Export and capture the downloaded file ─────
    // Moodle serves the .ics file directly as a download
    const downloadedFilePath = await new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('ICS download timed out after 30s'));
      }, 30000);

      // Watch for new file in download directory
      const existingFiles = new Set(fs.readdirSync(DOWNLOAD_DIR));

      await page.click('input[type="submit"][value="Export"]').catch(() => {
        // Some Moodle themes use a button with different selector
        return page.click('button[type="submit"]');
      });

      // Poll until a new .ics file appears
      const poll = setInterval(() => {
        const files = fs.readdirSync(DOWNLOAD_DIR);
        const newIcs = files.find(
          (f) => f.endsWith('.ics') && !existingFiles.has(f)
        );
        if (newIcs) {
          clearInterval(poll);
          clearTimeout(timeout);
          resolve(path.join(DOWNLOAD_DIR, newIcs));
        }
      }, 500);
    });

    logger.info(`[${studentId}] ICS file downloaded: ${downloadedFilePath}`);

    // Rename to student-specific filename for clarity
    const finalPath = path.join(DOWNLOAD_DIR, `calendar_${studentId}_${Date.now()}.ics`);
    fs.renameSync(downloadedFilePath, finalPath);

    return finalPath;
  } catch (err) {
    logger.error(`[${studentId}] Scraper error: ${err.message}`);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = { downloadStudentCalendar };
