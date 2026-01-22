'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ActionButtons } from '@/components/ui/form/action-buttons';

export const columns = (onEdit: (data: any) => void, onToggle: (data: any) => void): ColumnDef<any>[] => [
    {
        id: 'slNo',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name',
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class',
    },
    {
        accessorKey: 'HLMH_Name',
        header: 'Hostel',
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: 'Category',
    },
    {
        accessorKey: 'HLHSREQ_RequestDate',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.HLHSREQ_RequestDate), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'HLHSREQ_BookingStatus',
        header: 'Status',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <ActionButtons
                onEdit={() => onEdit(row.original)}
                onToggle={() => onToggle(row.original)}
                isActive={row.original.HLHSREQ_ActiveFlag}
            />
        )
    }
];
