'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { IRoomCategory } from '@/server/hostel/room-category/server-action';

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
        header: 'Action',
        cell: ({ row }) => (
            <ActionButtons
                onEdit={() => onEdit(row.original)}
                onToggle={() => onToggle(row.original)}
                isActive={row.original.hlmrcA_ActiveFlag}
            />
        ),
    },
];
