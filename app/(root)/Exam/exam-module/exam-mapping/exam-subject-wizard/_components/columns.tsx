'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

// -------------------------
// TABLE COLUMNS
// -------------------------
export const ExamSubjectWizardColumns: ColumnDef<IExamSubjectWizard>[] = [
    // Row Selection
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },

    // Serial Number
    {
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        }
    },

    // Course
    {
        accessorKey: 'amcO_CourseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Course' />,
        cell: ({ row }) => <div>{row.getValue('amcO_CourseName')}</div>
    },

    // Branch
    {
        accessorKey: 'amb_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch' />,
        cell: ({ row }) => <div>{row.getValue('amb_BranchName')}</div>
    },

    // Semester
    {
        accessorKey: 'amse_SemesterName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Semester' />,
        cell: ({ row }) => <div>{row.getValue('amse_SemesterName')}</div>
    },

    // Subject Scheme
    {
        accessorKey: 'acss_SchemeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Scheme' />,
        cell: ({ row }) => <div>{row.getValue('acss_SchemeName')}</div>
    },

    // Scheme Type
    {
        accessorKey: 'acst_SchemeType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Scheme Type' />,
        cell: ({ row }) => <div>{row.getValue('acst_SchemeType')}</div>
    },

    // Subject Group
    {
        accessorKey: 'emg_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Group' />,
        cell: ({ row }) => <div>{row.getValue('emg_GroupName')}</div>
    },

    // Exam Name
    {
        accessorKey: 'eme_ExamName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Name' />,
        cell: ({ row }) => <div>{row.getValue('eme_ExamName')}</div>
    },

    // Grade Name
    {
        accessorKey: 'emgr_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />,
        cell: ({ row }) => <div>{row.getValue('emgr_GradeName')}</div>
    },

    // Attendance From Date
    {
        accessorKey: 'ecysE_AttendanceFromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attendance From' />,
        cell: ({ row }) => {
            const value = row.getValue('ecysE_AttendanceFromDate') as string | undefined;
            return <div>{value?.split('T')[0] || '-'}</div>;
        }
    },

    // Attendance To Date
    {
        accessorKey: 'ecysE_AttendanceToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attendance To' />,
        cell: ({ row }) => {
            const value = row.getValue('ecysE_AttendanceToDate') as string | undefined;
            return <div>{value?.split('T')[0] || '-'}</div>;
        }
    },

    // Sub Exam Applicable
    {
        accessorKey: 'ecysE_SubExamFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Exam Applicable' />,
        cell: ({ row }) => {
            const value = row.getValue('ecysE_SubExamFlg') as boolean;
            return <div>{value ? '✅' : '❌'}</div>;
        }
    },

    // Sub Subject Applicable
    {
        accessorKey: 'ecysE_SubSubjectFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Subject Applicable' />,
        cell: ({ row }) => {
            const value = row.getValue('ecysE_SubSubjectFlg') as boolean;
            return <div>{value ? '✅' : '❌'}</div>;
        }
    },

    // Active Status
    {
        accessorKey: 'ecysE_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active Status' />,
        cell: ({ row }) => {
            const value = row.getValue('ecysE_ActiveFlg') as boolean;
            return <div>{value ? 'Active' : 'Inactive'}</div>;
        }
    },

    // Actions (View + Edit + Toggle)
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

// -------------------------
// ACTION BUTTONS CELL
// -------------------------
function ActionButtonsCell({ rowData }: { rowData: IExamSubjectWizard }) {
    const { openEditForm, openDeleteForm, openToggleForm, openDetailsView } = useFormContext<IExamSubjectWizard>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleToggle = useCallback(() => openToggleForm(rowData), [openToggleForm, rowData]);
    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            {/* View button */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Wizard Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>

            {/* Edit + Toggle buttons */}
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='ecysE_ActiveFlg'
            />
        </div>
    );
}
