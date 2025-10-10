'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSubjectGroup } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const MasterSubjectGroupColumns: ColumnDef<IMasterSubjectGroup>[] = [
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
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        }
    },
    {
        accessorKey: 'ex_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div>{row.getValue('ex_GroupName')}</div>
    },
    {
        accessorKey: 'ex_MinApplicableSubjects',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Applicable Subjects' />,
        cell: ({ row }) => <div>{row.getValue('ex_MinApplicableSubjects')}</div>
    },
    {
        accessorKey: 'ex_MaxApplicapleSubjects',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Applicable Subjects' />,
        cell: ({ row }) => <div>{row.getValue('ex_MaxApplicapleSubjects')}</div>
    },
    {
        accessorKey: 'ex_BestOffSubjects',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Best Of Subjects' />,
        cell: ({ row }) => <div>{row.getValue('ex_BestOffSubjects')}</div>
    },
    {
        accessorKey: 'ex_ElectiveSubjects',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Elective Subjects' />,
        cell: ({ row }) => <div>{row.getValue('ex_ElectiveSubjects')}</div>
    },
    {
        accessorKey: 'ex_IsActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active Status' />,
        cell: ({ row }) => <div>{row.getValue('ex_IsActiveFlag') ? 'Active' : 'Inactive'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterSubjectGroup }) {
    const { openToggleForm, openEditForm, openDetailsView } = useFormContext<IMasterSubjectGroup>();

    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            {/* 👁️ Eye icon for viewing group details */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Group Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>

            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='ex_IsActiveFlag'
            />
        </div>
    );
}
