'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const columns = (onApprove: (data: any) => void): ColumnDef<any>[] => [
    {
        id: 'slNo',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'empName',
        header: 'Staff Name',
    },
    {
        accessorKey: 'HRMD_DepartmentName',
        header: 'Department',
    },
    {
        accessorKey: 'HLMH_Name',
        header: 'Requested Hostel',
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: 'Category',
    },
    {
        accessorKey: 'HLHSTREQ_RequestDate',
        header: 'Req. Date',
        cell: ({ row }) => format(new Date(row.original.HLHSTREQ_RequestDate), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'HLHSTREQ_BookingStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.HLHSTREQ_BookingStatus;
            return (
                <Badge variant={status === 'Waiting' ? 'outline' : status === 'Approved' ? 'secondary' : 'destructive'}>
                    {status}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            row.original.HLHSTREQ_BookingStatus === 'Waiting' && (
                <Button variant="outline" size="sm" onClick={() => onApprove(row.original)}>
                    Process
                </Button>
            )
        )
    }
];
