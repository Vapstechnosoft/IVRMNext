'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { ColumnHeader } from '@/components/ui/view-data-table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export type GuestAllotmentColumn = {
    hlhgstalT_Id: number;
    hlhgstalT_GuestName: string;
    hlhgstalT_GuestPhoneNo: string;
    hlhgstalT_GuestEmailId: string;
    hlmH_Name: string;
    hrmrM_RoomNo: string;
    hlmrcA_RoomCategory: string;
    hlhgstalT_NoOfBeds: number;
    hlhgstalT_ActiveFlag: boolean;
};

export const columns = (
    onEdit: (row: GuestAllotmentColumn) => void,
): ColumnDef<GuestAllotmentColumn>[] => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'hlhgstalT_GuestName',
            header: ({ column }) => <ColumnHeader column={column} title='Name' />
        },
        {
            accessorKey: 'hlhgstalT_GuestPhoneNo',
            header: ({ column }) => <ColumnHeader column={column} title='Phone No' />
        },
        {
            accessorKey: 'hlhgstalT_GuestEmailId',
            header: ({ column }) => <ColumnHeader column={column} title='Email' />
        },
        {
            accessorKey: 'hlmH_Name',
            header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
        },
        {
            accessorKey: 'hrmrM_RoomNo',
            header: ({ column }) => <ColumnHeader column={column} title='Room No' />
        },
        {
            accessorKey: 'hlmrcA_RoomCategory',
            header: ({ column }) => <ColumnHeader column={column} title='Category' />
        },
        {
            accessorKey: 'hlhgstalT_NoOfBeds',
            header: ({ column }) => <ColumnHeader column={column} title='Beds' />
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <ActionButtons
                    onEdit={() => onEdit(row.original)}
                />
            )
        }
    ];
