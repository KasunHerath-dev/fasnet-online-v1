import 'dotenv/config';
import mongoose from 'mongoose';
import cron from 'node-cron';
import parser from 'cron-parser';
import { runPipeline } from './pipeline.js';
import SystemSetting from './SystemSetting.js';

const MONGODB_URI = process.env.MONGODB_URI;
const RUN_ONCE = process.argv.includes('--once');

let currentTask = null;
let currentSchedule = null;

if (!MONGODB_URI) {
    console.warn('[startup] WARNING: MONGODB_URI is not set in .env. Attempting to use localhost default...');
}

// ── Connect to MongoDB ────────────────────────────────────────────────────────
try {
    await mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/fasnet');
    console.log('[startup] MongoDB connected');
} catch (err) {
    console.error('[startup] FATAL: Could not connect to MongoDB:', err.message);
    process.exit(1);
}

/**
 * Update the scraper status in the database
 */
async function updateScraperStatus(data = {}) {
    try {
        await SystemSetting.findOneAndUpdate(
            { key: 'SCRAPER_STATUS' },
            { 
                value: data,
                description: 'Current scraper operation status and next run prediction'
            },
            { upsert: true }
        );
    } catch (err) {
        console.error('[status] Failed to update scraper status:', err.message);
    }
}

/**
 * Calculate next run time and update status
 */
async function refreshStatus(isRunning = false, message = 'Idle') {
    if (!currentSchedule) return;
    
    try {
        // Handle different export patterns for cron-parser
        const parseFunc = parser.parseExpression || parser.default?.parseExpression || (typeof parser === 'function' ? parser : null);
        
        if (!parseFunc) {
            console.error('[status] Could not find parseExpression function. Check cron-parser import.');
            return;
        }
        
        const interval = parseFunc(currentSchedule);
        const nextRun = interval.next().toDate();
        
        await updateScraperStatus({
            status: isRunning ? 'running' : 'idle',
            message: message,
            lastRun: new Date(),
            nextRun: nextRun,
            schedule: currentSchedule
        });
    } catch (err) {
        console.error('[status] Error calculating next run:', err.message);
    }
}

/**
 * Fetch latest schedule from DB and (re)setup cron if changed
 */
async function syncSchedule() {
    try {
        const configDoc = await SystemSetting.findOne({ key: 'SCRAPER_CONFIG' });
        const newSchedule = configDoc?.value?.cronSchedule || process.env.CRON_SCHEDULE || '*/15 * * * *';

        if (newSchedule !== currentSchedule) {
            console.log(`[scheduler] Schedule change detected: "${currentSchedule}" -> "${newSchedule}"`);
            setupCron(newSchedule);
            
            // Optional: Trigger an immediate run when the schedule is "fixed"
            console.log('[scheduler] Triggering immediate run after schedule change...');
            runPipeline().catch(err => console.error('[scheduler] Immediate run failed:', err.message));
        }
        
        // Always refresh status (includes next run calculation)
        await refreshStatus();
    } catch (err) {
        console.error('[scheduler] Failed to sync schedule:', err.message);
    }
}

/**
 * Setup or restart the cron job
 */
function setupCron(schedule) {
    if (currentTask) {
        currentTask.stop();
        console.log('[scheduler] Stopped previous cron task');
    }

    currentSchedule = schedule;
    currentTask = cron.schedule(schedule, async () => {
        console.log(`[cron] Triggering scheduled run (${new Date().toLocaleTimeString()})`);
        try {
            await refreshStatus(true, 'Starting scheduled run...');
            await runPipeline();
            console.log('[cron] Run completed successfully');
            await refreshStatus(false, 'Last run completed successfully');
        } catch (err) {
            console.error('[cron] Pipeline error:', err.message);
            await refreshStatus(false, `Error: ${err.message}`);
        }
    });

    console.log(`[scheduler] New cron task scheduled: "${schedule}"`);
    refreshStatus(); // Initial status update for the new schedule
}

// ── Execution Flow ───────────────────────────────────────────────────────────

if (RUN_ONCE) {
    console.log('[startup] Running single scrape then exiting');
    try {
        await runPipeline();
        console.log('[startup] Scrape completed');
    } catch (err) {
        console.error('[startup] Scrape failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
} else {
    console.log('[startup] Scraper service starting in persistent mode');
    
    // 0. Emergency status reset (if it was stuck in 'running' due to a crash)
    await updateScraperStatus({ status: 'idle', message: 'System restarted', lastRun: new Date() });
    
    // 1. Initial run
    try {
        await syncSchedule(); // Setup schedule first
        await refreshStatus(true, 'Initial startup run...');
        await runPipeline();
        await refreshStatus(false, 'Initial run completed successfully');
    } catch (err) {
        console.error('[startup] Initial run failed:', err.message);
        await refreshStatus(false, `Initial run failed: ${err.message}`);
    }

    // 3. Periodic schedule watcher (Sync with DB every 30 seconds)
    // We use a regular interval here to avoid cron field drift and for maximum responsiveness
    setInterval(async () => {
        await syncSchedule();
    }, 30000);

    console.log('[startup] Daily schedule watcher active (Checking DB every 30s)');

    // Graceful shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    async function shutdown() {
        console.log('\n[shutdown] Closing connection and stopping tasks...');
        if (currentTask) currentTask.stop();
        await mongoose.disconnect();
        process.exit(0);
    }
}
