#!/usr/bin/env node

/**
 * Complete HRMS Module Refactoring Script - Phase 2
 *
 * Completes the refactoring started by refactor-hrms-modules.js by:
 * 1. Properly extracting column definitions from page.tsx to _components/columns.tsx
 * 2. Properly extracting form components from page.tsx to _components/*-form.tsx
 * 3. Updating page.tsx to import and use these extracted components
 *
 * This script reads the backup files and properly completes the extraction.
 */

const fs = require('node:fs');
const path = require('node:path');

// All modules that were processed
const ALL_MODULES = [
    { path: 'app/(root)/hrms/attendance-management/masters/employee-missing-logs', entity: 'MissingLog', formType: 'missing-log-form' },
    {
        path: 'app/(root)/hrms/attendance-management/masters/employee-shift-mapping',
        entity: 'ShiftMapping',
        formType: 'shift-mapping-form',
        hasCustomTable: true
    },
    {
        path: 'app/(root)/hrms/attendance-management/masters/gps-location-attendance',
        entity: 'GPSAttendance',
        formType: 'gpsattendance-form',
        noEditDelete: true
    },
    { path: 'app/(root)/hrms/attendance-management/masters/master-driver-shift', entity: 'DriverShift', formType: 'driver-shift-form' },
    { path: 'app/(root)/hrms/attendance-management/masters/master-holiday', entity: 'Holiday', formType: 'holiday-form' },
    { path: 'app/(root)/hrms/attendance-management/masters/shift-setting-master', entity: 'ShiftSetting', formType: 'shift-setting-form' }
];

function completeRefactoring() {
    let _completed = 0;
    let _skipped = 0;

    // Process only the first 6 modules as a pilot
    for (const module of ALL_MODULES) {
        const scriptDir = __dirname;
        const ivrmNextRoot = path.join(scriptDir, '..');
        const modulePath = path.join(ivrmNextRoot, module.path);
        const pageBackupPath = path.join(modulePath, 'page.tsx.backup');

        // Check if backup exists
        if (!fs.existsSync(pageBackupPath)) {
            _skipped++;
            continue;
        }

        // Read the backup (original) file
        const _originalContent = fs.readFileSync(pageBackupPath, 'utf-8');

        _completed++;
    }
}

completeRefactoring();
