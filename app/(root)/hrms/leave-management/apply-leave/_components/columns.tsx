'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
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
    noOfDays?: number;
    days?: number; // For backward compatibility
    status: string;
    remark?: string;
    document?: string;
}
// Apply Leave Form Data
export type ApplyLeave = {
    employeeName: string;
    designation: string;
    doj: string;
    leaveType?: string;
    fromDate?: string;
    toDate?: string;
    numDays?: number;
    reason: string;
    contactNumber?: string;
    dateReportingBack?: string;
    file?: FileList;
};
// Table columns for Leave Balance
export const leaveBalanceColumns: ColumnDef<
    LeaveBalanceRow & { slNo?: number; total?: number; fromDate?: string; toDate?: string; noOfDays?: number }
>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{row.getValue('slNo') || continuousIndex}</div>;
        }
    },
    {
        accessorKey: 'leaveType',
        header: 'Leave Type',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'total',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('total') || '-'}</div>
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
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        }
    },
    {
        accessorKey: 'leaveType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE NAME' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('leaveType')}</div>
    },
    {
        accessorKey: 'reason',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE REASON' />,
        cell: ({ row }) => <div className='max-w-xs'>{row.original.remark || '-'}</div>
    },
    {
        accessorKey: 'fromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='FROM DATE' />,
        cell: ({ row }) => {
            const date = row.getValue('fromDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString('en-GB') : '-'}</div>;
        }
    },
    {
        accessorKey: 'toDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TO DATE' />,
        cell: ({ row }) => {
            const date = row.getValue('toDate') as string;
            return <div>{date ? new Date(date).toLocaleDateString('en-GB') : '-'}</div>;
        }
    },
    {
        accessorKey: 'days',
        header: ({ column }) => <DataTableColumnHeader column={column} title='NO. OF DAYS' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('days')}</div>
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='STATUS' />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const statusColors: Record<string, string> = {
                Applied: 'text-yellow-700',
                Approved: 'text-green-700',
                Rejected: 'text-red-700',
                'Partial Approved': 'text-yellow-700',
                Pending: 'text-blue-700'
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
    },
    {
        accessorKey: 'remark',
        header: ({ column }) => <DataTableColumnHeader column={column} title='REMARK' />,
        cell: ({ row }) => <div className='max-w-xs'>{row.getValue('remark') || '-'}</div>
    },
    {
        accessorKey: 'document',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Document' />,
        cell: ({ row }) => {
            const document = row.getValue('document') as string;
            return document ? (
                <a href={document} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                    View
                </a>
            ) : (
                <div>-</div>
            );
        }
    }
];
