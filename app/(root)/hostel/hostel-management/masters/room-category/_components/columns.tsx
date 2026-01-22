'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { IRoomCategory } from '@/server/hostel/room-category/server-action';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useCallback } from 'react';

interface RoomCategoryColumnsProps {
    onEdit: (data: IRoomCategory) => void;
    onToggle: (data: IRoomCategory) => void;
}

export const roomCategoryColumns = ({ onEdit, onToggle }: RoomCategoryColumnsProps): ColumnDef<IRoomCategory>[] => [
    {
        id: 'slno',
        header: 'SL NO',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
    },
    {
        accessorKey: 'hlmrcA_RoomCategory',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Room Category" />,
    },
    {
        accessorKey: 'hlmH_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hostel Name" />,
    },
    {
        accessorKey: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fee Group" />,
    },
    {
        accessorKey: 'hlmrcA_MaxCapacity',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Max Capacity" />,
    },
    {
        accessorKey: 'hlmrcA_SORate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Single Bed Rate" />,
    },
    {
        accessorKey: 'hlmrcA_RoomRate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Data Sharing Rate" />,
    },
    {
        accessorKey: 'hlmrcA_ACFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title="AC" />,
        cell: ({ row }) => (row.original.hlmrcA_ACFlg ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-red-600 font-bold">No</span>),
    },
    {
        accessorKey: 'hlmrcA_SharingFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sharing" />,
        cell: ({ row }) => (row.original.hlmrcA_SharingFlg ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-red-600 font-bold">No</span>),
    },
    {
        accessorKey: 'hlmrcA_Description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];
function ActionButtonsCell({ rowData }: { rowData: IRoomCategory }) {
    const { openEditForm, openToggleForm } = useFormContext<IRoomCategory>();

    const handleEdit = useCallback(
        (data: IRoomCategory) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IRoomCategory) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='hlmrcA_ActiveFlag'
        />
    );
}

