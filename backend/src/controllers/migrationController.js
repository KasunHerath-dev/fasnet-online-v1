const Resource = require('../models/Resource');
const megaService = require('../services/megaService');
const googleDriveService = require('../services/googleDriveService');
const mongoose = require('mongoose');

// Global termination flag
let shouldStopMigration = false;

// Progress tracking
let migrationProgress = {
    active: false,
    total: 0,
    current: 0,
    currentItem: '',
    errors: [],
    startTime: null,
    endTime: null
};

/**
 * Friendly Category Map
 */
const CATEGORY_MAP = {
    tutorial: 'Tutorials',
    past_paper: 'Past Papers',
    assignment: 'Assignments',
    marking_scheme: 'Marking Schemes',
    book: 'Reference Books',
    other: 'General Resources'
};

/**
 * Normalizes a string for loose matching (strips special chars, spaces, and common extensions)
 */
const normalizeName = (str) => {
    if (!str) return '';
    return str.toString()
        .toLowerCase()
        .replace(/\.[^/.]+$/, '') // remove extension
        .replace(/[^a-z0-9]/g, '') // remove everything except alphanumeric
        .trim();
};

/**
 * @desc Build a hierarchical map of all resources eligible for migration
 */
exports.getMigrationMap = async (req, res) => {
    try {
        const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'google_drive';
        const sourceStorage = activeStorage === 'mega' ? 'google_drive' : 'mega';

        const resources = await Resource.find({ storageType: sourceStorage })
            .populate('module')
            .lean();

        // Organize into: Level > Semester > Module > Files
        const tree = {};

        resources.forEach(r => {
            if (!r.module) return;
            const lv = `Level ${r.module.level}`;
            const sem = `Semester ${r.module.semester}`;
            const mod = `${r.module.code} - ${r.module.title}`;
            const cat = CATEGORY_MAP[r.type] || 'Other';

            if (!tree[lv]) tree[lv] = { semesters: {}, count: 0 };
            if (!tree[lv].semesters[sem]) tree[lv].semesters[sem] = { modules: {}, count: 0 };
            if (!tree[lv].semesters[sem].modules[mod]) tree[lv].semesters[sem].modules[mod] = { files: [], count: 0 };

            tree[lv].semesters[sem].modules[mod].files.push({
                id: r._id,
                title: r.title,
                type: r.type,
                category: cat,
                size: r.size
            });

            tree[lv].count++;
            tree[lv].semesters[sem].count++;
            tree[lv].semesters[sem].modules[mod].count++;
        });

        res.status(200).json({
            success: true,
            tree
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get Stats about migration
 */
exports.getMigrationStats = async (req, res) => {
    try {
        const megaCount = await Resource.countDocuments({ storageType: 'mega' });
        const driveCount = await Resource.countDocuments({ storageType: 'google_drive' });
        const total = megaCount + driveCount;

        const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'google_drive';
        const syncedCount = activeStorage === 'mega' ? megaCount : driveCount;

        res.status(200).json({
            success: true,
            stats: {
                megaCount,
                driveCount,
                total,
                percentMigrated: total === 0 ? 0 : Math.round((syncedCount / total) * 100),
                activeStorage
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get current migration progress
 */
exports.getMigrationStatus = async (req, res) => {
    res.status(200).json({
        success: true,
        progress: migrationProgress
    });
};

/**
 * @desc Audit: cross-reference DB fileIds against actual MEGA files
 * Returns which DB records can be matched to MEGA nodeIds and which cannot.
 */
exports.auditMigration = async (req, res) => {
    try {
        const resources = await Resource.find({ storageType: 'mega' }).populate('module').lean();
        const megaFiles = await megaService.listAllFiles();

        const megaMap = {};
        const megaNormalizedMap = {};
        
        megaFiles.forEach(f => {
            megaMap[f.nodeId] = f;
            megaMap[f.name.toLowerCase().trim()] = f;
            
            const norm = normalizeName(f.name);
            if (norm) megaNormalizedMap[norm] = f;
        });

        const matched = [];
        const unmatched = [];

        resources.forEach(r => {
            // Priority 1: Match by direct nodeId
            let megaMatch = megaMap[r.fileId];
            let matchType = 'nodeId';

            // Priority 2: Match by exact title
            if (!megaMatch && r.title) {
                megaMatch = megaMap[r.title.toLowerCase().trim()];
                matchType = 'exact-title';
            }

            // Priority 3: Fuzzy match by normalized names (strips _ - .ext)
            if (!megaMatch && r.title) {
                const normTitle = normalizeName(r.title);
                megaMatch = megaNormalizedMap[normTitle];
                matchType = 'fuzzy-title';
            }

            // Priority 4: Module-code match (search for module code in MEGA names)
            if (!megaMatch && r.module?.code) {
                const codeMatch = megaFiles.find(f => 
                    f.name.toUpperCase().includes(r.module.code.toUpperCase()) && 
                    normalizeName(f.name).includes(normalizeName(r.title).slice(-4)) // ensure it ends with same-ish suffix
                );
                if (codeMatch) {
                    megaMatch = codeMatch;
                    matchType = `module-code-fallback (${r.module.code})`;
                }
            }

            if (megaMatch) {
                matched.push({
                    id: r._id,
                    title: r.title,
                    module: r.module?.code,
                    dbFileId: r.fileId,
                    megaName: megaMatch.name,
                    megaNodeId: megaMatch.nodeId,
                    matchedBy: matchType
                });
            } else {
                unmatched.push({
                    id: r._id,
                    title: r.title,
                    module: r.module?.code,
                    dbFileId: r.fileId,
                    normTitle: normalizeName(r.title)
                });
            }
        });

        res.status(200).json({
            success: true,
            summary: {
                totalInDB: resources.length,
                totalOnMega: megaFiles.length,
                matched: matched.length,
                unmatched: unmatched.length,
            },
            matched,
            unmatched
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc STOP the migration process
 */
exports.stopMigration = async (req, res) => {
    shouldStopMigration = true;
    res.status(200).json({ success: true, message: 'Stop command sent to migration engine.' });
};

/**
 * @desc Start the Migration Process (Background)
 */
exports.startMigration = async (req, res) => {
    if (migrationProgress.active) {
        return res.status(400).json({ success: false, message: 'Sync already in progress.' });
    }

    try {
        const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'google_drive';
        const sourceStorage = activeStorage === 'mega' ? 'google_drive' : 'mega';

        const resourcesToMigrate = await Resource.find({ storageType: sourceStorage })
            .populate('module');

        if (resourcesToMigrate.length === 0) {
            return res.status(200).json({ success: true, message: 'All files are already synced to the Active Storage.' });
        }

        // Reset progress and flag
        shouldStopMigration = false;
        migrationProgress = {
            active: true,
            total: resourcesToMigrate.length,
            current: 0,
            currentItem: '',
            errors: [],
            startTime: new Date(),
            endTime: null
        };

        // Respond immediately (Background process)
        res.status(200).json({ success: true, message: `Migration started for ${resourcesToMigrate.length} files.` });

        // Actual Process
        runMigration(resourcesToMigrate);

    } catch (error) {
        console.error('Migration startup error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Internal loop to run the migration one by one
 */
async function runMigration(resources) {
    const activeStorage = process.env.ACTIVE_STORAGE_PROVIDER || 'google_drive';
    const sourceStorage = activeStorage === 'mega' ? 'google_drive' : 'mega';
    const isTargetGoogleDrive = activeStorage === 'google_drive';

    let targetFolderId = isTargetGoogleDrive ? process.env.GOOGLE_DRIVE_FOLDER_ID : 'root';
    const activeDriver = isTargetGoogleDrive ? googleDriveService : megaService;

    // ── Pre-flight: load the full MEGA file list once (if moving FROM mega) ───────────────
    let megaFileList = [];
    const megaNameMap = {};
    const megaNormalizedMap = {};
    
    if (sourceStorage === 'mega') {
        console.log('[Sync] Pre-loading MEGA file index…');
        try {
            megaFileList = await megaService.listAllFiles();
            console.log(`[Sync] MEGA index loaded: ${megaFileList.length} files available.`);
        } catch (e) {
            console.error('[Sync] Could not load MEGA file index:', e.message);
        }

        megaFileList.forEach(f => {
            const norm = normalizeName(f.name);
            if (norm) megaNormalizedMap[norm] = f;
            megaNameMap[f.name.toLowerCase().trim()] = f;
            megaNameMap[f.nodeId] = f;
        });
    }

    for (const resource of resources) {
        // Exit early if stop signal received
        if (shouldStopMigration) {
            console.log('[Sync] STOP signal detected. Graceful exit.');
            migrationProgress.errors.push({ item: 'System', message: 'Sync stopped by administrator manual override.' });
            break;
        }

        try {
            migrationProgress.current += 1;
            migrationProgress.currentItem = resource.title;

            const module = resource.module;
            if (!module) throw new Error(`Missing module link`);

            // ── Resolve File in Source (If MEGA) ───────────────────────
            if (sourceStorage === 'mega') {
                let megaEntry = null;
                let matchSource = '';

                if (resource.fileId && megaNameMap[resource.fileId]) {
                    megaEntry = megaNameMap[resource.fileId];
                    matchSource = 'nodeId';
                }

                if (!megaEntry && resource.title && megaNameMap[resource.title.toLowerCase().trim()]) {
                    megaEntry = megaNameMap[resource.title.toLowerCase().trim()];
                    matchSource = 'exact-title';
                }

                if (!megaEntry && resource.title) {
                    const normTitle = normalizeName(resource.title);
                    if (megaNormalizedMap[normTitle]) {
                        megaEntry = megaNormalizedMap[normTitle];
                        matchSource = 'fuzzy-title';
                    }
                }

                if (!megaEntry && module?.code) {
                    const codeMatch = megaFileList.find(f => 
                        f.name.toUpperCase().includes(module.code.toUpperCase()) && 
                        normalizeName(f.name).includes(normalizeName(resource.title).slice(-4))
                    );
                    if (codeMatch) {
                        megaEntry = codeMatch;
                        matchSource = `module-fallback (${module.code})`;
                    }
                }

                if (!megaEntry && resource.fileId?.startsWith('http')) {
                    matchSource = 'public-url';
                }

                if (!megaEntry && matchSource !== 'public-url') {
                    throw new Error(`File not found on MEGA. Searched for: "${resource.title}" [id: ${resource.fileId}]`);
                }

                if (megaEntry && megaEntry.nodeId !== resource.fileId) {
                    console.log(`[Sync] Re-mapped file for "${resource.title}" → ${megaEntry.nodeId} (via ${matchSource})`);
                    resource.fileId = megaEntry.nodeId;
                }
            }

            // 1. Build Target Folder Path: Level > Semester > Module > Category
            const levelDir = await activeDriver.getOrCreateFolder(targetFolderId, `Level ${module.level}`);
            const semDir = await activeDriver.getOrCreateFolder(levelDir, `Semester ${module.semester}`);
            const moduleDir = await activeDriver.getOrCreateFolder(semDir, `${module.code} - ${module.title}`);
            const categoryName = CATEGORY_MAP[resource.type] || 'Other';
            const categoryDir = await activeDriver.getOrCreateFolder(moduleDir, categoryName);

            // 2. Stream from Source
            const streamData = sourceStorage === 'mega' 
                ? await megaService.getFileStream(resource.fileId)
                : await googleDriveService.getFileStream(resource.fileId);

            // 3. Upload to Target
            let uploadResult;
            if (isTargetGoogleDrive) {
                uploadResult = await googleDriveService.uploadStreamToDrive(streamData.stream, streamData.name, resource.mimeType, categoryDir);
            } else {
                uploadResult = await megaService.uploadToMega(streamData.stream, streamData.name, resource.size || streamData.size, categoryDir);
            }

            // 4. Update Database safely
            resource.fileId = uploadResult.nodeId;
            resource.storageType = activeStorage;
            resource.webViewLink = uploadResult.link;
            resource.webContentLink = uploadResult.link;
            await resource.save();

            console.log(`[Sync] ✅ Migrated: ${resource.title} → ${categoryName} (${activeStorage})`);

        } catch (err) {
            console.error(`[Sync] ❌ ${resource.title}:`, err.message);
            migrationProgress.errors.push({
                item: resource.title,
                message: err.message
            });
        }
    }

    migrationProgress.active = false;
    migrationProgress.endTime = new Date();
    console.log('[Migration] Process Complete. Errors:', migrationProgress.errors.length);
}
