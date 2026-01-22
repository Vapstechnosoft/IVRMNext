'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { ColumnHeader } from '@/components/ui/view-data-table/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export type StaffAllotmentColumn = {
    HLHSTALT_Id: number;
    staffName: string;
    HRMD_DepartmentName: string;
    HRMDES_DesignationName: string;
    HLMH_Name: string;
    HLMRCA_RoomCategory: string;
    HLHSTREQ_RequestDate: string;
    HLHSTREQ_BookingStatus: string;
    HLHSTALT_ActiveFlag: boolean;
};

export const columns = (
    onEdit: (row: StaffAllotmentColumn) => void,
): ColumnDef<StaffAllotmentColumn>[] => [
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
            accessorKey: 'staffName',
            header: ({ column }) => <ColumnHeader column={column} title='Staff Name' />
        },
        {
            accessorKey: 'HRMD_DepartmentName',
            header: ({ column }) => <ColumnHeader column={column} title='Department' />
        },
        {
            accessorKey: 'HRMDES_DesignationName',
            header: ({ column }) => <ColumnHeader column={column} title='Designation' />
        },
        {
            accessorKey: 'HLMH_Name',
            header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
        },
        {
            accessorKey: 'HLMRCA_RoomCategory',
            header: ({ column }) => <ColumnHeader column={column} title='Room Category' />
        },
        {
            accessorKey: 'HLHSTREQ_RequestDate',
            header: ({ column }) => <ColumnHeader column={column} title='Request Date' />,
            cell: ({ row }) => {
                const date = row.getValue('HLHSTREQ_RequestDate') as string;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '';
            }
        },
        {
            accessorKey: 'HLHSTREQ_BookingStatus',
            header: ({ column }) => <ColumnHeader column={column} title='Status' />
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
