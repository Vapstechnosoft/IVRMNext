'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const modeOfPaymentColumns: ColumnDef<IMasterGroupList>[] = [
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
        accessorKey: 'ivrmmoD_Id',
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
        accessorKey: 'ivrmmoD_MasterGroup',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group' />,
        cell: ({ row }) => <div>{row.getValue('ivrmmoD_MasterGroup')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmmoD_MasterGroup_Code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => <div>{row.getValue('ivrmmoD_MasterGroup_Code')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'ivrmmoD_Transport',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Transport' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmoD_Transport') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmmoD_Hostel',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hostel' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmoD_Hostel') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmmoD_Compulsory',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Compulsory' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmoD_Compulsory') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmmoD_Regular',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Regular' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmoD_Regular') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmmoD_NewStudent',
        header: ({ column }) => <DataTableColumnHeader column={column} title='New Student' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmoD_NewStudent') ? 'Yes' : 'No'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterGroupList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterGroupList>();

    const handleEdit = useCallback(
        (data: IMasterGroupList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterGroupList) => {
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
            toggleConditionKey='ivrmmoD_ActiveFlag'
        />
    );
}
