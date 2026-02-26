'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

// Interfaces for List Data
import type {
    TTDayPeriodGridData,
    TTDayStaffGridData,
    TTDaySubjectGridData,
    TTPeriodStaffGridData,
    TTPeriodSubjectGridData
} from '@/types/timetable/constraints/fixing';

// --- Action Cell Components ---
function ActionButtonsCell<T>({
    rowData,
    idKey,
    toggleKey,
    showView = false
}: { rowData: T; idKey: string; toggleKey: string; showView?: boolean }) {
    const { openEditForm, openToggleForm, openDeleteForm, openDetailsView } = useFormContext<T>();

    const handleEdit = useCallback(
        (data: T) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: T) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: T) => {
            if (openDeleteForm) openDeleteForm(data);
        },
        [openDeleteForm]
    );

    const handleView = useCallback(
        (data: T) => {
            if (openDetailsView) openDetailsView(data);
        },
        [openDetailsView]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
                //view: showView
            }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            //onView={handleView}
            toggleConditionKey={toggleKey}
        />
    );
}

// --- Columns ---

// 1. Day Period
// 1. Day Period
export const dayPeriodColumns: ColumnDef<TTDayPeriodGridData>[] = [
    {
        accessorKey: 'ttfdP_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{index}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' />,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} idKey='ttfdP_Id' toggleKey='ttfdP_ActiveFlag' showView={false} />,
        enableSorting: false,
        enableHiding: false
    }
];

// 2. Day Staff
export const dayStaffColumns: ColumnDef<TTDayStaffGridData>[] = [
    {
        accessorKey: 'ttfdS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{index}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'asmaY_Year', header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' /> },
    { accessorKey: 'staffName', header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' /> },
    { accessorKey: 'ttmD_DayName', header: ({ column }) => <DataTableColumnHeader column={column} title='Day' /> },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} idKey='ttfdS_Id' toggleKey='ttfdS_ActiveFlag' showView={true} />
    }
];

// 3. Day Subject
export const daySubjectColumns: ColumnDef<TTDaySubjectGridData>[] = [
    {
        accessorKey: 'ttfdsU_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{index}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'asmaY_Year', header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' /> },
    { accessorKey: 'ismS_SubjectName', header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' /> },
    { accessorKey: 'ttmD_DayName', header: ({ column }) => <DataTableColumnHeader column={column} title='Day' /> },
    {
        accessorKey: 'ttfdsU_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class-Section Wise' />,
        cell: ({ row }) => (row.original.ttfdsU_SUbSelcFlag ? 'Yes' : 'No')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} idKey='ttfdsU_Id' toggleKey='ttfdsU_ActiveFlag' showView={true} />
    }
];

// 4. Period Staff
export const periodStaffColumns: ColumnDef<TTPeriodStaffGridData>[] = [
    {
        accessorKey: 'ttfpS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{index}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'asmaY_Year', header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' /> },
    { accessorKey: 'staffName', header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' /> },
    { accessorKey: 'ttmP_PeriodName', header: ({ column }) => <DataTableColumnHeader column={column} title='Period' /> },
    {
        accessorKey: 'ttfpS_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class-Section Wise' />,
        cell: ({ row }) => (row.original.ttfpS_SUbSelcFlag ? 'Yes' : 'No')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} idKey='ttfpS_Id' toggleKey='ttfpS_ActiveFlag' showView={true} />
    }
];

// 5. Period Subject
export const periodSubjectColumns: ColumnDef<TTPeriodSubjectGridData>[] = [
    {
        accessorKey: 'ttrpsU_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{index}</div>;
        },
        enableSorting: false
    },
    { accessorKey: 'asmaY_Year', header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' /> },
    { accessorKey: 'ismS_SubjectName', header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' /> },
    { accessorKey: 'ttmP_PeriodName', header: ({ column }) => <DataTableColumnHeader column={column} title='Period' /> },
    {
        accessorKey: 'ttrpsU_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class-Section Wise' />,
        cell: ({ row }) => (row.original.ttrpsU_SUbSelcFlag ? 'Yes' : 'No')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} idKey='ttrpsU_Id' toggleKey='ttrpsU_ActiveFlag' showView={true} />
    }
];
