'use client';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterSubject } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const examSubjectColumns: ColumnDef<IMasterSubject>[] = [
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
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'exsuB_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Name' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_SubjectName')}</div>
    },
    {
        accessorKey: 'exsuB_IVRSName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IVRS Subject Name' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_IVRSName')}</div>
    },
    {
        accessorKey: 'exsuB_SubjectCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Code' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_SubjectCode')}</div>
    },
    {
        accessorKey: 'exsuB_SubjectType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Type' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_SubjectType')}</div>
    },
    {
        accessorKey: 'exsuB_MaxMarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Max Marks' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_MaxMarks')}</div>
    },
    {
        accessorKey: 'exsuB_MinMarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Marks' />,
        cell: ({ row }) => <div>{row.getValue('exsuB_MinMarks')}</div>
    },
    {
        accessorKey: 'exsuB_PreAdmissionFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Pre-Admission Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_PreAdmissionFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        accessorKey: 'exsuB_AttendanceFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Attendance Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_AttendanceFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        accessorKey: 'exsuB_BatchWiseFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Batch Wise Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_BatchWiseFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        accessorKey: 'exsuB_ExamFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_ExamFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        accessorKey: 'exsuB_LanguageFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_LanguageFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        accessorKey: 'exsuB_ExtraFeeFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Extra Fee Flag' />,
        cell: ({ row }) => getStatusBadge((row.getValue('exsuB_ExtraFeeFlag') as number) === 1 ? 'yes' : 'no')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterSubject }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterSubject>();

    const handleEdit = useCallback(
        (data: IMasterSubject) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterSubject) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='exsuB_IsActiveFlag'
        />
    );
}
