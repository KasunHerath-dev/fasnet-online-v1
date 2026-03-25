# SOP: Cloudinary Resource Management (FASNET)

This directive outlines the standard operating procedures for managing academic resources in Cloudinary.

## Phase 1: Storage Infrastructure Setup
Before uploading files, the directory structure must exist to prevent naming collisions and ensure correct scanning.

### Action: Initialize Folders
- **Manual Trigger:** Admin Dashboard > System > Setup Folders.
- **Automated Script:** `node execution/init_cloudinary.js`
- **Logic:** Creates `lms_materials/Level_X/Semester_Y/ModuleCode/Type/Year`.
- **Constraint:** Cloudinary Admin API has a 500 operations/hour limit. If triggered via script, the script should handle retries after 60 minutes.

## Phase 2: Manual Upload & Synchronization
When users upload files directly to the Cloudinary Dashboard (bypassing the LMS UI), they must be "Synced" to the MongoDB database.

### Upload Rules
1. Files MUST be placed in their respective `[Year]` folder.
2. File names should be descriptive but don't strictly require a specific format as the scanner reads the folder path for metadata.

### Action: Sync Resources
- **Manual Trigger:** Admin Dashboard > Resources > Sync Cloudinary.
- **Automated Script:** `node execution/sync_resources.js`
- **Result:** Scans the Cloudinary `lms_materials` prefix, identifies files not in DB, and inserts them with `storageType: 'cloudinary'`.

## Phase 3: Legacy Mega Migration
To move files from Mega to Cloudinary for better CDN performance.

### Migration SOP
- **Trigger:** "Migrate Mega" tool in Admin Dashboard.
- **Priority:** High-traffic modules first.
- **Verification:** Ensure the `storageType` badge in Resource Center changes to blue "Cloudinary".

---
**Version:** 1.0.0
**Owner:** System Architect
**Last Updated:** March 2026
