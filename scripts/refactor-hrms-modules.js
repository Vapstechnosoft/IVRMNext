#!/usr/bin/env node

/**
 * HRMS Module Refactoring Script
 *
 * Automatically refactors HRMS modules to use:
 * - GenericDataTable instead of DataTable
 * - _components/columns.tsx for column definitions
 * - _components/[entity]-form.tsx for forms
 *
 * Usage: node scripts/refactor-hrms-modules.js
 */

const fs = require('node:fs');
const path = require('node:path');

// Configuration
const MODULES_TO_REFACTOR = [
    // Attendance Management - Masters
    { path: 'app/(root)/hrms/attendance-management/masters/employee-missing-logs', entity: 'MissingLog' },
    { path: 'app/(root)/hrms/attendance-management/masters/employee-shift-mapping', entity: 'ShiftMapping' },
    { path: 'app/(root)/hrms/attendance-management/masters/gps-location-attendance', entity: 'GPSAttendance' },
    { path: 'app/(root)/hrms/attendance-management/masters/master-driver-shift', entity: 'DriverShift' },
    { path: 'app/(root)/hrms/attendance-management/masters/master-holiday', entity: 'Holiday' },
    { path: 'app/(root)/hrms/attendance-management/masters/shift-setting-master', entity: 'ShiftSetting' },

    // Attendance Management - Reports
    { path: 'app/(root)/hrms/attendance-management/reports/employee-inout-report', entity: 'InOutReport', isReport: true },
    {
        path: 'app/(root)/hrms/attendance-management/reports/employee-lateInEarlyOut-report',
        entity: 'LateInEarlyOutReport',
        isReport: true
    },
    { path: 'app/(root)/hrms/attendance-management/reports/employee-log-report', entity: 'LogReport', isReport: true },
    { path: 'app/(root)/hrms/attendance-management/reports/employee-yearly-report', entity: 'YearlyReport', isReport: true },
    { path: 'app/(root)/hrms/attendance-management/reports/fo-monthend-report', entity: 'MonthEndReport', isReport: true },
    { path: 'app/(root)/hrms/attendance-management/reports/gps-location-report', entity: 'GPSLocationReport', isReport: true },
    { path: 'app/(root)/hrms/attendance-management/reports/holiday-report', entity: 'HolidayReport', isReport: true },

    // Exit Management
    { path: 'app/(root)/hrms/exit-management/exit/checklist-master', entity: 'Checklist' },
    { path: 'app/(root)/hrms/exit-management/exit/leaving-reason', entity: 'LeavingReason' },
    { path: 'app/(root)/hrms/exit-management/transaction/employee-resign', entity: 'Resignation' },
    { path: 'app/(root)/hrms/exit-management/reports/employee-exit-report', entity: 'ExitReport', isReport: true },
    { path: 'app/(root)/hrms/exit-management/reports/relieving-letter', entity: 'RelievingLetter', isReport: true },

    // Leave Management - Masters
    { path: 'app/(root)/hrms/leave-management/masters/leave-authorization', entity: 'LeaveAuthorization' },
    { path: 'app/(root)/hrms/leave-management/masters/master-leave', entity: 'Leave' },
    { path: 'app/(root)/hrms/leave-management/masters/master-leaveYear', entity: 'LeaveYear' },

    // Leave Management - Apply Leave
    { path: 'app/(root)/hrms/leave-management/apply-leave', entity: 'ApplyLeave' },

    // Leave Management - Transactions
    { path: 'app/(root)/hrms/leave-management/transaction/comp-off-approval', entity: 'CompOffApproval' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-carryforward', entity: 'LeaveCarryforward' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-credit', entity: 'LeaveCredit' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-credit-addition', entity: 'LeaveCreditAddition' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-credit-deduction', entity: 'LeaveCreditDeduction' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-credit-details', entity: 'LeaveCreditDetails' },
    { path: 'app/(root)/hrms/leave-management/transaction/leave-credit-transaction', entity: 'LeaveCreditTransaction' },

    // Leave Management - Reports
    { path: 'app/(root)/hrms/leave-management/reports/leave-report', entity: 'LeaveReport', isReport: true },
    { path: 'app/(root)/hrms/leave-management/reports/overAll-report', entity: 'OverallReport', isReport: true },
    { path: 'app/(root)/hrms/leave-management/reports/unauthorizedLeaveCount-report', entity: 'UnauthorizedLeaveReport', isReport: true },

    // Pre-Config
    { path: 'app/(root)/hrms/pre-config/configuration/hr-authorisation', entity: 'HRAuthorisation' },
    { path: 'app/(root)/hrms/pre-config/configuration/staff-user-creation', entity: 'StaffUser' },

    // Recruitment - Masters
    { path: 'app/(root)/hrms/recruitment/masters/master-job', entity: 'Job' },
    { path: 'app/(root)/hrms/recruitment/masters/master-location', entity: 'Location' },
    { path: 'app/(root)/hrms/recruitment/masters/master-position', entity: 'Position' },
    { path: 'app/(root)/hrms/recruitment/masters/master-positionType', entity: 'PositionType' },
    { path: 'app/(root)/hrms/recruitment/masters/master-priority', entity: 'Priority' },

    // Recruitment - Other
    { path: 'app/(root)/hrms/recruitment/mrf-approval/mrf-requisition-form', entity: 'MRFRequisition' },
    { path: 'app/(root)/hrms/recruitment/feedback/candidate-feedback', entity: 'CandidateFeedback' },

    // Recruitment - Transactions
    { path: 'app/(root)/hrms/recruitment/transaction/add-candidate', entity: 'Candidate' },
    { path: 'app/(root)/hrms/recruitment/transaction/addTo-hrms', entity: 'AddToHRMS' },
    { path: 'app/(root)/hrms/recruitment/transaction/appointment-letter', entity: 'AppointmentLetter' },
    { path: 'app/(root)/hrms/recruitment/transaction/call-letter', entity: 'CallLetter' },
    { path: 'app/(root)/hrms/recruitment/transaction/job-posting', entity: 'JobPosting' },
    { path: 'app/(root)/hrms/recruitment/transaction/jobPost-list', entity: 'JobPostList' },
    { path: 'app/(root)/hrms/recruitment/transaction/mrf', entity: 'MRF' },
    { path: 'app/(root)/hrms/recruitment/transaction/shedule-interview', entity: 'ScheduleInterview' },

    // Recruitment - Reports
    { path: 'app/(root)/hrms/recruitment/reports/candidate-report', entity: 'CandidateReport', isReport: true },
    { path: 'app/(root)/hrms/recruitment/reports/interview-report', entity: 'InterviewReport', isReport: true }
];

// Helper functions
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function extractInterfaceFromPage(pageContent) {
    // Try to find the main interface definition
    const interfaceMatch = pageContent.match(/interface\s+(\w+)\s+extends\s+BaseEntity\s*{([^}]+)}/);
    if (interfaceMatch) {
        return {
            name: interfaceMatch[1],
            fields: interfaceMatch[2]
        };
    }
    return null;
}

function extractColumnDefinitions(pageContent) {
    // Extract column definitions from the page
    const columnsMatch = pageContent.match(/const columns.*?:\s*ColumnDef<.*?>\[\]\s*=\s*\[[\s\S]*?\];/);
    return columnsMatch ? columnsMatch[0] : null;
}

function generateColumnsFile(entityName, pageContent) {
    const interfaceData = extractInterfaceFromPage(pageContent);
    const _columnsData = extractColumnDefinitions(pageContent);

    if (!interfaceData) {
        console.warn(`Could not extract interface for ${entityName}`);
        return null;
    }

    return `"use client";

import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

export interface ${interfaceData.name} {
  id: number;${interfaceData.fields}
  createdAt: string;
}

interface ${interfaceData.name}ColumnsProps {
  onEdit: (row: ${interfaceData.name}) => void;
  onDelete: (row: ${interfaceData.name}) => void;
}

export const get${interfaceData.name}Columns = ({
  onEdit,
  onDelete,
}: ${interfaceData.name}ColumnsProps): ColumnDef<${interfaceData.name}>[] => [
  {
    id: "sl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SL.NO" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    enableSorting: false,
  },
  // TODO: Add other columns based on the entity fields
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const entity = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(entity)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={() => onDelete(entity)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
`;
}

function generateFormFile(entityName, isReport = false) {
    const _camelEntity = toCamelCase(entityName);
    const _kebabEntity = toKebabCase(entityName);

    if (isReport) {
        // Reports typically don't have add/edit forms, just filters
        return `"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputText } from "@/components/ui/extension/input-text";
import { RefreshCw, FileDown, Printer } from "lucide-react";

export function ${entityName}Filters() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Add report filter fields here */}
      <div className="md:col-span-4 flex gap-2 items-end">
        <Button type="button">
          <RefreshCw className="h-4 w-4 mr-2" /> Generate Report
        </Button>
        <Button variant="outline" type="button">
          <FileDown className="h-4 w-4 mr-2" /> Export to Excel
        </Button>
        <Button variant="outline" type="button" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>
    </div>
  );
}
`;
    }

    return `"use client";

import { Button } from "@/components/ui/button";
import { InputText } from "@/components/ui/extension/input-text";
import { Save, RefreshCw, X } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { ${entityName} } from "./columns";

export type ${entityName}FormData = {
  // TODO: Add form fields based on the entity
};

interface ${entityName}FormProps {
  editing${entityName}: ${entityName} | null;
  onSubmit: (data: ${entityName}FormData) => void;
  onCancel: () => void;
}

export function ${entityName}Form({
  editing${entityName},
  onSubmit,
  onCancel,
}: ${entityName}FormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<${entityName}FormData>({
    mode: "onChange",
    defaultValues: editing${entityName} || {},
  });

  const handleFormSubmit: SubmitHandler<${entityName}FormData> = async (data) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* TODO: Add form fields */}

      <div className="md:col-span-2 flex justify-center gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="mr-2 h-4 w-4" />
              Save
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
`;
}

// Main refactoring function
async function refactorModule(modulePath, entityName, isReport = false) {
    // Determine the script directory and find IVRMNext
    const scriptDir = __dirname;
    const ivrmNextRoot = path.join(scriptDir, '..');
    const basePath = path.join(ivrmNextRoot, modulePath);
    const pagePath = path.join(basePath, 'page.tsx');
    const componentsDir = path.join(basePath, '_components');

    // Check if page.tsx exists
    if (!fs.existsSync(pagePath)) {
        return { success: false, reason: 'page.tsx not found' };
    }

    // Read the current page content
    const pageContent = fs.readFileSync(pagePath, 'utf-8');

    // Check if already refactored
    if (pageContent.includes('GenericDataTable') || pageContent.includes('_components/columns')) {
        return { success: true, reason: 'already refactored' };
    }

    // Create _components directory
    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    // Generate columns.tsx
    const columnsContent = generateColumnsFile(entityName, pageContent);
    if (columnsContent) {
        const columnsPath = path.join(componentsDir, 'columns.tsx');
        fs.writeFileSync(columnsPath, columnsContent);
    }

    // Generate form file
    const formFileName = isReport ? 'filters.tsx' : `${toKebabCase(entityName)}-form.tsx`;
    const formContent = generateFormFile(entityName, isReport);
    const formPath = path.join(componentsDir, formFileName);
    fs.writeFileSync(formPath, formContent);

    // Create a backup of the original page
    const backupPath = path.join(basePath, 'page.tsx.backup');
    fs.writeFileSync(backupPath, pageContent);

    // Update page.tsx to use GenericDataTable
    let updatedPageContent = pageContent;

    // Replace DataTable import
    updatedPageContent = updatedPageContent.replace(
        /import\s+{\s*DataTable\s*}\s+from\s+['"]@\/components\/ui\/data-table\/data-table['"]/,
        "import { GenericDataTable } from '@/components/ui/data-table/generic-data-table'"
    );

    // Replace DataTable component usage
    updatedPageContent = updatedPageContent.replace(/<DataTable\b/g, '<GenericDataTable');
    updatedPageContent = updatedPageContent.replace(/<\/DataTable>/g, '</GenericDataTable>');

    // Add comment about refactoring
    if (!updatedPageContent.includes('// Refactored by automation script')) {
        updatedPageContent = `// Refactored by automation script on ${new Date().toISOString()}
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/${formFileName}
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

${updatedPageContent}`;
    }

    fs.writeFileSync(pagePath, updatedPageContent);

    return { success: true, reason: 'refactored' };
}

// Run the script
async function main() {
    const results = {
        success: 0,
        skipped: 0,
        failed: 0,
        alreadyRefactored: 0
    };

    for (const module of MODULES_TO_REFACTOR) {
        try {
            const result = await refactorModule(module.path, module.entity, module.isReport);

            if (result.success) {
                if (result.reason === 'already refactored') {
                    results.alreadyRefactored++;
                } else {
                    results.success++;
                }
            } else {
                results.skipped++;
            }
        } catch (error) {
            console.error(`❌ Error processing ${module.path}:`, error.message);
            results.failed++;
        }
    }
}

main().catch(console.error);
