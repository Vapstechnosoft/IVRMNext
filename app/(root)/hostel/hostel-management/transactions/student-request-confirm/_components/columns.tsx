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
        accessorKey: 'studentName',
        header: 'Student Name',
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class',
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
        accessorKey: 'HLHSREQ_RequestDate',
        header: 'Req. Date',
        cell: ({ row }) => format(new Date(row.original.HLHSREQ_RequestDate), 'dd/MM/yyyy'),
    },
    {
        accessorKey: 'HLHSREQ_BookingStatus',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.HLHSREQ_BookingStatus;
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
            row.original.HLHSREQ_BookingStatus === 'Waiting' && (
                <Button variant="outline" size="sm" onClick={() => onApprove(row.original)}>
                    Process
                </Button>
            )
        )
    }
];
