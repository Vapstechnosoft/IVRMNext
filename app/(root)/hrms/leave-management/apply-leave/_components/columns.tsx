'use client';

import type { ColumnDef } from '@tanstack/react-table';

// Leave Balance Row
export interface LeaveBalanceRow {
    leaveType: string;
    balance: number;
}

// Leave History Row
export interface LeaveHistoryRow {
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    status: 'Applied' | 'Approved' | 'Rejected';
}

// Apply Leave Form Data
export type ApplyLeave = {
    employeeName: string;
    designation: string;
    doj: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    numDays: number;
    reason: string;
};

// Table columns for Leave Balance
export const leaveBalanceColumns: ColumnDef<LeaveBalanceRow>[] = [
    {
        accessorKey: 'leaveType',
        header: 'Leave Type',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => <div className='text-center'>{row.getValue('balance')}</div>
    }
];

// Table columns for Leave History
export const leaveHistoryColumns: ColumnDef<LeaveHistoryRow>[] = [
    {
        accessorKey: 'leaveType',
        header: 'Leave Type',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'fromDate',
        header: 'From Date',
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: 'To Date',
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{new Date(date).toLocaleDateString()}</div>;
        }
    },
    {
        accessorKey: 'days',
        header: 'Days',
        cell: ({ row }) => <div className='text-center'>{row.getValue('days')}</div>
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const statusColors = {
                Applied: 'bg-yellow-100 text-yellow-700',
                Approved: 'bg-green-100 text-green-700',
                Rejected: 'bg-red-100 text-red-700'
            };
            return (
                <span
                    className={`inline-flex rounded-full px-2 py-1 font-medium text-xs ${
                        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'
                    }`}>
                    {status}
                </span>
            );
        }
    }
];
