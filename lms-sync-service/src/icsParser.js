// src/icsParser.js
//
// Parses a Moodle-exported .ics file and extracts:
//   - Course module code  (e.g. MATH 1222, STAT 1213)
//   - Assignment/tutorial title
//   - Due date
//   - Raw description

const fs = require('fs');
const logger = require('./utils/logger');

/**
 * Regex patterns to extract course module codes from CATEGORIES or SUMMARY.
 * Handles codes like: MATH 1222, STAT 1213, CS 2301, PHYS 1101 etc.
 */
const MODULE_CODE_REGEX = /\b([A-Z]{2,6})\s?(\d{3,4})\b/;

/**
 * Parse raw iCalendar text manually (avoids heavy library dependency).
 * Returns an array of VEVENT objects as plain JS objects.
 *
 * @param {string} icsText - Raw ICS file content
 * @returns {Array<Object>}
 */
function parseICSText(icsText) {
  const events = [];
  // Split into lines, handling line folding (RFC 5545: lines starting with space/tab are continuations)
  const lines = icsText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .reduce((acc, line) => {
      if ((line.startsWith(' ') || line.startsWith('\t')) && acc.length > 0) {
        // Continuation line: append to previous
        acc[acc.length - 1] += line.slice(1);
      } else {
        acc.push(line);
      }
      return acc;
    }, []);

  let currentEvent = null;

  for (const line of lines) {
    if (line.trim() === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line.trim() === 'END:VEVENT' && currentEvent) {
      events.push(currentEvent);
      currentEvent = null;
    } else if (currentEvent) {
      // Split on first colon only (values can contain colons)
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const key = line.substring(0, colonIdx).trim().toUpperCase();
      const value = line.substring(colonIdx + 1).trim();
      currentEvent[key] = value;
    }
  }

  return events;
}

/**
 * Convert an iCal DTSTART/DTEND string to a JavaScript Date.
 * Handles: 20260406T103000Z  or  20260406T103000  or  20260406
 *
 * @param {string} dtString
 * @returns {Date|null}
 */
function parseICalDate(dtString) {
  if (!dtString) return null;
  try {
    // Strip any TZID parameter prefix (e.g. DTSTART;TZID=Asia/Colombo:...)
    const clean = dtString.replace(/^[^:]*:/, '').trim();

    if (clean.length === 8) {
      // Date-only: 20260406
      return new Date(
        `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`
      );
    }
    // DateTime: 20260406T103000Z
    return new Date(
      `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T` +
        `${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}Z`
    );
  } catch {
    return null;
  }
}

/**
 * Extract course module code from CATEGORIES field or SUMMARY.
 * CATEGORIES example: "MATH 1222(2023/2024)"
 * SUMMARY example:    "MATH 1222 - Tutorial #02 is due"
 *
 * @param {string} categories
 * @param {string} summary
 * @returns {string|null}  e.g. "MATH 1222"
 */
function extractModuleCode(categories = '', summary = '') {
  const source = categories || summary;
  const match = source.match(MODULE_CODE_REGEX);
  if (match) return `${match[1]} ${match[2]}`;
  return null;
}

/**
 * Determine event type from summary text.
 *
 * @param {string} summary
 * @returns {'assignment'|'tutorial'|'quiz'|'other'}
 */
function classifyEventType(summary = '') {
  const lower = summary.toLowerCase();
  if (lower.includes('assignment')) return 'assignment';
  if (lower.includes('tutorial')) return 'tutorial';
  if (lower.includes('quiz')) return 'quiz';
  if (lower.includes('exam')) return 'exam';
  if (lower.includes('drop box') || lower.includes('dropbox')) return 'assignment';
  return 'other';
}

/**
 * Clean up description text (remove Moodle HTML remnants, trim whitespace).
 *
 * @param {string} desc
 * @returns {string}
 */
function cleanDescription(desc = '') {
  return desc
    .replace(/\\n/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse an ICS file and return structured assignment data.
 *
 * @param {string} filePath - Absolute path to the .ics file
 * @returns {Array<{
 *   uid: string,
 *   title: string,
 *   moduleCode: string|null,
 *   type: string,
 *   dueDate: Date|null,
 *   dueDateISO: string|null,
 *   description: string,
 *   categories: string
 * }>}
 */
function parseICSFile(filePath) {
  logger.info(`Parsing ICS file: ${filePath}`);

  const raw = fs.readFileSync(filePath, 'utf-8');
  const events = parseICSText(raw);

  const assignments = events
    .map((ev) => {
      const summary = ev['SUMMARY'] || '';
      const categories = ev['CATEGORIES'] || '';
      const description = cleanDescription(ev['DESCRIPTION'] || '');
      const uid = ev['UID'] || '';

      const moduleCode = extractModuleCode(categories, summary);
      const dueDate = parseICalDate(ev['DTSTART'] || ev['DTEND']);
      const type = classifyEventType(summary);

      // Skip events with no recognisable module code or due date
      if (!moduleCode && !dueDate) {
        logger.warn(`Skipping event with UID ${uid} — no module code or date found.`);
        return null;
      }

      return {
        uid,
        title: summary.replace(/\s+is due$/i, '').trim(), // Clean "is due" suffix
        moduleCode,
        type,
        dueDate,
        dueDateISO: dueDate ? dueDate.toISOString() : null,
        description,
        categories,
      };
    })
    .filter(Boolean);

  logger.info(`Parsed ${assignments.length} assignment(s) from ICS file.`);
  return assignments;
}

module.exports = { parseICSFile };
